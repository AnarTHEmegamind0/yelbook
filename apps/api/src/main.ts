import 'dotenv/config';

import express from 'express';
import cors from 'cors';
// import authRouter from './routes/authRoute';
import adminRouter from './routes/adminRoute';
import prisma from './lib/prisma';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3001;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

//  auth router
// app.use('/auth', authRouter);

// admin router
app.use('/admin', adminRouter);

// GET / - show all Prisma data (users, businesses, categories)
app.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    const businesses = await prisma.business.findMany({ take: 4 });

    return res.json({ categories, businesses });
  } catch (error) {
    console.error('Error fetching data:', error);
    return res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.get('/search', async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    const businesses = await prisma.business.findMany();

    return res.json({ categories, businesses });
  } catch (error) {
    console.error('Error fetching data:', error);
    return res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
