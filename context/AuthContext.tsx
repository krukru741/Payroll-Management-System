import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppUser } from '../types';

interface AuthContextType {
  user: AppUser | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (user: AppUser) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load users and session from local storage
    const storedUsers = localStorage.getItem('payroll_users');
    const storedSession = localStorage.getItem('payroll_session');

    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      // Initialize with empty user list - requires registration
      setUsers([]);
      localStorage.setItem('payroll_users', JSON.stringify([]));
    }

    if (storedSession) {
      setUser(JSON.parse(storedSession));
    }

    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const foundUser = users.find(u => 
      u.username.toLowerCase() === username.toLowerCase() && 
      u.password === password
    );

    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('payroll_session', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const register = async (newUser: AppUser): Promise<void> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('payroll_users', JSON.stringify(updatedUsers));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('payroll_session');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-primary-600 font-medium">Initializing Security...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
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