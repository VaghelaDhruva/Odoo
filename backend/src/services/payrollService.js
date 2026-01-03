import { Prisma } from '@prisma/client';
import prisma from '../config/database.js';
import { logActivity } from '../utils/activityLogger.js';

export const getMyPayroll = async (employeeId, filters = {}) => {
  const { payableMonth } = filters;
  const where = { employeeId };

  if (payableMonth) {
    const monthStart = new Date(payableMonth);
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    monthEnd.setDate(0);
    monthEnd.setHours(23, 59, 59, 999);

    where.payableMonth = {
      gte: monthStart,
      lte: monthEnd,
    };
  }

  const payrolls = await prisma.payroll.findMany({
    where,
    orderBy: { payableMonth: 'desc' },
  });

  return payrolls;
};

export const getAllPayroll = async (filters = {}) => {
  const { employeeId, payableMonth } = filters;
  const where = {};

  if (employeeId) where.employeeId = employeeId;
  if (payableMonth) {
    const monthStart = new Date(payableMonth);
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    monthEnd.setDate(0);
    monthEnd.setHours(23, 59, 59, 999);

    where.payableMonth = {
      gte: monthStart,
      lte: monthEnd,
    };
  }

  const payrolls = await prisma.payroll.findMany({
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
    orderBy: { payableMonth: 'desc' },
  });

  return payrolls;
};

export const createPayroll = async (payrollData, req) => {
  const { employeeId, baseSalary, allowances = 0, deductions = 0, payableMonth, status = 'PENDING' } = payrollData;

  // Calculate net salary
  const netSalary = parseFloat(baseSalary) + parseFloat(allowances) - parseFloat(deductions);

  // Check if payroll already exists for this month
  const monthStart = new Date(payableMonth);
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const existingPayroll = await prisma.payroll.findFirst({
    where: {
      employeeId,
      payableMonth: monthStart,
    },
  });

  if (existingPayroll) {
    const error = new Error('Payroll already exists for this month');
    error.statusCode = 409;
    throw error;
  }

  const payroll = await prisma.payroll.create({
    data: {
      employeeId,
      baseSalary: new Prisma.Decimal(baseSalary),
      allowances: new Prisma.Decimal(allowances),
      deductions: new Prisma.Decimal(deductions),
      netSalary: new Prisma.Decimal(netSalary),
      payableMonth: monthStart,
      status,
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

  await logActivity(req.user.id, 'PAYROLL_CREATED', 'Payroll', payroll.id, { employeeId, netSalary }, req);

  return payroll;
};

export const updatePayroll = async (payrollId, updateData, req) => {
  const payroll = await prisma.payroll.findUnique({
    where: { id: payrollId },
  });

  if (!payroll) {
    const error = new Error('Payroll not found');
    error.statusCode = 404;
    throw error;
  }

  const { baseSalary, allowances, deductions, status } = updateData;
  const dataToUpdate = {};

  if (baseSalary !== undefined) dataToUpdate.baseSalary = new Prisma.Decimal(baseSalary);
  if (allowances !== undefined) dataToUpdate.allowances = new Prisma.Decimal(allowances);
  if (deductions !== undefined) dataToUpdate.deductions = new Prisma.Decimal(deductions);
  if (status !== undefined) dataToUpdate.status = status;

  // Recalculate net salary if any financial field changed
  if (baseSalary !== undefined || allowances !== undefined || deductions !== undefined) {
    const finalBaseSalary = baseSalary !== undefined ? parseFloat(baseSalary) : parseFloat(payroll.baseSalary);
    const finalAllowances = allowances !== undefined ? parseFloat(allowances) : parseFloat(payroll.allowances);
    const finalDeductions = deductions !== undefined ? parseFloat(deductions) : parseFloat(payroll.deductions);
    dataToUpdate.netSalary = new Prisma.Decimal(finalBaseSalary + finalAllowances - finalDeductions);
  }

  const updatedPayroll = await prisma.payroll.update({
    where: { id: payrollId },
    data: dataToUpdate,
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

  await logActivity(req.user.id, 'PAYROLL_UPDATED', 'Payroll', payrollId, updateData, req);

  return updatedPayroll;
};

