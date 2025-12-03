import { Request, Response } from 'express';
import prisma from '../db';

export const calculatePayroll = async (req: Request, res: Response) => {
  try {
    const { periodStart, periodEnd, employeeIds } = req.body;
    
    // This is where the complex calculation logic would go.
    // For now, we will mock the calculation based on the employee's basic salary.
    
    const employees = await prisma.employee.findMany({
      where: {
        id: { in: employeeIds }
      }
    });

    const payrolls = employees.map(emp => {
      // Simplified calculation logic
      const basicPay = emp.basicSalary / 2; // Assuming semi-monthly
      const grossPay = basicPay; // + allowances + overtime
      
      // Mock deductions (should use the calculator utility in real impl)
      const sssDeduction = grossPay * 0.045;
      const philHealthDeduction = grossPay * 0.05;
      const pagIbigDeduction = 200;
      const taxDeduction = grossPay * 0.1; // Simplified
      
      const totalDeductions = sssDeduction + philHealthDeduction + pagIbigDeduction + taxDeduction;
      const netPay = grossPay - totalDeductions;

      return {
        employeeId: emp.id,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        basicPay,
        overtimePay: 0,
        allowances: 0,
        grossPay,
        sssDeduction,
        philHealthDeduction,
        pagIbigDeduction,
        taxDeduction,
        otherDeductions: 0,
        totalDeductions,
        netPay,
        erSSS: sssDeduction * 2, // Mock employer share
        erPhilHealth: philHealthDeduction,
        erPagIbig: pagIbigDeduction,
        status: 'DRAFT'
      };
    });

    // In a real app, we might save these as DRAFT records immediately or return them for review.
    // Let's save them as DRAFT.
    
    const savedPayrolls = await prisma.$transaction(
      payrolls.map(p => prisma.payroll.create({ data: p }))
    );

    res.json(savedPayrolls);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to calculate payroll' });
  }
};

export const getPayrolls = async (req: Request, res: Response) => {
  try {
    const { periodStart, periodEnd, employeeId } = req.query;
    
    const where: any = {};
    if (employeeId) where.employeeId = String(employeeId);
    // Add date filtering if needed

    const payrolls = await prisma.payroll.findMany({
      where,
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            department: true,
            position: true
          }
        }
      },
      orderBy: { periodStart: 'desc' }
    });

    res.json(payrolls);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payrolls' });
  }
};

export const finalizePayroll = async (req: Request, res: Response) => {
  try {
    const { payrollIds } = req.body;

    await prisma.payroll.updateMany({
      where: {
        id: { in: payrollIds }
      },
      data: {
        status: 'FINALIZED',
        payoutDate: new Date()
      }
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to finalize payroll' });
  }
};

export const saveAndFinalizePayroll = async (req: Request, res: Response) => {
  try {
    const { payrolls, periodStart, periodEnd } = req.body;

    const savedPayrolls = await prisma.$transaction(
      payrolls.map((p: any) => prisma.payroll.create({
        data: {
          employeeId: p.emp.id,
          periodStart: new Date(periodStart),
          periodEnd: new Date(periodEnd),
          payoutDate: new Date(),
          basicPay: p.emp.basicSalary / 2,
          overtimePay: p.grossPay - (p.emp.basicSalary / 2),
          allowances: 0,
          grossPay: p.grossPay,
          
          sssDeduction: p.deductions.sss,
          philHealthDeduction: p.deductions.philHealth,
          pagIbigDeduction: p.deductions.pagIbig,
          taxDeduction: p.deductions.tax,
          otherDeductions: 0,
          totalDeductions: p.deductions.total,
          
          netPay: p.netPay,
          
          erSSS: p.employerContributions.sss,
          erPhilHealth: p.employerContributions.philHealth,
          erPagIbig: p.employerContributions.pagIbig,
          
          status: 'FINALIZED'
        }
      }))
    );

    res.json({ success: true, count: savedPayrolls.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to finalize payroll' });
  }
};
