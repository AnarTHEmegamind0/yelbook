import { Router } from 'express';
import Groq from 'groq-sdk';
import prisma from '../lib/prisma';
import {
  getCachedResponse,
  setCachedResponse,
  createCacheKey,
} from '../lib/redis';

const router = Router();

// Lazy initialization of Groq client
let groq: Groq | null = null;

function getGroqClient(): Groq {
  if (!groq) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY environment variable is not set');
    }
    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return groq;
}

const CHAT_MODEL = 'llama-3.3-70b-versatile';
const CACHE_TTL_SECONDS = 3600; // 1 hour

interface Business {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  timetable: string;
  category: { name: string };
  embedding: number[];
}

function buildSystemPrompt(): string {
  return `You are YelBook AI Assistant, a helpful assistant for a yellow pages business directory. 
Your role is to help users find businesses and answer questions about local services.

When recommending businesses:
- Be concise and helpful
- Highlight key details like location, hours, and services
- If multiple businesses match, briefly compare them
- If no businesses match well, suggest alternatives or ask for clarification
- Respond in the same language as the user's query (Mongolian or English)

Format your responses in a friendly, conversational tone.`;
}

function buildUserPrompt(query: string, businesses: Business[]): string {
  const businessContext = businesses
    .map(
      (b, i) => `
${i + 1}. **${b.name}** (${b.category.name})
   - Description: ${b.description}
   - Address: ${b.address}
   - Phone: ${b.phone}
   - Hours: ${b.timetable}
   - Website: ${b.website}`
    )
    .join('\n');

  return `User query: "${query}"

Here are the most relevant businesses from our directory:
${businessContext}

Please help the user with their query based on these business listings. If the listings don't match well, let them know and suggest what they might search for instead.`;
}

async function generateChatResponse(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const completion = await getGroqClient().chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });
  return (
    completion.choices[0]?.message?.content ||
    'Sorry, I could not generate a response.'
  );
}

// Simple keyword-based search (no embeddings needed for now)
async function findRelevantBusinesses(
  query: string,
  topK = 5
): Promise<Business[]> {
  const businesses = await prisma.business.findMany({
    include: { category: true },
  });

  const queryLower = query.toLowerCase();
  const keywords = queryLower.split(/\s+/);

  const scored = businesses.map((business) => {
    const searchText =
      `${business.name} ${business.description} ${business.category.name} ${business.address}`.toLowerCase();
    let score = 0;

    for (const keyword of keywords) {
      if (searchText.includes(keyword)) {
        score += 1;
      }
    }

    // Boost exact name matches
    if (business.name.toLowerCase().includes(queryLower)) {
      score += 5;
    }

    // Boost category matches
    if (business.category.name.toLowerCase().includes(queryLower)) {
      score += 3;
    }

    return { business, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((s) => s.business as unknown as Business);
}

router.post('/yellow-books/search', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Check cache first
    const cacheKey = createCacheKey(query);
    const cachedResponse = await getCachedResponse(cacheKey);

    if (cachedResponse) {
      console.log(`Cache hit for query: ${query}`);
      return res.json(JSON.parse(cachedResponse));
    }

    console.log(`Cache miss for query: ${query}`);

    // Find relevant businesses using keyword search
    let relevantBusinesses = await findRelevantBusinesses(query, 5);

    // If no matches, get some random businesses as fallback
    if (relevantBusinesses.length === 0) {
      const allBusinesses = await prisma.business.findMany({
        include: { category: true },
        take: 5,
      });
      relevantBusinesses = allBusinesses as unknown as Business[];
    }

    // Generate Groq response
    const aiResponse = await generateChatResponse(
      buildSystemPrompt(),
      buildUserPrompt(query, relevantBusinesses)
    );

    const response = {
      query,
      answer: aiResponse,
      businesses: relevantBusinesses.map((b) => ({
        id: b.id,
        name: b.name,
        description: b.description,
        address: b.address,
        phone: b.phone,
        website: b.website,
        timetable: b.timetable,
        category: b.category.name,
      })),
    };

    // Cache the response
    await setCachedResponse(
      cacheKey,
      JSON.stringify(response),
      CACHE_TTL_SECONDS
    );

    return res.json(response);
  } catch (error) {
    console.error('AI search error:', error);
    return res.status(500).json({ error: 'Failed to process search request' });
  }
});

// Chat endpoint for conversation history
router.post('/yellow-books/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const lastUserMessage = [...messages]
      .reverse()
      .find((m) => m.role === 'user');
    if (!lastUserMessage) {
      return res.status(400).json({ error: 'No user message found' });
    }

    // Find relevant businesses
    let relevantBusinesses = await findRelevantBusinesses(
      lastUserMessage.content,
      5
    );

    if (relevantBusinesses.length === 0) {
      const allBusinesses = await prisma.business.findMany({
        include: { category: true },
        take: 5,
      });
      relevantBusinesses = allBusinesses as unknown as Business[];
    }

    // Build conversation context
    const businessContext = relevantBusinesses
      .map(
        (b) =>
          `- ${b.name} (${b.category.name}): ${b.description}. Address: ${b.address}. Phone: ${b.phone}. Hours: ${b.timetable}`
      )
      .join('\n');

    const systemPrompt = `${buildSystemPrompt()}

Relevant businesses from our directory:
${businessContext}`;

    // Use Groq chat completions with conversation history
    const completion = await getGroqClient().chat.completions.create({
      model: CHAT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const aiResponse =
      completion.choices[0]?.message?.content ||
      'Sorry, I could not generate a response.';

    return res.json({
      message: aiResponse,
      businesses: relevantBusinesses.map((b) => ({
        id: b.id,
        name: b.name,
        description: b.description,
        address: b.address,
        phone: b.phone,
        website: b.website,
        timetable: b.timetable,
        category: b.category.name,
      })),
    });
  } catch (error) {
    console.error('AI chat error:', error);
    return res.status(500).json({ error: 'Failed to process chat request' });
  }
});

export default router;
