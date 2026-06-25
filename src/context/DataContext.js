'use client';

import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import {
  members as initialMembers,
  staff as initialStaff,
  payments as initialPayments,
  branches,
  packages,
} from '@/data/mockData';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [members, setMembers] = useState(initialMembers);
  const [staffList, setStaffList] = useState(initialStaff);
  const [paymentsList, setPaymentsList] = useState(initialPayments);

  // --- Member CRUD ---
  const addMember = useCallback((memberData) => {
    const newMember = {
      ...memberData,
      id: `MEM${String(members.length + 1).padStart(3, '0')}`,
      joinDate: new Date().toISOString().split('T')[0],
    };
    setMembers(prev => [newMember, ...prev]);
    return newMember;
  }, [members.length]);

  const updateMember = useCallback((id, updates) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  }, []);

  const deleteMember = useCallback((id) => {
    setMembers(prev => prev.filter(m => m.id !== id));
  }, []);

  const getMemberById = useCallback((id) => {
    return members.find(m => m.id === id);
  }, [members]);

  const renewMembership = useCallback((memberId, packageId) => {
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg) return;

    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + pkg.duration * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    setMembers(prev => prev.map(m =>
      m.id === memberId
        ? { ...m, packageId, packageName: pkg.name, membershipStart: startDate, membershipEnd: endDate, status: 'active' }
        : m
    ));

    // Also record payment
    addPayment({
      memberId,
      memberName: members.find(m => m.id === memberId)?.fullName || '',
      branchId: members.find(m => m.id === memberId)?.branchId || '',
      amount: pkg.price,
      packageId,
      packageName: pkg.name,
      method: 'Cash',
    });
  }, [members]);

  // --- Staff CRUD ---
  const addStaffMember = useCallback((staffData) => {
    const newStaff = {
      ...staffData,
      id: `STF${String(staffList.length + 1).padStart(3, '0')}`,
      joinDate: new Date().toISOString().split('T')[0],
      status: 'active',
    };
    setStaffList(prev => [newStaff, ...prev]);
    return newStaff;
  }, [staffList.length]);

  const updateStaff = useCallback((id, updates) => {
    setStaffList(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const deleteStaff = useCallback((id) => {
    setStaffList(prev => prev.filter(s => s.id !== id));
  }, []);

  // --- Payment CRUD ---
  const addPayment = useCallback((paymentData) => {
    const newPayment = {
      ...paymentData,
      id: `PAY${String(paymentsList.length + 1).padStart(4, '0')}`,
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      receiptNo: `RCP-${String(paymentsList.length + 1).padStart(5, '0')}`,
    };
    setPaymentsList(prev => [newPayment, ...prev]);
    return newPayment;
  }, [paymentsList.length]);

  // --- Computed Stats ---
  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthKey = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;

    const activeMembers = members.filter(m => m.status === 'active').length;
    const expiredMembers = members.filter(m => m.status === 'expired').length;
    const pendingMembers = members.filter(m => m.status === 'pending').length;

    const thisMonthRevenue = paymentsList
      .filter(p => p.date.startsWith(thisMonth))
      .reduce((sum, p) => sum + p.amount, 0);

    const lastMonthRevenue = paymentsList
      .filter(p => p.date.startsWith(lastMonthKey))
      .reduce((sum, p) => sum + p.amount, 0);

    const revenueTrend = lastMonthRevenue > 0
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
      : 0;

    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const expiringSoon = members.filter(m => {
      const endDate = new Date(m.membershipEnd);
      return endDate >= now && endDate <= sevenDaysFromNow && m.status === 'active';
    });

    const recentRegistrations = [...members]
      .sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate))
      .slice(0, 10);

    return {
      totalMembers: members.length,
      activeMembers,
      expiredMembers,
      pendingMembers,
      totalStaff: staffList.length,
      totalBranches: branches.length,
      thisMonthRevenue,
      lastMonthRevenue,
      revenueTrend,
      totalRevenue: paymentsList.reduce((sum, p) => sum + p.amount, 0),
      expiringSoon,
      recentRegistrations,
    };
  }, [members, staffList, paymentsList]);

  const value = {
    members,
    staff: staffList,
    payments: paymentsList,
    branches,
    packages,
    stats,
    addMember,
    updateMember,
    deleteMember,
    getMemberById,
    renewMembership,
    addStaffMember,
    updateStaff,
    deleteStaff,
    addPayment,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
