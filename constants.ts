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

export const POSITION_DEPARTMENT_MAP: Record<string, string[]> = {
  'ENGINEERING': [
    'Software Engineer', 
    'Senior Software Engineer', 
    'Lead Software Engineer',
    'DevOps Engineer', 
    'QA Engineer', 
    'QA Lead',
    'System Architect',
    'Technical Lead',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Mobile Developer',
    'Data Engineer'
  ],
  'HR': [
    'HR Manager', 
    'HR Specialist', 
    'HR Generalist',
    'Recruiter', 
    'Senior Recruiter',
    'Training Coordinator',
    'Talent Acquisition Specialist',
    'Employee Relations Specialist',
    'Compensation and Benefits Specialist',
    'HR Business Partner'
  ],
  'FINANCE': [
    'Accountant', 
    'Senior Accountant',
    'Financial Analyst', 
    'Payroll Officer', 
    'Payroll Manager',
    'Finance Manager',
    'Chief Financial Officer',
    'Budget Analyst',
    'Tax Specialist',
    'Accounts Payable Specialist',
    'Accounts Receivable Specialist',
    'Financial Controller'
  ],
  'SALES': [
    'Sales Representative', 
    'Senior Sales Representative',
    'Account Manager', 
    'Key Account Manager',
    'Sales Manager', 
    'Regional Sales Manager',
    'Business Development Officer',
    'Business Development Manager',
    'Sales Executive',
    'Sales Director',
    'Customer Success Manager'
  ],
  'MARKETING': [
    'Marketing Specialist', 
    'Marketing Manager',
    'Content Writer', 
    'Content Manager',
    'SEO Specialist', 
    'Digital Marketing Specialist',
    'Social Media Manager',
    'Brand Manager',
    'Product Marketing Manager',
    'Marketing Director',
    'Graphic Designer',
    'Marketing Coordinator'
  ],
  'ADMIN': [
    'Administrator', 
    'Executive Assistant', 
    'Office Manager', 
    'Administrative Officer',
    'Administrative Assistant',
    'Receptionist',
    'Office Coordinator',
    'Facilities Manager',
    'Operations Coordinator'
  ]
};

export const WORK_SCHEDULES = [
  'Mon-Fri 8:00 AM - 5:00 PM',
  'Mon-Fri 9:00 AM - 6:00 PM',
  'Mon-Sat 8:00 AM - 5:00 PM',
  'Flexible Schedule',
  'Shift Based'
];
