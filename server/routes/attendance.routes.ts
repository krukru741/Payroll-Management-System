import { Router } from 'express';
import { clockIn, clockOut, getAttendance, getMissingLogs, createAttendance, overrideAttendance } from '../controllers/attendance.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/clock-in', authenticateToken, clockIn);
router.post('/clock-out', authenticateToken, clockOut);
router.get('/missing', authenticateToken, getMissingLogs);
router.post('/', authenticateToken, createAttendance);
router.put('/:id/override', authenticateToken, overrideAttendance);
router.get('/', authenticateToken, getAttendance);

export default router;
