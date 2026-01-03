import prisma from '../config/database.js';
import { logActivity } from '../utils/activityLogger.js';

export const checkIn = async (employeeId, date, req) => {
  const attendanceDate = date ? new Date(date) : new Date();
  attendanceDate.setHours(0, 0, 0, 0);

  // Check if attendance already exists for today
  const existingAttendance = await prisma.attendance.findUnique({
    where: {
      employeeId_date: {
        employeeId,
        date: attendanceDate,
      },
    },
  });

  if (existingAttendance && existingAttendance.checkInTime) {
    const error = new Error('Already checked in for this date');
    error.statusCode = 409;
    throw error;
  }

  const checkInTime = new Date();

  // Create or update attendance
  const attendance = await prisma.attendance.upsert({
    where: {
      employeeId_date: {
        employeeId,
        date: attendanceDate,
      },
    },
    update: {
      checkInTime,
      status: 'PRESENT',
      updatedBy: employeeId,
    },
    create: {
      employeeId,
      date: attendanceDate,
      checkInTime,
      status: 'PRESENT',
      createdBy: employeeId,
      updatedBy: employeeId,
    },
  });

  await logActivity(employeeId, 'ATTENDANCE_CHECKIN', 'Attendance', attendance.id, { date: attendanceDate, checkInTime }, req);

  return attendance;
};

export const checkOut = async (employeeId, date, req) => {
  const attendanceDate = date ? new Date(date) : new Date();
  attendanceDate.setHours(0, 0, 0, 0);

  // Find attendance record
  const attendance = await prisma.attendance.findUnique({
    where: {
      employeeId_date: {
        employeeId,
        date: attendanceDate,
      },
    },
  });

  if (!attendance) {
    const error = new Error('No check-in found for this date. Please check in first.');
    error.statusCode = 404;
    throw error;
  }

  if (!attendance.checkInTime) {
    const error = new Error('No check-in found for this date');
    error.statusCode = 404;
    throw error;
  }

  if (attendance.checkOutTime) {
    const error = new Error('Already checked out for this date');
    error.statusCode = 409;
    throw error;
  }

  const checkOutTime = new Date();

  // Calculate duration in minutes
  const duration = Math.floor((checkOutTime - attendance.checkInTime) / (1000 * 60));

  // Update attendance
  const updatedAttendance = await prisma.attendance.update({
    where: { id: attendance.id },
    data: {
      checkOutTime,
      duration,
      updatedBy: employeeId,
    },
  });

  await logActivity(employeeId, 'ATTENDANCE_CHECKOUT', 'Attendance', updatedAttendance.id, { date: attendanceDate, checkOutTime, duration }, req);

  return updatedAttendance;
};

export const getMyAttendance = async (employeeId, filters = {}) => {
  const { startDate, endDate } = filters;
  const where = { employeeId };

  if (startDate) {
    where.date = { ...where.date, gte: new Date(startDate) };
  }
  if (endDate) {
    where.date = { ...where.date, lte: new Date(endDate) };
  }

  const attendances = await prisma.attendance.findMany({
    where,
    orderBy: { date: 'desc' },
  });

  return attendances;
};

export const getAllAttendance = async (filters = {}) => {
  const { employeeId, startDate, endDate, status } = filters;
  const where = {};

  if (employeeId) where.employeeId = employeeId;
  if (status) where.status = status;
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) where.date.lte = new Date(endDate);
  }

  const attendances = await prisma.attendance.findMany({
    where,
    include: {
      employee: {
        select: {
          id: true,
          employeeId: true,
          firstName: true,
          lastName: true,
          email: true,
          department: true,
        },
      },
    },
    orderBy: { date: 'desc' },
  });

  return attendances;
};

