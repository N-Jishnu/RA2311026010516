# Vehicle Maintenance Scheduler

This backend provides a vehicle maintenance scheduler. It selects the best set of tasks based on available mechanic hours using an optimized algorithm.

## Features

- Knapsack algorithm for optimal task selection
- Logging middleware with external API
- Error handling
- Clean TypeScript structure
- Notification system design included

## Setup

```bash
npm install
npm run dev
```

Create `.env` file with your auth credentials (see `.env.example`).

## API Endpoints

- `GET /schedule/:depotId` - Returns optimal task selection for a depot

Example response:
```json
{
  "selectedTasks": [...],
  "totalImpact": 57,
  "totalDuration": 46
}
```

## Notes

- Uses external evaluation APIs for depot and vehicle data
- Logging is required in all layers
- No console logs used in code