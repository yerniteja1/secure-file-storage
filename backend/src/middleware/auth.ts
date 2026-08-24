import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { verifyToken, getTokenFromHeader } from '../utils/jwt';
import { UnauthorizedError } from '../utils/errors';

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const token = getTokenFromHeader(req.headers.authorization);

    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      next(new UnauthorizedError('Invalid or expired token'));
    }
  }
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const token = getTokenFromHeader(req.headers.authorization);

    if (token) {
      const payload = verifyToken(token);
      req.user = payload;
    }

    next();
  } catch (error) {
    // Continue without authentication for optional routes
    next();
  }
}