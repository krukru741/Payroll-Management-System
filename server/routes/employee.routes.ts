import { Router } from 'express';
import { 
  getEmployees, 
  getEmployee, 
  createEmployee, 
  updateEmployee, 
  deleteEmployee 
} from '../controllers/employee.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticateToken, getEmployees);
router.get('/:id', authenticateToken, getEmployee);
router.post('/', authenticateToken, createEmployee); // Admin only (check role in controller or middleware)
router.put('/:id', authenticateToken, updateEmployee);
router.delete('/:id', authenticateToken, deleteEmployee);

export default router;
