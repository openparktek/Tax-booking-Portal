import { Router, Response } from 'express';
import { prisma, authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, async (_req: AuthRequest, res: Response) => {
  try {
    const settlements = await prisma.settlement.findMany({ orderBy: { createdAt: 'desc' }, include: { company: { select: { name: true } } } });
    res.json({ success: true, data: settlements });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to fetch settlements' }); }
});

router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const settlement = await prisma.settlement.findUnique({ where: { id: req.params.id }, include: { company: true } });
    if (!settlement) { res.status(404).json({ success: false, error: 'Settlement not found' }); return; }
    res.json({ success: true, data: settlement });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to fetch settlement' }); }
});

router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const d = req.body;
    const settlement = await prisma.settlement.create({
      data: { companyId: d.companyId, periodStart: new Date(d.periodStart), periodEnd: new Date(d.periodEnd), totalRevenue: d.totalRevenue || 0, totalTrips: d.totalTrips || 0, commission: d.commission || 0, netAmount: d.netAmount || 0, status: d.status || 'PENDING', notes: d.notes || null },
    });
    res.status(201).json({ success: true, data: settlement });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to create settlement' }); }
});

router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const settlement = await prisma.settlement.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, data: settlement });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to update settlement' }); }
});

export default router;
