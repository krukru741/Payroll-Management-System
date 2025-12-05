import prisma from '../server/db';

async function checkEmployeeData() {
  try {
    // Find employee "lab, test"
    const employee = await prisma.employee.findFirst({
      where: {
        firstName: 'test',
        lastName: 'lab'
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        basicSalary: true
      }
    });

    if (!employee) {
      console.log('❌ Employee "lab, test" not found');
      return;
    }

    console.log('\n📋 Employee Information:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Name: ${employee.lastName}, ${employee.firstName}`);
    console.log(`ID: ${employee.id}`);
    console.log(`Basic Salary: ₱${employee.basicSalary.toLocaleString()}/month`);

    const periodStart = new Date('2025-12-01');
    const periodEnd = new Date('2025-12-15');

    // Get attendance records
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        employeeId: employee.id,
        date: {
          gte: periodStart,
          lte: periodEnd
        }
      },
      select: {
        date: true,
        timeIn: true,
        timeOut: true,
        hoursWorked: true,
        overtimeHours: true
      },
      orderBy: {
        date: 'asc'
      }
    });

    console.log('\n⏰ Attendance Records (Dec 1-15, 2025):');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Days Present: ${attendanceRecords.length}`);

    let totalLateMinutes = 0;

    if (attendanceRecords.length > 0) {
      attendanceRecords.forEach((record, index) => {
        const dateStr = record.date.toISOString().split('T')[0];
        const timeIn = record.timeIn ? new Date(record.timeIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
        
        // Calculate late minutes
        let lateMinutes = 0;
        if (record.timeIn) {
          const timeInDate = new Date(record.timeIn);
          const hours = timeInDate.getHours();
          const minutes = timeInDate.getMinutes();
          const workStart = 8 * 60; // 8:00 AM in minutes
          const actualStart = hours * 60 + minutes;
          const gracePeriod = 15; // 15 minutes grace period
          
          if (actualStart > workStart + gracePeriod) {
            lateMinutes = actualStart - workStart;
            totalLateMinutes += lateMinutes;
          }
        }

        console.log(`${index + 1}. ${dateStr} - ${timeIn}${lateMinutes > 0 ? ` ⚠️ LATE ${lateMinutes} min` : ' ✅'}`);
      });
    } else {
      console.log('No attendance records found');
    }

    // Calculate late deduction
    const hourlyRate = employee.basicSalary / 160;
    const lateDeduction = (hourlyRate / 60) * totalLateMinutes;

    console.log('\n⏱️ Late Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total Late Minutes: ${totalLateMinutes} min`);
    console.log(`Late Deduction: ₱${lateDeduction.toLocaleString(undefined, { minimumFractionDigits: 2 })}`);

    // Get cash advances
    const cashAdvances = await prisma.cashAdvanceRequest.findMany({
      where: {
        employeeId: employee.id,
        managerApproval: 'APPROVED',
        adminApproval: 'APPROVED',
        isDisbursed: true,
        disbursedAt: {
          gte: periodStart,
          lte: periodEnd
        }
      },
      select: {
        id: true,
        amount: true,
        reason: true,
        disbursedAt: true
      }
    });

    console.log('\n💵 Cash Advances (Dec 1-15, 2025):');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (cashAdvances.length > 0) {
      let totalCashAdvance = 0;
      cashAdvances.forEach((ca, index) => {
        const dateStr = ca.disbursedAt ? new Date(ca.disbursedAt).toISOString().split('T')[0] : 'N/A';
        console.log(`${index + 1}. ${dateStr} - ₱${ca.amount.toLocaleString()} (${ca.reason})`);
        totalCashAdvance += ca.amount;
      });
      console.log(`\nTotal Cash Advance: ₱${totalCashAdvance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`);
    } else {
      console.log('No cash advances found');
    }

    // Summary
    console.log('\n📊 Payslip Deductions Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Late Deduction: ₱${lateDeduction.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${lateDeduction > 0 ? '✅ Will show' : '❌ Hidden (zero)'}`);
    
    const totalCashAdvance = cashAdvances.reduce((sum, ca) => sum + ca.amount, 0);
    console.log(`Cash Advance: ₱${totalCashAdvance.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${totalCashAdvance > 0 ? '✅ Will show' : '❌ Hidden (zero)'}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEmployeeData();
