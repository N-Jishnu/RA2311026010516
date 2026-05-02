import { v4 as uuidv4 } from 'uuid';
import { Vehicle, CreateVehicleDTO, UpdateVehicleDTO } from '../types';
import { vehicleRepository } from '../repositories/vehicleRepository';
import { maintenanceRepository } from '../repositories/maintenanceRepository';
import { Log } from '../../logging_middleware/src/logger';

export class VehicleService {
  async getAllVehicles(): Promise<Vehicle[]> {
    await Log('backend', 'info', 'service', 'getting all vehicles');
    return await vehicleRepository.findAll();
  }

  async getVehicleById(id: string): Promise<Vehicle | null> {
    await Log('backend', 'info', 'service', `getting vehicle by id: ${id}`);
    const vehicle = await vehicleRepository.findById(id);
    if (!vehicle) {
      await Log('backend', 'warn', 'service', `vehicle not found: ${id}`);
    }
    return vehicle;
  }

  async createVehicle(data: CreateVehicleDTO): Promise<Vehicle> {
    await Log('backend', 'info', 'service', 'creating new vehicle');

    const vehicle: Vehicle = {
      id: uuidv4(),
      name: data.name,
      type: data.type,
      lastServiceDate: data.lastServiceDate,
      serviceIntervalDays: data.serviceIntervalDays
    };

    const created = await vehicleRepository.create(vehicle);
    await Log('backend', 'info', 'service', `vehicle created with id: ${created.id}`);
    return created;
  }

  async updateVehicle(id: string, data: UpdateVehicleDTO): Promise<Vehicle | null> {
    await Log('backend', 'info', 'service', `updating vehicle: ${id}`);

    const existing = await vehicleRepository.findById(id);
    if (!existing) {
      await Log('backend', 'warn', 'service', `vehicle not found for update: ${id}`);
      return null;
    }

    const updated = await vehicleRepository.update(id, data);
    if (updated) {
      await Log('backend', 'info', 'service', `vehicle updated: ${id}`);
    }
    return updated;
  }

  async deleteVehicle(id: string): Promise<boolean> {
    await Log('backend', 'info', 'service', `deleting vehicle: ${id}`);

    const existing = await vehicleRepository.findById(id);
    if (!existing) {
      await Log('backend', 'warn', 'service', `vehicle not found for deletion: ${id}`);
      return false;
    }

    await maintenanceRepository.deleteByVehicleId(id);
    const deleted = await vehicleRepository.delete(id);

    if (deleted) {
      await Log('backend', 'info', 'service', `vehicle deleted: ${id}`);
    }
    return deleted;
  }

  async getDueVehicles(): Promise<Vehicle[]> {
    await Log('backend', 'debug', 'service', 'calculating due vehicles');

    const vehicles = await vehicleRepository.findAll();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueVehicles: Vehicle[] = [];

    for (const vehicle of vehicles) {
      const lastService = new Date(vehicle.lastServiceDate);
      const nextServiceDate = new Date(lastService);
      nextServiceDate.setDate(nextServiceDate.getDate() + vehicle.serviceIntervalDays);
      nextServiceDate.setHours(0, 0, 0, 0);

      if (today >= nextServiceDate) {
        dueVehicles.push(vehicle);
      }
    }

    await Log('backend', 'info', 'service', `found ${dueVehicles.length} vehicles due for service`);
    return dueVehicles;
  }
}

export const vehicleService = new VehicleService();