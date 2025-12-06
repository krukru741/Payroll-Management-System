import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixAllIncompleteOvertime() {
  try {
    console.log('\n🔍 Finding incomplete overtime requests...\n');

    // Find all approved overtime requests with null endTime
    const incompleteOvertimes = await prisma.overtimeRequest.findMany({
      where: {
        status: 'APPROVED',
        endTime: null
      },
      include: {
        employee: true
      },
      orderBy: {
        date: 'desc'
      }
    });

    console.log(`Found ${incompleteOvertimes.length} incomplete overtime requests\n`);

    if (incompleteOvertimes.length === 0) {
      console.log('✅ No incomplete overtime requests found!');
      return;
    }

    let fixedCount = 0;
    let skippedCount = 0;

    for (const overtime of incompleteOvertimes) {
      console.log(`\n📋 Processing overtime for ${overtime.employee.lastName}, ${overtime.employee.firstName}`);
      console.log(`   Date: ${new Date(overtime.date).toLocaleDateString()}`);
      console.log(`   Start Time: ${new Date(overtime.startTime).toLocaleTimeString()}`);

      // Find attendance record for the same date
      const startOfDay = new Date(overtime.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(overtime.date);
      endOfDay.setHours(23, 59, 59, 999);

      const attendance = await prisma.attendance.findFirst({
        where: {
          employeeId: overtime.employeeId,
          date: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      });

      if (!attendance || !attendance.timeOut) {
        console.log('   ⚠️  SKIPPED: No attendance record with clock-out time found');
        skippedCount++;
        continue;
      }

      console.log(`   Attendance Clock-Out: ${new Date(attendance.timeOut).toLocaleTimeString()}`);

      // Calculate overtime hours
      const overtimeStart = new Date(overtime.startTime);
      const overtimeEnd = new Date(attendance.timeOut);
      
      const overtimeDiffMs = overtimeEnd.getTime() - overtimeStart.getTime();
      const overtimeHours = overtimeDiffMs / (1000 * 60 * 60);

      // Check if overtime hours are valid (positive)
      if (overtimeHours <= 0) {
        console.log(`   ⚠️  SKIPPED: Invalid overtime hours (${overtimeHours.toFixed(2)})`);
        console.log('   Clock-out time is before or equal to overtime start time');
        skippedCount++;
        continue;
      }

      // Calculate overtime pay
      const hourlyRate = overtime.employee.ratePerHour || 0;
      const overtimeRate = overtime.overtimeRate || 1.25;
      const overtimePay = overtimeHours * hourlyRate * overtimeRate;

      console.log(`   Calculated Hours: ${overtimeHours.toFixed(2)}`);
      console.log(`   Hourly Rate: ₱${hourlyRate}`);
      console.log(`   Overtime Rate: ${overtimeRate}x`);
      console.log(`   Overtime Pay: ₱${overtimePay.toFixed(2)}`);

      // Update overtime request
      await prisma.overtimeRequest.update({
        where: { id: overtime.id },
        data: {
          endTime: overtimeEnd,
          totalHours: overtimeHours,
          overtimePay: overtimePay
        }
      });

      console.log('   ✅ FIXED: Overtime request completed successfully!');
      fixedCount++;
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total incomplete overtime requests: ${incompleteOvertimes.length}`);
    console.log(`✅ Fixed: ${fixedCount}`);
    console.log(`⚠️  Skipped: ${skippedCount}`);
    console.log('='.repeat(60) + '\n');

    if (skippedCount > 0) {
      console.log('⚠️  Some overtime requests were skipped because:');
      console.log('   - No attendance record with clock-out time found');
      console.log('   - Clock-out time is before overtime start time (invalid)');
      console.log('\n   These may need manual review or cancellation.\n');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAllIncompleteOvertime();
