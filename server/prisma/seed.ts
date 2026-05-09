import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding OpenPark Booking database...');

  // ── Roles ──
  const roles = [
    { name: 'Super Admin', description: 'Full system access', permissions: ['dashboard', 'bookings', 'trips', 'companies', 'drivers', 'fleet', 'fares', 'settlements', 'settings', 'users', 'audit', 'alerts'], isSystem: true },
    { name: 'Admin', description: 'Administrative access', permissions: ['dashboard', 'bookings', 'trips', 'companies', 'drivers', 'fleet', 'fares', 'settlements', 'settings', 'users', 'alerts'], isSystem: true },
    { name: 'Cashier', description: 'Cashier terminal access', permissions: ['dashboard', 'bookings'], isSystem: true },
    { name: 'Dispatcher', description: 'Dispatch and assignment access', permissions: ['dashboard', 'bookings', 'trips', 'drivers', 'fleet'], isSystem: true },
    { name: 'Customer', description: 'Customer booking access', permissions: ['bookings'], isSystem: true },
    { name: 'Kiosk', description: 'Self-service kiosk', permissions: ['bookings'], isSystem: true },
  ];

  const createdRoles: Record<string, string> = {};
  for (const role of roles) {
    const r = await prisma.role.upsert({
      where: { name: role.name },
      update: { permissions: role.permissions, description: role.description },
      create: role,
    });
    createdRoles[role.name] = r.id;
    console.log(`  ✓ Role: ${role.name} (${r.id})`);
  }

  // ── Admin User ──
  const adminHash = await bcrypt.hash('123456', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@openpark.hu' },
    update: {},
    create: {
      name: 'System Administrator',
      email: 'admin@openpark.hu',
      passwordHash: adminHash,
      roleId: createdRoles['Super Admin'],
      status: 'ACTIVE',
    },
  });
  console.log(`  ✓ Admin user: ${admin.email} (${admin.id})`);

  // ── Pickup Locations ──
  const locations = [
    { name: 'Terminal 1 - Arrival Hall A', terminal: 'Terminal 1', zone: 'A', active: true },
    { name: 'Terminal 1 - Arrival Hall B', terminal: 'Terminal 1', zone: 'B', active: true },
    { name: 'Terminal 2 - Arrival Hall C', terminal: 'Terminal 2', zone: 'C', active: true },
    { name: 'Terminal 3 - Arrival Hall D', terminal: 'Terminal 3', zone: 'D', active: true },
  ];

  for (const loc of locations) {
    const existing = await prisma.pickupLocation.findFirst({ where: { name: loc.name } });
    if (!existing) {
      await prisma.pickupLocation.create({ data: loc });
      console.log(`  ✓ Pickup Location: ${loc.name}`);
    }
  }

  // ── Sample Company ──
  const company = await prisma.company.upsert({
    where: { name: 'Elite Limo' },
    update: {},
    create: { name: 'Elite Limo', contactEmail: 'info@elitelimo.com', phone: '+20 100 123 4567', status: 'active', commissionRate: 15 },
  });
  console.log(`  ✓ Company: ${company.name}`);

  console.log('\n✅ Database seeded successfully!');
  console.log(`\n📧 Login credentials: admin@openpark.hu / 123456`);
}

main()
  .catch((e) => { console.error('❌ Seed error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
