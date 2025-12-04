import { Request, Response } from 'express';
import prisma from '../db';

export const getEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { lastName: 'asc' },
      include: {
        user: {
          select: {
            email: true,
            username: true,
            role: true
          }
        }
      }
    });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
};

export const getEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        user: true,
        documents: true,
        loans: true
      }
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
};

export const createEmployee = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    
    // Check if email already exists
    const existing = await prisma.employee.findUnique({
      where: { email: data.email }
    });

    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const employee = await prisma.employee.create({
      data: {
        ...data,
        birthDate: new Date(data.birthDate),
        dateHired: new Date(data.dateHired),
        basicSalary: parseFloat(data.basicSalary),
        // Handle other potential date/number conversions
      }
    });

    res.status(201).json(employee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create employee' });
  }
};

export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // Remove fields that shouldn't be updated
    const { user, createdAt, updatedAt, avatarUrl, ...updateData } = data;

    // Handle date conversions
    if (updateData.birthDate) updateData.birthDate = new Date(updateData.birthDate);
    if (updateData.dateHired) updateData.dateHired = new Date(updateData.dateHired);
    if (updateData.dateResigned) updateData.dateResigned = new Date(updateData.dateResigned);
    if (updateData.basicSalary) updateData.basicSalary = parseFloat(updateData.basicSalary);

    const employee = await prisma.employee.update({
      where: { id },
      data: updateData
    });

    res.json(employee);
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ error: 'Failed to update employee' });
  }
};

export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Soft delete or hard delete? Design says DELETE route, but status exists.
    // Let's do soft delete by setting status to TERMINATED or INACTIVE if preferred, 
    // but standard DELETE usually implies removal. 
    // Given the constraints and relations, hard delete might fail if there are payrolls.
    // Let's try hard delete, if it fails, user should know.
    
    await prisma.employee.delete({
      where: { id }
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete employee. They may have associated records.' });
  }
};

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // 1. Pending Tasks
    const [pendingLeaves, pendingOvertime, pendingCashAdvance] = await Promise.all([
      prisma.leaveRequest.count({ where: { employeeId: id, status: 'PENDING' } }),
      prisma.overtimeRequest.count({ where: { employeeId: id, status: 'PENDING' } }),
      prisma.cashAdvanceRequest.count({ where: { employeeId: id, status: 'PENDING' } })
    ]);
    const pendingTasks = pendingLeaves + pendingOvertime + pendingCashAdvance;

    // 2. Next Payday
    const today = new Date();
    const day = today.getDate();
    let nextPayDate = new Date(today);
    
    if (day < 15) {
      nextPayDate.setDate(15);
    } else {
       // Check if we are before the last day of month
       const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
       if (day < lastDay.getDate()) {
          nextPayDate = lastDay;
       } else {
          nextPayDate.setMonth(nextPayDate.getMonth() + 1);
          nextPayDate.setDate(15);
       }
    }
    
    const nextPayday = nextPayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });

    // 3. Latest Net Pay
    const latestPayroll = await prisma.payroll.findFirst({
      where: { employeeId: id },
      orderBy: { periodEnd: 'desc' }
    });
    const latestNetPay = latestPayroll ? latestPayroll.netPay : 0;

    // 4. Leave Credits
    const yearStart = new Date(new Date().getFullYear(), 0, 1);
    const yearEnd = new Date(new Date().getFullYear(), 11, 31);

    const [customCredits, approvedLeaves] = await Promise.all([
      prisma.leaveCredit.findMany({ where: { employeeId: id } }),
      prisma.leaveRequest.findMany({
        where: {
          employeeId: id,
          status: 'APPROVED',
          startDate: { gte: yearStart, lte: yearEnd }
        }
      })
    ]);

    const defaultEntitlements: Record<string, number> = {
      VACATION: 15,
      SICK_LEAVE: 10,
      EMERGENCY_LEAVE: 3,
      MATERNITY_LEAVE: 60,
      PATERNITY_LEAVE: 7,
      BEREAVEMENT_LEAVE: 3,
      UNPAID_LEAVE: 0,
      OTHER: 5
    };

    // Merge entitlements
    const entitlements: Record<string, number> = { ...defaultEntitlements };
    customCredits.forEach(c => {
      entitlements[c.leaveType] = c.credits;
    });

    // Calculate used
    const usedByType: Record<string, number> = {};
    approvedLeaves.forEach(l => {
      usedByType[l.leaveType] = (usedByType[l.leaveType] || 0) + (l.totalDays || 0);
    });

    // Calculate total remaining (excluding UNPAID)
    let totalRemaining = 0;
    Object.keys(entitlements).forEach(type => {
      if (type === 'UNPAID_LEAVE') return;
      const entitlement = entitlements[type];
      const used = usedByType[type] || 0;
      totalRemaining += Math.max(0, entitlement - used);
    });

    res.json({
      pendingTasks,
      nextPayday,
      latestNetPay,
      leaveCredits: totalRemaining
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};
