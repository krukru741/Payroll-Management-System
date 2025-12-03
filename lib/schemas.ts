import { z } from 'zod';
import { Department, EmployeeStatus, Gender, CivilStatus } from '../types';

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const personalInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  middleName: z.string().optional(),
  email: z.string().email('Invalid email address'),
  contactNo: z.string().min(1, 'Contact number is required'),
  birthDate: z.string().min(1, 'Birth date is required'),
  age: z.number().optional(),
  gender: z.nativeEnum(Gender),
  civilStatus: z.nativeEnum(CivilStatus),
  address: z.string().min(1, 'Address is required'),
});

export const employmentSchema = z.object({
  position: z.string().min(1, 'Position is required'),
  department: z.nativeEnum(Department),
  dateHired: z.string().min(1, 'Date hired is required'),
  status: z.nativeEnum(EmployeeStatus),
  basicSalary: z.number().min(0, 'Salary must be a positive number'),
});

export const governmentIdsSchema = z.object({
  sssNo: z.string().optional(),
  philhealthNo: z.string().optional(),
  pagibigNo: z.string().optional(),
  tinNo: z.string().optional(),
});

export const emergencyContactSchema = z.object({
  ecFullName: z.string().min(1, 'Emergency contact name is required'),
  ecContactNumber: z.string().min(1, 'Emergency contact number is required'),
  ecRelationship: z.string().min(1, 'Relationship is required'),
});

// Full Employee Form Schema
export const employeeFormSchema = z.intersection(
  personalInfoSchema,
  z.intersection(employmentSchema, z.intersection(governmentIdsSchema, emergencyContactSchema))
);

// Registration Schema extends Employee Schema with User Account
// Public Registration Schema (excludes employment details and government IDs)
export const publicRegistrationSchema = z.intersection(
  personalInfoSchema,
  emergencyContactSchema
).and(z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
})).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Registration Schema extends Employee Schema with User Account (for internal use if needed)
export const registrationSchema = employeeFormSchema.and(z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
})).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type EmployeeFormData = z.infer<typeof employeeFormSchema>;
export type RegistrationFormData = z.infer<typeof publicRegistrationSchema>;
