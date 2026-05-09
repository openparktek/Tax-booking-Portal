import { Router, Response } from 'express';
import { prisma, authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/live', authenticateToken, async (_req: AuthRequest, res: Response) => {
  try {
    const trips = await prisma.trip.findMany({
      where: { status: { in: ['STARTED', 'IN_PROGRESS'] } },
      orderBy: { startTime: 'desc' },
      include: { booking: { select: { passenger: true, pickupLocation: true, dropoffLocation: true } }, driver: { select: { name: true, phone: true } }, vehicle: { select: { plate: true, brand: true, model: true } } },
    });
    res.json({ success: true, data: trips });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to fetch live trips' }); }
});

router.get('/', authenticateToken, async (_req: AuthRequest, res: Response) => {
  try {
    const trips = await prisma.trip.findMany({ orderBy: { createdAt: 'desc' }, take: 100, include: { booking: true, driver: { select: { name: true } }, vehicle: { select: { plate: true } } } });
    res.json({ success: true, data: trips });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to fetch trips' }); }
});

router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const trip = await prisma.trip.create({ data: req.body });
    res.status(201).json({ success: true, data: trip });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to create trip' }); }
});

router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const trip = await prisma.trip.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, data: trip });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to update trip' }); }
});

export default router;
