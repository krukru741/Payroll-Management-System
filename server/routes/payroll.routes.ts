import { Router } from 'express';
import { 
  calculatePayroll, 
  getPayrolls, 
  finalizePayroll 
} from '../controllers/payroll.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/calculate', authenticateToken, calculatePayroll);
router.get('/', authenticateToken, getPayrolls);
router.post('/finalize', authenticateToken, finalizePayroll);

export default router;
