import express from 'express';
import * as authController from '../controllers/authController.js';
import * as authValidation from '../validations/auth.js';
import { handleValidationErrors } from '../middlewares/validation.js';
import { requireAuth } from '../middlewares/auth.js';

const router = express.Router();

router.post('/signup', authValidation.signupValidation, handleValidationErrors, authController.signup);
router.post('/login', authValidation.loginValidation, handleValidationErrors, authController.login);
router.post('/refresh', authValidation.refreshTokenValidation, handleValidationErrors, authController.refresh);
router.post('/logout', requireAuth, authController.logout);

export default router;

