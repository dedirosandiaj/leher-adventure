#!/bin/bash
set -e

echo "Installing dependencies..."
npm install

echo "Building Next.js application..."
npm run build

echo "Syncing database schema with Prisma..."
export DATABASE_URL="${DATABASE_URL}"
npx prisma db push --skip-generate

echo "Starting Next.js application..."
# Set NODE_OPTIONS untuk increase memory dan payload limit
export NODE_OPTIONS="--max-http-header-size=65536"
exec npm start
