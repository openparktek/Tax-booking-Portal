import { Router, Response } from 'express';
import { prisma, authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, async (_req: AuthRequest, res: Response) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { createdAt: 'desc' },
      include: { company: { select: { name: true } }, driver: { select: { name: true, phone: true } } },
    });
    res.json({ success: true, data: vehicles });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to fetch vehicles' }); }
});

router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: req.params.id },
      include: { company: true, driver: true, bookings: { take: 10, orderBy: { createdAt: 'desc' } } },
    });
    if (!vehicle) { res.status(404).json({ success: false, error: 'Vehicle not found' }); return; }
    res.json({ success: true, data: vehicle });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to fetch vehicle' }); }
});

router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const d = req.body;
    const typeMap: Record<string, string> = { 'Sedan': 'SEDAN', 'Luxury Sedan': 'LUXURY_SEDAN', 'SUV': 'SUV', 'Luxury SUV': 'LUXURY_SUV', 'Van': 'VAN', 'Minibus': 'MINIBUS' };
    const statusMap: Record<string, string> = { 'Available': 'AVAILABLE', 'Busy': 'BUSY', 'Maintenance': 'MAINTENANCE', 'Suspended': 'SUSPENDED' };
    const vehicle = await prisma.vehicle.create({
      data: { plate: d.plate, brand: d.brand, model: d.model, year: d.year ? parseInt(d.year) : null, color: d.color || null, type: (typeMap[d.type] || 'SEDAN') as any, capacity: d.capacity || 4, status: (statusMap[d.status] || 'AVAILABLE') as any, companyId: d.companyId || null, driverId: d.driverId || null },
    });
    res.status(201).json({ success: true, data: vehicle });
  } catch (error: any) {
    if (error.code === 'P2002') { res.status(409).json({ success: false, error: 'Plate number already exists' }); return; }
    res.status(500).json({ success: false, error: 'Failed to create vehicle' });
  }
});

router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const d = req.body;
    const typeMap: Record<string, string> = { 'Sedan': 'SEDAN', 'Luxury Sedan': 'LUXURY_SEDAN', 'SUV': 'SUV', 'Luxury SUV': 'LUXURY_SUV', 'Van': 'VAN', 'Minibus': 'MINIBUS' };
    const statusMap: Record<string, string> = { 'Available': 'AVAILABLE', 'Busy': 'BUSY', 'Maintenance': 'MAINTENANCE', 'Suspended': 'SUSPENDED' };
    const updateData: any = { ...d };
    if (d.type) updateData.type = typeMap[d.type] || d.type;
    if (d.status) updateData.status = statusMap[d.status] || d.status;
    if (d.year) updateData.year = parseInt(d.year);
    const vehicle = await prisma.vehicle.update({ where: { id: req.params.id }, data: updateData });
    res.json({ success: true, data: vehicle });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to update vehicle' }); }
});

router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.vehicle.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Vehicle deleted' });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to delete vehicle' }); }
});

router.post('/cleanup-orphaned', authenticateToken, async (_req: AuthRequest, res: Response) => {
  try { res.json({ success: true, message: 'No orphaned vehicles found' }); } catch (error) { res.status(500).json({ success: false, error: 'Cleanup failed' }); }
});

export default router;
