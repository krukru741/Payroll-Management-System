import { Request, Response } from 'express';
import prisma from '../db';

// File a new overtime request (auto-calculation workflow)
export const createOvertimeRequest = async (req: Request, res: Response) => {
  try {
    const { employeeId, date, startTime, reason, projectTask } = req.body;

    // Validation - only startTime required, endTime will be auto-calculated
    if (!employeeId || !date || !startTime || !reason) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const overtimeDate = new Date(date);
    const start = new Date(startTime);
    const now = new Date();

    // Check if this is backdated (filed after the OT date)
    const isBackdated = overtimeDate < new Date(now.setHours(0, 0, 0, 0));

    // Check if employee has active overtime for this date
    const activeOT = await prisma.overtimeRequest.findFirst({
      where: {
        employeeId,
        date: overtimeDate,
        status: 'APPROVED',
        isActive: true
      }
    });

    if (activeOT) {
      return res.status(400).json({ 
        error: 'You already have an active overtime request for this date.' 
      });
    }

    // Calculate overtime rate based on date (weekday/weekend/holiday)
    const dayOfWeek = overtimeDate.getDay();
    let overtimeRate = 1.25; // Default weekday rate

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      overtimeRate = 1.5; // Weekend rate
    }
    // TODO: Add holiday check for 2.0x rate

    // Create overtime request (endTime and totalHours will be calculated on clock-out)
    const overtimeRequest = await prisma.overtimeRequest.create({
      data: {
        employeeId,
        date: overtimeDate,
        startTime: start,
        reason,
        projectTask,
        overtimeRate,
        status: 'PENDING',
        isActive: false, // Will be set to true when approved
        isBackdated
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

// Approve an overtime request (activates auto-calculation)
export const approveOvertimeRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reviewNotes } = req.body;
    const reviewerId = (req as any).user?.userId;

    const existing = await prisma.overtimeRequest.findUnique({
      where: { id },
      include: { employee: true }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Overtime request not found' });
    }

    if (existing.status !== 'PENDING') {
      return res.status(400).json({ error: 'Request is not pending' });
    }

    // Check if employee has another active OT for the same date
    const activeOT = await prisma.overtimeRequest.findFirst({
      where: {
        employeeId: existing.employeeId,
        date: existing.date,
        status: 'APPROVED',
        isActive: true,
        id: { not: id }
      }
    });

    if (activeOT) {
      return res.status(400).json({ 
        error: 'Employee already has an active overtime for this date.' 
      });
    }

    const overtimeRequest = await prisma.overtimeRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        isActive: true, // Mark as active - will auto-complete on clock-out
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

    // Handle nullable totalHours for active overtimes
    const totalHours = approvedOvertimes.reduce((sum, ot) => sum + (ot.totalHours || 0), 0);
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

// Complete an overtime request (called by attendance system on clock-out)
export const completeOvertimeRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { endTime, completedBy, manualCompletion } = req.body;

    const existing = await prisma.overtimeRequest.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            ratePerHour: true
          }
        }
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Overtime request not found' });
    }

    if (!existing.isActive) {
      return res.status(400).json({ error: 'Overtime is not active' });
    }

    // Calculate total hours
    const start = new Date(existing.startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const totalHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100; // Round to 2 decimals

    // Calculate overtime pay
    const overtimePay = existing.employee.ratePerHour
      ? totalHours * existing.employee.ratePerHour * (existing.overtimeRate || 1.25)
      : null;

    const overtimeRequest = await prisma.overtimeRequest.update({
      where: { id },
      data: {
        endTime: end,
        totalHours,
        overtimePay,
        isActive: false,
        completedAt: new Date(),
        completedBy,
        manualCompletion: manualCompletion || false
      },
      include: {
        employee: true
      }
    });

    res.json(overtimeRequest);
  } catch (error) {
    console.error('Complete overtime request error:', error);
    res.status(500).json({ error: 'Failed to complete overtime request' });
  }
};
