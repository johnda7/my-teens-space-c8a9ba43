# 🚀 Быстрый старт Backend Sync

## ⚡ За 3 минуты

### 1. Настрой Backend

```bash
cd backend

# Создай .env файл
cat > .env << 'EOF'
MONGO_URL=mongodb://localhost:27017
DB_NAME=myteens_space
SECRET_KEY=your-secret-key-here
TELEGRAM_BOT_TOKEN=your-bot-token
PORT=8000
EOF

# Установи зависимости
pip install fastapi uvicorn motor pymongo python-multipart

# Запусти
uvicorn server:app --reload --port 8000
```

### 2. Настрой Frontend

```bash
cd frontend

# Проверь .env (должен быть)
cat .env
# VITE_API_URL=http://localhost:8000/api

# Запусти
npm run dev
```

### 3. Запусти MongoDB

```bash
# Если установлен через brew
brew services start mongodb-community

# Или напрямую
mongod
```

### 4. Тест

Открой http://localhost:3000/my-teens-space-c8a9ba43/

В консоли должно быть:
```
🔄 Инициализация синхронизации для Telegram ID: ...
✅ Прогресс синхронизирован
```

## 📊 Проверка MongoDB

```bash
mongosh
use myteens_space
db.users.find().pretty()
```

## 🐛 Если что-то не работает

### Backend не запускается
```bash
# Проверь порт 8000
lsof -i :8000
# Убей процесс если занят
kill -9 <PID>
```

### MongoDB не подключается
```bash
# Проверь статус
brew services list | grep mongodb
# Перезапусти
brew services restart mongodb-community
```

### Синхронизация не работает
- Открой DevTools → Network → XHR
- Проверь запросы к `/api/sync/progress`
- Смотри ошибки в консоли

## 📖 Полная документация

См. `BACKEND_SYNC_V4.1.md`
