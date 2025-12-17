import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import authRouter from './routes/authRoute';
import adminRouter from './routes/adminRoute';
import aiRouter from './routes/aiRoute';
import prisma from './lib/prisma';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3001;
const app = express();

// Create API router for /api prefix (used in production with ALB)
const apiRouter = express.Router();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-nextauth-token'],
  })
);

// Health check endpoint at root level
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

//  auth router
apiRouter.use('/auth', authRouter);

// admin router
apiRouter.use('/admin', adminRouter);

// AI router
apiRouter.use('/ai', aiRouter);

// GET / - show all Prisma data (users, businesses, categories)
apiRouter.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    const businesses = await prisma.business.findMany({ take: 4 });

    return res.json({ categories, businesses });
  } catch (error) {
    console.error('Error fetching data:', error);
    return res.status(500).json({ error: 'Failed to fetch data' });
  }
});

apiRouter.get('/search', async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    const businesses = await prisma.business.findMany();

    return res.json({ categories, businesses });
  } catch (error) {
    console.error('Error fetching data:', error);
    return res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// GET /businesses/:id - get single business by id (public)
apiRouter.get('/businesses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const business = await prisma.business.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    return res.json({ business });
  } catch (error) {
    console.error('/businesses/:id error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Mount API router at /api prefix for production (ALB routing)
// Also mount at root for backwards compatibility in development
app.use('/api', apiRouter);
app.use('/', apiRouter);

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
