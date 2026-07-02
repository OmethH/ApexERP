'use client';

import { useState, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import Badge from '@/components/Badge';
import Modal from '@/components/Modal';
import { formatDate, getInitials, formatCurrency } from '@/utils/formatters';
import { Search, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

export default function StaffPage() {
  const { staff, branches, addStaffMember, deleteStaff } = useData();
  const { registerUser } = useAuth();
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    role: 'Trainer', branchId: '', salary: '', password: '',
  });

  const roles = useMemo(() => [...new Set(staff.map(s => s.role))], [staff]);

  const filtered = useMemo(() => {
    return staff.filter(s => {
      const matchSearch = !search || s.fullName.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase());
      const matchBranch = branchFilter === 'all' || s.branchId === branchFilter;
      const matchRole = roleFilter === 'all' || s.role === roleFilter;
      return matchSearch && matchBranch && matchRole;
    });
  }, [staff, search, branchFilter, roleFilter]);



  const getBranchName = (branchId) => {
    const branch = branches.find(b => b.id === branchId);
    return branch ? branch.name.replace('Power World ', '') : '-';
  };

  const columnDefs = useMemo(() => [
    {
      headerName: 'Employee',
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
      flex: 1,
      cellRenderer: (params) => {
        if (!params.value) return null;
        return <Badge status={params.value === 'Manager' ? 'info' : 'default'}>{params.value}</Badge>;
      }
    },
    {
      headerName: 'Branch',
      valueGetter: (params) => getBranchName(params.data?.branchId),
      minWidth: 120,
      flex: 1,
    },
    {
      headerName: 'Phone',
      field: 'phone',
      minWidth: 120,
      flex: 1,
    },
    {
      headerName: 'Joined',
      field: 'joinDate',
      valueFormatter: (params) => formatDate(params.value),
      minWidth: 110,
      flex: 1,
    },
    {
      headerName: 'Salary',
      field: 'salary',
      valueFormatter: (params) => formatCurrency(params.value),
      minWidth: 120,
      flex: 1,
      cellClass: 'table-cell-primary',
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
      minWidth: 100,
      flex: 0.8,
      sortable: false,
      filter: false,
      cellRenderer: (params) => {
        if (!params.data) return null;
        return (
          <div className="table-actions">
            <button
              className="table-action-btn danger"
              title="Delete"
              onClick={() => { if (confirm('Remove this employee?')) deleteStaff(params.data.id); }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      }
    }
  ], [branches, deleteStaff]);

  const handleAdd = () => {
    const newStaff = addStaffMember({
      ...form,
      fullName: `${form.firstName} ${form.lastName}`,
      salary: parseInt(form.salary) || 0,
    });
    
    if (newStaff && form.password) {
      registerUser(form.email, form.password, form.role, newStaff.id, newStaff.fullName, newStaff.branchId);
    }
    
    setShowAddModal(false);
    setForm({ firstName: '', lastName: '', email: '', phone: '', role: 'Trainer', branchId: '', salary: '', password: '' });
  };

  return (
    <>
      <Header title="Staff" subtitle="Staff Management" />
      <div className="dashboard-content">
        <div className="page-header">
          <div className="page-header-left">
            <h1>Staff Management</h1>
            <p>Manage employees across all branches</p>
          </div>
          <div className="page-header-right">
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              <Plus size={18} />
              Add Employee
            </button>
          </div>
        </div>

        <div className="table-container animate-fade-in">
          <div className="table-header">
            <div className="table-header-left">
              <div className="search-bar">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search staff..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                />
              </div>
            </div>
            <div className="table-header-right">
              <select className="filter-select" value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setCurrentPage(1); }}>
                <option value="all">All Roles</option>
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <select className="filter-select" value={branchFilter} onChange={e => { setBranchFilter(e.target.value); setCurrentPage(1); }}>
                <option value="all">All Branches</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name.replace('Power World ', '')}</option>)}
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

        {/* Add Staff Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add New Employee"
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAdd}>Add Employee</button>
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
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+94 7XXXXXXXX" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Role</label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                  <option value="Manager">Manager</option>
                  <option value="Trainer">Trainer</option>
                  <option value="Receptionist">Receptionist</option>
                  <option value="Cleaner">Cleaner</option>
                </select>
              </div>
              <div className="form-group">
                <label>Branch</label>
                <select value={form.branchId} onChange={e => setForm(f => ({ ...f, branchId: e.target.value }))}>
                  <option value="">Select Branch</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Monthly Salary (LKR)</label>
                <input type="number" value={form.salary} onChange={e => setForm(f => ({ ...f, salary: e.target.value }))} placeholder="e.g. 80000" />
              </div>
              <div className="form-group">
                <label>Login Password</label>
                <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Set login password" />
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}
