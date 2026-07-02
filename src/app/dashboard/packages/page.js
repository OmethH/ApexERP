'use client';

import { useMemo, useState, useCallback } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import { formatCurrency } from '@/utils/formatters';
import {
  Package, Plus, Pencil, Trash2, X, Users, Building2,
  Clock, Infinity, MapPin, CheckCircle, AlertTriangle,
  Thermometer, Wind, Lock, Globe, ChevronDown,
} from 'lucide-react';

function formatTime(timeStr) {
  if (!timeStr) return 'All Day';
  const [hoursStr, minutesStr] = timeStr.split(':');
  const hours = parseInt(hoursStr, 10);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutesStr} ${ampm}`;
}

// ─── Branch Access Label Helper ──────────────────────────────────────────────
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

// ─── Delete Confirmation Modal ──────────────────────────────────────────────
function DeleteConfirmModal({ pkg, activeMemberCount, onConfirm, onCancel }) {
  const hasMembers = activeMemberCount > 0;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="modal" style={{ maxWidth: '420px' }}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={20} color={hasMembers ? 'var(--warning)' : 'var(--error)'} />
            {hasMembers ? 'Deactivate Package?' : 'Delete Package?'}
          </h2>
          <button className="modal-close" onClick={onCancel}><X size={20} /></button>
        </div>
        <div className="modal-body">
          {hasMembers ? (
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.6 }}>
                <strong style={{ color: 'var(--warning)' }}>{activeMemberCount} active member{activeMemberCount > 1 ? 's' : ''}</strong> currently
                use the <strong style={{ color: 'var(--text-primary)' }}>{pkg.name}</strong> package.
                It will be marked as <strong>inactive</strong> instead of deleted — existing members keep their plan but
                no new members can select it.
              </p>
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.6 }}>
              Are you sure you want to permanently delete <strong style={{ color: 'var(--text-primary)' }}>{pkg.name}</strong>?
              This action cannot be undone.
            </p>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className={`btn ${hasMembers ? 'btn-primary' : 'btn-danger'}`} onClick={onConfirm}>
            {hasMembers ? 'Deactivate' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Package Form Modal ─────────────────────────────────────────────────────
function PackageFormModal({ pkg, branches, onClose, onSave }) {
  const isEdit = Boolean(pkg);

  const [form, setForm] = useState({
    name: pkg?.name || '',
    price: pkg?.price || '',
    durationType: pkg?.durationType || 'time-based',
    duration: pkg?.duration || 30,
    startTime: pkg?.startTime || '09:00',
    endTime: pkg?.endTime || '17:00',
    branchAccess: pkg?.branchAccess || 'all',
    allowedBranches: pkg?.allowedBranches || [],
    status: pkg?.status || 'active',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [branchPickerOpen, setBranchPickerOpen] = useState(false);

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const acBranches = branches.filter(b => b.isAC === true);
  const nonAcBranches = branches.filter(b => b.isAC === false);

  const toggleBranch = (branchId) => {
    setForm(prev => {
      const current = prev.allowedBranches || [];
      return {
        ...prev,
        allowedBranches: current.includes(branchId)
          ? current.filter(id => id !== branchId)
          : [...current, branchId],
      };
    });
  };

  const selectAllAC = () => {
    const acIds = acBranches.map(b => b.id);
    setForm(prev => {
      const current = new Set(prev.allowedBranches || []);
      acIds.forEach(id => current.add(id));
      return { ...prev, allowedBranches: [...current] };
    });
  };

  const selectAllNonAC = () => {
    const nonAcIds = nonAcBranches.map(b => b.id);
    setForm(prev => {
      const current = new Set(prev.allowedBranches || []);
      nonAcIds.forEach(id => current.add(id));
      return { ...prev, allowedBranches: [...current] };
    });
  };

  const selectAll = () => {
    setForm(prev => ({ ...prev, allowedBranches: branches.map(b => b.id) }));
  };

  const clearAll = () => {
    setForm(prev => ({ ...prev, allowedBranches: [] }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Package name is required';
    if (!form.price || Number(form.price) <= 0) errs.price = 'Price must be greater than 0';
    if (!form.duration || Number(form.duration) <= 0) errs.duration = 'Active duration must be at least 1 day';
    if (form.durationType === 'time-based') {
      if (!form.startTime) {
        errs.startTime = 'Start time is required';
      }
      if (!form.endTime) {
        errs.endTime = 'End time is required';
      } else if (form.startTime && form.startTime >= form.endTime) {
        errs.endTime = 'End time must be after start time';
      }
    }
    if (form.branchAccess === 'selected' && (form.allowedBranches || []).length === 0) {
      errs.allowedBranches = 'Select at least one branch';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 400));

    onSave({
      name: form.name.trim(),
      price: Number(form.price),
      durationType: form.durationType,
      duration: Number(form.duration),
      startTime: form.durationType === 'time-based' ? form.startTime : null,
      endTime: form.durationType === 'time-based' ? form.endTime : null,
      type: form.durationType === 'full-time' ? 'premium' : 'time-based',
      branchAccess: form.branchAccess,
      allowedBranches: form.branchAccess === 'selected' ? form.allowedBranches : [],
      status: form.status,
    });
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: 'var(--accent-muted)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)',
            }}>
              <Package size={20} />
            </div>
            <div>
              <h2 className="modal-title">{isEdit ? 'Edit Package' : 'Create Package'}</h2>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {isEdit ? 'Update package details and branch access rules' : 'Define package pricing, duration, and branch access'}
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Row: Name + Price */}
            <div className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Package Name <span style={{ color: 'var(--accent-primary)' }}>*</span></label>
                  <input
                    className={`form-input${errors.name ? ' form-input-error' : ''}`}
                    placeholder="e.g. Monthly AC Premium"
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                  />
                  {errors.name && <span className="form-error">{errors.name}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Price (LKR) <span style={{ color: 'var(--accent-primary)' }}>*</span></label>
                  <input
                    className={`form-input${errors.price ? ' form-input-error' : ''}`}
                    type="number"
                    min="0"
                    placeholder="5000"
                    value={form.price}
                    onChange={e => set('price', e.target.value)}
                  />
                  {errors.price && <span className="form-error">{errors.price}</span>}
                </div>
              </div>
            </div>

            {/* Active Duration Field */}
            <div className="form-group">
              <label className="form-label">Active Duration (Days) <span style={{ color: 'var(--accent-primary)' }}>*</span></label>
              <input
                className={`form-input${errors.duration ? ' form-input-error' : ''}`}
                type="number"
                min="1"
                placeholder="e.g. 30"
                value={form.duration}
                onChange={e => set('duration', e.target.value)}
              />
              {errors.duration && <span className="form-error">{errors.duration}</span>}
            </div>

            {/* Duration Type Toggle */}
            <div className="form-group">
              <label className="form-label">Duration Type</label>
              <div className="ac-toggle-group">
                <button
                  type="button"
                  className={`ac-toggle-btn${form.durationType === 'time-based' ? ' active' : ''}`}
                  onClick={() => set('durationType', 'time-based')}
                >
                  <Clock size={16} />
                  Time-Based
                  {form.durationType === 'time-based' && <CheckCircle size={14} style={{ marginLeft: 'auto', color: 'var(--success)' }} />}
                </button>
                <button
                  type="button"
                  className={`ac-toggle-btn${form.durationType === 'full-time' ? ' active' : ''}`}
                  onClick={() => set('durationType', 'full-time')}
                >
                  <Infinity size={16} />
                  Full-Time (Unlimited)
                  {form.durationType === 'full-time' && <CheckCircle size={14} style={{ marginLeft: 'auto', color: 'var(--success)' }} />}
                </button>
              </div>
            </div>

            {/* Daily Time Range — only for time-based */}
            {form.durationType === 'time-based' && (
              <div className="form-group">
                <label className="form-label">Daily Allowed Time Range <span style={{ color: 'var(--accent-primary)' }}>*</span></label>
                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>From</span>
                    <input
                      className={`form-input${errors.startTime ? ' form-input-error' : ''}`}
                      type="time"
                      value={form.startTime}
                      onChange={e => set('startTime', e.target.value)}
                    />
                    {errors.startTime && <span className="form-error">{errors.startTime}</span>}
                  </div>
                  <div>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>To</span>
                    <input
                      className={`form-input${errors.endTime ? ' form-input-error' : ''}`}
                      type="time"
                      value={form.endTime}
                      onChange={e => set('endTime', e.target.value)}
                    />
                    {errors.endTime && <span className="form-error">{errors.endTime}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Branch Access Rule */}
            <div className="form-group">
              <label className="form-label">Branch Access Rule</label>
              <div className="branch-access-options">
                {[
                  { value: 'all', label: 'All Branches', desc: 'Member can visit any gym location', icon: Globe },
                  { value: 'ac-only', label: 'AC Branches Only', desc: 'Only air-conditioned locations', icon: Thermometer },
                  { value: 'non-ac-only', label: 'Non-AC Branches Only', desc: 'Only non-AC locations', icon: Wind },
                  { value: 'selected', label: 'Select Specific Branches', desc: 'Choose individual gyms', icon: MapPin },
                  { value: 'purchase-branch', label: 'Purchase Branch Only', desc: 'Locked to the branch where purchased (e.g. couple package)', icon: Lock },
                ].map(opt => {
                  const Icon = opt.icon;
                  return (
                    <button
                      type="button"
                      key={opt.value}
                      className={`branch-access-btn${form.branchAccess === opt.value ? ' active' : ''}`}
                      onClick={() => set('branchAccess', opt.value)}
                    >
                      <div className="branch-access-btn-icon"><Icon size={16} /></div>
                      <div className="branch-access-btn-text">
                        <span className="branch-access-btn-label">{opt.label}</span>
                        <span className="branch-access-btn-desc">{opt.desc}</span>
                      </div>
                      {form.branchAccess === opt.value && (
                        <CheckCircle size={16} className="branch-access-check" />
                      )}
                    </button>
                  );
                })}
              </div>
              {errors.allowedBranches && <span className="form-error">{errors.allowedBranches}</span>}
            </div>

            {/* Branch Picker — visible when 'selected' */}
            {form.branchAccess === 'selected' && (
              <div className="form-group">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label className="form-label" style={{ margin: 0 }}>
                    Select Branches
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginLeft: '8px', fontWeight: 400 }}>
                      ({(form.allowedBranches || []).length} selected)
                    </span>
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button type="button" className="pkg-duration-chip" onClick={selectAllAC}>All AC</button>
                    <button type="button" className="pkg-duration-chip" onClick={selectAllNonAC}>All Non-AC</button>
                    <button type="button" className="pkg-duration-chip" onClick={selectAll}>All</button>
                    <button type="button" className="pkg-duration-chip" onClick={clearAll} style={{ color: 'var(--error)' }}>Clear</button>
                  </div>
                </div>
                <div className="branch-picker-grid">
                  {branches.map(branch => {
                    const isSelected = (form.allowedBranches || []).includes(branch.id);
                    return (
                      <button
                        type="button"
                        key={branch.id}
                        className={`branch-picker-item${isSelected ? ' selected' : ''}`}
                        onClick={() => toggleBranch(branch.id)}
                      >
                        <div className="branch-picker-check">
                          {isSelected && <CheckCircle size={14} />}
                        </div>
                        <div className="branch-picker-info">
                          <span className="branch-picker-name">{branch.name.replace('Power World ', '')}</span>
                          <span className="branch-picker-meta">
                            {branch.isAC ? <><Thermometer size={10} /> AC</> : <><Wind size={10} /> Non-AC</>}
                            {' · '}
                            {branch.location}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Status toggle */}
            <div className="form-group">
              <label className="form-label">Status</label>
              <div className="ac-toggle-group">
                <button
                  type="button"
                  className={`ac-toggle-btn${form.status === 'active' ? ' active' : ''}`}
                  onClick={() => set('status', 'active')}
                >
                  <CheckCircle size={16} />
                  Active
                  {form.status === 'active' && <CheckCircle size={14} style={{ marginLeft: 'auto', color: 'var(--success)' }} />}
                </button>
                <button
                  type="button"
                  className={`ac-toggle-btn${form.status === 'inactive' ? ' active non-ac' : ''}`}
                  onClick={() => set('status', 'inactive')}
                >
                  <X size={16} />
                  Inactive
                  {form.status === 'inactive' && <CheckCircle size={14} style={{ marginLeft: 'auto', color: 'var(--info)' }} />}
                </button>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? (
                <><span className="spinner" style={{ width: 16, height: 16 }} /> Saving…</>
              ) : (
                isEdit ? 'Save Changes' : 'Create Package'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Packages Page ─────────────────────────────────────────────────────
export default function PackagesPage() {
  const { packages, branches, members, addPackage, updatePackage, deletePackage } = useData();
  const { isAdmin } = useAuth();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showInactive, setShowInactive] = useState(false);

  // Stats per package
  const pkgStats = useMemo(() => {
    const map = {};
    packages.forEach(pkg => {
      const membersOnPkg = members.filter(m => m.packageId === pkg.id);
      const activeMembers = membersOnPkg.filter(m => m.status === 'active').length;
      map[pkg.id] = { total: membersOnPkg.length, active: activeMembers };
    });
    return map;
  }, [packages, members]);

  // Resolve allowed branches list for display
  const resolveAccessBranches = useCallback((pkg) => {
    switch (pkg.branchAccess) {
      case 'all': return branches;
      case 'ac-only': return branches.filter(b => b.isAC === true);
      case 'non-ac-only': return branches.filter(b => b.isAC === false);
      case 'selected': return branches.filter(b => (pkg.allowedBranches || []).includes(b.id));
      case 'purchase-branch': return [];
      default: return branches;
    }
  }, [branches]);

  const filteredPackages = showInactive ? packages : packages.filter(p => p.status === 'active');

  const openCreate = useCallback(() => { setEditingPkg(null); setModalOpen(true); }, []);
  const openEdit = useCallback((pkg) => { setEditingPkg(pkg); setModalOpen(true); }, []);
  const openDelete = useCallback((pkg) => { setDeleteTarget(pkg); }, []);

  const handleSave = useCallback((data) => {
    if (editingPkg) {
      updatePackage(editingPkg.id, data);
    } else {
      addPackage(data);
    }
    setModalOpen(false);
    setEditingPkg(null);
  }, [editingPkg, addPackage, updatePackage]);

  const handleDelete = useCallback(() => {
    if (deleteTarget) {
      deletePackage(deleteTarget.id);
      setDeleteTarget(null);
    }
  }, [deleteTarget, deletePackage]);

  const activeCount = packages.filter(p => p.status === 'active').length;
  const inactiveCount = packages.filter(p => p.status === 'inactive').length;

  return (
    <>
      <Header title="Packages" subtitle="Membership Package Management" />
      <div className="dashboard-content">
        <div className="page-header">
          <div className="page-header-left">
            <h1>Membership Packages</h1>
            <p>{activeCount} active package{activeCount !== 1 ? 's' : ''}{inactiveCount > 0 ? ` · ${inactiveCount} inactive` : ''}</p>
          </div>
          <div className="page-header-right">
            {inactiveCount > 0 && (
              <button
                className={`btn btn-sm ${showInactive ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setShowInactive(!showInactive)}
              >
                {showInactive ? 'Hide' : 'Show'} Inactive
              </button>
            )}
            {isAdmin && (
              <button className="btn btn-primary" onClick={openCreate}>
                <Plus size={18} /> Create Package
              </button>
            )}
          </div>
        </div>

        {/* Packages Grid */}
        <div className="pkg-grid stagger-children">
          {filteredPackages.map(pkg => {
            const stats = pkgStats[pkg.id] || { total: 0, active: 0 };
            const AccessIcon = getBranchAccessIcon(pkg.branchAccess);
            const accessColors = getBranchAccessColor(pkg.branchAccess);
            const accessBranches = resolveAccessBranches(pkg);
            const isInactive = pkg.status === 'inactive';

            return (
              <div key={pkg.id} className={`pkg-card${isInactive ? ' pkg-card-inactive' : ''}`}>
                {/* Inactive overlay */}
                {isInactive && (
                  <div className="pkg-inactive-badge">INACTIVE</div>
                )}

                {/* Header */}
                <div className="pkg-card-header">
                  <div className="pkg-card-icon">
                    <Package size={20} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 className="pkg-card-name">{pkg.name}</h3>
                    <div className="pkg-card-price">{formatCurrency(pkg.price)}</div>
                  </div>
                  {isAdmin && (
                    <div className="pkg-card-actions">
                      <button className="table-action-btn" title="Edit" onClick={() => openEdit(pkg)}>
                        <Pencil size={14} />
                      </button>
                      <button className="table-action-btn danger" title="Delete" onClick={() => openDelete(pkg)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Duration Badge */}
                <div className="pkg-card-badges">
                  <span className="pkg-badge pkg-badge-duration">
                    {pkg.durationType === 'full-time' ? (
                      <><Infinity size={12} /> Full-Time</>
                    ) : (
                      <><Clock size={12} /> Time-Based</>
                    )}
                  </span>
                  {pkg.durationType === 'time-based' && pkg.startTime && pkg.endTime && (
                    <span className="pkg-badge pkg-badge-duration" style={{ borderStyle: 'dashed' }}>
                      <Clock size={12} /> {formatTime(pkg.startTime)} - {formatTime(pkg.endTime)}
                    </span>
                  )}
                  <span className="pkg-badge" style={{ background: accessColors.bg, color: accessColors.color }}>
                    <AccessIcon size={12} />
                    {getBranchAccessLabel(pkg, branches)}
                  </span>
                </div>

                {/* Branch list (for 'selected' mode) */}
                {pkg.branchAccess === 'selected' && accessBranches.length > 0 && (
                  <div className="pkg-branch-list">
                    {accessBranches.slice(0, 4).map(b => (
                      <span key={b.id} className="pkg-branch-chip">
                        {b.isAC ? <Thermometer size={9} /> : <Wind size={9} />}
                        {b.name.replace('Power World ', '')}
                      </span>
                    ))}
                    {accessBranches.length > 4 && (
                      <span className="pkg-branch-chip pkg-branch-more">+{accessBranches.length - 4} more</span>
                    )}
                  </div>
                )}

                {/* Access info for other modes */}
                {pkg.branchAccess !== 'selected' && pkg.branchAccess !== 'purchase-branch' && accessBranches.length > 0 && (
                  <div className="pkg-access-summary">
                    <Building2 size={12} style={{ opacity: 0.5 }} />
                    <span>{accessBranches.length} branch{accessBranches.length !== 1 ? 'es' : ''} accessible</span>
                  </div>
                )}

                {pkg.branchAccess === 'purchase-branch' && (
                  <div className="pkg-access-summary" style={{ color: 'var(--warning)' }}>
                    <Lock size={12} style={{ opacity: 0.6 }} />
                    <span>Locked to purchase branch</span>
                  </div>
                )}

                {/* Footer: member count */}
                <div className="pkg-card-footer">
                  <div className="pkg-card-members">
                    <Users size={13} style={{ opacity: 0.5 }} />
                    <span>{stats.active} active</span>
                    {stats.total > stats.active && (
                      <span style={{ color: 'var(--text-tertiary)' }}>/ {stats.total} total</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Empty state */}
          {filteredPackages.length === 0 && (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
              <Package size={48} />
              <h3>No packages found</h3>
              <p>{showInactive ? 'No packages exist yet.' : 'No active packages. Try showing inactive ones.'}</p>
              {isAdmin && (
                <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={openCreate}>
                  <Plus size={16} /> Create Package
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {modalOpen && (
        <PackageFormModal
          pkg={editingPkg}
          branches={branches}
          onClose={() => { setModalOpen(false); setEditingPkg(null); }}
          onSave={handleSave}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          pkg={deleteTarget}
          activeMemberCount={(pkgStats[deleteTarget.id] || {}).active || 0}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
