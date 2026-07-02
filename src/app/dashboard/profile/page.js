'use client';

import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import Header from '@/components/Header';
import Badge from '@/components/Badge';
import { formatDate, getInitials } from '@/utils/formatters';
import { Mail, Phone, MapPin, Calendar, Building2, Shield, User } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const { members, staff = [], branches } = useData();

  // Find detailed record based on role
  const profileDetails = useMemo(() => {
    if (!user) return null;

    if (user.role === 'Customer') {
      const memberRecord = members.find(m => m.id === user.memberId || m.email === user.email);
      if (memberRecord) {
        const branch = branches.find(b => b.id === memberRecord.branchId);
        return {
          type: 'customer',
          id: memberRecord.id,
          name: memberRecord.fullName,
          email: memberRecord.email,
          phone: memberRecord.phone,
          gender: memberRecord.gender,
          dateOfBirth: memberRecord.dateOfBirth,
          address: memberRecord.address,
          branchName: branch?.name.replace('Power World ', '') || 'N/A',
          joinDate: memberRecord.joinDate,
          emergencyContact: memberRecord.emergencyContact,
          status: memberRecord.status,
          packageName: memberRecord.packageName,
        };
      }
    } else {
      // Admin, Manager, Staff, Trainer
      const staffRecord = staff.find(s => s.id === user.staffId || s.email === user.email);
      if (staffRecord) {
        const branch = branches.find(b => b.id === staffRecord.branchId);
        return {
          type: 'staff',
          id: staffRecord.id,
          name: staffRecord.fullName,
          email: staffRecord.email,
          phone: staffRecord.phone,
          role: staffRecord.role,
          branchName: branch?.name.replace('Power World ', '') || 'All Branches',
          joinDate: staffRecord.joinDate,
          salary: staffRecord.salary,
          status: staffRecord.status,
        };
      }
    }

    // Default fallback to session user
    return {
      type: 'user',
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: 'active',
    };
  }, [user, members, staff, branches]);

  if (!profileDetails) {
    return (
      <>
        <Header title="My Profile" />
        <div className="dashboard-content">
          <div className="empty-state">
            <User size={48} />
            <h3>No profile session active</h3>
            <p>Please sign in to view your profile.</p>
          </div>
        </div>
      </>
    );
  }

  const initials = getInitials(profileDetails.name);

  return (
    <>
      <Header title="My Profile" subtitle="Manage your personal details" />
      <div className="dashboard-content">
        <div className="profile-grid" style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Main profile card */}
          <div className="profile-sidebar" style={{ width: '100%' }}>
            <div className="profile-card animate-fade-in" style={{ padding: '32px 24px' }}>
              <div className="profile-avatar" style={{ width: '96px', height: '96px', fontSize: '32px', margin: '0 auto 16px auto' }}>
                {initials}
              </div>
              <h2 className="profile-name" style={{ textAlign: 'center', fontSize: '24px' }}>{profileDetails.name}</h2>
              <p className="profile-email" style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '16px' }}>{profileDetails.email}</p>
              
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                <Badge status={profileDetails.status}>
                  {profileDetails.role || (profileDetails.type === 'customer' ? 'Gym Member' : 'Active')}
                </Badge>
              </div>

              <div className="profile-details" style={{ borderTop: '1px solid #222', paddingTop: '20px' }}>
                <div className="profile-detail-row">
                  <span className="profile-detail-label">User ID</span>
                  <span className="profile-detail-value">{profileDetails.id}</span>
                </div>
                
                {profileDetails.type === 'customer' && (
                  <>
                    <div className="profile-detail-row">
                      <span className="profile-detail-label">Gender</span>
                      <span className="profile-detail-value">{profileDetails.gender}</span>
                    </div>
                    <div className="profile-detail-row">
                      <span className="profile-detail-label">Date of Birth</span>
                      <span className="profile-detail-value">{formatDate(profileDetails.dateOfBirth)}</span>
                    </div>
                  </>
                )}

                <div className="profile-detail-row">
                  <span className="profile-detail-label">Phone</span>
                  <span className="profile-detail-value">{profileDetails.phone || 'N/A'}</span>
                </div>

                <div className="profile-detail-row">
                  <span className="profile-detail-label">Home Branch</span>
                  <span className="profile-detail-value">
                    <Building2 size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                    {profileDetails.branchName || 'All Branches'}
                  </span>
                </div>

                <div className="profile-detail-row">
                  <span className="profile-detail-label">Joined Date</span>
                  <span className="profile-detail-value">
                    <Calendar size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                    {profileDetails.joinDate ? formatDate(profileDetails.joinDate) : 'N/A'}
                  </span>
                </div>

                {profileDetails.type === 'customer' && (
                  <>
                    <div className="profile-detail-row">
                      <span className="profile-detail-label">Emergency Contact</span>
                      <span className="profile-detail-value">{profileDetails.emergencyContact || 'N/A'}</span>
                    </div>
                    <div className="profile-detail-row">
                      <span className="profile-detail-label">Current Plan</span>
                      <span className="profile-detail-value" style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{profileDetails.packageName || 'N/A'}</span>
                    </div>
                  </>
                )}

                {profileDetails.type === 'staff' && profileDetails.role === 'Trainer' && (
                  <div className="profile-detail-row">
                    <span className="profile-detail-label">Assigned Branch</span>
                    <span className="profile-detail-value">{profileDetails.branchName}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right section for extra details if Customer */}
          {profileDetails.type === 'customer' && (
            <div className="profile-main" style={{ width: '100%' }}>
              <div className="card animate-fade-in" style={{ height: '100%' }}>
                <h3 className="card-title" style={{ marginBottom: '20px' }}>Contact & Address Info</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <MapPin size={20} color="var(--accent-primary)" style={{ marginTop: '2px' }} />
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Residential Address</div>
                      <div style={{ fontSize: '14px', color: 'white', marginTop: '4px', lineHeight: '1.5' }}>
                        {profileDetails.address || 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', borderTop: '1px solid #222', paddingTop: '16px' }}>
                    <Mail size={20} color="var(--accent-primary)" style={{ marginTop: '2px' }} />
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Email Communication</div>
                      <div style={{ fontSize: '14px', color: 'white', marginTop: '4px' }}>
                        {profileDetails.email}
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Primary address for receipts and notifications</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', borderTop: '1px solid #222', paddingTop: '16px' }}>
                    <Shield size={20} color="var(--accent-primary)" style={{ marginTop: '2px' }} />
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Security & Policies</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.5' }}>
                        Your personal information is secure. To update your residential address or emergency contacts, please visit the reception desk at your home branch or speak to a branch manager.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Right section for extra details if Trainer/Staff */}
          {profileDetails.type === 'staff' && (
            <div className="profile-main" style={{ width: '100%' }}>
              <div className="card animate-fade-in" style={{ height: '100%' }}>
                <h3 className="card-title" style={{ marginBottom: '20px' }}>Employment Details</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <Shield size={20} color="var(--accent-primary)" style={{ marginTop: '2px' }} />
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Position & Role</div>
                      <div style={{ fontSize: '15px', color: 'white', marginTop: '4px', fontWeight: 600 }}>
                        {profileDetails.role}
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Standard staff employment contract rules apply</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', borderTop: '1px solid #222', paddingTop: '16px' }}>
                    <Building2 size={20} color="var(--accent-primary)" style={{ marginTop: '2px' }} />
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Reporting Location</div>
                      <div style={{ fontSize: '14px', color: 'white', marginTop: '4px' }}>
                        {profileDetails.branchName} Branch
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', borderTop: '1px solid #222', paddingTop: '16px' }}>
                    <Mail size={20} color="var(--accent-primary)" style={{ marginTop: '2px' }} />
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Corporate Email</div>
                      <div style={{ fontSize: '14px', color: 'white', marginTop: '4px' }}>
                        {profileDetails.email}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
