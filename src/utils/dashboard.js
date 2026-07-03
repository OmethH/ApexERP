// src/utils/dashboard.js — Dynamic chart data calculation helpers

// --- Monthly Revenue Data (for charts) ---
export function getMonthlyRevenue(payments) {
  const months = {};
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  (payments || []).forEach(payment => {
    if (!payment.date) return;
    const date = new Date(payment.date);
    // Ignore invalid dates
    if (isNaN(date.getTime())) return;
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
export function getRevenueByBranch(payments, branches) {
  const branchRevenue = {};

  (payments || []).forEach(payment => {
    const branch = (branches || []).find(b => b.id === payment.branchId);
    if (!branch) return;

    const shortName = branch.name.replace('Power World ', '');
    if (!branchRevenue[payment.branchId]) {
      branchRevenue[payment.branchId] = {
        branch: shortName,
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
  (members || []).forEach(m => {
    if (dist[m.status] !== undefined) dist[m.status]++;
  });
  return [
    { name: 'Active', value: dist.active, color: '#00C853' },
    { name: 'Expired', value: dist.expired, color: '#FF3D3D' },
    { name: 'Pending', value: dist.pending, color: '#FFB300' },
  ];
}

// --- Members by Branch ---
export function getMembersByBranch(members, branches) {
  const branchMembers = {};

  (members || []).forEach(member => {
    const branch = (branches || []).find(b => b.id === member.branchId);
    if (!branch) return;

    const shortName = branch.name.replace('Power World ', '');
    if (!branchMembers[member.branchId]) {
      branchMembers[member.branchId] = { branch: shortName, members: 0 };
    }
    branchMembers[member.branchId].members += 1;
  });

  return Object.values(branchMembers);
}
