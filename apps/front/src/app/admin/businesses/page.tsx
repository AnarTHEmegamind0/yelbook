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

interface Business {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  googleMapUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  imageUrl: string;
  timetable: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
}

export default function BusinessesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [businessRes, categoryRes] = await Promise.all([
        fetch(`${baseUrl}/admin/businesses`),
        fetch(`${baseUrl}/admin/categories`),
      ]);
      if (!businessRes.ok || !categoryRes.ok) {
        throw new Error('Failed to fetch data');
      }
      const businessData = await businessRes.json();
      const categoryData = await categoryRes.json();
      setBusinesses(businessData.businesses || []);
      setCategories(categoryData.categories || []);
    } catch (err) {
      console.error('Өгөгдөл татахад алдаа:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Энэ бизнесийг устгах уу?')) return;
    try {
      const res = await fetch(`${baseUrl}/admin/businesses/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchData();
      } else {
        alert('Устгахад алдаа гарлаа');
      }
    } catch (err) {
      console.error(err);
      alert('Сүлжээний алдаа');
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  const filteredBusinesses = businesses.filter((b) =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-8 bg-background">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Бизнесүүд
            </h1>
            <p className="text-muted-foreground">
              Платформ дахь бүх бизнесийг удирдах
            </p>
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
          >
            <Plus className="w-4 h-4" />
            Бизнес нэмэх
          </Button>
        </div>

        {/* Add Business Form */}
        {showAddForm && (
          <BusinessForm
            categories={categories}
            onClose={() => setShowAddForm(false)}
            onSuccess={fetchData}
          />
        )}

        {/* Edit Business Form */}
        {editingBusiness && (
          <EditBusinessForm
            business={editingBusiness}
            categories={categories}
            onClose={() => setEditingBusiness(null)}
            onSuccess={() => {
              fetchData();
              setEditingBusiness(null);
            }}
          />
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Бизнес хайх..."
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
              <CardTitle>Бүх бизнесүүд</CardTitle>
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
                        Ангилал
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">
                        Утас
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">
                        Үйлдлүүд
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBusinesses.map((business) => (
                      <tr
                        key={business.id}
                        className="border-b border-border hover:bg-muted/50 transition-colors"
                      >
                        <td className="py-4 px-4 text-foreground font-medium">
                          {business.name}
                        </td>
                        <td className="py-4 px-4 text-muted-foreground">
                          {getCategoryName(business.categoryId)}
                        </td>
                        <td className="py-4 px-4 text-muted-foreground">
                          {business.phone}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditingBusiness(business)}
                              className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(business.id)}
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

function BusinessForm({
  categories,
  onClose,
  onSuccess,
}: {
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    googleMapUrl: '',
    facebookUrl: '',
    instagramUrl: '',
    timetable: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${baseUrl}/admin/businesses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        alert('Бизнес нэмэхэд алдаа гарлаа');
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
        <CardTitle>Шинэ бизнес нэмэх</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Бизнесийн нэр
              </label>
              <Input
                type="text"
                placeholder="Нэр оруулах"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Ангилал
              </label>
              <select
                className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground"
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                required
              >
                <option value="">Ангилал сонгох</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Тайлбар
            </label>
            <textarea
              placeholder="Бизнесийн тайлбар"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground resize-none"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Хаяг
            </label>
            <Input
              type="text"
              placeholder="Хаяг"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Утас
              </label>
              <Input
                type="tel"
                placeholder="+976-xxxx-xxxx"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                И-мэйл
              </label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Вэбсайт
              </label>
              <Input
                type="url"
                placeholder="https://example.com"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Цагийн хуваарь
              </label>
              <Input
                type="text"
                placeholder="Даваа-Ням 09:00-21:00"
                value={formData.timetable}
                onChange={(e) =>
                  setFormData({ ...formData, timetable: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Google Map URL
              </label>
              <Input
                type="url"
                placeholder="https://maps.google.com/..."
                value={formData.googleMapUrl}
                onChange={(e) =>
                  setFormData({ ...formData, googleMapUrl: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Facebook URL
              </label>
              <Input
                type="url"
                placeholder="https://facebook.com/..."
                value={formData.facebookUrl}
                onChange={(e) =>
                  setFormData({ ...formData, facebookUrl: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Instagram URL
              </label>
              <Input
                type="url"
                placeholder="https://instagram.com/..."
                value={formData.instagramUrl}
                onChange={(e) =>
                  setFormData({ ...formData, instagramUrl: e.target.value })
                }
                required
              />
            </div>
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

function EditBusinessForm({
  business,
  categories,
  onClose,
  onSuccess,
}: {
  business: Business;
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: business.name,
    categoryId: business.categoryId,
    description: business.description,
    address: business.address,
    phone: business.phone,
    email: business.email,
    website: business.website,
    googleMapUrl: business.googleMapUrl,
    facebookUrl: business.facebookUrl,
    instagramUrl: business.instagramUrl,
    timetable: business.timetable,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${baseUrl}/admin/businesses/${business.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        onSuccess();
      } else {
        alert('Бизнес засахад алдаа гарлаа');
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
        <CardTitle>Бизнес засах</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Бизнесийн нэр
              </label>
              <Input
                type="text"
                placeholder="Нэр оруулах"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Ангилал
              </label>
              <select
                className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground"
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                required
              >
                <option value="">Ангилал сонгох</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Тайлбар
            </label>
            <textarea
              placeholder="Бизнесийн тайлбар"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground resize-none"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Хаяг
            </label>
            <Input
              type="text"
              placeholder="Хаяг"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Утас
              </label>
              <Input
                type="tel"
                placeholder="+976-xxxx-xxxx"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                И-мэйл
              </label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Вэбсайт
              </label>
              <Input
                type="url"
                placeholder="https://example.com"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Цагийн хуваарь
              </label>
              <Input
                type="text"
                placeholder="Даваа-Ням 09:00-21:00"
                value={formData.timetable}
                onChange={(e) =>
                  setFormData({ ...formData, timetable: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Google Map URL
              </label>
              <Input
                type="url"
                placeholder="https://maps.google.com/..."
                value={formData.googleMapUrl}
                onChange={(e) =>
                  setFormData({ ...formData, googleMapUrl: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Facebook URL
              </label>
              <Input
                type="url"
                placeholder="https://facebook.com/..."
                value={formData.facebookUrl}
                onChange={(e) =>
                  setFormData({ ...formData, facebookUrl: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Instagram URL
              </label>
              <Input
                type="url"
                placeholder="https://instagram.com/..."
                value={formData.instagramUrl}
                onChange={(e) =>
                  setFormData({ ...formData, instagramUrl: e.target.value })
                }
                required
              />
            </div>
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
