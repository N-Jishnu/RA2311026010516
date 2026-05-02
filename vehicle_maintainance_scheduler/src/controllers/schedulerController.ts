import { Request, Response } from 'express';
import { schedulerService } from '../services/schedulerService';
import { ApiResponse } from '../types';
import { Log } from '../utils/logger';

export class SchedulerController {
  async getSchedule(req: Request, res: Response): Promise<void> {
    const { depotId } = req.params;
    await Log('backend', 'info', 'controller', `GET /schedule/${depotId} - start`);

    try {
      const result = await schedulerService.getSchedule(depotId);

      await Log('backend', 'info', 'controller', `GET /schedule/${depotId} - success`);

      const response: ApiResponse = {
        success: true,
        message: 'Schedule computed successfully',
        data: result
      };
      res.status(200).json(response);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to compute schedule';

      await Log('backend', 'error', 'controller', `GET /schedule/${depotId} - error: ${errorMessage}`);

      const response: ApiResponse = {
        success: false,
        message: errorMessage
      };
      res.status(500).json(response);
    }
  }
}

export const schedulerController = new SchedulerController();