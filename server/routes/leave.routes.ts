import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import {
  createLeaveRequest,
  getLeaveRequests,
  getLeaveRequest,
  updateLeaveRequest,
  cancelLeaveRequest,
  approveLeaveRequest,
  rejectLeaveRequest,
  getLeaveBalance,
  completeLeaveRequest
} from '../controllers/leave.controller';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Leave request routes
router.post('/request', createLeaveRequest);
router.get('/', getLeaveRequests);
router.get('/:id', getLeaveRequest);
router.put('/:id', updateLeaveRequest);
router.delete('/:id', cancelLeaveRequest);

// Approval routes
router.post('/:id/approve', approveLeaveRequest);
router.post('/:id/reject', rejectLeaveRequest);
router.post('/:id/complete', completeLeaveRequest); // Complete leave (auto or manual)

// Leave balance
router.get('/balance/:employeeId', getLeaveBalance);

export default router;
