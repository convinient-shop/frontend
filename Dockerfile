# Production-ready Dockerfile for Next.js
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the Next.js app
RUN npm run build

# --- Production image ---
FROM node:18-alpine AS runner
WORKDIR /app

# Only copy necessary files for production
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/node_modules ./node_modules

# Expose port 3000
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "start"] 