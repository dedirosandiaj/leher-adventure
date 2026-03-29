#!/bin/bash
set -e

echo "Initializing database..."
node scripts/init-db.js

echo "Starting Next.js application..."
exec npm start
