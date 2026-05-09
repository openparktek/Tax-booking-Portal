import { Router, Response } from 'express';
import { prisma } from '../middleware/auth';

const router = Router();

// POST /api/kiosk/booking - Public endpoint for anonymous kiosk bookings
router.post('/booking', async (req, res: Response) => {
  try {
    const data = req.body;
    const id = `K-BK-${Date.now()}`;

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
        passengerPhone: data.phone || data.passengerPhone || null,
        passengerEmail: data.email || data.passengerEmail || null,
        customerId: null, // Anonymous
        companyName: "Kiosk Request",
        vehicleType: data.vehicleType || "Standard",
        pickupLocation: data.pickupLocation || "Terminal 1",
        dropoffLocation: data.dropoffLocation || null,
        scheduledTime: data.pickupTime ? new Date(data.pickupTime) : new Date(),
        pickupTime: data.pickupTime || null,
        fare: parseFloat(data.fare) || 0,
        status: (statusMap[data.status] || 'PENDING_ASSIGNMENT') as any,
        flightNumber: data.flightNumber || null,
        notes: "On-the-spot Kiosk Request",
      },
    });

    res.status(201).json({ success: true, data: booking });
  } catch (error: any) {
    console.error('Error creating kiosk booking:', error);
    res.status(500).json({ success: false, error: 'Failed to create request' });
  }
});

// GET /api/kiosk/booking/:id - Public endpoint to check status
router.get('/booking/:id', async (req, res: Response) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        passenger: true,
        status: true,
        pickupTime: true,
        fare: true,
        driverName: true,
        vehicleType: true,
      }
    });

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }

    res.json({ success: true, data: booking });
  } catch (error: any) {
    console.error('Error fetching kiosk booking:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch request status' });
  }
});

export default router;
