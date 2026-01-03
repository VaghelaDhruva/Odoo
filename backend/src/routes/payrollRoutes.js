import express from 'express';
import * as payrollController from '../controllers/payrollController.js';
import * as payrollValidation from '../validations/payroll.js';
import { handleValidationErrors } from '../middlewares/validation.js';
import { requireAuth, requireAdmin } from '../middlewares/auth.js';

const router = express.Router();

// Employee routes
router.get('/me', requireAuth, payrollValidation.payrollQueryValidation, handleValidationErrors, payrollController.getMyPayroll);

// Admin routes
router.get('/', requireAuth, requireAdmin, payrollValidation.payrollQueryValidation, handleValidationErrors, payrollController.getAllPayroll);
router.post('/', requireAuth, requireAdmin, payrollValidation.createPayrollValidation, handleValidationErrors, payrollController.createPayroll);
router.put('/:id', requireAuth, requireAdmin, payrollValidation.updatePayrollValidation, handleValidationErrors, payrollController.updatePayroll);

export default router;

