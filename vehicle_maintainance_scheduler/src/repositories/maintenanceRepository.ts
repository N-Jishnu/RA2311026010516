import { MaintenanceLog } from '../types';
import { Log } from '../utils/logger';

const maintenanceLogs: Map<string, MaintenanceLog> = new Map();

export class MaintenanceRepository {
  async findByVehicleId(vehicleId: string): Promise<MaintenanceLog[]> {
    await Log('backend', 'debug', 'repository', `fetching maintenance logs for vehicle: ${vehicleId}`);
    return Array.from(maintenanceLogs.values()).filter(log => log.vehicleId === vehicleId);
  }

  async create(log: MaintenanceLog): Promise<MaintenanceLog> {
    await Log('backend', 'debug', 'repository', `creating maintenance log: ${log.id}`);
    maintenanceLogs.set(log.id, log);
    return log;
  }

  async deleteByVehicleId(vehicleId: string): Promise<number> {
    await Log('backend', 'debug', 'repository', `deleting maintenance logs for vehicle: ${vehicleId}`);
    let count = 0;
    for (const [id, log] of maintenanceLogs.entries()) {
      if (log.vehicleId === vehicleId) {
        maintenanceLogs.delete(id);
        count++;
      }
    }
    return count;
  }
}

export const maintenanceRepository = new MaintenanceRepository();