import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { canChangeRole } from '../utils/rbac';
import api from '../lib/axios';
import { UserRole } from '../types';
import Modal from './Modal';
import Button from './Button';

interface RoleChangeModalProps {
  user: {
    id: string;
    username: string;
    role: UserRole;
    employee: {
      firstName: string;
      lastName: string;
    } | null;
  };
  onClose: () => void;
  onSuccess: () => void;
}

const RoleChangeModal: React.FC<RoleChangeModalProps> = ({ user, onClose, onSuccess }) => {
  const { user: currentUser } = useAuth();
  const [newRole, setNewRole] = useState<UserRole>(user.role);
  const [loading, setLoading] = useState(false);

  const canChange = currentUser && canChangeRole(currentUser.role, user.role, newRole);

  const handleSubmit = async () => {
    if (!canChange) {
      alert('You do not have permission to assign this role');
      return;
    }

    setLoading(true);
    try {
      await api.put(`/users/${user.id}/role`, { role: newRole });
      onSuccess();
    } catch (error: any) {
      console.error('Failed to update role:', error);
      alert(error.response?.data?.error || 'Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  const getRoleDescription = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return 'Full system access, can manage all users and settings';
      case 'MANAGER':
        return 'Can manage team members and approve requests';
      case 'EMPLOYEE':
        return 'Standard user access, can view own data';
      default:
        return '';
    }
  };

  const displayName = user.employee 
    ? `${user.employee.firstName} ${user.employee.lastName}`
    : user.username;

  return (
    <Modal isOpen={true} onClose={onClose} title="Change User Role">
      <div className="space-y-4">
        {/* User Info */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Changing role for:</p>
          <p className="font-semibold text-gray-900">{displayName}</p>
          <p className="text-xs text-gray-500">@{user.username}</p>
        </div>

        {/* Current Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Role
          </label>
          <div className="px-3 py-2 bg-gray-100 rounded-md text-sm text-gray-600">
            {user.role}
          </div>
        </div>

        {/* New Role Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Role
          </label>
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value as UserRole)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="EMPLOYEE">EMPLOYEE</option>
            <option value="MANAGER">MANAGER</option>
            {currentUser?.role === 'ADMIN' && <option value="ADMIN">ADMIN</option>}
          </select>
          <p className="mt-1 text-xs text-gray-500">{getRoleDescription(newRole)}</p>
        </div>

        {/* Warning */}
        {newRole !== user.role && (
          <div className="flex gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Role Change Warning</p>
              <p className="text-xs mt-1">
                This will immediately change the user's permissions. They may need to log out and log back in for changes to take full effect.
              </p>
            </div>
          </div>
        )}

        {/* Permission Error */}
        {!canChange && newRole !== user.role && (
          <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">
              <p className="font-medium">Permission Denied</p>
              <p className="text-xs mt-1">
                You do not have permission to assign the {newRole} role.
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !canChange || newRole === user.role}
          >
            {loading ? 'Updating...' : 'Update Role'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default RoleChangeModal;
