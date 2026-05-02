import { Router } from 'express';
import { schedulerController } from '../controllers/schedulerController';
import { Log } from '../utils/logger';

const router = Router();

router.get('/:depotId', (req, res) => {
  Log('backend', 'info', 'route', `GET /schedule/${req.params.depotId} hit`);
  schedulerController.getSchedule(req, res);
});

export default router;