import { body, param, query } from 'express-validator';

export const createPayrollValidation = [
  body('employeeId')
    .isUUID()
    .withMessage('Employee ID must be a valid UUID'),
  
  body('baseSalary')
    .isFloat({ min: 0 })
    .withMessage('Base salary must be a positive number'),
  
  body('allowances')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Allowances must be a positive number'),
  
  body('deductions')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Deductions must be a positive number'),
  
  body('payableMonth')
    .isISO8601()
    .withMessage('Payable month must be a valid ISO 8601 date'),
  
  body('status')
    .optional()
    .isIn(['PENDING', 'PROCESSED', 'PAID'])
    .withMessage('Status must be PENDING, PROCESSED, or PAID'),
];

export const updatePayrollValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid payroll ID format'),
  
  body('baseSalary')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Base salary must be a positive number'),
  
  body('allowances')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Allowances must be a positive number'),
  
  body('deductions')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Deductions must be a positive number'),
  
  body('status')
    .optional()
    .isIn(['PENDING', 'PROCESSED', 'PAID'])
    .withMessage('Status must be PENDING, PROCESSED, or PAID'),
];

export const payrollQueryValidation = [
  query('employeeId')
    .optional()
    .isUUID()
    .withMessage('Employee ID must be a valid UUID'),
  
  query('payableMonth')
    .optional()
    .isISO8601()
    .withMessage('Payable month must be a valid ISO 8601 date'),
];

