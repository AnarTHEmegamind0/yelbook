# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Build arguments for configuration
ARG AWS_REGION=us-east-1
ARG AWS_ACCOUNT_ID=804257878061
ARG NODE_ENV=production

# Copy root package files
COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./

# Copy workspace packages
COPY apps/api ./apps/api
COPY libs ./libs

# Install dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma

# Build the API
RUN npx nx run api:build:production

# Prune dependencies for production
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

# Install openssl for Prisma
RUN apk add --no-cache openssl

# Copy built application and pruned dependencies
COPY --from=builder /app/apps/api/dist ./
COPY --from=builder /app/apps/api/prisma ./prisma

# Install production dependencies
RUN npm ci --omit=dev

# Generate Prisma client in production
RUN npx prisma generate --schema=prisma/schema.prisma

# Set environment variables from ARGs
ENV NODE_ENV=${NODE_ENV}
ENV HOST=${HOST}
ENV PORT=${PORT}
ENV AWS_REGION=${AWS_REGION}
ENV AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID}

EXPOSE ${PORT}

CMD ["node", "main.js"]
