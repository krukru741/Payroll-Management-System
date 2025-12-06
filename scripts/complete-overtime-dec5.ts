import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function completeOvertimeDec5() {
  try {
    const overtimeId = 'cmism71m90001m1ukwo47v1ln';
    
    // Get the overtime request
    const overtime = await prisma.overtimeRequest.findUnique({
      where: { id: overtimeId },
      include: {
        employee: true
      }
    });

    if (!overtime) {
      console.log('Overtime request not found');
      return;
    }

    console.log('\n=== Current Overtime Request ===');
    console.log(`Employee: ${overtime.employee.lastName}, ${overtime.employee.firstName}`);
    console.log(`Date: ${overtime.date}`);
    console.log(`Start Time: ${overtime.startTime}`);
    console.log(`End Time: ${overtime.endTime}`);
    console.log(`Total Hours: ${overtime.totalHours}`);
    console.log(`Status: ${overtime.status}`);

    // Find attendance record for the same date to get clock-out time
    const attendance = await prisma.attendance.findFirst({
      where: {
        employeeId: overtime.employeeId,
        date: overtime.date
      }
    });

    if (!attendance || !attendance.timeOut) {
      console.log('\n❌ No attendance record with clock-out time found for this date');
      console.log('The employee may not have clocked out yet, or attendance is on a different date');
      return;
    }

    console.log('\n=== Attendance Record ===');
    console.log(`Time In: ${attendance.timeIn}`);
    console.log(`Time Out: ${attendance.timeOut}`);
    console.log(`Hours Worked: ${attendance.hoursWorked}`);

    // Calculate overtime hours
    const startTime = new Date(overtime.startTime);
    const endTime = new Date(attendance.timeOut);
    
    const diffMs = endTime.getTime() - startTime.getTime();
    const totalHours = diffMs / (1000 * 60 * 60);

    // Get employee hourly rate
    const employee = await prisma.employee.findUnique({
      where: { id: overtime.employeeId }
    });

    const hourlyRate = employee?.hourlyRate || 0;
    const overtimeRate = overtime.overtimeRate || 1.25;
    const overtimePay = totalHours * hourlyRate * overtimeRate;

    console.log('\n=== Calculated Values ===');
    console.log(`Total Hours: ${totalHours.toFixed(2)}`);
    console.log(`Hourly Rate: ₱${hourlyRate}`);
    console.log(`Overtime Rate: ${overtimeRate}x`);
    console.log(`Overtime Pay: ₱${overtimePay.toFixed(2)}`);

    // Update the overtime request
    const updated = await prisma.overtimeRequest.update({
      where: { id: overtimeId },
      data: {
        endTime: attendance.timeOut,
        totalHours: totalHours,
        overtimePay: overtimePay
      }
    });

    console.log('\n✅ Overtime request updated successfully!');
    console.log(`End Time: ${updated.endTime}`);
    console.log(`Total Hours: ${updated.totalHours}`);
    console.log(`Overtime Pay: ₱${updated.overtimePay}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

completeOvertimeDec5();
