#!/bin/bash
# deploy-booking.sh — Deploy OpenPark Booking Portal to portal.openpark.hu/booking
# Run from your Mac: ./deploy/deploy-booking.sh

set -e

SERVER="root@185.217.126.8"
REMOTE_DIR="/opt/openpark-booking"

echo "📦 Building frontend..."
cd "$(dirname "$0")/.."
npm run build

echo "📦 Packaging deployment..."
# Create a deployment tarball with frontend build + server code
tar czf /tmp/openpark-booking-deploy.tar.gz \
  build/ \
  server/src/ \
  server/prisma/ \
  server/package.json \
  server/tsconfig.json \
  .env

echo "🚀 Uploading to server..."
ssh $SERVER "mkdir -p $REMOTE_DIR"
scp /tmp/openpark-booking-deploy.tar.gz $SERVER:/tmp/

echo "📂 Extracting on server..."
ssh $SERVER "cd $REMOTE_DIR && tar xzf /tmp/openpark-booking-deploy.tar.gz && rm /tmp/openpark-booking-deploy.tar.gz"

echo "📦 Installing backend dependencies..."
ssh $SERVER "cd $REMOTE_DIR/server && npm install --production"

echo "🗄️ Setting up database..."
ssh $SERVER "cd $REMOTE_DIR/server && npx prisma db push --accept-data-loss && npx tsx prisma/seed.ts"

echo "🔄 Restarting backend service..."
ssh $SERVER "pm2 restart openpark-booking 2>/dev/null || cd $REMOTE_DIR/server && pm2 start 'npx tsx src/index.ts' --name openpark-booking"
ssh $SERVER "pm2 save"

echo "🔄 Reloading Nginx..."
ssh $SERVER "nginx -t && systemctl reload nginx"

echo ""
echo "✅ Deployed successfully!"
echo "🌐 https://portal.openpark.hu/booking"
echo "📧 Login: admin@openpark.hu / 123456"

rm -f /tmp/openpark-booking-deploy.tar.gz
