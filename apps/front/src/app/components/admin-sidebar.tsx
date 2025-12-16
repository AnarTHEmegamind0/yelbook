'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Building2, Tags, LogOut } from 'lucide-react';
import { cn } from '@/app/lib/utils';

const menuItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/businesses', icon: Building2, label: 'Businesses' },
  { href: '/admin/categories', icon: Tags, label: 'Categories' },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border min-h-screen flex flex-col p-6">
      {/* Logo */}
      <Link href="/admin/dashboard" className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 bg-sidebar-primary rounded flex items-center justify-center">
          <span className="text-sidebar-primary-foreground font-bold text-lg">
            G
          </span>
        </div>
        <span className="font-bold text-lg text-sidebar-foreground">Admin</span>
      </Link>

      {/* Menu Items */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-primary font-medium'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <Link
        href="/"
        className="mb-4 mt-6 text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <button className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </Link>
    </aside>
  );
}
