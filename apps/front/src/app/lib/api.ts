import { getSession } from './auth/session';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Authenticated fetch helper for API calls
 * Automatically includes session token in headers for protected routes
 */
export async function authFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const session = await getSession();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Merge existing headers
  if (options.headers) {
    const existingHeaders = options.headers as Record<string, string>;
    Object.assign(headers, existingHeaders);
  }

  // Add session token if user is authenticated
  if (session?.user) {
    const tokenPayload = {
      githubId: session.user.githubId,
      email: session.user.email,
      role: session.user.role,
    };
    headers['x-nextauth-token'] = Buffer.from(
      JSON.stringify(tokenPayload)
    ).toString('base64');
  }

  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * GET request with authentication
 */
export async function authGet<T>(endpoint: string): Promise<T> {
  const response = await authFetch(endpoint, { method: 'GET' });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

/**
 * POST request with authentication
 */
export async function authPost<T>(endpoint: string, data: unknown): Promise<T> {
  const response = await authFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

/**
 * PUT request with authentication
 */
export async function authPut<T>(endpoint: string, data: unknown): Promise<T> {
  const response = await authFetch(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

/**
 * DELETE request with authentication
 */
export async function authDelete<T>(endpoint: string): Promise<T> {
  const response = await authFetch(endpoint, { method: 'DELETE' });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}
