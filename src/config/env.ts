import dotenv from 'dotenv';
import type { StringValue } from 'ms';

dotenv.config();

// Mesmo formato aceito pelo ms/jsonwebtoken: "900", "15m", "1 h", "7d"...
const DURATION_RE =
  /^\d+(\.\d+)?\s?(ms|msecs?|milliseconds?|s|secs?|seconds?|m|mins?|minutes?|h|hrs?|hours?|d|days?|w|weeks?|y|yrs?|years?)?$/i;

function isStringValue(value: string): value is StringValue {
  return DURATION_RE.test(value);
}

function parseDuration(name: string, fallback: StringValue): StringValue {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  if (!isStringValue(raw)) {
    throw new Error(`${name} invalido: "${raw}" (use ex.: 15m, 1h, 900)`);
  }
  return raw;
}

export const env = {
  port: process.env.PORT || 3333,
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtAccessExpiresIn: parseDuration('JWT_ACCESS_EXPIRES_IN', '15m'),
  jwtRefreshExpiresInDays: Number(process.env.JWT_REFRESH_EXPIRES_IN_DAYS) || 7,
  publicApiUrl: process.env.PUBLIC_API_URL || 'http://localhost:3333',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
};
