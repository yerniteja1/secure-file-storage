import { Request, Response, NextFunction } from 'express';
import { registerSchema, loginSchema, RegisterInput, LoginInput } from '../utils/validation';
import { UnauthorizedError } from '../utils/errors';
import { AuthRequest, ApiResponse } from '../types';
import * as authService from '../services/authService';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userData: RegisterInput = registerSchema.parse(req.body);
    const user = await authService.register(userData);

    const response: ApiResponse = {
      success: true,
      data: {
        user,
        message: 'Registration successful',
      },
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const loginData: LoginInput = loginSchema.parse(req.body);
    const result = await authService.login(loginData);

    const response: ApiResponse = {
      success: true,
      data: result,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

export async function me(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError('User not authenticated');
    }

    const user = await authService.getMe(req.user.userId);

    const response: ApiResponse = {
      success: true,
      data: { user },
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}