import express from 'express';
import * as dashboardController from '../controllers/dashboardController.js';
import { requireAuth, requireAdmin } from '../middlewares/auth.js';

const router = express.Router();

router.get('/admin', requireAuth, requireAdmin, dashboardController.getAdminDashboard);
router.get('/employee', requireAuth, dashboardController.getEmployeeDashboard);

export default router;

