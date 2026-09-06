import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: process.env.PORT || 3333,
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || '',
  publicApiUrl: process.env.PUBLIC_API_URL || 'http://localhost:3333',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
};
