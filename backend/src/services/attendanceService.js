import prisma from '../config/database.js';
import { logActivity } from '../utils/activityLogger.js';

export const checkIn = async (employeeId, date, req) => {
  // Use current date if no date provided
  let attendanceDate;
  if (date) {
    // Parse the date string and create a date in local timezone
    const inputDate = new Date(date);
    attendanceDate = new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate());
  } else {
    // Use current date in local timezone
    const now = new Date();
    attendanceDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  console.log('Check-in for employee:', employeeId); 
  console.log('Original date input:', date);
  console.log('Normalized attendance date:', attendanceDate);
  console.log('Current time:', new Date());

  // Check if attendance already exists for this date
  const existingAttendance = await prisma.attendance.findUnique({
    where: {
      employeeId_date: {
        employeeId,
        date: attendanceDate,
      },
    },
  });

  console.log('Existing attendance found:', existingAttendance);

  if (existingAttendance && existingAttendance.checkInTime) {
    console.log('Already checked in - existing record:', {
      id: existingAttendance.id,
      date: existingAttendance.date,
      checkInTime: existingAttendance.checkInTime
    });
    const error = new Error(`Already checked in for ${attendanceDate.toDateString()}. Existing check-in at ${existingAttendance.checkInTime}`);
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
  // Use current date if no date provided
  let attendanceDate;
  if (date) {
    // Parse the date string and create a date in local timezone
    const inputDate = new Date(date);
    attendanceDate = new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate());
  } else {
    // Use current date in local timezone
    const now = new Date();
    attendanceDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  console.log('Check-out for employee:', employeeId);
  console.log('Original date input:', date);
  console.log('Normalized attendance date:', attendanceDate);

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

  // Calculate duration in seconds (not minutes)
  const duration = Math.floor((checkOutTime - attendance.checkInTime) / 1000);

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


// Debug function to get attendance records for a specific employee
export const getAttendanceDebug = async (employeeId) => {
  const attendances = await prisma.attendance.findMany({
    where: { employeeId },
    orderBy: { date: 'desc' },
    take: 10, // Last 10 records
  });

  return attendances.map(record => ({
    id: record.id,
    date: record.date,
    checkInTime: record.checkInTime,
    checkOutTime: record.checkOutTime,
    status: record.status,
    duration: record.duration
  }));
};

// Function to delete a specific attendance record (for debugging)
export const deleteAttendanceRecord = async (attendanceId, adminId, req) => {
  const attendance = await prisma.attendance.findUnique({
    where: { id: attendanceId }
  });

  if (!attendance) {
    const error = new Error('Attendance record not found');
    error.statusCode = 404;
    throw error;
  }

  await prisma.attendance.delete({
    where: { id: attendanceId }
  });

  await logActivity(adminId, 'ATTENDANCE_DELETED', 'Attendance', attendanceId, { originalDate: attendance.date }, req);

  return { message: 'Attendance record deleted successfully' };
};