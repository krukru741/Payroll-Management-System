import { Router } from 'express';
import { 
  getSettings, 
  getSettingsByCategory, 
  updateSettings 
} from '../controllers/settings.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication and ADMIN role
router.use(authenticateToken);

// Settings routes
router.get('/', getSettings); // Get all settings
router.get('/:category', getSettingsByCategory); // Get specific category
router.put('/:category', updateSettings); // Update category settings

export default router;
