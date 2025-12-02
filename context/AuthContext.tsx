import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppUser, UserRole, Department } from '../types';

interface AuthContextType {
  user: AppUser | null;
  login: (role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Predefined accounts for development
export const DEV_ACCOUNTS: Record<UserRole, AppUser> = {
  [UserRole.ADMIN]: {
    id: 'USR-001',
    name: 'Jane Doe',
    email: 'admin@payroll.com',
    role: UserRole.ADMIN,
    avatarUrl: 'https://ui-avatars.com/api/?name=Jane+Doe&background=076653&color=fff',
  },
  [UserRole.MANAGER]: {
    id: 'USR-002',
    name: 'Mark Santos',
    email: 'hr@payroll.com',
    role: UserRole.MANAGER,
    department: Department.HR,
    avatarUrl: 'https://ui-avatars.com/api/?name=Mark+Santos&background=E3EF26&color=000',
  },
  [UserRole.EMPLOYEE]: {
    id: 'USR-003',
    name: 'Alice Rivera',
    email: 'alice.r@company.com',
    role: UserRole.EMPLOYEE,
    employeeId: 'EMP-001', // Linked to Alice Rivera in mock data
    department: Department.ENGINEERING,
    avatarUrl: 'https://ui-avatars.com/api/?name=Alice+Rivera&background=random',
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for persisted session
    const storedUser = localStorage.getItem('payroll_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (role: UserRole) => {
    const account = DEV_ACCOUNTS[role];
    setUser(account);
    localStorage.setItem('payroll_user', JSON.stringify(account));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('payroll_user');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};