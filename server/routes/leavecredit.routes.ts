import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import {
  getLeaveCredits,
  adjustLeaveCredits,
  bulkAdjustLeaveCredits,
  resetLeaveCredits,
  getAdjustmentHistory
} from '../controllers/leavecredit.controller';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Leave credit routes
router.get('/:employeeId', getLeaveCredits);
router.post('/:employeeId/adjust', adjustLeaveCredits);
router.post('/:employeeId/bulk-adjust', bulkAdjustLeaveCredits);
router.post('/:employeeId/reset', resetLeaveCredits);
router.get('/:employeeId/history', getAdjustmentHistory);

export default router;
