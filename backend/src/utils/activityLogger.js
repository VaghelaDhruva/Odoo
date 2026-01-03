import prisma from '../config/database.js';

export const logActivity = async (userId, action, entityType, entityId = null, details = null, req = null) => {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        details: details || {},
        ipAddress: req?.ip || req?.socket?.remoteAddress || null,
        userAgent: req?.get('user-agent') || null,
      },
    });
  } catch (error) {
    // Log error but don't throw - activity logging shouldn't break the main flow
    console.error('Activity logging error:', error);
  }
};

