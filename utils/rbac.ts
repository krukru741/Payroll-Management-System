import { UserRole } from '../types';

type Module = 
  | 'employees' 
  | 'attendance' 
  | 'payroll' 
  | 'leave_requests' 
  | 'overtime' 
  | 'cash_advance' 
  | 'documents' 
  | 'reports' 
  | 'settings' 
  | 'users' 
  | 'audit_logs';

type Action = 'create' | 'read' | 'update' | 'delete' | 'approve' | 'process';

type Scope = 'all' | 'team' | 'self' | 'none';

const PERMISSIONS: Record<UserRole, Partial<Record<Module, { [key in Action]?: Scope }>>> = {
  [UserRole.ADMIN]: {
    employees: { create: 'all', read: 'all', update: 'all', delete: 'all' },
    attendance: { create: 'all', read: 'all', update: 'all', delete: 'all' },
    payroll: { create: 'all', read: 'all', update: 'all', delete: 'all', process: 'all' },
    leave_requests: { read: 'all', approve: 'all' },
    settings: { create: 'all', read: 'all', update: 'all', delete: 'all' },
    users: { create: 'all', read: 'all', update: 'all', delete: 'all' },
    audit_logs: { read: 'all' },
    reports: { read: 'all' },
    documents: { create: 'all', read: 'all', delete: 'all' }
  },
  [UserRole.MANAGER]: {
    employees: { create: 'all', read: 'all', update: 'all', delete: 'all' },
    attendance: { create: 'team', read: 'team', update: 'team', delete: 'team' },
    payroll: { create: 'all', read: 'all', update: 'all', delete: 'all', process: 'all' },
    leave_requests: { read: 'team', approve: 'team' },
    settings: { read: 'all' },
    reports: { read: 'team' },
    documents: { read: 'team' }
  },
  [UserRole.EMPLOYEE]: {
    employees: { read: 'self' },
    attendance: { read: 'self' },
    payroll: { read: 'self' },
    leave_requests: { create: 'self', read: 'self' },
    reports: { read: 'self' },
    documents: { create: 'self', read: 'self' }
  }
};

export const hasPermission = (role: UserRole, module: Module, action: Action): boolean => {
  const modulePermissions = PERMISSIONS[role]?.[module];
  return !!modulePermissions?.[action];
};

export const getScope = (role: UserRole, module: Module, action: Action): Scope => {
  return PERMISSIONS[role]?.[module]?.[action] || 'none';
};

export const canAccessRoute = (role: UserRole, path: string): boolean => {
  if (role === UserRole.ADMIN) return true;

  const restrictedRoutes: Record<string, UserRole[]> = {
    '/settings': [UserRole.ADMIN, UserRole.MANAGER],
    '/users': [UserRole.ADMIN],
    '/audit-logs': [UserRole.ADMIN],
    '/employees': [UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE], // Employee can see self
  };

  const allowedRoles = restrictedRoutes[path];
  if (!allowedRoles) return true; // Default allow if not restricted
  return allowedRoles.includes(role);
};