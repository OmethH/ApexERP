'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import Sidebar from '@/components/Sidebar';
import QuestionnaireWizard from '@/components/QuestionnaireWizard';

export default function DashboardLayout({ children }) {
  const { user } = useAuth();
  const { questions, submissions, submitAnswers, isLoaded } = useData();
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

  if (!user || !isLoaded) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  // Questionnaire interception for new customers
  const isCustomer = user.role === 'Customer';
  const hasSubmitted = isCustomer && submissions.some(
    s => s.memberId === user.memberId || s.email?.toLowerCase() === user.email?.toLowerCase()
  );

  const handleQuestionnaireSubmit = (answers) => {
    const memberId = user.memberId || `MEM${String(Date.now()).slice(-3)}`;
    submitAnswers(memberId, user.name, user.email, answers);
  };

  if (isCustomer && !hasSubmitted) {
    return (
      <QuestionnaireWizard
        user={user}
        questions={questions}
        onSubmit={handleQuestionnaireSubmit}
      />
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
