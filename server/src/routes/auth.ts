import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma, authenticateToken, generateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password are required' });
      return;
    }

    // Check users table first
    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { role: true, company: true },
    });

    let isCustomer = false;

    if (user) {
      // Verify password
      const validPassword = await bcrypt.compare(password, user.passwordHash);
      if (!validPassword) {
        res.status(401).json({ success: false, error: 'Invalid email or password' });
        return;
      }

      if (user.status !== 'ACTIVE') {
        res.status(401).json({ success: false, error: user.status === 'PENDING' ? 'Please confirm your email before logging in' : 'Account is not active' });
        return;
      }

      const token = generateToken(
        { id: user.id, email: user.email, roleId: user.roleId },
        user.role.permissions
      );

      res.json({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            roleId: user.roleId,
            roleName: user.role.name,
            companyId: user.companyId,
            companyName: user.company?.name || null,
            status: user.status,
            permissions: user.role.permissions,
          },
        },
      });
      return;
    }

    // Check customers table
    const customer = await prisma.customer.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (customer) {
      const validPassword = await bcrypt.compare(password, customer.passwordHash);
      if (!validPassword) {
        res.status(401).json({ success: false, error: 'Invalid email or password' });
        return;
      }

      if (customer.status !== 'ACTIVE') {
        res.status(401).json({ success: false, error: customer.status === 'PENDING' ? 'Please confirm your email before logging in' : 'Account is not active' });
        return;
      }

      // Get customer role
      const customerRole = await prisma.role.findFirst({ where: { name: 'Customer' } });
      const permissions = customerRole?.permissions || ['bookings'];

      const token = generateToken(
        { id: customer.id, email: customer.email, roleId: customerRole?.id || 'customer' },
        permissions
      );

      res.json({
        success: true,
        data: {
          token,
          user: {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            roleId: customerRole?.id || 'customer',
            roleName: 'Customer',
            companyId: null,
            companyName: null,
            status: customer.status,
            permissions,
            isCustomer: true,
          },
        },
      });
      return;
    }

    res.status(401).json({ success: false, error: 'Invalid email or password' });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// POST /api/auth/register (customer self-registration)
router.post('/register', async (req, res: Response) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, error: 'Name, email, and password are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
      return;
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    const existingCustomer = await prisma.customer.findUnique({ where: { email: email.toLowerCase() } });

    if (existingUser || existingCustomer) {
      res.status(409).json({ success: false, error: 'Email already registered' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const customer = await prisma.customer.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        mobile: mobile || null,
        status: 'ACTIVE', // Auto-activate for now
      },
    });

    res.status(201).json({
      success: true,
      data: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
      },
      message: 'Registration successful!',
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

// GET /api/auth/me - Get current user from token
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }

    // Try users table first
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { role: true, company: true },
    });

    if (user) {
      res.json({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          roleId: user.roleId,
          roleName: user.role.name,
          companyId: user.companyId,
          companyName: user.company?.name || null,
          status: user.status,
          permissions: user.role.permissions,
        },
      });
      return;
    }

    // Try customers table
    const customer = await prisma.customer.findUnique({
      where: { id: req.user.userId },
    });

    if (customer) {
      const customerRole = await prisma.role.findFirst({ where: { name: 'Customer' } });
      res.json({
        success: true,
        data: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          roleId: customerRole?.id || 'customer',
          roleName: 'Customer',
          companyId: null,
          companyName: null,
          status: customer.status,
          permissions: customerRole?.permissions || ['bookings'],
          isCustomer: true,
        },
      });
      return;
    }

    res.status(404).json({ success: false, error: 'User not found' });
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, error: 'Failed to get user' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res: Response) => {
  try {
    const { email } = req.body;
    // In production, send reset email. For now, just acknowledge.
    res.json({ success: true, message: 'If an account exists with this email, password reset instructions have been sent.' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to process request' });
  }
});

export default router;
