'use client';

import { useState, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useData } from '@/context/DataContext';
import Header from '@/components/Header';
import Badge from '@/components/Badge';
import Modal from '@/components/Modal';
import { formatDate, getInitials } from '@/utils/formatters';
import { Search, Plus, Eye, Edit, Trash2, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const ITEMS_PER_PAGE = 10;

export default function MembersPage() {
  const { members, branches, packages, addMember, deleteMember, renewMembership } = useData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [packageFilter, setPackageFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(null);
  const [renewPackage, setRenewPackage] = useState('');

  // Form state
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', gender: 'Male',
    dateOfBirth: '', address: '', branchId: '', packageId: '', emergencyContact: '',
  });

  // Filtered members
  const filtered = useMemo(() => {
    return members.filter(m => {
      const matchSearch = !search || m.fullName.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase()) || m.id.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || m.status === statusFilter;
      const matchBranch = branchFilter === 'all' || m.branchId === branchFilter;
      const matchPackage = packageFilter === 'all' || m.packageId === packageFilter;
      return matchSearch && matchStatus && matchBranch && matchPackage;
    });
  }, [members, search, statusFilter, branchFilter, packageFilter]);



  const handleAddMember = () => {
    const pkg = packages.find(p => p.id === form.packageId);
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = pkg
      ? new Date(Date.now() + pkg.duration * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : startDate;

    addMember({
      ...form,
      fullName: `${form.firstName} ${form.lastName}`,
      packageName: pkg?.name || '',
      membershipStart: startDate,
      membershipEnd: endDate,
      status: 'active',
      notes: '',
    });

    setShowAddModal(false);
    setForm({ firstName: '', lastName: '', email: '', phone: '', gender: 'Male', dateOfBirth: '', address: '', branchId: '', packageId: '', emergencyContact: '' });
  };

  const handleRenew = () => {
    if (showRenewModal && renewPackage) {
      renewMembership(showRenewModal.id, renewPackage);
      setShowRenewModal(null);
      setRenewPackage('');
    }
  };

  const getBranchName = (branchId) => {
    const branch = branches.find(b => b.id === branchId);
    return branch ? branch.name.replace('Power World ', '') : '-';
  };

  const columnDefs = useMemo(() => [
    {
      headerName: 'Member',
      field: 'fullName',
      minWidth: 200,
      flex: 1.5,
      cellRenderer: (params) => {
        if (!params.data) return null;
        return (
          <div className="table-cell-name">
            <div className="table-avatar">{getInitials(params.data.fullName)}</div>
            <div>
              <div className="table-cell-primary">{params.data.fullName}</div>
              <div className="table-cell-secondary">{params.data.id}</div>
            </div>
          </div>
        );
      }
    },
    {
      headerName: 'Branch',
      valueGetter: (params) => getBranchName(params.data?.branchId),
      minWidth: 130,
      flex: 1,
    },
    {
      headerName: 'Package',
      field: 'packageName',
      minWidth: 130,
      flex: 1,
    },
    {
      headerName: 'Start Date',
      field: 'membershipStart',
      valueFormatter: (params) => formatDate(params.value),
      minWidth: 120,
      flex: 1,
    },
    {
      headerName: 'End Date',
      field: 'membershipEnd',
      valueFormatter: (params) => formatDate(params.value),
      minWidth: 120,
      flex: 1,
    },
    {
      headerName: 'Status',
      field: 'status',
      minWidth: 100,
      flex: 0.8,
      cellRenderer: (params) => {
        if (!params.value) return null;
        return <Badge status={params.value} />;
      }
    },
    {
      headerName: 'Actions',
      field: 'id',
      minWidth: 120,
      flex: 1,
      sortable: false,
      filter: false,
      cellRenderer: (params) => {
        if (!params.data) return null;
        return (
          <div className="table-actions">
            <Link href={`/dashboard/members/${params.data.id}`} className="table-action-btn" title="View">
              <Eye size={16} />
            </Link>
            {params.data.status === 'expired' && (
              <button
                className="table-action-btn"
                title="Renew"
                onClick={() => { setShowRenewModal(params.data); setRenewPackage(params.data.packageId); }}
                style={{ color: 'var(--success)' }}
              >
                <RefreshCw size={16} />
              </button>
            )}
            <button
              className="table-action-btn danger"
              title="Delete"
              onClick={() => { if (confirm('Delete this member?')) deleteMember(params.data.id); }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      }
    }
  ], [branches, deleteMember]);

  return (
    <>
      <Header title="Members" subtitle="Membership Management" />
      <div className="dashboard-content">
        {/* Page Header */}
        <div className="page-header">
          <div className="page-header-left">
            <h1>Member Management</h1>
            <p>Manage all gym members and memberships</p>
          </div>
          <div className="page-header-right">
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              <Plus size={18} />
              Add Member
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="table-container animate-fade-in">
          <div className="table-header">
            <div className="table-header-left">
              <div className="search-bar">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search members..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                />
              </div>
            </div>
            <div className="table-header-right">
              <select
                className="filter-select"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="pending">Pending</option>
              </select>
              <select
                className="filter-select"
                value={branchFilter}
                onChange={(e) => { setBranchFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="all">All Branches</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name.replace('Power World ', '')}</option>
                ))}
              </select>
              <select
                className="filter-select"
                value={packageFilter}
                onChange={(e) => { setPackageFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="all">All Packages</option>
                {packages.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="ag-theme-quartz-dark" style={{ width: '100%' }}>
            <AgGridReact
              rowData={filtered}
              columnDefs={columnDefs}
              pagination={true}
              paginationPageSize={ITEMS_PER_PAGE}
              domLayout="autoHeight"
              suppressCellFocus={true}
            />
          </div>
        </div>

        {/* Add Member Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Register New Member"
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddMember}>Register Member</button>
            </>
          }
        >
          <div className="modal-form">
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} placeholder="First name" />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} placeholder="Last name" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email address" />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+94 7XXXXXXXX" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Gender</label>
                <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input type="date" value={form.dateOfBirth} onChange={e => setForm(f => ({ ...f, dateOfBirth: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label>Branch</label>
              <select value={form.branchId} onChange={e => setForm(f => ({ ...f, branchId: e.target.value }))}>
                <option value="">Select Branch</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Membership Package</label>
              <select value={form.packageId} onChange={e => setForm(f => ({ ...f, packageId: e.target.value }))}>
                <option value="">Select Package</option>
                {packages.map(p => (
                  <option key={p.id} value={p.id}>{p.name} — LKR {p.price.toLocaleString()}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Emergency Contact</label>
              <input value={form.emergencyContact} onChange={e => setForm(f => ({ ...f, emergencyContact: e.target.value }))} placeholder="+94 7XXXXXXXX" />
            </div>
          </div>
        </Modal>

        {/* Renew Modal */}
        <Modal
          isOpen={!!showRenewModal}
          onClose={() => setShowRenewModal(null)}
          title={`Renew Membership — ${showRenewModal?.fullName}`}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setShowRenewModal(null)}>Cancel</button>
              <button className="btn btn-success" onClick={handleRenew}>Confirm Renewal</button>
            </>
          }
        >
          <div className="modal-form">
            <div className="form-group">
              <label>Select New Package</label>
              <select value={renewPackage} onChange={e => setRenewPackage(e.target.value)}>
                {packages.map(p => (
                  <option key={p.id} value={p.id}>{p.name} — LKR {p.price.toLocaleString()}</option>
                ))}
              </select>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
              This will renew the membership starting from today and record a payment automatically.
            </p>
          </div>
        </Modal>
      </div>
    </>
  );
}
