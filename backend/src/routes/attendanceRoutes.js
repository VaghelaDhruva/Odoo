import express from 'express';
import * as attendanceController from '../controllers/attendanceController.js';
import * as attendanceValidation from '../validations/attendance.js';
import { handleValidationErrors } from '../middlewares/validation.js';
import { requireAuth, requireAdmin } from '../middlewares/auth.js';

const router = express.Router();

// Employee routes
router.post('/checkin', requireAuth, attendanceValidation.checkInValidation, handleValidationErrors, attendanceController.checkIn);
router.post('/checkout', requireAuth, attendanceValidation.checkOutValidation, handleValidationErrors, attendanceController.checkOut);
router.get('/me', requireAuth, attendanceValidation.attendanceQueryValidation, handleValidationErrors, attendanceController.getMyAttendance);

// Admin routes
router.get('/', requireAuth, requireAdmin, attendanceValidation.attendanceQueryValidation, handleValidationErrors, attendanceController.getAllAttendance);

export default router;

