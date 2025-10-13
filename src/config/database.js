import 'dotenv/config';

import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import logger from './logger.js';

// Configure Neon for local development with Neon Local
if (process.env.NODE_ENV === 'development') {
  // Check if we're using Neon Local (Docker Compose)
  const isNeonLocal = process.env.DATABASE_URL?.includes('neon-local') || process.env.DATABASE_URL?.includes('localhost');
  
  if (isNeonLocal) {
    logger.info('Configuring database for Neon Local development environment');
    
    // Configure for Neon Local proxy
    const dbHost = process.env.DATABASE_URL?.includes('neon-local') ? 'neon-local' : 'localhost';
    neonConfig.fetchEndpoint = `http://${dbHost}:5432/sql`;
    neonConfig.useSecureWebSocket = false;
    neonConfig.poolQueryViaFetch = true;
    
    // For JavaScript applications connecting to Neon Local
    neonConfig.ssl = { rejectUnauthorized: false };
  }
} else {
  logger.info('Configuring database for production Neon Cloud environment');
}

// Validate DATABASE_URL
if (!process.env.DATABASE_URL) {
  const error = 'DATABASE_URL environment variable is required';
  logger.error(error);
  throw new Error(error);
}

logger.info(`Database connection configured for: ${process.env.NODE_ENV} environment`);

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

export { db, sql };
