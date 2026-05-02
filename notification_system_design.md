# Notification System Design

## Stage 1: REST APIs

- `GET /notifications` - Fetch notifications
- `POST /notifications` - Create notification
- `PATCH /notifications/:id/read` - Mark as read

Real-time: Use Server-Sent Events (SSE)

## Stage 2: Database Schema

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  student_id VARCHAR(50),
  type VARCHAR(20),
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP
);

CREATE INDEX idx_notifications_student_isread ON notifications (student_id, is_read);
```

## Stage 3: Query Optimization

Slow query:
```sql
SELECT * FROM notifications
WHERE student_id = ? AND is_read = false
ORDER BY created_at DESC;
```

Fix:
```sql
SELECT id, type, message, is_read, created_at
FROM notifications
WHERE student_id = ? AND is_read = false
ORDER BY created_at DESC
LIMIT 20;
```

Add index:
```sql
CREATE INDEX idx_notifications_optimized ON notifications (student_id, is_read, created_at DESC);
```

## Stage 4: Solutions for DB Overload

- Pagination
- Redis caching
- Lazy loading
- Push-based updates (SSE/WebSockets)

## Stage 5: Queue System

1. Save all notifications to DB first
2. Push jobs to queue (Bull)
3. Worker sends emails asynchronously
4. Failed jobs retry automatically

## Stage 6: Priority Notifications

Formula: `score = weight(type) + recency_factor`

Example weights: Placement=3, Result=2, Event=1

Use Min Heap of size N to get top 10 efficiently.