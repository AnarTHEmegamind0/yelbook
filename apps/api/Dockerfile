# Production stage - use pre-built files with pre-generated Prisma client
FROM node:20-alpine

WORKDIR /app

# Install openssl for Prisma
RUN apk add --no-cache openssl

# Copy the entire node_modules with pre-generated Prisma client
COPY node_modules ./node_modules

# Copy prisma schema and migrations (needed for migrate deploy)
COPY apps/api/prisma ./prisma
COPY apps/api/prisma.config.ts ./

# Copy built application
COPY apps/api/dist ./dist

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3001

EXPOSE 3001

CMD ["node", "dist/main.js"]
