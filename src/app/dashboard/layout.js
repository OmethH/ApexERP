'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import QuestionnaireWizard from '@/components/QuestionnaireWizard';

export default function DashboardLayout({ children }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [questions, setQuestions] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQuestionsAndSubmissions = async () => {
    try {
      const [qRes, sRes] = await Promise.all([
        fetch('/api/questions'),
        fetch('/api/submissions')
      ]);
      if (qRes.ok && sRes.ok) {
        const qData = await qRes.json();
        const sData = await sRes.json();
        setQuestions(Array.isArray(qData) ? qData : []);
        setSubmissions(Array.isArray(sData) ? sData : []);
      }
    } catch (err) {
      console.error('Failed to load questionnaire data in layout:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchQuestionsAndSubmissions();
    } else {
      setLoading(false);
    }
  }, [user]);

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

  if (!user || loading) {
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

  const handleQuestionnaireSubmit = async (answers) => {
    try {
      const memberId = user.memberId || `MEM${String(Date.now()).slice(-3)}`;
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId,
          memberName: user.name,
          email: user.email,
          answers,
        }),
      });
      if (res.ok) {
        await fetchQuestionsAndSubmissions();
      } else {
        throw new Error('Failed to submit onboarding answers');
      }
    } catch (err) {
      console.error('Failed to submit questionnaire:', err);
      alert(err.message);
    }
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
