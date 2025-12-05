import prisma from '../server/db';

async function fixOvertimeWithCorrectTime() {
  try {
    // Find the overtime request for lab, pds on Dec 4, 2025
    const overtimeRequest = await prisma.overtimeRequest.findFirst({
      where: {
        employee: {
          firstName: 'pds',
          lastName: 'lab'
        },
        date: {
          gte: new Date('2025-12-04T00:00:00'),
          lte: new Date('2025-12-04T23:59:59')
        }
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            basicSalary: true
          }
        }
      }
    });

    if (!overtimeRequest) {
      console.log('❌ No overtime request found');
      return;
    }

    // Find the actual clock-out time from attendance
    const attendance = await prisma.attendance.findFirst({
      where: {
        employeeId: overtimeRequest.employee.id,
        date: {
          gte: new Date('2025-12-04T00:00:00'),
          lte: new Date('2025-12-04T23:59:59')
        }
      }
    });

    if (!attendance || !attendance.timeOut) {
      console.log('❌ No attendance record or time-out found for Dec 4, 2025');
      return;
    }

    console.log('\n📋 Current Overtime Request:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Employee: ${overtimeRequest.employee.lastName}, ${overtimeRequest.employee.firstName}`);
    console.log(`Start Time: ${new Date(overtimeRequest.startTime).toLocaleString()}`);
    console.log(`End Time (WRONG): ${overtimeRequest.endTime ? new Date(overtimeRequest.endTime).toLocaleString() : 'NULL'}`);
    console.log(`Total Hours (WRONG): ${overtimeRequest.totalHours}`);

    console.log('\n📋 Actual Attendance:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Time In: ${new Date(attendance.timeIn).toLocaleString()}`);
    console.log(`Time Out: ${new Date(attendance.timeOut).toLocaleString()}`);

    // Use actual clock-out time as end time
    const startTime = new Date(overtimeRequest.startTime);
    const endTime = new Date(attendance.timeOut);

    // Calculate hours
    const diffMs = endTime.getTime() - startTime.getTime();
    const totalHours = diffMs / (1000 * 60 * 60);
    
    // Calculate pay
    const hourlyRate = overtimeRequest.employee.basicSalary / 160;
    const overtimeRate = overtimeRequest.overtimeRate || 1.25;
    const overtimePay = hourlyRate * totalHours * overtimeRate;

    console.log('\n🔧 Correct Calculation:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`OT Start: ${startTime.toLocaleString()}`);
    console.log(`Clock Out: ${endTime.toLocaleString()}`);
    console.log(`Total Hours: ${totalHours.toFixed(2)} hours (${(totalHours * 60).toFixed(0)} minutes)`);
    console.log(`Hourly Rate: ₱${hourlyRate.toFixed(2)}/hr`);
    console.log(`OT Rate: ${overtimeRate}x`);
    console.log(`Overtime Pay: ₱${overtimePay.toFixed(2)}`);

    if (totalHours <= 0) {
      console.log('\n⚠️ WARNING: Overtime hours is zero or negative!');
      console.log('The employee clocked out BEFORE the overtime start time.');
      console.log('This overtime request should probably be cancelled or rejected.');
      return;
    }

    // Update the overtime request
    const updated = await prisma.overtimeRequest.update({
      where: { id: overtimeRequest.id },
      data: {
        endTime: endTime,
        totalHours: totalHours,
        overtimePay: overtimePay
      }
    });

    console.log('\n✅ Overtime Request Fixed:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`End Time: ${new Date(updated.endTime).toLocaleString()}`);
    console.log(`Total Hours: ${updated.totalHours?.toFixed(2)}`);
    console.log(`Overtime Pay: ₱${updated.overtimePay?.toFixed(2)}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixOvertimeWithCorrectTime();
