import { Request, Response } from 'express';
import prisma from '../db';

// Helper function to count working days (excluding weekends)
const countWorkingDays = (startDate: Date, endDate: Date): number => {
  let count = 0;
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    // 0 = Sunday, 6 = Saturday
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
};

// Get attendance summary for payroll period
export const getAttendanceSummary = async (req: Request, res: Response) => {
  try {
    const { periodStart, periodEnd, employeeId } = req.query;

    if (!periodStart || !periodEnd) {
      return res.status(400).json({ error: 'Period start and end dates are required' });
    }

    const startDate = new Date(periodStart as string);
    const endDate = new Date(periodEnd as string);
    const expectedWorkingDays = countWorkingDays(startDate, endDate);

    const where: any = {
      date: {
        gte: startDate,
        lte: endDate
      }
    };

    if (employeeId) {
      where.employeeId = employeeId as string;
    }

    const attendanceRecords = await prisma.attendance.findMany({
      where,
      select: {
        employeeId: true,
        hoursWorked: true,
        overtimeHours: true,
        timeIn: true,
        timeOut: true,
        date: true
      }
    });

    // Get all employees if no specific employee requested
    let employeeIds: string[] = [];
    if (!employeeId) {
      const employees = await prisma.employee.findMany({
        select: { id: true }
      });
      employeeIds = employees.map(e => e.id);
    }

    // Group by employee and calculate totals
    const summary = attendanceRecords.reduce((acc: any, record) => {
      if (!acc[record.employeeId]) {
        acc[record.employeeId] = {
          employeeId: record.employeeId,
          totalHours: 0,
          totalOvertimeHours: 0,
          totalLateMinutes: 0,
          daysPresent: 0,
          daysAbsent: 0
        };
      }

      acc[record.employeeId].totalHours += record.hoursWorked;
      acc[record.employeeId].totalOvertimeHours += record.overtimeHours;
      acc[record.employeeId].daysPresent += 1;

      // Calculate late minutes (if timeIn is after 8:00 AM)
      if (record.timeIn) {
        const timeIn = new Date(record.timeIn);
        const hours = timeIn.getHours();
        const minutes = timeIn.getMinutes();
        const workStart = 8 * 60; // 8:00 AM in minutes
        const actualStart = hours * 60 + minutes;
        const gracePeriod = 15; // 15 minutes grace period
        
        if (actualStart > workStart + gracePeriod) {
          acc[record.employeeId].totalLateMinutes += (actualStart - workStart);
        }
      }

      return acc;
    }, {});

    // Calculate absent days for each employee
    const result = Object.values(summary).map((emp: any) => ({
      ...emp,
      daysAbsent: Math.max(0, expectedWorkingDays - emp.daysPresent)
    }));

    // Add employees with no attendance records (all absent)
    if (!employeeId) {
      employeeIds.forEach(id => {
        if (!summary[id]) {
          result.push({
            employeeId: id,
            totalHours: 0,
            totalOvertimeHours: 0,
            totalLateMinutes: 0,
            daysPresent: 0,
            daysAbsent: expectedWorkingDays
          });
        }
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching attendance summary:', error);
    res.status(500).json({ error: 'Failed to fetch attendance summary' });
  }
};

// Get approved cash advances for payroll period
export const getCashAdvances = async (req: Request, res: Response) => {
  try {
    const { periodStart, periodEnd, employeeId } = req.query;

    const where: any = {
      // Cash advance must be approved by both manager and admin
      managerApproval: 'APPROVED',
      adminApproval: 'APPROVED',
      // And must be disbursed
      isDisbursed: true
    };

    // Filter by disbursement date (when the cash was actually given)
    if (periodStart && periodEnd) {
      where.disbursedAt = {
        gte: new Date(periodStart as string),
        lte: new Date(periodEnd as string)
      };
    }

    if (employeeId) {
      where.employeeId = employeeId as string;
    }

    const cashAdvances = await prisma.cashAdvanceRequest.findMany({
      where,
      select: {
        id: true,
        employeeId: true,
        amount: true,
        reason: true,
        disbursedAt: true
      }
    });

    // Group by employee and sum amounts
    const summary = cashAdvances.reduce((acc: any, advance) => {
      if (!acc[advance.employeeId]) {
        acc[advance.employeeId] = {
          employeeId: advance.employeeId,
          totalCashAdvance: 0,
          advances: []
        };
      }

      acc[advance.employeeId].totalCashAdvance += advance.amount;
      acc[advance.employeeId].advances.push({
        id: advance.id,
        amount: advance.amount,
        reason: advance.reason,
        date: advance.disbursedAt
      });

      return acc;
    }, {});

    res.json(Object.values(summary));
  } catch (error) {
    console.error('Error fetching cash advances:', error);
    res.status(500).json({ error: 'Failed to fetch cash advances' });
  }
};
