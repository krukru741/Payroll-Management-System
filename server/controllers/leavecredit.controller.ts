import { Request, Response } from 'express';
import prisma from '../db';

// Get leave credits for an employee
export const getLeaveCredits = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;

    const credits = await prisma.leaveCredit.findMany({
      where: { employeeId },
      orderBy: { leaveType: 'asc' }
    });

    // Default entitlements if no custom credits exist
    const defaultEntitlements: Record<string, number> = {
      VACATION: 15,
      SICK_LEAVE: 10,
      EMERGENCY_LEAVE: 3,
      MATERNITY_LEAVE: 60,
      PATERNITY_LEAVE: 7,
      BEREAVEMENT_LEAVE: 3,
      UNPAID_LEAVE: 999,
      OTHER: 5
    };

    // Build response with custom credits or defaults
    const leaveCredits: Record<string, any> = {};
    Object.keys(defaultEntitlements).forEach(leaveType => {
      const customCredit = credits.find(c => c.leaveType === leaveType);
      leaveCredits[leaveType] = {
        credits: customCredit?.credits ?? defaultEntitlements[leaveType],
        isCustom: !!customCredit,
        adjustedBy: customCredit?.adjustedBy,
        adjustedAt: customCredit?.adjustedAt,
        reason: customCredit?.reason
      };
    });

    res.json({
      employeeId,
      leaveCredits,
      customCredits: credits
    });
  } catch (error) {
    console.error('Get leave credits error:', error);
    res.status(500).json({ error: 'Failed to fetch leave credits' });
  }
};

// Adjust leave credits for an employee
export const adjustLeaveCredits = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const { leaveType, credits, reason } = req.body;
    const adjustedBy = (req as any).user?.userId;

    if (!leaveType || credits === undefined) {
      return res.status(400).json({ error: 'Leave type and credits are required' });
    }

    if (credits < 0) {
      return res.status(400).json({ error: 'Credits cannot be negative' });
    }

    // Check if employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Upsert leave credit
    const leaveCredit = await prisma.leaveCredit.upsert({
      where: {
        employeeId_leaveType: {
          employeeId,
          leaveType
        }
      },
      update: {
        credits,
        adjustedBy,
        adjustedAt: new Date(),
        reason
      },
      create: {
        employeeId,
        leaveType,
        credits,
        adjustedBy,
        reason
      }
    });

    res.json(leaveCredit);
  } catch (error) {
    console.error('Adjust leave credits error:', error);
    res.status(500).json({ error: 'Failed to adjust leave credits' });
  }
};

// Bulk adjust multiple leave types
export const bulkAdjustLeaveCredits = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const { adjustments, reason } = req.body; // adjustments: { leaveType: credits }
    const adjustedBy = (req as any).user?.userId;

    if (!adjustments || typeof adjustments !== 'object') {
      return res.status(400).json({ error: 'Adjustments object is required' });
    }

    // Check if employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Perform bulk upsert
    const results = await Promise.all(
      Object.entries(adjustments).map(([leaveType, credits]) =>
        prisma.leaveCredit.upsert({
          where: {
            employeeId_leaveType: {
              employeeId,
              leaveType: leaveType as any
            }
          },
          update: {
            credits: credits as number,
            adjustedBy,
            adjustedAt: new Date(),
            reason
          },
          create: {
            employeeId,
            leaveType: leaveType as any,
            credits: credits as number,
            adjustedBy,
            reason
          }
        })
      )
    );

    res.json({
      message: 'Leave credits updated successfully',
      updated: results.length,
      credits: results
    });
  } catch (error) {
    console.error('Bulk adjust leave credits error:', error);
    res.status(500).json({ error: 'Failed to adjust leave credits' });
  }
};

// Reset leave credits to defaults
export const resetLeaveCredits = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;

    // Delete all custom credits for this employee
    await prisma.leaveCredit.deleteMany({
      where: { employeeId }
    });

    res.json({ message: 'Leave credits reset to defaults' });
  } catch (error) {
    console.error('Reset leave credits error:', error);
    res.status(500).json({ error: 'Failed to reset leave credits' });
  }
};

// Get adjustment history
export const getAdjustmentHistory = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;

    const history = await prisma.leaveCredit.findMany({
      where: { employeeId },
      orderBy: { adjustedAt: 'desc' }
    });

    res.json(history);
  } catch (error) {
    console.error('Get adjustment history error:', error);
    res.status(500).json({ error: 'Failed to fetch adjustment history' });
  }
};
