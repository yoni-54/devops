# 🐳 DevOps Application - Docker Setup Guide

This guide explains how to run the DevOps authentication API using Docker with different database configurations for development and production environments.

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Development Setup (Neon Local)](#development-setup-neon-local)
- [Production Setup (Neon Cloud)](#production-setup-neon-cloud)
- [Environment Configuration](#environment-configuration)
- [Available Commands](#available-commands)
- [Troubleshooting](#troubleshooting)

## 🛠️ Prerequisites

Before getting started, ensure you have:

- **Docker** (version 20.10 or higher)
- **Docker Compose** (version 2.0 or higher)
- **Neon account** with API access ([Sign up here](https://neon.tech))
- **Git** for cloning the repository

### Getting Neon Credentials

1. Go to [Neon Console](https://console.neon.tech/)
2. Navigate to your project
3. Get your **API Key** from Account Settings → Developer Settings
4. Get your **Project ID** from Project Settings → General
5. Note your main **Branch ID** (usually `main` or the default branch name)

## 🚀 Development Setup (Neon Local)

### What is Neon Local?
Neon Local is a proxy service that creates ephemeral database branches for development. Each time you start your Docker environment, you get a fresh copy of your database that's automatically deleted when you stop the containers.

### Quick Start

1. **Clone and navigate to the project:**
   ```bash
   git clone <repository-url>
   cd devops
   ```

2. **Set up environment variables:**
   ```bash
   # Copy the example file
   cp .env.development.example .env.development
   
   # Edit the file with your Neon credentials
   # Required: NEON_API_KEY, NEON_PROJECT_ID
   ```

3. **Start the development environment:**
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

4. **Access your application:**
   - API: http://localhost:3000
   - Health check: http://localhost:3000/health
   - Database: localhost:5432 (accessible from host)

### Development Environment Details

**Services Running:**
- `neon-local`: Neon Local proxy (creates ephemeral database branches)
- `app`: Your Node.js application with hot reload

**Features:**
- ✅ Automatic code reloading when you change source files
- ✅ Fresh database branch on each startup
- ✅ Automatic branch cleanup on shutdown
- ✅ Full access to Neon cloud features
- ✅ Isolated development environment

**Database Connection:**
- The app connects to `postgres://neon:npg@neon-local:5432/neondb`
- Neon Local handles authentication and routing to your cloud project
- Each container restart creates a new ephemeral branch

### Running Database Migrations in Development

```bash
# Enter the application container
docker-compose -f docker-compose.dev.yml exec app bash

# Run migrations
npm run db:migrate

# Generate new migrations
npm run db:generate
```

## 🌟 Production Setup (Neon Cloud)

### Production Deployment

1. **Set up environment variables** (in your deployment platform):
   ```bash
   # Required production environment variables
   NODE_ENV=production
   DATABASE_URL=postgresql://user:pass@your-neon-host/dbname
   JWT_SECRET=your-super-secure-jwt-secret
   ARCJET_KEY=your-arcjet-key
   
   # Optional
   LOG_LEVEL=info
   CORS_ORIGIN=https://yourdomain.com
   ```

2. **Deploy using Docker Compose:**
   ```bash
   # Build and run production containers
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

3. **Or deploy using individual commands:**
   ```bash
   # Build the image
   docker build -t devops-app:prod --target production .
   
   # Run the container
   docker run -d \
     --name devops-app-prod \
     -p 3000:3000 \
     -e DATABASE_URL="postgresql://..." \
     -e JWT_SECRET="your-jwt-secret" \
     -e NODE_ENV="production" \
     devops-app:prod
   ```

### Production Environment Details

**Features:**
- ✅ Optimized production build
- ✅ Resource limits and health checks
- ✅ Structured logging
- ✅ Security hardening
- ✅ Optional Nginx reverse proxy
- ✅ SSL certificate support

**No Neon Local:** Production directly connects to your Neon Cloud database using the full connection string.

## ⚙️ Environment Configuration

### Development (.env.development)
```bash
NODE_ENV=development
DATABASE_URL=postgres://neon:npg@neon-local:5432/neondb?sslmode=require
NEON_API_KEY=your_api_key
NEON_PROJECT_ID=your_project_id
PARENT_BRANCH_ID=main
JWT_SECRET=dev-secret
```

### Production (Environment Variables)
```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@your-neon-cloud-host/dbname
JWT_SECRET=production-secret
ARCJET_KEY=your-arcjet-key
LOG_LEVEL=info
CORS_ORIGIN=https://yourdomain.com
```

## 📚 Available Commands

### Development Commands
```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up

# Start with rebuild
docker-compose -f docker-compose.dev.yml up --build

# Stop development environment
docker-compose -f docker-compose.dev.yml down

# View logs
docker-compose -f docker-compose.dev.yml logs -f app

# Execute commands in container
docker-compose -f docker-compose.dev.yml exec app npm run db:migrate
```

### Production Commands
```bash
# Start production environment
docker-compose -f docker-compose.prod.yml up -d

# Start with Nginx reverse proxy
docker-compose -f docker-compose.prod.yml --profile with-nginx up -d

# Stop production environment
docker-compose -f docker-compose.prod.yml down

# View production logs
docker-compose -f docker-compose.prod.yml logs app
```

### Utility Commands
```bash
# Clean up all containers and volumes
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.prod.yml down -v

# Rebuild images
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.prod.yml build --no-cache

# Check container health
docker ps --filter "name=devops"
```

## 🔧 Troubleshooting

### Common Issues

**1. Neon Local Connection Failed**
```bash
# Check if Neon Local container is healthy
docker-compose -f docker-compose.dev.yml ps

# View Neon Local logs
docker-compose -f docker-compose.dev.yml logs neon-local

# Ensure your NEON_API_KEY and NEON_PROJECT_ID are correct
```

**2. Database Connection Issues**
```bash
# Test connection from within the app container
docker-compose -f docker-compose.dev.yml exec app node -e "
const { db } = require('./src/config/database.js');
console.log('Database connection test...');
"
```

**3. Port Already in Use**
```bash
# Check what's using port 3000 or 5432
netstat -tulpn | grep :3000
netstat -tulpn | grep :5432

# Kill processes or change ports in docker-compose files
```

**4. Volume Permission Issues (Linux/Mac)**
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
```

### Environment-Specific Debugging

**Development:**
- Check `.env.development` file exists and has correct values
- Verify Neon credentials are valid
- Ensure Docker has enough resources allocated

**Production:**
- Verify all required environment variables are set
- Check DATABASE_URL format and credentials
- Review application logs for startup errors

### Health Checks

All containers include health checks. Check status with:
```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

### Getting Help

If you encounter issues:

1. **Check the logs first:**
   ```bash
   docker-compose logs --tail 50
   ```

2. **Verify environment variables:**
   ```bash
   docker-compose config
   ```

3. **Test individual services:**
   ```bash
   docker-compose up neon-local  # Test database proxy
   docker-compose up app         # Test application
   ```

---

## 🎯 Quick Reference

| Environment | Command | Database | Port |
|-------------|---------|----------|------|
| Development | `docker-compose -f docker-compose.dev.yml up` | Neon Local (ephemeral) | 3000 |
| Production | `docker-compose -f docker-compose.prod.yml up -d` | Neon Cloud | 3000 |

**Happy coding!** 🚀