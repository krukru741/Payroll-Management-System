import prisma from '../server/db';

async function checkAllOvertimeRequests() {
  try {
    // Get all overtime requests with missing hours or pay
    const incompleteOvertimes = await prisma.overtimeRequest.findMany({
      where: {
        OR: [
          { totalHours: null },
          { totalHours: 0 },
          { overtimePay: null },
          { overtimePay: 0 }
        ],
        status: 'APPROVED' // Only check approved ones
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
      },
      orderBy: {
        date: 'desc'
      }
    });

    console.log('\n📋 Overtime Requests with Missing Hours/Pay:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total Found: ${incompleteOvertimes.length}\n`);

    if (incompleteOvertimes.length === 0) {
      console.log('✅ All approved overtime requests have hours and pay calculated!');
      return;
    }

    for (const ot of incompleteOvertimes) {
      console.log(`\n${ot.employee.lastName}, ${ot.employee.firstName} (${ot.employee.id})`);
      console.log(`Date: ${ot.date.toISOString().split('T')[0]}`);
      console.log(`Start Time: ${new Date(ot.startTime).toLocaleString()}`);
      console.log(`End Time: ${ot.endTime ? new Date(ot.endTime).toLocaleString() : '❌ NULL'}`);
      console.log(`Hours: ${ot.totalHours || '❌ NULL'}`);
      console.log(`Pay: ${ot.overtimePay ? '₱' + ot.overtimePay.toFixed(2) : '❌ NULL'}`);
      console.log(`Status: ${ot.status}`);

      // Try to find matching attendance record
      const attendance = await prisma.attendance.findFirst({
        where: {
          employeeId: ot.employee.id,
          date: {
            gte: new Date(ot.date.setHours(0, 0, 0, 0)),
            lte: new Date(ot.date.setHours(23, 59, 59, 999))
          }
        }
      });

      if (attendance && attendance.timeOut) {
        const startTime = new Date(ot.startTime);
        const endTime = new Date(attendance.timeOut);
        const diffMs = endTime.getTime() - startTime.getTime();
        const hours = diffMs / (1000 * 60 * 60);
        
        if (hours > 0) {
          const hourlyRate = ot.employee.basicSalary / 160;
          const pay = hourlyRate * hours * (ot.overtimeRate || 1.25);
          console.log(`  → Can be fixed: ${hours.toFixed(2)} hrs, ₱${pay.toFixed(2)}`);
        } else {
          console.log(`  → ⚠️ Clock-out (${endTime.toLocaleTimeString()}) is before OT start`);
        }
      } else {
        console.log(`  → ⚠️ No attendance record or time-out found`);
      }
    }

    console.log('\n\n💡 Recommendation:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Run a script to automatically fix all incomplete overtime requests');
    console.log('by matching them with attendance clock-out times.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllOvertimeRequests();
