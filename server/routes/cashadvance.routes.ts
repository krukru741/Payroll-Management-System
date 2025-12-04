import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import {
  createCashAdvanceRequest,
  getCashAdvanceRequests,
  getCashAdvanceRequest,
  updateCashAdvanceRequest,
  cancelCashAdvanceRequest,
  managerApproveCashAdvance,
  adminApproveCashAdvance,
  rejectCashAdvance,
  disburseCashAdvance,
  getOutstandingBalance
} from '../controllers/cashadvance.controller';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Cash advance request routes
router.post('/request', createCashAdvanceRequest);
router.get('/', getCashAdvanceRequests);
router.get('/:id', getCashAdvanceRequest);
router.put('/:id', updateCashAdvanceRequest);
router.delete('/:id', cancelCashAdvanceRequest);

// Approval routes (two-level)
router.post('/:id/manager-approve', managerApproveCashAdvance);
router.post('/:id/admin-approve', adminApproveCashAdvance);
router.post('/:id/reject', rejectCashAdvance);

// Disbursement
router.post('/:id/disburse', disburseCashAdvance);

// Outstanding balance
router.get('/outstanding/:employeeId', getOutstandingBalance);

export default router;
