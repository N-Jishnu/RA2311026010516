import { Vehicle } from '../types';
import { Log } from '../utils/logger';

const vehicles: Map<string, Vehicle> = new Map();

export class VehicleRepository {
  async findAll(): Promise<Vehicle[]> {
    await Log('backend', 'debug', 'repository', 'fetching all vehicles');
    return Array.from(vehicles.values());
  }

  async findById(id: string): Promise<Vehicle | null> {
    await Log('backend', 'debug', 'repository', `fetching vehicle by id: ${id}`);
    return vehicles.get(id) || null;
  }

  async create(vehicle: Vehicle): Promise<Vehicle> {
    await Log('backend', 'debug', 'repository', `creating vehicle: ${vehicle.id}`);
    vehicles.set(vehicle.id, vehicle);
    return vehicle;
  }

  async update(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle | null> {
    await Log('backend', 'debug', 'repository', `updating vehicle: ${id}`);
    const existing = vehicles.get(id);
    if (!existing) return null;

    const updated = { ...existing, ...vehicle };
    vehicles.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    await Log('backend', 'debug', 'repository', `deleting vehicle: ${id}`);
    return vehicles.delete(id);
  }
}

export const vehicleRepository = new VehicleRepository();