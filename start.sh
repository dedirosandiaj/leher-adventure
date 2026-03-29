#!/bin/bash
set -e

echo "Installing dependencies..."
npm install

echo "Initializing database..."
node scripts/init-db.js

echo "Starting Next.js application..."
exec npm start
