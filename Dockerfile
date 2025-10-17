# =========================================
# Stage 1 — Build
# =========================================
FROM node:20-alpine AS builder

# Set workdir
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies (use npm ci for clean install)
RUN npm ci

# Copy all project files
COPY . .

# Build Nuxt for production
RUN npm run build


# =========================================
# Stage 2 — Production
# =========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
# Pastikan Nuxt server di production mode
ENV NITRO_PORT=3000
ENV HOST=0.0.0.0

# Copy only necessary files from builder
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package*.json ./

# Optional: install only production deps
RUN npm ci --omit=dev

# Expose port
EXPOSE 3000

# Start Nuxt server
CMD ["node", ".output/server/index.mjs"]
