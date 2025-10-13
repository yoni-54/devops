#!/bin/bash

# Development startup script for DevOps App with Neon Local
# This script starts the application in development mode with Neon Local

echo "Starting DevOps App in Development Mode"
echo "---------------------------------------"

#check if .env.development exists
if [ ! -f .env.development ]; then
  echo ".env.development file not found!"
  exit 1
fi

# check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "Docker is not running. Please start Docker and try again."
  exit 1
fi

#create .neon_local directory if it doesn't exist
mkdir -p .neon_local

#add .neon_local to .gitignore if not already present
if ! grep -q ".neon_local/" .gitignore 2>/dev/null; then
    echo ".neon_local" >> .gitignore
    echo "Added .neon_local to .gitignore"
fi

echo "Building and starting Docker containers..."
echo "Neon Local proxy will create an ephemeral database branch"
echo "Application will run with hot reload enabled"
echo ""

#Run migrations with Drizzle
echo"Applying latest schema with Drizzle..."
npm run db:migrate

#wait for the database to be ready
echo "Waiting for the database to be ready..."
docker compose exec neon-local psql -U neon -d neondb -c 'SELECT 1'

# Start the application with hot reload
docker compose -f docker-compose.dev.yml up --build

echo "Develompment environment is up and running!"
echo "Access the application at http://localhost:5173"
echo "Database postgres://neon:npg@localhost:5432/neondb"