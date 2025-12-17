# Backend API Баримт бичиг

## Тойм

**Yelbook** бол Монголын бизнес лавлах систем юм. Backend нь Express.js дээр суурилсан REST API бөгөөд дараах үндсэн функцуудыг гүйцэтгэнэ:

- Бизнесүүдийн CRUD үйлдлүүд
- Ангиллын удирдлага
- Хэрэглэгчийн аутентикаци (JWT + GitHub OAuth)
- AI-д суурилсан хайлт ба чат (Groq LLaMA)
- Redis кэширлэлт

---

## Технологийн стек

| Технологи  | Хувилбар | Зориулалт          |
| ---------- | -------- | ------------------ |
| Node.js    | 20.x     | Runtime            |
| Express.js | 4.21.x   | Web framework      |
| TypeScript | 5.9.x    | Type safety        |
| Prisma     | 7.1.x    | ORM                |
| PostgreSQL | 15       | Database           |
| Redis      | 7        | Caching            |
| Groq SDK   | 0.37.x   | AI (LLaMA 3.3-70b) |
| JWT        | 9.x      | Authentication     |
| bcryptjs   | 3.x      | Password hashing   |

---

## Төслийн бүтэц

```
apps/api/
├── prisma/
│   ├── migrations/          # Database migrations
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Seed script
├── scripts/
│   └── embed-businesses.ts  # AI embedding script
├── src/
│   ├── lib/
│   │   ├── prisma.ts        # Prisma client singleton
│   │   └── redis.ts         # Redis client + caching
│   ├── middleware/
│   │   └── authMiddleware.ts # Auth + Admin guards
│   ├── models/
│   │   └── user.ts          # User interface
│   ├── routes/
│   │   ├── adminRoute.ts    # Admin CRUD endpoints
│   │   ├── aiRoute.ts       # AI search + chat
│   │   └── authRoute.ts     # Login, OAuth, me
│   └── main.ts              # Entry point
├── .env.example             # Environment variables
├── Dockerfile               # Production container
├── package.json             # Dependencies
└── tsconfig.json            # TypeScript config
```

---

## Өгөгдлийн сангийн схем

### Enum: Role

```prisma
enum Role {
  USER    // Энгийн хэрэглэгч
  ADMIN   // Админ хэрэглэгч
}
```

### User модель (Хэрэглэгч)

| Талбар      | Төрөл    | Тайлбар                                  |
| ----------- | -------- | ---------------------------------------- |
| `id`        | Int      | Primary key, auto-increment              |
| `email`     | String   | Unique, имэйл хаяг                       |
| `name`      | String?  | Нэр (заавал биш)                         |
| `password`  | String?  | Нууц үг hash (OAuth хэрэглэгчид байхгүй) |
| `role`      | Role     | USER эсвэл ADMIN (default: USER)         |
| `githubId`  | String?  | GitHub ID (unique, OAuth-д ашиглана)     |
| `image`     | String?  | Профайл зургийн URL                      |
| `createdAt` | DateTime | Үүсгэсэн огноо                           |
| `updatedAt` | DateTime | Шинэчилсэн огноо                         |

### Business модель (Бизнес)

| Талбар         | Төрөл    | Тайлбар                           |
| -------------- | -------- | --------------------------------- |
| `id`           | String   | Primary key, UUID                 |
| `name`         | String   | Бизнесийн нэр                     |
| `description`  | String   | Тайлбар                           |
| `address`      | String   | Хаяг                              |
| `phone`        | String   | Утасны дугаар                     |
| `email`        | String   | Имэйл (unique)                    |
| `website`      | String   | Веб хуудас                        |
| `googleMapUrl` | String   | Google Maps холбоос               |
| `facebookUrl`  | String   | Facebook холбоос                  |
| `instagramUrl` | String   | Instagram холбоос                 |
| `imageUrl`     | String?  | Зургийн URL                       |
| `timetable`    | String   | Ажлын цаг                         |
| `categoryId`   | String   | Ангиллын ID (Foreign key)         |
| `embedding`    | Float[]  | AI embedding vector (default: []) |
| `createdAt`    | DateTime | Үүсгэсэн огноо                    |
| `updatedAt`    | DateTime | Шинэчилсэн огноо                  |

### Category модель (Ангилал)

| Талбар      | Төрөл      | Тайлбар              |
| ----------- | ---------- | -------------------- |
| `id`        | String     | Primary key, UUID    |
| `name`      | String     | Ангиллын нэр         |
| `Business`  | Business[] | Холбогдсон бизнесүүд |
| `createdAt` | DateTime   | Үүсгэсэн огноо       |
| `updatedAt` | DateTime   | Шинэчилсэн огноо     |

---

## API Endpoints

### Үндсэн URL

- **Development**: `http://localhost:3001`
- **Production**: `https://yelbook.online/api`

### Нийтийн Endpoints

#### `GET /health` - Health check

Серверийн төлөвийг шалгана.

**Response:**

```json
{
  "status": "ok"
}
```

---

#### `GET /` - Нүүр хуудасны өгөгдөл

Ангиллууд болон эхний 4 бизнесийг буцаана.

**Response:**

```json
{
  "categories": [
    {
      "id": "uuid-1",
      "name": "Ресторан",
      "createdAt": "2025-12-17T00:00:00.000Z",
      "updatedAt": "2025-12-17T00:00:00.000Z"
    }
  ],
  "businesses": [
    {
      "id": "uuid-2",
      "name": "Модерн Номадс",
      "description": "Монгол орчин үеийн хоол",
      "address": "Сүхбаатар дүүрэг, 1-р хороо",
      "phone": "+976 7000 1234",
      "email": "info@modernnomads.mn",
      "website": "https://modernnomads.mn",
      "googleMapUrl": "https://maps.google.com/...",
      "facebookUrl": "https://facebook.com/...",
      "instagramUrl": "https://instagram.com/...",
      "imageUrl": "https://example.com/image.jpg",
      "timetable": "08:00-22:00",
      "categoryId": "uuid-1",
      "category": {
        "id": "uuid-1",
        "name": "Ресторан"
      }
    }
  ]
}
```

---

#### `GET /search` - Хайлтын өгөгдөл

Бүх ангилал болон бүх бизнесийг буцаана.

**Response:**

```json
{
  "categories": [...],
  "businesses": [...]
}
```

---

#### `GET /businesses/:id` - Бизнесийн дэлгэрэнгүй

Нэг бизнесийн бүрэн мэдээллийг буцаана.

**Parameters:**
| Параметр | Төрөл | Тайлбар |
|----------|-------|---------|
| `id` | String | Бизнесийн UUID |

**Response (200):**

```json
{
  "id": "uuid-2",
  "name": "Модерн Номадс",
  "description": "Монгол орчин үеийн хоол",
  "address": "Сүхбаатар дүүрэг, 1-р хороо",
  "phone": "+976 7000 1234",
  "email": "info@modernnomads.mn",
  "website": "https://modernnomads.mn",
  "googleMapUrl": "https://maps.google.com/...",
  "facebookUrl": "https://facebook.com/...",
  "instagramUrl": "https://instagram.com/...",
  "imageUrl": "https://example.com/image.jpg",
  "timetable": "08:00-22:00",
  "categoryId": "uuid-1",
  "category": {
    "id": "uuid-1",
    "name": "Ресторан"
  }
}
```

**Response (404):**

```json
{
  "error": "Business not found"
}
```

---

### Аутентикацийн Endpoints (`/auth`)

#### `POST /auth/login` - Нэвтрэх

Имэйл болон нууц үгээр нэвтрэх.

**Request Body:**

```json
{
  "email": "admin@gmail.com",
  "password": "Admin1234"
}
```

**Response (200):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@gmail.com",
    "name": "Admin",
    "role": "ADMIN"
  }
}
```

**Response (401):**

```json
{
  "error": "Invalid credentials"
}
```

**JWT Token агуулга:**

```json
{
  "userId": 1,
  "email": "admin@gmail.com",
  "name": "Admin",
  "role": "ADMIN",
  "iat": 1702800000,
  "exp": 1702886400 // 1 өдрийн дараа
}
```

---

#### `POST /auth/github` - GitHub OAuth

GitHub OAuth-аар нэвтэрсэн хэрэглэгчийг синк хийнэ.

**Request Body:**

```json
{
  "githubId": "12345678",
  "email": "user@example.com",
  "name": "John Doe",
  "image": "https://avatars.githubusercontent.com/u/12345678"
}
```

**Response (200):**

```json
{
  "id": 2,
  "email": "user@example.com",
  "name": "John Doe",
  "role": "USER",
  "githubId": "12345678",
  "image": "https://avatars.githubusercontent.com/u/12345678"
}
```

**Тэмдэглэл:**

- `ADMIN_GITHUB_ID` env хувьсагчтай тохирвол автоматаар ADMIN болно
- Имэйлгүй бол `github_12345678@placeholder.local` үүсгэнэ

---

#### `GET /auth/me` - Миний мэдээлэл

Нэвтэрсэн хэрэглэгчийн мэдээллийг буцаана.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

эсвэл

```
x-nextauth-token: <base64_encoded_session>
```

**Response (200):**

```json
{
  "id": 1,
  "email": "admin@gmail.com",
  "name": "Admin",
  "role": "ADMIN",
  "githubId": null,
  "image": null
}
```

**Response (401):**

```json
{
  "error": "Not authenticated"
}
```

---

### Админ Endpoints (`/admin`)

> **Бүх `/admin` endpoint-ууд `requireAdmin` middleware шаарддаг**

#### `GET /admin/dashboard` - Dashboard статистик

**Headers:**

```
Authorization: Bearer <admin_jwt_token>
```

**Response:**

```json
{
  "businessCount": 10,
  "categoryCount": 5,
  "users": [
    {
      "id": 1,
      "email": "admin@gmail.com",
      "name": "Admin",
      "role": "ADMIN",
      "githubId": null,
      "image": null,
      "createdAt": "2025-12-17T00:00:00.000Z"
    }
  ]
}
```

---

#### `GET /admin/businesses` - Бүх бизнесүүд

**Response:**

```json
[
  {
    "id": "uuid-1",
    "name": "Модерн Номадс",
    "description": "...",
    "category": {
      "id": "cat-1",
      "name": "Ресторан"
    }
  }
]
```

---

#### `GET /admin/businesses/:id` - Нэг бизнес

**Response:** Бизнесийн бүрэн мэдээлэл (category-тай)

---

#### `POST /admin/businesses` - Бизнес үүсгэх

**Request Body:**

```json
{
  "name": "Шинэ Ресторан",
  "categoryId": "cat-uuid",
  "description": "Тайлбар",
  "address": "Хаяг",
  "phone": "+976 9999 9999",
  "email": "new@restaurant.mn",
  "website": "https://restaurant.mn",
  "googleMapUrl": "https://maps.google.com/...",
  "facebookUrl": "https://facebook.com/...",
  "instagramUrl": "https://instagram.com/...",
  "timetable": "09:00-21:00"
}
```

**Шаардлагатай талбарууд:** `name`, `categoryId`, `description`, `address`, `phone`, `email`

**Response (201):**

```json
{
  "id": "new-uuid",
  "name": "Шинэ Ресторан",
  ...
}
```

**Response (400):**

```json
{
  "error": "Missing required fields: name, categoryId, description, address, phone, email"
}
```

---

#### `PUT /admin/businesses/:id` - Бизнес шинэчлэх

**Request Body:** (зөвхөн шинэчлэх талбаруудыг илгээнэ)

```json
{
  "name": "Шинэчилсэн нэр",
  "phone": "+976 8888 8888"
}
```

**Response:** Шинэчлэгдсэн бизнес

---

#### `DELETE /admin/businesses/:id` - Бизнес устгах

**Response (204):** No content

---

#### `GET /admin/categories` - Бүх ангилал

**Response:**

```json
[
  {
    "id": "cat-1",
    "name": "Ресторан",
    "createdAt": "2025-12-17T00:00:00.000Z",
    "updatedAt": "2025-12-17T00:00:00.000Z"
  }
]
```

---

#### `POST /admin/categories` - Ангилал үүсгэх

**Request Body:**

```json
{
  "name": "Шинэ ангилал"
}
```

**Response (201):**

```json
{
  "id": "new-cat-uuid",
  "name": "Шинэ ангилал",
  "createdAt": "2025-12-17T00:00:00.000Z",
  "updatedAt": "2025-12-17T00:00:00.000Z"
}
```

---

#### `PUT /admin/categories/:id` - Ангилал шинэчлэх

**Request Body:**

```json
{
  "name": "Шинэчилсэн ангилал"
}
```

---

#### `DELETE /admin/categories/:id` - Ангилал устгах

**Response (204):** No content

---

### AI Endpoints (`/ai`)

#### `POST /ai/yellow-books/search` - AI хайлт

AI-д суурилсан бизнес хайлт. Redis-д 1 цагийн турш кэшлэнэ.

**Request Body:**

```json
{
  "query": "Сайхан хоолтой ресторан хаана байдаг вэ?"
}
```

**Response:**

```json
{
  "response": "Танд дараах рестораныг санал болгоё:\n\n1. **Модерн Номадс** - Монгол орчин үеийн хоол...",
  "businesses": [
    {
      "id": "uuid-1",
      "name": "Модерн Номадс",
      "description": "...",
      "category": { "name": "Ресторан" }
    }
  ]
}
```

**AI Хайлтын алгоритм:**

1. Query-г keyword болгон задална
2. Бизнес бүрд оноо тооцоолно:
   - Нэрэнд keyword олдвол: +5 оноо
   - Тайлбарт олдвол: +2 оноо
   - Ангиллын нэрэнд олдвол: +3 оноо
   - Хаягт олдвол: +1 оноо
3. Топ 5 бизнесийг сонгоно
4. Groq LLaMA 3.3-70b ашиглан хариулт үүсгэнэ

---

#### `POST /ai/yellow-books/chat` - AI чат

Өмнөх мессежүүдтэй чат хэлбэрийн харилцаа.

**Request Body:**

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Кофе шоп санал болгоно уу"
    },
    {
      "role": "assistant",
      "content": "Танд дараах кофе шопуудыг санал болгоё..."
    },
    {
      "role": "user",
      "content": "Тэдгээрээс хамгийн ойрхон нь аль вэ?"
    }
  ]
}
```

**Response:**

```json
{
  "response": "Таны байршлаас хамгийн ойрхон нь...",
  "businesses": [...]
}
```

---

## Аутентикаци ба Зөвшөөрөл

### Аутентикацийн 2 арга

#### 1. JWT Bearer Token

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

- `/auth/login` endpoint-оос авна
- 1 өдрийн хугацаатай
- `JWT_SECRET` env хувьсагчаар sign хийнэ

#### 2. NextAuth Session

```
x-nextauth-token: eyJnaXRodWJJZCI6IjEyMzQ1Njc4IiwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwicm9sZSI6IlVTRVIifQ==
```

- Base64 encoded JSON: `{ githubId, email, role }`
- Frontend NextAuth-аас автоматаар илгээнэ

### Middleware-ууд

| Middleware       | Зориулалт                                          |
| ---------------- | -------------------------------------------------- |
| `authMiddleware` | JWT эсвэл NextAuth session шалгана                 |
| `adminGuard`     | `role === 'ADMIN'` шалгана                         |
| `requireAdmin`   | `[authMiddleware, adminGuard]` хоёуланг нь шалгана |

### Аутентикацийн урсгал

```
┌─────────────────────────────────────────────────────────────┐
│                    Аутентикацийн урсгал                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Арга 1: Имэйл/Нууц үг                                       │
│  POST /auth/login (email, password)                          │
│       ↓                                                      │
│  Credentials шалгах → JWT үүсгэх → Token буцаах              │
│       ↓                                                      │
│  Client илгээнэ: Authorization: Bearer <token>               │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Арга 2: GitHub OAuth (Frontend NextAuth-аар)                │
│  POST /auth/github (githubId, email, name, image)            │
│       ↓                                                      │
│  Хэрэглэгч үүсгэх/шинэчлэх → User info буцаах                │
│       ↓                                                      │
│  Client илгээнэ: x-nextauth-token: <base64 session>          │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Хамгаалагдсан route-ууд:                                    │
│  authMiddleware → JWT эсвэл NextAuth session шалгана         │
│  adminGuard → role === 'ADMIN' шалгана                       │
│  requireAdmin → Хоёуланг нь шалгана                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Redis Кэширлэлт

### Функцууд

| Функц                                | Тайлбар                                 |
| ------------------------------------ | --------------------------------------- |
| `getRedis()`                         | Redis client singleton буцаана          |
| `getCachedResponse(key)`             | Кэшээс уншина                           |
| `setCachedResponse(key, value, ttl)` | Кэшд бичнэ (default: 1 цаг)             |
| `createCacheKey(query)`              | Query-г base64 болгон cache key үүсгэнэ |

### AI хайлтын кэширлэлт

```typescript
// 1. Cache key үүсгэх
const cacheKey = createCacheKey(query); // "ai:search:base64..."

// 2. Cache шалгах
const cached = await getCachedResponse(cacheKey);
if (cached) return cached;

// 3. AI хариулт үүсгэх
const response = await generateAIResponse(query);

// 4. Cache-д хадгалах (1 цаг)
await setCachedResponse(cacheKey, response, 3600);
```

---

## Орчны хувьсагчууд

| Хувьсагч          | Шаардлага  | Default                  | Тайлбар                      |
| ----------------- | ---------- | ------------------------ | ---------------------------- |
| `DATABASE_URL`    | Заавал     | -                        | PostgreSQL connection string |
| `REDIS_URL`       | Заавал биш | `redis://localhost:6379` | Redis connection string      |
| `JWT_SECRET`      | Заавал     | `dev-secret` (warning)   | JWT signing secret           |
| `GROQ_API_KEY`    | Заавал     | -                        | Groq API key (AI функцэд)    |
| `GEMINI_API_KEY`  | Заавал биш | -                        | Google Gemini (embedding-д)  |
| `ADMIN_GITHUB_ID` | Заавал биш | -                        | Auto-admin GitHub ID         |
| `CORS_ORIGIN`     | Заавал биш | `http://localhost:3000`  | Frontend URL                 |
| `HOST`            | Заавал биш | `localhost`              | Server host                  |
| `PORT`            | Заавал биш | `3001`                   | Server port                  |

### `.env` жишээ

```env
DATABASE_URL="postgresql://user:password@localhost:5432/yelbook"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-key-here"
GROQ_API_KEY="gsk_xxxxxxxxxxxxx"
ADMIN_GITHUB_ID="12345678"
CORS_ORIGIN="http://localhost:3000"
HOST="0.0.0.0"
PORT="3001"
```

---

## Хөгжүүлэлт

### Локал суулгах

```bash
# 1. Dependencies суулгах
npm install

# 2. PostgreSQL, Redis эхлүүлэх
docker-compose up -d postgres redis

# 3. Prisma client үүсгэх
cd apps/api
npx prisma generate

# 4. Database migration
npx prisma migrate dev

# 5. Seed data оруулах
npx prisma db seed

# 6. API эхлүүлэх
cd ../..
npm run dev:api
```

### Seed өгөгдөл

`prisma/seed.ts` нь дараахыг үүсгэнэ:

**Admin хэрэглэгч:**

- Email: `admin@gmail.com`
- Password: `Admin1234`
- Role: `ADMIN`

**5 Ангилал:**

- Ресторан
- Бар
- Кофе шоп
- Зочид буудал
- Дэлгүүр

**10 Бизнес:** Монголын бизнесүүдийн жишээ өгөгдөл

---

## CI/CD

### GitHub Actions Workflow

`.github/workflows/backend.yml` дараах алхамуудыг гүйцэтгэнэ:

1. **Install** - `npm ci --legacy-peer-deps`
2. **Generate Prisma Client** - `npx prisma generate --schema=prisma/schema.prisma`
3. **Lint** - `npx nx run api:lint`
4. **Typecheck** - `npx nx run api:typecheck`
5. **Build** - `npx nx run api:build:production`
6. **Docker Build & Push** - ECR руу push
7. **Deploy to EKS** - Kubernetes deployment шинэчлэх
8. **Run Migration** - `prisma migrate deploy`
9. **Health Check** - API endpoint шалгах

### Deployment архитектур

```
GitHub Push → GitHub Actions → ECR → EKS (Kubernetes)
                                        ↓
                              ┌─────────────────┐
                              │   ALB Ingress   │
                              │ yelbook.online  │
                              └────────┬────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
                    ▼                  ▼                  ▼
              ┌──────────┐      ┌──────────┐      ┌──────────┐
              │   API    │      │ Postgres │      │  Redis   │
              │  :3001   │─────▶│  :5432   │      │  :6379   │
              └──────────┘      └──────────┘      └──────────┘
```

---

## Алдааны кодууд

| HTTP Code | Тайлбар                         |
| --------- | ------------------------------- |
| 200       | Амжилттай                       |
| 201       | Үүсгэгдсэн                      |
| 204       | Агуулга байхгүй (устгасан)      |
| 400       | Буруу хүсэлт (validation алдаа) |
| 401       | Аутентикаци шаардлагатай        |
| 403       | Зөвшөөрөлгүй (Admin биш)        |
| 404       | Олдсонгүй                       |
| 500       | Серверийн алдаа                 |

---

## Холбоос

- **Production API**: https://yelbook.online/api
- **Health Check**: https://yelbook.online/api/health
- **GitHub Repo**: https://github.com/AnarTHEmegamind0/yelbook
