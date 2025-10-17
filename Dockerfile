# =========================================
# Stage 1 — Build
# =========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Kadang npm ci error di Alpine → pakai npm install
RUN npm install

# Copy sisa project
COPY . .

# Build Nuxt app
RUN npm run build


# =========================================
# Stage 2 — Production
# =========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NITRO_PORT=3000
ENV HOST=0.0.0.0

# Copy hasil build
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package*.json ./

# Install deps minimal (biar ada runtime modules)
RUN npm install --omit=dev

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
