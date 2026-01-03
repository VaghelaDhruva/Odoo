import prisma from '../config/database.js';

export const getAdminDashboard = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Total employees
  const totalEmployees = await prisma.user.count({
    where: {
      employmentStatus: { in: ['ACTIVE', 'ON_LEAVE'] },
    },
  });

  // Employees present today
  const employeesPresentToday = await prisma.attendance.count({
    where: {
      date: today,
      status: 'PRESENT',
    },
  });

  // Leave requests
  const pendingLeaveCount = await prisma.leaveRequest.count({
    where: { status: 'PENDING' },
  });

  const approvedLeaveCount = await prisma.leaveRequest.count({
    where: {
      status: 'APPROVED',
      startDate: { lte: new Date() },
      endDate: { gte: new Date() },
    },
  });

  // Payroll stats
  const currentMonth = new Date();
  currentMonth.setDate(1);
  currentMonth.setHours(0, 0, 0, 0);

  const payrollStats = await prisma.payroll.aggregate({
    where: {
      payableMonth: currentMonth,
      status: { in: ['PROCESSED', 'PAID'] },
    },
    _sum: {
      netSalary: true,
    },
    _count: true,
  });

  // Attendance summary (last 7 days)
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const attendanceSummary = await prisma.attendance.groupBy({
    by: ['date'],
    where: {
      date: {
        gte: sevenDaysAgo,
        lte: today,
      },
    },
    _count: {
      id: true,
    },
    _sum: {
      duration: true,
    },
  });

  // Recent activity (last 20)
  const recentActivities = await prisma.activityLog.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          employeeId: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },
    },
  });

  return {
    totalEmployees,
    employeesPresentToday,
    pendingLeaveCount,
    approvedLeaveCount,
    payrollStats: {
      totalPaid: payrollStats._sum.netSalary?.toNumber() || 0,
      employeeCount: payrollStats._count || 0,
    },
    attendanceSummary,
    recentActivities,
  };
};

export const getEmployeeDashboard = async (employeeId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Attendance summary (current month)
  const monthStart = new Date(today);
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const monthAttendance = await prisma.attendance.findMany({
    where: {
      employeeId,
      date: {
        gte: monthStart,
        lte: today,
      },
    },
  });

  const presentDays = monthAttendance.filter(a => a.status === 'PRESENT').length;
  const absentDays = monthAttendance.filter(a => a.status === 'ABSENT').length;
  const totalWorkHours = monthAttendance.reduce((sum, a) => sum + (a.duration || 0), 0) / 60;

  // Active leave requests
  const activeLeaveRequests = await prisma.leaveRequest.findMany({
    where: {
      employeeId,
      status: { in: ['PENDING', 'APPROVED'] },
      endDate: { gte: today },
    },
    orderBy: { startDate: 'asc' },
  });

  // Latest payroll
  const latestPayroll = await prisma.payroll.findFirst({
    where: { employeeId },
    orderBy: { payableMonth: 'desc' },
  });

  // Today's attendance
  const todayAttendance = await prisma.attendance.findUnique({
    where: {
      employeeId_date: {
        employeeId,
        date: today,
      },
    },
  });

  return {
    attendanceSummary: {
      presentDays,
      absentDays,
      totalWorkHours: Math.round(totalWorkHours * 100) / 100,
      totalDays: monthAttendance.length,
    },
    activeLeaveRequests,
    payrollSummary: latestPayroll ? {
      payableMonth: latestPayroll.payableMonth,
      netSalary: latestPayroll.netSalary.toNumber(),
      status: latestPayroll.status,
    } : null,
    todayAttendance: todayAttendance ? {
      checkInTime: todayAttendance.checkInTime,
      checkOutTime: todayAttendance.checkOutTime,
      status: todayAttendance.status,
    } : null,
  };
};

