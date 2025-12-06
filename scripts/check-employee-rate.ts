import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkEmployeeRate() {
  try {
    // Find employee "lab, pds"
    const employee = await prisma.employee.findFirst({
      where: {
        firstName: 'pds',
        lastName: 'lab'
      }
    });

    if (!employee) {
      console.log('Employee not found');
      return;
    }

    console.log('\n=== Employee Salary Information ===');
    console.log(`Name: ${employee.lastName}, ${employee.firstName}`);
    console.log(`ID: ${employee.id}`);
    console.log(`Basic Salary: ₱${employee.basicSalary}`);
    console.log(`Bi-Monthly Salary: ₱${employee.biMonthlySalary || 'Not set'}`);
    console.log(`Rate Per Hour: ₱${employee.ratePerHour || 'Not set'}`);
    console.log(`Rate Per Day: ₱${employee.ratePerDay || 'Not set'}`);

    // Calculate hourly rate from basic salary if not set
    // Assuming: Monthly salary / 22 working days / 8 hours per day
    if (!employee.ratePerHour && employee.basicSalary) {
      const calculatedHourlyRate = employee.basicSalary / 22 / 8;
      console.log(`\n💡 Calculated Hourly Rate: ₱${calculatedHourlyRate.toFixed(2)}`);
      console.log('   (Based on: Monthly Salary ÷ 22 days ÷ 8 hours)');
      
      // Ask if we should update
      console.log('\n📝 To set this hourly rate, run:');
      console.log(`   UPDATE Employee SET ratePerHour = ${calculatedHourlyRate.toFixed(2)} WHERE id = '${employee.id}'`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEmployeeRate();
