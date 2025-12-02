import { Employee } from '../types';

export const calculateSSS = (monthlySalary: number) => {
  // 2024 SSS Contribution Schedule (Republic Act No. 11199)
  // Max Monthly Salary Credit (MSC): 30,000
  // Min Monthly Salary Credit (MSC): 5,000
  // Employee Rate: 4.5%
  // Employer Rate: 9.5%
  // EC Contribution: 10 (MSC < 14,750) or 30 (MSC >= 14,750)

  const MIN_MSC = 5000;
  const MAX_MSC = 30000;
  const EC_THRESHOLD = 14750;
  const EC_LOW = 10;
  const EC_HIGH = 30;

  // Determine applicable MSC
  let msc = monthlySalary;
  if (monthlySalary < MIN_MSC) {
    msc = MIN_MSC;
  } else if (monthlySalary > MAX_MSC) {
    msc = MAX_MSC;
  }
  // Note: In real tables, MSC is often rounded or bracketed. 
  // For formula-based calculation, using the exact capped salary is standard for HRIS.

  const employeeShare = msc * 0.045;
  const employerRegularShare = msc * 0.095;
  const ecContribution = msc < EC_THRESHOLD ? EC_LOW : EC_HIGH;

  return {
    employee: employeeShare,
    employer: employerRegularShare + ecContribution,
    details: {
      employerRegular: employerRegularShare,
      employerEC: ecContribution
    }
  };
};

export const calculatePhilHealth = (monthlySalary: number) => {
  // 2024 PhilHealth Rate: 5% Total
  // Floor: 10,000 | Ceiling: 100,000
  // Share: 50% Employee, 50% Employer (2.5% each)
  const MIN_SALARY = 10000;
  const MAX_SALARY = 100000;
  const TOTAL_RATE = 0.05;

  let applicableSalary = monthlySalary;
  if (monthlySalary < MIN_SALARY) applicableSalary = MIN_SALARY;
  if (monthlySalary > MAX_SALARY) applicableSalary = MAX_SALARY;

  const totalContribution = applicableSalary * TOTAL_RATE;
  const share = totalContribution / 2;

  return {
    employee: share,
    employer: share
  };
};

export const calculatePagIBIG = (monthlySalary: number) => {
  // 2024 Pag-IBIG Rate
  // Max Fund Salary: 10,000
  // Employee Rate: 1% (if salary <= 1,500) else 2%
  // Employer Rate: 2%
  const MAX_FUND_SALARY = 10000;
  
  const applicableSalary = Math.min(monthlySalary, MAX_FUND_SALARY);
  
  const employeeRate = monthlySalary <= 1500 ? 0.01 : 0.02;
  const employerRate = 0.02;

  return {
    employee: applicableSalary * employeeRate,
    employer: applicableSalary * employerRate
  };
};

export const calculateWithholdingTax = (taxableIncome: number): number => {
  // Simplified TRAIN Law / 2023-2024 Annual Tax Table converted to Monthly
  
  if (taxableIncome <= 20833) {
    return 0;
  } else if (taxableIncome <= 33332) {
    return (taxableIncome - 20833) * 0.15;
  } else if (taxableIncome <= 66666) {
    return 1875 + (taxableIncome - 33333) * 0.20;
  } else if (taxableIncome <= 166666) {
    return 8541.80 + (taxableIncome - 66667) * 0.25;
  } else if (taxableIncome <= 666666) {
    return 33541.80 + (taxableIncome - 166667) * 0.30;
  } else {
    return 183541.80 + (taxableIncome - 666667) * 0.35;
  }
};

export const calculate13thMonth = (basicSalary: number, monthsWorked: number = 12): number => {
  return (basicSalary * monthsWorked) / 12;
};

export interface PayrollResult {
  employeeId: string;
  grossPay: number;
  deductions: {
    sss: number;
    philHealth: number;
    pagIbig: number;
    tax: number;
    total: number;
  };
  netPay: number;
  employerContributions: {
    sss: number;
    philHealth: number;
    pagIbig: number;
    total: number;
  };
}

export const processPayrollForEmployee = (employee: Employee, overtimePay: number = 0): PayrollResult => {
  // Assuming Semi-Monthly Payroll (Dividing monthly rates by 2)
  const semiMonthlyBasic = employee.basicSalary / 2;
  const grossPay = semiMonthlyBasic + overtimePay;

  const sssData = calculateSSS(employee.basicSalary);
  const phData = calculatePhilHealth(employee.basicSalary);
  const pagIbigData = calculatePagIBIG(employee.basicSalary);
  
  // Taxable Income Calculation (Monthly Basis)
  // Taxable = Basic - (Total SSS + Total PH + Total PagIBIG)
  const monthlyTaxable = employee.basicSalary - (sssData.employee + phData.employee + pagIbigData.employee);
  const monthlyTax = calculateWithholdingTax(monthlyTaxable);

  // Split deductions for semi-monthly period
  const deductions = {
    sss: sssData.employee / 2,
    philHealth: phData.employee / 2,
    pagIbig: pagIbigData.employee / 2,
    tax: monthlyTax / 2,
    total: (sssData.employee + phData.employee + pagIbigData.employee + monthlyTax) / 2
  };

  const netPay = grossPay - deductions.total;

  // Split employer contributions for semi-monthly period tracking
  const employerContributions = {
    sss: sssData.employer / 2,
    philHealth: phData.employer / 2,
    pagIbig: pagIbigData.employer / 2,
    total: (sssData.employer + phData.employer + pagIbigData.employer) / 2
  };

  return {
    employeeId: employee.id,
    grossPay,
    deductions,
    netPay,
    employerContributions
  };
};