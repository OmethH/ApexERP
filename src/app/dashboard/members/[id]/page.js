'use client';

import { use, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useData } from '@/context/DataContext';
import Header from '@/components/Header';
import Badge from '@/components/Badge';
import { formatDate, formatCurrency, getInitials } from '@/utils/formatters';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, CreditCard, RefreshCw, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function MemberDetailPage({ params }) {
  const resolvedParams = use(params);
  const { getMemberById, payments, branches, packages, renewMembership } = useData();

  const member = getMemberById(resolvedParams.id);
  const branch = branches.find(b => b.id === member?.branchId);
  const memberPayments = useMemo(
    () => payments.filter(p => p.memberId === member?.id),
    [payments, member]
  );

  const paymentHistoryColDefs = useMemo(() => [
    {
      headerName: 'Receipt',
      field: 'receiptNo',
      minWidth: 100,
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
      headerName: 'Method',
      field: 'method',
      minWidth: 100,
      flex: 1,
    },
    {
      headerName: 'Amount',
      field: 'amount',
      valueFormatter: (params) => formatCurrency(params.value),
      minWidth: 110,
      flex: 1,
      cellStyle: { fontWeight: 700, color: 'var(--success)' },
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

  if (!member) {
    return (
      <>
        <Header title="Member Not Found" />
        <div className="dashboard-content">
          <div className="empty-state">
            <AlertCircle size={48} />
            <h3>Member not found</h3>
            <p>The member you&apos;re looking for doesn&apos;t exist.</p>
            <Link href="/dashboard/members" className="btn btn-primary" style={{ marginTop: '16px' }}>
              Back to Members
            </Link>
          </div>
        </div>
      </>
    );
  }

  const isExpired = member.status === 'expired';
  const daysLeft = Math.ceil((new Date(member.membershipEnd) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <>
      <Header title={member.fullName} subtitle="Member Profile" />
      <div className="dashboard-content">
        <Link href="/dashboard/members" className="back-btn">
          <ArrowLeft size={16} />
          Back to Members
        </Link>

        <div className="profile-grid">
          {/* Left Sidebar */}
          <div className="profile-sidebar">
            {/* Profile Card */}
            <div className="profile-card">
              <div className="profile-avatar">{getInitials(member.fullName)}</div>
              <h2 className="profile-name">{member.fullName}</h2>
              <p className="profile-email">{member.email}</p>
              <Badge status={member.status} />

              <div className="profile-details" style={{ marginTop: '24px' }}>
                <div className="profile-detail-row">
                  <span className="profile-detail-label">Member ID</span>
                  <span className="profile-detail-value">{member.id}</span>
                </div>
                <div className="profile-detail-row">
                  <span className="profile-detail-label">Gender</span>
                  <span className="profile-detail-value">{member.gender}</span>
                </div>
                <div className="profile-detail-row">
                  <span className="profile-detail-label">Phone</span>
                  <span className="profile-detail-value">{member.phone}</span>
                </div>
                <div className="profile-detail-row">
                  <span className="profile-detail-label">Branch</span>
                  <span className="profile-detail-value">{branch?.name.replace('Power World ', '')}</span>
                </div>
                <div className="profile-detail-row">
                  <span className="profile-detail-label">Joined</span>
                  <span className="profile-detail-value">{formatDate(member.joinDate)}</span>
                </div>
                <div className="profile-detail-row">
                  <span className="profile-detail-label">DOB</span>
                  <span className="profile-detail-value">{formatDate(member.dateOfBirth)}</span>
                </div>
                <div className="profile-detail-row">
                  <span className="profile-detail-label">Emergency</span>
                  <span className="profile-detail-value">{member.emergencyContact || '-'}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: '16px' }}>Quick Actions</h3>
              <div className="quick-actions" style={{ flexDirection: 'column' }}>
                {isExpired && (
                  <button
                    className="btn btn-success btn-block"
                    onClick={() => renewMembership(member.id, member.packageId)}
                  >
                    <RefreshCw size={16} />
                    Renew Membership
                  </button>
                )}
                <Link href="/dashboard/payments" className="btn btn-primary btn-block">
                  <CreditCard size={16} />
                  Record Payment
                </Link>
              </div>
            </div>
          </div>

          {/* Right Main Content */}
          <div className="profile-main">
            {/* Membership Info */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Membership Details</h3>
                {!isExpired && daysLeft > 0 && (
                  <span style={{
                    fontSize: '13px',
                    color: daysLeft <= 7 ? 'var(--warning)' : 'var(--text-secondary)',
                    fontWeight: 600,
                  }}>
                    {daysLeft} days remaining
                  </span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Package</div>
                  <div style={{ fontSize: '16px', fontWeight: 700 }}>{member.packageName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Start Date</div>
                  <div style={{ fontSize: '16px', fontWeight: 700 }}>{formatDate(member.membershipStart)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>End Date</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: isExpired ? 'var(--error)' : 'inherit' }}>{formatDate(member.membershipEnd)}</div>
                </div>
              </div>
            </div>

            {/* Payment History */}
            <div className="table-container">
              <div className="table-header">
                <div className="table-header-left">
                  <h3 className="table-title">Payment History</h3>
                  <span className="table-count">{memberPayments.length} payments</span>
                </div>
              </div>
              {memberPayments.length > 0 ? (
                <div className="ag-theme-quartz-dark" style={{ width: '100%' }}>
                  <AgGridReact
                    rowData={memberPayments}
                    columnDefs={paymentHistoryColDefs}
                    domLayout="autoHeight"
                    suppressCellFocus={true}
                  />
                </div>
              ) : (
                <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                  <CreditCard size={32} />
                  <h3>No payments found</h3>
                  <p>No payment records for this member yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
