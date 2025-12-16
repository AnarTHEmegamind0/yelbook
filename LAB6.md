# LAB6: Docker + AWS ECR + EC2 Deployment

## Overview

This lab implements a complete CI/CD pipeline that:

1. Builds Docker images for the frontend and backend applications
2. Pushes images to AWS ECR (Elastic Container Registry)
3. Deploys to an EC2 instance using docker-compose
4. Runs automated health checks after deployment

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────────────────────┐
│   GitHub Repo   │────▶│  GitHub Actions │────▶│         AWS ECR                 │
│                 │     │  (CI/CD)        │     │  ├── yelbook-backend:latest     │
└─────────────────┘     └────────┬────────┘     │  └── yelbook-frontend:latest    │
                                 │              └─────────────────────────────────┘
                                 │                              │
                                 ▼                              ▼
                        ┌─────────────────────────────────────────────────────┐
                        │                    EC2 Instance                      │
                        │                  (54.84.50.53)                       │
                        │  ┌─────────────────────────────────────────────┐    │
                        │  │              docker-compose                  │    │
                        │  │  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │    │
                        │  │  │ postgres │ │   api    │ │   frontend   │ │    │
                        │  │  │  :5432   │ │  :3001   │ │    :3000     │ │    │
                        │  │  └──────────┘ └──────────┘ └──────────────┘ │    │
                        │  └─────────────────────────────────────────────┘    │
                        └─────────────────────────────────────────────────────┘
```

## Rubric Checklist

| Criteria           | Points | Status | Details                                                 |
| ------------------ | ------ | ------ | ------------------------------------------------------- |
| Dockerfiles        | 30     | ✅     | `apps/api/Dockerfile`, `apps/front/Dockerfile`          |
| Local sanity       | 10     | ✅     | Multi-stage builds, standalone Next.js output           |
| ECR repos+policies | 20     | ✅     | `yelbook-backend`, `yelbook-frontend` with IAM policies |
| CI build/push      | 30     | ✅     | GitHub Actions with health check reports                |
| Docs               | 10     | ✅     | This file (LAB6.md)                                     |

## Security: Environment Variables

### .env Files Structure

Environment variables are managed securely:

- `.env` files contain actual secrets (gitignored)
- `.env.example` files are templates (committed to repo)

### Backend Environment Variables (`apps/api/.env.example`)

```bash
# Database
DATABASE_URL=postgresql://yelbook:yelbook123@localhost:5432/yelbook

# Server
HOST=0.0.0.0
PORT=3001
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000

# AWS (for production)
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=804257878061
```

### Frontend Environment Variables (`apps/front/.env.example`)

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# AWS (for production)
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=804257878061

# Node
NODE_ENV=development
PORT=3000
HOSTNAME=0.0.0.0
```

### .gitignore Configuration

```gitignore
# Environment variables
.env
.env.local
.env.*.local
!.env.example
```

## Files Created/Modified

### Dockerfiles (with ARG/ENV for security)

#### Backend (`apps/api/Dockerfile`)

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Build arguments for configuration
ARG AWS_REGION=us-east-1
ARG AWS_ACCOUNT_ID=804257878061
ARG NODE_ENV=production

COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./
COPY apps/api ./apps/api
COPY libs ./libs
RUN npm ci
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma
RUN npx nx run api:build:production
RUN npx nx run api:prune

# Production stage
FROM node:20-alpine AS production
WORKDIR /app

# Build arguments passed to production stage
ARG AWS_REGION=us-east-1
ARG AWS_ACCOUNT_ID=804257878061
ARG NODE_ENV=production
ARG PORT=3001
ARG HOST=0.0.0.0

RUN apk add --no-cache openssl
COPY --from=builder /app/apps/api/dist ./
COPY --from=builder /app/apps/api/prisma ./prisma
RUN npm ci --omit=dev
RUN npx prisma generate --schema=prisma/schema.prisma

# Set environment variables from ARGs
ENV NODE_ENV=${NODE_ENV}
ENV HOST=${HOST}
ENV PORT=${PORT}
ENV AWS_REGION=${AWS_REGION}
ENV AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID}

EXPOSE ${PORT}
CMD ["node", "main.js"]
```

#### Frontend (`apps/front/Dockerfile`)

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Build arguments for configuration
ARG AWS_REGION=us-east-1
ARG AWS_ACCOUNT_ID=804257878061
ARG NODE_ENV=production
ARG NEXT_PUBLIC_API_URL=http://localhost:3001

# Set as environment variable for Next.js build
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./
COPY apps/front ./apps/front
COPY libs ./libs
RUN npm ci
RUN npx nx run front:build:production

# Production stage
FROM node:20-alpine AS production
WORKDIR /app

# Build arguments passed to production stage
ARG AWS_REGION=us-east-1
ARG AWS_ACCOUNT_ID=804257878061
ARG NODE_ENV=production
ARG PORT=3000
ARG HOSTNAME=0.0.0.0

COPY --from=builder /app/apps/front/.next/standalone ./
COPY --from=builder /app/apps/front/.next/static ./apps/front/.next/static
COPY --from=builder /app/apps/front/public ./apps/front/public

# Set environment variables from ARGs
ENV NODE_ENV=${NODE_ENV}
ENV PORT=${PORT}
ENV HOSTNAME=${HOSTNAME}
ENV AWS_REGION=${AWS_REGION}
ENV AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID}

EXPOSE ${PORT}
CMD ["node", "apps/front/server.js"]
```

### GitHub Actions Workflows

#### Backend CI/CD (`.github/workflows/backend.yml`)

- Triggers on push to `main` with changes in `apps/api/**`
- Passes build args: `AWS_REGION`, `AWS_ACCOUNT_ID`, `NODE_ENV`, `PORT`, `HOST`
- Jobs:
  1. **build-and-push**: Lint, typecheck, build Docker image with args, push to ECR
  2. **deploy**: SSH to EC2, pull image, restart container
  3. **health-check**: Verify API endpoints respond with 200 OK

#### Frontend CI/CD (`.github/workflows/frontend.yml`)

- Triggers on push to `main` with changes in `apps/front/**`
- Passes build args: `AWS_REGION`, `AWS_ACCOUNT_ID`, `NODE_ENV`, `PORT`, `HOSTNAME`, `NEXT_PUBLIC_API_URL`
- Jobs:
  1. **build-and-push**: Lint, build, Docker image with args, push to ECR
  2. **deploy**: SSH to EC2, pull image, restart container
  3. **health-check**: Verify frontend responds with 200 OK

### Docker Compose (`docker-compose.yml`)

```yaml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: yelbook
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-yelbook123}
      POSTGRES_DB: yelbook
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - '5432:5432'

  api:
    image: ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/yelbook-backend:latest
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://yelbook:${POSTGRES_PASSWORD:-yelbook123}@postgres:5432/yelbook
      HOST: 0.0.0.0
      PORT: 3001
      CORS_ORIGIN: ${CORS_ORIGIN:-*}
    ports:
      - '3001:3001'

  frontend:
    image: ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/yelbook-frontend:latest
    depends_on:
      - api
    ports:
      - '3000:3000'

volumes:
  postgres_data:
```

## AWS Resources

### ECR Repositories

| Repository       | URI                                                             |
| ---------------- | --------------------------------------------------------------- |
| yelbook-backend  | `804257878061.dkr.ecr.us-east-1.amazonaws.com/yelbook-backend`  |
| yelbook-frontend | `804257878061.dkr.ecr.us-east-1.amazonaws.com/yelbook-frontend` |

### EC2 Instance

| Property       | Value                                    |
| -------------- | ---------------------------------------- |
| Instance ID    | `i-0e17ed5ce6c8af552`                    |
| Instance Type  | `t3.micro`                               |
| Public IP      | `54.84.50.53`                            |
| Region         | `us-east-1`                              |
| Security Group | `yelbook-sg` (ports: 22, 80, 3000, 3001) |
| Key Pair       | `yelbook-key`                            |

### IAM Resources

| Resource                                 | Purpose                          |
| ---------------------------------------- | -------------------------------- |
| `github-action` (IAM User)               | GitHub Actions authentication    |
| `yelbook-ec2-role` (IAM Role)            | EC2 instance role for ECR access |
| `yelbook-ec2-profile` (Instance Profile) | Attached to EC2 instance         |

#### IAM Policies

**github-action user:**

- `AmazonEC2ContainerRegistryPowerUser` - Push/pull images to ECR
- `EC2DescribeInstances` (inline) - Get EC2 instance IP

**yelbook-ec2-role:**

- `AmazonEC2ContainerRegistryReadOnly` - Pull images from ECR

## GitHub Secrets Required

| Secret                  | Description                                    |
| ----------------------- | ---------------------------------------------- |
| `AWS_ACCESS_KEY_ID`     | AWS access key for `github-action` user        |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key for `github-action` user        |
| `EC2_SSH_PRIVATE_KEY`   | SSH private key for EC2 access (`yelbook-key`) |

## Deployment URLs

| Service     | URL                     |
| ----------- | ----------------------- |
| Frontend    | http://54.84.50.53:3000 |
| Backend API | http://54.84.50.53:3001 |

## Health Check Report

After each deployment, GitHub Actions automatically generates a health check report showing:

- Deployment timestamp
- Commit SHA
- AWS Region
- HTTP status codes for each endpoint
- Pass/fail status

Example report (visible in GitHub Actions summary):

```
## Backend Health Check Report

**Deployment Time:** 2025-12-16 09:45:00 UTC
**Commit SHA:** abc123...
**API URL:** http://54.84.50.53:3001
**AWS Region:** us-east-1

### API Endpoint Check
| Endpoint    | Status | Result              |
|-------------|--------|---------------------|
| GET /       | 200    | ✅ Healthy          |
| GET /search | 200    | ✅ Healthy          |

### Docker Container Status
Image: 804257878061.dkr.ecr.us-east-1.amazonaws.com/yelbook-backend:abc123...
```

## How to Deploy

### Automatic Deployment

1. Push changes to `main` branch
2. If changes are in `apps/api/**` → Backend workflow runs
3. If changes are in `apps/front/**` → Frontend workflow runs
4. Health check runs automatically after deployment

### Manual Deployment

1. Go to GitHub → Actions
2. Select "Backend CI/CD" or "Frontend CI/CD"
3. Click "Run workflow"
4. Select branch and click "Run workflow"

## Local Development

### Setup Environment

```bash
# Copy environment templates
cp apps/api/.env.example apps/api/.env
cp apps/front/.env.example apps/front/.env

# Edit .env files with your local values
```

### Build Docker Images Locally

```bash
# Backend (with build args)
docker build \
  --build-arg AWS_REGION=us-east-1 \
  --build-arg AWS_ACCOUNT_ID=804257878061 \
  --build-arg NODE_ENV=production \
  -t yelbook-api \
  -f apps/api/Dockerfile .

# Frontend (with build args)
docker build \
  --build-arg AWS_REGION=us-east-1 \
  --build-arg AWS_ACCOUNT_ID=804257878061 \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:3001 \
  -t yelbook-front \
  -f apps/front/Dockerfile .
```

### Run with Docker Compose

```bash
# Set environment variables
export AWS_ACCOUNT_ID=804257878061
export AWS_REGION=us-east-1

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## SSH Access to EC2

```bash
# SSH into the instance
ssh -i /path/to/yelbook-key.pem ec2-user@54.84.50.53

# View running containers
docker ps

# View logs
docker-compose logs -f api
docker-compose logs -f frontend
```

## Troubleshooting

### Container not starting

```bash
# SSH into EC2
ssh -i yelbook-key.pem ec2-user@54.84.50.53

# Check container logs
docker logs yelbook-api
docker logs yelbook-frontend

# Restart services
cd /home/ec2-user/yelbook
docker-compose restart
```

### ECR login issues

```bash
# Manual ECR login on EC2
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 804257878061.dkr.ecr.us-east-1.amazonaws.com
```

### Database connection issues

```bash
# Check if postgres is running
docker ps | grep postgres

# Check postgres logs
docker logs yelbook-postgres

# Connect to postgres
docker exec -it yelbook-postgres psql -U yelbook -d yelbook
```

### Environment variable issues

```bash
# Check environment variables in container
docker exec yelbook-api env | grep -E 'AWS|NODE|PORT'
docker exec yelbook-frontend env | grep -E 'AWS|NODE|PORT'
```
