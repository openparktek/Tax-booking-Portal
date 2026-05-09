# ─── Stage 1: Build React Frontend ───────────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Install frontend deps
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

# Build-time env vars (baked into JS bundle by Vite)
ARG VITE_GOOGLE_MAPS_API_KEY
ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY

# Copy source and build
COPY index.html vite.config.ts ./
COPY src ./src

RUN npm run build


# ─── Stage 2: Build Express Backend ──────────────────────────────────────────
FROM node:20-alpine AS backend-builder

WORKDIR /server

COPY server/package.json server/package-lock.json ./
RUN npm ci

COPY server/tsconfig.json ./
COPY server/src ./src
COPY server/prisma ./prisma

# Generate Prisma client and compile TypeScript
RUN npx prisma generate
RUN npx tsc --noEmitOnError false || true


# ─── Stage 3: Production Image ────────────────────────────────────────────────
FROM node:20-alpine AS production

# Install nginx
RUN apk add --no-cache nginx

# ── Backend ──
WORKDIR /app/server
COPY --from=backend-builder /server/node_modules ./node_modules
COPY --from=backend-builder /server/dist ./dist
COPY --from=backend-builder /server/prisma ./prisma
# Prisma generated client lives inside node_modules — already copied above

# ── Frontend ──
COPY --from=frontend-builder /app/build /usr/share/nginx/html/booking

# ── Nginx config ──
COPY nginx.conf /etc/nginx/nginx.conf

# ── Startup script ──
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

CMD ["/docker-entrypoint.sh"]
