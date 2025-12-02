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

// A mapping from routes to their corresponding permission modules.
const ROUTE_MODULE_MAP: Record<string, Module> = {
    '/employees': 'employees',
    '/attendance': 'attendance',
    '/payroll': 'payroll',
    '/reports': 'reports',
    '/documents': 'documents',
    '/settings': 'settings',
    '/users': 'users',
    '/audit-logs': 'audit_logs'
};

// Routes that are accessible to any authenticated user.
const PUBLIC_AUTHENTICATED_ROUTES = ['/', '/profile'];

export const canAccessRoute = (role: UserRole, path: string): boolean => {
    // Admins can access any route.
    if (role === UserRole.ADMIN) {
        return true;
    }

    // Allow access to public authenticated routes.
    if (PUBLIC_AUTHENTICATED_ROUTES.includes(path)) {
        return true;
    }

    const module = ROUTE_MODULE_MAP[path];
    
    // If the route doesn't have an associated module, deny access by default for non-admins.
    if (!module) {
        return false;
    }

    // Check if the user's role has any permissions for this module.
    const modulePermissions = PERMISSIONS[role]?.[module];
    
    // Allow access if there are any permissions defined for the role on this module.
    // The component itself will handle the fine-grained action/scope checks.
    return !!modulePermissions && Object.keys(modulePermissions).length > 0;
};