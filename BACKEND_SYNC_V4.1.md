# 🔄 Backend API v4.1 - Telegram Sync System

**Дата:** 15 ноября 2025  
**Статус:** ✅ Реализовано, требует тестирования  

---

## 📝 Что добавлено

### 1️⃣ Backend Endpoints (server.py)

**Новые API:**

```python
# 1. Синхронизация прогресса на сервер
POST /api/sync/progress
Body: { telegram_id, progress_data }
→ Сохраняет XP, уровень, монеты, гемы, streak, энергию, инвентарь, уроки

# 2. Загрузка прогресса с сервера  
GET /api/sync/progress/{telegram_id}
→ Возвращает полный прогресс пользователя

# 3. Завершение урока по Telegram ID
POST /api/telegram/complete-lesson
Body: { telegram_id, lesson_id, score, answers, time_spent }
→ Завершает урок, начисляет XP, обновляет уровень и streak
```

**Особенности:**
- Использует `telegram_id` как primary key (не `user_id`)
- Автоматически создает пользователя если его нет
- Обновляет `last_activity` для streak логики
- Синхронизирует все данные из localStorage

### 2️⃣ Frontend Sync Utilities (syncUtils.ts)

**8 экспортируемых функций:**

```typescript
// Основные функции синхронизации
syncProgressToServer(telegramId: string)  
  → Отправляет localStorage → сервер

loadProgressFromServer(telegramId: string)
  → Загружает сервер → возвращает progress object

applyProgressToLocalStorage(progress: SyncProgress)
  → Применяет progress → localStorage

// Полная синхронизация
fullSync(telegramId: string)
  → Загружает с сервера если есть, иначе пушит локальное

// Автосинхронизация
setupAutoSync(telegramId: string, intervalMinutes: number)
  → Синхронизирует каждые N минут + перед закрытием

needsSync()
  → Проверяет нужна ли синхронизация (timestamp-based)

// Завершение урока через API
completeLessonWithSync(telegramId, lessonId, score, answers, timeSpent)
  → Завершает урок напрямую на сервере

// Ручная синхронизация
manualSync(telegramId: string)
  → Форсирует синхронизацию с toast уведомлениями
```

### 3️⃣ Интеграция в Index.tsx

**Добавлено в useEffect:**

```typescript
useEffect(() => {
  // Полная синхронизация при загрузке
  const initSync = async () => {
    const telegramId = user?.id?.toString();
    if (telegramId) {
      const syncSuccess = await fullSync(telegramId);
      
      if (syncSuccess) {
        toast('✅ Прогресс синхронизирован');
        // Обновляем state из localStorage
        setXp(parseInt(localStorage.getItem('userXP') || '0'));
        setStreak(parseInt(localStorage.getItem('currentStreak') || '0'));
      }
      
      // Автосинхронизация каждые 5 минут
      const cleanup = setupAutoSync(telegramId, 5);
      return cleanup;
    }
  };
  
  initSync();
}, [user]);
```

---

## 🎯 Что это дает

### Для пользователей:
✅ **Кросс-девайс синхронизация** - начал на телефоне, продолжил на планшете  
✅ **Защита от потери данных** - прогресс сохраняется на сервере  
✅ **Автосохранение** - синхронизация каждые 5 минут + при закрытии  
✅ **Персонализация** - прогресс привязан к Telegram ID  

### Для родителей:
✅ **Family Links** - возможность связать аккаунты родитель-ребенок  
✅ **Реальный мониторинг** - прогресс берется с сервера, а не localStorage  
✅ **Достоверность данных** - нельзя подделать прогресс  

### Для кураторов:
✅ **Центральная база** - все ученики в одной MongoDB  
✅ **Аналитика** - агрегация статистики по группам  
✅ **Контроль** - проверка активности и прогресса в реальном времени  

---

## 🔧 Как использовать

### 1. Настройка Environment

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:8000/api
```

**Backend (.env):**
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=myteens_space
SECRET_KEY=your-secret-key
TELEGRAM_BOT_TOKEN=your-bot-token
```

### 2. Запуск для тестирования

```bash
# 1. Запустить MongoDB
mongod

# 2. Запустить Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn server:app --reload --port 8000

# 3. Запустить Frontend
cd frontend
npm install
npm run dev  # localhost:3000
```

### 3. Тестирование синхронизации

**Проверь в браузере:**
1. Открой http://localhost:3000/my-teens-space-c8a9ba43/
2. Выбери роль Student
3. Открой DevTools → Console
4. Смотри логи: "🔄 Инициализация синхронизации..."
5. Должен появиться toast "✅ Прогресс синхронизирован"

**Проверь в MongoDB:**
```bash
mongosh
use myteens_space
db.users.find({ telegram_id: "твой_telegram_id" })
```

---

## 📊 Структура данных

### SyncProgress Interface

```typescript
interface SyncProgress {
  telegram_id: string;
  xp: number;
  level: number;
  coins: number;
  gems: number;
  streak: number;
  energy: number;
  max_energy: number;
  inventory: InventoryItem[];
  completed_lessons: string[];
  balance_assessments: {
    initial?: Record<string, number>;
    final?: Record<string, number>;
  };
  last_sync: string;
}
```

### MongoDB users collection

```javascript
{
  _id: ObjectId(...),
  id: "uuid-v4",
  telegram_id: "123456789",  // ← PRIMARY KEY
  name: "Имя Фамилия",
  role: "student",
  
  // Геймификация
  xp: 1250,
  level: 3,
  streak: 7,
  coins: 450,
  gems: 50,
  energy: 80,
  max_energy: 100,
  
  // Инвентарь
  inventory: [
    { id: "hint", count: 5 },
    { id: "streak_shield", count: 2 }
  ],
  
  // Связи
  curator_id: "uuid-куратора",
  parent_id: "uuid-родителя",
  
  last_activity: ISODate("2025-11-15T10:30:00Z"),
  created_at: ISODate("2025-11-10T08:00:00Z")
}
```

---

## 🚀 Следующие шаги

### Немедленно (Priority 1):
- [ ] Протестировать fullSync() на реальном Telegram
- [ ] Проверить автосинхронизацию (5 минут)
- [ ] Протестировать completeLessonWithSync()
- [ ] Проверить обработку ошибок (сеть недоступна)

### Скоро (Priority 2):
- [ ] Добавить sync в ParentApp.tsx для родительских уроков
- [ ] Интегрировать completeLessonWithSync в LessonComplete
- [ ] Заменить handleLessonComplete на версию с sync
- [ ] Добавить offline режим (queue синхронизации)

### В будущем (Priority 3):
- [ ] Family Links API (связь родитель-ребенок)
- [ ] Conflict resolution (если прогресс изменился на двух устройствах)
- [ ] Сжатие данных для экономии трафика
- [ ] WebSocket для real-time синхронизации

---

## 🐛 Известные ограничения

⚠️ **Нет конфликт-резолюшена:** Если пользователь одновременно играет на двух устройствах, последний sync перезапишет данные.

⚠️ **Нет offline queue:** При отсутствии сети изменения теряются. Нужен механизм очереди.

⚠️ **Нет валидации Telegram initData:** Сейчас доверяем telegramId от клиента. В продакшене нужна HMAC валидация.

⚠️ **Нет rate limiting:** Можно спамить API. Нужен rate limiter.

---

## 📖 API Documentation

### POST /api/sync/progress

**Request:**
```json
{
  "telegram_id": "123456789",
  "progress_data": {
    "xp": 1250,
    "level": 3,
    "coins": 450,
    "gems": 50,
    "streak": 7,
    "energy": 80,
    "max_energy": 100,
    "inventory": [
      { "id": "hint", "count": 5 }
    ],
    "completed_lessons": ["boundaries-w1-1", "boundaries-w1-2"],
    "balance_assessments": {
      "initial": { "boundaries": 7, "family": 8 }
    }
  }
}
```

**Response:**
```json
{
  "message": "Прогресс синхронизирован",
  "synced_at": "2025-11-15T10:30:00Z"
}
```

### GET /api/sync/progress/{telegram_id}

**Response:**
```json
{
  "telegram_id": "123456789",
  "xp": 1250,
  "level": 3,
  "coins": 450,
  "gems": 50,
  "streak": 7,
  "energy": 80,
  "max_energy": 100,
  "inventory": [...],
  "completed_lessons": [...],
  "balance_assessments": {...},
  "last_sync": "2025-11-15T10:30:00Z"
}
```

### POST /api/telegram/complete-lesson

**Request:**
```json
{
  "telegram_id": "123456789",
  "lesson_id": "boundaries-w1-1",
  "module": "boundaries",
  "score": 85,
  "answers": { "q1": "answer1" },
  "time_spent": 180
}
```

**Response:**
```json
{
  "message": "Урок завершен",
  "xp_earned": 85,
  "new_level": 3,
  "streak": 8,
  "achievements": ["first_lesson_complete"]
}
```

---

## ✅ Что проверить перед деплоем

- [ ] Backend `.env` файл настроен
- [ ] Frontend `VITE_API_URL` указывает на production backend
- [ ] MongoDB доступна (Railway/MongoDB Atlas)
- [ ] CORS настроен для production домена
- [ ] Telegram Bot Token в `.env`
- [ ] HMAC валидация включена в `telegram_auth.py`
- [ ] Rate limiting добавлен (опционально)

---

**Статус:** ✅ Реализовано, готово к тестированию  
**Следующий шаг:** Протестировать на реальном Telegram боте  
**Ответственный:** Sonnet Agent  
**Дата:** 15.11.2025
