import React, { useState } from 'react';
import { NavItem, UserRole } from '../types';
import { NAV_ITEMS } from '../constants';
import { useAuth } from '../context/AuthContext';
import { canAccessRoute } from '../utils/rbac';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Bell, Search, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  // Filter Nav Items based on Role
  const allowedNavItems = NAV_ITEMS.filter(item => {
    if (!user) return false;
    return canAccessRoute(user.role, item.path);
  });

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-primary-900 text-white transition-all duration-300">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-secondary-400 to-primary-500 flex items-center justify-center text-primary-900 font-bold">
            P
          </div>
          <span className="text-xl font-bold tracking-tight">Payroll<span className="text-secondary-400">Sys</span></span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {allowedNavItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? 'bg-primary-800 text-secondary-400 border-l-4 border-secondary-400'
                  : 'text-gray-300 hover:bg-primary-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-primary-800">
          <div className="flex items-center justify-between p-3 rounded-lg bg-primary-800/50">
            <button className="flex items-center gap-3 text-left" onClick={() => handleNavClick('/profile')}>
              <img 
                src={user?.avatarUrl} 
                alt="User" 
                className="w-9 h-9 rounded-full border border-secondary-400"
              />
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium truncate w-24">{user?.name}</span>
                <span className="text-xs text-gray-400">{user?.role}</span>
              </div>
            </button>
            <button 
                onClick={handleLogout}
                className="text-gray-400 hover:text-white transition-colors p-1"
                title="Sign Out"
            >
                <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Mobile */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-primary-900 text-white z-50 transform transition-transform duration-300 md:hidden ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 flex justify-between items-center">
          <span className="text-xl font-bold">PayrollSys</span>
          <button onClick={() => setIsMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>
        <nav className="px-4 py-2 space-y-2">
          {allowedNavItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                isActive(item.path)
                  ? 'bg-primary-800 text-secondary-400'
                  : 'text-gray-300'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
          <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-300 hover:text-white mt-10"
            >
              <LogOut size={20} />
              Sign Out
            </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">
              {NAV_ITEMS.find(i => i.path === location.pathname)?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
              <Search size={18} className="text-gray-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none outline-none text-sm w-40" 
              />
            </div>
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;