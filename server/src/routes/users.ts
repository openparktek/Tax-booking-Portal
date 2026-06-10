import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma, authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, async (_req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, email: true, roleId: true, companyId: true, status: true, phone: true, createdAt: true, role: { select: { name: true } }, company: { select: { name: true } } },
    });
    res.json({ success: true, data: users });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to fetch users' }); }
});

router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true, name: true, email: true, roleId: true, companyId: true, status: true, phone: true, createdAt: true, role: { select: { name: true, permissions: true } }, company: { select: { name: true } } },
    });
    if (!user) { res.status(404).json({ success: false, error: 'User not found' }); return; }
    res.json({ success: true, data: user });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to fetch user' }); }
});

router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const d = req.body;
    if (!d.email || !d.password || !d.name || !d.roleId) { res.status(400).json({ success: false, error: 'Name, email, password, and role are required' }); return; }
    const passwordHash = await bcrypt.hash(d.password, 12);
    const user = await prisma.user.create({
      data: { name: d.name, email: d.email.toLowerCase(), passwordHash, roleId: d.roleId, companyId: d.companyId || null, status: ((d.status || 'ACTIVE').toUpperCase()) as any, phone: d.phone || null },
      select: { id: true, name: true, email: true, roleId: true, companyId: true, status: true },
    });
    res.status(201).json({ success: true, data: user });
  } catch (error: any) {
    if (error.code === 'P2002') { res.status(409).json({ success: false, error: 'Email already exists' }); return; }
    res.status(500).json({ success: false, error: 'Failed to create user' });
  }
});

router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const d = req.body;
    const updateData: any = {};
    if (d.name) updateData.name = d.name;
    if (d.email) updateData.email = d.email.toLowerCase();
    if (d.roleId) updateData.roleId = d.roleId;
    if (d.companyId !== undefined) updateData.companyId = d.companyId || null;
    if (d.status) updateData.status = d.status.toUpperCase();
    if (d.phone !== undefined) updateData.phone = d.phone;
    if (d.password) updateData.passwordHash = await bcrypt.hash(d.password, 12);
    const user = await prisma.user.update({ where: { id: req.params.id }, data: updateData, select: { id: true, name: true, email: true, roleId: true, companyId: true, status: true } });
    res.json({ success: true, data: user });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to update user' }); }
});

router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'User deleted' });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed to delete user' }); }
});

// POST /api/users/init-admin — Kept for compatibility, now a no-op (seed handles this)
router.post('/init-admin', async (_req, res: Response) => {
  res.json({ success: true, data: null, message: 'Admin initialization handled by seed' });
});

export default router;
