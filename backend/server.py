from fastapi import FastAPI, APIRouter, HTTPException, BackgroundTasks
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timedelta
import random
import string

# Импортируем модели (сначала загружаем .env, потом импортируем)
ROOT_DIR = Path(__file__).parent

# Импорты моделей будут после определения классов
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'myteens_space')]

# Create the main app without a prefix
app = FastAPI(title="MyTeens.Space API", version="2.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# ========== Models ==========
class UserCreate(BaseModel):
    user_id: str
    name: str
    age: int
    telegram_id: str = None

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    age: int
    telegram_id: str = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    xp: int = 0
    level: int = 1
    streak: int = 0
    last_activity: datetime = Field(default_factory=datetime.utcnow)

class BalanceAssessment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    type: str  # 'initial' or 'final'
    scores: dict  # categoryId -> score
    answers: dict  # questionId -> answer
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class LessonProgress(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    lesson_id: str
    module: str
    completed: bool = False
    xp_earned: int = 0
    answers: dict = {}
    completed_at: datetime = None

class CheckIn(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    mood: str
    anxiety_level: int
    sleep_hours: float
    notes: str = ""
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# ========== Authentication & Authorization ==========

@api_router.post("/auth/login")
async def login_with_code(code: str):
    """Вход по уникальному коду"""
    code = code.upper().strip()
    
    # Проверяем код в базе
    access_code = await db.access_codes.find_one({"code": code, "used": False})
    if not access_code:
        raise HTTPException(status_code=404, detail="Неверный или использованный код")
    
    # Проверяем срок действия
    if access_code.get("expires_at") and access_code["expires_at"] < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Код истек")
    
    # Создаем или получаем пользователя
    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "name": access_code.get("name", "Ученик"),
        "age": access_code.get("age", 14),
        "role": access_code["role"],
        "curator_id": access_code.get("curator_id"),
        "created_at": datetime.utcnow(),
        "xp": 0,
        "level": 1,
        "streak": 0,
        "achievements": [],
        "notifications_enabled": True,
        "last_activity": datetime.utcnow()
    }
    
    result = await db.users.insert_one(user)
    
    # Помечаем код как использованный
    await db.access_codes.update_one(
        {"code": code},
        {"$set": {"used": True, "used_by": user_id, "used_at": datetime.utcnow()}}
    )
    
    return {
        "user": user,
        "message": "Успешный вход"
    }


@api_router.post("/auth/create-curator")
async def create_curator(name: str, age: int = 30):
    """Создать учетную запись куратора"""
    curator_id = str(uuid.uuid4())
    curator = {
        "id": curator_id,
        "name": name,
        "age": age,
        "role": UserRole.CURATOR,
        "created_at": datetime.utcnow(),
        "xp": 0,
        "level": 1,
        "streak": 0,
        "achievements": [],
        "notifications_enabled": True
    }
    
    await db.users.insert_one(curator)
    
    # Генерируем персональный код для куратора
    code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
    
    return {
        "curator": curator,
        "access_code": code,
        "message": "Куратор создан. Используйте этот код для входа."
    }


# ========== User Management ==========

@api_router.get("/users/{user_id}")
async def get_user(user_id: str):
    """Получить информацию о пользователе"""
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    user.pop("_id", None)
    return user


@api_router.put("/users/{user_id}")
async def update_user(user_id: str, update_data: Dict):
    """Обновить информацию о пользователе"""
    allowed_fields = ["name", "age", "avatar_url", "notifications_enabled"]
    filtered_data = {k: v for k, v in update_data.items() if k in allowed_fields}
    
    if filtered_data:
        await db.users.update_one(
            {"id": user_id},
            {"$set": filtered_data}
        )
    
    return {"message": "Профиль обновлен"}


# ========== Curator Management ==========

@api_router.post("/curator/generate-code")
async def generate_student_code(curator_id: str, student_name: str, student_age: int):
    """Генерация кода для нового ученика"""
    # Проверяем, что куратор существует
    curator = await db.users.find_one({"id": curator_id, "role": UserRole.CURATOR})
    if not curator:
        raise HTTPException(status_code=404, detail="Куратор не найден")
    
    # Генерируем уникальный 6-значный код
    code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    
    # Проверяем уникальность
    while await db.access_codes.find_one({"code": code}):
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    
    # Сохраняем в базу
    access_code = {
        "code": code,
        "curator_id": curator_id,
        "role": UserRole.STUDENT,
        "name": student_name,
        "age": student_age,
        "used": False,
        "created_at": datetime.utcnow(),
        "expires_at": datetime.utcnow() + timedelta(days=30)
    }
    
    await db.access_codes.insert_one(access_code)
    
    return {
        "code": code,
        "expires_at": access_code["expires_at"],
        "message": f"Код для {student_name} создан"
    }


@api_router.get("/curator/{curator_id}/students")
async def get_curator_students(curator_id: str):
    """Получить всех учеников куратора"""
    students = await db.users.find({"curator_id": curator_id, "role": UserRole.STUDENT}).to_list(1000)
    
    result = []
    for student in students:
        student.pop("_id", None)
        
        # Получаем прогресс
        all_progress = await db.lesson_progress.find({"user_id": student["id"]}).to_list(1000)
        
        # Считаем прогресс по модулям
        module_totals = {
            "boundaries": 12,
            "confidence": 12,
            "emotions": 10,
            "relationships": 10
        }
        
        module_progress = {}
        for module in ModuleType:
            module_lessons = [p for p in all_progress if p.get("module") == module.value]
            completed = len([p for p in module_lessons if p.get("status") == "completed"])
            total = module_totals.get(module.value, 10)
            module_progress[module.value] = round((completed / total * 100) if total else 0, 1)
        
        # Получаем последнюю оценку баланса
        balances = await db.balance_assessments.find(
            {"user_id": student["id"]}
        ).sort("timestamp", -1).to_list(2)
        
        result.append({
            "id": student["id"],
            "name": student.get("name", "Ученик"),
            "age": student.get("age", 14),
            "lastActive": student.get("last_activity", student.get("created_at")),
            "progress": module_progress,
            "completedLessons": len([p for p in all_progress if p.get("status") == "completed"]),
            "totalXP": student.get("xp", 0),
            "level": student.get("level", 1),
            "streak": student.get("streak", 0),
            "initialBalance": balances[1]["scores"] if len(balances) > 1 else None,
            "currentBalance": balances[0]["scores"] if balances else None
        })
    
    return result


@api_router.get("/curator/{curator_id}/codes")
async def get_curator_codes(curator_id: str):
    """Получить все коды куратора"""
    codes = await db.access_codes.find({"curator_id": curator_id}).to_list(100)
    
    for code in codes:
        code.pop("_id", None)
    
    return codes


# ========== Old User Routes (kept for compatibility) ==========

# ========== Old User Routes (kept for compatibility) ==========
@api_router.post("/users", response_model=User)
async def create_user(user: UserCreate):
    user_id = str(uuid.uuid4())
    existing = await db.users.find_one({"id": user_id})
    if existing:
        existing.pop("_id", None)
        return User(**existing)
    
    user_obj = {
        "id": user_id,
        **user.dict(),
        "created_at": datetime.utcnow(),
        "xp": 0,
        "level": 1,
        "streak": 0,
        "achievements": [],
        "notifications_enabled": True
    }
    await db.users.insert_one(user_obj)
    return User(**user_obj)


# ========== Lesson Progress Routes ==========

@api_router.post("/progress/lesson/{lesson_id}/start")
async def start_lesson(lesson_id: str, user_id: str, module: str):
    """Начать урок"""
    # Создаем или обновляем прогресс урока
    progress_id = str(uuid.uuid4())
    progress = {
        "id": progress_id,
        "user_id": user_id,
        "lesson_id": lesson_id,
        "module": module,
        "status": "in_progress",
        "started_at": datetime.utcnow(),
        "attempts": 1,
        "time_spent": 0,
        "answers": {}
    }
    
    # Проверяем существующий прогресс
    existing = await db.lesson_progress.find_one({"user_id": user_id, "lesson_id": lesson_id})
    
    if existing:
        await db.lesson_progress.update_one(
            {"user_id": user_id, "lesson_id": lesson_id},
            {
                "$set": {"status": "in_progress", "started_at": datetime.utcnow()},
                "$inc": {"attempts": 1}
            }
        )
    else:
        await db.lesson_progress.insert_one(progress)
    
    # Обновляем последнюю активность
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"last_activity": datetime.utcnow()}}
    )
    
    return {"message": "Урок начат", "status": "in_progress"}


@api_router.post("/progress/lesson/{lesson_id}/complete")
async def complete_lesson(
    lesson_id: str,
    user_id: str,
    score: int,
    answers: dict,
    time_spent: int
):
    """Завершить урок"""
    # Обновляем прогресс урока
    await db.lesson_progress.update_one(
        {"user_id": user_id, "lesson_id": lesson_id},
        {
            "$set": {
                "status": "completed",
                "completed_at": datetime.utcnow(),
                "score": score,
                "answers": answers,
                "time_spent": time_spent
            }
        }
    )
    
    # Начисляем XP
    xp_earned = score * 10  # 10 XP за каждый процент
    user = await db.users.find_one({"id": user_id})
    new_xp = user.get("xp", 0) + xp_earned
    new_level = (new_xp // 1000) + 1  # Новый уровень каждые 1000 XP
    
    # Обновляем XP в прогрессе
    await db.lesson_progress.update_one(
        {"user_id": user_id, "lesson_id": lesson_id},
        {"$set": {"xp_earned": xp_earned}}
    )
    
    # Обновляем стрик
    last_activity = user.get("last_activity")
    streak_days = user.get("streak", 0)
    
    if last_activity:
        days_diff = (datetime.utcnow() - last_activity).days
        if days_diff == 1:
            streak_days += 1
        elif days_diff > 1:
            streak_days = 1
    else:
        streak_days = 1
    
    await db.users.update_one(
        {"id": user_id},
        {
            "$set": {
                "xp": new_xp,
                "level": new_level,
                "streak": streak_days,
                "last_activity": datetime.utcnow()
            }
        }
    )
    
    # Проверка достижений
    achievements = await check_achievements(user_id, new_xp, new_level, streak_days)
    
    return {
        "message": "Урок завершен",
        "xp_earned": xp_earned,
        "new_xp": new_xp,
        "new_level": new_level,
        "streak_days": streak_days,
        "achievements": achievements
    }


async def check_achievements(user_id: str, xp: int, level: int, streak: int) -> List[str]:
    """Проверка и начисление достижений"""
    new_achievements = []
    
    # Правила достижений
    achievements_rules = [
        ("first_lesson", "Первый урок пройден!", lambda: True),
        ("level_5", "Достигнут 5 уровень!", lambda: level >= 5),
        ("level_10", "Достигнут 10 уровень!", lambda: level >= 10),
        ("level_20", "Достигнут 20 уровень!", lambda: level >= 20),
        ("streak_3", "3 дня подряд!", lambda: streak >= 3),
        ("streak_7", "7 дней подряд!", lambda: streak >= 7),
        ("streak_30", "30 дней подряд!", lambda: streak >= 30),
        ("xp_1000", "1000 XP заработано!", lambda: xp >= 1000),
        ("xp_5000", "5000 XP заработано!", lambda: xp >= 5000),
        ("xp_10000", "10000 XP заработано!", lambda: xp >= 10000),
    ]
    
    user = await db.users.find_one({"id": user_id})
    current_achievements = user.get("achievements", [])
    
    for achievement_id, description, condition in achievements_rules:
        if achievement_id not in current_achievements and condition():
            new_achievements.append(achievement_id)
            
            # Добавляем достижение
            await db.users.update_one(
                {"id": user_id},
                {"$push": {"achievements": achievement_id}}
            )
            
            # Сохраняем уведомление о достижении
            notification_id = str(uuid.uuid4())
            await db.notifications.insert_one({
                "id": notification_id,
                "user_id": user_id,
                "type": "achievement",
                "title": "Новое достижение!",
                "description": description,
                "created_at": datetime.utcnow(),
                "read": False
            })
    
    return new_achievements


@api_router.get("/progress/{user_id}")
async def get_user_progress(user_id: str):
    """Получить весь прогресс пользователя"""
    progress_list = await db.lesson_progress.find({"user_id": user_id}).to_list(1000)
    
    for p in progress_list:
        p.pop("_id", None)
    
    return progress_list


@api_router.get("/progress/{user_id}/stats")
async def get_user_stats(user_id: str):
    """Получить статистику пользователя"""
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    progress_list = await db.lesson_progress.find({"user_id": user_id}).to_list(1000)
    completed = [p for p in progress_list if p.get("status") == "completed"]
    
    # Прогресс по модулям
    module_totals = {
        "boundaries": 12,
        "confidence": 12,
        "emotions": 10,
        "relationships": 10
    }
    
    modules_stats = {}
    for module, total in module_totals.items():
        module_lessons = [p for p in progress_list if p.get("module") == module]
        module_completed = [p for p in module_lessons if p.get("status") == "completed"]
        modules_stats[module] = {
            "total": total,
            "completed": len(module_completed),
            "progress": round((len(module_completed) / total * 100) if total else 0, 1)
        }
    
    # Общее время обучения
    total_time = sum(p.get("time_spent", 0) for p in progress_list)
    
    # Средний балл
    completed_with_score = [p for p in completed if p.get("score") is not None]
    avg_score = sum(p["score"] for p in completed_with_score) / len(completed_with_score) if completed_with_score else 0
    
    return {
        "user_id": user_id,
        "level": user.get("level", 1),
        "xp": user.get("xp", 0),
        "streak": user.get("streak", 0),
        "total_lessons": len(progress_list),
        "completed_lessons": len(completed),
        "total_time_minutes": total_time // 60,
        "average_score": round(avg_score, 1),
        "achievements": user.get("achievements", []),
        "modules": modules_stats
    }


# ========== Balance Assessment Routes ==========
@api_router.post("/balance-assessment")
async def save_balance_assessment(user_id: str, type: str, scores: dict, answers: dict):
    """Сохранить оценку колеса баланса"""
    # Валидация оценок (0-10)
    for area, score in scores.items():
        if not isinstance(score, (int, float)) or score < 0 or score > 10:
            raise HTTPException(status_code=400, detail=f"Неверная оценка для {area}")
    
    # Расчет общего балла
    overall_score = sum(scores.values()) / len(scores) if scores else 0
    
    assessment_id = str(uuid.uuid4())
    assessment = {
        "id": assessment_id,
        "user_id": user_id,
        "type": type,
        "scores": scores,
        "answers": answers,
        "overall_score": round(overall_score, 2),
        "timestamp": datetime.utcnow()
    }
    
    await db.balance_assessments.insert_one(assessment)
    
    return {
        "id": assessment_id,
        "overall_score": overall_score,
        "message": "Оценка сохранена"
    }


@api_router.get("/balance-assessment/{user_id}")
async def get_balance_assessments(user_id: str):
    """Получить все оценки баланса пользователя"""
    assessments = await db.balance_assessments.find({"user_id": user_id}).sort("timestamp", -1).to_list(100)
    
    for a in assessments:
        a.pop("_id", None)
    
    return assessments


@api_router.get("/balance-assessment/{user_id}/latest")
async def get_latest_assessment(user_id: str, type: str = None):
    """Получить последнюю оценку баланса"""
    query = {"user_id": user_id}
    if type:
        query["type"] = type
    
    assessment = await db.balance_assessments.find_one(query, sort=[("timestamp", -1)])
    if not assessment:
        return None
    
    assessment.pop("_id", None)
    return assessment


# ========== Notifications ==========

@api_router.get("/notifications/{user_id}")
async def get_notifications(user_id: str, unread_only: bool = False):
    """Получить уведомления пользователя"""
    query = {"user_id": user_id}
    if unread_only:
        query["read"] = False
    
    notifications = await db.notifications.find(query).sort("created_at", -1).limit(50).to_list(None)
    
    for n in notifications:
        n.pop("_id", None)
    
    return notifications


@api_router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str):
    """Отметить уведомление как прочитанное"""
    await db.notifications.update_one(
        {"id": notification_id},
        {"$set": {"read": True}}
    )
    return {"message": "Уведомление прочитано"}


# ========== Check-in Routes ==========
@api_router.post("/checkin")
async def save_checkin(user_id: str, mood: str, anxiety_level: int, sleep_hours: float, notes: str = ""):
    """Сохранить ежедневный чек-ин"""
    checkin_id = str(uuid.uuid4())
    checkin = {
        "id": checkin_id,
        "user_id": user_id,
        "mood": mood,
        "anxiety_level": anxiety_level,
        "sleep_hours": sleep_hours,
        "notes": notes,
        "timestamp": datetime.utcnow()
    }
    
    await db.checkins.insert_one(checkin)
    
    # Обновляем последнюю активность
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"last_activity": datetime.utcnow()}}
    )
    
    return {"id": checkin_id, "message": "Чек-ин сохранен"}


@api_router.get("/checkin/{user_id}")
async def get_checkins(user_id: str, limit: int = 30):
    """Получить историю чек-инов"""
    checkins = await db.checkins.find({"user_id": user_id}).sort("timestamp", -1).limit(limit).to_list(None)
    
    for c in checkins:
        c.pop("_id", None)
    
    return checkins


# ========== Parent Dashboard ==========

@api_router.get("/parent/{parent_id}/children")
async def get_parent_children(parent_id: str):
    """Получить детей родителя"""
    children = await db.users.find({"parent_id": parent_id, "role": UserRole.STUDENT}).to_list(100)
    
    result = []
    for child in children:
        child.pop("_id", None)
        
        # Получаем последний прогресс
        last_progress = await db.lesson_progress.find_one(
            {"user_id": child["id"]},
            sort=[("started_at", -1)]
        )
        
        if last_progress:
            last_progress.pop("_id", None)
        
        # Получаем последнюю оценку баланса
        last_balance = await db.balance_assessments.find_one(
            {"user_id": child["id"]},
            sort=[("timestamp", -1)]
        )
        
        result.append({
            **child,
            "last_lesson": last_progress,
            "last_balance_score": last_balance.get("overall_score") if last_balance else None
        })
    
    return result


# ========== Root ==========
@api_router.get("/")
async def root():
    return {
        "app": "MyTeens.Space API",
        "version": "2.0.0",
        "endpoints": {
            "auth": "/api/auth",
            "users": "/api/users",
            "curator": "/api/curator",
            "balance": "/api/balance-assessment",
            "progress": "/api/progress",
            "notifications": "/api/notifications",
            "checkin": "/api/checkin",
            "parent": "/api/parent"
        }
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
