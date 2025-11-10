# MyTeens.Space - AI Coding Agent Instructions

## 🎯 Project Overview

Educational platform for teenagers (12-17 years) focused on emotional intelligence, healthy boundaries, and relationships. Features virtual psychologist "Katya Karpenko" with gamification (XP, levels, streaks).

## 🏗️ Architecture

**Monorepo structure:**
- `backend/` - FastAPI (Python 3.10+) with MongoDB (Motor async driver)
- `frontend/` - React 18.3 + TypeScript + Vite, shadcn/ui components
- **3 user roles:** `student`, `parent`, `curator` (enum in `backend/models.py`)

### Three-Dashboard System

1. **Student Dashboard** (`/`, `pages/Index.tsx`) - Main learning interface
   - State-driven navigation: home → module room → lesson → completion
   - Modules rendered from local `modules` array with progress tracking
   - Lessons fetched from `COMPLETE_LESSONS` in `data/allLessonsData.ts`
   - Balance Wheel shown on first load (localStorage check: `initialBalanceScores`)

2. **Parent Dashboard** (`/parent`, `pages/ParentDashboard.tsx`) - Child monitoring
   - Fetches child progress via `/api/parent/{parent_id}/children`
   - Compares initial vs final balance wheel scores
   - Currently open access (no parent-child linkage enforced)

3. **Curator Dashboard** (`/curator`, `pages/CuratorDashboard.tsx`) - Group management
   - Generates 6-char access codes via `/api/curator/generate-code`
   - Lists students with aggregated progress from `/api/curator/{curator_id}/students`
   - Module progress calculated server-side against hardcoded totals (12, 12, 10, 10)

**Critical Pattern:** Currently **NO authentication enforcement** - all routes open. `ProtectedRoute` exists in `App.tsx` but is unused. Auth planned via access codes system.

## 🔑 Critical Workflows

### Running the project:
```bash
# MongoDB must be running first (localhost:27017)
mongod  # or: brew services start mongodb-community

# Terminal 1: Backend (port 8001, NOT 8000)
cd backend
pip install -r requirements.txt
uvicorn server:app --reload --port 8001

# Terminal 2: Frontend (port 5173 by default)
cd frontend
npm install  # or bun install
npm run dev
```

**Quick start:** Run `./start.sh` (checks MongoDB, installs deps, starts both servers)

### Environment setup:
Backend requires `backend/.env`:
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=myteens_space
SECRET_KEY=<generate-with-openssl-rand-hex-32>
```

Frontend defaults to `http://localhost:8001` for API calls (hardcoded in components, NOT environment variable).

### Debugging:
**Backend:** Check `backend.log` and MongoDB connection. Motor driver requires `async/await` on ALL db operations.
**Frontend:** React DevTools + inspect localStorage (`userId`, `userRole`, `userName`, `initialBalanceScores`). State flows in `Index.tsx` control entire app navigation.

## 📦 Core Data Models

**Lesson structure** (`frontend/src/data/allLessonsData.ts`):
- 44 lessons across 4 modules × 4 weeks each
- 6 question types: `choice`, `input`, `slider`, `emotion`, `matching`, `multiple`
- Each lesson: `id`, `module`, `week`, `xp`, `questions[]`, `completionMessage`
- Example lesson ID pattern: `boundaries-w1-1` (module-week-number)

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

## 🔐 Authentication Flow

1. Curator visits `/curator` → generates access code via `/api/curator/generate-code`
2. Student/parent visits `/login` → enters 6-digit code
3. Backend validates code in `access_codes` collection → creates/returns user
4. Frontend stores `userId`, `userRole`, `userName` in `localStorage`
5. `ProtectedRoute` component guards routes by role (see `App.tsx`)

**Important:** No JWT tokens yet - all auth is localStorage-based. Backend trusts `userId` from requests. `ProtectedRoute` defined but currently unused (all routes open in `App.tsx`).

## 🔄 Data Flow Patterns

**Lesson completion:**
1. Student answers questions → `EnhancedLessonInterface` validates answers client-side
2. On complete → POST `/api/progress/lesson/{id}/complete` with score, answers, time_spent
3. Backend calculates XP (base * score percentage), updates level, checks streak (yesterday/today check), triggers achievements
4. Frontend shows `LessonComplete` with confetti, updates local progress state
5. All 6 question types handled in `EnhancedLessonInterface.tsx`: choice, input, slider, emotion, matching, multiple

**Curator monitoring:**
1. Curator ID stored on user creation (`curator_id` field in users collection)
2. GET `/api/curator/{id}/students` aggregates all students' progress
3. Server calculates module percentages against hardcoded totals: boundaries=12, confidence=12, emotions=10, relationships=10
4. Dashboard displays balance wheels, real-time filtering by name/activity (client-side)

**API patterns:**
- All routes prefixed with `/api` via `api_router` in `server.py`
- Motor async driver: MUST use `await` and `.to_list(n)` for cursors
- Example: `await db.users.find({...}).to_list(1000)` NOT `for doc in db.users.find({...})`

## 🚨 Common Pitfalls

- **Port conflicts:** Backend defaults to 8001 (not 8000) to avoid clashes. Frontend expects `http://localhost:8001` hardcoded.
- **CORS:** Backend allows `localhost:5173` and `localhost:3000` - update `CORSMiddleware` in `server.py` if needed
- **MongoDB connection:** Must be running before backend starts, no auto-retry logic. Check with `pgrep -x "mongod"`
- **LocalStorage keys:** Inconsistent use of `user_id` vs `userId` - prefer `userId` throughout
- **Module IDs:** Use lowercase with no spaces: `boundaries`, `confidence`, `emotions`, `relationships` (matches `ModuleType` enum)
- **Motor async:** Forgetting `await` on db operations causes silent failures. Always `await db.collection.operation()`
- **Cursor iteration:** NEVER use `for doc in db.collection.find()` - use `await db.collection.find().to_list(1000)` instead

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
