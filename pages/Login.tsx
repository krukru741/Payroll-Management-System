import React, { useState } from 'react';
import { useAuth, DEV_ACCOUNTS } from '../context/AuthContext';
import { UserRole } from '../types';
import Button from '../components/Button';
import { Shield, Users, User, Lock, ArrowRight } from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleDevLogin = (role: UserRole) => {
    login(role);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login based on email for non-quick buttons
    if (email.includes('admin')) login(UserRole.ADMIN);
    else if (email.includes('hr')) login(UserRole.MANAGER);
    else login(UserRole.EMPLOYEE);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded bg-gradient-to-br from-secondary-400 to-primary-500 flex items-center justify-center text-primary-900 font-bold text-2xl shadow-lg">
            P
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to PayrollSys
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Secure Payroll Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <Button type="submit" className="w-full flex justify-center">
                <Lock size={16} className="mr-2" />
                Sign in
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Development Quick Access
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <button
                onClick={() => handleDevLogin(UserRole.ADMIN)}
                className="w-full inline-flex justify-between items-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 group"
              >
                <div className="flex items-center">
                   <Shield className="text-primary-600 mr-3" size={20} />
                   <div className="text-left">
                     <span className="block font-bold">Admin</span>
                     <span className="block text-xs text-gray-500">{DEV_ACCOUNTS[UserRole.ADMIN].email}</span>
                   </div>
                </div>
                <ArrowRight size={16} className="text-gray-400 group-hover:text-primary-500 transition-colors" />
              </button>

              <button
                onClick={() => handleDevLogin(UserRole.MANAGER)}
                className="w-full inline-flex justify-between items-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 group"
              >
                 <div className="flex items-center">
                   <Users className="text-secondary-400 text-yellow-600 mr-3" size={20} />
                   <div className="text-left">
                     <span className="block font-bold">HR Manager</span>
                     <span className="block text-xs text-gray-500">{DEV_ACCOUNTS[UserRole.MANAGER].email}</span>
                   </div>
                </div>
                <ArrowRight size={16} className="text-gray-400 group-hover:text-primary-500 transition-colors" />
              </button>

              <button
                onClick={() => handleDevLogin(UserRole.EMPLOYEE)}
                className="w-full inline-flex justify-between items-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 group"
              >
                 <div className="flex items-center">
                   <User className="text-gray-500 mr-3" size={20} />
                   <div className="text-left">
                     <span className="block font-bold">Employee</span>
                     <span className="block text-xs text-gray-500">{DEV_ACCOUNTS[UserRole.EMPLOYEE].email}</span>
                   </div>
                </div>
                <ArrowRight size={16} className="text-gray-400 group-hover:text-primary-500 transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;