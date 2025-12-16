'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
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

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="flex-1 h-px bg-border"></div>
              <div className="flex-1 h-px bg-border"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
