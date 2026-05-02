import { Request, Response, NextFunction } from 'express';
import { Log } from '../utils/logger';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    Log('backend', 'info', 'middleware', `${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });

  next();
}

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  Log('backend', 'error', 'middleware', `Error: ${err.message}`);

  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
}