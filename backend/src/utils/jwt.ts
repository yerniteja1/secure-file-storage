import jwt, { SignOptions } from 'jsonwebtoken';
import { UserPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export function generateToken(payload: UserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as SignOptions });
}

export function verifyToken(token: string): UserPayload {
  const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
  return {
    userId: decoded.userId,
    email: decoded.email,
  };
}

export function getTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}