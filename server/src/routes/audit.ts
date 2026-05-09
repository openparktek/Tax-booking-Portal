import { Router, Response } from 'express';
import { prisma, authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '50' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({ skip, take, orderBy: { createdAt: 'desc' }, include: { user: { select: { name: true, email: true } } } }),
      prisma.auditLog.count(),
    ]);
    res.json({ success: true, data: logs, total });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to fetch audit logs' }); }
});

router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const log = await prisma.auditLog.create({ data: { ...req.body, userId: req.user?.userId } });
    res.status(201).json({ success: true, data: log });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to create audit log' }); }
});

export default router;
