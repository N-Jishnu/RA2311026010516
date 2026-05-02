import express, { Application } from 'express';
import { configure as configureLogger } from '../logging_middleware/src/logger';
import { requestLogger, errorHandler } from './middleware/loggingMiddleware';
import vehicleRoutes from './routes/vehicleRoutes';
import maintenanceRoutes from './routes/maintenanceRoutes';
import { Log } from '../logging_middleware/src/logger';
import dotenv from 'dotenv';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

const authConfig = {
  email: process.env.AUTH_EMAIL || 'user@example.com',
  name: process.env.AUTH_NAME || 'User',
  rollNo: process.env.AUTH_ROLL_NO || '12345',
  accessCode: process.env.AUTH_ACCESS_CODE || 'accesscode',
  clientID: process.env.AUTH_CLIENT_ID || 'clientid',
  clientSecret: process.env.AUTH_CLIENT_SECRET || 'clientsecret'
};

configureLogger(authConfig);

app.use(express.json());
app.use(requestLogger);

Log('backend', 'info', 'middleware', 'Application starting');

app.use('/vehicles', vehicleRoutes);
app.use('/maintenance', maintenanceRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  Log('backend', 'info', 'middleware', `Server running on port ${PORT}`);
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;