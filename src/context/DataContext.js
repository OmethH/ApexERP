'use client';

import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import {
  members as initialMembers,
  staff as initialStaff,
  payments as initialPayments,
  branches as initialBranches,
  packages as initialPackages,
} from '@/data/mockData';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [members, setMembers] = useState(initialMembers);
  const [staffList, setStaffList] = useState(initialStaff);
  const [paymentsList, setPaymentsList] = useState(initialPayments);
  const [branchesList, setBranchesList] = useState(initialBranches);
  const [packagesList, setPackagesList] = useState(initialPackages);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedMembers = localStorage.getItem('pw_members');
    const savedStaff = localStorage.getItem('pw_staff');
    const savedPayments = localStorage.getItem('pw_payments');
    const savedBranches = localStorage.getItem('pw_branches');
    const savedPackages = localStorage.getItem('pw_packages');

    if (savedMembers) setMembers(JSON.parse(savedMembers));
    if (savedStaff) setStaffList(JSON.parse(savedStaff));
    if (savedPayments) setPaymentsList(JSON.parse(savedPayments));
    if (savedBranches) setBranchesList(JSON.parse(savedBranches));
    if (savedPackages) {
      const parsed = JSON.parse(savedPackages);
      const merged = parsed.map(pkg => {
        const initial = initialPackages.find(p => p.id === pkg.id);
        if (initial) {
          return {
            ...initial,
            ...pkg,
            duration: (initial.durationType === 'time-based' || initial.durationType === 'full-time') ? null : pkg.duration,
            startTime: pkg.startTime !== undefined ? pkg.startTime : initial.startTime,
            endTime: pkg.endTime !== undefined ? pkg.endTime : initial.endTime,
          };
        }
        return pkg;
      });
      setPackagesList(merged);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) localStorage.setItem('pw_members', JSON.stringify(members));
  }, [members, isLoaded]);

  useEffect(() => {
    if (isLoaded) localStorage.setItem('pw_staff', JSON.stringify(staffList));
  }, [staffList, isLoaded]);

  useEffect(() => {
    if (isLoaded) localStorage.setItem('pw_payments', JSON.stringify(paymentsList));
  }, [paymentsList, isLoaded]);

  useEffect(() => {
    if (isLoaded) localStorage.setItem('pw_branches', JSON.stringify(branchesList));
  }, [branchesList, isLoaded]);

  useEffect(() => {
    if (isLoaded) localStorage.setItem('pw_packages', JSON.stringify(packagesList));
  }, [packagesList, isLoaded]);

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

  const renewMembership = useCallback((memberId, packageId, paymentMethod = 'Cash') => {
    const pkg = packagesList.find(p => p.id === packageId);
    if (!pkg) return;

    const startDate = new Date().toISOString().split('T')[0];
    const endDate = (pkg.durationType === 'full-time' || pkg.durationType === 'time-based')
      ? '2099-12-31'
      : new Date(Date.now() + (pkg.duration || 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

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
      method: paymentMethod,
    });
  }, [members, packagesList]);

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

  // --- Branch CRUD ---
  const addBranch = useCallback((branchData) => {
    const newBranch = {
      ...branchData,
      id: `BR${String(branchesList.length + 1).padStart(3, '0')}`,
      status: 'active',
      openDate: new Date().toISOString().split('T')[0],
    };
    setBranchesList(prev => [...prev, newBranch]);
    return newBranch;
  }, [branchesList.length]);

  const updateBranch = useCallback((id, updates) => {
    setBranchesList(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  }, []);

  // --- Package CRUD ---
  const addPackage = useCallback((pkgData) => {
    const newPkg = {
      ...pkgData,
      id: `PKG${String(packagesList.length + 1).padStart(3, '0')}`,
      status: pkgData.status || 'active',
    };
    setPackagesList(prev => [...prev, newPkg]);
    return newPkg;
  }, [packagesList.length]);

  const updatePackage = useCallback((id, updates) => {
    setPackagesList(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const deletePackage = useCallback((id) => {
    // Check if any active members use this package
    const membersOnPkg = members.filter(m => m.packageId === id && m.status === 'active');
    if (membersOnPkg.length > 0) {
      // Soft-delete: mark inactive
      setPackagesList(prev => prev.map(p => p.id === id ? { ...p, status: 'inactive' } : p));
      return { softDeleted: true, activeMemberCount: membersOnPkg.length };
    } else {
      // Hard-delete: remove entirely
      setPackagesList(prev => prev.filter(p => p.id !== id));
      return { softDeleted: false };
    }
  }, [members]);

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
      totalBranches: branchesList.length,
      thisMonthRevenue,
      lastMonthRevenue,
      revenueTrend,
      totalRevenue: paymentsList.reduce((sum, p) => sum + p.amount, 0),
      expiringSoon,
      recentRegistrations,
    };
  }, [members, staffList, paymentsList, branchesList]);

  const value = {
    members,
    staff: staffList,
    payments: paymentsList,
    branches: branchesList,
    packages: packagesList,
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
    addBranch,
    updateBranch,
    addPackage,
    updatePackage,
    deletePackage,
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
