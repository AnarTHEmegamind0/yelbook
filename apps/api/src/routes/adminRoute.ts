import express from 'express';
import prisma from '../lib/prisma';

const adminRouter = express.Router();

adminRouter.get('/dashboard', async (req, res) => {
  try {
    const businesses = await prisma.business.findMany();
    const categories = await prisma.category.findMany();
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true },
    });
    return res.json({
      users,
      businessCount: businesses.length,
      categoryCount: categories.length,
    });
  } catch (error) {
    console.error('/dashboard :', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// get all businesses
adminRouter.get('/businesses', async (req, res) => {
  try {
    const businesses = await prisma.business.findMany();
    return res.json({ businesses });
  } catch (error) {
    console.error('/admin/businesses error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// get single business by id
adminRouter.get('/businesses/:id', async (req, res) => {
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
    console.error('/admin/businesses/:id error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.post('/businesses', async (req, res) => {
  try {
    const {
      name,
      categoryId,
      description,
      address,
      phone,
      email,
      website,
      googleMapUrl,
      facebookUrl,
      instagramUrl,
      timetable,
    } = req.body;

    if (!name || !categoryId || !description || !address || !phone || !email) {
      return res
        .status(400)
        .json({ error: 'Шаардлагатай талбаруудыг бөглөнө үү' });
    }

    const business = await prisma.business.create({
      data: {
        name,
        categoryId,
        description,
        address,
        phone,
        email,
        website,
        googleMapUrl,
        facebookUrl,
        instagramUrl,
        timetable,
      },
    });

    return res.status(201).json({ business });
  } catch (error) {
    console.error('/admin/businesses POST error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.put('/businesses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      categoryId,
      description,
      address,
      phone,
      email,
      website,
      googleMapUrl,
      facebookUrl,
      instagramUrl,
      timetable,
    } = req.body;

    const business = await prisma.business.update({
      where: { id },
      data: {
        name,
        categoryId,
        description,
        address,
        phone,
        email,
        website,
        googleMapUrl,
        facebookUrl,
        instagramUrl,
        timetable,
      },
    });

    return res.json({ business });
  } catch (error) {
    console.error('/admin/businesses PUT error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.delete('/businesses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.business.delete({
      where: { id },
    });
    return res.json({ message: 'Business deleted successfully' });
  } catch (error) {
    console.error('/admin/businesses DELETE error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    return res.json({ categories });
  } catch (error) {
    console.error('/admin/categories error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.post('/categories', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const category = await prisma.category.create({
      data: {
        name,
      },
    });
    return res.status(201).json({ category });
  } catch (error) {
    console.error('/admin/categories POST error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.put('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const category = await prisma.category.update({
      where: { id },
      data: { name },
    });
    return res.json({ category });
  } catch (error) {
    console.error('/admin/categories PUT error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.delete('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({
      where: { id },
    });
    return res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('/admin/categories DELETE error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// get dashboard stats
adminRouter.get('/dashboard', async (req, res) => {
  try {
    const [businessCount, categoryCount, users] = await Promise.all([
      prisma.business.count(),
      prisma.category.count(),
      prisma.user.findMany({ select: { id: true, email: true, name: true } }),
    ]);

    return res.json({ businessCount, categoryCount, users });
  } catch (error) {
    console.error('/admin/dashboard error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default adminRouter;
