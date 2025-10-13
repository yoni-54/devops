#!bin/bash

# Productino deploment script for DevOps App
# This script starts the application in production mode with Neon Cloud Database

echo "Starting DevOps App in Production Mode"
echo "======================================"

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo ".env.production file not found! Please create it with the necessary environment variables."
    exit 1
fi

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "Building container for production..."
echo " -Using Neon Cloud Database( no local poxy)"
echo " -Running in optimized production mode"
echo ""

# Start production environment
docker compose -f docker-compose.prod.yml up --build -d

# Wait for DB to be ready
echo "Waiting for the database to be ready..."
sleep 5

# run migrations
echo "Applying latest schema with Drizzle..."
npm run db:migrate

echo ""
echo "Production environment is up and running!"
echo " - Access the app at: http://localhost:3000"
echo " - Logs: docker logs DevOps-app-prod"
echo ""
echo "Useful commands:"
echo " View logs: docker logs -f DevOps-app-prod"
echo " Stop the app: docker compose -f docker-compose.prod.yml down"
