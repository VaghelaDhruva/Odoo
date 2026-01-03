import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('Password123!', 12);

  // Create Admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@dayflow.com' },
    update: {},
    create: {
      employeeId: 'EMP001',
      email: 'admin@dayflow.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      department: 'Management',
      designation: 'System Administrator',
      phone: '+1234567890',
      address: '123 Admin Street, City',
      salary: 100000,
      employmentStatus: 'ACTIVE',
    },
  });

  // Create HR user
  const hr = await prisma.user.upsert({
    where: { email: 'hr@dayflow.com' },
    update: {},
    create: {
      employeeId: 'EMP002',
      email: 'hr@dayflow.com',
      password: hashedPassword,
      firstName: 'HR',
      lastName: 'Manager',
      role: 'HR',
      department: 'Human Resources',
      designation: 'HR Manager',
      phone: '+1234567891',
      address: '123 HR Street, City',
      salary: 80000,
      employmentStatus: 'ACTIVE',
    },
  });

  // Create Employee users
  const employee1 = await prisma.user.upsert({
    where: { email: 'john.doe@dayflow.com' },
    update: {},
    create: {
      employeeId: 'EMP003',
      email: 'john.doe@dayflow.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'EMPLOYEE',
      department: 'Engineering',
      designation: 'Software Engineer',
      phone: '+1234567892',
      address: '123 Engineer Street, City',
      salary: 70000,
      employmentStatus: 'ACTIVE',
    },
  });

  const employee2 = await prisma.user.upsert({
    where: { email: 'jane.smith@dayflow.com' },
    update: {},
    create: {
      employeeId: 'EMP004',
      email: 'jane.smith@dayflow.com',
      password: hashedPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'EMPLOYEE',
      department: 'Marketing',
      designation: 'Marketing Manager',
      phone: '+1234567893',
      address: '123 Marketing Street, City',
      salary: 75000,
      employmentStatus: 'ACTIVE',
    },
  });

  // Create sample attendance records
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Today's attendance for employee1
  await prisma.attendance.upsert({
    where: {
      employeeId_date: {
        employeeId: employee1.id,
        date: today,
      },
    },
    update: {},
    create: {
      employeeId: employee1.id,
      date: today,
      checkInTime: new Date(today.getTime() + 9 * 60 * 60 * 1000), // 9 AM
      status: 'PRESENT',
      createdBy: employee1.id,
      updatedBy: employee1.id,
    },
  });

  // Create sample leave request
  const leaveStart = new Date(today);
  leaveStart.setDate(leaveStart.getDate() + 7);
  const leaveEnd = new Date(leaveStart);
  leaveEnd.setDate(leaveEnd.getDate() + 2);

  await prisma.leaveRequest.create({
    data: {
      employeeId: employee1.id,
      leaveType: 'PAID',
      startDate: leaveStart,
      endDate: leaveEnd,
      reason: 'Family vacation',
      status: 'PENDING',
    },
  }).catch(() => {
    // Ignore if already exists
  });

  // Create sample payroll for current month
  const payrollMonth = new Date(today);
  payrollMonth.setDate(1);
  payrollMonth.setHours(0, 0, 0, 0);

  await prisma.payroll.upsert({
    where: {
      employeeId_payableMonth: {
        employeeId: employee1.id,
        payableMonth: payrollMonth,
      },
    },
    update: {},
    create: {
      employeeId: employee1.id,
      baseSalary: 70000,
      allowances: 5000,
      deductions: 2000,
      netSalary: 73000,
      payableMonth: payrollMonth,
      status: 'PROCESSED',
    },
  }).catch(() => {
    // Ignore if already exists
  });

  console.log('✅ Database seeded successfully!');
  console.log('\n📝 Sample Users:');
  console.log('Admin: admin@dayflow.com / Password123!');
  console.log('HR: hr@dayflow.com / Password123!');
  console.log('Employee: john.doe@dayflow.com / Password123!');
  console.log('Employee: jane.smith@dayflow.com / Password123!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

