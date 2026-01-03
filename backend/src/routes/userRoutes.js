import express from 'express';
import * as userController from '../controllers/userController.js';
import * as userValidation from '../validations/user.js';
import { handleValidationErrors } from '../middlewares/validation.js';
import { requireAuth, requireAdmin } from '../middlewares/auth.js';

const router = express.Router();

// Employee routes
router.get('/me', requireAuth, userController.getMyProfile);
router.put('/me', requireAuth, userValidation.updateProfileValidation, handleValidationErrors, userController.updateMyProfile);

// Admin routes
router.get('/', requireAuth, requireAdmin, userController.getAllUsers);
router.get('/:id', requireAuth, requireAdmin, userValidation.userIdParamValidation, handleValidationErrors, userController.getUserById);
router.post('/', requireAuth, requireAdmin, userValidation.updateEmployeeValidation, handleValidationErrors, userController.createUser);
router.put('/:id', requireAuth, requireAdmin, userValidation.userIdParamValidation, userValidation.updateEmployeeValidation, handleValidationErrors, userController.updateUser);

export default router;

