'use client';

import { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import { formatCurrency } from '@/utils/formatters';
import {
  Building2, Users, UserCog, DollarSign, MapPin, Plus, Pencil, X,
  Wind, Thermometer, ImagePlus, ExternalLink, CheckCircle,
} from 'lucide-react';
import Link from 'next/link';

// ─── Branch Form Modal ──────────────────────────────────────────────────────
function BranchFormModal({ branch, onClose, onSave }) {
  const isEdit = Boolean(branch);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: branch?.name || '',
    address: branch?.address || '',
    isAC: branch?.isAC ?? true,
    googleMapsLink: branch?.googleMapsLink || '',
    image: branch?.image || null,
  });
  const [imagePreview, setImagePreview] = useState(branch?.image || null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setImagePreview(base64);
      set('image', base64);
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Branch name is required';
    if (!form.address.trim()) errs.address = 'Address is required';
    if (form.googleMapsLink && !/^https?:\/\//i.test(form.googleMapsLink)) {
      errs.googleMapsLink = 'Must be a valid URL starting with http:// or https://';
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
      address: form.address.trim(),
      location: form.address.trim().split(',').pop()?.trim() || form.address.trim(),
      isAC: form.isAC,
      googleMapsLink: form.googleMapsLink.trim() || null,
      image: form.image || null,
    });
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal branch-modal" style={{ maxWidth: '600px' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: 'var(--accent-muted)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)',
            }}>
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="modal-title">{isEdit ? 'Edit Branch' : 'Add New Branch'}</h2>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {isEdit ? 'Update branch details' : 'Fill in the details for the new branch'}
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Branch Image Upload */}
            <div className="branch-form-section">
              <label className="form-label">Branch Photo</label>
              <div
                className="branch-image-upload"
                onClick={() => fileInputRef.current?.click()}
                style={imagePreview ? { padding: 0, border: 'none', overflow: 'hidden', height: '180px' } : {}}
              >
                {imagePreview ? (
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <img
                      src={imagePreview}
                      alt="Branch preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }}
                    />
                    <div className="branch-image-overlay">
                      <ImagePlus size={20} />
                      <span>Change Photo</span>
                    </div>
                  </div>
                ) : (
                  <div className="branch-image-placeholder">
                    <div className="branch-image-icon"><ImagePlus size={28} /></div>
                    <p className="branch-image-text">Click to upload branch photo</p>
                    <p className="branch-image-hint">JPG, PNG or WebP — recommended 1200×600px</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />
            </div>

            {/* Branch Name */}
            <div className="form-group">
              <label className="form-label">Branch Name <span style={{ color: 'var(--accent-primary)' }}>*</span></label>
              <input
                className={`form-input${errors.name ? ' form-input-error' : ''}`}
                placeholder="e.g. Power World Colombo"
                value={form.name}
                onChange={e => set('name', e.target.value)}
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            {/* Address */}
            <div className="form-group">
              <label className="form-label">Address <span style={{ color: 'var(--accent-primary)' }}>*</span></label>
              <textarea
                className={`form-input form-textarea${errors.address ? ' form-input-error' : ''}`}
                placeholder="e.g. 45, Galle Road, Colombo 03"
                rows={2}
                value={form.address}
                onChange={e => set('address', e.target.value)}
              />
              {errors.address && <span className="form-error">{errors.address}</span>}
            </div>

            {/* AC / Non-AC */}
            <div className="form-group">
              <label className="form-label">Facility Type</label>
              <div className="ac-toggle-group">
                <button
                  type="button"
                  className={`ac-toggle-btn${form.isAC ? ' active' : ''}`}
                  onClick={() => set('isAC', true)}
                >
                  <Thermometer size={16} />
                  Air Conditioned (AC)
                  {form.isAC && <CheckCircle size={14} style={{ marginLeft: 'auto', color: 'var(--success)' }} />}
                </button>
                <button
                  type="button"
                  className={`ac-toggle-btn${!form.isAC ? ' active non-ac' : ''}`}
                  onClick={() => set('isAC', false)}
                >
                  <Wind size={16} />
                  Non-AC
                  {!form.isAC && <CheckCircle size={14} style={{ marginLeft: 'auto', color: 'var(--info)' }} />}
                </button>
              </div>
            </div>

            {/* Google Maps Link */}
            <div className="form-group">
              <label className="form-label">
                Google Maps Link
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginLeft: '8px', fontWeight: 400 }}>
                  (shown as "Location" to customers)
                </span>
              </label>
              <div style={{ position: 'relative' }}>
                <MapPin size={16} style={{
                  position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--text-tertiary)', pointerEvents: 'none',
                }} />
                <input
                  className={`form-input${errors.googleMapsLink ? ' form-input-error' : ''}`}
                  style={{ paddingLeft: '36px' }}
                  placeholder="https://maps.google.com/..."
                  value={form.googleMapsLink}
                  onChange={e => set('googleMapsLink', e.target.value)}
                />
              </div>
              {errors.googleMapsLink && <span className="form-error">{errors.googleMapsLink}</span>}
              {form.googleMapsLink && !errors.googleMapsLink && (
                <a
                  href={form.googleMapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="branch-location-preview"
                >
                  <ExternalLink size={12} /> Preview Location Link
                </a>
              )}
            </div>

          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? (
                <><span className="spinner" style={{ width: 16, height: 16 }} /> Saving…</>
              ) : (
                isEdit ? 'Save Changes' : 'Add Branch'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function BranchesPage() {
  const [branches, setBranches] = useState([]);
  const [members, setMembers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBranches = useCallback(async () => {
    try {
      const res = await fetch('/api/branches');
      if (res.ok) {
        const data = await res.json();
        setBranches(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch branches:', err);
    }
  }, []);

  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch('/api/members');
      if (res.ok) {
        const data = await res.json();
        setMembers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch members:', err);
    }
  }, []);

  const fetchStaff = useCallback(async () => {
    try {
      const res = await fetch('/api/staff');
      if (res.ok) {
        const data = await res.json();
        setStaff(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch staff:', err);
    }
  }, []);

  const fetchPayments = useCallback(async () => {
    try {
      const res = await fetch('/api/payments');
      if (res.ok) {
        const data = await res.json();
        setPayments(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    }
  }, []);

  useEffect(() => {
    async function loadAll() {
      await Promise.all([fetchBranches(), fetchMembers(), fetchStaff(), fetchPayments()]);
      setLoading(false);
    }
    loadAll();
  }, [fetchBranches, fetchMembers, fetchStaff, fetchPayments]);

  const { isAdmin } = useAuth();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);

  const branchStats = useMemo(() => {
    return branches.map(branch => {
      const branchMembers = members.filter(m => m.branchId === branch.id);
      const branchStaff = staff.filter(s => s.branchId === branch.id);
      const branchPayments = payments.filter(p => p.branchId === branch.id);
      const revenue = branchPayments.reduce((sum, p) => sum + p.amount, 0);
      const activeMembers = branchMembers.filter(m => m.status === 'active').length;

      return {
        ...branch,
        totalMembers: branchMembers.length,
        activeMembers,
        totalStaff: branchStaff.length,
        revenue,
      };
    });
  }, [branches, members, staff, payments]);

  const openAdd = useCallback(() => {
    setEditingBranch(null);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((e, branch) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingBranch(branch);
    setModalOpen(true);
  }, []);

  const handleSave = useCallback(async (data) => {
    try {
      const url = editingBranch ? `/api/branches/${editingBranch.id}` : '/api/branches';
      const method = editingBranch ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save branch');
      }

      await fetchBranches();
      setModalOpen(false);
      setEditingBranch(null);
    } catch (err) {
      console.error('Failed to save branch:', err);
      alert(err.message || 'Error saving branch');
    }
  }, [editingBranch, fetchBranches]);

  if (loading) {
    return (
      <>
        <Header title="Branches" subtitle="Branch Management" />
        <div className="dashboard-content">
          <div className="empty-state">
            <div className="spinner" />
            <h3>Loading Branches...</h3>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Branches" subtitle="Branch Management" />
      <div className="dashboard-content">
        <div className="page-header">
          <div className="page-header-left">
            <h1>Branch Management</h1>
            <p>{branches.length} location{branches.length !== 1 ? 's' : ''} across Sri Lanka</p>
          </div>
          {isAdmin && (
            <div className="page-header-right">
              <button className="btn btn-primary" onClick={openAdd}>
                <Plus size={18} /> Add Branch
              </button>
            </div>
          )}
        </div>

        <div className="branches-grid stagger-children">
          {branchStats.map(branch => (
            <Link key={branch.id} href={`/dashboard/branches/${branch.id}`} style={{ textDecoration: 'none' }}>
              <div className="branch-card">
                {/* Branch Hero Image */}
                {branch.image && (
                  <div className="branch-card-image">
                    <img src={branch.image} alt={branch.name} />
                    {/* AC Badge over image */}
                    <span className={`branch-ac-badge${branch.isAC ? '' : ' non-ac'}`}>
                      {branch.isAC ? <><Thermometer size={11} /> AC</> : <><Wind size={11} /> Non-AC</>}
                    </span>
                  </div>
                )}

                <div className="branch-card-header">
                  <div className="branch-card-icon">
                    <Building2 />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <h3 className="branch-card-name">{branch.name.replace('Power World ', '')}</h3>
                      {/* Show AC badge inline if no image */}
                      {!branch.image && (
                        <span className={`branch-ac-badge-inline${branch.isAC ? '' : ' non-ac'}`}>
                          {branch.isAC ? <><Thermometer size={10} /> AC</> : <><Wind size={10} /> Non-AC</>}
                        </span>
                      )}
                    </div>
                    <p className="branch-card-location">
                      <MapPin size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                      {branch.location}
                    </p>
                  </div>

                  {/* Admin Edit Button */}
                  {isAdmin && (
                    <button
                      className="branch-edit-btn"
                      title="Edit Branch"
                      onClick={e => openEdit(e, branch)}
                    >
                      <Pencil size={14} />
                    </button>
                  )}
                </div>

                <div className="branch-card-stats">
                  <div className="branch-stat">
                    <div className="branch-stat-value" style={{ color: 'var(--info)' }}>
                      <Users size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle', opacity: 0.7 }} />
                      {branch.totalMembers}
                    </div>
                    <div className="branch-stat-label">Members</div>
                  </div>
                  <div className="branch-stat">
                    <div className="branch-stat-value" style={{ color: 'var(--success)' }}>
                      <UserCog size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle', opacity: 0.7 }} />
                      {branch.totalStaff}
                    </div>
                    <div className="branch-stat-label">Staff</div>
                  </div>
                  <div className="branch-stat">
                    <div className="branch-stat-value" style={{ color: 'var(--warning)' }}>
                      {branch.revenue >= 1000000 ? `${(branch.revenue / 1000000).toFixed(1)}M` : `${(branch.revenue / 1000).toFixed(0)}K`}
                    </div>
                    <div className="branch-stat-label">Revenue</div>
                  </div>
                </div>

                {/* Location link if available */}
                {branch.googleMapsLink && (
                  <div className="branch-card-location-link" onClick={e => e.stopPropagation()}>
                    <a
                      href={branch.googleMapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="branch-location-link"
                    >
                      <MapPin size={12} /> Location
                      <ExternalLink size={11} style={{ marginLeft: '2px' }} />
                    </a>
                  </div>
                )}
              </div>
            </Link>
          ))}

          {/* Add Branch Placeholder (admin only, when no branches exist or as extra card) */}
          {isAdmin && branches.length === 0 && (
            <div className="branch-card branch-card-add" onClick={openAdd}>
              <div style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>
                <Plus size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />
                <p style={{ fontWeight: 600 }}>Add your first branch</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <BranchFormModal
          branch={editingBranch}
          onClose={() => { setModalOpen(false); setEditingBranch(null); }}
          onSave={handleSave}
        />
      )}
    </>
  );
}
