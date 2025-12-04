import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import {
  getSummaryAnalytics,
  getLeaveAnalytics,
  getOvertimeAnalytics,
  getCashAdvanceAnalytics,
  getAdminDashboardStats
} from '../controllers/analytics.controller';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Analytics routes
router.get('/summary', getSummaryAnalytics);
router.get('/admin-dashboard', getAdminDashboardStats);
router.get('/leave', getLeaveAnalytics);
router.get('/overtime', getOvertimeAnalytics);
router.get('/cash-advance', getCashAdvanceAnalytics);

export default router;
