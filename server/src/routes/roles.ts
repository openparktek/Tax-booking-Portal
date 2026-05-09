import { Router, Response } from 'express';
import { prisma, authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, async (_req: AuthRequest, res: Response) => {
  try {
    const roles = await prisma.role.findMany({ orderBy: { name: 'asc' } });
    res.json({ success: true, data: roles });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to fetch roles' }); }
});

router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const role = await prisma.role.findUnique({ where: { id: req.params.id } });
    if (!role) { res.status(404).json({ success: false, error: 'Role not found' }); return; }
    res.json({ success: true, data: role });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to fetch role' }); }
});

router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const role = await prisma.role.create({ data: req.body });
    res.status(201).json({ success: true, data: role });
  } catch (error: any) {
    if (error.code === 'P2002') { res.status(409).json({ success: false, error: 'Role name already exists' }); return; }
    res.status(500).json({ success: false, error: 'Failed to create role' });
  }
});

router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const role = await prisma.role.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, data: role });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to update role' }); }
});

router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const role = await prisma.role.findUnique({ where: { id: req.params.id } });
    if (role?.isSystem) { res.status(403).json({ success: false, error: 'Cannot delete system role' }); return; }
    await prisma.role.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Role deleted' });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to delete role' }); }
});

export default router;
