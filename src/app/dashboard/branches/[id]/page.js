'use client';

import { use, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useData } from '@/context/DataContext';
import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
import Badge from '@/components/Badge';
import { formatDate, formatCurrency, getInitials } from '@/utils/formatters';
import { ArrowLeft, Users, UserCog, DollarSign, UserCheck, Building2 } from 'lucide-react';
import Link from 'next/link';

export default function BranchDetailPage({ params }) {
  const resolvedParams = use(params);
  const { branches, members, staff, payments } = useData();

  const branch = branches.find(b => b.id === resolvedParams.id);
  const branchMembers = useMemo(() => members.filter(m => m.branchId === resolvedParams.id), [members, resolvedParams.id]);
  const branchStaff = useMemo(() => staff.filter(s => s.branchId === resolvedParams.id), [staff, resolvedParams.id]);
  const branchPayments = useMemo(() => payments.filter(p => p.branchId === resolvedParams.id), [payments, resolvedParams.id]);
  const branchRevenue = branchPayments.reduce((sum, p) => sum + p.amount, 0);
  const activeMembers = branchMembers.filter(m => m.status === 'active').length;

  const memberColDefs = useMemo(() => [
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
            <Link href={`/dashboard/members/${params.data.id}`} className="table-cell-primary" style={{ color: 'var(--text-primary)' }}>
              {params.data.fullName}
            </Link>
          </div>
        );
      }
    },
    {
      headerName: 'Package',
      field: 'packageName',
      minWidth: 110,
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
    },
    {
      headerName: 'End Date',
      field: 'membershipEnd',
      valueFormatter: (params) => formatDate(params.value),
      minWidth: 100,
      flex: 1,
    }
  ], []);

  const staffColDefs = useMemo(() => [
    {
      headerName: 'Staff',
      field: 'fullName',
      minWidth: 180,
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
      headerName: 'Role',
      field: 'role',
      minWidth: 100,
      flex: 1.1,
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

  if (!branch) {
    return (
      <>
        <Header title="Branch Not Found" />
        <div className="dashboard-content">
          <div className="empty-state">
            <Building2 size={48} />
            <h3>Branch not found</h3>
            <Link href="/dashboard/branches" className="btn btn-primary" style={{ marginTop: '16px' }}>
              Back to Branches
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title={branch.name} subtitle="Branch Dashboard" />
      <div className="dashboard-content">
        <Link href="/dashboard/branches" className="back-btn">
          <ArrowLeft size={16} />
          Back to Branches
        </Link>

        <div className="page-header">
          <div className="page-header-left">
            <h1>{branch.name}</h1>
            <p>{branch.location} • Manager: {branch.manager}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid stagger-children">
          <StatCard label="Total Members" value={branchMembers.length} icon={Users} accentColor="#448AFF" accentBg="rgba(68,138,255,0.15)" />
          <StatCard label="Active Members" value={activeMembers} icon={UserCheck} accentColor="#00C853" accentBg="rgba(0,200,83,0.15)" />
          <StatCard label="Staff" value={branchStaff.length} icon={UserCog} accentColor="#9C27B0" accentBg="rgba(156,39,176,0.15)" />
          <StatCard label="Revenue" value={formatCurrency(branchRevenue)} icon={DollarSign} accentColor="#FFB300" accentBg="rgba(255,179,0,0.15)" />
        </div>

        {/* Branch Members & Staff */}
        <div className="grid-2">
          {/* Members Table */}
          <div className="table-container animate-fade-in">
            <div className="table-header">
              <h3 className="table-title">Branch Members</h3>
              <span className="table-count">{branchMembers.length}</span>
            </div>
            <div className="ag-theme-quartz-dark" style={{ width: '100%' }}>
              <AgGridReact
                rowData={branchMembers.slice(0, 10)}
                columnDefs={memberColDefs}
                domLayout="autoHeight"
                suppressCellFocus={true}
              />
            </div>
          </div>

          {/* Staff Table */}
          <div className="table-container animate-fade-in">
            <div className="table-header">
              <h3 className="table-title">Branch Staff</h3>
              <span className="table-count">{branchStaff.length}</span>
            </div>
            <div className="ag-theme-quartz-dark" style={{ width: '100%' }}>
              <AgGridReact
                rowData={branchStaff}
                columnDefs={staffColDefs}
                domLayout="autoHeight"
                suppressCellFocus={true}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
