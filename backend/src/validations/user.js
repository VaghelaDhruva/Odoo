import { body, param } from 'express-validator';

export const updateProfileValidation = [
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
  
  body('profileImage')
    .optional()
    .trim()
    .isURL()
    .withMessage('Profile image must be a valid URL'),
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

