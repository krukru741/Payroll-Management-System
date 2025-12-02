import React from 'react';

export enum EmployeeStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  ON_LEAVE = 'On Leave',
}

export enum Department {
  ENGINEERING = 'Engineering',
  HR = 'Human Resources',
  FINANCE = 'Finance',
  SALES = 'Sales',
  MARKETING = 'Marketing',
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  department: Department;
  status: EmployeeStatus;
  dateHired: string;
  basicSalary: number;
  avatarUrl: string;
}

export interface PayrollSummary {
  periodStart: string;
  periodEnd: string;
  totalEmployees: number;
  totalGross: number;
  totalNet: number;
  status: 'Draft' | 'Processed' | 'Paid';
}

export interface AttendanceRecord {
  id: string;
  date: string;
  employeeId: string;
  timeIn: string;
  timeOut: string;
  status: 'Present' | 'Late' | 'Absent' | 'Half Day';
}

export interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}