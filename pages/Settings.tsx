import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings as SettingsIcon, Users, User, Shield } from 'lucide-react';
import UserManagementTab from '../components/UserManagementTab';
import SystemSettingsTab from '../components/SystemSettingsTab';
import { hasPermission } from '../utils/rbac';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  // Check if user can access user management
  const canManageUsers = user && hasPermission(user.role, 'users', 'read');

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: User, available: true },
    { id: 'users', label: 'User Management', icon: Users, available: canManageUsers },
    { id: 'system', label: 'System Settings', icon: Shield, available: user?.role === 'ADMIN' }
  ].filter(tab => tab.available);

  const TabButton: React.FC<{ tab: typeof tabs[0] }> = ({ tab }) => {
    const Icon = tab.icon;
    return (
      <button
        onClick={() => setActiveTab(tab.id)}
        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
          activeTab === tab.id
            ? 'bg-primary-600 text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <Icon size={18} />
        {tab.label}
      </button>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary-100 rounded-lg">
          <SettingsIcon className="text-primary-600" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500">Manage your account and system preferences</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map(tab => (
            <TabButton key={tab.id} tab={tab} />
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {activeTab === 'profile' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Settings</h2>
            <p className="text-gray-600">Profile settings coming soon...</p>
          </div>
        )}

        {activeTab === 'users' && canManageUsers && (
          <UserManagementTab />
        )}

        {activeTab === 'system' && user?.role === 'ADMIN' && (
          <SystemSettingsTab />
        )}
      </div>
    </div>
  );
};

export default Settings;
