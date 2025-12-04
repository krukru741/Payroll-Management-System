import { Request, Response } from 'express';
import prisma from '../db';

// File a new leave request
export const createLeaveRequest = async (req: Request, res: Response) => {
  try {
    const { employeeId, leaveType, startDate, endDate, totalDays, reason, attachmentUrl } = req.body;

    // Validation
    if (!employeeId || !leaveType || !startDate || !endDate || !totalDays || !reason) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if dates are valid
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    // Create leave request
    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        employeeId,
        leaveType,
        startDate: start,
        endDate: end,
        totalDays,
        reason,
        attachmentUrl,
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

    res.status(201).json(leaveRequest);
  } catch (error) {
    console.error('Create leave request error:', error);
    res.status(500).json({ error: 'Failed to create leave request' });
  }
};

// Get leave requests with filters
export const getLeaveRequests = async (req: Request, res: Response) => {
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
      where.startDate = {};
      if (startDate) {
        where.startDate.gte = new Date(String(startDate));
      }
      if (endDate) {
        where.startDate.lte = new Date(String(endDate));
      }
    }

    const leaveRequests = await prisma.leaveRequest.findMany({
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

    res.json(leaveRequests);
  } catch (error) {
    console.error('Get leave requests error:', error);
    res.status(500).json({ error: 'Failed to fetch leave requests' });
  }
};

// Get a specific leave request
export const getLeaveRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
            position: true,
            email: true
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

    if (!leaveRequest) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    res.json(leaveRequest);
  } catch (error) {
    console.error('Get leave request error:', error);
    res.status(500).json({ error: 'Failed to fetch leave request' });
  }
};

// Update a leave request (only if pending)
export const updateLeaveRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { leaveType, startDate, endDate, totalDays, reason, attachmentUrl } = req.body;

    // Check if request exists and is pending
    const existing = await prisma.leaveRequest.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    if (existing.status !== 'PENDING') {
      return res.status(400).json({ error: 'Can only update pending requests' });
    }

    const leaveRequest = await prisma.leaveRequest.update({
      where: { id },
      data: {
        leaveType,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        totalDays,
        reason,
        attachmentUrl
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

    res.json(leaveRequest);
  } catch (error) {
    console.error('Update leave request error:', error);
    res.status(500).json({ error: 'Failed to update leave request' });
  }
};

// Cancel a leave request
export const cancelLeaveRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.leaveRequest.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    if (existing.status !== 'PENDING') {
      return res.status(400).json({ error: 'Can only cancel pending requests' });
    }

    const leaveRequest = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: 'CANCELLED'
      }
    });

    res.json(leaveRequest);
  } catch (error) {
    console.error('Cancel leave request error:', error);
    res.status(500).json({ error: 'Failed to cancel leave request' });
  }
};

// Approve a leave request
export const approveLeaveRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reviewNotes } = req.body;
    const reviewerId = (req as any).user?.userId; // From auth middleware

    const existing = await prisma.leaveRequest.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    if (existing.status !== 'PENDING') {
      return res.status(400).json({ error: 'Request is not pending' });
    }

    const leaveRequest = await prisma.leaveRequest.update({
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

    res.json(leaveRequest);
  } catch (error) {
    console.error('Approve leave request error:', error);
    res.status(500).json({ error: 'Failed to approve leave request' });
  }
};

// Reject a leave request
export const rejectLeaveRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reviewNotes } = req.body;
    const reviewerId = (req as any).user?.userId;

    if (!reviewNotes) {
      return res.status(400).json({ error: 'Review notes are required for rejection' });
    }

    const existing = await prisma.leaveRequest.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    if (existing.status !== 'PENDING') {
      return res.status(400).json({ error: 'Request is not pending' });
    }

    const leaveRequest = await prisma.leaveRequest.update({
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

    res.json(leaveRequest);
  } catch (error) {
    console.error('Reject leave request error:', error);
    res.status(500).json({ error: 'Failed to reject leave request' });
  }
};

// Get leave balance for an employee
export const getLeaveBalance = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;

    // Get all approved leaves for the current year
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31);

    const approvedLeaves = await prisma.leaveRequest.findMany({
      where: {
        employeeId,
        status: 'APPROVED',
        startDate: {
          gte: yearStart,
          lte: yearEnd
        }
      }
    });

    const totalUsed = approvedLeaves.reduce((sum, leave) => sum + leave.totalDays, 0);

    // Assuming 15 days annual leave (configurable)
    const annualLeaveEntitlement = 15;
    const remaining = annualLeaveEntitlement - totalUsed;

    res.json({
      employeeId,
      year: currentYear,
      entitlement: annualLeaveEntitlement,
      used: totalUsed,
      remaining: Math.max(0, remaining),
      leaveHistory: approvedLeaves
    });
  } catch (error) {
    console.error('Get leave balance error:', error);
    res.status(500).json({ error: 'Failed to fetch leave balance' });
  }
};
