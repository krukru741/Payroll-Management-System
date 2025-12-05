import prisma from '../server/db';

async function checkOvertimeRequest() {
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
      console.log('❌ No overtime request found for lab, pds on Dec 4, 2025');
      return;
    }

    console.log('\n📋 Overtime Request Details:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Employee: ${overtimeRequest.employee.lastName}, ${overtimeRequest.employee.firstName}`);
    console.log(`Employee ID: ${overtimeRequest.employee.id}`);
    console.log(`Basic Salary: ₱${overtimeRequest.employee.basicSalary.toLocaleString()}/month`);
    console.log(`\nRequest ID: ${overtimeRequest.id}`);
    console.log(`Date: ${overtimeRequest.date.toISOString().split('T')[0]}`);
    console.log(`Start Time: ${new Date(overtimeRequest.startTime).toLocaleString()}`);
    console.log(`End Time: ${new Date(overtimeRequest.endTime).toLocaleString()}`);
    console.log(`Total Hours: ${overtimeRequest.totalHours || 'NULL/EMPTY'}`);
    console.log(`Overtime Rate: ${overtimeRequest.overtimeRate || 'NULL/EMPTY'}x`);
    console.log(`Overtime Pay: ₱${overtimeRequest.overtimePay || 'NULL/EMPTY'}`);
    console.log(`Status: ${overtimeRequest.status}`);
    console.log(`Reason: ${overtimeRequest.reason}`);

    // Calculate what the hours SHOULD be
    const startTime = new Date(overtimeRequest.startTime);
    const endTime = new Date(overtimeRequest.endTime);
    const diffMs = endTime.getTime() - startTime.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    console.log('\n🔧 Calculated Values:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Time Difference: ${diffHours.toFixed(2)} hours`);
    
    if (diffHours > 0) {
      const hourlyRate = overtimeRequest.employee.basicSalary / 160;
      const otRate = overtimeRequest.overtimeRate || 1.25;
      const calculatedPay = hourlyRate * diffHours * otRate;
      
      console.log(`Hourly Rate: ₱${hourlyRate.toFixed(2)}/hr`);
      console.log(`OT Rate: ${otRate}x`);
      console.log(`Calculated OT Pay: ₱${calculatedPay.toFixed(2)}`);
    } else {
      console.log('⚠️ Negative time difference - end time is before start time!');
      console.log('This happens when overtime crosses midnight.');
    }

    // Check if this is a cross-midnight scenario
    if (startTime.getDate() !== endTime.getDate()) {
      console.log('\n⚠️ CROSS-MIDNIGHT OVERTIME DETECTED');
      console.log('Start: ' + startTime.toLocaleString());
      console.log('End: ' + endTime.toLocaleString());
      console.log('This overtime request spans across midnight.');
    }

    console.log('\n💡 Recommendation:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    if (!overtimeRequest.totalHours || overtimeRequest.totalHours === 0) {
      console.log('❌ totalHours is missing or zero');
      console.log('✅ Need to update the overtime request with calculated hours');
    }
    if (!overtimeRequest.overtimePay || overtimeRequest.overtimePay === 0) {
      console.log('❌ overtimePay is missing or zero');
      console.log('✅ Need to calculate and update overtime pay');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOvertimeRequest();
