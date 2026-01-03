import { body, param, query } from 'express-validator';

export const createLeaveValidation = [
  body('leaveType')
    .isIn(['PAID', 'SICK', 'UNPAID', 'CASUAL', 'EMERGENCY'])
    .withMessage('Leave type must be PAID, SICK, UNPAID, CASUAL, or EMERGENCY'),
  
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date')
    .toDate(),
  
  body('endDate')
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
    .toDate()
    .custom((endDate, { req }) => {
      if (endDate < req.body.startDate) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  
  body('reason')
    .trim()
    .notEmpty()
    .withMessage('Reason is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Reason must be between 10 and 1000 characters'),
];

export const approveLeaveValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid leave request ID format'),
  
  body('adminComment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Admin comment must not exceed 500 characters'),
];

export const rejectLeaveValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid leave request ID format'),
  
  body('adminComment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Admin comment must not exceed 500 characters'),
];

export const leaveQueryValidation = [
  query('status')
    .optional()
    .isIn(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'])
    .withMessage('Status must be PENDING, APPROVED, REJECTED, or CANCELLED'),
  
  query('employeeId')
    .optional()
    .isUUID()
    .withMessage('Employee ID must be a valid UUID'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
];

