import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function recalculateOvertimePay() {
  try {
    console.log('\n🔄 Recalculating overtime pay for all overtime requests...\n');

    // Find all overtime requests with hours but zero or null pay
    const overtimes = await prisma.overtimeRequest.findMany({
      where: {
        totalHours: { not: null },
        OR: [
          { overtimePay: null },
          { overtimePay: 0 }
        ]
      },
      include: {
        employee: true
      },
      orderBy: {
        date: 'desc'
      }
    });

    console.log(`Found ${overtimes.length} overtime requests with zero/null pay\n`);

    if (overtimes.length === 0) {
      console.log('✅ No overtime requests need recalculation!');
      return;
    }

    let updatedCount = 0;

    for (const overtime of overtimes) {
      console.log(`\n📋 ${overtime.employee.lastName}, ${overtime.employee.firstName}`);
      console.log(`   Date: ${new Date(overtime.date).toLocaleDateString()}`);
      console.log(`   Hours: ${overtime.totalHours}`);
      console.log(`   Current Pay: ₱${overtime.overtimePay || 0}`);

      const hourlyRate = overtime.employee.ratePerHour || 0;
      const overtimeRate = overtime.overtimeRate || 1.25;
      const newOvertimePay = (overtime.totalHours || 0) * hourlyRate * overtimeRate;

      console.log(`   Hourly Rate: ₱${hourlyRate}`);
      console.log(`   Overtime Rate: ${overtimeRate}x`);
      console.log(`   New Pay: ₱${newOvertimePay.toFixed(2)}`);

      if (hourlyRate === 0) {
        console.log('   ⚠️  SKIPPED: Employee has no hourly rate set');
        continue;
      }

      // Update overtime pay
      await prisma.overtimeRequest.update({
        where: { id: overtime.id },
        data: {
          overtimePay: newOvertimePay
        }
      });

      console.log('   ✅ UPDATED: Overtime pay recalculated!');
      updatedCount++;
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total overtime requests found: ${overtimes.length}`);
    console.log(`✅ Updated: ${updatedCount}`);
    console.log(`⚠️  Skipped: ${overtimes.length - updatedCount}`);
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

recalculateOvertimePay();
