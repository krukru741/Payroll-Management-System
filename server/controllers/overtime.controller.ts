import { Request, Response } from 'express';
import prisma from '../db';

// File a new overtime request
export const createOvertimeRequest = async (req: Request, res: Response) => {
  try {
    const { employeeId, date, startTime, endTime, totalHours, reason, projectTask } = req.body;

    // Validation
    if (!employeeId || !date || !startTime || !endTime || !totalHours || !reason) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if times are valid
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (end <= start) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    // Calculate overtime rate based on date (weekday/weekend/holiday)
    const overtimeDate = new Date(date);
    const dayOfWeek = overtimeDate.getDay();
    let overtimeRate = 1.25; // Default weekday rate

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      overtimeRate = 1.5; // Weekend rate
    }
    // TODO: Add holiday check for 2.0x rate

    // Get employee's hourly rate
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { ratePerHour: true }
    });

    const overtimePay = employee?.ratePerHour 
      ? totalHours * employee.ratePerHour * overtimeRate 
      : null;

    // Create overtime request
    const overtimeRequest = await prisma.overtimeRequest.create({
      data: {
        employeeId,
        date: overtimeDate,
        startTime: start,
        endTime: end,
        totalHours,
        reason,
        projectTask,
        overtimeRate,
        overtimePay,
        status: 'PENDING'
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
            position: true
          }
        }
      }
    });

    res.status(201).json(overtimeRequest);
  } catch (error) {
    console.error('Create overtime request error:', error);
    res.status(500).json({ error: 'Failed to create overtime request' });
  }
};

// Get overtime requests with filters
export const getOvertimeRequests = async (req: Request, res: Response) => {
  try {
    const { employeeId, status, startDate, endDate } = req.query;

    const where: any = {};

    if (employeeId) {
      where.employeeId = String(employeeId);
    }

    if (status) {
      where.status = String(status);
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(String(startDate));
      }
      if (endDate) {
        where.date.lte = new Date(String(endDate));
      }
    }

    const overtimeRequests = await prisma.overtimeRequest.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
            position: true
          }
        },
        reviewedBy: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(overtimeRequests);
  } catch (error) {
    console.error('Get overtime requests error:', error);
    res.status(500).json({ error: 'Failed to fetch overtime requests' });
  }
};

// Get a specific overtime request
export const getOvertimeRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const overtimeRequest = await prisma.overtimeRequest.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
            position: true,
            email: true,
            ratePerHour: true
          }
        },
        reviewedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!overtimeRequest) {
      return res.status(404).json({ error: 'Overtime request not found' });
    }

    res.json(overtimeRequest);
  } catch (error) {
    console.error('Get overtime request error:', error);
    res.status(500).json({ error: 'Failed to fetch overtime request' });
  }
};

// Update an overtime request (only if pending)
export const updateOvertimeRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { date, startTime, endTime, totalHours, reason, projectTask } = req.body;

    const existing = await prisma.overtimeRequest.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Overtime request not found' });
    }

    if (existing.status !== 'PENDING') {
      return res.status(400).json({ error: 'Can only update pending requests' });
    }

    const overtimeRequest = await prisma.overtimeRequest.update({
      where: { id },
      data: {
        date: date ? new Date(date) : undefined,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        totalHours,
        reason,
        projectTask
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.json(overtimeRequest);
  } catch (error) {
    console.error('Update overtime request error:', error);
    res.status(500).json({ error: 'Failed to update overtime request' });
  }
};

// Cancel an overtime request
export const cancelOvertimeRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.overtimeRequest.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Overtime request not found' });
    }

    if (existing.status !== 'PENDING') {
      return res.status(400).json({ error: 'Can only cancel pending requests' });
    }

    const overtimeRequest = await prisma.overtimeRequest.update({
      where: { id },
      data: {
        status: 'CANCELLED'
      }
    });

    res.json(overtimeRequest);
  } catch (error) {
    console.error('Cancel overtime request error:', error);
    res.status(500).json({ error: 'Failed to cancel overtime request' });
  }
};

// Approve an overtime request
export const approveOvertimeRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reviewNotes } = req.body;
    const reviewerId = (req as any).user?.userId;

    const existing = await prisma.overtimeRequest.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Overtime request not found' });
    }

    if (existing.status !== 'PENDING') {
      return res.status(400).json({ error: 'Request is not pending' });
    }

    const overtimeRequest = await prisma.overtimeRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        reviewedById: reviewerId,
        reviewedAt: new Date(),
        reviewNotes
      },
      include: {
        employee: true,
        reviewedBy: true
      }
    });

    res.json(overtimeRequest);
  } catch (error) {
    console.error('Approve overtime request error:', error);
    res.status(500).json({ error: 'Failed to approve overtime request' });
  }
};

// Reject an overtime request
export const rejectOvertimeRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reviewNotes } = req.body;
    const reviewerId = (req as any).user?.userId;

    if (!reviewNotes) {
      return res.status(400).json({ error: 'Review notes are required for rejection' });
    }

    const existing = await prisma.overtimeRequest.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Overtime request not found' });
    }

    if (existing.status !== 'PENDING') {
      return res.status(400).json({ error: 'Request is not pending' });
    }

    const overtimeRequest = await prisma.overtimeRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reviewedById: reviewerId,
        reviewedAt: new Date(),
        reviewNotes
      },
      include: {
        employee: true,
        reviewedBy: true
      }
    });

    res.json(overtimeRequest);
  } catch (error) {
    console.error('Reject overtime request error:', error);
    res.status(500).json({ error: 'Failed to reject overtime request' });
  }
};

// Get overtime summary for an employee
export const getOvertimeSummary = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const { year, month } = req.query;

    const currentYear = year ? parseInt(String(year)) : new Date().getFullYear();
    const currentMonth = month ? parseInt(String(month)) - 1 : new Date().getMonth();

    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 0);

    const approvedOvertimes = await prisma.overtimeRequest.findMany({
      where: {
        employeeId,
        status: 'APPROVED',
        date: {
          gte: monthStart,
          lte: monthEnd
        }
      }
    });

    const totalHours = approvedOvertimes.reduce((sum, ot) => sum + ot.totalHours, 0);
    const totalPay = approvedOvertimes.reduce((sum, ot) => sum + (ot.overtimePay || 0), 0);
    const paidOvertimes = approvedOvertimes.filter(ot => ot.isPaid);
    const unpaidOvertimes = approvedOvertimes.filter(ot => !ot.isPaid);

    res.json({
      employeeId,
      period: {
        year: currentYear,
        month: currentMonth + 1,
        monthName: monthStart.toLocaleString('default', { month: 'long' })
      },
      totalHours,
      totalPay,
      paidCount: paidOvertimes.length,
      unpaidCount: unpaidOvertimes.length,
      overtimes: approvedOvertimes
    });
  } catch (error) {
    console.error('Get overtime summary error:', error);
    res.status(500).json({ error: 'Failed to fetch overtime summary' });
  }
};
