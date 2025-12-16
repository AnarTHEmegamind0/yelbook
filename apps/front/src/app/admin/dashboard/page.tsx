'use client';

import { useState, useEffect } from 'react';
import { AdminSidebar } from '../../components/admin-sidebar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Building2, FolderOpen, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const [businessCount, setBusinessCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${baseUrl}/admin/dashboard`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setBusinessCount(data.businessCount || 0);
        setCategoryCount(data.categoryCount || 0);
      } catch (err) {
        console.error('Өгөгдөл татахад алдаа:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = [
    {
      label: 'Нийт бизнес',
      value: loading ? '...' : String(businessCount),
      icon: Building2,
      color: 'text-blue-600',
    },
    {
      label: 'Нийт ангилал',
      value: loading ? '...' : String(categoryCount),
      icon: FolderOpen,
      color: 'text-purple-600',
    },
    {
      label: 'Дундаж үнэлгээ',
      value: '4.7',
      icon: TrendingUp,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-8 bg-background">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Хяналтын самбар
          </h1>
          <p className="text-muted-foreground mb-8">
            Админ самбар руу тавтай морил
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className="border border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                      <span>{stat.label}</span>
                      <Icon className={cn('w-5 h-5', stat.color)} />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Recent Activity */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>Сүүлд нэмэгдсэн бизнесүүд</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>Одоогоор үйл ажиллагаа байхгүй байна</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
