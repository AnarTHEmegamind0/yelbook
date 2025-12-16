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

# Copy root package files
COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./

# Copy workspace packages
COPY apps/front ./apps/front
COPY libs ./libs

# Install dependencies
RUN npm ci

# Build the frontend
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

# Copy built Next.js application
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
