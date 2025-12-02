import { Router } from 'express';
import { login, register, me } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', login);
router.post('/register', authenticateToken, register); // Only authenticated users (admins) can register new users
router.get('/me', authenticateToken, me);

export default router;
