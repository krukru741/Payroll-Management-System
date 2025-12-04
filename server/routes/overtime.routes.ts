import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import {
  createOvertimeRequest,
  getOvertimeRequests,
  getOvertimeRequest,
  updateOvertimeRequest,
  cancelOvertimeRequest,
  approveOvertimeRequest,
  rejectOvertimeRequest,
  getOvertimeSummary
} from '../controllers/overtime.controller';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Overtime request routes
router.post('/request', createOvertimeRequest);
router.get('/', getOvertimeRequests);
router.get('/:id', getOvertimeRequest);
router.put('/:id', updateOvertimeRequest);
router.delete('/:id', cancelOvertimeRequest);

// Approval routes
router.post('/:id/approve', approveOvertimeRequest);
router.post('/:id/reject', rejectOvertimeRequest);

// Overtime summary
router.get('/summary/:employeeId', getOvertimeSummary);

export default router;
