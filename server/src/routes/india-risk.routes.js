import { Router } from 'express';
import { IndiaRiskController } from '../controllers/indiaRisk.controller.js';

const router = Router();

router.get('/', IndiaRiskController.getIndiaRisk);

export default router;
