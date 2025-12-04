import { Request, Response } from 'express';
import prisma from '../db';

// File a new leave request (auto-calculation workflow)
export const createLeaveRequest = async (req: Request, res: Response) => {
  try {
    const { employeeId, leaveType, startDate, reason, attachmentUrl } = req.body;

    // Validation - only startDate required, endDate will be auto-calculated
    if (!employeeId || !leaveType || !startDate || !reason) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if employee has any active approved leave
    const activeLeave = await prisma.leaveRequest.findFirst({
      where: {
        employeeId,
        status: 'APPROVED',
        isActive: true
      }
    });

    if (activeLeave) {
      return res.status(400).json({ 
        error: 'You already have an active leave. Please complete it before filing a new one.' 
      });
    }

    // Create leave request (endDate and totalDays will be calculated on clock-in)
    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        employeeId,
        leaveType,
        startDate: new Date(startDate),
        reason,
        attachmentUrl,
        status: 'PENDING',
        isActive: false // Will be set to true when approved
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

// Approve a leave request (activates auto-calculation)
export const approveLeaveRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reviewNotes } = req.body;
    const reviewerId = (req as any).user?.userId; // From auth middleware

    const existing = await prisma.leaveRequest.findUnique({
      where: { id },
      include: { employee: true }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    if (existing.status !== 'PENDING') {
      return res.status(400).json({ error: 'Request is not pending' });
    }

    // Check if employee has another active leave (business rule: only one active leave at a time)
    const activeLeave = await prisma.leaveRequest.findFirst({
      where: {
        employeeId: existing.employeeId,
        status: 'APPROVED',
        isActive: true,
        id: { not: id }
      }
    });

    if (activeLeave) {
      return res.status(400).json({ 
        error: 'Employee already has an active leave. Cannot approve multiple leaves at once.' 
      });
    }

    const leaveRequest = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        isActive: true, // Mark as active - will auto-complete on next clock-in
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

    // Calculate total used (handle nullable totalDays for active leaves)
    const totalUsed = approvedLeaves.reduce((sum, leave) => {
      // Only count completed leaves (those with totalDays calculated)
      return sum + (leave.totalDays || 0);
    }, 0);

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

// Complete a leave request (called by attendance system on clock-in)
export const completeLeaveRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { endDate, completedBy, manualCompletion } = req.body;

    const existing = await prisma.leaveRequest.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    if (!existing.isActive) {
      return res.status(400).json({ error: 'Leave is not active' });
    }

    // Calculate total days
    const start = new Date(existing.startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const leaveRequest = await prisma.leaveRequest.update({
      where: { id },
      data: {
        endDate: end,
        totalDays,
        isActive: false,
        completedAt: new Date(),
        completedBy,
        manualCompletion: manualCompletion || false
      },
      include: {
        employee: true
      }
    });

    res.json(leaveRequest);
  } catch (error) {
    console.error('Complete leave request error:', error);
    res.status(500).json({ error: 'Failed to complete leave request' });
  }
};
