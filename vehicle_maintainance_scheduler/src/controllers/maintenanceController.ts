import { Request, Response } from 'express';
import { maintenanceService } from '../services/maintenanceService';
import { ApiResponse, CreateMaintenanceDTO } from '../types';
import { Log } from '../utils/logger';

export class MaintenanceController {
  async create(req: Request, res: Response): Promise<void> {
    await Log('backend', 'info', 'controller', 'POST /maintenance - start');

    try {
      const data: CreateMaintenanceDTO = req.body;
      const log = await maintenanceService.createMaintenance(data);

      await Log('backend', 'info', 'controller', 'POST /maintenance - success');

      const response: ApiResponse = {
        success: true,
        message: 'Maintenance log created successfully',
        data: log
      };
      res.status(201).json(response);
    } catch (error) {
      await Log('backend', 'error', 'controller', `POST /maintenance - error: ${error instanceof Error ? error.message : 'Unknown error'}`);

      const response: ApiResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create maintenance log'
      };
      res.status(500).json(response);
    }
  }

  async getByVehicleId(req: Request, res: Response): Promise<void> {
    const { vehicleId } = req.params;
    await Log('backend', 'info', 'controller', `GET /maintenance/${vehicleId} - start`);

    try {
      const logs = await maintenanceService.getMaintenanceByVehicleId(vehicleId);

      await Log('backend', 'info', 'controller', `GET /maintenance/${vehicleId} - success`);

      const response: ApiResponse = {
        success: true,
        message: 'Maintenance history retrieved successfully',
        data: logs
      };
      res.status(200).json(response);
    } catch (error) {
      await Log('backend', 'error', 'controller', `GET /maintenance/${vehicleId} - error: ${error instanceof Error ? error.message : 'Unknown error'}`);

      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve maintenance history'
      };
      res.status(500).json(response);
    }
  }
}

export const maintenanceController = new MaintenanceController();