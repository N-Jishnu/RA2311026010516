import { Router } from 'express';
import { vehicleController } from '../controllers/vehicleController';
import { Log } from '../../logging_middleware/src/logger';

const router = Router();

router.post('/', (req, res) => {
  Log('backend', 'info', 'route', 'POST /vehicles hit');
  vehicleController.create(req, res);
});

router.get('/', (req, res) => {
  Log('backend', 'info', 'route', 'GET /vehicles hit');
  vehicleController.getAll(req, res);
});

router.get('/due', (req, res) => {
  Log('backend', 'info', 'route', 'GET /vehicles/due hit');
  vehicleController.getDue(req, res);
});

router.get('/:id', (req, res) => {
  Log('backend', 'info', 'route', `GET /vehicles/${req.params.id} hit`);
  vehicleController.getById(req, res);
});

router.put('/:id', (req, res) => {
  Log('backend', 'info', 'route', `PUT /vehicles/${req.params.id} hit`);
  vehicleController.update(req, res);
});

router.delete('/:id', (req, res) => {
  Log('backend', 'info', 'route', `DELETE /vehicles/${req.params.id} hit`);
  vehicleController.delete(req, res);
});

export default router;