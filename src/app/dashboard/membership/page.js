'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import Badge from '@/components/Badge';
import { formatDate, formatCurrency } from '@/utils/formatters';
import {
  Dumbbell, Calendar, Clock, CreditCard, RefreshCw,
  CheckCircle, FileText, Gift, Award, Globe,
  Thermometer, Wind, Lock, MapPin, Building2,
  AlertTriangle, ShoppingBag, X, Check, Infinity
} from 'lucide-react';

// --- Helper Functions ---
function formatTime(timeStr) {
  if (!timeStr) return 'All Day';
  const [hoursStr, minutesStr] = timeStr.split(':');
  const hours = parseInt(hoursStr, 10);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutesStr} ${ampm}`;
}

function getBranchAccessLabel(pkg, branches) {
  switch (pkg.branchAccess) {
    case 'all': return 'All Branches';
    case 'ac-only': return 'AC Branches Only';
    case 'non-ac-only': return 'Non-AC Branches Only';
    case 'purchase-branch': return 'Purchase Branch Only';
    case 'selected': {
      const count = (pkg.allowedBranches || []).length;
      return count === 0 ? 'No Branches' : `${count} Selected Branch${count > 1 ? 'es' : ''}`;
    }
    default: return 'All Branches';
  }
}

function getBranchAccessIcon(access) {
  switch (access) {
    case 'all': return Globe;
    case 'ac-only': return Thermometer;
    case 'non-ac-only': return Wind;
    case 'purchase-branch': return Lock;
    case 'selected': return MapPin;
    default: return Globe;
  }
}

function getBranchAccessColor(access) {
  switch (access) {
    case 'all': return { bg: 'var(--success-muted)', color: 'var(--success)' };
    case 'ac-only': return { bg: 'rgba(156,39,176,0.15)', color: '#CE93D8' };
    case 'non-ac-only': return { bg: 'var(--info-muted)', color: 'var(--info)' };
    case 'purchase-branch': return { bg: 'var(--warning-muted)', color: 'var(--warning)' };
    case 'selected': return { bg: 'var(--accent-muted)', color: 'var(--accent-primary)' };
    default: return { bg: 'var(--success-muted)', color: 'var(--success)' };
  }
}

// --- Purchase Modal Component ---
function PurchaseModal({ pkg, branches, onConfirm, onCancel }) {
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [processing, setProcessing] = useState(false);

  const handleConfirm = () => {
    setProcessing(true);
    setTimeout(() => {
      onConfirm(paymentMethod);
      setProcessing(false);
    }, 1200);
  };

  const branchLabel = getBranchAccessLabel(pkg, branches);

  return (
    <div className="modal-overlay" style={{ zIndex: 1000 }} onClick={e => e.target === e.currentTarget && !processing && onCancel()}>
      <div className="modal" style={{ maxWidth: '480px', background: '#121212', border: '1px solid #333' }}>
        <div className="modal-header" style={{ borderBottom: '1px solid #222', paddingBottom: '16px' }}>
          <h2 className="modal-title" style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={20} color="var(--accent-primary)" />
            Confirm Purchase
          </h2>
          <button className="modal-close" onClick={onCancel} disabled={processing}><X size={20} /></button>
        </div>

        <div className="modal-body" style={{ color: 'var(--text-secondary)', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '18px', paddingTop: '16px' }}>
          <div style={{ background: '#1c1c1c', border: '1px solid #282828', borderRadius: '8px', padding: '16px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Selected Plan</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'white', marginTop: '4px' }}>{pkg.name}</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px', borderTop: '1px solid #2a2a2a', paddingTop: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Price</span>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--success)' }}>{formatCurrency(pkg.price)}</div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Branch Access</span>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>{branchLabel}</div>
              </div>
            </div>
          </div>

          <div>
            <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontWeight: 600, color: 'white' }}>Select Payment Method</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { id: 'Card', label: 'Credit / Debit Card', desc: 'Pay instantly with Visa/Mastercard', extra: '⚡ Instant' },
                { id: 'Bank Transfer', label: 'Bank Transfer', desc: 'Transfer to Power World bank account', extra: 'Processing: 1-2 hours' },
                { id: 'Cash', label: 'Pay at Reception (Cash)', desc: 'Pay cash at Colombo branch reception', extra: 'Visit counter' },
              ].map(method => (
                <button
                  type="button"
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  disabled={processing}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: paymentMethod === method.id ? 'rgba(255, 68, 68, 0.08)' : '#181818',
                    border: paymentMethod === method.id ? '1px solid var(--accent-primary)' : '1px solid #282828',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      border: paymentMethod === method.id ? '5px solid var(--accent-primary)' : '2px solid #555',
                      background: 'transparent',
                      flexShrink: 0,
                    }} />
                    <div>
                      <div style={{ fontWeight: 600, color: paymentMethod === method.id ? 'white' : 'var(--text-secondary)', fontSize: '13px' }}>{method.label}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{method.desc}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', background: '#222', padding: '2px 6px', borderRadius: '4px' }}>{method.extra}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ borderTop: '1px solid #222', marginTop: '20px', paddingTop: '16px' }}>
          <button className="btn btn-secondary" onClick={onCancel} disabled={processing}>Cancel</button>
          <button className="btn btn-primary" onClick={handleConfirm} disabled={processing} style={{ minWidth: '150px' }}>
            {processing ? (
              <><span className="spinner" style={{ width: 14, height: 14 }} /> Processing…</>
            ) : (
              'Confirm & Pay'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MembershipPage() {
  const { user } = useAuth();
  
  const [members, setMembers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [packages, setPackages] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedPkg, setSelectedPkg] = useState('');
  const [renewSuccess, setRenewSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('status'); // 'status' or 'buy'
  const [selectedPurchasePkg, setSelectedPurchasePkg] = useState(null);

  const fetchAllData = useCallback(async () => {
    try {
      const [membersRes, paymentsRes, packagesRes, branchesRes] = await Promise.all([
        fetch('/api/members'),
        fetch('/api/payments'),
        fetch('/api/packages'),
        fetch('/api/branches'),
      ]);

      const [membersData, paymentsData, packagesData, branchesData] = await Promise.all([
        membersRes.json(),
        paymentsRes.json(),
        packagesRes.json(),
        branchesRes.json(),
      ]);

      setMembers(Array.isArray(membersData) ? membersData : []);
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      
      const pkgs = Array.isArray(packagesData) ? packagesData : [];
      setPackages(pkgs);
      if (pkgs.length > 1 && !selectedPkg) {
        setSelectedPkg(pkgs[1].id);
      }

      setBranches(Array.isArray(branchesData) ? branchesData : []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load membership page data:', err);
      setLoading(false);
    }
  }, [selectedPkg]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Get current member/customer record
  const currentCustomer = useMemo(() => {
    return members.find(m => m.id === user?.memberId || m.email === user?.email) || null;
  }, [members, user]);

  const hasNoMembership = !currentCustomer || !currentCustomer.packageId;

  // Automatically show the "Buy Membership" tab if they don't have any membership plan
  useEffect(() => {
    if (hasNoMembership && !loading) {
      setActiveTab('buy');
    }
  }, [hasNoMembership, loading]);

  // Payments for this customer
  const customerPayments = useMemo(() => {
    if (!currentCustomer) return [];
    return payments.filter(p => p.memberId === currentCustomer.id);
  }, [payments, currentCustomer]);

  // Compute days and progress
  const membershipStats = useMemo(() => {
    if (!currentCustomer || !currentCustomer.packageId) return null;

    const start = new Date(currentCustomer.membershipStart);
    const end = new Date(currentCustomer.membershipEnd);
    const now = new Date();

    const totalDuration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 30;
    const daysRemaining = Math.ceil((end - now) / (1000 * 60 * 60 * 24)) || 0;
    const daysUsed = totalDuration - (daysRemaining > 0 ? daysRemaining : 0);
    const percentRemaining = Math.max(0, Math.min(100, Math.round((daysRemaining / totalDuration) * 100)));

    return {
      totalDuration,
      daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
      daysUsed,
      percentRemaining,
      isExpired: daysRemaining <= 0 || currentCustomer.status === 'expired',
    };
  }, [currentCustomer]);

  // Can purchase restriction: only if expired, no active membership, or <= 7 days remaining
  const canPurchase = useMemo(() => {
    if (hasNoMembership) return true;
    if (!membershipStats) return true;
    return membershipStats.isExpired || membershipStats.daysRemaining <= 7;
  }, [hasNoMembership, membershipStats]);

  const handleRenew = async (e) => {
    e.preventDefault();
    if (!currentCustomer || !selectedPkg) return;

    const pkg = packages.find(p => p.id === selectedPkg);
    if (!pkg) return;

    const startDate = new Date().toISOString().split('T')[0];
    const durationDays = pkg.duration || 30;
    const endDate = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    try {
      const memberRes = await fetch(`/api/members/${currentCustomer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: selectedPkg,
          packageName: pkg.name,
          membershipStart: startDate,
          membershipEnd: endDate,
          status: 'active',
        }),
      });

      if (!memberRes.ok) throw new Error('Failed to update membership');

      const paymentRes = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: currentCustomer.id,
          memberName: currentCustomer.fullName,
          branchId: currentCustomer.branchId,
          amount: pkg.price,
          packageId: selectedPkg,
          packageName: pkg.name,
          method: 'Cash',
        }),
      });

      if (!paymentRes.ok) throw new Error('Failed to record payment');

      await fetchAllData();
      setRenewSuccess(true);
      setTimeout(() => {
        setRenewSuccess(false);
      }, 4000);
    } catch (err) {
      console.error('Failed to renew membership:', err);
      alert(err.message || 'Error renewing membership');
    }
  };

  const handlePurchase = async (paymentMethod) => {
    if (!selectedPurchasePkg) return;

    let memberId = currentCustomer?.id;

    try {
      if (!memberId && user) {
        const startDate = new Date().toISOString().split('T')[0];
        const durationDays = selectedPurchasePkg.duration || 30;
        const endDate = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const memberRes = await fetch('/api/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: user.name.split(' ')[0] || user.name,
            lastName: user.name.split(' ').slice(1).join(' ') || '',
            fullName: user.name,
            email: user.email,
            phone: '+94 77 123 4567',
            gender: 'Male',
            dateOfBirth: '1995-01-01',
            address: 'Colombo, Sri Lanka',
            branchId: user.branchId || branches[0]?.id || 'BR001',
            packageId: selectedPurchasePkg.id,
            packageName: selectedPurchasePkg.name,
            membershipStart: startDate,
            membershipEnd: endDate,
            status: 'active',
          }),
        });

        if (!memberRes.ok) {
          const errData = await memberRes.json();
          throw new Error(errData.error || 'Failed to auto-create member record');
        }

        const newM = await memberRes.json();
        memberId = newM.id;

        const paymentRes = await fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            memberId: newM.id,
            memberName: newM.fullName,
            branchId: newM.branchId,
            amount: selectedPurchasePkg.price,
            packageId: selectedPurchasePkg.id,
            packageName: selectedPurchasePkg.name,
            method: paymentMethod,
          }),
        });

        if (!paymentRes.ok) throw new Error('Failed to record payment');
      } else {
        const pkg = selectedPurchasePkg;
        const startDate = new Date().toISOString().split('T')[0];
        const durationDays = pkg.duration || 30;
        const endDate = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const memberRes = await fetch(`/api/members/${memberId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            packageId: pkg.id,
            packageName: pkg.name,
            membershipStart: startDate,
            membershipEnd: endDate,
            status: 'active',
          }),
        });

        if (!memberRes.ok) throw new Error('Failed to update membership package');

        const paymentRes = await fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            memberId,
            memberName: currentCustomer.fullName,
            branchId: currentCustomer.branchId,
            amount: pkg.price,
            packageId: pkg.id,
            packageName: pkg.name,
            method: paymentMethod,
          }),
        });

        if (!paymentRes.ok) throw new Error('Failed to record payment');
      }

      await fetchAllData();
      setRenewSuccess(true);
      setSelectedPurchasePkg(null);
      setActiveTab('status');

      setTimeout(() => {
        setRenewSuccess(false);
      }, 4000);
    } catch (err) {
      console.error('Failed to handle purchase:', err);
      alert(err.message || 'Error processing purchase');
    }
  };

  if (loading) {
    return (
      <>
        <Header title="My Membership" subtitle="Manage Plan & Payments" />
        <div className="dashboard-content">
          <div className="empty-state">
            <div className="spinner" />
            <h3>Loading Membership Details...</h3>
          </div>
        </div>
      </>
    );
  }

  // --- TRAINER VIEW ---
  if (user?.role === 'Trainer') {
    return (
      <>
        <Header title="Contract & Employment Status" subtitle="Your trainer engagement at Power World" />
        <div className="dashboard-content">
          <div className="profile-grid" style={{ maxWidth: '900px', margin: '0 auto' }}>
            {/* Employment Status Card */}
            <div className="profile-sidebar" style={{ width: '100%' }}>
              <div className="card animate-fade-in" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <div className="table-avatar" style={{ background: 'var(--accent-primary)', color: 'white' }}>
                    <Dumbbell size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Employment status</h3>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Position: Personal Trainer</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #222', paddingBottom: '10px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Contract Type</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>Full-Time Employee</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #222', paddingBottom: '10px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Status</span>
                    <Badge status="active">Active Staff</Badge>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #222', paddingBottom: '10px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Shift Schedule</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>Morning Shift (06:00 - 14:00)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Monthly Salary</span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--success)' }}>{formatCurrency(80000)} / mo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits & Policies Card */}
            <div className="profile-main" style={{ width: '100%' }}>
              <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 className="card-title">🎁 Employment Benefits & Privileges</h3>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <CheckCircle size={18} color="var(--success)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>Complimentary Access</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Free membership and access to all Power World gym locations and equipment for personal use during off-shift hours.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid #222', paddingTop: '16px' }}>
                  <CheckCircle size={18} color="var(--success)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>Personal Trainer Commissions</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Earn 30% commission on any customized personal training package sold directly to branch gym members.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid #222', paddingTop: '16px' }}>
                  <CheckCircle size={18} color="var(--success)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>Paid Leave Allocation</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Eligible for 14 days of annual paid leaves and 7 days of sick leave. Contact branch manager Ruwan Perera for approvals.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // --- CUSTOMER VIEW ---
  return (
    <>
      <Header title="My Membership Details" subtitle="Track your active membership status and buy plans" />
      <div className="dashboard-content">
        {/* Sub-tab navigation */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          borderBottom: '1px solid #222',
          paddingBottom: '12px',
          maxWidth: '950px',
          margin: '0 auto 24px auto',
        }}>
          <button
            onClick={() => setActiveTab('status')}
            disabled={hasNoMembership}
            style={{
              background: 'transparent',
              border: 'none',
              color: activeTab === 'status' ? 'white' : 'var(--text-tertiary)',
              fontWeight: 600,
              fontSize: '15px',
              padding: '8px 16px',
              cursor: hasNoMembership ? 'not-allowed' : 'pointer',
              position: 'relative',
              transition: 'color 0.2s',
              opacity: hasNoMembership ? 0.5 : 1,
            }}
          >
            My Membership
            {activeTab === 'status' && (
              <div style={{ position: 'absolute', bottom: '-13px', left: 0, right: 0, height: '2px', background: 'var(--accent-primary)' }} />
            )}
          </button>
          <button
            onClick={() => setActiveTab('buy')}
            style={{
              background: 'transparent',
              border: 'none',
              color: activeTab === 'buy' ? 'white' : 'var(--text-tertiary)',
              fontWeight: 600,
              fontSize: '15px',
              padding: '8px 16px',
              cursor: 'pointer',
              position: 'relative',
              transition: 'color 0.2s',
            }}
          >
            Buy New Membership
            {activeTab === 'buy' && (
              <div style={{ position: 'absolute', bottom: '-13px', left: 0, right: 0, height: '2px', background: 'var(--accent-primary)' }} />
            )}
          </button>
        </div>

        {renewSuccess ? (
          <div style={{
            background: 'rgba(0, 200, 83, 0.1)',
            border: '1px solid var(--success)',
            borderRadius: '8px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            textAlign: 'center',
            maxWidth: '950px',
            margin: '0 auto 24px auto',
            animation: 'fadeIn 0.3s ease',
          }}>
            <CheckCircle size={32} color="var(--success)" />
            <div style={{ fontWeight: 700, color: 'white' }}>Membership Purchased Successfully!</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Your membership has been updated and a new transaction receipt recorded.</div>
          </div>
        ) : null}

        {/* Tab content */}
        {activeTab === 'status' && currentCustomer && currentCustomer.packageId ? (
          <div className="profile-grid" style={{ maxWidth: '950px', margin: '0 auto' }}>
            {/* Left side: Membership details and renewal */}
            <div className="profile-sidebar" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Membership Status card */}
              <div className="card animate-fade-in" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Current Active Plan</div>
                    <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'white', marginTop: '4px' }}>{currentCustomer.packageName}</h3>
                  </div>
                  <Badge status={currentCustomer.status} />
                </div>

                {membershipStats && (
                  <div style={{ marginTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      <span>Progress ({membershipStats.daysUsed} days used)</span>
                      <span style={{ fontWeight: 600, color: membershipStats.isExpired ? 'var(--error)' : 'white' }}>
                        {membershipStats.isExpired ? 'Expired' : `${membershipStats.daysRemaining} days remaining`}
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div style={{ height: '8px', background: '#222', borderRadius: '4px', overflow: 'hidden', marginBottom: '20px' }}>
                      <div style={{
                        height: '100%',
                        width: `${membershipStats.percentRemaining}%`,
                        background: membershipStats.isExpired
                          ? 'var(--error)'
                          : membershipStats.daysRemaining <= 15
                            ? 'var(--warning)'
                            : 'var(--success)',
                        transition: 'width 0.4s ease',
                      }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid #222', paddingTop: '16px' }}>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Membership Start</span>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'white', marginTop: '2px' }}>{formatDate(currentCustomer.membershipStart)}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Membership Expiry</span>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: membershipStats.isExpired ? 'var(--error)' : 'white', marginTop: '2px' }}>{formatDate(currentCustomer.membershipEnd)}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Renewal Form */}
              <div className="card animate-fade-in" style={{ padding: '24px' }}>
                <h3 className="card-title" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RefreshCw size={18} color="var(--accent-primary)" />
                  Quick Renewal Dropdown
                </h3>

                <form onSubmit={handleRenew} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-group">
                    <label htmlFor="package">Choose Package Plan</label>
                    <select
                      id="package"
                      value={selectedPkg}
                      onChange={(e) => setSelectedPkg(e.target.value)}
                      required
                    >
                      {packages.filter(p => p.status === 'active').map((pkg) => (
                        <option key={pkg.id} value={pkg.id}>
                          {pkg.name} — {pkg.duration || 30} Days ({formatCurrency(pkg.price)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button type="submit" className="btn btn-primary btn-block" disabled={!canPurchase}>
                    <RefreshCw size={16} style={{ marginRight: '8px' }} />
                    Process Renewal &amp; Pay
                  </button>
                  {!canPurchase && (
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textAlign: 'center', marginTop: '4px' }}>
                      Renewal requires &lt;= 7 days remaining on active plan
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Right side: Package features and billing ledger */}
            <div className="profile-main" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Package benefits */}
              <div className="card animate-fade-in" style={{ padding: '24px' }}>
                <h3 className="card-title" style={{ marginBottom: '16px' }}>What&apos;s included in your package</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <CheckCircle size={16} color="var(--accent-primary)" />
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Full gym floor access at Colombo branch location</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <CheckCircle size={16} color="var(--accent-primary)" />
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Cardio theater access (treadmills, spin bikes, ellipticals)</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <CheckCircle size={16} color="var(--accent-primary)" />
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Locker access and changing room amenities</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <CheckCircle size={16} color="var(--accent-primary)" />
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Free initial physical assessment and fitness consultation</span>
                  </div>
                </div>
              </div>

              {/* Payments log */}
              <div className="card animate-fade-in" style={{ padding: '24px' }}>
                <h3 className="card-title" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CreditCard size={18} color="var(--accent-primary)" />
                  Membership Transaction History
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '250px', overflowY: 'auto' }}>
                  {customerPayments.map((p, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 14px',
                      background: '#151515',
                      borderRadius: '8px',
                      borderLeft: '3px solid var(--success)',
                    }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '13px', color: 'white' }}>{p.packageName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                          Receipt: {p.receiptNo} | {formatDate(p.date)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--success)' }}>{formatCurrency(p.amount)}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{p.method}</div>
                      </div>
                    </div>
                  ))}
                  {customerPayments.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-tertiary)', fontSize: '13px' }}>
                      No payment transactions found.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'buy' ? (
          <div style={{ maxWidth: '950px', margin: '0 auto' }}>

            {/* Purchase limitation alert */}
            {!canPurchase && membershipStats && (
              <div style={{
                background: 'rgba(255, 179, 0, 0.08)',
                border: '1px solid var(--warning)',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '24px',
                animation: 'fadeIn 0.3s ease',
              }}>
                <AlertTriangle size={24} color="var(--warning)" style={{ flexShrink: 0 }} />
                <div>
                  <h4 style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>Purchase Restriction Active</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '2px' }}>
                    You currently have <strong style={{ color: 'white' }}>{membershipStats.daysRemaining} days</strong> remaining on your active plan (<strong>{currentCustomer.packageName}</strong>).
                    You can only buy a new membership when your current plan has 7 days or less remaining, or is already expired.
                  </p>
                </div>
              </div>
            )}

            {/* Packages Grid */}
            <div className="pkg-grid" style={{ marginTop: '0' }}>
              {packages.filter(p => p.status === 'active').map(pkg => {
                const isPurchaseDisabled = !canPurchase;
                const AccessIcon = getBranchAccessIcon(pkg.branchAccess);
                const accessColors = getBranchAccessColor(pkg.branchAccess);

                return (
                  <div key={pkg.id} className="pkg-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {/* Header */}
                    <div className="pkg-card-header">
                      <div className="pkg-card-icon">
                        <Dumbbell size={20} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 className="pkg-card-name">{pkg.name}</h3>
                        <div className="pkg-card-price" style={{ color: 'white', fontSize: '20px', fontWeight: 800 }}>
                          {formatCurrency(pkg.price)}
                        </div>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="pkg-card-badges">
                      <span className="pkg-badge pkg-badge-duration">
                        {pkg.durationType === 'full-time' ? (
                          <><Infinity size={12} style={{ marginRight: '4px' }} /> Full-Time</>
                        ) : (
                          <><Clock size={12} style={{ marginRight: '4px' }} /> Time-Based</>
                        )}
                      </span>
                      {pkg.durationType === 'time-based' && pkg.startTime && pkg.endTime && (
                        <span className="pkg-badge pkg-badge-duration" style={{ borderStyle: 'dashed' }}>
                          <Clock size={12} style={{ marginRight: '4px' }} /> {formatTime(pkg.startTime)} - {formatTime(pkg.endTime)}
                        </span>
                      )}
                      <span className="pkg-badge" style={{ background: accessColors.bg, color: accessColors.color }}>
                        <AccessIcon size={12} style={{ marginRight: '4px' }} />
                        {getBranchAccessLabel(pkg, branches)}
                      </span>
                    </div>

                    {/* Features checklist */}
                    <div style={{ flex: 1, borderTop: '1px solid #222', paddingTop: '16px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <Check size={14} color="var(--accent-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                        <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                          {pkg.branchAccess === 'all' && 'Full access to all Power World gym branches.'}
                          {pkg.branchAccess === 'ac-only' && 'Exclusive access to premium Air-Conditioned locations.'}
                          {pkg.branchAccess === 'non-ac-only' && 'Access to standard Non-AC gym branches.'}
                          {pkg.branchAccess === 'purchase-branch' && 'Access restricted to your registration branch.'}
                          {pkg.branchAccess === 'selected' && `Access restricted to ${pkg.allowedBranches?.length || 0} selected branch(es).`}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <Check size={14} color="var(--accent-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                        <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Includes cardio theater, strength training area, locker access and showers.</span>
                      </div>
                      {pkg.durationType === 'time-based' && (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                          <Check size={14} color="var(--accent-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                          <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                            Valid for gym floor entry between {formatTime(pkg.startTime)} and {formatTime(pkg.endTime)} daily.
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div style={{ marginTop: '24px' }}>
                      <button
                        onClick={() => setSelectedPurchasePkg(pkg)}
                        disabled={isPurchaseDisabled}
                        className={`btn ${isPurchaseDisabled ? 'btn-secondary' : 'btn-primary'} btn-block`}
                        style={{
                          padding: '10px',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: isPurchaseDisabled ? 'not-allowed' : 'pointer',
                          opacity: isPurchaseDisabled ? 0.6 : 1,
                        }}
                      >
                        {isPurchaseDisabled ? 'Purchase Locked' : 'Buy Membership Plan'}
                      </button>
                      {isPurchaseDisabled && (
                        <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '6px' }}>
                          Available when current plan is expiring (&lt;= 7 days)
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <Dumbbell size={48} />
            <h3>No Membership data</h3>
            <p>Could not locate membership records for your account.</p>
          </div>
        )}
      </div>

      {/* Purchase Modal */}
      {selectedPurchasePkg && (
        <PurchaseModal
          pkg={selectedPurchasePkg}
          branches={branches}
          onConfirm={handlePurchase}
          onCancel={() => setSelectedPurchasePkg(null)}
        />
      )}
    </>
  );
}
