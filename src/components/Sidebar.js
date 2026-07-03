'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getInitials } from '@/utils/formatters';
import {
  LayoutDashboard,
  Users,
  Building2,
  UserCog,
  CreditCard,
  Dumbbell,
  LogOut,
  X,
  User,
  Package,
  MessageSquare,
  ClipboardList,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'Overview', roles: ['Admin', 'Manager', 'Staff', 'Trainer', 'Customer'] },
  { href: '/dashboard/members', label: 'Members', icon: Users, section: 'Management', roles: ['Admin', 'Manager', 'Staff'] },
  { href: '/dashboard/branches', label: 'Branches', icon: Building2, section: 'Management', roles: ['Admin', 'Manager', 'Staff'] },
  { href: '/dashboard/packages', label: 'Packages', icon: Package, section: 'Management', roles: ['Admin'] },
  { href: '/dashboard/questionnaire', label: 'Questionnaire', icon: ClipboardList, section: 'Management', roles: ['Admin'] },
  { href: '/dashboard/staff', label: 'Staff', icon: UserCog, section: 'Management', roles: ['Admin', 'Manager', 'Staff'] },
  { href: '/dashboard/payments', label: 'Payments', icon: CreditCard, section: 'Finance', roles: ['Admin', 'Manager', 'Staff'] },
  { href: '/dashboard/inquiries', label: 'Support Inquiries', icon: MessageSquare, section: 'Support', roles: ['Admin', 'Manager', 'Staff', 'Customer'] },
  { href: '/dashboard/profile', label: 'My Profile', icon: User, section: 'Personal', roles: ['Admin', 'Manager', 'Staff', 'Trainer', 'Customer'] },
  { href: '/dashboard/membership', label: 'Membership Status', icon: Dumbbell, section: 'Personal', roles: ['Trainer', 'Customer'] },
];

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Filter items by role
  const userRole = user?.role || 'Customer';
  const filteredNavItems = navItems.filter(item => item.roles.includes(userRole));

  // Group nav items by section
  const sections = filteredNavItems.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});

  const isActive = (href) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'visible' : ''}`}
        onClick={onClose}
      />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Dumbbell size={22} color="white" />
          </div>
          <div className="sidebar-brand">
            <h2>POWER <span>WORLD</span></h2>
            <p>ERP System</p>
          </div>
          <button
            className="mobile-menu-btn"
            onClick={onClose}
            style={{ marginLeft: 'auto', display: isOpen ? 'flex' : undefined }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {Object.entries(sections).map(([section, items]) => (
            <div key={section} className="sidebar-section">
              <div className="sidebar-section-title">{section}</div>
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`}
                    onClick={onClose}
                  >
                    <Icon size={20} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer / User */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {getInitials(user?.name)}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">{user?.role}</div>
            </div>
            <button
              onClick={logout}
              title="Sign out"
              style={{ color: 'var(--text-tertiary)', padding: '4px' }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
