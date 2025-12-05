import { Employee } from '../types';

// Settings interface
export interface PayrollSettings {
  taxRates?: {
    bracket1: number;
    bracket2: number;
    bracket3: number;
    bracket4: number;
    bracket5: number;
    bracket6: number;
  };
  sssRate?: {
    employee: number;
    employer: number;
    ec: number;
  };
  philHealthRate?: {
    employee: number;
    employer: number;
  };
  pagIbigRate?: {
    employee: number;
    employer: number;
  };
  lateDeduction?: {
    perMinute: number;
    perHour: number;
    enabled: boolean;
  };
}

export const calculateSSS = (monthlySalary: number, settings?: PayrollSettings) => {
  const MIN_MSC = 5000;
  const MAX_MSC = 30000;
  const EC_THRESHOLD = 14750;
  const EC_LOW = 10;
  const EC_HIGH = 30;

  let msc = monthlySalary;
  if (monthlySalary < MIN_MSC) {
    msc = MIN_MSC;
  } else if (monthlySalary > MAX_MSC) {
    msc = MAX_MSC;
  }

  // Use settings rates or defaults
  const employeeRate = (settings?.sssRate?.employee || 4.5) / 100;
  const employerRate = (settings?.sssRate?.employer || 9.5) / 100;

  const employeeShare = msc * employeeRate;
  const employerRegularShare = msc * employerRate;
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

export const calculatePhilHealth = (monthlySalary: number, settings?: PayrollSettings) => {
  const MIN_SALARY = 10000;
  const MAX_SALARY = 100000;

  let applicableSalary = monthlySalary;
  if (monthlySalary < MIN_SALARY) applicableSalary = MIN_SALARY;
  if (monthlySalary > MAX_SALARY) applicableSalary = MAX_SALARY;

  // Use settings rates or defaults (2% each)
  const employeeRate = (settings?.philHealthRate?.employee || 2.0) / 100;
  const employerRate = (settings?.philHealthRate?.employer || 2.0) / 100;

  return {
    employee: applicableSalary * employeeRate,
    employer: applicableSalary * employerRate
  };
};

export const calculatePagIBIG = (monthlySalary: number, settings?: PayrollSettings) => {
  const MAX_FUND_SALARY = 10000;
  
  const applicableSalary = Math.min(monthlySalary, MAX_FUND_SALARY);
  
  // Use settings rates or defaults
  const employeeRate = (settings?.pagIbigRate?.employee || 2.0) / 100;
  const employerRate = (settings?.pagIbigRate?.employer || 2.0) / 100;

  return {
    employee: applicableSalary * employeeRate,
    employer: applicableSalary * employerRate
  };
};

export const calculateWithholdingTax = (taxableIncome: number, settings?: PayrollSettings): number => {
  // Use settings tax rates or defaults
  const rates = settings?.taxRates || {
    bracket1: 0,
    bracket2: 15,
    bracket3: 20,
    bracket4: 25,
    bracket5: 30,
    bracket6: 35
  };

  // Monthly brackets (annual / 12)
  if (taxableIncome <= 20833) {
    return 0;
  } else if (taxableIncome <= 33332) {
    return (taxableIncome - 20833) * (rates.bracket2 / 100);
  } else if (taxableIncome <= 66666) {
    return 1875 + (taxableIncome - 33333) * (rates.bracket3 / 100);
  } else if (taxableIncome <= 166666) {
    return 8541.80 + (taxableIncome - 66667) * (rates.bracket4 / 100);
  } else if (taxableIncome <= 666666) {
    return 33541.80 + (taxableIncome - 166667) * (rates.bracket5 / 100);
  } else {
    return 183541.80 + (taxableIncome - 666667) * (rates.bracket6 / 100);
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
    late: number;
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

export const processPayrollForEmployee = (
  employee: Employee, 
  overtimePay: number = 0,
  lateMinutes: number = 0,
  settings?: PayrollSettings
): PayrollResult => {
  // Assuming Semi-Monthly Payroll (Dividing monthly rates by 2)
  const semiMonthlyBasic = employee.basicSalary / 2;
  const grossPay = semiMonthlyBasic + overtimePay;

  // Calculate late deductions
  let lateDeduction = 0;
  if (settings?.lateDeduction?.enabled && lateMinutes > 0) {
    const perMinute = settings.lateDeduction.perMinute || 0;
    lateDeduction = lateMinutes * perMinute;
  }

  const sssData = calculateSSS(employee.basicSalary, settings);
  const phData = calculatePhilHealth(employee.basicSalary, settings);
  const pagIbigData = calculatePagIBIG(employee.basicSalary, settings);
  
  // Taxable Income Calculation (Monthly Basis)
  // Taxable = Basic - (Total SSS + Total PH + Total PagIBIG)
  const monthlyTaxable = employee.basicSalary - (sssData.employee + phData.employee + pagIbigData.employee);
  const monthlyTax = calculateWithholdingTax(monthlyTaxable, settings);

  // Split deductions for semi-monthly period
  const deductions = {
    sss: sssData.employee / 2,
    philHealth: phData.employee / 2,
    pagIbig: pagIbigData.employee / 2,
    tax: monthlyTax / 2,
    late: lateDeduction,
    total: (sssData.employee + phData.employee + pagIbigData.employee + monthlyTax) / 2 + lateDeduction
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