import { requireAdminSession } from '../lib/auth/session';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This will redirect to login if not authenticated,
  // or to home if authenticated but not admin
  await requireAdminSession();

  return <>{children}</>;
}
