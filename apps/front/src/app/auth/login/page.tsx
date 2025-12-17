'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      // Client-side: use relative /api in production, localhost in dev
      const baseUrl =
        process.env.NODE_ENV === 'production'
          ? '/api'
          : 'http://localhost:3001';
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Нэвтрэхэд алдаа гарлаа');
      } else {
        const data = await res.json();
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
          router.push('/admin/dashboard');
        } else {
          setError('Токен хүлээн авсангүй');
        }
      }
    } catch {
      setError('Сүлжээний алдаа');
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    if (githubLoading) return;
    setGithubLoading(true);
    setError(null);
    try {
      await signIn('github', { callbackUrl: '/admin/dashboard' });
    } catch {
      setError('GitHub-ээр нэвтрэхэд алдаа гарлаа');
      setGithubLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-accent rounded flex items-center justify-center">
              <span className="text-accent-foreground font-bold text-xl">
                G
              </span>
            </div>
            {/* Брэндийн нэрийг англиар нь үлдээсэн, хүсвэл өөрчилж болно */}
            <span className="font-bold text-2xl text-foreground">
              Green book
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Дахин тавтай морил
          </h1>
          <p className="text-muted-foreground">
            Админ бүртгэлээрээ нэвтэрнэ үү
          </p>
        </div>

        {/* Login Form */}
        <Card className="border border-border">
          <CardContent className="pt-6">
            {/* GitHub OAuth Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full mb-6 flex items-center justify-center gap-2 py-2"
              onClick={handleGitHubSignIn}
              disabled={githubLoading}
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              {githubLoading ? 'Нэвтэрч байна...' : 'GitHub-ээр нэвтрэх'}
            </Button>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">
                  эсвэл
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-foreground"
                >
                  И-мэйл хаяг
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-foreground"
                >
                  Нууц үг
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Нууц үгээ оруулна уу"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border border-border"
                  />
                  <span className="text-muted-foreground">Намайг сана</span>
                </label>
                <Link
                  href="#"
                  className="text-accent hover:text-accent/90 transition-colors"
                >
                  Нууц үгээ мартсан уу?
                </Link>
              </div>

              {/* Submit Button */}
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-medium py-2"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Нэвтэрч байна...' : 'Нэвтрэх'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
