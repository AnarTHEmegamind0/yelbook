# Authentication System

This document describes the authentication system implemented for Yelbook, using GitHub OAuth via NextAuth v5.

## Overview

The authentication system provides:

- GitHub OAuth login for users
- Role-based access control (USER / ADMIN)
- Server-side session management with JWT
- Protected admin routes (both frontend and backend)
- CSRF protection (built into NextAuth v5)

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │     │    Backend      │     │    GitHub       │
│   (Next.js)     │     │    (Express)    │     │    OAuth        │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ NextAuth v5     │────▶│ /auth/github    │     │ OAuth App       │
│ GitHub Provider │◀────│ /auth/login     │◀───▶│ Authorization   │
│ JWT Sessions    │     │ /auth/me        │     │                 │
│ Admin Layout    │     │ Admin Middleware│     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Setup Instructions

### 1. Create GitHub OAuth App

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: Yelbook (or your app name)
   - **Homepage URL**: `http://localhost:3000` (or your production URL)
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Click "Register application"
5. Copy the **Client ID**
6. Generate and copy the **Client Secret**

### 2. Get Your GitHub User ID (for Admin Access)

To make yourself an admin, you need your GitHub user ID:

```bash
# Replace YOUR_USERNAME with your GitHub username
curl https://api.github.com/users/YOUR_USERNAME | grep '"id"'
```

Or visit `https://api.github.com/users/YOUR_USERNAME` in your browser.

### 3. Configure Environment Variables

#### Frontend (`apps/front/.env`)

```bash
# NextAuth Configuration
AUTH_SECRET=your-auth-secret-here-generate-with-openssl-rand-base64-32
AUTH_URL=http://localhost:3000

# GitHub OAuth
AUTH_GITHUB_ID=your-github-client-id
AUTH_GITHUB_SECRET=your-github-client-secret

# Admin GitHub ID (your GitHub user ID for admin access)
ADMIN_GITHUB_ID=your-github-user-id
```

#### Backend (`apps/api/.env`)

```bash
# JWT Authentication
JWT_SECRET=your-jwt-secret-here-generate-with-openssl-rand-base64-32

# Admin Configuration
ADMIN_GITHUB_ID=your-github-user-id
```

#### Generate Secrets

```bash
# Generate AUTH_SECRET
openssl rand -base64 32

# Generate JWT_SECRET
openssl rand -base64 32
```

### 4. Run Database Migration

```bash
# Start PostgreSQL
docker-compose up postgres -d

# Run migration
cd apps/api
npx prisma migrate dev --name add_role_and_github

# Seed the database (creates admin user)
npx prisma db seed
```

## File Structure

```
apps/
├── api/
│   ├── prisma/
│   │   └── schema.prisma          # User model with Role enum
│   └── src/
│       ├── middleware/
│       │   └── authMiddleware.ts  # JWT verification & admin guard
│       └── routes/
│           ├── authRoute.ts       # /auth/* endpoints
│           └── adminRoute.ts      # Protected admin routes
└── front/
    └── src/
        ├── auth.ts                # NextAuth configuration
        └── app/
            ├── api/auth/[...nextauth]/
            │   └── route.ts       # NextAuth route handler
            ├── lib/auth/
            │   └── session.ts     # SSR auth helpers
            ├── auth/login/
            │   └── page.tsx       # Login page with GitHub button
            └── admin/
                └── layout.tsx     # Admin layout with auth check
```

## Authentication Flow

### GitHub OAuth Flow

```
1. User clicks "GitHub-ээр нэвтрэх" button
   │
2. Redirected to GitHub authorization page
   │
3. User authorizes the app
   │
4. GitHub redirects to /api/auth/callback/github
   │
5. NextAuth signIn callback triggered
   │
6. Backend /auth/github called to sync user
   │  - Creates new user if not exists
   │  - Updates existing user info
   │  - Sets ADMIN role if githubId matches ADMIN_GITHUB_ID
   │
7. JWT token created with user role
   │
8. User redirected to /admin/dashboard
```

### Admin Page Protection

```
1. User navigates to /admin/*
   │
2. Admin layout.tsx executes (server-side)
   │
3. requireAdminSession() called
   │  - Checks for valid session
   │  - Verifies ADMIN role
   │
4. If not authenticated → redirect to /auth/login
   If not admin → redirect to /
   If admin → render page
```

### API Route Protection

```
1. Request to /admin/* API endpoint
   │
2. requireAdmin middleware executes
   │  - authMiddleware: Verifies JWT token
   │  - adminGuard: Checks ADMIN role
   │
3. If no token → 401 Unauthorized
   If invalid token → 401 Unauthorized
   If not admin → 403 Forbidden
   If admin → proceed to route handler
```

## API Endpoints

### Authentication Routes

| Method | Endpoint       | Description                                 |
| ------ | -------------- | ------------------------------------------- |
| POST   | `/auth/login`  | Traditional email/password login            |
| POST   | `/auth/github` | GitHub OAuth user sync (called by NextAuth) |
| GET    | `/auth/me`     | Get current user info (requires JWT)        |

### Admin Routes (Protected)

All routes under `/admin/*` require admin authentication:

| Method | Endpoint                | Description          |
| ------ | ----------------------- | -------------------- |
| GET    | `/admin/dashboard`      | Dashboard statistics |
| GET    | `/admin/businesses`     | List all businesses  |
| POST   | `/admin/businesses`     | Create business      |
| PUT    | `/admin/businesses/:id` | Update business      |
| DELETE | `/admin/businesses/:id` | Delete business      |
| GET    | `/admin/categories`     | List all categories  |
| POST   | `/admin/categories`     | Create category      |
| PUT    | `/admin/categories/:id` | Update category      |
| DELETE | `/admin/categories/:id` | Delete category      |

## Database Schema

```prisma
enum Role {
  USER
  ADMIN
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  password  String?  // Optional for OAuth users
  role      Role     @default(USER)
  githubId  String?  @unique
  image     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Frontend Usage

### Check Session in Server Components

```tsx
import { auth } from '@/auth';

export default async function Page() {
  const session = await auth();

  if (!session) {
    return <div>Not logged in</div>;
  }

  return <div>Welcome, {session.user.name}!</div>;
}
```

### Protect Admin Pages

```tsx
import { requireAdminSession } from '@/app/lib/auth/session';

export default async function AdminPage() {
  const session = await requireAdminSession();
  // This only renders if user is admin

  return <div>Admin Dashboard</div>;
}
```

### Client-Side Sign In/Out

```tsx
'use client';

import { signIn, signOut } from 'next-auth/react';

function LoginButton() {
  return <button onClick={() => signIn('github')}>Sign in with GitHub</button>;
}

function LogoutButton() {
  return <button onClick={() => signOut()}>Sign out</button>;
}
```

## Security Considerations

1. **CSRF Protection**: Automatically handled by NextAuth v5
2. **JWT Tokens**: Signed with AUTH_SECRET, contains role info
3. **Server-Side Validation**: All admin routes verify session server-side
4. **Role Verification**: Backend independently verifies user role from database
5. **Secure Cookies**: NextAuth uses httpOnly, secure cookies in production

## Production Deployment

### Environment Variables for Production

```bash
# Frontend
AUTH_SECRET=<strong-random-secret>
AUTH_URL=https://your-domain.com
AUTH_GITHUB_ID=<production-github-client-id>
AUTH_GITHUB_SECRET=<production-github-client-secret>
ADMIN_GITHUB_ID=<admin-github-user-id>

# Backend
JWT_SECRET=<strong-random-secret>
ADMIN_GITHUB_ID=<admin-github-user-id>
```

### GitHub OAuth App for Production

Create a separate GitHub OAuth App for production with:

- **Homepage URL**: `https://your-domain.com`
- **Callback URL**: `https://your-domain.com/api/auth/callback/github`

## Troubleshooting

### "Authentication failed" on login

- Check AUTH_GITHUB_ID and AUTH_GITHUB_SECRET are correct
- Verify callback URL matches exactly in GitHub OAuth App settings

### User not getting ADMIN role

- Verify ADMIN_GITHUB_ID matches your GitHub user ID (number, not username)
- Check backend .env has the same ADMIN_GITHUB_ID

### Session not persisting

- Ensure AUTH_SECRET is set and consistent
- Check AUTH_URL matches your actual domain

### API returning 401/403

- Ensure JWT_SECRET is set in backend
- Check Authorization header is being sent with requests
