'use client';

import { useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import Header from '@/components/Header';
import Badge from '@/components/Badge';
import { formatDate, formatCurrency } from '@/utils/formatters';
import { Dumbbell, Calendar, Clock, CreditCard, RefreshCw, CheckCircle, FileText, Gift, Award } from 'lucide-react';

export default function MembershipPage() {
  const { user } = useAuth();
  const { members, payments, packages, renewMembership } = useData();
  const [selectedPkg, setSelectedPkg] = useState(packages[1]?.id || '');
  const [renewSuccess, setRenewSuccess] = useState(false);

  // Get current member/customer record
  const currentCustomer = useMemo(() => {
    return members.find(m => m.id === user?.memberId || m.email === user?.email) || null;
  }, [members, user]);

  // Payments for this customer
  const customerPayments = useMemo(() => {
    if (!currentCustomer) return [];
    return payments.filter(p => p.memberId === currentCustomer.id);
  }, [payments, currentCustomer]);

  // Compute days and progress
  const membershipStats = useMemo(() => {
    if (!currentCustomer) return null;

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

  const handleRenew = (e) => {
    e.preventDefault();
    if (!currentCustomer || !selectedPkg) return;
    
    renewMembership(currentCustomer.id, selectedPkg);
    setRenewSuccess(true);
    setTimeout(() => {
      setRenewSuccess(false);
    }, 4000);
  };

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
      <Header title="My Membership Details" subtitle="Track your active membership status and renew plans" />
      <div className="dashboard-content">
        {currentCustomer ? (
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
                  Renew / Change Membership
                </h3>

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
                    marginBottom: '16px',
                  }}>
                    <CheckCircle size={32} color="var(--success)" />
                    <div style={{ fontWeight: 700, color: 'white' }}>Membership Renewed Successfully!</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Your membership has been updated and a new transaction receipt recorded.</div>
                  </div>
                ) : null}

                <form onSubmit={handleRenew} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-group">
                    <label htmlFor="package">Choose Package Plan</label>
                    <select
                      id="package"
                      value={selectedPkg}
                      onChange={(e) => setSelectedPkg(e.target.value)}
                      required
                    >
                      {packages.map((pkg) => (
                        <option key={pkg.id} value={pkg.id}>
                          {pkg.name} — {pkg.duration} Days ({formatCurrency(pkg.price)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button type="submit" className="btn btn-primary btn-block">
                    <RefreshCw size={16} style={{ marginRight: '8px' }} />
                    Process Renewal & Pay
                  </button>
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

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxH: '250px', overflowY: 'auto' }}>
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
                </div>
              </div>
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
    </>
  );
}
