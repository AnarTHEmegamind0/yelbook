'use client';

import { useSession } from 'next-auth/react';
import { useCallback, useMemo } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface SessionUser {
  githubId?: string;
  email?: string | null;
  role?: string;
}

/**
 * Get auth headers for API calls
 */
function getAuthHeaders(
  session: { user?: SessionUser } | null
): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (session?.user) {
    const tokenPayload = {
      githubId: session.user.githubId,
      email: session.user.email,
      role: session.user.role,
    };
    headers['x-nextauth-token'] = btoa(JSON.stringify(tokenPayload));
  }

  return headers;
}

/**
 * Hook for authenticated API calls from client components
 */
export function useAuthFetch() {
  const { data: session, status } = useSession();

  const headers = useMemo(() => getAuthHeaders(session), [session]);

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
    isAuthenticated: !!session?.user,
    isLoading: status === 'loading',
  };
}
