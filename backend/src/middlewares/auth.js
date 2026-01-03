import { verifyAccessToken } from '../utils/jwt.js';
import prisma from '../config/database.js';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please provide a valid token.',
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token.',
      });
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
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
      },
    });

    if (!user || user.employmentStatus === 'TERMINATED') {
      return res.status(401).json({
        success: false,
        message: 'User not found or account is inactive.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed.',
    });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
  }

  if (req.user.role !== 'ADMIN' && req.user.role !== 'HR') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin or HR privileges required.',
    });
  }

  next();
};

export const requireEmployee = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
  }

  if (req.user.role !== 'EMPLOYEE') {
    return res.status(403).json({
      success: false,
      message: 'This endpoint is for employees only.',
    });
  }

  next();
};

