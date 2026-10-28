import { Router } from 'express';
import { register, login, getMe, deleteAccount } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = Router();

router.delete('/account', protect, deleteAccount);

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

export default router;
