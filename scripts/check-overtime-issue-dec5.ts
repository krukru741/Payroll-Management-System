import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkOvertimeIssue() {
  try {
    // Find overtime requests for Dec 5, 2025 for employee "lab, pds"
    const overtimeRequests = await prisma.overtimeRequest.findMany({
      where: {
        date: {
          gte: new Date('2025-12-05T00:00:00.000Z'),
          lt: new Date('2025-12-06T00:00:00.000Z')
        }
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('\n=== Overtime Requests for Dec 5, 2025 ===\n');
    
    for (const ot of overtimeRequests) {
      console.log(`Employee: ${ot.employee.lastName}, ${ot.employee.firstName}`);
      console.log(`ID: ${ot.id}`);
      console.log(`Date: ${ot.date}`);
      console.log(`Start Time: ${ot.startTime}`);
      console.log(`End Time: ${ot.endTime}`);
      console.log(`Total Hours: ${ot.totalHours}`);
      console.log(`Overtime Pay: ${ot.overtimePay}`);
      console.log(`Status: ${ot.status}`);
      console.log(`Created At: ${ot.createdAt}`);
      console.log('---');
    }

    // Find attendance records for the same date
    const attendance = await prisma.attendance.findMany({
      where: {
        date: {
          gte: new Date('2025-12-05T00:00:00.000Z'),
          lt: new Date('2025-12-06T00:00:00.000Z')
        }
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

    console.log('\n=== Attendance Records for Dec 5, 2025 ===\n');
    
    for (const att of attendance) {
      console.log(`Employee: ${att.employee.lastName}, ${att.employee.firstName}`);
      console.log(`Date: ${att.date}`);
      console.log(`Time In: ${att.timeIn}`);
      console.log(`Time Out: ${att.timeOut}`);
      console.log(`Hours Worked: ${att.hoursWorked}`);
      console.log(`Status: ${att.status}`);
      console.log('---');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOvertimeIssue();
