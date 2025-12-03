import React from 'react';

export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_LEAVE = 'ON_LEAVE',
}

export enum Department {
  ENGINEERING = 'ENGINEERING',
  HR = 'HR',
  FINANCE = 'FINANCE',
  SALES = 'SALES',
  MARKETING = 'MARKETING',
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum CivilStatus {
  SINGLE = 'SINGLE',
  MARRIED = 'MARRIED',
  WIDOWED = 'WIDOWED',
  SEPARATED = 'SEPARATED',
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