'use client';

import { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
import Badge from '@/components/Badge';
import { formatCurrency, formatDate, getInitials } from '@/utils/formatters';
import { getMonthlyRevenue, getRevenueByBranch, getMembershipDistribution, getMembersByBranch } from '@/data/mockData';
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
  const { members, payments, stats, branches } = useData();

  const monthlyRevenue = useMemo(() => getMonthlyRevenue(payments), [payments]);
  const revenueByBranch = useMemo(() => getRevenueByBranch(payments), [payments]);
  const memberDist = useMemo(() => getMembershipDistribution(members), [members]);
  const membersByBranch = useMemo(() => getMembersByBranch(members), [members]);

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
