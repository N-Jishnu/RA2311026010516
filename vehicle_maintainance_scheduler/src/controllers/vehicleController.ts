import { Request, Response } from 'express';
import { vehicleService } from '../services/vehicleService';
import { ApiResponse, CreateVehicleDTO, UpdateVehicleDTO } from '../types';
import { Log } from '../utils/logger';

export class VehicleController {
  async create(req: Request, res: Response): Promise<void> {
    await Log('backend', 'info', 'controller', 'POST /vehicles - start');

    try {
      const data: CreateVehicleDTO = req.body;
      const vehicle = await vehicleService.createVehicle(data);

      await Log('backend', 'info', 'controller', 'POST /vehicles - success');

      const response: ApiResponse = {
        success: true,
        message: 'Vehicle created successfully',
        data: vehicle
      };
      res.status(201).json(response);
    } catch (error) {
      await Log('backend', 'error', 'controller', `POST /vehicles - error: ${error instanceof Error ? error.message : 'Unknown error'}`);

      const response: ApiResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create vehicle'
      };
      res.status(500).json(response);
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    await Log('backend', 'info', 'controller', 'GET /vehicles - start');

    try {
      const vehicles = await vehicleService.getAllVehicles();

      await Log('backend', 'info', 'controller', 'GET /vehicles - success');

      const response: ApiResponse = {
        success: true,
        message: 'Vehicles retrieved successfully',
        data: vehicles
      };
      res.status(200).json(response);
    } catch (error) {
      await Log('backend', 'error', 'controller', `GET /vehicles - error: ${error instanceof Error ? error.message : 'Unknown error'}`);

      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve vehicles'
      };
      res.status(500).json(response);
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    await Log('backend', 'info', 'controller', `GET /vehicles/${id} - start`);

    try {
      const vehicle = await vehicleService.getVehicleById(id);

      if (!vehicle) {
        await Log('backend', 'warn', 'controller', `GET /vehicles/${id} - not found`);

        const response: ApiResponse = {
          success: false,
          message: 'Vehicle not found'
        };
        res.status(404).json(response);
        return;
      }

      await Log('backend', 'info', 'controller', `GET /vehicles/${id} - success`);

      const response: ApiResponse = {
        success: true,
        message: 'Vehicle retrieved successfully',
        data: vehicle
      };
      res.status(200).json(response);
    } catch (error) {
      await Log('backend', 'error', 'controller', `GET /vehicles/${id} - error: ${error instanceof Error ? error.message : 'Unknown error'}`);

      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve vehicle'
      };
      res.status(500).json(response);
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    await Log('backend', 'info', 'controller', `PUT /vehicles/${id} - start`);

    try {
      const data: UpdateVehicleDTO = req.body;
      const vehicle = await vehicleService.updateVehicle(id, data);

      if (!vehicle) {
        await Log('backend', 'warn', 'controller', `PUT /vehicles/${id} - not found`);

        const response: ApiResponse = {
          success: false,
          message: 'Vehicle not found'
        };
        res.status(404).json(response);
        return;
      }

      await Log('backend', 'info', 'controller', `PUT /vehicles/${id} - success`);

      const response: ApiResponse = {
        success: true,
        message: 'Vehicle updated successfully',
        data: vehicle
      };
      res.status(200).json(response);
    } catch (error) {
      await Log('backend', 'error', 'controller', `PUT /vehicles/${id} - error: ${error instanceof Error ? error.message : 'Unknown error'}`);

      const response: ApiResponse = {
        success: false,
        message: 'Failed to update vehicle'
      };
      res.status(500).json(response);
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    await Log('backend', 'info', 'controller', `DELETE /vehicles/${id} - start`);

    try {
      const deleted = await vehicleService.deleteVehicle(id);

      if (!deleted) {
        await Log('backend', 'warn', 'controller', `DELETE /vehicles/${id} - not found`);

        const response: ApiResponse = {
          success: false,
          message: 'Vehicle not found'
        };
        res.status(404).json(response);
        return;
      }

      await Log('backend', 'info', 'controller', `DELETE /vehicles/${id} - success`);

      const response: ApiResponse = {
        success: true,
        message: 'Vehicle deleted successfully'
      };
      res.status(200).json(response);
    } catch (error) {
      await Log('backend', 'error', 'controller', `DELETE /vehicles/${id} - error: ${error instanceof Error ? error.message : 'Unknown error'}`);

      const response: ApiResponse = {
        success: false,
        message: 'Failed to delete vehicle'
      };
      res.status(500).json(response);
    }
  }

  async getDue(req: Request, res: Response): Promise<void> {
    await Log('backend', 'info', 'controller', 'GET /due - start');

    try {
      const vehicles = await vehicleService.getDueVehicles();

      await Log('backend', 'info', 'controller', 'GET /due - success');

      const response: ApiResponse = {
        success: true,
        message: 'Due vehicles retrieved successfully',
        data: vehicles
      };
      res.status(200).json(response);
    } catch (error) {
      await Log('backend', 'error', 'controller', `GET /due - error: ${error instanceof Error ? error.message : 'Unknown error'}`);

      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve due vehicles'
      };
      res.status(500).json(response);
    }
  }
}

export const vehicleController = new VehicleController();