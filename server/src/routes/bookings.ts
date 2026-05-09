import { Router, Response } from 'express';
import { prisma, authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/bookings
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '50', status, company, search, date } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = {};

    // Customer-scoped filtering
    const isCustomer = req.user?.permissions?.length === 1 && req.user.permissions.includes('bookings');
    if (isCustomer) {
      where.customerId = req.user!.userId;
    }

    if (status && status !== 'all') {
      where.status = status as string;
    }

    if (company && company !== 'all') {
      where.companyName = company as string;
    }

    if (search) {
      where.OR = [
        { id: { contains: search as string, mode: 'insensitive' } },
        { passenger: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (date) {
      const dateStr = date as string;
      const startOfDay = new Date(dateStr);
      const endOfDay = new Date(dateStr);
      endOfDay.setDate(endOfDay.getDate() + 1);
      where.scheduledTime = { gte: startOfDay, lt: endOfDay };
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          company: { select: { name: true } },
          driver: { select: { name: true, phone: true } },
          vehicle: { select: { plate: true, brand: true, model: true } },
          pickupLoc: { select: { name: true, terminal: true } },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    // Map to frontend format
    const data = bookings.map(b => ({
      id: b.id,
      passenger: b.passenger,
      passengerPhone: b.passengerPhone,
      passengerEmail: b.passengerEmail,
      customerId: b.customerId,
      customerEmail: b.passengerEmail,
      company: b.companyName || b.company?.name || '',
      companyId: b.companyId,
      driver: b.driverName || b.driver?.name || 'Unassigned',
      driverId: b.driverId,
      vehicleType: b.vehicleType || '',
      vehiclePlate: b.vehicle?.plate || '',
      vehicleBrand: b.vehicle?.brand || '',
      vehicleModel: b.vehicle?.model || '',
      pickupLocation: b.pickupLocation || b.pickupLoc?.name || '',
      dropoffLocation: b.dropoffLocation || '',
      pickupTime: b.pickupTime || (b.scheduledTime ? new Date(b.scheduledTime).toLocaleTimeString() : ''),
      scheduledTime: b.scheduledTime,
      fare: b.fare,
      status: b.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).replace('At ', 'at '),
      flightNumber: b.flightNumber,
      notes: b.notes,
      qrCode: b.qrCode,
      createdAt: b.createdAt,
    }));

    res.json({ success: true, data, total, page: parseInt(page as string), limit: take });
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch bookings' });
  }
});

// GET /api/bookings/:id
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: {
        company: true,
        driver: true,
        vehicle: true,
        pickupLoc: true,
        customer: { select: { name: true, email: true, mobile: true } },
      },
    });

    if (!booking) {
      res.status(404).json({ success: false, error: 'Booking not found' });
      return;
    }

    res.json({ success: true, data: booking });
  } catch (error: any) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch booking' });
  }
});

// POST /api/bookings
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;
    const id = `BK-${Date.now()}`;

    // Map frontend status string to enum
    const statusMap: Record<string, string> = {
      'Pending': 'PENDING',
      'Pending Assignment': 'PENDING_ASSIGNMENT',
      'Confirmed at Airport': 'CONFIRMED_AT_AIRPORT',
      'Confirmed': 'CONFIRMED',
      'In Progress': 'IN_PROGRESS',
      'Completed': 'COMPLETED',
      'Cancelled': 'CANCELLED',
    };

    const booking = await prisma.booking.create({
      data: {
        id,
        passenger: data.passenger,
        passengerPhone: data.passengerPhone || null,
        passengerEmail: data.passengerEmail || data.customerEmail || null,
        customerId: data.customerId || null,
        companyId: data.companyId || null,
        companyName: data.company || null,
        driverId: data.driverId || null,
        driverName: data.driver || null,
        vehicleId: data.vehicleId || null,
        vehicleType: data.vehicleType || null,
        pickupLocationId: data.pickupLocationId || null,
        pickupLocation: data.pickupLocation || null,
        dropoffLocation: data.dropoffLocation || null,
        scheduledTime: data.scheduledTime ? new Date(data.scheduledTime) : null,
        pickupTime: data.pickupTime || null,
        fare: parseFloat(data.fare) || 0,
        status: (statusMap[data.status] || 'PENDING_ASSIGNMENT') as any,
        flightNumber: data.flightNumber || null,
        notes: data.notes || null,
      },
    });

    res.status(201).json({ success: true, data: { ...booking, id: booking.id } });
  } catch (error: any) {
    console.error('Error creating booking:', error);
    res.status(500).json({ success: false, error: 'Failed to create booking' });
  }
});

// PUT /api/bookings/:id
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;

    const statusMap: Record<string, string> = {
      'Pending': 'PENDING',
      'Pending Assignment': 'PENDING_ASSIGNMENT',
      'Confirmed at Airport': 'CONFIRMED_AT_AIRPORT',
      'Confirmed': 'CONFIRMED',
      'In Progress': 'IN_PROGRESS',
      'Completed': 'COMPLETED',
      'Cancelled': 'CANCELLED',
    };

    const updateData: any = {};
    if (data.passenger !== undefined) updateData.passenger = data.passenger;
    if (data.passengerPhone !== undefined) updateData.passengerPhone = data.passengerPhone;
    if (data.passengerEmail !== undefined) updateData.passengerEmail = data.passengerEmail;
    if (data.company !== undefined) updateData.companyName = data.company;
    if (data.companyId !== undefined) updateData.companyId = data.companyId;
    if (data.driver !== undefined) updateData.driverName = data.driver;
    if (data.driverId !== undefined) updateData.driverId = data.driverId;
    if (data.vehicleId !== undefined) updateData.vehicleId = data.vehicleId;
    if (data.vehicleType !== undefined) updateData.vehicleType = data.vehicleType;
    if (data.pickupLocation !== undefined) updateData.pickupLocation = data.pickupLocation;
    if (data.dropoffLocation !== undefined) updateData.dropoffLocation = data.dropoffLocation;
    if (data.pickupTime !== undefined) updateData.pickupTime = data.pickupTime;
    if (data.scheduledTime !== undefined) updateData.scheduledTime = new Date(data.scheduledTime);
    if (data.fare !== undefined) updateData.fare = parseFloat(data.fare);
    if (data.status !== undefined) updateData.status = statusMap[data.status] || data.status;
    if (data.flightNumber !== undefined) updateData.flightNumber = data.flightNumber;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({ success: true, data: booking });
  } catch (error: any) {
    console.error('Error updating booking:', error);
    res.status(500).json({ success: false, error: 'Failed to update booking' });
  }
});

// DELETE /api/bookings/:id
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.booking.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Booking deleted' });
  } catch (error: any) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ success: false, error: 'Failed to delete booking' });
  }
});

export default router;
