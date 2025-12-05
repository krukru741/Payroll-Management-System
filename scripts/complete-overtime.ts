import prisma from '../server/db';

async function manuallyCompleteOvertime() {
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

    console.log('\n📋 Overtime Request:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Employee: ${overtimeRequest.employee.lastName}, ${overtimeRequest.employee.firstName}`);
    console.log(`Date: ${overtimeRequest.date.toISOString().split('T')[0]}`);
    console.log(`Start Time: ${new Date(overtimeRequest.startTime).toLocaleString()}`);
    console.log(`Status: ${overtimeRequest.status}`);

    // Set end time to 7:30 AM next day (as shown in UI)
    const startTime = new Date(overtimeRequest.startTime);
    const endTime = new Date(startTime);
    endTime.setDate(endTime.getDate() + 1); // Next day
    endTime.setHours(7, 30, 0, 0); // 7:30 AM

    // Calculate hours
    let diffMs = endTime.getTime() - startTime.getTime();
    const totalHours = diffMs / (1000 * 60 * 60);
    
    // Calculate pay
    const hourlyRate = overtimeRequest.employee.basicSalary / 160;
    const overtimeRate = overtimeRequest.overtimeRate || 1.25;
    const overtimePay = hourlyRate * totalHours * overtimeRate;

    console.log('\n🔧 Calculated Values:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`End Time: ${endTime.toLocaleString()}`);
    console.log(`Total Hours: ${totalHours.toFixed(2)} hours`);
    console.log(`Hourly Rate: ₱${hourlyRate.toFixed(2)}/hr`);
    console.log(`OT Rate: ${overtimeRate}x`);
    console.log(`Overtime Pay: ₱${overtimePay.toFixed(2)}`);

    // Update the overtime request
    const updated = await prisma.overtimeRequest.update({
      where: { id: overtimeRequest.id },
      data: {
        endTime: endTime,
        totalHours: totalHours,
        overtimePay: overtimePay
      }
    });

    console.log('\n✅ Overtime Request Completed:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`End Time: ${updated.endTime ? new Date(updated.endTime).toLocaleString() : 'NULL'}`);
    console.log(`Total Hours: ${updated.totalHours}`);
    console.log(`Overtime Pay: ₱${updated.overtimePay?.toFixed(2)}`);
    console.log('\n✅ Successfully completed overtime request!');
    console.log('The hours and pay should now appear in the Filing page.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

manuallyCompleteOvertime();
