'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Role-based route protection
    if (user.role === 'Trainer') {
      const allowedPaths = ['/dashboard', '/dashboard/profile', '/dashboard/membership'];
      if (!allowedPaths.includes(pathname)) {
        router.push('/dashboard');
      }
    } else if (user.role === 'Customer') {
      const allowedPaths = ['/dashboard', '/dashboard/profile', '/dashboard/membership', '/dashboard/inquiries'];
      if (!allowedPaths.includes(pathname)) {
        router.push('/dashboard');
      }
    }
  }, [user, router, pathname]);

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="dashboard-main">
        {children}
      </main>
    </div>
  );
}
