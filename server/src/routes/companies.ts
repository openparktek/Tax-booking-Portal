import { Router, Response } from 'express';
import { prisma, authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/companies
router.get('/', authenticateToken, async (_req: AuthRequest, res: Response) => {
  try {
    const companies = await prisma.company.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { drivers: true, vehicles: true, bookings: true } },
      },
    });
    res.json({ success: true, data: companies });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch companies' });
  }
});

// GET /api/companies/:id
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const company = await prisma.company.findUnique({
      where: { id: req.params.id },
      include: {
        drivers: true,
        vehicles: true,
        _count: { select: { bookings: true, settlements: true } },
      },
    });
    if (!company) {
      res.status(404).json({ success: false, error: 'Company not found' });
      return;
    }
    res.json({ success: true, data: company });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch company' });
  }
});

// POST /api/companies
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const company = await prisma.company.create({ data: req.body });
    res.status(201).json({ success: true, data: company });
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ success: false, error: 'Company name already exists' });
      return;
    }
    res.status(500).json({ success: false, error: 'Failed to create company' });
  }
});

// PUT /api/companies/:id
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const company = await prisma.company.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: company });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update company' });
  }
});

// DELETE /api/companies/:id
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.company.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Company deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete company' });
  }
});

export default router;
