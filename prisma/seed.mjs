// prisma/seed.mjs — Seed the database with initial data (ESM)
// Run with: npx prisma db seed

import { PrismaClient } from '../src/generated/prisma/client.ts';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ─── Helper functions ───────────────────────────────────────
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

// ─── Branches ───────────────────────────────────────────────
const branchesData = [
  { id: 'BR001', name: 'Power World Colombo', address: '45, Galle Road, Colombo 03', location: 'Colombo 03', phone: '+94 11 234 5678', email: 'colombo@powerworld.lk', manager: 'Ruwan Perera', openDate: '2018-03-15', status: 'active', isAC: true },
  { id: 'BR002', name: 'Power World Kandy', address: '12, Peradeniya Road, Kandy City', location: 'Kandy City', phone: '+94 81 234 5678', email: 'kandy@powerworld.lk', manager: 'Nuwan Silva', openDate: '2019-06-01', status: 'active', isAC: true },
  { id: 'BR003', name: 'Power World Negombo', address: '88, Beach Road, Negombo', location: 'Negombo Beach Road', phone: '+94 31 234 5678', email: 'negombo@powerworld.lk', manager: 'Kasun Fernando', openDate: '2020-01-10', status: 'active', isAC: false },
  { id: 'BR004', name: 'Power World Galle', address: '3, Wakwella Road, Galle Fort Area', location: 'Galle Fort Area', phone: '+94 91 234 5678', email: 'galle@powerworld.lk', manager: 'Dilshan Jayawardena', openDate: '2020-08-20', status: 'active', isAC: true },
  { id: 'BR005', name: 'Power World Rajagiriya', address: '22, Rajagiriya Junction, Rajagiriya', location: 'Rajagiriya', phone: '+94 11 345 6789', email: 'rajagiriya@powerworld.lk', manager: 'Chamara Bandara', openDate: '2021-02-14', status: 'active', isAC: true },
  { id: 'BR006', name: 'Power World Nugegoda', address: '56, High Level Road, Nugegoda Junction', location: 'Nugegoda Junction', phone: '+94 11 456 7890', email: 'nugegoda@powerworld.lk', manager: 'Tharanga Mendis', openDate: '2021-09-05', status: 'active', isAC: false },
  { id: 'BR007', name: 'Power World Wattala', address: '9, Negombo Road, Wattala', location: 'Wattala', phone: '+94 11 567 8901', email: 'wattala@powerworld.lk', manager: 'Lahiru Kumara', openDate: '2022-04-18', status: 'active', isAC: true },
  { id: 'BR008', name: 'Power World Maharagama', address: '34, High Level Road, Maharagama', location: 'Maharagama', phone: '+94 11 678 9012', email: 'maharagama@powerworld.lk', manager: 'Saman Wijesuriya', openDate: '2023-01-02', status: 'active', isAC: true },
];

// ─── Packages ───────────────────────────────────────────────
const packagesData = [
  { id: 'PKG001', name: 'Daily Pass', duration: 1, price: 500, type: 'daily', durationType: 'time-based', startTime: '06:00', endTime: '22:00', branchAccess: 'all', allowedBranches: [], status: 'active' },
  { id: 'PKG002', name: 'Monthly', duration: 30, price: 5000, type: 'monthly', durationType: 'time-based', startTime: '06:00', endTime: '22:00', branchAccess: 'all', allowedBranches: [], status: 'active' },
  { id: 'PKG003', name: '3-Month', duration: 90, price: 12000, type: 'quarterly', durationType: 'time-based', startTime: '06:00', endTime: '22:00', branchAccess: 'all', allowedBranches: [], status: 'active' },
  { id: 'PKG004', name: '6-Month', duration: 180, price: 22000, type: 'biannual', durationType: 'time-based', startTime: '06:00', endTime: '22:00', branchAccess: 'all', allowedBranches: [], status: 'active' },
  { id: 'PKG005', name: 'Annual', duration: 365, price: 40000, type: 'annual', durationType: 'time-based', startTime: '06:00', endTime: '22:00', branchAccess: 'all', allowedBranches: [], status: 'active' },
  { id: 'PKG006', name: 'Couple Monthly', duration: 30, price: 8000, type: 'monthly', durationType: 'time-based', startTime: '09:00', endTime: '17:00', branchAccess: 'purchase-branch', allowedBranches: [], status: 'active' },
  { id: 'PKG007', name: 'Full-Time AC Unlimited', duration: 365, price: 75000, type: 'premium', durationType: 'full-time', startTime: null, endTime: null, branchAccess: 'ac-only', allowedBranches: [], status: 'active' },
];

// ─── Members ────────────────────────────────────────────────
const firstNames = ['Ashan', 'Nimali', 'Kavindu', 'Tharushi', 'Dinesh', 'Sachini', 'Ravindu', 'Nethmi', 'Isuru', 'Hasini', 'Chamara', 'Dilini', 'Sahan', 'Iresha', 'Pasindu', 'Malsha', 'Thisara', 'Kavisha', 'Lahiru', 'Sanduni', 'Nimal', 'Kumari', 'Suresh', 'Anusha', 'Gayan', 'Manjula', 'Thilina', 'Udara', 'Rashmi', 'Dulanja', 'Ishara', 'Menaka', 'Chathura', 'Nilmini', 'Amila', 'Ruwan', 'Gayathri', 'Janith', 'Sewwandi', 'Buddhika', 'Nadeesha', 'Pradeep', 'Chathurika', 'Dasun', 'Hiruni', 'Sampath', 'Imalka', 'Dhanushka', 'Renuka', 'Shanaka'];
const lastNames = ['Perera', 'Silva', 'Fernando', 'Jayawardena', 'Bandara', 'Mendis', 'Kumara', 'Wijesuriya', 'Rathnayake', 'Wickramasinghe', 'Gunasekara', 'Samaraweera', 'Dissanayake', 'Amarasinghe', 'Herath', 'Karunaratne', 'Rajapaksa', 'Seneviratne', 'Weerasinghe', 'Liyanage'];
const genders = ['Male', 'Female'];
const statuses = ['active', 'active', 'active', 'active', 'expired', 'expired', 'pending'];

function generateMembersData() {
  const members = [];
  for (let i = 0; i < 55; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    const branchId = branchesData[i % branchesData.length].id;
    const pkg = packagesData[1 + Math.floor(Math.random() * 4)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const gender = genders[Math.floor(Math.random() * 2)];

    const joinDate = randomDate(new Date('2023-01-01'), new Date('2026-06-01'));
    const isExpired = status === 'expired';
    const startDate = isExpired
      ? randomDate(new Date('2024-01-01'), new Date('2025-06-01'))
      : randomDate(new Date('2025-10-01'), new Date('2026-06-01'));
    const endDate = isExpired
      ? randomDate(startDate, new Date('2026-06-15'))
      : new Date('2099-12-31');
    const actualStatus = endDate < new Date() ? 'expired' : status;

    // Use specific credential for MEM001 (Ashan Perera) so they can log in
    const email = i === 0 
      ? 'customer@powerworld.com'
      : `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i > 0 ? i : ''}@email.com`;
    const password = i === 0 ? 'customer123' : 'customer123';

    members.push({
      id: `MEM${String(i + 1).padStart(3, '0')}`,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      email,
      password,
      phone: `+94 7${Math.floor(Math.random() * 9)}${Math.floor(1000000 + Math.random() * 9000000)}`,
      gender,
      dateOfBirth: formatDate(randomDate(new Date('1985-01-01'), new Date('2005-01-01'))),
      address: `${Math.floor(1 + Math.random() * 200)}, Main Street, ${branchesData.find(b => b.id === branchId).location}`,
      branchId,
      packageId: pkg.id,
      packageName: pkg.name,
      membershipStart: formatDate(startDate),
      membershipEnd: formatDate(endDate),
      status: actualStatus,
      joinDate: formatDate(joinDate),
      emergencyContact: `+94 7${Math.floor(Math.random() * 9)}${Math.floor(1000000 + Math.random() * 9000000)}`,
      notes: '',
    });
  }
  return members;
}

// ─── Staff & Trainers ───────────────────────────────────────
const staffRoles = ['Manager', 'Trainer', 'Receptionist', 'Trainer', 'Trainer', 'Cleaner', 'Trainer', 'Receptionist'];
const staffFirstNames = ['Ruwan', 'Nuwan', 'Kasun', 'Dilshan', 'Chamara', 'Tharanga', 'Lahiru', 'Saman', 'Priyantha', 'Anura', 'Malini', 'Shanika', 'Roshan', 'Nadeesha', 'Indunil', 'Samitha', 'Kumari', 'Ranjith', 'Priyanka', 'Harsha', 'Sandya', 'Chathura', 'Nishani', 'Upul'];
const staffLastNames = ['Perera', 'Silva', 'Fernando', 'Jayawardena', 'Bandara', 'Mendis', 'Kumara', 'Wijesuriya', 'De Mel', 'Gunawardena', 'Weerakkody', 'Pathirana'];

function generateStaffAndTrainersData() {
  const staff = [];
  const trainers = [];
  
  for (let i = 0; i < 24; i++) {
    const firstName = staffFirstNames[i % staffFirstNames.length];
    const lastName = staffLastNames[i % staffLastNames.length];
    const branchId = branchesData[i % branchesData.length].id;
    const role = staffRoles[i % staffRoles.length];

    // Dilshan Jayawardena (STF004) -> ensure they are mapped as trainer@powerworld.com / trainer123
    const isDilshan = (i === 3); 
    const email = isDilshan
      ? 'trainer@powerworld.com'
      : `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i > 0 ? i : ''}@powerworld.lk`;
    const password = 'trainer123';

    const record = {
      id: isDilshan ? 'STF004' : `STF${String(i + 1).padStart(3, '0')}`,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      email,
      phone: `+94 7${Math.floor(Math.random() * 9)}${Math.floor(1000000 + Math.random() * 9000000)}`,
      role,
      branchId,
      joinDate: formatDate(randomDate(new Date('2020-01-01'), new Date('2025-12-01'))),
      salary: role === 'Manager' ? 120000 : role === 'Trainer' ? 80000 : role === 'Receptionist' ? 50000 : 35000,
      status: Math.random() > 0.1 ? 'active' : 'inactive',
    };

    if (role === 'Trainer') {
      trainers.push({
        ...record,
        password,
      });
    } else {
      staff.push(record);
    }
  }
  return { staff, trainers };
}

// ─── Payments ───────────────────────────────────────────────
function generatePaymentsData(members) {
  const payments = [];
  const methods = ['Cash', 'Card', 'Bank Transfer', 'Card', 'Cash', 'Card'];
  let paymentIndex = 0;

  members.forEach(member => {
    const pkg = packagesData.find(p => p.id === member.packageId);
    if (!pkg) return;

    const paymentDate = randomDate(new Date('2026-01-01'), new Date('2026-06-25'));
    payments.push({
      id: `PAY${String(++paymentIndex).padStart(4, '0')}`,
      memberId: member.id,
      memberName: member.fullName,
      branchId: member.branchId,
      amount: pkg.price,
      packageId: pkg.id,
      packageName: pkg.name,
      method: methods[Math.floor(Math.random() * methods.length)],
      date: formatDate(paymentDate),
      status: 'completed',
      receiptNo: `RCP-${String(paymentIndex).padStart(5, '0')}`,
    });

    if (Math.random() > 0.5) {
      const prevDate = randomDate(new Date('2025-06-01'), new Date('2025-12-31'));
      payments.push({
        id: `PAY${String(++paymentIndex).padStart(4, '0')}`,
        memberId: member.id,
        memberName: member.fullName,
        branchId: member.branchId,
        amount: pkg.price,
        packageId: pkg.id,
        packageName: pkg.name,
        method: methods[Math.floor(Math.random() * methods.length)],
        date: formatDate(prevDate),
        status: 'completed',
        receiptNo: `RCP-${String(paymentIndex).padStart(5, '0')}`,
      });
    }
  });

  return payments;
}

// ─── Users (only Admin, Manager, non-Trainer Staff) ─────────
const usersData = [
  { id: 'USR001', name: 'Admin User', email: 'admin@powerworld.com', password: 'admin123', role: 'Admin', branchId: null, staffId: null },
  { id: 'USR002', name: 'Ruwan Perera', email: 'manager@powerworld.com', password: 'manager123', role: 'Manager', branchId: 'BR001', staffId: 'STF001' },
  { id: 'USR003', name: 'Kasun Fernando', email: 'staff@powerworld.com', password: 'staff123', role: 'Staff', branchId: 'BR001', staffId: 'STF003' },
];


// ─── MAIN SEED ──────────────────────────────────────────────
async function main() {
  console.log('🌱 Starting database seed...');

  // Clear tables in reverse dependency order
  await prisma.payment.deleteMany();
  await prisma.user.deleteMany();
  await prisma.member.deleteMany();
  await prisma.trainer.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.package.deleteMany();
  await prisma.branch.deleteMany();

  console.log('  ✓ Cleared existing data');

  // Seed branches
  for (const b of branchesData) {
    await prisma.branch.create({ data: b });
  }
  console.log(`  ✓ Seeded ${branchesData.length} branches`);

  // Seed packages
  for (const p of packagesData) {
    await prisma.package.create({ data: p });
  }
  console.log(`  ✓ Seeded ${packagesData.length} packages`);

  // Seed members
  const membersData = generateMembersData();
  for (const m of membersData) {
    await prisma.member.create({ data: m });
  }
  console.log(`  ✓ Seeded ${membersData.length} members`);

  // Seed staff & trainers separately
  const { staff, trainers } = generateStaffAndTrainersData();
  
  for (const s of staff) {
    await prisma.staff.create({ data: s });
  }
  console.log(`  ✓ Seeded ${staff.length} general staff members`);

  for (const t of trainers) {
    await prisma.trainer.create({ data: t });
  }
  console.log(`  ✓ Seeded ${trainers.length} trainers`);

  // Seed payments
  const paymentsData = generatePaymentsData(membersData);
  for (const p of paymentsData) {
    await prisma.payment.create({ data: p });
  }
  console.log(`  ✓ Seeded ${paymentsData.length} payments`);

  // Seed users (Admin, Manager, non-Trainer Staff)
  for (const u of usersData) {
    await prisma.user.create({ data: u });
  }
  console.log(`  ✓ Seeded ${usersData.length} system user accounts`);

  console.log('🎉 Database seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
