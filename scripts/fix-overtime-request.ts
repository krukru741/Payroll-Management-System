import prisma from '../server/db';

async function fixOvertimeRequest() {
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

    console.log('\n📋 Before Fix:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Employee: ${overtimeRequest.employee.lastName}, ${overtimeRequest.employee.firstName}`);
    console.log(`Start Time: ${new Date(overtimeRequest.startTime).toLocaleString()}`);
    console.log(`End Time: ${overtimeRequest.endTime ? new Date(overtimeRequest.endTime).toLocaleString() : 'NULL'}`);
    console.log(`Total Hours: ${overtimeRequest.totalHours || 'NULL'}`);
    console.log(`Overtime Pay: ₱${overtimeRequest.overtimePay || 'NULL'}`);

    if (!overtimeRequest.endTime) {
      console.log('\n❌ No endTime found - cannot calculate hours');
      return;
    }

    // Calculate hours
    const startTime = new Date(overtimeRequest.startTime);
    const endTime = new Date(overtimeRequest.endTime);
    
    let diffMs = endTime.getTime() - startTime.getTime();
    
    // Handle cross-midnight scenario
    if (diffMs < 0) {
      diffMs += 24 * 60 * 60 * 1000;
    }
    
    const totalHours = diffMs / (1000 * 60 * 60);
    
    // Calculate pay
    const hourlyRate = overtimeRequest.employee.basicSalary / 160;
    const overtimeRate = overtimeRequest.overtimeRate || 1.25;
    const overtimePay = hourlyRate * totalHours * overtimeRate;

    console.log('\n🔧 Calculated Values:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total Hours: ${totalHours.toFixed(2)} hours`);
    console.log(`Hourly Rate: ₱${hourlyRate.toFixed(2)}/hr`);
    console.log(`OT Rate: ${overtimeRate}x`);
    console.log(`Overtime Pay: ₱${overtimePay.toFixed(2)}`);

    // Update the overtime request
    const updated = await prisma.overtimeRequest.update({
      where: { id: overtimeRequest.id },
      data: {
        totalHours: totalHours,
        overtimePay: overtimePay
      }
    });

    console.log('\n✅ After Fix:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total Hours: ${updated.totalHours}`);
    console.log(`Overtime Pay: ₱${updated.overtimePay}`);
    console.log('\n✅ Overtime request updated successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixOvertimeRequest();
