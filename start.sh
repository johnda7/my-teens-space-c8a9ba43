#!/bin/bash

echo "🚀 Запуск MyTeens.Space v2.0"
echo "=============================="
echo ""

# Проверка MongoDB
echo "📝 Проверка MongoDB..."
if pgrep -x "mongod" > /dev/null
then
    echo "✅ MongoDB запущен"
else
    echo "⚠️  MongoDB не запущен. Запускаю..."
    sudo systemctl start mongodb 2>/dev/null || brew services start mongodb-community 2>/dev/null
    sleep 2
fi

# Проверка Python зависимостей
echo ""
echo "📦 Проверка Python зависимостей..."
cd backend
if [ ! -d "venv" ]; then
    echo "Создаю виртуальное окружение..."
    python3 -m venv venv
fi

source venv/bin/activate 2>/dev/null || . venv/Scripts/activate 2>/dev/null

if ! python -c "import fastapi" 2>/dev/null; then
    echo "Установка зависимостей..."
    pip install -r requirements.txt -q
fi

echo "✅ Python зависимости готовы"

# Проверка Node зависимостей
echo ""
echo "📦 Проверка Node зависимостей..."
cd ../frontend
if [ ! -d "node_modules" ]; then
    echo "Установка зависимостей..."
    npm install
fi

echo "✅ Node зависимости готовы"

# Запуск backend
echo ""
echo "🔧 Запуск Backend на порту 8000..."
cd ../backend
source venv/bin/activate 2>/dev/null || . venv/Scripts/activate 2>/dev/null
uvicorn server:app --reload --port 8000 > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "✅ Backend запущен (PID: $BACKEND_PID)"

# Ждем запуска backend
echo "⏳ Ожидание запуска backend..."
sleep 3

# Запуск frontend
echo ""
echo "🎨 Запуск Frontend на порту 5173..."
cd ../frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "✅ Frontend запущен (PID: $FRONTEND_PID)"

# Ждем запуска frontend
sleep 3

echo ""
echo "=============================="
echo "✅ Все сервисы запущены!"
echo ""
echo "📍 URLs:"
echo "   Frontend:  http://localhost:5173"
echo "   Backend:   http://localhost:8000"
echo "   API Docs:  http://localhost:8000/docs"
echo ""
echo "👤 Первый запуск:"
echo "   1. Создайте куратора:"
echo "      curl -X POST 'http://localhost:8000/api/auth/create-curator' -H 'Content-Type: application/json' -d '{\"name\":\"Куратор\",\"age\":30}'"
echo ""
echo "   2. Войдите с полученным кодом на http://localhost:5173/login"
echo ""
echo "📊 Логи:"
echo "   Backend:  tail -f backend.log"
echo "   Frontend: tail -f frontend.log"
echo ""
echo "🛑 Остановка: pkill -P $BACKEND_PID && pkill -P $FRONTEND_PID"
echo ""
echo "=============================="

# Сохраняем PID для остановки
echo $BACKEND_PID > .backend.pid
echo $FRONTEND_PID > .frontend.pid

echo "Нажмите Ctrl+C для остановки..."

# Ждем сигнала остановки
trap "echo ''; echo '🛑 Остановка сервисов...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; rm -f .backend.pid .frontend.pid; echo '✅ Сервисы остановлены'; exit" INT TERM

wait
