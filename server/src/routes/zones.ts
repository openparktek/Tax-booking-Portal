import { Router, Response } from 'express';
import { prisma, authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, async (_req: AuthRequest, res: Response) => {
  try {
    const zones = await prisma.zone.findMany({ orderBy: { name: 'asc' } });
    res.json({ success: true, data: zones });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to fetch zones' }); }
});

router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const zone = await prisma.zone.create({ data: req.body });
    res.status(201).json({ success: true, data: zone });
  } catch (error: any) {
    if (error.code === 'P2002') { res.status(409).json({ success: false, error: 'Zone name already exists' }); return; }
    res.status(500).json({ success: false, error: 'Failed to create zone' });
  }
});

router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const zone = await prisma.zone.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, data: zone });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to update zone' }); }
});

router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.zone.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Zone deleted' });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to delete zone' }); }
});

router.delete('/', authenticateToken, async (_req: AuthRequest, res: Response) => {
  try { await prisma.zone.deleteMany(); res.json({ success: true, message: 'All zones deleted' }); } catch (error) { res.status(500).json({ success: false, error: 'Failed to delete zones' }); }
});

export default router;
