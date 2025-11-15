# MyTeens.Space - AI Coding Agent Instructions

## 🎯 Project Overview

Educational **Telegram Mini App** for teenagers (12-17 years) focused on emotional intelligence, healthy boundaries, and relationships. Features virtual psychologist "Katya Karpenko" with gamification (XP, levels, streaks).

**Critical Context:** This is a Telegram WebApp, not a standard web application. All UI must work within Telegram's WebView.

## 🏗️ Architecture

**Monorepo structure:**
- `backend/` - FastAPI (Python 3.10+) with MongoDB (Motor async driver)
- `frontend/` - React 18.3 + TypeScript + Vite, shadcn/ui components, **Telegram WebApp SDK** (`@twa-dev/sdk`)
- **4 user roles:** `student`, `parent`, `parent_learning`, `curator` (enum in `backend/models.py`)

## 🤖 Workflow для AI-агентов (КРИТИЧНО!)

**Два агента работают в связке:**

```
OPUS 4.1 (Архитектор) → проектирует контент, UI, структуру API
       ↓ передает дизайн-документы
SONNET 4.0 (Имплементатор) → создает файлы, пишет код
```

**Правила:**
- **OPUS** проектирует (уроки, архитектуру, UI-спеки) - НЕ МОЖЕТ создавать файлы
- **SONNET** реализует по дизайну Opus - МОЖЕТ создавать файлы через tools
- **Читайте `OPUS-SONNET-ROADMAP.md`** перед началом работы
- **Читайте `OPUS_TASK.md`** для текущих заданий
- **Читайте `AGENTS.md`** (1200+ строк) для полной документации
- **Читайте `CURRENT_STATE.md`** для статуса проекта

### Система из трех дашбордов

1. **Дашборд студента** (`/`, `pages/Index.tsx`) - Основной интерфейс обучения
   - **ОБНОВЛЕНО 15.11.2025:** Новая структура с нижними табами (learning/checkin/chat/group/profile)
   - Навигация через `renderActiveTab()` → вызывает отдельные render-функции для каждой вкладки
   - **Вкладка "Учёба" (`renderLearningTab()`):**
     - Приветствие + краткая статистика (стрик, уровень, XP, текущий модуль)
     - Быстрые действия: кнопки "Начать урок дня" и "Стартовый тест баланса"
     - Grid с 4 модулями (Границы, Уверенность, Эмоции, Отношения)
     - Превью колеса баланса (если есть initialScores)
   - **Модальные overlays (z-index 50):**
     - `BalanceAssessment` - колесо баланса (initial/final)
     - `ModuleRoom` - комната модуля с уроками недели
     - `EnhancedLessonInterface` - интерфейс урока
     - `LessonComplete` - экран завершения урока
   - Уроки из `COMPLETE_LESSONS` в `data/allLessonsData.ts` (44 урока)
   - **Критично:** Все модальные компоненты рендерятся условно через `showBalanceWheel`, `currentModule`, `currentLesson`, `showCompletion`

2. **Дашборд родителя** (`/parent`, `pages/ParentDashboard.tsx`) - Мониторинг ребенка
   - Получает прогресс ребенка через `/api/parent/{parent_id}/children`
   - Сравнивает initial vs final оценки колеса баланса
   - TODO: Добавить `/parent-learning` для модуля обучения родителей

3. **Обучение родителей** (`/parent-learning`, `pages/ParentHub.tsx`) - ⏸️ **ЖДЕТ ДИЗАЙНА ОТ OPUS**
   - Два таба: мониторинг детей + собственное обучение
   - Уроки для родителей в `parentLessonsData.ts` (20-30 уроков, еще не созданы)
   - Аналогично Index.tsx, но для родителей

4. **Дашборд куратора** (`/curator`, `pages/CuratorDashboard.tsx`) - Управление группой
   - Генерирует 6-символьные коды доступа через `/api/curator/generate-code`
   - Список учеников с агрегированным прогрессом из `/api/curator/{curator_id}/students`
   - Прогресс по модулям рассчитывается на сервере против хардкоженных totals (12, 12, 10, 10)

**Критический паттерн:** `ProtectedRoute` существует с **DEV_MODE=true** (обходит авторизацию для разработки). Установите в `false` перед продакшеном!

## 🔑 Критичные рабочие процессы

### Запуск проекта:
```bash
# MongoDB должен быть запущен первым (localhost:27017)
mongod  # или: brew services start mongodb-community

# Терминал 1: Backend (порт 8000)
cd backend
pip install -r requirements.txt
uvicorn server:app --reload --port 8000

# Терминал 2: Frontend (порт 5173 - Vite default)
cd frontend
npm install  # или bun install
npm run dev  # Откроется на localhost:5173/my-teens-space-c8a9ba43/
```

**⚠️ КРИТИЧНО: Запуск frontend ТОЛЬКО из папки `frontend`!**

```bash
# ❌ НЕ РАБОТАЕТ (Exit Code: 127):
cd my-teens-space-c8a9ba43
npm run dev  # ← package.json в корне нет!

# ✅ ПРАВИЛЬНО:
cd my-teens-space-c8a9ba43/frontend
npm run dev  # ← Работает!
```

**Быстрый старт:** Запустите `./start.sh` (проверяет MongoDB, устанавливает зависимости, запускает оба сервера на портах 8000 и 5173)

### Интеграция Telegram Mini App:

**Настройка Frontend:**
```typescript
// main.tsx - Уже настроено
import WebApp from '@twa-dev/sdk'
WebApp.ready()
WebApp.expand()

// Используйте хук везде
import { useTelegram } from '@/hooks/useTelegram'
const { user, initData, hapticFeedback, notificationFeedback } = useTelegram()
```

**Валидация Backend:**
```python
# telegram_auth.py - HMAC валидация
from backend.telegram_auth import validate_telegram_webapp_data

# server.py endpoint
@api_router.post("/auth/telegram-login")
async def telegram_login(init_data: str, selected_role: str):
    # Валидирует подпись Telegram
    is_valid = validate_telegram_webapp_data(init_data, bot_token)
    user_data = parse_telegram_user_data(init_data)
    # Возвращает пользователя с telegram_id
```

**Важно:** HMAC валидация сейчас закомментирована для разработки. Включите перед продакшеном!

### Настройка окружения:
Backend требует `backend/.env`:
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=myteens_space
SECRET_KEY=<сгенерируйте-через-openssl-rand-hex-32>
TELEGRAM_BOT_TOKEN=<от-@BotFather>
```

Frontend работает на порту 5173 (Vite default) с basename `/my-teens-space-c8a9ba43/` (настроено в `vite.config.ts` и `App.tsx` для GitHub Pages).

### URLs в разработке:
- **Frontend:** http://localhost:5173/my-teens-space-c8a9ba43/
- **Backend API:** http://localhost:8000/api
- **API Docs:** http://localhost:8000/docs
- **Test Auth:** http://localhost:5173/my-teens-space-c8a9ba43/test-auth.html

### Отладка:
**Backend:** Проверьте `backend.log` и подключение MongoDB. Motor драйвер требует `async/await` на ВСЕХ операциях с БД.
**Frontend:** React DevTools + проверяйте localStorage (`userId`, `userRole`, `userName`, `initialBalanceScores`). Потоки состояния в `Index.tsx` контролируют всю навигацию приложения.
**Telegram:** Используйте test-auth.html (`/test-auth.html`) для симуляции ролей без Telegram во время разработки.

## 📦 Core Data Models

**Lesson structure** (`frontend/src/data/allLessonsData.ts`):
- 44 lessons across 4 modules × 4 weeks each
- **11 question types:** `choice`, `input`, `slider`, `emotion`, `matching`, `multiple` (базовые) + `interactive-zones`, `swipe-cards`, `mood-slider`, `boundary-builder`, `voice-note` (геймификация)
- Each lesson: `id`, `module`, `week`, `xp`, `questions[]`, `completionMessage`
- Example lesson ID pattern: `boundaries-w1-1` (module-week-number)
- **Новые поля для геймификации:** `subtitle`, `estimatedTime`, `preview`, `intro`, `completion`, `hints`, `telegram`

**Интерактивные компоненты вопросов:**
- `LessonParts/InteractiveZones.tsx` - тапайте на зоны личного пространства
- `LessonParts/SwipeCards.tsx` - свайп ОК/НЕ ОК ситуаций
- `LessonParts/MoodSlider.tsx` - слайдер настроения с эмодзи
- `LessonParts/BoundaryBuilder.tsx` - построение стены границ
- `LessonParts/VoiceNote.tsx` - голосовые заметки для рефлексии
- `GameLesson/GameLessonUltra.tsx` - полноценный игровой урок с челленджами

**Balance Wheel** (`frontend/src/data/wheelOfBalance.ts`):
- 8 life areas: boundaries, family, friendship, confidence, emotions, study, hobbies, health
- Taken at start (`initial`) and end (`final`) to show progress
- Stored in localStorage + MongoDB `balance_assessments` collection
- Visualized with Recharts `RadarChart` component

**Progress tracking** (MongoDB collections):
- `users` - role, XP, level, streak, curator_id, last_activity
- `lesson_progress` - lesson_id, user_id, module, status, score, xp_earned, answers, time_spent
- `balance_assessments` - user_id, type (initial/final), scores dict, timestamp
- `access_codes` - code, curator_id, role, used flag, expires_at

**Critical MongoDB pattern:** Motor async driver requires `await` on ALL operations. Use `.to_list(n)` instead of `.find()` cursor iteration.

## 🎨 UI Conventions

**Component library:** shadcn/ui (Tailwind-based, in `frontend/src/components/ui/`)
- Use existing components: `Button`, `Card`, `Input`, `Progress`, `Dialog`
- Theme: Purple/blue gradients, playful animations (Framer Motion)

**Page structure:**
- `Index.tsx` - Main student learning interface (modules → lessons → questions)
- `CuratorDashboard.tsx` - Teacher view (student list, progress monitoring, code generation)
- `ParentDashboard.tsx` - Parent view (child's progress, balance wheel comparison)
- `LoginPage.tsx` - Code-based authentication entry point

**Animation patterns:**
- Framer Motion: Use `motion.div` with `AnimatePresence` for page/component transitions
- Confetti: `canvas-confetti` library on lesson completion (see `LessonComplete.tsx`, `EnhancedLessonInterface.tsx`)
- Katya moods: `default`, `celebrate`, `thinking`, `support`, `bounce`, `shake` (see `EnhancedKatya.tsx`)

**State management in Index.tsx:**
- Manages entire student app flow with local state (no Redux/Zustand)
- Navigation flow: `activeTab` → `currentModule` → `currentLesson` → `showCompletion`
- localStorage keys: `userId`, `userRole`, `userName`, `initialBalanceScores`, `finalBalanceScores`

## 🔐 Поток авторизации

1. Пользователь открывает приложение в Telegram → Telegram WebApp SDK инициализируется
2. Frontend получает `initData` от Telegram (содержит информацию о пользователе + подпись)
3. Пользователь выбирает роль на странице `/role-selection` (4 роли: student, parent, parent_learning, curator)
4. POST `/api/auth/telegram-login` с initData + selected_role
5. Backend валидирует HMAC подпись используя TELEGRAM_BOT_TOKEN
6. Backend создает/возвращает пользователя с `telegram_id`
7. Frontend сохраняет `userId`, `userRole`, `userName` в `localStorage`
8. Компонент `ProtectedRoute` защищает роуты по роли (см. `App.tsx`)

**Важно:** Сейчас DEV_MODE=true в ProtectedRoute (обходит проверки авторизации). Установите в false перед продакшеном! HMAC валидация также закомментирована для разработки.

**Альтернативная авторизация (коды доступа):** Куратор генерирует код → Студент/Родитель вводит код → Backend валидирует. Эта система существует, но предпочтительна авторизация через Telegram.

## 🔄 Паттерны потока данных

**Завершение урока:**
1. Студент отвечает на вопросы → `EnhancedLessonInterface` валидирует ответы на клиенте
2. При завершении → POST `/api/progress/lesson/{id}/complete` с score, answers, time_spent
3. Backend вычисляет XP (базовый * процент правильности), обновляет level, проверяет streak (проверка вчера/сегодня), запускает достижения
4. Frontend показывает `LessonComplete` с конфетти, обновляет локальное состояние прогресса
5. Все 11 типов вопросов обрабатываются: базовые (choice, input, slider, emotion, matching, multiple) + геймификация (interactive-zones, swipe-cards, mood-slider, boundary-builder, voice-note)

**Мониторинг куратора:**
1. Curator ID сохраняется при создании пользователя (поле `curator_id` в коллекции users)
2. GET `/api/curator/{id}/students` агрегирует прогресс всех студентов
3. Сервер вычисляет проценты модулей против хардкоженных totals: boundaries=12, confidence=12, emotions=10, relationships=10
4. Дашборд отображает колеса баланса, фильтрация в реальном времени по имени/активности (клиентская)

**Паттерны API:**
- Все роуты с префиксом `/api` через `api_router` в `server.py`
- Motor async driver: ОБЯЗАТЕЛЬНО использовать `await` и `.to_list(n)` для курсоров
- Пример: `await db.users.find({...}).to_list(1000)` НЕ `for doc in db.users.find({...})`

## 🚨 Типичные ошибки

- **Конфликты портов:** Backend по умолчанию на 8000. Frontend на 5173 (Vite). Убедитесь что `VITE_API_URL` указывает на правильный backend URL.
- **CORS:** Backend разрешает `localhost:5173` и `localhost:3000` - обновите `CORSMiddleware` в `server.py` при необходимости
- **Подключение MongoDB:** Должно работать до запуска backend, нет логики авто-повтора. Проверьте с `pgrep -x "mongod"`
- **Ключи localStorage:** Непоследовательное использование `user_id` vs `userId` - предпочитайте `userId` везде
- **ID модулей:** Используйте lowercase без пробелов: `boundaries`, `confidence`, `emotions`, `relationships` (соответствует enum `ModuleType`)
- **Motor async:** Забывание `await` на операциях БД вызывает молчаливые сбои. Всегда `await db.collection.operation()`
- **Итерация курсора:** НИКОГДА не используйте `for doc in db.collection.find()` - используйте `await db.collection.find().to_list(1000)` вместо этого
- **Telegram SDK:** Используйте `notificationFeedback('success'/'error')` НЕ `hapticFeedback('success')` - haptic принимает только 'light'/'medium'/'heavy'
- **DEV_MODE:** Не забудьте установить DEV_MODE=false в ProtectedRoute перед продакшеном
- **Родительский модуль:** Файлы ЕЩЕ НЕ созданы (parentLessonsData.ts, ParentHub.tsx, ParentLearning.tsx) - ожидается дизайн от Opus

## 📊 Тестирование и отладка

**Тестового набора пока нет** - ручное тестирование в браузере.

**Отладка backend:**
```bash
# Просмотр MongoDB запросов
python -c "import logging; logging.basicConfig(level=logging.DEBUG)"
uvicorn server:app --reload --log-level debug
```

**Отладка frontend:**
- React DevTools + проверьте localStorage в консоли браузера
- `console.log` состояний прогресса в `Index.tsx` для трассировки потока уроков

## 🎯 Доменные правила

**Тон контента:** Теплый, поддерживающий, подростко-ориентированный. Катя (маскот) использует эмодзи, говорит неформально.

**Расчет XP:** Базовый XP за урок в `allLessonsData.ts` (50-100 XP). Умножается на процент правильности при завершении.

**Логика стриков:** Проверка даты `last_activity` - если сегодня или вчера → продолжить стрик, иначе сбросить на 1.

**Разблокировка модулей:** Сейчас все модули доступны. Будущее: заблокировать следующий модуль пока текущий не завершен на 100%.

## 🔧 При изменениях

**Добавление уроков:** Редактируйте `frontend/src/data/allLessonsData.ts` следуя существующей структуре. Обновите количество уроков модуля в `get_modules_progress()` в `backend/server.py`.

**Новые API endpoints:** Добавляйте к `api_router` в `server.py`, используйте префикс `/api`. Сохраняйте async (Motor требует этого).

**Новые UI страницы:** Создавайте в `frontend/src/pages/`, добавляйте роут в `App.tsx`, оборачивайте в `ProtectedRoute` при необходимости.

**Изменение ролей:** Обновите enum `UserRole` в `models.py` + обновите проверки `ProtectedRoute` в `App.tsx`.
