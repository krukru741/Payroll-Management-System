import { Request, Response } from 'express';
import prisma from '../db';

const calculateStatus = (workSchedule: string | null, timeIn: Date): string => {
  let status = 'PRESENT';
  if (workSchedule && workSchedule !== 'Flexible Schedule') {
    try {
      console.log('Parsing work schedule:', workSchedule);
      const timeMatch = workSchedule.match(/(\d{1,2}[:;.]\d{2}\s*[AP]M)/i);
      
      if (timeMatch) {
        const scheduleTimeStr = timeMatch[0].replace(';', ':').replace('.', ':');
        console.log('Matched time string:', scheduleTimeStr);
        
        const scheduleTime = new Date(timeIn);
        const normalizedTime = scheduleTimeStr.replace(/\s+/g, ' ').trim();
        const [time, period] = normalizedTime.split(' ');
        
        console.log('Time:', time, 'Period:', period);
        
        let [hours, minutes] = time.split(':').map(Number);
        
        const isPM = period && period.toUpperCase().startsWith('P');
        const isAM = period && period.toUpperCase().startsWith('A');
        
        if (isPM && hours !== 12) hours += 12;
        if (isAM && hours === 12) hours = 0;
        
        scheduleTime.setHours(hours, minutes, 0, 0);
        console.log('Schedule Time:', scheduleTime.toISOString());

        const gracePeriodEnd = new Date(scheduleTime.getTime() + 15 * 60000);
        console.log('Grace Period End:', gracePeriodEnd.toISOString());
        console.log('Time In:', timeIn.toISOString());
        console.log('Is Late?', timeIn > gracePeriodEnd);

        if (timeIn > gracePeriodEnd) {
          status = 'LATE';
        }
      } else {
        console.log('No time match found in schedule');
      }
    } catch (e) {
      console.error('Error parsing schedule:', e);
    }
  }
  return status;
};

export const clockIn = async (req: Request, res: Response) => {
  try {
    const { employeeId, timestamp } = req.body;
    console.log('Clock In Request:', { employeeId, timestamp });

    if (!employeeId) {
      return res.status(400).json({ error: 'Employee ID is required. Your account might not be linked to an employee record.' });
    }

    const date = new Date(timestamp);
    
    // Fetch employee schedule using raw query to bypass persistent Prisma Client type issues (editor not reloading types)
    const result: any[] = await prisma.$queryRaw`SELECT "workSchedule" FROM "Employee" WHERE id = ${employeeId}`;
    const employee = result[0];

    const status = calculateStatus(employee?.workSchedule, date);
    
    // Check if already clocked in for this date
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
        status: status
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
      const start = new Date(String(startDate));
      start.setHours(0, 0, 0, 0);

      const end = new Date(String(endDate));
      end.setHours(23, 59, 59, 999);

      where.date = {
        gte: start,
        lte: end
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

export const getMissingLogs = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const missingLogs = await prisma.attendance.findMany({
      where: {
        timeOut: null,
        date: {
          lt: today
        }
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true
          }
        }
      }
    });

    res.json(missingLogs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch missing logs' });
  }
};

export const createAttendance = async (req: Request, res: Response) => {
  try {
    const { employeeId, date, timeIn, timeOut, status } = req.body;
    
    // Normalize date to local midnight to match clockIn behavior
    // Assuming date string is "YYYY-MM-DD"
    const [year, month, day] = date.split('-').map(Number);
    const recordDate = new Date(year, month - 1, day);
    
    // Calculate hours worked if timeOut is provided
    let hoursWorked = 0;
    if (timeIn && timeOut) {
        const start = new Date(timeIn);
        const end = new Date(timeOut);
        const diffMs = end.getTime() - start.getTime();
        hoursWorked = diffMs / (1000 * 60 * 60);
    }

    // Fetch employee schedule using raw query to bypass persistent Prisma Client type issues
    const result: any[] = await prisma.$queryRaw`SELECT "workSchedule" FROM "Employee" WHERE id = ${employeeId}`;
    const employee = result[0];

    // Auto-calculate status if timeIn is provided and status is 'PRESENT' (default)
    let finalStatus = status;
    if (timeIn && status === 'PRESENT') {
        console.log('Auto-calculating status for manual entry...');
        console.log('TimeIn:', timeIn);
        console.log('Schedule:', employee?.workSchedule);
        finalStatus = calculateStatus(employee?.workSchedule, new Date(timeIn));
        console.log('Calculated Status:', finalStatus);
    }

    const attendance = await prisma.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId,
          date: recordDate
        }
      },
      update: {
        timeIn: timeIn ? new Date(timeIn) : null,
        timeOut: timeOut ? new Date(timeOut) : null,
        status: finalStatus,
        hoursWorked
      },
      create: {
        employeeId,
        date: recordDate,
        timeIn: timeIn ? new Date(timeIn) : null,
        timeOut: timeOut ? new Date(timeOut) : null,
        status: finalStatus,
        hoursWorked
      }
    });
    
    res.json(attendance);
  } catch (error) {
    console.error('Create attendance error:', error);
    res.status(500).json({ error: 'Failed to create attendance record' });
  }
};
