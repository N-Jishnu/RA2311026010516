# Vehicle Maintenance Scheduler API

A production-ready backend system with logging middleware and vehicle maintenance scheduling API.

## Project Structure

```
vehicle_maintainance_scheduler/
├── src/
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── repositories/    # Data access
│   ├── routes/          # API routes
│   ├── middleware/      # Express middleware
│   ├── types/           # TypeScript types
│   └── app.ts           # Main application
├── .env.example
├── package.json
└── tsconfig.json

logging_middleware/
├── src/
│   ├── logger.ts        # Logging implementation
│   ├── types.ts         # Type definitions
│   └── index.ts         # Module exports
├── package.json
└── tsconfig.json
```

## Setup Steps

1. **Install dependencies:**
   ```bash
   cd vehicle_maintainance_scheduler
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Build the project:**
   ```bash
   npm run build
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

## API Endpoints

### Vehicles

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /vehicles | Create a new vehicle |
| GET | /vehicles | List all vehicles |
| GET | /vehicles/:id | Get single vehicle |
| PUT | /vehicles/:id | Update vehicle |
| DELETE | /vehicles/:id | Delete vehicle |

### Maintenance

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /maintenance | Add maintenance record |
| GET | /maintenance/:vehicleId | Get maintenance history |

### Service Due

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /vehicles/due | Get vehicles due for service |

## Sample Requests

### Create Vehicle
```json
POST /vehicles
{
  "name": "Toyota Camry",
  "type": "car",
  "lastServiceDate": "2024-01-01",
  "serviceIntervalDays": 90
}
```

### Get All Vehicles
```
GET /vehicles
```

### Add Maintenance Record
```json
POST /maintenance
{
  "vehicleId": "uuid-here",
  "serviceDate": "2024-04-01",
  "notes": "Oil change and tire rotation"
}
```

### Get Vehicles Due for Service
```
GET /vehicles/due
```

## Response Format

### Success
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "message": "Error message"
}
```

## Logging

The system uses a centralized logging middleware that sends logs to an external test server. All API requests, controller actions, and errors are logged automatically.

Log parameters:
- stack: "backend" or "frontend"
- level: "debug", "info", "warn", "error", "fatal"
- package: "route", "controller", "service", "repository", etc.