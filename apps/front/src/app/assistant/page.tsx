'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Loader2,
  Building2,
  Phone,
  MapPin,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import Link from 'next/link';

interface Business {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  website: string;
  timetable: string;
  category: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  businesses?: Business[];
}

// Client-side API URL: use relative /api in production, localhost in dev
const API_URL =
  process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001';

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        'Сайн байна уу! Би Ногоон дэвтэр AI туслах. Танд ямар бизнес хайхад тусалж болох вэ?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Build conversation history for the API
      const conversationHistory = [...messages, userMessage]
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await fetch(`${API_URL}/ai/yellow-books/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: conversationHistory }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        businesses: data.businesses,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Уучлаарай, алдаа гарлаа. Дахин оролдоно уу.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSearch = async (query: string) => {
    setInput(query);
    const form = document.getElementById('chat-form') as HTMLFormElement;
    if (form) {
      setInput('');
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: query,
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const response = await fetch(`${API_URL}/ai/yellow-books/search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
        });

        if (!response.ok) {
          throw new Error('Failed to get response');
        }

        const data = await response.json();

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.answer,
          businesses: data.businesses,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        console.error('Search error:', error);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Уучлаарай, алдаа гарлаа. Дахин оролдоно уу.',
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded flex items-center justify-center">
              <span className="text-accent-foreground font-bold text-lg">
                G
              </span>
            </div>
            <span className="font-bold text-xl text-foreground">
              Ногоон дэвтэр
            </span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/search"
              className="text-foreground hover:text-accent transition-colors"
            >
              Хайх
            </Link>
            <Link
              href="/assistant"
              className="flex items-center gap-1.5 text-accent font-medium"
            >
              <Bot className="w-4 h-4" />
              AI Туслах
            </Link>
            <Link href="/auth/login">
              <Button
                variant="default"
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                Нэвтрэх
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Quick Search Suggestions */}
        {messages.length === 1 && (
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-3">
              Жишээ асуултууд:
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                'Ойролцоох ресторан хайж байна',
                'Сантехникч хэрэгтэй байна',
                'Хамгийн сайн кофе шоп',
                'Машины засвар үйлчилгээ',
              ].map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSearch(suggestion)}
                  disabled={isLoading}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="space-y-4 mb-4 min-h-[400px] max-h-[600px] overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary-foreground" />
                </div>
              )}
              <div
                className={`max-w-[80%] ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2'
                    : 'space-y-3'
                }`}
              >
                {message.role === 'assistant' ? (
                  <>
                    <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {message.businesses && message.businesses.length > 0 && (
                      <div className="grid gap-3">
                        {message.businesses.slice(0, 3).map((business) => (
                          <Card key={business.id} className="py-3">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-primary" />
                                {business.name}
                              </CardTitle>
                              <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full w-fit">
                                {business.category}
                              </span>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                              <p className="text-muted-foreground line-clamp-2">
                                {business.description}
                              </p>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="w-3 h-3" />
                                <span className="text-xs">
                                  {business.address}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="w-3 h-3" />
                                <span className="text-xs">
                                  {business.phone}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                <span className="text-xs">
                                  {business.timetable}
                                </span>
                              </div>
                              <div className="flex gap-2 mt-2">
                                <Link href={`/${business.id}`}>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs"
                                  >
                                    Дэлгэрэнгүй
                                  </Button>
                                </Link>
                                {business.website && (
                                  <a
                                    href={business.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 text-xs"
                                    >
                                      <ExternalLink className="w-3 h-3 mr-1" />
                                      Вэбсайт
                                    </Button>
                                  </a>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p>{message.content}</p>
                )}
              </div>
              {message.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <User className="w-5 h-5 text-secondary-foreground" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form id="chat-form" onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Бизнесийн талаар асууна уу..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-4">
          AI-д суурилсан хайлт. Үр дүн нь манай бизнесийн лавлахад бүртгэлтэй
          мэдээлэл дээр үндэслэсэн.
        </p>
      </div>
    </div>
  );
}
