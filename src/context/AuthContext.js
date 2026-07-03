'use client';

import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid email or password');
      }

      setUser(data);
      return data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const registerUser = useCallback(async (email, password, role, profileId, name, branchId) => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          email,
          password,
          role,
          name,
          branchId,
          ...(role === 'Customer' ? { memberId: profileId } : { staffId: profileId }),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      return data;
    } catch (err) {
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const isAdmin = user?.role === 'Admin';
  const isManager = user?.role === 'Manager';
  const isStaff = user?.role === 'Staff';
  const isTrainer = user?.role === 'Trainer';
  const isCustomer = user?.role === 'Customer';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, registerUser, isAdmin, isManager, isStaff, isTrainer, isCustomer }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
