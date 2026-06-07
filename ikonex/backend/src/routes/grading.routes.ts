import { Router } from 'express';
import { getGradingScales, upsertGradingScales } from '../controllers/grading.controller';
import { authenticate } from '../middleware/auth';
const router = Router();
router.use(authenticate);
router.get('/', getGradingScales);
router.post('/', upsertGradingScales);
export default router;
