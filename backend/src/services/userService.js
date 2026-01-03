import prisma from '../config/database.js';
import { hashPassword } from '../utils/password.js';
import { logActivity } from '../utils/activityLogger.js';

export const getMyProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      employeeId: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      department: true,
      designation: true,
      phone: true,
      address: true,
      salary: true,
      employmentStatus: true,
      joinDate: true,
      profileImage: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

export const updateMyProfile = async (userId, updateData, req) => {
  // Employees can only update: phone, address, profileImage
  const allowedFields = ['phone', 'address', 'profileImage'];
  const filteredData = {};

  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      filteredData[field] = updateData[field];
    }
  }

  if (Object.keys(filteredData).length === 0) {
    const error = new Error('No valid fields to update');
    error.statusCode = 400;
    throw error;
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: filteredData,
    select: {
      id: true,
      employeeId: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      department: true,
      designation: true,
      phone: true,
      address: true,
      profileImage: true,
      updatedAt: true,
    },
  });

  await logActivity(userId, 'PROFILE_UPDATED', 'User', userId, filteredData, req);

  return user;
};

export const getAllUsers = async (filters = {}) => {
  const { department, role, employmentStatus, search } = filters;
  const where = {};

  if (department) where.department = department;
  if (role) where.role = role;
  if (employmentStatus) where.employmentStatus = employmentStatus;
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { employeeId: { contains: search, mode: 'insensitive' } },
    ];
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      employeeId: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      department: true,
      designation: true,
      phone: true,
      employmentStatus: true,
      joinDate: true,
      profileImage: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return users;
};

export const getUserById = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      employeeId: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      department: true,
      designation: true,
      phone: true,
      address: true,
      salary: true,
      employmentStatus: true,
      joinDate: true,
      profileImage: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

export const createUser = async (userData, req) => {
  const {
    employeeId,
    email,
    password,
    firstName,
    lastName,
    role = 'EMPLOYEE',
    department,
    designation,
    phone,
    address,
    salary,
  } = userData;

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { employeeId },
      ],
    },
  });

  if (existingUser) {
    const error = new Error('User with this email or employee ID already exists');
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = password ? await hashPassword(password) : undefined;

  const user = await prisma.user.create({
    data: {
      employeeId,
      email,
      ...(hashedPassword && { password: hashedPassword }),
      firstName,
      lastName,
      role,
      department,
      designation,
      phone,
      address,
      salary: salary ? parseFloat(salary) : null,
    },
    select: {
      id: true,
      employeeId: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      department: true,
      designation: true,
      phone: true,
      address: true,
      salary: true,
      employmentStatus: true,
      joinDate: true,
      profileImage: true,
      createdAt: true,
    },
  });

  await logActivity(req.user.id, 'USER_CREATED', 'User', user.id, { employeeId, email, role }, req);

  return user;
};

export const updateUser = async (userId, updateData, req) => {
  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // Prepare update data (exclude password from general update)
  const { password, ...restData } = updateData;
  const dataToUpdate = { ...restData };

  // Handle salary conversion
  if (dataToUpdate.salary !== undefined) {
    dataToUpdate.salary = parseFloat(dataToUpdate.salary);
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: dataToUpdate,
    select: {
      id: true,
      employeeId: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      department: true,
      designation: true,
      phone: true,
      address: true,
      salary: true,
      employmentStatus: true,
      joinDate: true,
      profileImage: true,
      updatedAt: true,
    },
  });

  await logActivity(req.user.id, 'USER_UPDATED', 'User', userId, updateData, req);

  return user;
};

