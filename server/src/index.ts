import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import authRoutes from './routes/auth';
import bookingsRoutes from './routes/bookings';
import companiesRoutes from './routes/companies';
import driversRoutes from './routes/drivers';
import vehiclesRoutes from './routes/vehicles';
import zonesRoutes from './routes/zones';
import usersRoutes from './routes/users';
import rolesRoutes from './routes/roles';
import pickupLocationsRoutes from './routes/pickupLocations';
import settlementsRoutes from './routes/settlements';
import analyticsRoutes from './routes/analytics';
import alertsRoutes from './routes/alerts';
import auditRoutes from './routes/audit';
import customersRoutes from './routes/customers';
import tripsRoutes from './routes/trips';
import kioskRoutes from './routes/kiosk';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/drivers', driversRoutes);
app.use('/api/vehicles', vehiclesRoutes);
app.use('/api/zones', zonesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/pickup-locations', pickupLocationsRoutes);
app.use('/api/settlements', settlementsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/trips', tripsRoutes);
app.use('/api/kiosk', kioskRoutes);

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 OpenPark Booking API running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
});

export default app;
