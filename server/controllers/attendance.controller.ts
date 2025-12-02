import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const clockIn = async (req: Request, res: Response) => {
  try {
    const { employeeId, timestamp } = req.body;
    const date = new Date(timestamp);
    
    // Check if already clocked in for this date
    // Note: We need to normalize date to start of day for the unique constraint check if we were using strictly date types,
    // but here we rely on the client or business logic.
    // For simplicity, let's assume one record per day per employee.
    
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'Already clocked in for today' });
    }

    const attendance = await prisma.attendance.create({
      data: {
        employeeId,
        date: startOfDay,
        timeIn: date,
        status: 'PRESENT' // Logic to determine LATE could go here
      }
    });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to clock in' });
  }
};

export const clockOut = async (req: Request, res: Response) => {
  try {
    const { employeeId, timestamp } = req.body;
    const date = new Date(timestamp);
    
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const attendance = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    if (!attendance) {
      return res.status(400).json({ error: 'No clock-in record found for today' });
    }

    if (attendance.timeOut) {
      return res.status(400).json({ error: 'Already clocked out' });
    }

    // Calculate hours worked
    const timeIn = new Date(attendance.timeIn!);
    const timeOut = date;
    const diffMs = timeOut.getTime() - timeIn.getTime();
    const hoursWorked = diffMs / (1000 * 60 * 60);

    const updated = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        timeOut,
        hoursWorked
      }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to clock out' });
  }
};

export const getAttendance = async (req: Request, res: Response) => {
  try {
    const { employeeId, startDate, endDate } = req.query;
    
    const where: any = {};
    if (employeeId) where.employeeId = String(employeeId);
    if (startDate && endDate) {
      where.date = {
        gte: new Date(String(startDate)),
        lte: new Date(String(endDate))
      };
    }

    const attendance = await prisma.attendance.findMany({
      where,
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { date: 'desc' }
    });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
};
