import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

const prisma = new PrismaClient();

if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY environment variable is not set');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const EMBEDDING_MODEL = 'text-embedding-004';
const BATCH_SIZE = 10;

function createBusinessText(business: {
  name: string;
  description: string;
  address: string;
  category: { name: string };
  timetable: string;
}): string {
  return `Business: ${business.name}
Category: ${business.category.name}
Description: ${business.description}
Address: ${business.address}
Hours: ${business.timetable}`;
}

async function getEmbedding(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

async function embedAllBusinesses() {
  console.log('Starting business embedding process with Gemini...');

  const businesses = await prisma.business.findMany({
    include: { category: true },
  });

  console.log(`Found ${businesses.length} businesses to embed`);

  let processed = 0;
  let errors = 0;

  for (let i = 0; i < businesses.length; i += BATCH_SIZE) {
    const batch = businesses.slice(i, i + BATCH_SIZE);

    for (const business of batch) {
      try {
        const text = createBusinessText(business);
        const embedding = await getEmbedding(text);

        await prisma.business.update({
          where: { id: business.id },
          data: { embedding },
        });

        processed++;
        console.log(
          `[${processed}/${businesses.length}] Embedded: ${business.name}`
        );

        // Rate limiting - Gemini free tier has limits
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        errors++;
        console.error(`Failed to embed ${business.name}:`, error);
      }
    }

    // Additional delay between batches
    if (i + BATCH_SIZE < businesses.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.log(`\nEmbedding complete!`);
  console.log(`Processed: ${processed}`);
  console.log(`Errors: ${errors}`);
}

embedAllBusinesses()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
