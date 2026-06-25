'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { demoUsers } from '@/data/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = useCallback((email, password) => {
    setLoading(true);

    return new Promise((resolve, reject) => {
      // Simulate network delay
      setTimeout(() => {
        const foundUser = demoUsers.find(
          u => u.email === email && u.password === password
        );

        if (foundUser) {
          const { password: _, ...safeUser } = foundUser;
          setUser(safeUser);
          setLoading(false);
          resolve(safeUser);
        } else {
          setLoading(false);
          reject(new Error('Invalid email or password'));
        }
      }, 800);
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const isAdmin = user?.role === 'Admin';
  const isManager = user?.role === 'Manager';
  const isStaff = user?.role === 'Staff';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isManager, isStaff }}>
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
