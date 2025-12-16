import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        name: string | null;
        role: 'USER' | 'ADMIN';
        githubId: string | null;
      };
    }
  }
}

interface JWTPayload {
  userId: number;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
}

/**
 * Middleware to authenticate requests using JWT token
 * Supports both traditional JWT tokens and NextAuth session tokens
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    // Check for Bearer token
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const jwtSecret = process.env.JWT_SECRET || 'dev-secret';

      try {
        const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

        // Get fresh user data from database
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            githubId: true,
          },
        });

        if (!user) {
          return res.status(401).json({ error: 'User not found' });
        }

        req.user = user as Request['user'];
        return next();
      } catch {
        return res.status(401).json({ error: 'Invalid token' });
      }
    }

    // Check for NextAuth session cookie (x-nextauth-token header from frontend)
    const sessionToken = req.headers['x-nextauth-token'] as string;
    if (sessionToken) {
      try {
        // Decode the base64 encoded session info from frontend
        const userInfo = JSON.parse(
          Buffer.from(sessionToken, 'base64').toString()
        );

        if (userInfo && userInfo.githubId) {
          const user = await prisma.user.findUnique({
            where: { githubId: userInfo.githubId },
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              githubId: true,
            },
          });

          if (user) {
            req.user = user as Request['user'];
            return next();
          }
        }
      } catch {
        // Continue to unauthorized
      }
    }

    return res.status(401).json({ error: 'Authentication required' });
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Middleware to check if authenticated user has admin role
 * Must be used after authMiddleware
 */
export const adminGuard = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  return next();
};

/**
 * Combined middleware for admin-only routes
 * Authenticates and checks admin role in one step
 */
export const requireAdmin = [authMiddleware, adminGuard];
