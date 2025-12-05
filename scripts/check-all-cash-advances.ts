import prisma from '../server/db';

async function checkAllCashAdvances() {
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
        lastName: true
      }
    });

    if (!employee) {
      console.log('❌ Employee "lab, test" not found');
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

    console.log('💵 ALL Cash Advance Requests:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (allRequests.length === 0) {
      console.log('❌ No cash advance requests found for this employee\n');
      console.log('💡 Suggestion: Create a cash advance request for testing:');
      console.log('   1. Go to Cash Advance page');
      console.log('   2. Submit a request');
      console.log('   3. Approve as Manager');
      console.log('   4. Approve as Admin');
      console.log('   5. Mark as Disbursed\n');
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
      console.log(`   Status: ${req.status}`);
      console.log(`   Manager Approval: ${req.managerApproval}`);
      console.log(`   Admin Approval: ${req.adminApproval}`);
      console.log(`   Disbursed: ${req.isDisbursed ? 'Yes' : 'No'}`);
      console.log(`   Disbursed Date: ${disbursedDate}`);
      
      // Check if it would show in payroll for Dec 1-15, 2025
      const periodStart = new Date('2025-12-01');
      const periodEnd = new Date('2025-12-15');
      const isInPeriod = req.disbursedAt && 
                         req.disbursedAt >= periodStart && 
                         req.disbursedAt <= periodEnd;
      
      const isFullyApproved = req.managerApproval === 'APPROVED' && 
                              req.adminApproval === 'APPROVED' && 
                              req.isDisbursed;
      
      if (isInPeriod && isFullyApproved) {
        console.log('   ✅ WILL SHOW in Dec 1-15, 2025 payroll');
      } else if (isFullyApproved && !isInPeriod) {
        console.log('   ⚠️ Approved & Disbursed, but OUTSIDE Dec 1-15, 2025 period');
      } else if (!isFullyApproved) {
        console.log('   ❌ NOT APPROVED or NOT DISBURSED');
        if (req.managerApproval !== 'APPROVED') console.log('      - Manager approval needed');
        if (req.adminApproval !== 'APPROVED') console.log('      - Admin approval needed');
        if (!req.isDisbursed) console.log('      - Not yet disbursed');
      }
      console.log('');
    });

    // Summary for Dec 1-15, 2025 period
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
    console.log(`Requests in period: ${validForPeriod.length}`);
    
    if (validForPeriod.length > 0) {
      const totalAmount = validForPeriod.reduce((sum, req) => sum + req.amount, 0);
      console.log(`Total Cash Advance: ₱${totalAmount.toLocaleString()}`);
      console.log('✅ Will show in payslip');
    } else {
      console.log('Total Cash Advance: ₱0.00');
      console.log('❌ No approved & disbursed cash advances in this period');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllCashAdvances();
