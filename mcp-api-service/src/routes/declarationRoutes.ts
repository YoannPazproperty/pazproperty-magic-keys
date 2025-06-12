import { Router } from 'express';
import { handleProviderAssignment } from '../controllers/declarationController';

const router = Router();

// Cette route sera appelée par le trigger Supabase
router.post('/', handleProviderAssignment);

export default router;