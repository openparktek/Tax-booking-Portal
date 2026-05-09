import { Router, Response } from 'express';
import { prisma, authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, async (_req: AuthRequest, res: Response) => {
  try {
    const customers = await prisma.customer.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true, email: true, mobile: true, status: true, createdAt: true } });
    res.json({ success: true, data: customers });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to fetch customers' }); }
});

router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const customer = await prisma.customer.findUnique({ where: { id: req.params.id }, select: { id: true, name: true, email: true, mobile: true, status: true, createdAt: true, bookings: { take: 10, orderBy: { createdAt: 'desc' } } } });
    if (!customer) { res.status(404).json({ success: false, error: 'Customer not found' }); return; }
    res.json({ success: true, data: customer });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to fetch customer' }); }
});

export default router;
