import express, { Request, Response } from 'express';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

const authRouter = express.Router();

interface SignInRequestBody {
  email: string;
  password: string;
}

interface GitHubAuthRequestBody {
  githubId: string;
  email: string;
  name: string;
  image?: string;
}

// POST /auth/login - Traditional email/password login
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as SignInRequestBody;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordMatches = await bcryptjs.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'dev-secret';
    if (jwtSecret === 'dev-secret') {
      console.warn(
        'Using fallback JWT secret — set JWT_SECRET in environment for production'
      );
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name, role: user.role },
      jwtSecret,
      { expiresIn: '1d' }
    );

    // do not return password
    const userSafe = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    return res.json({ token, user: userSafe });
  } catch (error) {
    console.error('/auth/login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/github - GitHub OAuth callback for NextAuth
// Creates or updates user based on GitHub profile
authRouter.post('/github', async (req: Request, res: Response) => {
  try {
    const { githubId, email, name, image } = req.body as GitHubAuthRequestBody;

    if (!githubId) {
      return res.status(400).json({ error: 'GitHub ID is required' });
    }

    // Check if user exists by githubId first
    let user = await prisma.user.findUnique({
      where: { githubId },
    });

    // Check if we should make this user an admin (matches ADMIN_GITHUB_ID)
    const adminGithubId = process.env.ADMIN_GITHUB_ID;
    const isAdmin = adminGithubId && githubId === adminGithubId;

    if (user) {
      // Update existing user
      user = await prisma.user.update({
        where: { githubId },
        data: {
          name: name || user.name,
          image: image || user.image,
          // Don't update email if user already has one (to avoid conflicts)
          ...(email && !user.email ? { email } : {}),
          // Always upgrade to admin if this is the admin GitHub ID
          ...(isAdmin && user.role !== 'ADMIN' ? { role: 'ADMIN' } : {}),
        },
      });
    } else {
      // Check if email already exists
      if (email) {
        const existingUserByEmail = await prisma.user.findUnique({
          where: { email },
        });

        if (existingUserByEmail) {
          // Link GitHub to existing account
          user = await prisma.user.update({
            where: { email },
            data: {
              githubId,
              name: name || existingUserByEmail.name,
              image: image || existingUserByEmail.image,
              // Upgrade to admin if this is the admin GitHub ID
              ...(isAdmin ? { role: 'ADMIN' } : {}),
            },
          });
        } else {
          // Create new user
          user = await prisma.user.create({
            data: {
              githubId,
              email,
              name,
              image,
              role: isAdmin ? 'ADMIN' : 'USER',
            },
          });
        }
      } else {
        // Create user without email (GitHub sometimes doesn't provide email)
        user = await prisma.user.create({
          data: {
            githubId,
            email: `github-${githubId}@placeholder.local`, // Placeholder email
            name,
            image,
            role: isAdmin ? 'ADMIN' : 'USER',
          },
        });
      }
    }

    // Return user info (without password)
    const userSafe = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      githubId: user.githubId,
      image: user.image,
    };

    return res.json({ user: userSafe });
  } catch (error) {
    console.error('/auth/github error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /auth/me - Get current user info (requires JWT token)
authRouter.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET || 'dev-secret';

    const decoded = jwt.verify(token, jwtSecret) as {
      userId: number;
      email: string;
      role: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        githubId: true,
        image: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    console.error('/auth/me error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default authRouter;
