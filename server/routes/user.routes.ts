import { Router } from 'express';
import { 
  getUsers, 
  updateUserRole, 
  resetUserPassword, 
  deleteUser 
} from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// User management routes
router.get('/', getUsers); // Get all users
router.put('/:id/role', updateUserRole); // Update user role
router.put('/:id/password', resetUserPassword); // Reset password
router.delete('/:id', deleteUser); // Delete user

export default router;
