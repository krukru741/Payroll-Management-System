import { Request, Response } from 'express';
import prisma from '../db';

// Helper to build where clause
const buildWhereClause = (startDate: any, endDate: any, department: any) => {
  const whereClause: any = {};
  
  if (startDate && endDate) {
    const end = new Date(endDate as string);
    end.setHours(23, 59, 59, 999);

    whereClause.createdAt = {
      gte: new Date(startDate as string),
      lte: end
    };
  }

  if (department && department !== 'ALL') {
    whereClause.employee = {
      department: department as string
    };
  }

  return whereClause;
};

// Get summary analytics
export const getSummaryAnalytics = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, department } = req.query;
    const whereClause = buildWhereClause(startDate, endDate, department);

    // Get counts for each request type
    const [
      totalLeave,
      pendingLeave,
      approvedLeave,
      rejectedLeave,
      totalOvertime,
      pendingOvertime,
      approvedOvertime,
      rejectedOvertime,
      totalCashAdvance,
      pendingCashAdvance,
      approvedCashAdvance,
      rejectedCashAdvance
    ] = await Promise.all([
      prisma.leaveRequest.count({ where: whereClause }),
      prisma.leaveRequest.count({ where: { ...whereClause, status: 'PENDING' } }),
      prisma.leaveRequest.count({ where: { ...whereClause, status: 'APPROVED' } }),
      prisma.leaveRequest.count({ where: { ...whereClause, status: 'REJECTED' } }),
      prisma.overtimeRequest.count({ where: whereClause }),
      prisma.overtimeRequest.count({ where: { ...whereClause, status: 'PENDING' } }),
      prisma.overtimeRequest.count({ where: { ...whereClause, status: 'APPROVED' } }),
      prisma.overtimeRequest.count({ where: { ...whereClause, status: 'REJECTED' } }),
      prisma.cashAdvanceRequest.count({ where: whereClause }),
      prisma.cashAdvanceRequest.count({ where: { ...whereClause, status: 'PENDING' } }),
      prisma.cashAdvanceRequest.count({ where: { ...whereClause, status: 'APPROVED' } }),
      prisma.cashAdvanceRequest.count({ where: { ...whereClause, status: 'REJECTED' } })
    ]);

    res.json({
      leave: {
        total: totalLeave,
        pending: pendingLeave,
        approved: approvedLeave,
        rejected: rejectedLeave
      },
      overtime: {
        total: totalOvertime,
        pending: pendingOvertime,
        approved: approvedOvertime,
        rejected: rejectedOvertime
      },
      cashAdvance: {
        total: totalCashAdvance,
        pending: pendingCashAdvance,
        approved: approvedCashAdvance,
        rejected: rejectedCashAdvance
      }
    });
  } catch (error) {
    console.error('Get summary analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch summary analytics' });
  }
};

// Get leave analytics
export const getLeaveAnalytics = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, department } = req.query;
    const whereClause = buildWhereClause(startDate, endDate, department);

    // Get leave requests with employee data
    const leaves = await prisma.leaveRequest.findMany({
      where: whereClause,
      include: {
        employee: {
          select: {
            department: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Group by leave type
    const byType: Record<string, number> = {};
    leaves.forEach(leave => {
      byType[leave.leaveType] = (byType[leave.leaveType] || 0) + 1;
    });

    // Group by month
    const byMonth: Record<string, number> = {};
    leaves.forEach(leave => {
      const month = new Date(leave.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      byMonth[month] = (byMonth[month] || 0) + 1;
    });

    // Group by department
    const byDepartment: Record<string, number> = {};
    leaves.forEach(leave => {
      const dept = leave.employee.department;
      byDepartment[dept] = (byDepartment[dept] || 0) + 1;
    });

    // Group by status
    const byStatus: Record<string, number> = {};
    leaves.forEach(leave => {
      byStatus[leave.status] = (byStatus[leave.status] || 0) + 1;
    });

    res.json({
      byType,
      byMonth,
      byDepartment,
      byStatus,
      total: leaves.length
    });
  } catch (error) {
    console.error('Get leave analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch leave analytics' });
  }
};

// Get overtime analytics
export const getOvertimeAnalytics = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, department } = req.query;
    const whereClause = buildWhereClause(startDate, endDate, department);

    const overtimes = await prisma.overtimeRequest.findMany({
      where: whereClause,
      include: {
        employee: {
          select: {
            department: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Group by month with total hours
    const byMonth: Record<string, { count: number; hours: number }> = {};
    overtimes.forEach(ot => {
      const month = new Date(ot.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (!byMonth[month]) {
        byMonth[month] = { count: 0, hours: 0 };
      }
      byMonth[month].count += 1;
      byMonth[month].hours += ot.totalHours || 0;
    });

    // Group by department
    const byDepartment: Record<string, { count: number; hours: number }> = {};
    overtimes.forEach(ot => {
      const dept = ot.employee.department;
      if (!byDepartment[dept]) {
        byDepartment[dept] = { count: 0, hours: 0 };
      }
      byDepartment[dept].count += 1;
      byDepartment[dept].hours += ot.totalHours || 0;
    });

    const totalHours = overtimes.reduce((sum, ot) => sum + (ot.totalHours || 0), 0);

    res.json({
      byMonth,
      byDepartment,
      total: overtimes.length,
      totalHours
    });
  } catch (error) {
    console.error('Get overtime analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch overtime analytics' });
  }
};

// Get cash advance analytics
export const getCashAdvanceAnalytics = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, department } = req.query;
    const whereClause = buildWhereClause(startDate, endDate, department);

    const cashAdvances = await prisma.cashAdvanceRequest.findMany({
      where: whereClause,
      include: {
        employee: {
          select: {
            department: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Group by month
    const byMonth: Record<string, { count: number; amount: number }> = {};
    cashAdvances.forEach(ca => {
      const month = new Date(ca.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (!byMonth[month]) {
        byMonth[month] = { count: 0, amount: 0 };
      }
      byMonth[month].count += 1;
      byMonth[month].amount += ca.amount;
    });

    // Group by department
    const byDepartment: Record<string, { count: number; amount: number }> = {};
    cashAdvances.forEach(ca => {
      const dept = ca.employee.department;
      if (!byDepartment[dept]) {
        byDepartment[dept] = { count: 0, amount: 0 };
      }
      byDepartment[dept].count += 1;
      byDepartment[dept].amount += ca.amount;
    });

    const totalAmount = cashAdvances.reduce((sum, ca) => sum + ca.amount, 0);

    res.json({
      byMonth,
      byDepartment,
      total: cashAdvances.length,
      totalAmount
    });
  } catch (error) {
    console.error('Get cash advance analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch cash advance analytics' });
  }
};

// Get admin dashboard stats
export const getAdminDashboardStats = async (req: Request, res: Response) => {
  try {
    // 1. Pending Requests (Total)
    const [pendingLeaves, pendingOvertime, pendingCashAdvance] = await Promise.all([
      prisma.leaveRequest.count({ where: { status: 'PENDING' } }),
      prisma.overtimeRequest.count({ where: { status: 'PENDING' } }),
      prisma.cashAdvanceRequest.count({ where: { status: 'PENDING' } })
    ]);
    const pendingRequests = pendingLeaves + pendingOvertime + pendingCashAdvance;

    // 2. Payroll History (Last 6 months)
    // Group by month. Since Prisma doesn't support easy groupBy date, we fetch and process.
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1); // Start of that month

    const payrolls = await prisma.payroll.findMany({
      where: {
        periodEnd: {
          gte: sixMonthsAgo
        }
      },
      select: {
        periodEnd: true,
        netPay: true
      },
      orderBy: {
        periodEnd: 'asc'
      }
    });

    const historyMap: Record<string, number> = {};
    // Initialize last 6 months with 0
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toLocaleDateString('en-US', { month: 'short' });
      historyMap[key] = 0;
    }

    payrolls.forEach(p => {
      const month = new Date(p.periodEnd).toLocaleDateString('en-US', { month: 'short' });
      historyMap[month] = (historyMap[month] || 0) + p.netPay;
    });

    // Convert to array and reverse to show chronological order (Jan, Feb, ...)
    // Actually, the map keys might be unordered.
    // Let's build the array explicitly.
    const historyData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const name = d.toLocaleDateString('en-US', { month: 'short' });
      historyData.push({
        name,
        amount: historyMap[name] || 0
      });
    }

    // 3. Attendance Rate (Today)
    const totalEmployees = await prisma.employee.count({ where: { status: 'ACTIVE' } });
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const presentCount = await prisma.attendance.count({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: { in: ['PRESENT', 'LATE', 'HALF_DAY'] }
      }
    });

    const attendanceRate = totalEmployees > 0 ? Math.round((presentCount / totalEmployees) * 100) : 0;

    res.json({
      pendingRequests,
      payrollHistory: historyData,
      attendanceRate
    });

  } catch (error) {
    console.error('Get admin dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch admin dashboard stats' });
  }
};
