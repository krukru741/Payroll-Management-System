import { Router } from 'express';
import { 
  getEmployees, 
  getEmployee, 
  createEmployee, 
  updateEmployee, 
  deleteEmployee,
  getDashboardStats,
  uploadAvatar
} from '../controllers/employee.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { avatarUpload } from '../middleware/upload.middleware';

const router = Router();

router.get('/', authenticateToken, getEmployees);
router.get('/:id/dashboard-stats', authenticateToken, getDashboardStats);
router.get('/:id', authenticateToken, getEmployee);
router.post('/', authenticateToken, createEmployee); // Admin only (check role in controller or middleware)
router.put('/:id', authenticateToken, updateEmployee);
router.delete('/:id', authenticateToken, deleteEmployee);
router.post('/:id/avatar', authenticateToken, avatarUpload.single('avatar'), uploadAvatar);

export default router;
