import prisma from '../server/db';

async function checkCashAdvanceForPDS() {
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
        lastName: true
      }
    });

    if (!employee) {
      console.log('❌ Employee "lab, pds" not found');
      return;
    }

    console.log('\n📋 Employee: ' + employee.lastName + ', ' + employee.firstName);
    console.log('ID: ' + employee.id);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Get ALL cash advance requests for this employee
    const allRequests = await prisma.cashAdvanceRequest.findMany({
      where: {
        employeeId: employee.id
      },
      select: {
        id: true,
        amount: true,
        reason: true,
        status: true,
        managerApproval: true,
        adminApproval: true,
        isDisbursed: true,
        disbursedAt: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('💵 Cash Advance Requests:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (allRequests.length === 0) {
      console.log('❌ NO cash advance requests found for this employee\n');
      console.log('✅ This is why cash advance is NOT showing in the payslip.');
      console.log('   The employee has no cash advances to deduct.\n');
      return;
    }

    console.log(`Total Requests: ${allRequests.length}\n`);

    allRequests.forEach((req, index) => {
      const createdDate = req.createdAt.toISOString().split('T')[0];
      const disbursedDate = req.disbursedAt ? req.disbursedAt.toISOString().split('T')[0] : 'Not disbursed';
      
      console.log(`${index + 1}. Request ID: ${req.id}`);
      console.log(`   Amount: ₱${req.amount.toLocaleString()}`);
      console.log(`   Reason: ${req.reason}`);
      console.log(`   Created: ${createdDate}`);
      console.log(`   Manager Approval: ${req.managerApproval}`);
      console.log(`   Admin Approval: ${req.adminApproval}`);
      console.log(`   Disbursed: ${req.isDisbursed ? 'Yes' : 'No'}`);
      console.log(`   Disbursed Date: ${disbursedDate}\n`);
    });

    // Check for Dec 1-15, 2025 period
    const periodStart = new Date('2025-12-01');
    const periodEnd = new Date('2025-12-15');
    
    const validForPeriod = allRequests.filter(req => 
      req.managerApproval === 'APPROVED' &&
      req.adminApproval === 'APPROVED' &&
      req.isDisbursed &&
      req.disbursedAt &&
      req.disbursedAt >= periodStart &&
      req.disbursedAt <= periodEnd
    );

    console.log('📊 Summary for Payroll Period (Dec 1-15, 2025):');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (validForPeriod.length > 0) {
      const totalAmount = validForPeriod.reduce((sum, req) => sum + req.amount, 0);
      console.log(`Requests in period: ${validForPeriod.length}`);
      console.log(`Total Cash Advance: ₱${totalAmount.toLocaleString()}`);
      console.log('✅ Should show in payslip');
    } else {
      console.log('Requests in period: 0');
      console.log('Total Cash Advance: ₱0.00');
      console.log('❌ No approved & disbursed cash advances in this period');
      console.log('\n✅ This is CORRECT - cash advance should NOT show in payslip');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCashAdvanceForPDS();
