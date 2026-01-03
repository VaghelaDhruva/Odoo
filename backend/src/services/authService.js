import prisma from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { logActivity } from '../utils/activityLogger.js';

export const signup = async (userData, req) => {
  const { employeeId, email, password, firstName, lastName, role = 'EMPLOYEE' } = userData;

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

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = await prisma.user.create({
    data: {
      employeeId,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
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
      employmentStatus: true,
      createdAt: true,
    },
  });

  // Log activity
  await logActivity(user.id, 'USER_CREATED', 'User', user.id, { employeeId, email, role }, req);

  // Generate tokens
  const accessToken = generateAccessToken({ userId: user.id, role: user.role });
  const refreshToken = generateRefreshToken({ userId: user.id });

  // Store refresh token
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  return {
    user,
    accessToken,
    refreshToken,
  };
};

export const login = async (email, password, req) => {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Check password
  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Check if user is active
  if (user.employmentStatus === 'TERMINATED') {
    const error = new Error('Account is terminated. Please contact HR.');
    error.statusCode = 403;
    throw error;
  }

  // Generate tokens
  const accessToken = generateAccessToken({ userId: user.id, role: user.role });
  const refreshToken = generateRefreshToken({ userId: user.id });

  // Update refresh token
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  // Log activity
  await logActivity(user.id, 'USER_LOGIN', 'User', user.id, {}, req);

  return {
    user: {
      id: user.id,
      employeeId: user.employeeId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      department: user.department,
      designation: user.designation,
    },
    accessToken,
    refreshToken,
  };
};

export const refreshAccessToken = async (refreshToken) => {
  // Verify refresh token
  const decoded = verifyRefreshToken(refreshToken);

  if (!decoded) {
    const error = new Error('Invalid refresh token');
    error.statusCode = 401;
    throw error;
  }

  // Find user with this refresh token
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
  });

  if (!user || user.refreshToken !== refreshToken) {
    const error = new Error('Invalid refresh token');
    error.statusCode = 401;
    throw error;
  }

  // Generate new access token
  const accessToken = generateAccessToken({ userId: user.id, role: user.role });

  return { accessToken };
};

export const logout = async (userId) => {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  });

  return { message: 'Logged out successfully' };
};

