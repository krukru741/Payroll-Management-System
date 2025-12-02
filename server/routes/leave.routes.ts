import { Router } from 'express';
import { createLeaveRequest, getLeaveRequests, updateLeaveStatus } from '../controllers/leave.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticateToken, createLeaveRequest);
router.get('/', authenticateToken, getLeaveRequests);
router.put('/:id/status', authenticateToken, updateLeaveStatus);

export default router;
