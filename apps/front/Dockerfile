# Production stage - use pre-built files  
FROM node:20-alpine

WORKDIR /app

# Copy pre-built Next.js standalone application
COPY apps/front/.next/standalone ./
COPY apps/front/.next/static ./apps/front/.next/static
COPY apps/front/public ./apps/front/public

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

EXPOSE 3000

CMD ["node", "apps/front/server.js"]
