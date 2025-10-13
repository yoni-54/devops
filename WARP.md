# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a Node.js Express authentication API with PostgreSQL database integration via Drizzle ORM. The project uses Neon Database for both development (via Neon Local) and production (via Neon Cloud), with comprehensive security features including Arcjet protection, JWT authentication, and role-based rate limiting.

## Common Development Commands

### Local Development

```bash
# Start development environment with hot reload
npm run dev

# Start via Docker development setup
npm run dev:docker
# OR manually:
sh ./scripts/dev.sh
docker-compose -f docker-compose.dev.yml up --build
```

### Database Operations

```bash
# Generate new database migration
npm run db:generate

# Apply database migrations
npm run db:migrate

# Open Drizzle Studio (database GUI)
npm run db:studio
```

### Code Quality & Formatting

```bash
# Lint code
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format

# Check formatting without modifying files
npm run format:check
```

### Production Deployment

```bash
# Start production environment
npm run prod:docker
# OR manually:
sh ./scripts/prod.sh
docker-compose -f docker-compose.prod.yml up -d --build
```

### Testing & Debugging

```bash
# View application logs (Docker)
docker-compose -f docker-compose.dev.yml logs -f app

# Access container shell for debugging
docker-compose -f docker-compose.dev.yml exec app bash

# Test database connection
docker-compose -f docker-compose.dev.yml exec app node -e "
const { db } = require('./src/config/database.js');
console.log('Database connection test...');
"
```

## Architecture & Structure

### Application Architecture

- **Entry Point**: `src/index.js` → `src/server.js` → `src/app.js`
- **Database**: PostgreSQL via Neon with Drizzle ORM
- **Security**: Multi-layered security with Arcjet, Helmet, CORS, and JWT
- **Development**: Docker Compose with Neon Local for ephemeral database branches
- **Production**: Docker Compose with direct Neon Cloud connection

### Key Components

#### Security Stack

- **Arcjet Integration**: Bot detection, SQL injection shield, and rate limiting
- **Role-Based Rate Limiting**: Different limits for admin (20/min), user (10/min), guest (5/min)
- **JWT Authentication**: Secure token-based auth with configurable expiration
- **Standard Security**: Helmet, CORS, cookie parsing

#### Database Configuration

- **Development**: Uses Neon Local proxy for ephemeral branches
- **Production**: Direct connection to Neon Cloud
- **ORM**: Drizzle with automatic migration support
- **Models**: User model with role-based access control

#### Path Aliases (Import Maps)

```javascript
#config/*     → ./src/config/*
#controllers/* → ./src/controllers/*
#middleware/*  → ./src/middleware/*
#models/*      → ./src/models/*
#routes/*      → ./src/routes/*
#services/*    → ./src/services/*
#utils/*       → ./src/utils/*
#validations/* → ./src/validations/*
```

### Environment Configuration

#### Development Setup Requirements

1. Copy `.env.development.example` to `.env.development`
2. Configure required variables:
   - `NEON_API_KEY`: Your Neon API key
   - `NEON_PROJECT_ID`: Your Neon project ID
   - `PARENT_BRANCH_ID`: Usually "main"
   - `JWT_SECRET`: Development JWT secret

#### Production Setup Requirements

- `NODE_ENV=production`
- `DATABASE_URL`: Full Neon Cloud connection string
- `JWT_SECRET`: Secure production secret
- `ARCJET_KEY`: Arcjet security key
- `LOG_LEVEL`: Logging level (info/debug/warn/error)
- `CORS_ORIGIN`: Allowed CORS origins

### Development Workflow Notes

#### Database Development

- Each Docker development startup creates a fresh ephemeral database branch
- Branches are automatically cleaned up when containers stop
- Use `npm run db:studio` for visual database management
- Migration files are stored in `./drizzle/` directory

#### Code Standards

- ESLint configuration enforces modern JavaScript standards
- Prettier for consistent formatting
- Windows line endings configured (`linebreak-style: windows`)
- Single quotes, semicolons, and 2-space indentation required

#### Docker Development Features

- Hot reload enabled for source code changes
- Automatic database branch creation and cleanup
- Health checks for container monitoring
- Non-root user execution for security

### Important Implementation Details

#### Security Middleware Flow

1. Arcjet shield protection (SQL injection, XSS)
2. Bot detection with search engine allowlist
3. Role-based sliding window rate limiting
4. Request logging with winston

#### Database Connection Logic

- Automatically detects development vs production environment
- Configures Neon connection appropriately (Local proxy vs Cloud)
- SSL configuration handled based on environment

#### Authentication Pattern

- JWT tokens with 1-day expiration
- User roles stored in database (admin/user)
- Role-based access control throughout application
- Cookie-based token storage supported

### Troubleshooting Commands

```bash
# Check Neon Local container health
docker-compose -f docker-compose.dev.yml ps

# View Neon Local proxy logs
docker-compose -f docker-compose.dev.yml logs neon-local

# Test API health endpoint
curl http://localhost:3000/health

# Check what's using port 3000
netstat -tulpn | grep :3000
```
