import { Router } from 'express';
import { maintenanceController } from '../controllers/maintenanceController';
import { Log } from '../utils/logger';

const router = Router();

router.post('/', (req, res) => {
  Log('backend', 'info', 'route', 'POST /maintenance hit');
  maintenanceController.create(req, res);
});

router.get('/:vehicleId', (req, res) => {
  Log('backend', 'info', 'route', `GET /maintenance/${req.params.vehicleId} hit`);
  maintenanceController.getByVehicleId(req, res);
});

export default router;