import { PayrollSummary } from './types';
import { 
  LayoutDashboard, 
  Users, 
  Banknote, 
  CalendarClock, 
  FileText, 
  Settings,
  PieChart
} from 'lucide-react';

export const MOCK_PAYROLL_SUMMARY: PayrollSummary = {
  periodStart: '2024-05-01',
  periodEnd: '2024-05-15',
  totalEmployees: 45,
  totalGross: 1250000,
  totalNet: 1085000,
  status: 'Draft'
};

export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Employees', path: '/employees', icon: Users },
  { label: 'Attendance', path: '/attendance', icon: CalendarClock },
  { label: 'Payroll', path: '/payroll', icon: Banknote },
  { label: 'Reports', path: '/reports', icon: PieChart },
  { label: 'Documents', path: '/documents', icon: FileText },
  { label: 'Settings', path: '/settings', icon: Settings },
];

// Recharts data
// Keep this as "Historical" data template, but actual implementation would fetch real history
export const PAYROLL_HISTORY_DATA = [
  { name: 'Jan', amount: 0 },
  { name: 'Feb', amount: 0 },
  { name: 'Mar', amount: 0 },
  { name: 'Apr', amount: 0 },
  { name: 'May', amount: 0 },
  { name: 'Jun', amount: 0 },
];

export const COLORS = ['#076653', '#E3EF26', '#0C342C', '#E2FBCE', '#06231D'];