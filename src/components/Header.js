'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Bell, LogOut, Menu } from 'lucide-react';
import { getInitials } from '@/utils/formatters';

export default function Header({ title, subtitle, onMenuClick }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="mobile-menu-btn" onClick={onMenuClick}>
          <Menu size={22} />
        </button>
        <div>
          <h1 className="header-title">{title}</h1>
          {subtitle && (
            <div className="header-breadcrumb">
              <span>{subtitle}</span>
            </div>
          )}
        </div>
      </div>
      <div className="header-right">
        <button className="header-icon-btn" title="Notifications">
          <Bell size={20} />
          <span className="notification-dot" />
        </button>
        <button className="header-logout-btn" onClick={handleLogout}>
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </header>
  );
}
