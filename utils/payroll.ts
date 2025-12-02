
export const calculateSSS = (monthlySalary: number): number => {
  // 2024 SSS Contribution Rate: 14% Total (4.5% Employee, 9.5% Employer)
  // Max Monthly Salary Credit (MSC): 30,000
  const maxMSC = 30000;
  const employeeRate = 0.045;
  
  const applicableSalary = Math.min(monthlySalary, maxMSC);
  return applicableSalary * employeeRate;
};

export const calculatePhilHealth = (monthlySalary: number): number => {
  // 2024 PhilHealth Rate: 5% Total
  // Floor: 10,000 | Ceiling: 100,000
  // Share: 50% Employee, 50% Employer (2.5% each)
  const floor = 10000;
  const ceiling = 100000;
  const employeeRate = 0.025;

  let applicableSalary = monthlySalary;
  if (monthlySalary < floor) applicableSalary = floor;
  if (monthlySalary > ceiling) applicableSalary = ceiling;

  return applicableSalary * employeeRate;
};

export const calculatePagIBIG = (monthlySalary: number): number => {
  // 2024 Pag-IBIG Rate
  // Max Fund Salary increased to 10,000 (Feb 2024)
  // Rate: 2% for salary > 1,500
  const maxFundSalary = 10000;
  const rate = 0.02;

  const applicableSalary = Math.min(monthlySalary, maxFundSalary);
  return applicableSalary * rate;
};

export const calculateWithholdingTax = (taxableIncome: number): number => {
  // Simplified TRAIN Law / 2023-2024 Annual Tax Table converted to Monthly
  // This is an approximation for the demo
  
  if (taxableIncome <= 20833) {
    return 0;
  } else if (taxableIncome <= 33332) {
    // 20,833 - 33,332: 15% in excess of 20,833
    return (taxableIncome - 20833) * 0.15;
  } else if (taxableIncome <= 66666) {
    // 33,333 - 66,666: 1,875 + 20% in excess of 33,333
    return 1875 + (taxableIncome - 33333) * 0.20;
  } else if (taxableIncome <= 166666) {
    // 66,667 - 166,666: 8,541.80 + 25% in excess of 66,667
    return 8541.80 + (taxableIncome - 66667) * 0.25;
  } else if (taxableIncome <= 666666) {
    // 166,667 - 666,666: 33,541.80 + 30% in excess of 166,667
    return 33541.80 + (taxableIncome - 166667) * 0.30;
  } else {
    // 666,667 and above: 183,541.80 + 35% in excess of 666,667
    return 183541.80 + (taxableIncome - 666667) * 0.35;
  }
};

export const calculate13thMonth = (basicSalary: number, monthsWorked: number = 12): number => {
  // Basic Pay / 12 * Months Worked
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
}

export const processPayrollForEmployee = (employee: any, overtimePay: number = 0): PayrollResult => {
  // Assuming Semi-Monthly Payroll (Dividing monthly rates by 2)
  // Real-world systems might deduct statutory only once a month, 
  // but for this demo, we split them evenly.

  const semiMonthlyBasic = employee.basicSalary / 2;
  const grossPay = semiMonthlyBasic + overtimePay;

  const monthlySSS = calculateSSS(employee.basicSalary);
  const monthlyPH = calculatePhilHealth(employee.basicSalary);
  const monthlyPagIBIG = calculatePagIBIG(employee.basicSalary);
  
  // Taxable Income (Monthly Basis Estimation)
  const monthlyTaxable = employee.basicSalary - (monthlySSS + monthlyPH + monthlyPagIBIG);
  const monthlyTax = calculateWithholdingTax(monthlyTaxable);

  const deductions = {
    sss: monthlySSS / 2,
    philHealth: monthlyPH / 2,
    pagIbig: monthlyPagIBIG / 2,
    tax: monthlyTax / 2,
    total: (monthlySSS + monthlyPH + monthlyPagIBIG + monthlyTax) / 2
  };

  const netPay = grossPay - deductions.total;

  return {
    employeeId: employee.id,
    grossPay,
    deductions,
    netPay
  };
};
