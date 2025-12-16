'use client';

import { useState, useEffect } from 'react';
import { AdminSidebar } from '../../components/admin-sidebar';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Edit2, Trash2, Plus } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${baseUrl}/admin/categories`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error('Ангилал татахад алдаа:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Энэ ангиллыг устгах уу?')) return;
    try {
      const res = await fetch(`${baseUrl}/admin/categories/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchCategories();
      } else {
        alert('Устгахад алдаа гарлаа');
      }
    } catch (err) {
      console.error(err);
      alert('Сүлжээний алдаа');
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-8 bg-background">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Ангиллууд
            </h1>
            <p className="text-muted-foreground">
              Бизнесийн ангиллуудыг удирдах
            </p>
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
          >
            <Plus className="w-4 h-4" />
            Ангилал нэмэх
          </Button>
        </div>

        {/* Add Category Form */}
        {showAddForm && (
          <CategoryForm
            onClose={() => setShowAddForm(false)}
            onSuccess={fetchCategories}
          />
        )}

        {/* Edit Category Form */}
        {editingCategory && (
          <EditCategoryForm
            category={editingCategory}
            onClose={() => setEditingCategory(null)}
            onSuccess={() => {
              setEditingCategory(null);
              fetchCategories();
            }}
          />
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Ангилал хайх..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-sm"
          />
        </div>

        {loading ? (
          <p className="text-muted-foreground">Ачааллаж байна...</p>
        ) : (
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>Бүх ангиллууд</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">
                        Нэр
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">
                        Үйлдлүүд
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCategories.map((category) => (
                      <tr
                        key={category.id}
                        className="border-b border-border hover:bg-muted/50 transition-colors"
                      >
                        <td className="py-4 px-4 text-foreground font-medium">
                          {category.name}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditingCategory(category)}
                              className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(category.id)}
                              className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

function CategoryForm({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || !name.trim()) return;
    setSubmitting(true);
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${baseUrl}/admin/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        alert('Ангилал нэмэхэд алдаа гарлаа');
      }
    } catch (err) {
      console.error(err);
      alert('Сүлжээний алдаа');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="mb-6 border border-border bg-muted/30">
      <CardHeader>
        <CardTitle>Шинэ ангилал нэмэх</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Ангиллын нэр
            </label>
            <Input
              type="text"
              placeholder="Нэр оруулах"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={submitting}
            >
              {submitting ? 'Нэмж байна...' : 'Нэмэх'}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="border border-border"
            >
              Цуцлах
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function EditCategoryForm({
  category,
  onClose,
  onSuccess,
}: {
  category: Category;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(category.name);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || !name.trim()) return;
    setSubmitting(true);
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${baseUrl}/admin/categories/${category.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (res.ok) {
        onSuccess();
      } else {
        alert('Засахад алдаа гарлаа');
      }
    } catch (err) {
      console.error(err);
      alert('Сүлжээний алдаа');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="mb-6 border border-border bg-muted/30">
      <CardHeader>
        <CardTitle>Ангилал засах</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Ангиллын нэр
            </label>
            <Input
              type="text"
              placeholder="Нэр оруулах"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={submitting}
            >
              {submitting ? 'Засаж байна...' : 'Хадгалах'}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="border border-border"
            >
              Цуцлах
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
