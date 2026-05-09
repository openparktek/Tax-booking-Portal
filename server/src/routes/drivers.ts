import { Router, Response } from 'express';
import { prisma, authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, async (_req: AuthRequest, res: Response) => {
  try {
    const drivers = await prisma.driver.findMany({
      orderBy: { name: 'asc' },
      include: { company: { select: { name: true } }, vehicles: { select: { plate: true, brand: true, model: true } } },
    });
    res.json({ success: true, data: drivers });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to fetch drivers' }); }
});

router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const driver = await prisma.driver.findUnique({
      where: { id: req.params.id },
      include: { company: true, vehicles: true, bookings: { take: 10, orderBy: { createdAt: 'desc' } }, _count: { select: { trips: true, bookings: true } } },
    });
    if (!driver) { res.status(404).json({ success: false, error: 'Driver not found' }); return; }
    res.json({ success: true, data: driver });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to fetch driver' }); }
});

router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const d = req.body;
    const driver = await prisma.driver.create({
      data: { name: d.name, phone: d.phone, email: d.email || null, licenseNumber: d.licenseNumber || null, licenseExpiry: d.licenseExpiry ? new Date(d.licenseExpiry) : null, companyId: d.companyId || null, status: d.status || 'active', rating: d.rating || 5.0 },
    });
    res.status(201).json({ success: true, data: driver });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to create driver' }); }
});

router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const data: any = { ...req.body };
    if (data.licenseExpiry) data.licenseExpiry = new Date(data.licenseExpiry);
    const driver = await prisma.driver.update({ where: { id: req.params.id }, data });
    res.json({ success: true, data: driver });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to update driver' }); }
});

router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.driver.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Driver deleted' });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to delete driver' }); }
});

router.delete('/', authenticateToken, async (_req: AuthRequest, res: Response) => {
  try {
    await prisma.driver.deleteMany();
    res.json({ success: true, message: 'All drivers deleted' });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to delete drivers' }); }
});

export default router;
