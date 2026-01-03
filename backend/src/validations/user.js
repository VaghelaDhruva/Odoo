import { body, param } from 'express-validator';

export const updateProfileValidation = [
  body('phone')
    .optional()
    .trim()
    .custom((value) => {
      if (!value) return true; // Allow empty phone
      // More flexible phone validation - allows various formats
      const phoneRegex = /^[+]?[(]?[\d\s\-\(\)\.]{7,20}$/;
      if (!phoneRegex.test(value)) {
        throw new Error('Please provide a valid phone number (7-20 digits with optional formatting)');
      }
      return true;
    }),
  
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address must not exceed 500 characters'),
  
  body('profileImage')
    .optional()
    .trim()
    .isURL()
    .withMessage('Profile image must be a valid URL'),
];

export const createEmployeeValidation = [
  body('employeeId')
    .notEmpty()
    .trim()
    .withMessage('Employee ID is required'),
  
  body('firstName')
    .notEmpty()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name is required and must be between 2 and 50 characters'),
  
  body('lastName')
    .notEmpty()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name is required and must be between 2 and 50 characters'),
  
  body('email')
    .notEmpty()
    .trim()
    .isEmail()
    .withMessage('Valid email address is required')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .isLength({ min: 6 })
    .withMessage('Password is required and must be at least 6 characters'),
  
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department must not exceed 100 characters'),
  
  body('designation')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Designation must not exceed 100 characters'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address must not exceed 500 characters'),
  
  body('salary')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Salary must be a positive number'),
  
  body('role')
    .optional()
    .isIn(['ADMIN', 'HR', 'EMPLOYEE'])
    .withMessage('Role must be ADMIN, HR, or EMPLOYEE'),
  
  body('employmentStatus')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE', 'TERMINATED', 'ON_LEAVE'])
    .withMessage('Employment status must be ACTIVE, INACTIVE, TERMINATED, or ON_LEAVE'),
];

export const updateEmployeeValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department must not exceed 100 characters'),
  
  body('designation')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Designation must not exceed 100 characters'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address must not exceed 500 characters'),
  
  body('salary')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Salary must be a positive number'),
  
  body('role')
    .optional()
    .isIn(['ADMIN', 'HR', 'EMPLOYEE'])
    .withMessage('Role must be ADMIN, HR, or EMPLOYEE'),
  
  body('employmentStatus')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE', 'TERMINATED', 'ON_LEAVE'])
    .withMessage('Employment status must be ACTIVE, INACTIVE, TERMINATED, or ON_LEAVE'),
];

export const userIdParamValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid user ID format'),
];

