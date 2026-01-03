import { body, query } from 'express-validator';

export const checkInValidation = [
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),
];

export const checkOutValidation = [
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),
];

export const attendanceQueryValidation = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  
  query('employeeId')
    .optional()
    .isUUID()
    .withMessage('Employee ID must be a valid UUID'),
];

