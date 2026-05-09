import { Router, Response } from 'express';
import { prisma, authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/dashboard', authenticateToken, async (_req: AuthRequest, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalTripsToday, activeTrips, totalVehicles, availableVehicles, revenueResult] = await Promise.all([
      prisma.booking.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
      prisma.booking.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.vehicle.count(),
      prisma.vehicle.count({ where: { status: 'AVAILABLE' } }),
      prisma.booking.aggregate({ where: { createdAt: { gte: today, lt: tomorrow }, status: { in: ['COMPLETED', 'IN_PROGRESS'] } }, _sum: { fare: true } }),
    ]);

    const fleetUtilization = totalVehicles > 0 ? Math.round(((totalVehicles - availableVehicles) / totalVehicles) * 100) : 0;

    res.json({
      success: true,
      data: { totalTripsToday, activeTrips, fleetUtilization, revenueToday: revenueResult._sum.fare || 0, totalVehicles, availableVehicles },
    });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to fetch analytics' }); }
});

export default router;
