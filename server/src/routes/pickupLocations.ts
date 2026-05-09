import { Router, Response } from 'express';
import { prisma, authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', async (_req, res: Response) => {
  try {
    const locations = await prisma.pickupLocation.findMany({ orderBy: { name: 'asc' } });
    res.json({ success: true, locations, data: locations });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to fetch pickup locations' }); }
});

router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const location = await prisma.pickupLocation.create({ data: req.body });
    res.status(201).json({ success: true, data: location });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to create pickup location' }); }
});

router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const location = await prisma.pickupLocation.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, data: location });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to update pickup location' }); }
});

router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.pickupLocation.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Pickup location deleted' });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to delete pickup location' }); }
});

export default router;
