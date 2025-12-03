import { Request, Response } from 'express';
import prisma from '../db';

export const createLeaveRequest = async (req: Request, res: Response) => {
  try {
    const { employeeId, type, startDate, endDate, reason } = req.body;

    const leave = await prisma.leaveRequest.create({
      data: {
        employeeId,
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason
      }
    });

    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create leave request' });
  }
};

export const getLeaveRequests = async (req: Request, res: Response) => {
  try {
    const { employeeId, status } = req.query;
    
    const where: any = {};
    if (employeeId) where.employeeId = String(employeeId);
    if (status) where.status = String(status);

    const leaves = await prisma.leaveRequest.findMany({
      where,
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            department: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(leaves);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leave requests' });
  }
};

export const updateLeaveStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason, approvedBy } = req.body;

    const leave = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status,
        rejectionReason,
        approvedBy
      }
    });

    res.json(leave);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update leave status' });
  }
};
