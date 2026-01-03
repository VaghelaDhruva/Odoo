import express from 'express';
import * as leaveController from '../controllers/leaveController.js';
import * as leaveValidation from '../validations/leave.js';
import { handleValidationErrors } from '../middlewares/validation.js';
import { requireAuth, requireAdmin } from '../middlewares/auth.js';

const router = express.Router();

// Employee routes
router.post('/', requireAuth, leaveValidation.createLeaveValidation, handleValidationErrors, leaveController.createLeaveRequest);
router.get('/me', requireAuth, leaveValidation.leaveQueryValidation, handleValidationErrors, leaveController.getMyLeaveRequests);

// Admin routes
router.get('/', requireAuth, requireAdmin, leaveValidation.leaveQueryValidation, handleValidationErrors, leaveController.getAllLeaveRequests);
router.put('/:id/approve', requireAuth, requireAdmin, leaveValidation.approveLeaveValidation, handleValidationErrors, leaveController.approveLeaveRequest);
router.put('/:id/reject', requireAuth, requireAdmin, leaveValidation.rejectLeaveValidation, handleValidationErrors, leaveController.rejectLeaveRequest);

export default router;

