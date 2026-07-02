'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { demoUsers } from '@/data/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState([]);

  const registerUser = useCallback((email, password, role, profileId, name, branchId) => {
    const newUser = {
      id: `USR${String(demoUsers.length + registeredUsers.length + 1).padStart(3, '0')}`,
      name,
      email,
      password,
      role,
      branchId,
      ...(role === 'Customer' ? { memberId: profileId } : { staffId: profileId }),
    };
    setRegisteredUsers(prev => [...prev, newUser]);
    return newUser;
  }, [registeredUsers.length]);

  const login = useCallback((email, password) => {
    setLoading(true);

    return new Promise((resolve, reject) => {
      // Simulate network delay
      setTimeout(() => {
        const foundUser = [
          ...demoUsers,
          ...registeredUsers
        ].find(
          u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
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
  }, [registeredUsers]);

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
