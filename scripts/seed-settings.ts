import prisma from '../server/db';

async function seedSettings() {
  console.log('Seeding default system settings...');

  const defaultSettings = [
    {
      category: 'company',
      settings: {
        name: 'Company Name',
        address: '',
        phone: '',
        email: '',
        taxId: '',
        logoUrl: null
      }
    },
    {
      category: 'payroll',
      settings: {
        payPeriod: 'SEMI_MONTHLY',
        payDates: [15, 30],
        taxRates: {
          bracket1: 0,      // 0 - 250,000
          bracket2: 15,     // 250,001 - 400,000
          bracket3: 20,     // 400,001 - 800,000
          bracket4: 25,     // 800,001 - 2,000,000
          bracket5: 30,     // 2,000,001 - 8,000,000
          bracket6: 35      // Above 8,000,000
        },
        sssRate: {
          employee: 4.5,
          employer: 9.5,
          ec: 1.0
        },
        philHealthRate: {
          employee: 2.0,
          employer: 2.0
        },
        pagIbigRate: {
          employee: 2.0,
          employer: 2.0
        },
        overtimeMultipliers: {
          regular: 1.25,
          restDay: 1.3,
          specialHoliday: 1.3,
          regularHoliday: 2.0,
          restDayHoliday: 2.6
        },
        lateDeduction: {
          perMinute: 5.0,
          perHour: 50.0,
          enabled: false
        },
        thirteenthMonthMethod: 'BASIC_SALARY'
      }
    },
    {
      category: 'leave',
      settings: {
        vacationLeave: 15,
        sickLeave: 15,
        emergencyLeave: 3,
        maternityLeave: 105,
        paternityLeave: 7,
        accrualMethod: 'ANNUAL',
        allowCarryOver: true,
        maxCarryOver: 5
      }
    },
    {
      category: 'attendance',
      settings: {
        workStart: '08:00',
        workEnd: '17:00',
        gracePeriodMinutes: 15,
        requireOTApproval: true,
        weekendDays: ['Saturday', 'Sunday']
      }
    },
    {
      category: 'system',
      settings: {
        dateFormat: 'MM/DD/YYYY',
        currency: 'PHP',
        timezone: 'Asia/Manila',
        emailNotifications: true,
        sessionTimeout: 30
      }
    }
  ];

  for (const setting of defaultSettings) {
    await prisma.systemSettings.upsert({
      where: { category: setting.category },
      update: { settings: setting.settings },
      create: setting
    });
    console.log(`✓ Seeded ${setting.category} settings`);
  }

  console.log('Settings seeding complete!');
}

seedSettings()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
