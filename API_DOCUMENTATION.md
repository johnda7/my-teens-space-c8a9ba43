# 🔌 MyTeens.Space API Documentation

## Base URL
```
Production: https://your-domain.com/api
Development: http://localhost:8001/api
```

---

## 📌 Table of Contents
- [Authentication](#authentication)
- [Users](#users)
- [Balance Assessment](#balance-assessment)
- [Lesson Progress](#lesson-progress)
- [Check-in](#check-in)
- [Error Handling](#error-handling)

---

## 🔐 Authentication

Currently no authentication required. Future versions will include:
- JWT tokens
- Telegram authentication
- Session management

---

## 👤 Users

### Create User
**POST** `/api/users`

Создает нового пользователя или возвращает существующего.

**Request Body:**
```json
{
  "user_id": "telegram_123456",
  "name": "Анна Иванова",
  "age": 15,
  "telegram_id": "123456"
}
```

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "telegram_123456",
  "name": "Анна Иванова",
  "age": 15,
  "telegram_id": "123456",
  "created_at": "2024-11-09T12:00:00Z",
  "xp": 0,
  "level": 1,
  "streak": 0,
  "last_activity": "2024-11-09T12:00:00Z"
}
```

---

### Get User
**GET** `/api/users/{user_id}`

Получает данные пользователя.

**Parameters:**
- `user_id` (path): ID пользователя

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "telegram_123456",
  "name": "Анна Иванова",
  "age": 15,
  "xp": 450,
  "level": 3,
  "streak": 7,
  "last_activity": "2024-11-09T12:00:00Z"
}
```

**Error:** `404 Not Found`
```json
{
  "detail": "User not found"
}
```

---

## ⚖️ Balance Assessment

### Save Assessment
**POST** `/api/balance-assessment`

Сохраняет оценку колеса баланса.

**Request Body:**
```json
{
  "id": "assessment-uuid",
  "user_id": "telegram_123456",
  "type": "initial",
  "scores": {
    "personal_boundaries": 7,
    "relationship_parents": 6,
    "relationship_friends": 8,
    "self_confidence": 5,
    "emotions": 6,
    "school_study": 7,
    "hobbies": 8,
    "health": 7
  },
  "answers": {
    "pb-1": "7",
    "pb-2": "6",
    "pb-3": "8",
    "...": "..."
  },
  "timestamp": "2024-11-09T12:00:00Z"
}
```

**Response:** `200 OK`
```json
{
  "id": "assessment-uuid",
  "user_id": "telegram_123456",
  "type": "initial",
  "scores": {...},
  "answers": {...},
  "timestamp": "2024-11-09T12:00:00Z"
}
```

---

### Get All Assessments
**GET** `/api/balance-assessment/{user_id}`

Получает все оценки пользователя.

**Parameters:**
- `user_id` (path): ID пользователя

**Response:** `200 OK`
```json
[
  {
    "id": "assessment-1",
    "user_id": "telegram_123456",
    "type": "initial",
    "scores": {...},
    "timestamp": "2024-11-01T12:00:00Z"
  },
  {
    "id": "assessment-2",
    "user_id": "telegram_123456",
    "type": "final",
    "scores": {...},
    "timestamp": "2024-11-09T12:00:00Z"
  }
]
```

---

### Get Latest Assessment
**GET** `/api/balance-assessment/{user_id}/latest`

Получает последнюю оценку пользователя.

**Parameters:**
- `user_id` (path): ID пользователя
- `type` (query, optional): Фильтр по типу ("initial" или "final")

**Response:** `200 OK`
```json
{
  "id": "assessment-uuid",
  "user_id": "telegram_123456",
  "type": "final",
  "scores": {
    "personal_boundaries": 9,
    "relationship_parents": 8,
    "relationship_friends": 9,
    "self_confidence": 8,
    "emotions": 8,
    "school_study": 8,
    "hobbies": 9,
    "health": 8
  },
  "timestamp": "2024-11-09T12:00:00Z"
}
```

---

## 📚 Lesson Progress

### Save Progress
**POST** `/api/lesson-progress`

Сохраняет прогресс урока.

**Request Body:**
```json
{
  "id": "progress-uuid",
  "user_id": "telegram_123456",
  "lesson_id": "boundaries-w1-1",
  "module": "boundaries",
  "completed": true,
  "xp_earned": 50,
  "answers": {
    "b1-1-q1": "Правила, которые защищают мое пространство",
    "b1-1-q2": "😔",
    "b1-1-q3": "Мне неудобно, когда..."
  },
  "completed_at": "2024-11-09T12:30:00Z"
}
```

**Response:** `200 OK`
```json
{
  "id": "progress-uuid",
  "user_id": "telegram_123456",
  "lesson_id": "boundaries-w1-1",
  "module": "boundaries",
  "completed": true,
  "xp_earned": 50,
  "completed_at": "2024-11-09T12:30:00Z"
}
```

**Side Effects:**
- Обновляет XP пользователя (+50)
- Обновляет last_activity

---

### Get Progress
**GET** `/api/lesson-progress/{user_id}`

Получает весь прогресс пользователя.

**Parameters:**
- `user_id` (path): ID пользователя

**Response:** `200 OK`
```json
[
  {
    "id": "progress-1",
    "user_id": "telegram_123456",
    "lesson_id": "boundaries-w1-1",
    "module": "boundaries",
    "completed": true,
    "xp_earned": 50,
    "completed_at": "2024-11-09T12:30:00Z"
  },
  {
    "id": "progress-2",
    "user_id": "telegram_123456",
    "lesson_id": "boundaries-w1-2",
    "module": "boundaries",
    "completed": false,
    "xp_earned": 0
  }
]
```

---

### Get User Stats
**GET** `/api/lesson-progress/{user_id}/stats`

Получает статистику прогресса пользователя.

**Parameters:**
- `user_id` (path): ID пользователя

**Response:** `200 OK`
```json
{
  "total_lessons": 15,
  "completed_lessons": 8,
  "modules": {
    "boundaries": {
      "total": 12,
      "completed": 5,
      "progress": 41.67
    },
    "confidence": {
      "total": 12,
      "completed": 3,
      "progress": 25.0
    },
    "emotions": {
      "total": 10,
      "completed": 0,
      "progress": 0
    },
    "relationships": {
      "total": 10,
      "completed": 0,
      "progress": 0
    }
  }
}
```

---

## 📅 Check-in

### Save Check-in
**POST** `/api/checkin`

Сохраняет ежедневный чек-ин.

**Request Body:**
```json
{
  "id": "checkin-uuid",
  "user_id": "telegram_123456",
  "mood": "😊",
  "anxiety_level": 3,
  "sleep_hours": 8.5,
  "notes": "Сегодня хороший день!",
  "timestamp": "2024-11-09T08:00:00Z"
}
```

**Response:** `200 OK`
```json
{
  "id": "checkin-uuid",
  "user_id": "telegram_123456",
  "mood": "😊",
  "anxiety_level": 3,
  "sleep_hours": 8.5,
  "notes": "Сегодня хороший день!",
  "timestamp": "2024-11-09T08:00:00Z"
}
```

**Side Effects:**
- Обновляет last_activity пользователя

---

### Get Check-ins
**GET** `/api/checkin/{user_id}`

Получает историю чек-инов.

**Parameters:**
- `user_id` (path): ID пользователя
- `limit` (query, optional): Количество записей (default: 30)

**Response:** `200 OK`
```json
[
  {
    "id": "checkin-1",
    "user_id": "telegram_123456",
    "mood": "😊",
    "anxiety_level": 3,
    "sleep_hours": 8.5,
    "notes": "Сегодня хороший день!",
    "timestamp": "2024-11-09T08:00:00Z"
  },
  {
    "id": "checkin-2",
    "user_id": "telegram_123456",
    "mood": "😐",
    "anxiety_level": 5,
    "sleep_hours": 6.0,
    "notes": "Немного устал",
    "timestamp": "2024-11-08T08:00:00Z"
  }
]
```

---

## ⚠️ Error Handling

### Standard Error Response
```json
{
  "detail": "Error message description"
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Success |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 404 | Not Found - Resource not found |
| 422 | Validation Error - Pydantic validation failed |
| 500 | Internal Server Error |

### Validation Error Example
**422 Unprocessable Entity**
```json
{
  "detail": [
    {
      "loc": ["body", "age"],
      "msg": "value is not a valid integer",
      "type": "type_error.integer"
    }
  ]
}
```

---

## 📊 Data Models

### User Model
```typescript
{
  id: string (uuid)
  user_id: string
  name: string
  age: number
  telegram_id?: string
  created_at: datetime
  xp: number
  level: number
  streak: number
  last_activity: datetime
}
```

### Balance Assessment Model
```typescript
{
  id: string (uuid)
  user_id: string
  type: "initial" | "final"
  scores: {
    [category_id: string]: number (1-10)
  }
  answers: {
    [question_id: string]: string
  }
  timestamp: datetime
}
```

### Lesson Progress Model
```typescript
{
  id: string (uuid)
  user_id: string
  lesson_id: string
  module: string
  completed: boolean
  xp_earned: number
  answers: object
  completed_at?: datetime
}
```

### Check-in Model
```typescript
{
  id: string (uuid)
  user_id: string
  mood: string (emoji)
  anxiety_level: number (0-10)
  sleep_hours: number
  notes: string
  timestamp: datetime
}
```

---

## 🔍 Testing

### Using cURL

**Create User:**
```bash
curl -X POST http://localhost:8001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user",
    "name": "Test User",
    "age": 15
  }'
```

**Get User:**
```bash
curl http://localhost:8001/api/users/test_user
```

**Save Balance Assessment:**
```bash
curl -X POST http://localhost:8001/api/balance-assessment \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user",
    "type": "initial",
    "scores": {
      "personal_boundaries": 7,
      "relationship_parents": 6
    },
    "answers": {}
  }'
```

---

## 📝 Notes

- Все ID используют UUID v4
- Timestamps в ISO 8601 format (UTC)
- MongoDB ObjectID не используется для упрощения
- Все эндпоинты возвращают JSON
- CORS настроен для всех origins (production: настроить)

---

## 🚀 Future Enhancements

1. **Authentication**
   - JWT tokens
   - Telegram OAuth
   - Session management

2. **Rate Limiting**
   - Защита от спама
   - Per-user limits

3. **Webhooks**
   - Events для родительского кабинета
   - Notifications

4. **Analytics**
   - Aggregate statistics
   - Trends API

---

*API Version: 1.0.0*  
*Last Updated: 09.11.2024*
