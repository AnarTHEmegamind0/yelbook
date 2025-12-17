'use client';

import { useSession } from 'next-auth/react';
import { useCallback, useMemo, useEffect, useState } from 'react';

const API_BASE_URL =
  typeof window !== 'undefined' && process.env.NODE_ENV === 'production'
    ? '/api'
    : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface SessionUser {
  id?: string;
  githubId?: string;
  email?: string | null;
  role?: string;
}

/**
 * Get auth headers for API calls
 * Supports both JWT token (email/password login) and NextAuth session (GitHub OAuth)
 */
function getAuthHeaders(
  session: { user?: SessionUser } | null,
  jwtToken: string | null
): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // First check for JWT token from email/password login
  if (jwtToken) {
    headers['Authorization'] = `Bearer ${jwtToken}`;
  }
  // Fallback to NextAuth session (GitHub OAuth)
  else if (session?.user) {
    // Use githubId if available, otherwise try to extract from id or sub
    const githubId = session.user.githubId || session.user.id;
    const tokenPayload = {
      githubId: githubId,
      email: session.user.email,
      role: session.user.role,
    };
    headers['x-nextauth-token'] = btoa(JSON.stringify(tokenPayload));
  }

  return headers;
}

/**
 * Hook for authenticated API calls from client components
 * Supports both JWT token and NextAuth session authentication
 */
export function useAuthFetch() {
  const { data: session, status } = useSession();
  const [jwtToken, setJwtToken] = useState<string | null>(null);

  // Load JWT token from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      setJwtToken(token);
    }
  }, []);

  // Debug: Log session data
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('useAuthFetch - session:', session);
      console.log('useAuthFetch - status:', status);
      console.log('useAuthFetch - jwtToken:', jwtToken);
    }
  }, [session, status, jwtToken]);

  const headers = useMemo(
    () => getAuthHeaders(session, jwtToken),
    [session, jwtToken]
  );

  const authFetch = useCallback(
    async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
      const url = endpoint.startsWith('http')
        ? endpoint
        : `${API_BASE_URL}${endpoint}`;

      return fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...(options.headers as Record<string, string>),
        },
      });
    },
    [headers]
  );

  const get = useCallback(
    async <T>(endpoint: string): Promise<T> => {
      const response = await authFetch(endpoint, { method: 'GET' });
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      return response.json();
    },
    [authFetch]
  );

  const post = useCallback(
    async <T>(endpoint: string, data: unknown): Promise<T> => {
      const response = await authFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      return response.json();
    },
    [authFetch]
  );

  const put = useCallback(
    async <T>(endpoint: string, data: unknown): Promise<T> => {
      const response = await authFetch(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      return response.json();
    },
    [authFetch]
  );

  const del = useCallback(
    async <T>(endpoint: string): Promise<T> => {
      const response = await authFetch(endpoint, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      return response.json();
    },
    [authFetch]
  );

  return {
    authFetch,
    get,
    post,
    put,
    del,
    headers,
    isAuthenticated: !!session?.user || !!jwtToken,
    isLoading: status === 'loading',
  };
}
