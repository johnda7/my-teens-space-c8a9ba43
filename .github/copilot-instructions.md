# MyTeens.Space - AI Coding Agent Instructions

## 🎯 Project Overview

Educational platform for teenagers (12-17 years) focused on emotional intelligence, healthy boundaries, and relationships. Features virtual psychologist "Katya Karpenko" with gamification (XP, levels, streaks).

## 🏗️ Architecture

**Monorepo structure:**
- `backend/` - FastAPI (Python 3.10+) with MongoDB (Motor async driver)
- `frontend/` - React 18.3 + TypeScript + Vite, shadcn/ui components
- **3 user roles:** `student`, `parent`, `curator` (see `backend/models.py`)

**Key pattern:** Auth-by-code system (no passwords). Curators generate 6-digit codes → students/parents use codes to login → `localStorage` stores `userId`, `userRole`, `userName`.

## 🔑 Critical Workflows

### Running the project:
```bash
# Backend (MongoDB must be running on localhost:27017 or set MONGO_URL)
cd backend
pip install -r requirements.txt
uvicorn server:app --reload --port 8001

# Frontend (separate terminal)
cd frontend
npm install  # or yarn/bun
npm run dev  # runs on localhost:5173
```

### Environment setup:
Backend needs `backend/.env`:
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=myteens_space
SECRET_KEY=<generate-with-openssl-rand-hex-32>
```

Frontend uses `VITE_API_URL` (defaults to http://localhost:8001).

## 📦 Core Data Models

**Lesson structure** (`frontend/src/data/allLessonsData.ts`):
- 44 lessons across 4 modules × 4 weeks each
- 6 question types: `choice`, `input`, `slider`, `emotion`, `matching`, `multiple`
- Each lesson has `id`, `module`, `week`, `xp`, `questions[]`, `completionMessage`

**Balance Wheel** (`frontend/src/data/wheelOfBalance.ts`):
- 8 life areas assessment (boundaries, family, friendship, confidence, emotions, study, hobbies, health)
- Taken at start (`initial`) and end (`final`) to show progress
- Visualized with Recharts `RadarChart`

**User progress tracking** (`backend/server.py`):
- `lesson_progress` collection: stores completed lessons, XP earned, answers
- `balance_assessments` collection: stores wheel scores with timestamps
- `access_codes` collection: stores curator-generated login codes

## 🎨 UI Conventions

**Component library:** shadcn/ui (Tailwind-based, in `frontend/src/components/ui/`)
- Use existing components: `Button`, `Card`, `Input`, `Progress`, `Dialog`
- Theme: Purple/blue gradients, playful animations (Framer Motion)

**Page structure:**
- `Index.tsx` - Main student learning interface (modules → lessons → questions)
- `CuratorDashboard.tsx` - Teacher view (student list, progress monitoring, code generation)
- `ParentDashboard.tsx` - Parent view (child's progress, balance wheel comparison)
- `LoginPage.tsx` - Code-based authentication entry point

**Animation pattern:** Use Framer Motion for page transitions, confetti on lesson completion (see `canvas-confetti` in `LessonComplete.tsx`).

## 🔐 Authentication Flow

1. Curator visits `/curator` → generates access code via `/api/curator/generate-code`
2. Student/parent visits `/login` → enters 6-digit code
3. Backend validates code in `access_codes` collection → creates/returns user
4. Frontend stores `userId`, `userRole`, `userName` in `localStorage`
5. `ProtectedRoute` component guards routes by role (see `App.tsx`)

**Important:** No JWT tokens yet - all auth is localStorage-based. Backend trusts `userId` from requests.

## 🔄 Data Flow Patterns

**Lesson completion:**
1. Student answers questions → `EnhancedLessonInterface` validates
2. On complete → POST `/api/progress/lesson/{id}/complete` with score, answers, time
3. Backend calculates XP, updates level, checks streak, triggers achievements
4. Frontend shows `LessonComplete` with confetti, updates progress state

**Curator monitoring:**
1. Curator ID stored on user creation (`curator_id` field)
2. GET `/api/curator/{id}/students` aggregates all students' progress
3. Dashboard calculates module percentages, displays balance wheels
4. Real-time filtering by name/activity (client-side)

## 🚨 Common Pitfalls

- **Port conflicts:** Backend defaults to 8001 (not 8000) to avoid clashes
- **CORS:** Backend allows `localhost:5173` and `localhost:3000` - update if needed
- **MongoDB connection:** Must be running before backend starts, no auto-retry
- **LocalStorage keys:** Inconsistent use of `user_id` vs `userId` - prefer `userId`
- **Module IDs:** Use lowercase with no spaces: `boundaries`, `confidence`, `emotions`, `relationships`

## 📊 Testing & Debugging

**No test suite yet** - manual testing in browser.

**Debugging backend:**
```bash
# See MongoDB queries
python -c "import logging; logging.basicConfig(level=logging.DEBUG)"
uvicorn server:app --reload --log-level debug
```

**Debugging frontend:**
- React DevTools + check localStorage in browser console
- `console.log` progress states in `Index.tsx` to trace lesson flow

## 🎯 Domain-Specific Rules

**Content tone:** Warm, supportive, teenager-friendly. Katya (mascot) uses emojis, speaks informally.

**XP calculation:** Base XP per lesson is in `allLessonsData.ts` (50-100 XP). Multiply by score percentage on completion.

**Streak logic:** Check `last_activity` date - if today or yesterday → continue streak, else reset to 1.

**Module unlock:** Currently all modules available. Future: lock next module until current 100% complete.

## 🔧 When Modifying

**Adding lessons:** Edit `frontend/src/data/allLessonsData.ts` following existing structure. Update module lesson counts in `get_modules_progress()`.

**New API endpoints:** Add to `api_router` in `server.py`, use `/api` prefix. Keep async (Motor requires it).

**New UI pages:** Create in `frontend/src/pages/`, add route to `App.tsx`, wrap in `ProtectedRoute` if needed.

**Changing roles:** Update `UserRole` enum in `models.py` + update `ProtectedRoute` guards in `App.tsx`.
