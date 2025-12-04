import { Request, Response } from 'express';
import prisma from '../db';

// File a new cash advance request
export const createCashAdvanceRequest = async (req: Request, res: Response) => {
  try {
    const { employeeId, amount, reason, repaymentPlan } = req.body;

    // Validation
    if (!employeeId || !amount || !reason || !repaymentPlan) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    // Get employee's salary to check limits
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { 
        basicSalary: true,
        firstName: true,
        lastName: true
      }
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Check if amount exceeds 50% of monthly salary
    const maxAllowed = employee.basicSalary * 0.5;
    if (amount > maxAllowed) {
      return res.status(400).json({ 
        error: `Amount exceeds maximum allowed (50% of salary: ₱${maxAllowed.toFixed(2)})` 
      });
    }

    // Check for existing outstanding cash advances
    const existingAdvance = await prisma.cashAdvanceRequest.findFirst({
      where: {
        employeeId,
        status: 'APPROVED',
        isFullyRepaid: false
      }
    });

    if (existingAdvance) {
      return res.status(400).json({ 
        error: `You have an outstanding cash advance of ₱${existingAdvance.remainingBalance.toFixed(2)}. Please repay it first.` 
      });
    }

    // Create cash advance request
    const cashAdvanceRequest = await prisma.cashAdvanceRequest.create({
      data: {
        employeeId,
        amount,
        reason,
        repaymentPlan,
        remainingBalance: amount,
        status: 'PENDING',
        managerApproval: 'PENDING',
        adminApproval: 'PENDING'
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
            position: true,
            basicSalary: true
          }
        }
      }
    });

    res.status(201).json(cashAdvanceRequest);
  } catch (error) {
    console.error('Create cash advance request error:', error);
    res.status(500).json({ error: 'Failed to create cash advance request' });
  }
};

// Get cash advance requests with filters
export const getCashAdvanceRequests = async (req: Request, res: Response) => {
  try {
    const { employeeId, status, managerApproval, adminApproval } = req.query;

    const where: any = {};

    if (employeeId) {
      where.employeeId = String(employeeId);
    }

    if (status) {
      where.status = String(status);
    }

    if (managerApproval) {
      where.managerApproval = String(managerApproval);
    }

    if (adminApproval) {
      where.adminApproval = String(adminApproval);
    }

    const cashAdvanceRequests = await prisma.cashAdvanceRequest.findMany({
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
        managerApprovedBy: {
          select: {
            id: true,
            name: true
          }
        },
        adminApprovedBy: {
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

    res.json(cashAdvanceRequests);
  } catch (error) {
    console.error('Get cash advance requests error:', error);
    res.status(500).json({ error: 'Failed to fetch cash advance requests' });
  }
};

// Get a specific cash advance request
export const getCashAdvanceRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const cashAdvanceRequest = await prisma.cashAdvanceRequest.findUnique({
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
            basicSalary: true
          }
        },
        managerApprovedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        adminApprovedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!cashAdvanceRequest) {
      return res.status(404).json({ error: 'Cash advance request not found' });
    }

    res.json(cashAdvanceRequest);
  } catch (error) {
    console.error('Get cash advance request error:', error);
    res.status(500).json({ error: 'Failed to fetch cash advance request' });
  }
};

// Update a cash advance request (only if pending)
export const updateCashAdvanceRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, reason, repaymentPlan } = req.body;

    const existing = await prisma.cashAdvanceRequest.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Cash advance request not found' });
    }

    if (existing.status !== 'PENDING') {
      return res.status(400).json({ error: 'Can only update pending requests' });
    }

    const cashAdvanceRequest = await prisma.cashAdvanceRequest.update({
      where: { id },
      data: {
        amount,
        reason,
        repaymentPlan,
        remainingBalance: amount || existing.amount
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

    res.json(cashAdvanceRequest);
  } catch (error) {
    console.error('Update cash advance request error:', error);
    res.status(500).json({ error: 'Failed to update cash advance request' });
  }
};

// Cancel a cash advance request
export const cancelCashAdvanceRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.cashAdvanceRequest.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Cash advance request not found' });
    }

    if (existing.status !== 'PENDING') {
      return res.status(400).json({ error: 'Can only cancel pending requests' });
    }

    const cashAdvanceRequest = await prisma.cashAdvanceRequest.update({
      where: { id },
      data: {
        status: 'CANCELLED'
      }
    });

    res.json(cashAdvanceRequest);
  } catch (error) {
    console.error('Cancel cash advance request error:', error);
    res.status(500).json({ error: 'Failed to cancel cash advance request' });
  }
};

// Manager approval
export const managerApproveCashAdvance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { managerNotes } = req.body;
    const managerId = (req as any).user?.userId;

    const existing = await prisma.cashAdvanceRequest.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Cash advance request not found' });
    }

    if (existing.status !== 'PENDING') {
      return res.status(400).json({ error: 'Request is not pending' });
    }

    if (existing.managerApproval !== 'PENDING') {
      return res.status(400).json({ error: 'Manager approval already processed' });
    }

    const cashAdvanceRequest = await prisma.cashAdvanceRequest.update({
      where: { id },
      data: {
        managerApproval: 'APPROVED',
        managerApprovedById: managerId,
        managerApprovedAt: new Date(),
        managerNotes
      },
      include: {
        employee: true,
        managerApprovedBy: true
      }
    });

    res.json(cashAdvanceRequest);
  } catch (error) {
    console.error('Manager approve cash advance error:', error);
    res.status(500).json({ error: 'Failed to approve cash advance request' });
  }
};

// Admin final approval
export const adminApproveCashAdvance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;
    const adminId = (req as any).user?.userId;

    const existing = await prisma.cashAdvanceRequest.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Cash advance request not found' });
    }

    if (existing.status !== 'PENDING') {
      return res.status(400).json({ error: 'Request is not pending' });
    }

    if (existing.managerApproval !== 'APPROVED') {
      return res.status(400).json({ error: 'Manager approval required first' });
    }

    if (existing.adminApproval !== 'PENDING') {
      return res.status(400).json({ error: 'Admin approval already processed' });
    }

    const cashAdvanceRequest = await prisma.cashAdvanceRequest.update({
      where: { id },
      data: {
        adminApproval: 'APPROVED',
        adminApprovedById: adminId,
        adminApprovedAt: new Date(),
        adminNotes,
        status: 'APPROVED' // Final approval
      },
      include: {
        employee: true,
        managerApprovedBy: true,
        adminApprovedBy: true
      }
    });

    res.json(cashAdvanceRequest);
  } catch (error) {
    console.error('Admin approve cash advance error:', error);
    res.status(500).json({ error: 'Failed to approve cash advance request' });
  }
};

// Reject cash advance (can be done by manager or admin)
export const rejectCashAdvance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reviewNotes, rejectedBy } = req.body; // 'manager' or 'admin'
    const reviewerId = (req as any).user?.userId;

    if (!reviewNotes) {
      return res.status(400).json({ error: 'Review notes are required for rejection' });
    }

    const existing = await prisma.cashAdvanceRequest.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Cash advance request not found' });
    }

    if (existing.status !== 'PENDING') {
      return res.status(400).json({ error: 'Request is not pending' });
    }

    const updateData: any = {
      status: 'REJECTED'
    };

    if (rejectedBy === 'manager') {
      updateData.managerApproval = 'REJECTED';
      updateData.managerApprovedById = reviewerId;
      updateData.managerApprovedAt = new Date();
      updateData.managerNotes = reviewNotes;
    } else if (rejectedBy === 'admin') {
      updateData.adminApproval = 'REJECTED';
      updateData.adminApprovedById = reviewerId;
      updateData.adminApprovedAt = new Date();
      updateData.adminNotes = reviewNotes;
    }

    const cashAdvanceRequest = await prisma.cashAdvanceRequest.update({
      where: { id },
      data: updateData,
      include: {
        employee: true,
        managerApprovedBy: true,
        adminApprovedBy: true
      }
    });

    res.json(cashAdvanceRequest);
  } catch (error) {
    console.error('Reject cash advance error:', error);
    res.status(500).json({ error: 'Failed to reject cash advance request' });
  }
};

// Mark as disbursed
export const disburseCashAdvance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const disbursedBy = (req as any).user?.userId;

    const existing = await prisma.cashAdvanceRequest.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Cash advance request not found' });
    }

    if (existing.status !== 'APPROVED') {
      return res.status(400).json({ error: 'Request must be approved first' });
    }

    if (existing.isDisbursed) {
      return res.status(400).json({ error: 'Cash advance already disbursed' });
    }

    const cashAdvanceRequest = await prisma.cashAdvanceRequest.update({
      where: { id },
      data: {
        isDisbursed: true,
        disbursedAt: new Date(),
        disbursedBy
      },
      include: {
        employee: true
      }
    });

    res.json(cashAdvanceRequest);
  } catch (error) {
    console.error('Disburse cash advance error:', error);
    res.status(500).json({ error: 'Failed to disburse cash advance' });
  }
};

// Get outstanding balance for an employee
export const getOutstandingBalance = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;

    const outstandingAdvances = await prisma.cashAdvanceRequest.findMany({
      where: {
        employeeId,
        status: 'APPROVED',
        isFullyRepaid: false
      }
    });

    const totalOutstanding = outstandingAdvances.reduce((sum, adv) => sum + adv.remainingBalance, 0);
    const totalRepaid = outstandingAdvances.reduce((sum, adv) => sum + adv.repaidAmount, 0);

    res.json({
      employeeId,
      totalOutstanding,
      totalRepaid,
      activeAdvances: outstandingAdvances.length,
      advances: outstandingAdvances
    });
  } catch (error) {
    console.error('Get outstanding balance error:', error);
    res.status(500).json({ error: 'Failed to fetch outstanding balance' });
  }
};
