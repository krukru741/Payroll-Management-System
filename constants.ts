import { Department, Employee, EmployeeStatus, PayrollSummary } from './types';
import { 
  LayoutDashboard, 
  Users, 
  Banknote, 
  CalendarClock, 
  FileText, 
  Settings,
  PieChart
} from 'lucide-react';

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 'EMP-001',
    firstName: 'Alice',
    lastName: 'Rivera',
    email: 'alice.r@company.com',
    position: 'Senior Software Engineer',
    department: Department.ENGINEERING,
    status: EmployeeStatus.ACTIVE,
    dateHired: '2021-03-15',
    basicSalary: 85000,
    avatarUrl: 'https://picsum.photos/100/100?random=1'
  },
  {
    id: 'EMP-002',
    firstName: 'Mark',
    lastName: 'Santos',
    email: 'mark.s@company.com',
    position: 'HR Manager',
    department: Department.HR,
    status: EmployeeStatus.ACTIVE,
    dateHired: '2020-01-10',
    basicSalary: 65000,
    avatarUrl: 'https://picsum.photos/100/100?random=2'
  },
  {
    id: 'EMP-003',
    firstName: 'Jessica',
    lastName: 'Lim',
    email: 'j.lim@company.com',
    position: 'Accountant',
    department: Department.FINANCE,
    status: EmployeeStatus.ON_LEAVE,
    dateHired: '2022-07-01',
    basicSalary: 45000,
    avatarUrl: 'https://picsum.photos/100/100?random=3'
  },
  {
    id: 'EMP-004',
    firstName: 'David',
    lastName: 'Chen',
    email: 'd.chen@company.com',
    position: 'Sales Associate',
    department: Department.SALES,
    status: EmployeeStatus.INACTIVE,
    dateHired: '2023-02-15',
    basicSalary: 35000,
    avatarUrl: 'https://picsum.photos/100/100?random=4'
  },
  {
    id: 'EMP-005',
    firstName: 'Sarah',
    lastName: 'Gonzales',
    email: 's.gonzales@company.com',
    position: 'Marketing Specialist',
    department: Department.MARKETING,
    status: EmployeeStatus.ACTIVE,
    dateHired: '2021-11-20',
    basicSalary: 42000,
    avatarUrl: 'https://picsum.photos/100/100?random=5'
  }
];

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
export const PAYROLL_HISTORY_DATA = [
  { name: 'Jan', amount: 980000 },
  { name: 'Feb', amount: 1050000 },
  { name: 'Mar', amount: 1020000 },
  { name: 'Apr', amount: 1100000 },
  { name: 'May', amount: 1250000 },
  { name: 'Jun', amount: 1200000 },
];

export const DEPARTMENT_DISTRIBUTION = [
  { name: 'Engineering', value: 12 },
  { name: 'Sales', value: 8 },
  { name: 'Marketing', value: 5 },
  { name: 'HR', value: 3 },
  { name: 'Finance', value: 4 },
];

export const COLORS = ['#076653', '#E3EF26', '#0C342C', '#E2FBCE', '#06231D'];