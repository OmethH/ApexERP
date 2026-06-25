'use client';

import { useMemo } from 'react';
import { useData } from '@/context/DataContext';
import Header from '@/components/Header';
import { formatCurrency } from '@/utils/formatters';
import { Building2, Users, UserCog, DollarSign, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function BranchesPage() {
  const { branches, members, staff, payments } = useData();

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

  return (
    <>
      <Header title="Branches" subtitle="Branch Management" />
      <div className="dashboard-content">
        <div className="page-header">
          <div className="page-header-left">
            <h1>Branch Management</h1>
            <p>Overview of all Power World locations</p>
          </div>
        </div>

        <div className="branches-grid stagger-children">
          {branchStats.map(branch => (
            <Link key={branch.id} href={`/dashboard/branches/${branch.id}`} style={{ textDecoration: 'none' }}>
              <div className="branch-card">
                <div className="branch-card-header">
                  <div className="branch-card-icon">
                    <Building2 />
                  </div>
                  <div>
                    <h3 className="branch-card-name">{branch.name.replace('Power World ', '')}</h3>
                    <p className="branch-card-location">
                      <MapPin size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                      {branch.location}
                    </p>
                  </div>
                </div>
                <div className="branch-card-stats">
                  <div className="branch-stat">
                    <div className="branch-stat-value" style={{ color: 'var(--info)' }}>{branch.totalMembers}</div>
                    <div className="branch-stat-label">Members</div>
                  </div>
                  <div className="branch-stat">
                    <div className="branch-stat-value" style={{ color: 'var(--success)' }}>{branch.totalStaff}</div>
                    <div className="branch-stat-label">Staff</div>
                  </div>
                  <div className="branch-stat">
                    <div className="branch-stat-value" style={{ color: 'var(--warning)' }}>
                      {branch.revenue >= 1000000 ? `${(branch.revenue / 1000000).toFixed(1)}M` : `${(branch.revenue / 1000).toFixed(0)}K`}
                    </div>
                    <div className="branch-stat-label">Revenue</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
