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

    // Leave entitlements per type (configurable - could be moved to database)
    const defaultEntitlements: Record<string, number> = {
      VACATION: 15,
      SICK_LEAVE: 10,
      EMERGENCY_LEAVE: 3,
      MATERNITY_LEAVE: 60,
      PATERNITY_LEAVE: 7,
      BEREAVEMENT_LEAVE: 3,
      UNPAID_LEAVE: 999, // Unlimited
      OTHER: 5
    };

    // Get custom leave credits if any
    const customCredits = await prisma.leaveCredit.findMany({
      where: { employeeId }
    });

    // Build entitlements map (custom overrides default)
    const leaveEntitlements: Record<string, number> = { ...defaultEntitlements };
    customCredits.forEach(credit => {
      leaveEntitlements[credit.leaveType] = credit.credits;
    });

    // Calculate used days per leave type
    const usedByType: Record<string, number> = {};
    approvedLeaves.forEach(leave => {
      const leaveType = leave.leaveType;
      if (!usedByType[leaveType]) {
        usedByType[leaveType] = 0;
      }
      // Only count completed leaves (those with totalDays calculated)
      usedByType[leaveType] += leave.totalDays || 0;
    });

    // Build detailed balance per leave type
    const leaveBalances: Record<string, any> = {};
    Object.keys(leaveEntitlements).forEach(leaveType => {
      const entitlement = leaveEntitlements[leaveType];
      const used = usedByType[leaveType] || 0;
      const remaining = leaveType === 'UNPAID_LEAVE' ? 999 : Math.max(0, entitlement - used);
      
      leaveBalances[leaveType] = {
        entitlement,
        used,
        remaining
      };
    });

    // Calculate totals (excluding UNPAID_LEAVE)
    const totalEntitlement = Object.keys(leaveEntitlements)
      .filter(type => type !== 'UNPAID_LEAVE')
      .reduce((sum, type) => sum + leaveEntitlements[type], 0);
    
    const totalUsed = Object.keys(usedByType)
      .filter(type => type !== 'UNPAID_LEAVE')
      .reduce((sum, type) => sum + usedByType[type], 0);
    
    const totalRemaining = Math.max(0, totalEntitlement - totalUsed);

    res.json({
      employeeId,
      year: currentYear,
      leaveBalances,
      totals: {
        entitlement: totalEntitlement,
        used: totalUsed,
        remaining: totalRemaining
      },
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
