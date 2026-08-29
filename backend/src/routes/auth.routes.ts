import { Router } from 'express';
import { authController } from '../controllers/auth';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } from '../validators/auth';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authenticate, authController.logout);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);
router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);
router.get('/me', authenticate, authController.getMe);
router.get('/sessions', authenticate, authController.getSessions);
router.delete('/sessions/:sessionId', authenticate, authController.revokeSession);

export default router;
