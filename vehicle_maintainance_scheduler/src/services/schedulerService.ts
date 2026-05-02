import { Log } from '../utils/logger';

export interface Depot {
  depotId: string;
  totalMechanicHours: number;
}

export interface VehicleTask {
  TaskID: string;
  Duration: number;
  Impact: number;
}

export interface ScheduleResult {
  selectedTasks: VehicleTask[];
  totalImpact: number;
  totalDuration: number;
  executionTimeMs?: number;
}

export class SchedulerService {
  private tokenCache: { token: string; expiresAt: number } | null = null;

  async getValidToken(): Promise<string | null> {
    await Log('backend', 'debug', 'service', 'getting valid token');

    if (this.tokenCache && Date.now() < this.tokenCache.expiresAt) {
      return this.tokenCache.token;
    }

    const authConfig = {
      email: process.env.AUTH_EMAIL || 'user@example.com',
      name: process.env.AUTH_NAME || 'User',
      rollNo: process.env.AUTH_ROLL_NO || '12345',
      accessCode: process.env.AUTH_ACCESS_CODE || 'accesscode',
      clientID: process.env.AUTH_CLIENT_ID || 'clientid',
      clientSecret: process.env.AUTH_CLIENT_SECRET || 'clientsecret'
    };

    try {
      const response = await fetch('http://20.207.122.201/evaluation-service/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authConfig),
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        await Log('backend', 'error', 'service', 'auth request failed');
        return null;
      }

      const data = await response.json() as { access_token?: string; expires_in?: number };
      if (!data.access_token) {
        await Log('backend', 'error', 'service', 'no token in response');
        return null;
      }

      const expiresAt = data.expires_in && data.expires_in > 1000000000000
        ? data.expires_in
        : Date.now() + (data.expires_in || 3600) * 1000;

      this.tokenCache = { token: data.access_token, expiresAt };
      await Log('backend', 'info', 'service', 'token refreshed successfully');
      return this.tokenCache.token;
    } catch (error) {
      await Log('backend', 'error', 'service', `token fetch error: ${error instanceof Error ? error.message : 'Unknown'}`);
      return null;
    }
  }

  async getDepotHours(depotId: string): Promise<number> {
    await Log('backend', 'info', 'service', `fetching depot hours for: ${depotId}`);
    await Log('backend', 'debug', 'service', 'GET /depots API - start');

    const token = await this.getValidToken();
    if (!token) {
      await Log('backend', 'error', 'service', 'no token available for depot fetch');
      throw new Error('Authentication failed');
    }

    try {
      const response = await fetch('http://20.207.122.201/evaluation-service/depots', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        await Log('backend', 'error', 'service', 'depot API request failed');
        throw new Error('Failed to fetch depot data');
      }

      const data = await response.json() as { depots?: any[] };
      const depots = data.depots || [];

      const normalizedId = depotId.replace('DEPOT', '');
      const depotIdNum = Number(normalizedId);

      await Log('backend', 'debug', 'service', `incoming depotId=${depotId}, normalized=${depotIdNum}`);

      const depot = depots.find((d: any) => d.ID === depotIdNum);

      await Log('backend', 'debug', 'service', `matched depot=${depot?.ID}`);

      await Log('backend', 'info', 'service', `depot API success - found ${depots.length} depots`);

      if (!depot) {
        await Log('backend', 'warn', 'service', `depot not found: ${depotId}`);
        throw new Error('Depot not found');
      }

      const hours = depot.MechanicHours;
      if (!hours || hours <= 0) {
        throw new Error('Invalid mechanic hours');
      }

      await Log('backend', 'info', 'service', `depot hours: ${hours}`);
      return hours;
    } catch (error) {
      await Log('backend', 'error', 'service', `depot fetch error: ${error instanceof Error ? error.message : 'Unknown'}`);
      throw error;
    }
  }

  async getAllTasks(): Promise<VehicleTask[]> {
    await Log('backend', 'info', 'service', 'fetching all vehicle tasks');
    await Log('backend', 'debug', 'service', 'GET /vehicles API - start');

    const token = await this.getValidToken();
    if (!token) {
      await Log('backend', 'error', 'service', 'no token available for tasks fetch');
      throw new Error('Authentication failed');
    }

    try {
      const response = await fetch('http://20.207.122.201/evaluation-service/vehicles', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        await Log('backend', 'error', 'service', 'vehicles API request failed');
        throw new Error('Failed to fetch vehicle tasks');
      }

      const data = await response.json() as { vehicles?: VehicleTask[] };
      const tasks = data?.vehicles || [];

      if (!Array.isArray(tasks) || tasks.length === 0) {
        throw new Error('No tasks available');
      }

      const normalizedTasks = tasks.map((task) => ({
        TaskID: String(task.TaskID || ''),
        Duration: Number(task.Duration),
        Impact: Number(task.Impact)
      })).filter((task) => {
        return Boolean(task.TaskID) && Number.isFinite(task.Duration) && Number.isFinite(task.Impact);
      });

      if (normalizedTasks.length === 0) {
        throw new Error('No valid tasks available');
      }

      await Log('backend', 'info', 'service', `vehicles API success - found ${normalizedTasks.length} valid tasks`);
      return normalizedTasks;
    } catch (error) {
      await Log('backend', 'error', 'service', `vehicles fetch error: ${error instanceof Error ? error.message : 'Unknown'}`);
      throw error;
    }
  }

  async solveKnapsack(tasks: VehicleTask[], capacity: number): Promise<ScheduleResult> {
    if (!capacity || capacity <= 0) {
      throw new Error('Invalid hours');
    }
    if (!Array.isArray(tasks) || tasks.length === 0) {
      throw new Error('No tasks');
    }

    await Log('backend', 'info', 'service', 'knapsack started');

    const n = tasks.length;
    const dp = new Array(capacity + 1).fill(0);

    const keep: boolean[][] = Array.from({ length: n }, () =>
      new Array(capacity + 1).fill(false)
    );

    for (let i = 0; i < n; i++) {
      const duration = tasks[i].Duration;
      const impact = tasks[i].Impact;

      for (let j = capacity; j >= duration; j--) {
        if (dp[j] < dp[j - duration] + impact) {
          dp[j] = dp[j - duration] + impact;
          keep[i][j] = true;
        }
      }
    }

    let bestImpact = 0;
    let bestCapacity = 0;
    for (let j = 0; j <= capacity; j++) {
      if (dp[j] > bestImpact) {
        bestImpact = dp[j];
        bestCapacity = j;
      }
    }

    let j = bestCapacity;
    const selectedTasks: VehicleTask[] = [];

    for (let i = n - 1; i >= 0; i--) {
      if (keep[i][j]) {
        selectedTasks.push(tasks[i]);
        j -= tasks[i].Duration;
      }
    }

    const totalImpact = bestImpact;
    const totalDuration = selectedTasks.reduce((sum, t) => sum + t.Duration, 0);

    if (totalDuration > capacity) {
      throw new Error('Constraint violated');
    }

    if (selectedTasks.length === 0) {
      throw new Error('No valid tasks selected');
    }

    await Log('backend', 'info', 'service', 'knapsack completed');

    return {
      selectedTasks,
      totalImpact,
      totalDuration
    };
  }

  async getSchedule(depotId: string): Promise<ScheduleResult> {
    await Log('backend', 'info', 'route', `GET /schedule/${depotId} - start`);

    try {
      if (!depotId || depotId.trim() === '') {
        throw new Error('Invalid depot ID');
      }

      const hours = await this.getDepotHours(depotId);

      if (!hours || hours <= 0) {
        throw new Error('Invalid hours');
      }

      const tasks = await this.getAllTasks();

      await Log('backend', 'debug', 'service', `tasks=${tasks.length}`);
      await Log('backend', 'debug', 'service', `hours=${hours}`);

      await Log('backend', 'debug', 'service', 'knapsack computation start');

      const result = await this.solveKnapsack(tasks, hours);

      await Log('backend', 'debug', 'service', `impact=${result.totalImpact}`);

      await Log('backend', 'info', 'service', `schedule computed - ${result.selectedTasks.length} tasks selected`);

      return result;
    } catch (error) {
      await Log('backend', 'error', 'service', `schedule computation failed: ${error instanceof Error ? error.message : 'Unknown'}`);
      throw error;
    }
  }
}

export const schedulerService = new SchedulerService();