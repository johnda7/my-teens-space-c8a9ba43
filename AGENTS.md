# 🤖 MyTeens.Space - Руководство для AI Агентов

## 🎯 Обзор проекта

**MyTeens.Space** - образовательное Telegram Mini App для подростков 12-17 лет, фокусирующееся на развитии эмоционального интеллекта, здоровых границ и отношений.

### Ключевая особенность проекта
📱 **Это Telegram Mini App** - веб-приложение, которое запускается внутри Telegram через WebView.

---

## 🏗️ Архитектура

### Технологический стек

**Frontend (Telegram WebApp):**
- React 18.3 + TypeScript
- Vite (сборка и dev-сервер)
- Telegram WebApp SDK (`@twa-dev/sdk`)
- shadcn/ui (компоненты)
- Tailwind CSS
- Framer Motion (анимации)
- React Router (SPA навигация)
- Recharts (визуализация данных)

**Backend (API):**
- FastAPI (Python 3.10+)
- MongoDB с Motor (async driver)
- Pydantic (валидация данных)

**Деплой:**
- Frontend: GitHub Pages
- Backend: Railway / Render / Fly.io (отдельно)

### Структура монорепозитория

```
my-teens-space-c8a9ba43/
├── frontend/               # Telegram Mini App
│   ├── src/
│   │   ├── components/    # React компоненты
│   │   ├── pages/         # 3 дашборда
│   │   ├── data/          # 44 урока + колесо баланса
│   │   └── App.tsx        # React Router с basename
│   ├── public/
│   │   ├── 404.html       # SPA fallback
│   │   └── favicon.ico
│   └── vite.config.ts     # base: '/my-teens-space-c8a9ba43/'
│
├── backend/               # FastAPI сервер
│   ├── server.py          # API endpoints
│   ├── models.py          # Pydantic модели
│   └── requirements.txt
│
├── .github/
│   └── workflows/
│       └── deploy.yml     # GitHub Actions для деплоя
│
└── AGENTS.md             # Этот файл
```

---

## 📱 Telegram Mini App интеграция

### Важные особенности Telegram WebApp:

1. **Инициализация Telegram SDK:**
   ```typescript
   import WebApp from '@twa-dev/sdk'
   
   // В main.tsx или App.tsx
   WebApp.ready()
   WebApp.expand() // Развернуть на весь экран
   ```

2. **Получение данных пользователя Telegram:**
   ```typescript
   const telegramUser = WebApp.initDataUnsafe.user
   const userId = telegramUser?.id
   const userName = telegramUser?.first_name
   ```

3. **Интеграция с Telegram UI:**
   - Используйте `WebApp.MainButton` для основных действий
   - `WebApp.BackButton` для навигации назад
   - `WebApp.themeParams` для адаптации к теме Telegram
   - `WebApp.HapticFeedback` для тактильных ощущений

4. **Безопасность:**
   - Валидация `initData` на бэкенде через Telegram Bot Token
   - Проверка подписи запросов от Telegram

### Telegram Bot связка:

Приложение запускается через Telegram бота. Конфигурация:
- Bot API Token хранится в `backend/.env`
- URL Mini App: `https://johnda7.github.io/my-teens-space-c8a9ba43/`
- Настраивается через BotFather: `/newapp` или `/editapp`

---

## 🎓 Система обучения

### 44 урока по 4 модулям

Все уроки хранятся в `frontend/src/data/allLessonsData.ts`:

**Модули:**
1. **Границы** (boundaries) - 12 уроков, 4 недели
2. **Уверенность** (confidence) - 12 уроков, 4 недели
3. **Эмоции** (emotions) - 10 уроков, 3-4 недели
4. **Отношения** (relationships) - 10 уроков, 3-4 недели

**Структура урока:**
```typescript
{
  id: 'boundaries-w1-1',          // Паттерн: модуль-неделя-номер
  title: 'Что такое границы?',
  description: 'Учимся понимать личные границы',
  module: 'boundaries',
  week: 1,
  xp: 100,                        // База XP за урок (первый урок больше!)
  questions: [...],               // 7 вопросов разных типов
  completionMessage: '🎉 Поздравляю!'
}
```

### 13 типов вопросов (обновлено 15.11.2025)

**Базовые типы:**
1. **`choice`** - единственный выбор
2. **`multiple`** - множественный выбор
3. **`input`** - текстовый ввод
4. **`slider`** - шкала 0-10
5. **`emotion`** - выбор эмоции (эмодзи)
6. **`matching`** - соотнести пары

**Геймифицированные типы:**
7. **`interactive-zones`** - тапай на зоны личного пространства
8. **`swipe-cards`** - свайп OK/НЕ OK ситуаций
9. **`mood-slider`** - слайдер настроения с эмодзи
10. **`boundary-builder`** - построй стену границ из кирпичиков
11. **`voice-note`** - голосовые заметки для рефлексии

**🆕 Интерактивные практики (из da-teens):**
12. **`roleplay`** - тренировка реальных разговоров с NPC
    - Сценарии с контекстом
    - NPC-сообщения (друзья, родители)
    - Ввод своего ответа
    - Автоматическая оценка (excellent/good/needs-work)
    - Feedback с примерами здоровых ответов
    
13. **`manifest`** - создание личного манифеста
    - 5 шагов: ценности → права → границы → мантра → план поддержки
    - Прогресс-бар
    - Навигация вперёд/назад
    - Итоговый документ для сохранения

### Логика прохождения урока

Реализовано в `EnhancedLessonInterface.tsx`:

1. **Начало урока:** POST `/api/progress/lesson/{id}/start`
2. **Ответы:** Сохраняются локально в компоненте
3. **Валидация:** Client-side проверка правильности
4. **Завершение:** POST `/api/progress/lesson/{id}/complete`
   - Отправляется: score, answers, time_spent
   - Возвращается: XP, новый level, streak
5. **Анимация:** Конфетти + LessonComplete компонент

---

## 🎮 Геймификация

### Система прогресса

**XP (Experience Points):**
- Базовый XP за урок: 50-100 (указан в `allLessonsData.ts`)
- Итоговый XP = базовый × (score / 100)
- Пример: урок 75 XP, score 80% → получаешь 60 XP

**Уровни (Levels):**
- Стартовый уровень: 1
- Повышение: каждые 500 XP = +1 level
- Логика расчёта в `backend/server.py`:
  ```python
  new_level = (total_xp // 500) + 1
  ```

**Стрики (Streaks):**
- +1 день за активность сегодня или вчера
- Сброс на 1 если перерыв > 1 дня
- Проверка через поле `last_activity` в users collection

**Достижения (Achievements):**
- Массив строк в users: `achievements: []`
- Примеры: "first_lesson", "week_complete", "perfect_score"
- Логика триггеров в `backend/server.py`

---

## ⚖️ Колесо баланса (Balance Wheel)

### 8 сфер жизни

Определены в `frontend/src/data/wheelOfBalance.ts`:

```typescript
const categories = [
  { id: 'boundaries', label: 'Границы', icon: Shield },
  { id: 'family', label: 'Семья', icon: Users },
  { id: 'friendship', label: 'Дружба', icon: Heart },
  { id: 'confidence', label: 'Уверенность', icon: Target },
  { id: 'emotions', label: 'Эмоции', icon: Sparkles },
  { id: 'study', label: 'Учёба', icon: BookOpen },
  { id: 'hobbies', label: 'Хобби', icon: Palette },
  { id: 'health', label: 'Здоровье', icon: Activity }
]
```

### Когда показывается:

1. **Первый запуск** (initial assessment):
   - Проверка: `!localStorage.getItem('initialBalanceScores')`
   - Компонент: `BalanceAssessment` с `type="initial"`
   - Сохраняется в localStorage + MongoDB

2. **После завершения всех модулей** (final assessment):
   - Проверка: все 4 модуля progress >= 100%
   - Компонент: `BalanceAssessment` с `type="final"`
   - Сравнение с initial для показа роста

### Визуализация:

- `WheelOfBalance.tsx` - Recharts RadarChart
- Показывает initial vs final scores
- Используется в Parent и Curator дашбордах

---

## 👥 Три роли и дашборда

### 1. Student Dashboard (`pages/Index.tsx`)

**Путь:** `/`

**Главный интерфейс обучения:**
- Домашний экран с модулями
- Вход в комнату модуля (`ModuleRoom.tsx`)
- Прохождение уроков (`EnhancedLessonInterface.tsx`)
- Статистика: XP, level, streak
- Колесо баланса (initial + final)

**Навигация (state-driven):**
```typescript
activeTab: 'home' | 'progress' | 'chat' | 'profile'
currentModule: 'boundaries' | 'confidence' | 'emotions' | 'relationships' | null
currentLesson: lesson_id | null
showCompletion: boolean
```

**LocalStorage keys:**
- `userId` - ID пользователя
- `userRole` - 'student'
- `userName` - Имя из Telegram
- `initialBalanceScores` - Первичная оценка
- `finalBalanceScores` - Финальная оценка

### 2. Parent Dashboard (`pages/ParentDashboard.tsx`)

**Путь:** `/parent`

**Мониторинг прогресса ребёнка:**
- Список детей (связь через `parent_id`)
- Прогресс по модулям (%)
- Завершённые уроки
- Сравнение initial vs final balance wheel
- Last activity timestamp

**API endpoint:**
```
GET /api/parent/{parent_id}/children
```

**Текущее состояние:**
- ⚠️ Открытый доступ (нет проверки parent-child связи)
- TODO: Добавить ограничение доступа по parent_id

### 3. Curator Dashboard (`pages/CuratorDashboard.tsx`)

**Путь:** `/curator`

**Управление группой учеников:**
- Генерация access кодов (6 символов)
- Список всех учеников куратора
- Агрегированная статистика по модулям
- Фильтрация по имени и активности
- Balance wheel каждого ученика

**API endpoints:**
```
POST /api/curator/generate-code
  Body: { curator_id, student_name, student_age }
  Response: { code, expires_at }

GET /api/curator/{curator_id}/students
  Response: [{ id, name, progress, completedLessons, ... }]

GET /api/curator/{curator_id}/codes
  Response: [{ code, used, created_at, ... }]
```

**Расчёт прогресса:**
Захардкоженные totals в `backend/server.py`:
```python
module_totals = {
    "boundaries": 12,
    "confidence": 12,
    "emotions": 10,
    "relationships": 10
}
```

⚠️ **Важно:** При добавлении уроков обновить эти значения!

---

## 🔐 Система авторизации

### Текущая реализация (Access Codes)

**Флоу:**
1. Curator генерирует код → `POST /api/curator/generate-code`
2. Student получает код (через Telegram, email, etc)
3. Student вводит код → `POST /api/auth/login`
4. Backend валидирует код, создаёт/возвращает user
5. Frontend сохраняет userId, userRole в localStorage

**Структура Access Code:**
```typescript
{
  code: string,              // 6 символов A-Z0-9
  curator_id: string,
  role: 'student' | 'parent' | 'curator',
  name: string,
  age?: number,
  used: boolean,
  used_by?: string,          // user_id после использования
  created_at: datetime,
  expires_at: datetime       // +30 дней
}
```

### Критическое замечание:

⚠️ **Нет реальной защиты маршрутов!**

`ProtectedRoute` компонент существует в `App.tsx`, но **НЕ ИСПОЛЬЗУЕТСЯ**:
```typescript
// Определён, но не применён к Routes:
const ProtectedRoute = ({ children, allowedRoles }) => {
  const userId = localStorage.getItem('userId');
  if (!userId) return <Navigate to="/login" />;
  // ...
}

// Все роуты открыты:
<Route path="/" element={<Index />} />
<Route path="/parent" element={<ParentDashboard />} />
<Route path="/curator" element={<CuratorDashboard />} />
```

**TODO для production:**
1. Обернуть роуты в `ProtectedRoute`
2. Добавить JWT токены вместо localStorage
3. Валидировать роли на бэкенде (сейчас доверяет userId)

### Telegram авторизация (рекомендовано):

```typescript
// Вместо access codes использовать Telegram initData
import WebApp from '@twa-dev/sdk'

const initData = WebApp.initData
const telegramUser = WebApp.initDataUnsafe.user

// На бэкенде валидировать через:
import hmac
def validate_telegram_webapp_data(init_data: str, bot_token: str) -> bool:
    # Проверка HMAC подписи от Telegram
    # См. https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
```

---

## 🗄️ База данных (MongoDB)

### Collections

**1. users**
```javascript
{
  _id: ObjectId,
  id: string,                    // UUID
  name: string,
  age: number,
  role: 'student' | 'parent' | 'curator',
  telegram_id?: string,          // Telegram user ID
  curator_id?: string,           // Для students
  parent_id?: string,            // Для students
  created_at: datetime,
  
  // Геймификация
  xp: number,
  level: number,
  streak: number,
  last_activity: datetime,
  achievements: [string],
  
  // Настройки
  notifications_enabled: boolean,
  avatar_url?: string
}
```

**2. lesson_progress**
```javascript
{
  _id: ObjectId,
  id: string,                    // UUID
  user_id: string,
  lesson_id: string,             // 'boundaries-w1-1'
  module: 'boundaries' | 'confidence' | 'emotions' | 'relationships',
  status: 'locked' | 'available' | 'in_progress' | 'completed',
  started_at?: datetime,
  completed_at?: datetime,
  score?: number,                // 0-100
  xp_earned: number,
  time_spent: number,            // секунды
  answers: {},                   // { question_id: answer }
  attempts: number
}
```

**3. balance_assessments**
```javascript
{
  _id: ObjectId,
  id: string,
  user_id: string,
  type: 'initial' | 'final',
  scores: {                      // categoryId → score (0-10)
    boundaries: 7,
    family: 8,
    friendship: 6,
    // ...
  },
  answers: {                     // questionId → answer
    q1: 'Мой ответ на вопрос 1',
    // ...
  },
  overall_score: number,         // Среднее
  timestamp: datetime
}
```

**4. access_codes**
```javascript
{
  _id: ObjectId,
  code: string,                  // 6 символов
  curator_id: string,
  role: 'student' | 'parent',
  name: string,
  age?: number,
  used: boolean,
  used_by?: string,              // user_id
  created_at: datetime,
  expires_at: datetime
}
```

### Критические паттерны Motor async driver

⚠️ **ВСЕГДА используйте `await` и `.to_list()`:**

```python
# ❌ НЕПРАВИЛЬНО (не работает с Motor):
for user in db.users.find({}):
    print(user)

# ✅ ПРАВИЛЬНО:
users = await db.users.find({}).to_list(1000)
for user in users:
    print(user)

# ✅ Один документ:
user = await db.users.find_one({"id": user_id})

# ✅ Вставка:
await db.users.insert_one(user_data)

# ✅ Обновление:
await db.users.update_one(
    {"id": user_id},
    {"$set": {"xp": new_xp}}
)
```

---

## 🌐 API Endpoints

Все эндпоинты с префиксом `/api` (настроено в `server.py`):

### Authentication

```
POST /api/auth/login
  Body: { code: string }
  Response: { id, name, role, ... }

POST /api/auth/create-curator
  Body: { name, age }
  Response: { user, access_code }
```

### User Management

```
GET /api/users/{user_id}
  Response: User object

PUT /api/users/{user_id}
  Body: { name?, age?, avatar_url?, notifications_enabled? }
  Response: { message: "Профиль обновлен" }
```

### Lesson Progress

```
POST /api/progress/lesson/{lesson_id}/start
  Body: { user_id, module }
  Response: { message, status }

POST /api/progress/lesson/{lesson_id}/complete
  Body: { user_id, score, answers, time_spent }
  Response: { xp_earned, new_level, streak, achievements }

GET /api/progress/{user_id}
  Response: [LessonProgress]

GET /api/progress/{user_id}/stats
  Response: { total_lessons, completed, by_module, ... }
```

### Balance Assessment

```
POST /api/balance-assessment
  Body: { user_id, type, scores, answers }
  Response: { id, overall_score, ... }

GET /api/balance-assessment/{user_id}
  Response: [BalanceAssessment]

GET /api/balance-assessment/{user_id}/latest
  Response: BalanceAssessment | null
```

### Curator

```
POST /api/curator/generate-code
  Body: { curator_id, student_name, student_age }
  Response: { code, expires_at, message }

GET /api/curator/{curator_id}/students
  Response: [{ id, name, progress, completedLessons, ... }]

GET /api/curator/{curator_id}/codes
  Response: [AccessCode]
```

### Parent

```
GET /api/parent/{parent_id}/children
  Response: [{ id, name, progress, balance_scores, ... }]
```

---

## 🎨 UI/UX паттерны

### Виртуальный психолог "Катя Карпенко"

**Компонент:** `EnhancedKatya.tsx`

**6 настроений (moods):**
- `default` - обычное состояние
- `celebrate` - радость, поздравление
- `thinking` - задумчивость
- `support` - поддержка
- `bounce` - анимация подпрыгивания
- `shake` - качание головой

**Ассеты:**
- `katya-mascot.png` - основной
- `katya-celebrate.png` - радость
- `katya-thinking.png` - думает
- `katya-support.png` - поддержка

**Использование:**
```tsx
<EnhancedKatya 
  mood="celebrate"
  message="Отлично справился! 🎉"
/>
```

### Анимации

**Framer Motion:**
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>
  {content}
</motion.div>
```

**Конфетти (canvas-confetti):**
```typescript
import confetti from 'canvas-confetti'

confetti({
  particleCount: 50,
  spread: 70,
  origin: { y: 0.6 },
  colors: ['#58cc02', '#ffc800', '#ff4b4b', '#ce82ff']
})
```

**Используется в:**
- `LessonComplete.tsx` - после завершения урока
- `EnhancedLessonInterface.tsx` - при правильном ответе

### 🆕 Интерактивные компоненты (15.11.2025)

**Из репозитория da-teens-webapp-tele взяты лучшие практики:**

#### 1. RoleplaySimulator 🎭
**Файл:** `frontend/src/components/LessonParts/RoleplaySimulator.tsx`

**Назначение:** Тренировка реальных разговоров в безопасной среде

**Функции:**
- Интерактивные диалоги с NPC (друзья, родители, учителя)
- Автоматическая оценка ответов (excellent/good/needs-work)
- Feedback с примерами здоровых ответов
- Прогресс по сценариям

**Пример использования:**
```typescript
{
  type: 'roleplay',
  title: '🎭 Практика: Реальные ситуации',
  scenarios: [
    {
      id: 'scenario-1',
      title: 'Друг просит списать',
      context: 'Твой друг уже 3-й раз просит списать...',
      npc: {
        name: 'Максим',
        messages: ['Дай списать!', 'Ну пожалуйста!']
      },
      goodResponses: [
        'Я понимаю, но давай лучше я объясню тебе тему?'
      ]
    }
  ]
}
```

**Оценка ответов:**
- `excellent`: 3+ ключевых слов ("я", "чувствую", "границы") + 50+ символов
- `good`: 2+ ключевых слова или 30+ символов
- `needs-work`: остальное

#### 2. ManifestCreator 📜
**Файл:** `frontend/src/components/LessonParts/ManifestCreator.tsx`

**Назначение:** Создание личного манифеста границ

**Структура (5 шагов):**
1. **Мои ценности** 💗 - что самое важное
2. **Мои права** 🛡️ - напомни о правах
3. **Мои границы** 🎯 - 5-7 главных границ
4. **Моя мантра** ✨ - одна фраза поддержки
5. **Мой план поддержки** ✅ - к кому обращусь

**Функции:**
- Прогресс-бар с процентами
- Навигация вперёд/назад
- Мини-превью завершённых секций
- onComplete возвращает весь манифест

**Пример использования:**
```typescript
{
  type: 'manifest',
  title: '📜 Твой личный манифест границ',
  question: 'Создай свой манифест...',
  xpReward: 50
}
```

### UX-улучшения v3 (15.11.2025)

**Добавлено в EnhancedLessonInterface:**

1. **Локальный прогресс по вопросам** 📊
   - "Вопрос X из Y" над каждой карточкой
   - Мини прогресс-бар с градиентом

2. **Чеклист миссии** ✅ (для первого урока)
   - 3 цели: понять → почувствовать → попробовать
   - Автоматическая отметка при прохождении
   - Emerald галочки с анимациями

3. **Эмпатичный feedback** 💜
   - Заголовки: "✨ Точно в цель!", "💜 Всё в порядке"
   - Градиентные иконки (emerald/rose/blue)
   - XP badge при правильных ответах
   - Мягкие цвета вместо резких green/red

### Цветовая схема модулей

```typescript
const themes = {
  boundaries: {
    primary: 'purple',
    gradient: 'from-purple-500 to-pink-500',
    icon: Shield
  },
  confidence: {
    primary: 'blue',
    gradient: 'from-blue-500 to-cyan-500',
    icon: Target
  },
  emotions: {
    primary: 'pink',
    gradient: 'from-pink-500 to-rose-500',
    icon: Heart
  },
  relationships: {
    primary: 'green',
    gradient: 'from-green-500 to-emerald-500',
    icon: Users
  }
}
```

### shadcn/ui компоненты

Все компоненты в `frontend/src/components/ui/`:

**Часто используемые:**
- `Button` - кнопки с вариантами
- `Card`, `CardHeader`, `CardContent` - карточки
- `Progress` - прогресс бары
- `Input`, `Textarea` - поля ввода
- `Dialog` - модальные окна
- `Slider` - слайдеры для вопросов
- `Tabs` - табы навигации
- `Badge` - бейджи (XP, level)

---

## 🚀 Деплой и CI/CD

### GitHub Pages (Frontend)

**URL:** https://johnda7.github.io/my-teens-space-c8a9ba43/

**Конфигурация:**

1. `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/my-teens-space-c8a9ba43/',
  build: {
    outDir: 'dist',
  }
})
```

2. `App.tsx`:
```typescript
<BrowserRouter basename="/my-teens-space-c8a9ba43">
```

3. GitHub Actions: `.github/workflows/deploy.yml`
   - Trigger: push to main
   - Steps: checkout → install → build → deploy
   - Копирует `404.html` для SPA routing

**Активация:**
- Settings → Pages → Source: "GitHub Actions"
- Репозиторий должен быть публичным

### Backend деплой (рекомендации)

**Railway.app (рекомендую):**
```bash
# 1. Установить Railway CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Инициализировать проект
cd backend
railway init

# 4. Добавить MongoDB
railway add mongodb

# 5. Деплой
railway up
```

**Render.com:**
- Web Service from Git
- Build: `pip install -r requirements.txt`
- Start: `uvicorn server:app --host 0.0.0.0 --port $PORT`

**Environment Variables:**
```env
MONGO_URL=mongodb://...
DB_NAME=myteens_space
SECRET_KEY=...
TELEGRAM_BOT_TOKEN=...
```

### Обновление API URL в Frontend

После деплоя бэкенда обновите URL:

**Вариант 1 - Environment Variable:**
```typescript
// frontend/src/config.ts
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001'
```

**Вариант 2 - GitHub Secrets:**
- Settings → Secrets → Actions
- Add: `VITE_API_URL = https://your-backend.railway.app/api`

---

## 🐛 Типичные ошибки и решения

### 1. MongoDB курсоры не итерируются

```python
# ❌ Ошибка:
for user in db.users.find({}):
    pass

# ✅ Решение:
users = await db.users.find({}).to_list(1000)
```

### 2. 404 на GitHub Pages после деплоя

Проверьте:
- `vite.config.ts` → `base: '/repo-name/'`
- `App.tsx` → `<BrowserRouter basename="/repo-name">`
- `404.html` существует в `public/`

### 3. Роуты не работают в production

Добавьте `404.html`:
```html
<!-- Копия index.html для SPA fallback -->
```

### 4. localStorage не работает в Telegram WebApp

Используйте:
```typescript
WebApp.CloudStorage.setItem('key', 'value')
WebApp.CloudStorage.getItem('key', (err, value) => {})
```

### 5. Модули progress не синхронизируется

Проверьте hardcoded totals в `backend/server.py`:
```python
module_totals = {
    "boundaries": 12,  # Должно совпадать с реальным кол-вом уроков
    "confidence": 12,
    "emotions": 10,
    "relationships": 10
}
```

### 6. XP не начисляется

Проверьте:
- POST `/api/progress/lesson/{id}/complete` вызывается
- `xp` указан в `allLessonsData.ts` для урока
- Backend обновляет `users.xp`

---

## 📊 Мониторинг и аналитика

### Рекомендуемые метрики

**Для добавления:**

1. **Engagement:**
   - DAU (Daily Active Users)
   - Session duration
   - Lessons per session

2. **Progress:**
   - Completion rate по модулям
   - Average score
   - Streak distribution

3. **Performance:**
   - API response time
   - Page load time
   - Error rate

**Инструменты:**
- Google Analytics 4 (для Telegram WebApp)
- Sentry (error tracking)
- MongoDB Atlas monitoring

---

## 🔧 Конфигурационные файлы

### frontend/.env (создать)
```env
VITE_API_URL=http://localhost:8001/api
VITE_TELEGRAM_BOT_NAME=@your_bot
```

### backend/.env
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=myteens_space
SECRET_KEY=your-secret-key-here
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
PORT=8001
```

### frontend/vite.config.ts
```typescript
export default defineConfig({
  base: '/my-teens-space-c8a9ba43/',  // Для GitHub Pages
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', 'canvas-confetti'],
        },
      },
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
})
```

---

## 📚 Полезные команды

### Development

```bash
# Frontend
cd frontend
npm install
npm run dev          # http://localhost:3000

# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn server:app --reload --port 8001

# MongoDB
mongod --dbpath ./data  # или через brew services
```

### Быстрый старт
```bash
./start.sh  # Запускает всё автоматически
```

### Testing

```bash
# Frontend
npm run build        # Проверка сборки
npm run preview      # Просмотр production билда

# Backend
python -m pytest     # Если есть тесты
python backend/create_test_data.py  # Создание тестовых данных
```

### Деплой

```bash
# Frontend на GitHub Pages
git add .
git commit -m "Update"
git push origin main  # Автоматический деплой через Actions

# Backend на Railway
railway up

# Backend на Render
git push render main
```

---

## 🎯 TODO и планы развития

### Критичные задачи:

- [ ] Интегрировать Telegram WebApp SDK полностью
- [ ] Заменить access codes на Telegram авторизацию
- [ ] Добавить валидацию initData от Telegram
- [ ] Включить ProtectedRoute для всех роутов
- [ ] Динамически вычислять module_totals из allLessonsData.ts

### Улучшения:

- [ ] Добавить Telegram MainButton для действий в уроках
- [ ] Использовать WebApp.CloudStorage вместо localStorage
- [ ] Адаптация под Telegram theme (dark/light)
- [ ] Haptic Feedback при правильных/неправильных ответах
- [ ] Push notifications через Telegram Bot
- [ ] Чат между Curator и Students
- [ ] Экспорт прогресса в PDF для родителей

### Оптимизация:

- [ ] Code splitting для уроков (lazy load)
- [ ] Кеширование API запросов (React Query)
- [ ] Service Worker для offline работы
- [ ] Сжатие изображений Кати
- [ ] i18n (мультиязычность)

---

## 📖 Дополнительная документация

**В репозитории:**
- `README.md` - Общая информация и quick start
- `DOCUMENTATION.md` - Подробная техническая документация
- `API_DOCUMENTATION.md` - Описание всех API endpoints
- `DEPLOYMENT_GUIDE.md` - Гайд по деплою
- `GITHUB_PAGES_SETUP.md` - Настройка GitHub Pages
- `READY_TO_DEPLOY.md` - Быстрая шпаргалка по деплою
- `.github/copilot-instructions.md` - Инструкции для GitHub Copilot

**Внешние ресурсы:**
- [Telegram Mini Apps Documentation](https://core.telegram.org/bots/webapps)
- [Telegram WebApp SDK](https://github.com/twa-dev/sdk)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Router](https://reactrouter.com/)
- [shadcn/ui](https://ui.shadcn.com/)

---

## 🤝 Вклад и разработка

### Правила для AI агентов:

1. **Всегда учитывайте Telegram WebApp контекст** - это не обычное веб-приложение
2. **Сохраняйте tone дружелюбного психолога** - Катя говорит тепло и с эмодзи
3. **Тестируйте в Telegram** - поведение может отличаться от браузера
4. **Обновляйте module_totals** при добавлении уроков
5. **Используйте await** для всех MongoDB операций
6. **Добавляйте basename** при работе с роутингом
7. **Проверяйте на мобильных** - основная платформа Telegram

### Стиль кода:

**TypeScript/React:**
- Функциональные компоненты + hooks
- TypeScript strict mode
- Tailwind для стилей
- Framer Motion для анимаций

**Python/FastAPI:**
- Async/await везде
- Pydantic для валидации
- Type hints обязательны
- Motor для MongoDB

---

## 🔄 Workflow для AI Агентов (Opus → Sonnet)

### Схема работы:

```
┌─────────┐      Проектирование     ┌─────────┐      Реализация      ┌─────────┐
│  Opus   │ ──────────────────────→ │ Sonnet  │ ───────────────────→ │  Деплой │
│ (4.1)   │  Дизайн, архитектура   │  (4.0)  │  Код, тестирование  │         │
└─────────┘                         └─────────┘                       └─────────┘
     ↓                                   ↓                                 ↓
 • Уроки                            • Создает файлы               • GitHub Pages
 • Компоненты                       • Интегрирует                 • Railway/Render
 • API структура                    • Тестирует                   • Проверка
```

### Когда переключаться на Sonnet:

**Переключайтесь на Sonnet после того как Opus:**
1. ✅ Спроектировал структуру данных (уроки, модули)
2. ✅ Описал компоненты и их props
3. ✅ Определил API endpoints и их logic
4. ✅ Предоставил примеры кода или структуры

**НЕ переключайтесь на Sonnet если:**
- ❌ Нужно придумать контент (уроки, вопросы)
- ❌ Требуется архитектурное решение
- ❌ Нужно выбрать подход к реализации

### Что должен изучить Sonnet перед работой:

**Обязательные файлы:**
1. `AGENTS.md` (этот файл) - полная документация проекта
2. `OPUS_TASK.md` - конкретное задание от Opus
3. `.github/copilot-instructions.md` - краткая справка
4. `README.md` - quick start

**Файлы для понимания архитектуры:**
- `frontend/src/App.tsx` - роутинг
- `frontend/src/data/allLessonsData.ts` - структура уроков
- `backend/server.py` - API endpoints
- `backend/models.py` - модели данных

**Перед имплементацией:**
- Прочитать задание в `OPUS_TASK.md`
- Изучить существующие аналогичные компоненты
- Понять структуру данных
- Проверить зависимости

### Как Sonnet применяет код от Opus:

**Шаг 1: Анализ**
```bash
# Прочитать задание
read OPUS_TASK.md

# Изучить существующую структуру
grep -r "ComponentName" frontend/src/
ls -la backend/

# Проверить зависимости
cat frontend/package.json
cat backend/requirements.txt
```

**Шаг 2: Создание файлов**
- Использовать `create_file` для новых компонентов
- Следовать структуре предоставленной Opus
- Копировать паттерны из существующих файлов

**Шаг 3: Интеграция**
- Обновить роутинг в `App.tsx`
- Добавить импорты где нужно
- Убедиться что типы совместимы

**Шаг 4: Тестирование**
```bash
# Frontend
cd frontend && npm run dev

# Backend (если нужен)
cd backend && uvicorn server:app --reload --port 8001
```

**Шаг 5: Проверка ошибок**
- Использовать `get_errors` для TypeScript ошибок
- Проверить console в браузере
- Протестировать в UI

### Пример workflow:

**Задача:** Создать ParentLearning компонент

**Opus проектирует:**
```markdown
## ParentLearning.tsx

Структура:
- State: currentModule, currentLesson, progress
- Данные: из parentLessonsData.ts
- UI: карточки модулей → уроки → completion

Props: нет (standalone page)

Модули для родителей:
- communication (8 уроков)
- emotional-support (7 уроков)
- boundaries-parenting (8 уроков)
- conflict-resolution (7 уроков)
```

**Sonnet реализует:**
1. Читает задание
2. Изучает `Index.tsx` (аналог)
3. Создает `ParentLearning.tsx` по образцу
4. Адаптирует для родительских модулей
5. Тестирует локально
6. Фиксит ошибки

### Типичные задачи:

| Задача | Кто делает | Почему |
|--------|-----------|--------|
| Придумать 30 уроков для родителей | **Opus** | Контент, креатив |
| Создать файл parentLessonsData.ts | **Sonnet** | Техническая задача |
| Спроектировать UI ParentHub | **Opus** | Дизайн, UX |
| Написать код ParentHub.tsx | **Sonnet** | Имплементация |
| Определить API endpoints | **Opus** | Архитектура |
| Реализовать endpoints в server.py | **Sonnet** | Код |

---

**Python/FastAPI:**
- Async/await везде
- Pydantic для валидации
- Type hints обязательны
- Motor для MongoDB

---

**Версия документа:** 1.1.0  
**Последнее обновление:** 10 ноября 2025  
**Статус проекта:** 🚀 В разработке (MVP готов, ждем родительский модуль от Opus)

---

💜 **MyTeens.Space** - помогаем подросткам расти счастливыми и уверенными!
