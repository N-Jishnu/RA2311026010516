import { v4 as uuidv4 } from 'uuid';
import { MaintenanceLog, CreateMaintenanceDTO } from '../types';
import { maintenanceRepository } from '../repositories/maintenanceRepository';
import { vehicleRepository } from '../repositories/vehicleRepository';
import { Log } from '../utils/logger';

export class MaintenanceService {
  async getMaintenanceByVehicleId(vehicleId: string): Promise<MaintenanceLog[]> {
    await Log('backend', 'info', 'service', `getting maintenance logs for vehicle: ${vehicleId}`);

    const vehicle = await vehicleRepository.findById(vehicleId);
    if (!vehicle) {
      await Log('backend', 'warn', 'service', `vehicle not found for maintenance: ${vehicleId}`);
      return [];
    }

    return await maintenanceRepository.findByVehicleId(vehicleId);
  }

  async createMaintenance(data: CreateMaintenanceDTO): Promise<MaintenanceLog> {
    await Log('backend', 'info', 'service', `creating maintenance log for vehicle: ${data.vehicleId}`);

    const vehicle = await vehicleRepository.findById(data.vehicleId);
    if (!vehicle) {
      await Log('backend', 'error', 'service', `vehicle not found: ${data.vehicleId}`);
      throw new Error('Vehicle not found');
    }

    const log: MaintenanceLog = {
      id: uuidv4(),
      vehicleId: data.vehicleId,
      serviceDate: data.serviceDate,
      notes: data.notes
    };

    const created = await maintenanceRepository.create(log);
    await Log('backend', 'info', 'service', `maintenance log created with id: ${created.id}`);
    return created;
  }
}

export const maintenanceService = new MaintenanceService();