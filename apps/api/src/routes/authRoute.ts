// import express, { Request, Response } from 'express';
// import bcryptjs from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import prisma from '../../lib/prisma';
// const authRouter = express.Router();

// interface SignInRequestBody {
//   email: string;
//   password: string;
// }

// // POST /login
// authRouter.post('/login', async (req: Request, res: Response) => {
//   try {
//     const { email, password } = req.body as SignInRequestBody;

//     if (!email || !password) {
//       return res.status(400).json({ error: 'Email and password are required' });
//     }

//     const user = await prisma.user.findUnique({ where: { email } });

//     if (!user || !user.password) {
//       return res.status(401).json({ error: 'Invalid email or password' });
//     }

//     const passwordMatches = await bcryptjs.compare(password, user.password);

//     if (!passwordMatches) {
//       return res.status(401).json({ error: 'Invalid email or password' });
//     }

//     const jwtSecret = process.env.JWT_SECRET || 'dev-secret';
//     if (jwtSecret === 'dev-secret') {
//       console.warn(
//         'Using fallback JWT secret — set JWT_SECRET in environment for production'
//       );
//     }

//     const token = jwt.sign(
//       { userId: user.id, email: user.email, name: user.name },
//       jwtSecret,
//       { expiresIn: '1d' }
//     );

//     // do not return password
//     const userSafe = { id: user.id, email: user.email, name: user.name };

//     return res.json({ token, user: userSafe });
//   } catch (error) {
//     console.error('/login error:', error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// });

// export default authRouter;
