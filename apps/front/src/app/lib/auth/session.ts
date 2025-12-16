import { redirect } from 'next/navigation';
import { auth } from '@/auth';

/**
 * Server-side function to check if the current user is authenticated
 * Returns the session if authenticated, null otherwise
 */
export async function getSession() {
  const session = await auth();
  return session;
}

/**
 * Server-side function to check if the current user is an admin
 * Redirects to login if not authenticated
 * Redirects to home if authenticated but not admin
 */
export async function requireAdminSession() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/login');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/');
  }

  return session;
}

/**
 * Server-side function to check if the current user is authenticated
 * Redirects to login if not authenticated
 */
export async function requireAuthSession() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/login');
  }

  return session;
}

/**
 * Server-side function to check if user is already logged in
 * Redirects to dashboard if already authenticated (useful for login page)
 */
export async function redirectIfAuthenticated(redirectTo = '/admin/dashboard') {
  const session = await auth();

  if (session?.user) {
    redirect(redirectTo);
  }

  return null;
}

/**
 * Check if user has admin role
 */
export function isAdmin(
  session: { user?: { role?: string } } | null | undefined
) {
  return session?.user?.role === 'ADMIN';
}
