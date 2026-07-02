// ============================================
// POWER WORLD ERP — Mock Data
// ============================================

// --- Branches ---
export const branches = [
  { id: 'BR001', name: 'Power World Colombo', address: '45, Galle Road, Colombo 03', location: 'Colombo 03', phone: '+94 11 234 5678', email: 'colombo@powerworld.lk', manager: 'Ruwan Perera', openDate: '2018-03-15', status: 'active', isAC: true, googleMapsLink: null, image: null },
  { id: 'BR002', name: 'Power World Kandy', address: '12, Peradeniya Road, Kandy City', location: 'Kandy City', phone: '+94 81 234 5678', email: 'kandy@powerworld.lk', manager: 'Nuwan Silva', openDate: '2019-06-01', status: 'active', isAC: true, googleMapsLink: null, image: null },
  { id: 'BR003', name: 'Power World Negombo', address: '88, Beach Road, Negombo', location: 'Negombo Beach Road', phone: '+94 31 234 5678', email: 'negombo@powerworld.lk', manager: 'Kasun Fernando', openDate: '2020-01-10', status: 'active', isAC: false, googleMapsLink: null, image: null },
  { id: 'BR004', name: 'Power World Galle', address: '3, Wakwella Road, Galle Fort Area', location: 'Galle Fort Area', phone: '+94 91 234 5678', email: 'galle@powerworld.lk', manager: 'Dilshan Jayawardena', openDate: '2020-08-20', status: 'active', isAC: true, googleMapsLink: null, image: null },
  { id: 'BR005', name: 'Power World Rajagiriya', address: '22, Rajagiriya Junction, Rajagiriya', location: 'Rajagiriya', phone: '+94 11 345 6789', email: 'rajagiriya@powerworld.lk', manager: 'Chamara Bandara', openDate: '2021-02-14', status: 'active', isAC: true, googleMapsLink: null, image: null },
  { id: 'BR006', name: 'Power World Nugegoda', address: '56, High Level Road, Nugegoda Junction', location: 'Nugegoda Junction', phone: '+94 11 456 7890', email: 'nugegoda@powerworld.lk', manager: 'Tharanga Mendis', openDate: '2021-09-05', status: 'active', isAC: false, googleMapsLink: null, image: null },
  { id: 'BR007', name: 'Power World Wattala', address: '9, Negombo Road, Wattala', location: 'Wattala', phone: '+94 11 567 8901', email: 'wattala@powerworld.lk', manager: 'Lahiru Kumara', openDate: '2022-04-18', status: 'active', isAC: true, googleMapsLink: null, image: null },
  { id: 'BR008', name: 'Power World Maharagama', address: '34, High Level Road, Maharagama', location: 'Maharagama', phone: '+94 11 678 9012', email: 'maharagama@powerworld.lk', manager: 'Saman Wijesuriya', openDate: '2023-01-02', status: 'active', isAC: true, googleMapsLink: null, image: null },
];

// --- Membership Packages ---
export const packages = [
  { id: 'PKG001', name: 'Daily Pass', duration: null, price: 500, type: 'daily', durationType: 'time-based', startTime: '06:00', endTime: '22:00', branchAccess: 'all', allowedBranches: [], status: 'active' },
  { id: 'PKG002', name: 'Monthly', duration: null, price: 5000, type: 'monthly', durationType: 'time-based', startTime: '06:00', endTime: '22:00', branchAccess: 'all', allowedBranches: [], status: 'active' },
  { id: 'PKG003', name: '3-Month', duration: null, price: 12000, type: 'quarterly', durationType: 'time-based', startTime: '06:00', endTime: '22:00', branchAccess: 'all', allowedBranches: [], status: 'active' },
  { id: 'PKG004', name: '6-Month', duration: null, price: 22000, type: 'biannual', durationType: 'time-based', startTime: '06:00', endTime: '22:00', branchAccess: 'all', allowedBranches: [], status: 'active' },
  { id: 'PKG005', name: 'Annual', duration: null, price: 40000, type: 'annual', durationType: 'time-based', startTime: '06:00', endTime: '22:00', branchAccess: 'all', allowedBranches: [], status: 'active' },
  { id: 'PKG006', name: 'Couple Monthly', duration: null, price: 8000, type: 'monthly', durationType: 'time-based', startTime: '09:00', endTime: '17:00', branchAccess: 'purchase-branch', allowedBranches: [], status: 'active' },
  { id: 'PKG007', name: 'Full-Time AC Unlimited', duration: null, price: 75000, type: 'premium', durationType: 'full-time', startTime: null, endTime: null, branchAccess: 'ac-only', allowedBranches: [], status: 'active' },
];

// Helper to generate dates
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// --- Members ---
const firstNames = ['Ashan', 'Nimali', 'Kavindu', 'Tharushi', 'Dinesh', 'Sachini', 'Ravindu', 'Nethmi', 'Isuru', 'Hasini', 'Chamara', 'Dilini', 'Sahan', 'Iresha', 'Pasindu', 'Malsha', 'Thisara', 'Kavisha', 'Lahiru', 'Sanduni', 'Nimal', 'Kumari', 'Suresh', 'Anusha', 'Gayan', 'Manjula', 'Thilina', 'Udara', 'Rashmi', 'Dulanja', 'Ishara', 'Menaka', 'Chathura', 'Nilmini', 'Amila', 'Ruwan', 'Gayathri', 'Janith', 'Sewwandi', 'Buddhika', 'Nadeesha', 'Pradeep', 'Chathurika', 'Dasun', 'Hiruni', 'Sampath', 'Imalka', 'Dhanushka', 'Renuka', 'Shanaka'];
const lastNames = ['Perera', 'Silva', 'Fernando', 'Jayawardena', 'Bandara', 'Mendis', 'Kumara', 'Wijesuriya', 'Rathnayake', 'Wickramasinghe', 'Gunasekara', 'Samaraweera', 'Dissanayake', 'Amarasinghe', 'Herath', 'Karunaratne', 'Rajapaksa', 'Seneviratne', 'Weerasinghe', 'Liyanage'];

function generateMembers() {
  const members = [];
  const statuses = ['active', 'active', 'active', 'active', 'expired', 'expired', 'pending'];
  const genders = ['Male', 'Female'];

  for (let i = 0; i < 55; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    const branchId = branches[i % branches.length].id;
    const pkg = packages[1 + Math.floor(Math.random() * 4)]; // Exclude daily pass for members
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

    members.push({
      id: `MEM${String(i + 1).padStart(3, '0')}`,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
      phone: `+94 7${Math.floor(Math.random() * 9)}${Math.floor(1000000 + Math.random() * 9000000)}`,
      gender,
      dateOfBirth: formatDate(randomDate(new Date('1985-01-01'), new Date('2005-01-01'))),
      address: `${Math.floor(1 + Math.random() * 200)}, Main Street, ${branches.find(b => b.id === branchId).location}`,
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

// --- Staff ---
const staffRoles = ['Manager', 'Trainer', 'Receptionist', 'Trainer', 'Trainer', 'Cleaner', 'Trainer', 'Receptionist'];
const staffFirstNames = ['Ruwan', 'Nuwan', 'Kasun', 'Dilshan', 'Chamara', 'Tharanga', 'Lahiru', 'Saman', 'Priyantha', 'Anura', 'Malini', 'Shanika', 'Roshan', 'Nadeesha', 'Indunil', 'Samitha', 'Kumari', 'Ranjith', 'Priyanka', 'Harsha', 'Sandya', 'Chathura', 'Nishani', 'Upul'];
const staffLastNames = ['Perera', 'Silva', 'Fernando', 'Jayawardena', 'Bandara', 'Mendis', 'Kumara', 'Wijesuriya', 'De Mel', 'Gunawardena', 'Weerakkody', 'Pathirana'];

function generateStaff() {
  const staff = [];
  for (let i = 0; i < 24; i++) {
    const firstName = staffFirstNames[i % staffFirstNames.length];
    const lastName = staffLastNames[i % staffLastNames.length];
    const branchId = branches[i % branches.length].id;
    const role = staffRoles[i % staffRoles.length];

    staff.push({
      id: `STF${String(i + 1).padStart(3, '0')}`,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@powerworld.lk`,
      phone: `+94 7${Math.floor(Math.random() * 9)}${Math.floor(1000000 + Math.random() * 9000000)}`,
      role,
      branchId,
      joinDate: formatDate(randomDate(new Date('2020-01-01'), new Date('2025-12-01'))),
      salary: role === 'Manager' ? 120000 : role === 'Trainer' ? 80000 : role === 'Receptionist' ? 50000 : 35000,
      status: Math.random() > 0.1 ? 'active' : 'inactive',
    });
  }
  return staff;
}

// --- Payments ---
function generatePayments(members) {
  const payments = [];
  const methods = ['Cash', 'Card', 'Bank Transfer', 'Card', 'Cash', 'Card'];
  let paymentIndex = 0;

  members.forEach(member => {
    const pkg = packages.find(p => p.id === member.packageId);
    if (!pkg) return;

    // Current payment
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

    // Some members have previous payments
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

  return payments.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// --- Monthly Revenue Data (for charts) ---
export function getMonthlyRevenue(payments) {
  const months = {};
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  payments.forEach(payment => {
    const date = new Date(payment.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const label = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

    if (!months[key]) {
      months[key] = { month: label, revenue: 0, count: 0, key };
    }
    months[key].revenue += payment.amount;
    months[key].count += 1;
  });

  return Object.values(months).sort((a, b) => a.key.localeCompare(b.key)).slice(-6);
}

// --- Revenue by Branch ---
export function getRevenueByBranch(payments) {
  const branchRevenue = {};

  payments.forEach(payment => {
    const branch = branches.find(b => b.id === payment.branchId);
    if (!branch) return;

    if (!branchRevenue[payment.branchId]) {
      branchRevenue[payment.branchId] = {
        branch: branch.name.replace('Power World ', ''),
        revenue: 0,
        count: 0,
      };
    }
    branchRevenue[payment.branchId].revenue += payment.amount;
    branchRevenue[payment.branchId].count += 1;
  });

  return Object.values(branchRevenue);
}

// --- Membership Status Distribution ---
export function getMembershipDistribution(members) {
  const dist = { active: 0, expired: 0, pending: 0 };
  members.forEach(m => {
    if (dist[m.status] !== undefined) dist[m.status]++;
  });
  return [
    { name: 'Active', value: dist.active, color: '#00C853' },
    { name: 'Expired', value: dist.expired, color: '#FF3D3D' },
    { name: 'Pending', value: dist.pending, color: '#FFB300' },
  ];
}

// --- Members by Branch ---
export function getMembersByBranch(members) {
  const branchMembers = {};

  members.forEach(member => {
    const branch = branches.find(b => b.id === member.branchId);
    if (!branch) return;

    const shortName = branch.name.replace('Power World ', '');
    if (!branchMembers[member.branchId]) {
      branchMembers[member.branchId] = { branch: shortName, members: 0 };
    }
    branchMembers[member.branchId].members += 1;
  });

  return Object.values(branchMembers);
}

// Generate all data
export const members = generateMembers();
export const staff = generateStaff();
export const payments = generatePayments(members);

// --- Demo Users ---
export const demoUsers = [
  { id: 'USR001', name: 'Admin User', email: 'admin@powerworld.com', password: 'admin123', role: 'Admin', branchId: null },
  { id: 'USR002', name: 'Ruwan Perera', email: 'manager@powerworld.com', password: 'manager123', role: 'Manager', branchId: 'BR001' },
  { id: 'USR003', name: 'Kasun Fernando', email: 'staff@powerworld.com', password: 'staff123', role: 'Staff', branchId: 'BR001' },
  { id: 'USR004', name: 'Dilshan Jayawardena', email: 'trainer@powerworld.com', password: 'trainer123', role: 'Trainer', branchId: 'BR001', staffId: 'STF004' },
  { id: 'USR005', name: 'Ashan Perera', email: 'customer@powerworld.com', password: 'customer123', role: 'Customer', branchId: 'BR001', memberId: 'MEM001' },
];
