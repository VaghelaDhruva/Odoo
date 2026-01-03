import prisma from '../config/database.js';
import { logActivity } from '../utils/activityLogger.js';

export const createLeaveRequest = async (employeeId, leaveData, req) => {
  const { leaveType, startDate, endDate, reason } = leaveData;

  // Check for overlapping leave requests
  const overlappingLeave = await prisma.leaveRequest.findFirst({
    where: {
      employeeId,
      status: { in: ['PENDING', 'APPROVED'] },
      OR: [
        {
          AND: [
            { startDate: { lte: new Date(endDate) } },
            { endDate: { gte: new Date(startDate) } },
          ],
        },
      ],
    },
  });

  if (overlappingLeave) {
    const error = new Error('You have an overlapping leave request');
    error.statusCode = 409;
    throw error;
  }

  const leaveRequest = await prisma.leaveRequest.create({
    data: {
      employeeId,
      leaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
    },
    include: {
      employee: {
        select: {
          id: true,
          employeeId: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  await logActivity(employeeId, 'LEAVE_REQUEST_CREATED', 'LeaveRequest', leaveRequest.id, leaveData, req);

  return leaveRequest;
};

export const getMyLeaveRequests = async (employeeId, filters = {}) => {
  const { status } = filters;
  const where = { employeeId };
  if (status) where.status = status;

  const leaveRequests = await prisma.leaveRequest.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return leaveRequests;
};

export const getAllLeaveRequests = async (filters = {}) => {
  const { employeeId, status, startDate, endDate } = filters;
  const where = {};

  if (employeeId) where.employeeId = employeeId;
  if (status) where.status = status;
  if (startDate || endDate) {
    where.OR = [
      {
        AND: [
          { startDate: { lte: new Date(endDate || '9999-12-31') } },
          { endDate: { gte: new Date(startDate || '1970-01-01') } },
        ],
      },
    ];
  }

  const leaveRequests = await prisma.leaveRequest.findMany({
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
    orderBy: { createdAt: 'desc' },
  });

  return leaveRequests;
};

export const approveLeaveRequest = async (leaveId, adminId, adminComment, req) => {
  const leaveRequest = await prisma.leaveRequest.findUnique({
    where: { id: leaveId },
    include: {
      employee: {
        select: {
          id: true,
          employeeId: true,
        },
      },
    },
  });

  if (!leaveRequest) {
    const error = new Error('Leave request not found');
    error.statusCode = 404;
    throw error;
  }

  if (leaveRequest.status !== 'PENDING') {
    const error = new Error(`Leave request is already ${leaveRequest.status}`);
    error.statusCode = 400;
    throw error;
  }

  const updatedLeaveRequest = await prisma.leaveRequest.update({
    where: { id: leaveId },
    data: {
      status: 'APPROVED',
      adminComment,
      decisionBy: adminId,
    },
    include: {
      employee: {
        select: {
          id: true,
          employeeId: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  await logActivity(adminId, 'LEAVE_APPROVED', 'LeaveRequest', leaveId, { employeeId: leaveRequest.employeeId, adminComment }, req);

  return updatedLeaveRequest;
};

export const rejectLeaveRequest = async (leaveId, adminId, adminComment, req) => {
  const leaveRequest = await prisma.leaveRequest.findUnique({
    where: { id: leaveId },
    include: {
      employee: {
        select: {
          id: true,
          employeeId: true,
        },
      },
    },
  });

  if (!leaveRequest) {
    const error = new Error('Leave request not found');
    error.statusCode = 404;
    throw error;
  }

  if (leaveRequest.status !== 'PENDING') {
    const error = new Error(`Leave request is already ${leaveRequest.status}`);
    error.statusCode = 400;
    throw error;
  }

  const updatedLeaveRequest = await prisma.leaveRequest.update({
    where: { id: leaveId },
    data: {
      status: 'REJECTED',
      adminComment,
      decisionBy: adminId,
    },
    include: {
      employee: {
        select: {
          id: true,
          employeeId: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  await logActivity(adminId, 'LEAVE_REJECTED', 'LeaveRequest', leaveId, { employeeId: leaveRequest.employeeId, adminComment }, req);

  return updatedLeaveRequest;
};

export const updateLeaveStatus = async (leaveId, adminId, status, comments, req) => {
  const leaveRequest = await prisma.leaveRequest.findUnique({
    where: { id: leaveId },
    include: {
      employee: {
        select: {
          id: true,
          employeeId: true,
        },
      },
    },
  });

  if (!leaveRequest) {
    const error = new Error('Leave request not found');
    error.statusCode = 404;
    throw error;
  }

  if (leaveRequest.status !== 'PENDING') {
    const error = new Error(`Leave request is already ${leaveRequest.status}`);
    error.statusCode = 400;
    throw error;
  }

  const updatedLeaveRequest = await prisma.leaveRequest.update({
    where: { id: leaveId },
    data: {
      status: status.toUpperCase(),
      adminComment: comments,
      decisionBy: adminId,
    },
    include: {
      employee: {
        select: {
          id: true,
          employeeId: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  const activityType = status.toUpperCase() === 'APPROVED' ? 'LEAVE_APPROVED' : 'LEAVE_REJECTED';
  await logActivity(adminId, activityType, 'LeaveRequest', leaveId, { employeeId: leaveRequest.employeeId, adminComment: comments }, req);

  return updatedLeaveRequest;
};

