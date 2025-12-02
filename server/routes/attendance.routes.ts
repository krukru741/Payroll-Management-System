import { Router } from 'express';
import { clockIn, clockOut, getAttendance } from '../controllers/attendance.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/clock-in', authenticateToken, clockIn);
router.post('/clock-out', authenticateToken, clockOut);
router.get('/', authenticateToken, getAttendance);

export default router;
