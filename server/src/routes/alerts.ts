import { Router, Response } from 'express';
import { prisma, authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, async (_req: AuthRequest, res: Response) => {
  try {
    const alerts = await prisma.alert.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
    res.json({ success: true, data: alerts });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to fetch alerts' }); }
});

router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const alert = await prisma.alert.create({ data: req.body });
    res.status(201).json({ success: true, data: alert });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to create alert' }); }
});

router.put('/:id/resolve', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const alert = await prisma.alert.update({ where: { id: req.params.id }, data: { resolved: true, resolvedBy: req.user?.userId, resolvedAt: new Date() } });
    res.json({ success: true, data: alert });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to resolve alert' }); }
});

export default router;
