# Frontend Баримт бичиг

## Тойм

**Yelbook Frontend** бол Next.js 14+ App Router дээр суурилсан Монгол хэл дээрх бизнес лавлах веб апп юм. Үндсэн функцууд:

- Бизнес хайх, үзэх
- Ангиллаар шүүх
- Google Maps интеграци
- AI туслах (чат)
- Админ панел (CRUD)
- GitHub OAuth аутентикаци

---

## Технологийн стек

| Технологи       | Хувилбар | Зориулалт                    |
| --------------- | -------- | ---------------------------- |
| Next.js         | 15.2.x   | React framework (App Router) |
| React           | 19.x     | UI library                   |
| TypeScript      | 5.9.x    | Type safety                  |
| NextAuth        | v5       | Authentication (Auth.js)     |
| Tailwind CSS    | 4.x      | Styling                      |
| Radix UI        | -        | UI primitives                |
| Zod             | -        | Validation                   |
| Lucide React    | -        | Icons                        |
| Google Maps API | -        | Maps                         |

---

## Төслийн бүтэц

```
apps/front/
├── src/
│   ├── auth.ts                    # NextAuth тохиргоо
│   ├── app/
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Нүүр хуудас
│   │   ├── providers.tsx          # SessionProvider
│   │   ├── globals.css            # Tailwind + theme
│   │   ├── not-found.tsx          # 404 хуудас
│   │   │
│   │   ├── [id]/
│   │   │   └── page.tsx           # Бизнесийн дэлгэрэнгүй
│   │   │
│   │   ├── search/
│   │   │   ├── page.tsx           # Хайлтын хуудас
│   │   │   └── map-island.tsx     # Map client component
│   │   │
│   │   ├── assistant/
│   │   │   └── page.tsx           # AI туслах
│   │   │
│   │   ├── auth/
│   │   │   └── login/
│   │   │       └── page.tsx       # Нэвтрэх хуудас
│   │   │
│   │   ├── admin/
│   │   │   ├── layout.tsx         # Admin layout (хамгаалагдсан)
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx       # Dashboard
│   │   │   ├── businesses/
│   │   │   │   └── page.tsx       # Бизнес CRUD
│   │   │   └── categories/
│   │   │       └── page.tsx       # Ангилал CRUD
│   │   │
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts   # NextAuth handlers
│   │   │   ├── hello/
│   │   │   │   └── route.ts       # Test endpoint
│   │   │   └── revalidate/
│   │   │       └── route.ts       # Cache revalidation
│   │   │
│   │   ├── components/
│   │   │   ├── admin-sidebar.tsx  # Admin navigation
│   │   │   ├── business-card.tsx  # Бизнес карт
│   │   │   ├── category-chips.tsx # Ангилал chips
│   │   │   ├── map.tsx            # Google Maps
│   │   │   ├── rating-stars.tsx   # Одны үнэлгээ
│   │   │   ├── search-bar.tsx     # Хайлтын талбар
│   │   │   └── ui/
│   │   │       ├── badge.tsx
│   │   │       ├── button.tsx
│   │   │       ├── card.tsx
│   │   │       └── input.tsx
│   │   │
│   │   ├── lib/
│   │   │   ├── api.ts             # Server-side auth fetch
│   │   │   ├── utils.ts           # cn() helper
│   │   │   ├── auth/
│   │   │   │   └── session.ts     # Session utilities
│   │   │   ├── hooks/
│   │   │   │   └── useAuthFetch.ts # Client auth hook
│   │   │   ├── data/
│   │   │   │   └── businesses.ts  # Static data layer
│   │   │   └── schemas/
│   │   │       ├── business.ts    # Business schema
│   │   │       ├── home.ts        # Home response schema
│   │   │       └── search.ts      # Search schema
│   │   │
│   │   └── types/
│   │       └── googlemaps-loader.d.ts
│   │
├── public/
│   └── favicon.ico
├── .env.example
├── next.config.js
├── tailwind.config.js
└── package.json
```

---

## Хуудсууд (Pages)

### Нийтийн хуудсууд

| Path          | Файл                  | Rendering | Тайлбар                                       |
| ------------- | --------------------- | --------- | --------------------------------------------- |
| `/`           | `page.tsx`            | ISR (60s) | Нүүр хуудас - Hero, ангилал, онцлох бизнесүүд |
| `/[id]`       | `[id]/page.tsx`       | SSG + ISR | Бизнесийн дэлгэрэнгүй хуудас                  |
| `/search`     | `search/page.tsx`     | SSR       | Хайлт, шүүлт, газрын зураг                    |
| `/assistant`  | `assistant/page.tsx`  | Client    | AI чат туслах                                 |
| `/auth/login` | `auth/login/page.tsx` | Client    | Нэвтрэх хуудас                                |

### Админ хуудсууд (Хамгаалагдсан)

| Path                | Файл                        | Тайлбар             |
| ------------------- | --------------------------- | ------------------- |
| `/admin/dashboard`  | `admin/dashboard/page.tsx`  | Статистик dashboard |
| `/admin/businesses` | `admin/businesses/page.tsx` | Бизнес CRUD         |
| `/admin/categories` | `admin/categories/page.tsx` | Ангилал CRUD        |

---

## Rendering стратеги

### ISR (Incremental Static Regeneration)

**Нүүр хуудас (`/`):**

```typescript
async function getHomeData() {
  const res = await fetch(`${baseUrl}/`, {
    next: { revalidate: 60 }, // 60 секунд тутамд шинэчлэгдэнэ
  });
  return res.json();
}
```

### SSG (Static Site Generation)

**Бизнес дэлгэрэнгүй (`/[id]`):**

```typescript
// Build үед бүх бизнесийн хуудсыг үүсгэнэ
export async function generateStaticParams() {
  const { businesses } = await getSearchData();
  return businesses.map((b) => ({ id: b.id }));
}

// Tag-based revalidation
async function getBusiness(id: string) {
  const res = await fetch(`${baseUrl}/businesses/${id}`, {
    next: { tags: [`business-${id}`] },
  });
  return res.json();
}
```

### SSR (Server-Side Rendering)

**Хайлтын хуудас (`/search`):**

```typescript
export const dynamic = 'force-dynamic'; // Үргэлж server-д render хийнэ
```

### Client-Side

**AI туслах, Админ хуудсууд:**

- `useEffect`, `useState` ашиглана
- `useAuthFetch` hook-оор API дуудна

---

## Компонентууд

### UI Components (`app/components/`)

#### `business-card.tsx` - Бизнес карт

Бизнесийн товч мэдээллийг харуулна.

```tsx
<BusinessCard
  business={{
    id: 'uuid',
    name: 'Модерн Номадс',
    description: 'Монгол орчин үеийн хоол',
    address: 'Сүхбаатар дүүрэг',
    imageUrl: '/image.jpg',
    category: { name: 'Ресторан' },
  }}
/>
```

**Props:**
| Prop | Төрөл | Тайлбар |
|------|-------|---------|
| `business` | Business | Бизнесийн өгөгдөл |

---

#### `category-chips.tsx` - Ангилал chips

Ангиллуудыг сонгох боломжтой chips хэлбэрээр харуулна.

```tsx
<CategoryChips
  categories={[
    { id: '1', name: 'Ресторан' },
    { id: '2', name: 'Кофе шоп' },
  ]}
  selectedCategory="1"
  onSelect={(id) => setCategory(id)}
/>
```

---

#### `map.tsx` - Google Maps

Google Maps API ашиглан газрын зураг харуулна.

```tsx
<Map center={{ lat: 47.9184, lng: 106.9177 }} markers={[{ lat: 47.9184, lng: 106.9177, title: 'Модерн Номадс' }]} />
```

---

#### `rating-stars.tsx` - Одны үнэлгээ

1-5 хүртэл одны үнэлгээ харуулна.

```tsx
<RatingStars rating={4.5} />
```

---

#### `search-bar.tsx` - Хайлтын талбар

Хайлтын input талбар.

```tsx
<SearchBar placeholder="Бизнес хайх..." value={query} onChange={(value) => setQuery(value)} onSearch={() => handleSearch()} />
```

---

#### `admin-sidebar.tsx` - Админ sidebar

Админ хуудсуудын navigation.

```tsx
<AdminSidebar />
// Dashboard, Businesses, Categories холбоосууд
// Logout товч
```

---

### UI Primitives (`app/components/ui/`)

Radix UI болон CVA (class-variance-authority) дээр суурилсан.

#### `button.tsx`

```tsx
<Button variant="default" size="default">
  Товч
</Button>

<Button variant="destructive" size="sm">
  Устгах
</Button>

<Button variant="outline" size="lg">
  Outline
</Button>
```

**Variants:**
| Variant | Тайлбар |
|---------|---------|
| `default` | Primary button |
| `destructive` | Улаан (устгах) |
| `outline` | Border only |
| `secondary` | Secondary color |
| `ghost` | Hover only |
| `link` | Link style |

**Sizes:** `sm`, `default`, `lg`, `icon`

---

#### `card.tsx`

```tsx
<Card>
  <CardHeader>
    <CardTitle>Гарчиг</CardTitle>
    <CardDescription>Тайлбар</CardDescription>
  </CardHeader>
  <CardContent>Агуулга</CardContent>
  <CardFooter>
    <CardAction>Үйлдэл</CardAction>
  </CardFooter>
</Card>
```

---

#### `badge.tsx`

```tsx
<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
```

---

#### `input.tsx`

```tsx
<Input type="text" placeholder="Нэр" value={name} onChange={(e) => setName(e.target.value)} />
```

---

## Аутентикаци

### NextAuth v5 тохиргоо

**`src/auth.ts`:**

```typescript
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Backend-тэй синк хийнэ
      await fetch(`${API_URL}/auth/github`, {
        method: 'POST',
        body: JSON.stringify({
          githubId: profile.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }),
      });
      return true;
    },
    async jwt({ token, user, account, profile }) {
      // Role-г token-д нэмнэ
      if (profile) {
        const backendUser = await fetchUserFromBackend(profile.id);
        token.role = backendUser.role;
        token.githubId = profile.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Session-д role нэмнэ
      session.user.role = token.role;
      session.user.githubId = token.githubId;
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
  },
});
```

### Session Utilities (`lib/auth/session.ts`)

| Функц                       | Тайлбар                                |
| --------------------------- | -------------------------------------- |
| `getSession()`              | Одоогийн session авах                  |
| `requireAdminSession()`     | Admin session шаардах (redirect хийнэ) |
| `requireAuthSession()`      | Auth session шаардах                   |
| `redirectIfAuthenticated()` | Нэвтэрсэн бол redirect                 |
| `isAdmin()`                 | Admin эсэхийг шалгах                   |

### Session төрөл

```typescript
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
```

### Аутентикацийн урсгал

```
┌─────────────────────────────────────────────────────────────┐
│                  GitHub OAuth урсгал                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Хэрэглэгч "GitHub-ээр нэвтрэх" дарна                     │
│       ↓                                                      │
│  2. GitHub OAuth хуудас руу redirect                         │
│       ↓                                                      │
│  3. Хэрэглэгч зөвшөөрөл өгнө                                 │
│       ↓                                                      │
│  4. NextAuth callback:                                       │
│     - Backend /auth/github руу синк хийнэ                    │
│     - Role авна (USER эсвэл ADMIN)                           │
│       ↓                                                      │
│  5. JWT token үүсгэнэ (role, githubId-тай)                   │
│       ↓                                                      │
│  6. Session cookie хадгална                                  │
│       ↓                                                      │
│  7. Хэрэглэгч нэвтэрсэн!                                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Admin Layout хамгаалалт

```typescript
// app/admin/layout.tsx
export default async function AdminLayout({ children }) {
  await requireAdminSession(); // Admin биш бол /auth/login руу redirect
  return (
    <div className="flex">
      <AdminSidebar />
      <main>{children}</main>
    </div>
  );
}
```

---

## Data Fetching

### Server-Side Fetch (`lib/api.ts`)

```typescript
// Base auth fetch
export async function authFetch(endpoint: string, options?: RequestInit) {
  const session = await getSession();

  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-nextauth-token': btoa(
        JSON.stringify({
          githubId: session?.user?.githubId,
          email: session?.user?.email,
          role: session?.user?.role,
        })
      ),
      ...options?.headers,
    },
  });
}

// Helper функцууд
export async function authGet<T>(endpoint: string): Promise<T>;
export async function authPost<T>(endpoint: string, data: any): Promise<T>;
export async function authPut<T>(endpoint: string, data: any): Promise<T>;
export async function authDelete<T>(endpoint: string): Promise<T>;
```

### Client-Side Hook (`lib/hooks/useAuthFetch.ts`)

```typescript
export function useAuthFetch() {
  const { data: session } = useSession();

  const authFetch = useCallback(
    async (endpoint: string, options?: RequestInit) => {
      const headers = {
        'Content-Type': 'application/json',
        'x-nextauth-token': btoa(
          JSON.stringify({
            githubId: session?.user?.githubId,
            email: session?.user?.email,
            role: session?.user?.role,
          })
        ),
      };

      return fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: { ...headers, ...options?.headers },
      });
    },
    [session]
  );

  return {
    authFetch,
    get: (endpoint: string) => authFetch(endpoint),
    post: (endpoint: string, data: any) =>
      authFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    put: (endpoint: string, data: any) =>
      authFetch(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    del: (endpoint: string) => authFetch(endpoint, { method: 'DELETE' }),
  };
}
```

**Хэрэглээ:**

```typescript
function AdminDashboard() {
  const { get } = useAuthFetch();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    get('/admin/dashboard')
      .then((res) => res.json())
      .then((data) => setStats(data));
  }, []);

  return <div>Бизнес: {stats?.businessCount}</div>;
}
```

### On-Demand Revalidation

**`api/revalidate/route.ts`:**

```typescript
// Path revalidation
// POST /api/revalidate?secret=xxx&path=/
revalidatePath(path);

// Tag revalidation
// POST /api/revalidate?secret=xxx&tag=business-123
revalidateTag(tag);
```

**Хэрэглээ:**

```bash
# Нүүр хуудсыг revalidate хийх
curl -X POST "https://yelbook.online/api/revalidate?secret=xxx&path=/"

# Тодорхой бизнесийг revalidate хийх
curl -X POST "https://yelbook.online/api/revalidate?secret=xxx&tag=business-uuid"
```

---

## Zod Schemas

### Business Schema (`lib/schemas/business.ts`)

```typescript
export const BusinessSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  rating: z.number().min(0).max(5),
  reviewCount: z.number(),
  description: z.string(),
  image: z.string().url(),
  address: z.string(),
  phone: z.string(),
  website: z.string().url(),
  coordinates: CoordinatesSchema,
  tags: z.array(z.string()),
  reviews: z.array(ReviewSchema),
});

export const CoordinatesSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

export const ReviewSchema = z.object({
  id: z.string(),
  author: z.string(),
  rating: z.number().min(1).max(5),
  date: z.string(),
  title: z.string(),
  text: z.string(),
});
```

### Search Schema (`lib/schemas/search.ts`)

```typescript
export const SearchParamsSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  page: z.coerce.number().default(1),
  take: z.coerce.number().default(10),
});

export const SearchResponseSchema = z.object({
  items: z.array(BusinessListItemSchema),
  total: z.number(),
  page: z.number(),
  pageCount: z.number(),
  categories: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    })
  ),
});
```

---

## Админ панел

### Dashboard (`/admin/dashboard`)

**Харуулах мэдээлэл:**

- Нийт бизнесийн тоо
- Нийт ангиллын тоо
- Хэрэглэгчдийн жагсаалт

```typescript
interface DashboardStats {
  businessCount: number;
  categoryCount: number;
  users: User[];
}
```

### Бизнес удирдлага (`/admin/businesses`)

**Функцууд:**

- Бүх бизнесийг жагсаах
- Нэрээр хайх
- Шинэ бизнес нэмэх
- Бизнес засах
- Бизнес устгах

**Бизнес форм талбарууд:**
| Талбар | Төрөл | Шаардлагатай |
|--------|-------|--------------|
| `name` | text | Тийм |
| `categoryId` | select | Тийм |
| `description` | textarea | Тийм |
| `address` | text | Тийм |
| `phone` | text | Тийм |
| `email` | email | Тийм |
| `website` | url | Үгүй |
| `googleMapUrl` | url | Үгүй |
| `facebookUrl` | url | Үгүй |
| `instagramUrl` | url | Үгүй |
| `timetable` | text | Үгүй |

### Ангилал удирдлага (`/admin/categories`)

**Функцууд:**

- Бүх ангиллыг жагсаах
- Шинэ ангилал нэмэх
- Ангилал засах
- Ангилал устгах

---

## AI Туслах (`/assistant`)

AI-тай чат хэлбэрээр харилцах хуудас.

### UI

```
┌─────────────────────────────────────────┐
│           Yelbook AI Туслах              │
├─────────────────────────────────────────┤
│                                          │
│  [User]: Сайхан ресторан санал болгоно уу│
│                                          │
│  [AI]: Танд дараах рестораныг санал      │
│        болгоё:                           │
│        1. Модерн Номадс - Монгол орчин   │
│           үеийн хоол...                  │
│                                          │
│  [User]: Тэдний хаяг хаана байдаг вэ?    │
│                                          │
│  [AI]: Модерн Номадс ресторан Сүхбаатар  │
│        дүүрэг, 1-р хороонд байрладаг...  │
│                                          │
├─────────────────────────────────────────┤
│  [Мессеж бичих...              ] [Илгээх]│
└─────────────────────────────────────────┘
```

### Хэрэглээ

```typescript
const [messages, setMessages] = useState<Message[]>([]);

async function sendMessage(content: string) {
  // Хэрэглэгчийн мессеж нэмэх
  const userMessage = { role: 'user', content };
  setMessages((prev) => [...prev, userMessage]);

  // AI руу илгээх
  const response = await fetch('/api/ai/yellow-books/chat', {
    method: 'POST',
    body: JSON.stringify({ messages: [...messages, userMessage] }),
  });

  const data = await response.json();

  // AI хариултыг нэмэх
  setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
}
```

---

## Орчны хувьсагчууд

| Хувьсагч                          | Шаардлага  | Тайлбар                       |
| --------------------------------- | ---------- | ----------------------------- |
| `NEXT_PUBLIC_API_URL`             | Заавал     | Backend API URL               |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Заавал     | Google Maps API key           |
| `AUTH_GITHUB_ID`                  | Заавал     | GitHub OAuth Client ID        |
| `AUTH_GITHUB_SECRET`              | Заавал     | GitHub OAuth Client Secret    |
| `AUTH_SECRET`                     | Заавал     | NextAuth secret               |
| `NEXTAUTH_URL`                    | Заавал     | NextAuth URL (production)     |
| `REVALIDATE_SECRET`               | Заавал биш | On-demand revalidation secret |

### `.env.local` жишээ

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIza..."

AUTH_GITHUB_ID="Ov23li..."
AUTH_GITHUB_SECRET="..."
AUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

REVALIDATE_SECRET="your-revalidate-secret"
```

---

## Хөгжүүлэлт

### Локал суулгах

```bash
# 1. Dependencies суулгах
npm install

# 2. Environment variables тохируулах
cp apps/front/.env.example apps/front/.env.local
# .env.local файлыг засах

# 3. Backend API эхлүүлэх (өөр terminal-д)
npm run dev:api

# 4. Frontend эхлүүлэх
npm run dev:front
```

### Хуудас URL-ууд

| URL                                   | Тайлбар         |
| ------------------------------------- | --------------- |
| http://localhost:3000                 | Нүүр хуудас     |
| http://localhost:3000/search          | Хайлт           |
| http://localhost:3000/assistant       | AI туслах       |
| http://localhost:3000/auth/login      | Нэвтрэх         |
| http://localhost:3000/admin/dashboard | Админ dashboard |

---

## Build & Deploy

### Production build

```bash
# Build
npx nx run front:build

# Start
npx nx run front:start
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci --legacy-peer-deps
RUN npx nx run front:build
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npx", "nx", "run", "front:start"]
```

### CI/CD

`.github/workflows/frontend.yml`:

1. **Install** - Dependencies суулгах
2. **Lint** - ESLint шалгах
3. **Build** - Production build
4. **Docker Build & Push** - ECR руу push
5. **Deploy to EKS** - Kubernetes deployment шинэчлэх

---

## Гүйцэтгэлийн оновчлол

### Rendering стратеги

| Хуудас             | Стратеги   | Шалтгаан                   |
| ------------------ | ---------- | -------------------------- |
| Нүүр               | ISR (60s)  | Өгөгдөл бага өөрчлөгдөнө   |
| Бизнес дэлгэрэнгүй | SSG + Tags | Статик, tag-аар revalidate |
| Хайлт              | SSR        | Query параметрүүд динамик  |
| Admin              | Client     | Auth шаардлагатай          |

### Image оновчлол

```tsx
import Image from 'next/image';

<Image src={business.imageUrl} alt={business.name} width={400} height={300} loading="lazy" placeholder="blur" />;
```

### Code Splitting

Next.js App Router автоматаар route-уудыг split хийнэ.

Dynamic import:

```typescript
const Map = dynamic(() => import('./components/map'), {
  ssr: false, // Client-side only
  loading: () => <MapSkeleton />,
});
```

---

## Холбоос

- **Production**: https://yelbook.online
- **GitHub Repo**: https://github.com/AnarTHEmegamind0/yelbook
- **Backend API**: https://yelbook.online/api
