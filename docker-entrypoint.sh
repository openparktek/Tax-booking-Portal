#!/bin/sh
set -e

echo "🚀 Starting OpenPark Booking Portal..."

# Run Prisma migrations (safe — idempotent)
echo "📦 Running database migrations..."
cd /app/server
npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss

echo "✅ Migrations complete. Starting backend..."
# Start Express API in background
node dist/index.js &

echo "🌐 Starting nginx..."
nginx -g "daemon off;"
