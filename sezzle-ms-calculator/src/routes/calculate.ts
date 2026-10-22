import { Router } from 'express';
import { calculateController } from '../controllers/calculate.controller';

const router = Router();

router.post('/calculate', calculateController);

export default router;
