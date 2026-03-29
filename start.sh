#!/bin/bash
set -e

echo "Installing dependencies..."
npm install

echo "Initializing database..."
node scripts/init-db.js

echo "Starting Next.js application..."
# Set NODE_OPTIONS untuk increase memory dan payload limit
export NODE_OPTIONS="--max-http-header-size=65536"
exec npm start
