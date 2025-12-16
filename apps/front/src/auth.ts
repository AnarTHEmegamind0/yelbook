import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: 'USER' | 'ADMIN';
      githubId: string;
    };
  }

  interface User {
    role?: 'USER' | 'ADMIN';
    githubId?: string;
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    role?: 'USER' | 'ADMIN';
    githubId?: string;
  }
}

const result = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, profile }) {
      if (profile) {
        const githubId = String(profile.id);
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

        try {
          // Call the backend to create or update user
          const response = await fetch(`${apiUrl}/auth/github`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              githubId,
              email: user.email,
              name: user.name,
              image: user.image,
            }),
          });

          if (!response.ok) {
            console.error('Failed to sync user with backend');
            return false;
          }

          const data = await response.json();
          // Attach role and githubId to user object for JWT callback
          user.role = data.user?.role || 'USER';
          user.githubId = githubId;
        } catch (error) {
          console.error('Error syncing user:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, profile }) {
      // On initial sign in, add role and githubId to token
      if (user) {
        token.role = user.role || 'USER';
        token.githubId =
          user.githubId || (profile?.id ? String(profile.id) : undefined);
      }
      return token;
    },
    async session({ session, token }) {
      // Add role and githubId to session
      if (session.user) {
        session.user.role = (token.role as 'USER' | 'ADMIN') || 'USER';
        session.user.githubId = token.githubId as string;
        session.user.id = token.sub || '';
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  session: {
    strategy: 'jwt',
  },
  // CSRF protection is enabled by default in NextAuth v5
  trustHost: true,
});

// Export handlers for API routes
export const handlers = result.handlers;

// Export auth function for getting session
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const auth: any = result.auth;

// Export signIn and signOut for client-side usage
export const signIn = result.signIn;
export const signOut = result.signOut;
