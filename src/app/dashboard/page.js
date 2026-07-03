'use client';

import { useMemo, useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
import Badge from '@/components/Badge';
import { formatCurrency, formatDate, getInitials } from '@/utils/formatters';
import { getMonthlyRevenue, getRevenueByBranch, getMembershipDistribution, getMembersByBranch } from '@/utils/dashboard';
import {
  Users,
  UserCheck,
  UserX,
  DollarSign,
  Building2,
  UserCog,
  TrendingUp,
  Clock,
  Eye,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import Link from 'next/link';

const CHART_COLORS = ['#D80000', '#FF4444', '#FF6B6B', '#FF9999', '#FFCCCC'];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1E1E1E',
      border: '1px solid #2A2A2A',
      borderRadius: '8px',
      padding: '12px 16px',
      fontSize: '13px',
    }}>
      <p style={{ color: '#A0A0A0', marginBottom: '4px' }}>{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color, fontWeight: 600 }}>
          {entry.name}: {typeof entry.value === 'number' && entry.name?.toLowerCase().includes('revenue')
            ? formatCurrency(entry.value)
            : entry.value}
        </p>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  const [members, setMembers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [payments, setPayments] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        const [membersRes, staffRes, paymentsRes, branchesRes] = await Promise.all([
          fetch('/api/members'),
          fetch('/api/staff'),
          fetch('/api/payments'),
          fetch('/api/branches'),
        ]);

        const [membersData, staffData, paymentsData, branchesData] = await Promise.all([
          membersRes.json(),
          staffRes.json(),
          paymentsRes.json(),
          branchesRes.json(),
        ]);

        if (active) {
          setMembers(Array.isArray(membersData) ? membersData : []);
          setStaff(Array.isArray(staffData) ? staffData : []);
          setPayments(Array.isArray(paymentsData) ? paymentsData : []);
          setBranches(Array.isArray(branchesData) ? branchesData : []);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      }
    }
    loadData();
    return () => { active = false; };
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthKey = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;

    const activeMembers = members.filter(m => m.status === 'active').length;
    const expiredMembers = members.filter(m => m.status === 'expired').length;
    const pendingMembers = members.filter(m => m.status === 'pending').length;

    const thisMonthRevenue = payments
      .filter(p => p.date && p.date.startsWith(thisMonth))
      .reduce((sum, p) => sum + p.amount, 0);

    const lastMonthRevenue = payments
      .filter(p => p.date && p.date.startsWith(lastMonthKey))
      .reduce((sum, p) => sum + p.amount, 0);

    const revenueTrend = lastMonthRevenue > 0
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
      : 0;

    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const expiringSoon = members.filter(m => {
      const endDate = new Date(m.membershipEnd);
      return endDate >= now && endDate <= sevenDaysFromNow && m.status === 'active';
    });

    const recentRegistrations = [...members]
      .sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate))
      .slice(0, 10);

    return {
      totalMembers: members.length,
      activeMembers,
      expiredMembers,
      pendingMembers,
      totalStaff: staff.length,
      totalBranches: branches.length,
      thisMonthRevenue,
      lastMonthRevenue,
      revenueTrend,
      totalRevenue: payments.reduce((sum, p) => sum + p.amount, 0),
      expiringSoon,
      recentRegistrations,
    };
  }, [members, staff, payments, branches]);

  const monthlyRevenue = useMemo(() => getMonthlyRevenue(payments), [payments]);
  const revenueByBranch = useMemo(() => getRevenueByBranch(payments, branches), [payments, branches]);
  const memberDist = useMemo(() => getMembershipDistribution(members), [members]);
  const membersByBranch = useMemo(() => getMembersByBranch(members, branches), [members, branches]);

  // --- Admin columns ---
  const recentColDefs = useMemo(() => [
    {
      headerName: 'Member',
      field: 'fullName',
      minWidth: 150,
      flex: 1.5,
      cellRenderer: (params) => {
        if (!params.data) return null;
        return (
          <div className="table-cell-name">
            <div className="table-avatar">{getInitials(params.data.fullName)}</div>
            <div>
              <div className="table-cell-primary">{params.data.fullName}</div>
              <div className="table-cell-secondary">{params.data.email}</div>
            </div>
          </div>
        );
      }
    },
    {
      headerName: 'Package',
      field: 'packageName',
      minWidth: 100,
      flex: 1,
    },
    {
      headerName: 'Status',
      field: 'status',
      minWidth: 80,
      flex: 0.8,
      cellRenderer: (params) => {
        if (!params.value) return null;
        return <Badge status={params.value} />;
      }
    },
    {
      headerName: 'Joined',
      field: 'joinDate',
      valueFormatter: (params) => formatDate(params.value),
      minWidth: 90,
      flex: 0.9,
    }
  ], []);

  const expiringColDefs = useMemo(() => [
    {
      headerName: 'Member',
      field: 'fullName',
      minWidth: 140,
      flex: 1.5,
      cellRenderer: (params) => {
        if (!params.data) return null;
        return (
          <div className="table-cell-name">
            <div className="table-avatar">{getInitials(params.data.fullName)}</div>
            <div className="table-cell-primary">{params.data.fullName}</div>
          </div>
        );
      }
    },
    {
      headerName: 'Expires',
      field: 'membershipEnd',
      minWidth: 100,
      flex: 1,
      cellRenderer: (params) => {
        if (!params.value) return null;
        return (
          <span style={{ color: 'var(--warning)', fontWeight: 600, fontSize: '13px' }}>
            {formatDate(params.value)}
          </span>
        );
      }
    },
    {
      headerName: 'Package',
      field: 'packageName',
      minWidth: 100,
      flex: 1,
    },
    {
      headerName: 'Action',
      field: 'id',
      minWidth: 80,
      flex: 0.8,
      sortable: false,
      filter: false,
      cellRenderer: (params) => {
        if (!params.value) return null;
        return (
          <Link href={`/dashboard/members/${params.value}`} className="btn btn-sm btn-success" style={{ display: 'inline-flex' }}>
            Renew
          </Link>
        );
      }
    }
  ], []);

  // --- Trainer columns & state ---
  const currentTrainer = useMemo(() => {
    return staff.find(s => s.id === user?.staffId || s.email === user?.email) || null;
  }, [staff, user]);

  const trainerBranch = useMemo(() => {
    return branches.find(b => b.id === (currentTrainer?.branchId || user?.branchId)) || null;
  }, [branches, currentTrainer, user]);

  const trainerMembers = useMemo(() => {
    const bId = currentTrainer?.branchId || user?.branchId || 'BR001';
    return members.filter(m => m.branchId === bId);
  }, [members, currentTrainer, user]);

  const trainerMembersColDefs = useMemo(() => [
    {
      headerName: 'Member',
      field: 'fullName',
      minWidth: 150,
      flex: 1.5,
      cellRenderer: (params) => {
        if (!params.data) return null;
        return (
          <div className="table-cell-name">
            <div className="table-avatar">{getInitials(params.data.fullName)}</div>
            <div>
              <div className="table-cell-primary">{params.data.fullName}</div>
              <div className="table-cell-secondary">{params.data.email}</div>
            </div>
          </div>
        );
      }
    },
    {
      headerName: 'Phone',
      field: 'phone',
      minWidth: 120,
      flex: 1,
    },
    {
      headerName: 'Package',
      field: 'packageName',
      minWidth: 100,
      flex: 1,
    },
    {
      headerName: 'Status',
      field: 'status',
      minWidth: 90,
      flex: 0.8,
      cellRenderer: (params) => {
        if (!params.value) return null;
        return <Badge status={params.value} />;
      }
    }
  ], []);

  // --- Customer columns & state ---
  const currentCustomer = useMemo(() => {
    return members.find(m => m.id === user?.memberId || m.email === user?.email) || null;
  }, [members, user]);

  const customerPayments = useMemo(() => {
    if (!currentCustomer) return [];
    return payments.filter(p => p.memberId === currentCustomer.id);
  }, [payments, currentCustomer]);

  const customerBranch = useMemo(() => {
    return branches.find(b => b.id === currentCustomer?.branchId) || null;
  }, [branches, currentCustomer]);

  const daysLeft = useMemo(() => {
    if (!currentCustomer || currentCustomer.status !== 'active') return 0;
    const end = new Date(currentCustomer.membershipEnd);
    const start = new Date();
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }, [currentCustomer]);

  const customerPaymentsColDefs = useMemo(() => [
    {
      headerName: 'Receipt No',
      field: 'receiptNo',
      minWidth: 120,
      flex: 1,
      cellClass: 'table-cell-primary',
    },
    {
      headerName: 'Date',
      field: 'date',
      valueFormatter: (params) => formatDate(params.value),
      minWidth: 110,
      flex: 1,
    },
    {
      headerName: 'Package',
      field: 'packageName',
      minWidth: 120,
      flex: 1.2,
    },
    {
      headerName: 'Amount',
      field: 'amount',
      valueFormatter: (params) => formatCurrency(params.value),
      minWidth: 100,
      flex: 1,
      cellStyle: { fontWeight: 700, color: 'var(--success)' },
    },
    {
      headerName: 'Method',
      field: 'method',
      minWidth: 100,
      flex: 1,
    }
  ], []);

  // ============================================
  // RENDER TRAINER DASHBOARD
  // ============================================
  if (user?.role === 'Trainer') {
    return (
      <>
        <Header title={`Coach ${user.name.split(' ')[0]}`} subtitle={`Trainer Dashboard | ${trainerBranch?.name || 'Colombo'}`} />
        <div className="dashboard-content">
          <div className="stats-grid stagger-children">
            <StatCard
              label="Branch Clients"
              value={trainerMembers.length}
              trend={12.5}
              trendLabel="this month"
              icon={Users}
              accentColor="#448AFF"
              accentBg="rgba(68,138,255,0.15)"
            />
            <StatCard
              label="Trainer Rating"
              value="4.9 / 5.0"
              trend={0.2}
              trendLabel="vs last month"
              icon={Eye} // using Eye as review/rating proxy
              accentColor="#00C853"
              accentBg="rgba(0,200,83,0.15)"
            />
            <StatCard
              label="Assigned Classes"
              value="4 Today"
              trend={2}
              trendLabel="sessions tomorrow"
              icon={Clock}
              accentColor="#FFB300"
              accentBg="rgba(255,179,0,0.15)"
            />
            <StatCard
              label="Monthly Salary"
              value={formatCurrency(currentTrainer?.salary || 80000)}
              trend={0}
              trendLabel="base contract"
              icon={DollarSign}
              accentColor="#FF3D3D"
              accentBg="rgba(255,61,61,0.15)"
            />
          </div>

          <div className="grid-2" style={{ marginBottom: 'var(--space-6)', marginTop: 'var(--space-5)' }}>
            {/* Daily Schedule */}
            <div className="card animate-fade-in">
              <div className="card-header">
                <h3 className="card-title">📅 Today&apos;s Sessions</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { time: '08:00 AM - 09:30 AM', type: 'Morning Spin Class', clients: '12 Registered', status: 'Upcoming' },
                  { time: '10:30 AM - 11:30 AM', type: 'Personal Training', clients: 'Ashan Perera', status: 'Completed' },
                  { time: '04:00 PM - 05:30 PM', type: 'HIIT Bootcamp', clients: '18 Registered', status: 'Upcoming' },
                  { time: '06:30 PM - 07:30 PM', type: 'Strength & Conditioning', clients: '8 Registered', status: 'Upcoming' },
                ].map((session, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    background: '#151515',
                    borderRadius: '8px',
                    borderLeft: '4px solid var(--accent-primary)',
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14px' }}>{session.type}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{session.time}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>{session.clients}</div>
                      <Badge status={session.status === 'Completed' ? 'completed' : 'pending'}>
                        {session.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Trainer Notice Board */}
            <div className="card animate-fade-in">
              <div className="card-header">
                <h3 className="card-title">📣 Staff Announcements</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ borderBottom: '1px solid #222', paddingBottom: '12px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--accent-primary)', fontWeight: 700, textTransform: 'uppercase' }}>Annual Audit</span>
                  <h4 style={{ fontSize: '14px', margin: '4px 0', fontWeight: 600 }}>Equipment Inspections</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>All personal trainers must document any worn equipment or cable machines that require servicing before Sunday.</p>
                </div>
                <div style={{ borderBottom: '1px solid #222', paddingBottom: '12px' }}>
                  <span style={{ fontSize: '11px', color: '#00C853', fontWeight: 700, textTransform: 'uppercase' }}>New Policy</span>
                  <h4 style={{ fontSize: '14px', margin: '4px 0', fontWeight: 600 }}>Complimentary Gym Guest Passes</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Trainers are allocated 3 complimentary guest passes per month to recruit personal training clients.</p>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#FFB300', fontWeight: 700, textTransform: 'uppercase' }}>Workshop</span>
                  <h4 style={{ fontSize: '14px', margin: '4px 0', fontWeight: 600 }}>CPR Renewal & Advanced Training</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>A certified CPR renewal workshop will be held at the Colombo branch next Saturday. Attendance is mandatory for all trainers.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Members at Branch */}
          <div className="table-container animate-fade-in">
            <div className="table-header">
              <div className="table-header-left">
                <h3 className="table-title">Branch Members</h3>
                <span className="table-count">{trainerMembers.length} active at your location</span>
              </div>
            </div>
            <div className="ag-theme-quartz-dark" style={{ width: '100%' }}>
              <AgGridReact
                rowData={trainerMembers}
                columnDefs={trainerMembersColDefs}
                domLayout="autoHeight"
                suppressCellFocus={true}
              />
            </div>
          </div>
        </div>
      </>
    );
  }

  // ============================================
  // RENDER CUSTOMER DASHBOARD
  // ============================================
  if (user?.role === 'Customer') {
    return (
      <>
        <Header title={`Welcome back, ${user.name.split(' ')[0]}`} subtitle="Gym Member Dashboard" />
        <div className="dashboard-content">
          <div className="stats-grid stagger-children">
            <StatCard
              label="Membership Status"
              value={currentCustomer?.status?.toUpperCase() || 'ACTIVE'}
              trend={0}
              trendLabel="status check"
              icon={UserCheck}
              accentColor={currentCustomer?.status === 'active' ? '#00C853' : '#FF3D3D'}
              accentBg={currentCustomer?.status === 'active' ? 'rgba(0,200,83,0.15)' : 'rgba(255,61,61,0.15)'}
            />
            <StatCard
              label="Days Remaining"
              value={`${daysLeft} Days`}
              trend={0}
              trendLabel="expires soon"
              icon={Clock}
              accentColor={daysLeft <= 15 ? '#FFB300' : '#448AFF'}
              accentBg={daysLeft <= 15 ? 'rgba(255,179,0,0.15)' : 'rgba(68,138,255,0.15)'}
            />
            <StatCard
              label="Workouts This Month"
              value="14 Sessions"
              trend={16.6}
              trendLabel="vs last month"
              icon={Users} // using Users as health stats icon proxy
              accentColor="#00C853"
              accentBg="rgba(0,200,83,0.15)"
            />
            <StatCard
              label="Total Spent"
              value={formatCurrency(customerPayments.reduce((sum, p) => sum + p.amount, 0))}
              trend={0}
              trendLabel="billing ledger"
              icon={DollarSign}
              accentColor="#FFB300"
              accentBg="rgba(255,179,0,0.15)"
            />
          </div>

          <div className="grid-2" style={{ marginBottom: 'var(--space-6)', marginTop: 'var(--space-5)' }}>
            {/* Gym Announcements */}
            <div className="card animate-fade-in">
              <div className="card-header">
                <h3 className="card-title">📣 Gym Announcements & Tips</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ borderBottom: '1px solid #222', paddingBottom: '12px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--accent-primary)', fontWeight: 700, textTransform: 'uppercase' }}>Equipment Upgrade</span>
                  <h4 style={{ fontSize: '14px', margin: '4px 0', fontWeight: 600 }}>New Treadmills Arriving Next Week!</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>We are replacing 10 treadmills in the Colombo branch with the latest interactive models from Life Fitness.</p>
                </div>
                <div style={{ borderBottom: '1px solid #222', paddingBottom: '12px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--accent-primary)', fontWeight: 700, textTransform: 'uppercase' }}>Nutrition Seminar</span>
                  <h4 style={{ fontSize: '14px', margin: '4px 0', fontWeight: 600 }}>Optimal Post-Workout Meals</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Join Coach Dilshan on Friday at 5:00 PM for an interactive chat about macros and supplement timing.</p>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--accent-primary)', fontWeight: 700, textTransform: 'uppercase' }}>Trainer Tip</span>
                  <h4 style={{ fontSize: '14px', margin: '4px 0', fontWeight: 600 }}>Hydration and Muscle Recovery</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Drinking enough water reduces muscle soreness by flushing toxins out of your muscle tissues. Aim for 3L daily!</p>
                </div>
              </div>
            </div>

            {/* My Gym Branch Location */}
            <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div className="card-header">
                  <h3 className="card-title">🏢 My Home Branch</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Branch Name</span>
                    <div style={{ fontWeight: 700, fontSize: '16px', color: 'white' }}>{customerBranch?.name || 'Power World Colombo'}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Address & Location</span>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{customerBranch?.location || 'Colombo 03'}</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Phone</span>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>{customerBranch?.phone || '+94 11 234 5678'}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Email</span>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>{customerBranch?.email || 'colombo@powerworld.lk'}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: '1px solid #222',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <div className="table-avatar">{getInitials(customerBranch?.manager || 'Ruwan Perera')}</div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Branch Manager</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>{customerBranch?.manager || 'Ruwan Perera'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="table-container animate-fade-in">
            <div className="table-header">
              <div className="table-header-left">
                <h3 className="table-title">My Billing & Payments</h3>
                <span className="table-count">{customerPayments.length} transactions</span>
              </div>
            </div>
            {customerPayments.length > 0 ? (
              <div className="ag-theme-quartz-dark" style={{ width: '100%' }}>
                <AgGridReact
                  rowData={customerPayments}
                  columnDefs={customerPaymentsColDefs}
                  domLayout="autoHeight"
                  suppressCellFocus={true}
                />
              </div>
            ) : (
              <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                <Clock size={32} />
                <h3>No payment records</h3>
                <p>We could not find any transaction records for your account.</p>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // ============================================
  // RENDER ADMIN / STAFF DASHBOARD (EXISTING)
  // ============================================
  return (
    <>
      <Header title={`Welcome back, ${user?.name?.split(' ')[0]}`} subtitle="Executive Dashboard" />
      <div className="dashboard-content">
        {/* KPI Stats */}
        <div className="stats-grid stagger-children">
          <StatCard
            label="Total Members"
            value={stats.totalMembers.toLocaleString()}
            trend={8.2}
            trendLabel="vs last month"
            icon={Users}
            accentColor="#448AFF"
            accentBg="rgba(68,138,255,0.15)"
          />
          <StatCard
            label="Active Members"
            value={stats.activeMembers.toLocaleString()}
            trend={5.1}
            trendLabel="vs last month"
            icon={UserCheck}
            accentColor="#00C853"
            accentBg="rgba(0,200,83,0.15)"
          />
          <StatCard
            label="Expired Members"
            value={stats.expiredMembers.toLocaleString()}
            trend={-3.4}
            trendLabel="vs last month"
            icon={UserX}
            accentColor="#FF3D3D"
            accentBg="rgba(255,61,61,0.15)"
          />
          <StatCard
            label="Revenue This Month"
            value={formatCurrency(stats.thisMonthRevenue)}
            trend={stats.revenueTrend}
            trendLabel="vs last month"
            icon={DollarSign}
            accentColor="#FFB300"
            accentBg="rgba(255,179,0,0.15)"
          />
        </div>

        {/* Charts Row */}
        <div className="charts-grid" style={{ marginBottom: 'var(--space-5)' }}>
          {/* Revenue Trend Chart */}
          <div className="chart-card animate-fade-in">
            <div className="chart-card-header">
              <h3 className="chart-card-title">Revenue Trend</h3>
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Last 6 months</span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D80000" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#D80000" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" />
                <XAxis dataKey="month" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#D80000"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Membership Distribution */}
          <div className="chart-card animate-fade-in">
            <div className="chart-card-header">
              <h3 className="chart-card-title">Membership Status</h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={memberDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {memberDist.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value) => <span style={{ color: '#A0A0A0', fontSize: '12px' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Second Charts Row */}
        <div className="charts-grid" style={{ marginBottom: 'var(--space-8)' }}>
          {/* Members by Branch */}
          <div className="chart-card animate-fade-in">
            <div className="chart-card-header">
              <h3 className="chart-card-title">Members by Branch</h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={membersByBranch}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" />
                <XAxis dataKey="branch" stroke="#666" fontSize={11} angle={-20} textAnchor="end" height={60} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="members" name="Members" fill="#D80000" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue by Branch */}
          <div className="chart-card animate-fade-in">
            <div className="chart-card-header">
              <h3 className="chart-card-title">Revenue by Branch</h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={revenueByBranch} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" />
                <XAxis type="number" stroke="#666" fontSize={12} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                <YAxis type="category" dataKey="branch" stroke="#666" fontSize={11} width={90} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" name="Revenue" fill="#FF4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tables Row */}
        <div className="grid-2">
          {/* Recent Registrations */}
          <div className="table-container animate-fade-in">
            <div className="table-header">
              <div className="table-header-left">
                <h3 className="table-title">Recent Registrations</h3>
              </div>
              <Link href="/dashboard/members" className="btn btn-ghost btn-sm">
                View All
              </Link>
            </div>
            <div className="ag-theme-quartz-dark" style={{ width: '100%' }}>
              <AgGridReact
                rowData={stats.recentRegistrations.slice(0, 6)}
                columnDefs={recentColDefs}
                domLayout="autoHeight"
                suppressCellFocus={true}
              />
            </div>
          </div>

          {/* Expiring Soon */}
          <div className="table-container animate-fade-in">
            <div className="table-header">
              <div className="table-header-left">
                <h3 className="table-title">⚠️ Expiring Soon</h3>
                <span className="table-count">{stats.expiringSoon.length} members</span>
              </div>
            </div>
            {stats.expiringSoon.length > 0 ? (
              <div className="ag-theme-quartz-dark" style={{ width: '100%' }}>
                <AgGridReact
                  rowData={stats.expiringSoon.slice(0, 6)}
                  columnDefs={expiringColDefs}
                  domLayout="autoHeight"
                  suppressCellFocus={true}
                />
              </div>
            ) : (
              <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                <Clock size={32} />
                <h3>No expiring memberships</h3>
                <p>All members are up to date</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
