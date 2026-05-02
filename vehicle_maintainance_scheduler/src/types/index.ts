export interface Vehicle {
  id: string;
  name: string;
  type: string;
  lastServiceDate: string;
  serviceIntervalDays: number;
}

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  serviceDate: string;
  notes: string;
}

export interface CreateVehicleDTO {
  name: string;
  type: string;
  lastServiceDate: string;
  serviceIntervalDays: number;
}

export interface UpdateVehicleDTO {
  name?: string;
  type?: string;
  lastServiceDate?: string;
  serviceIntervalDays?: number;
}

export interface CreateMaintenanceDTO {
  vehicleId: string;
  serviceDate: string;
  notes: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export interface AuthConfig {
  email: string;
  name: string;
  rollNo: string;
  accessCode: string;
  clientID: string;
  clientSecret: string;
}