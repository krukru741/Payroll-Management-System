import prisma from '../server/db';

async function checkOvertimeData() {
  try {
    // Find employee "lab, pds"
    const employee = await prisma.employee.findFirst({
      where: {
        firstName: 'pds',
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
      console.log('❌ Employee "lab, pds" not found');
      return;
    }

    console.log('\n📋 Employee Information:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Name: ${employee.lastName}, ${employee.firstName}`);
    console.log(`ID: ${employee.id}`);
    console.log(`Basic Salary: ₱${employee.basicSalary.toLocaleString()}/month`);
    console.log(`Semi-monthly: ₱${(employee.basicSalary / 2).toLocaleString()}`);

    // Get attendance records for Dec 1-15, 2025
    const periodStart = new Date('2025-12-01');
    const periodEnd = new Date('2025-12-15');

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

    if (attendanceRecords.length === 0) {
      console.log('❌ No attendance records found for this period');
      return;
    }

    let totalOvertimeHours = 0;
    let totalHoursWorked = 0;
    let totalLateMinutes = 0;

    attendanceRecords.forEach((record, index) => {
      const dateStr = record.date.toISOString().split('T')[0];
      const timeIn = record.timeIn ? new Date(record.timeIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
      const timeOut = record.timeOut ? new Date(record.timeOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
      
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

      console.log(`\n${index + 1}. ${dateStr}`);
      console.log(`   Time In:  ${timeIn}${lateMinutes > 0 ? ` ⚠️ LATE by ${lateMinutes} min` : ' ✅'}`);
      console.log(`   Time Out: ${timeOut}`);
      console.log(`   Hours Worked: ${record.hoursWorked} hrs`);
      console.log(`   Overtime: ${record.overtimeHours} hrs`);

      totalOvertimeHours += record.overtimeHours;
      totalHoursWorked += record.hoursWorked;
    });

    console.log('\n📊 Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Days Present: ${attendanceRecords.length}`);
    console.log(`Total Hours Worked: ${totalHoursWorked.toFixed(2)} hrs`);
    console.log(`Total Overtime Hours: ${totalOvertimeHours} hrs`);
    console.log(`Total Late Minutes: ${totalLateMinutes} min (${(totalLateMinutes / 60).toFixed(2)} hrs)`);

    // Calculate overtime pay
    const hourlyRate = employee.basicSalary / 160;
    const otMultiplier = 1.25;
    const overtimePay = hourlyRate * totalOvertimeHours * otMultiplier;

    console.log('\n💰 Overtime Pay Calculation:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Hourly Rate: ₱${employee.basicSalary} / 160 hrs = ₱${hourlyRate.toFixed(2)}/hr`);
    console.log(`OT Multiplier: ${otMultiplier}x (125%)`);
    console.log(`OT Hourly Rate: ₱${hourlyRate.toFixed(2)} × ${otMultiplier} = ₱${(hourlyRate * otMultiplier).toFixed(2)}/hr`);
    console.log(`Total OT Hours: ${totalOvertimeHours} hrs`);
    console.log(`\n✅ Overtime Pay: ₱${overtimePay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

    // Calculate late deduction
    const lateDeductionPerMinute = hourlyRate / 60; // Hourly rate / 60 minutes
    const lateDeduction = lateDeductionPerMinute * totalLateMinutes;

    console.log('\n⏱️ Late Deduction Calculation:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Hourly Rate: ₱${hourlyRate.toFixed(2)}/hr`);
    console.log(`Per Minute Rate: ₱${hourlyRate.toFixed(2)} / 60 = ₱${lateDeductionPerMinute.toFixed(4)}/min`);
    console.log(`Total Late Minutes: ${totalLateMinutes} min`);
    console.log(`\n✅ Late Deduction: ₱${lateDeduction.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

    // Count working days in period
    const countWorkingDays = (start: Date, end: Date): number => {
      let count = 0;
      const current = new Date(start);
      
      while (current <= end) {
        const dayOfWeek = current.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          count++;
        }
        current.setDate(current.getDate() + 1);
      }
      return count;
    };

    const expectedWorkingDays = countWorkingDays(periodStart, periodEnd);
    const daysAbsent = expectedWorkingDays - attendanceRecords.length;

    console.log('\n📅 Attendance Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Expected Working Days: ${expectedWorkingDays}`);
    console.log(`Days Present: ${attendanceRecords.length}`);
    console.log(`Days Absent: ${daysAbsent}`);
    console.log(`Attendance Rate: ${((attendanceRecords.length / expectedWorkingDays) * 100).toFixed(1)}%`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOvertimeData();
