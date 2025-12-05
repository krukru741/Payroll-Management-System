import { Router } from 'express';
import { getAttendanceSummary, getCashAdvances } from '../controllers/payrollData.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/attendance-summary', authenticateToken, getAttendanceSummary);
router.get('/cash-advances', authenticateToken, getCashAdvances);

export default router;
