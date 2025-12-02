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

export enum UserRole {
  ADMIN = 'Admin',
  MANAGER = 'Manager',
  EMPLOYEE = 'Employee',
}

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other',
}

export enum CivilStatus {
  SINGLE = 'Single',
  MARRIED = 'Married',
  WIDOWED = 'Widowed',
  SEPARATED = 'Separated',
}

export interface EmergencyContact {
  fullName: string;
  contactNumber: string;
  relationship: string;
}

export interface GovernmentIds {
  sss: string;
  philHealth: string;
  pagIbig: string;
  tin: string;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  position: string;
  department: Department;
  status: EmployeeStatus;
  dateHired: string;
  basicSalary: number;
  avatarUrl: string;
  
  // Extended Profile
  birthDate?: string;
  age?: number;
  gender?: Gender;
  civilStatus?: CivilStatus;
  address?: string;
  contactNo?: string;
  
  // Government IDs
  governmentIds?: GovernmentIds;
  
  // Emergency Contact
  emergencyContact?: EmergencyContact;
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

export interface AppUser {
  id: string;
  name: string;
  email: string;
  username: string; // Added for auth
  password?: string; // Added for auth mock (hashed in real app)
  role: UserRole;
  avatarUrl: string;
  department?: Department;
  employeeId?: string; // Link to specific employee record for self-service
  position?: string;
}