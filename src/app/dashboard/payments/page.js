'use client';

import { useState, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useData } from '@/context/DataContext';
import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
import Badge from '@/components/Badge';
import Modal from '@/components/Modal';
import { formatDate, formatCurrency, getInitials } from '@/utils/formatters';
import { Search, Plus, DollarSign, TrendingUp, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 12;

export default function PaymentsPage() {
  const { payments, members, branches, packages, addPayment } = useData();
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);

  const [form, setForm] = useState({
    memberId: '', amount: '', packageId: '', method: 'Cash',
  });

  // Revenue stats
  const revenueStats = useMemo(() => {
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthKey = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;

    const thisMonthRevenue = payments.filter(p => p.date.startsWith(thisMonth)).reduce((sum, p) => sum + p.amount, 0);
    const lastMonthRevenue = payments.filter(p => p.date.startsWith(lastMonthKey)).reduce((sum, p) => sum + p.amount, 0);
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    return { thisMonthRevenue, lastMonthRevenue, totalRevenue, totalTransactions: payments.length };
  }, [payments]);

  const filtered = useMemo(() => {
    return payments.filter(p => {
      const matchSearch = !search || p.memberName.toLowerCase().includes(search.toLowerCase()) ||
        p.receiptNo.toLowerCase().includes(search.toLowerCase());
      const matchBranch = branchFilter === 'all' || p.branchId === branchFilter;
      const matchMethod = methodFilter === 'all' || p.method === methodFilter;
      return matchSearch && matchBranch && matchMethod;
    });
  }, [payments, search, branchFilter, methodFilter]);



  const getBranchName = (branchId) => {
    const branch = branches.find(b => b.id === branchId);
    return branch ? branch.name.replace('Power World ', '') : '-';
  };

  const columnDefs = useMemo(() => [
    {
      headerName: 'Receipt',
      field: 'receiptNo',
      minWidth: 100,
      flex: 1,
      cellClass: 'table-cell-primary',
    },
    {
      headerName: 'Member',
      field: 'memberName',
      minWidth: 180,
      flex: 1.5,
      cellRenderer: (params) => {
        if (!params.data) return null;
        return (
          <div className="table-cell-name">
            <div className="table-avatar">{getInitials(params.data.memberName)}</div>
            <div className="table-cell-primary">{params.data.memberName}</div>
          </div>
        );
      }
    },
    {
      headerName: 'Branch',
      valueGetter: (params) => getBranchName(params.data?.branchId),
      minWidth: 120,
      flex: 1,
    },
    {
      headerName: 'Package',
      field: 'packageName',
      minWidth: 120,
      flex: 1,
    },
    {
      headerName: 'Method',
      field: 'method',
      minWidth: 110,
      flex: 1,
      cellRenderer: (params) => {
        if (!params.value) return null;
        const status = params.value === 'Cash' ? 'pending' : params.value === 'Card' ? 'info' : 'default';
        return <Badge status={status}>{params.value}</Badge>;
      }
    },
    {
      headerName: 'Date',
      field: 'date',
      valueFormatter: (params) => formatDate(params.value),
      minWidth: 110,
      flex: 1,
    },
    {
      headerName: 'Amount',
      field: 'amount',
      valueFormatter: (params) => formatCurrency(params.value),
      minWidth: 120,
      flex: 1.2,
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
  ], [branches]);

  const handleAddPayment = () => {
    const member = members.find(m => m.id === form.memberId);
    const pkg = packages.find(p => p.id === form.packageId);
    if (!member) return;

    addPayment({
      memberId: member.id,
      memberName: member.fullName,
      branchId: member.branchId,
      amount: parseInt(form.amount) || pkg?.price || 0,
      packageId: form.packageId,
      packageName: pkg?.name || 'Custom',
      method: form.method,
    });
    setShowAddModal(false);
    setForm({ memberId: '', amount: '', packageId: '', method: 'Cash' });
  };

  return (
    <>
      <Header title="Payments" subtitle="Financial Management" />
      <div className="dashboard-content">
        <div className="page-header">
          <div className="page-header-left">
            <h1>Payment Records</h1>
            <p>Track all membership payments and revenue</p>
          </div>
          <div className="page-header-right">
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              <Plus size={18} />
              Record Payment
            </button>
          </div>
        </div>

        {/* Revenue Summary Cards */}
        <div className="revenue-cards stagger-children">
          <StatCard
            label="Total Revenue"
            value={formatCurrency(revenueStats.totalRevenue)}
            icon={DollarSign}
            accentColor="#00C853"
            accentBg="rgba(0,200,83,0.15)"
          />
          <StatCard
            label="This Month"
            value={formatCurrency(revenueStats.thisMonthRevenue)}
            icon={TrendingUp}
            accentColor="#FFB300"
            accentBg="rgba(255,179,0,0.15)"
          />
          <StatCard
            label="Transactions"
            value={revenueStats.totalTransactions.toLocaleString()}
            icon={CreditCard}
            accentColor="#448AFF"
            accentBg="rgba(68,138,255,0.15)"
          />
        </div>

        {/* Payment Table */}
        <div className="table-container animate-fade-in">
          <div className="table-header">
            <div className="table-header-left">
              <div className="search-bar">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search payments..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                />
              </div>
            </div>
            <div className="table-header-right">
              <select className="filter-select" value={methodFilter} onChange={e => { setMethodFilter(e.target.value); setCurrentPage(1); }}>
                <option value="all">All Methods</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
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

        {/* Record Payment Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Record Payment"
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddPayment}>Record Payment</button>
            </>
          }
        >
          <div className="modal-form">
            <div className="form-group">
              <label>Member</label>
              <select value={form.memberId} onChange={e => setForm(f => ({ ...f, memberId: e.target.value }))}>
                <option value="">Select Member</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.fullName} ({m.id})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Package</label>
              <select value={form.packageId} onChange={e => {
                const pkg = packages.find(p => p.id === e.target.value);
                setForm(f => ({ ...f, packageId: e.target.value, amount: pkg?.price?.toString() || '' }));
              }}>
                <option value="">Select Package</option>
                {packages.map(p => (
                  <option key={p.id} value={p.id}>{p.name} — LKR {p.price.toLocaleString()}</option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Amount (LKR)</label>
                <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="Amount" />
              </div>
              <div className="form-group">
                <label>Payment Method</label>
                <select value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))}>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}
