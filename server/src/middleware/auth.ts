import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    roleId: string;
    permissions: string[];
  };
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ success: false, error: 'Server configuration error' });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret) as {
      userId: string;
      email: string;
      roleId: string;
      permissions: string[];
    };
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ success: false, error: 'Invalid or expired token' });
    return;
  }
}

export function requirePermission(...permissions: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const userPermissions = req.user.permissions || [];
    const hasPermission = permissions.some(p => userPermissions.includes(p));

    if (!hasPermission) {
      res.status(403).json({ success: false, error: 'Insufficient permissions' });
      return;
    }

    next();
  };
}

export function generateToken(user: { id: string; email: string; roleId: string }, permissions: string[]): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not configured');

  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      roleId: user.roleId,
      permissions,
    },
    secret,
    { expiresIn: '24h' }
  );
}

export { prisma };
