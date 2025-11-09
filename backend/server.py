from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List
import uuid
from datetime import datetime


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

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

# ========== User Routes ==========
@api_router.post("/users", response_model=User)
async def create_user(user: UserCreate):
    existing = await db.users.find_one({"user_id": user.user_id})
    if existing:
        return User(**existing)
    
    user_obj = User(**user.dict())
    await db.users.insert_one(user_obj.dict())
    return user_obj

@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    user = await db.users.find_one({"user_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**user)

# ========== Balance Assessment Routes ==========
@api_router.post("/balance-assessment", response_model=BalanceAssessment)
async def save_balance_assessment(assessment: BalanceAssessment):
    await db.balance_assessments.insert_one(assessment.dict())
    return assessment

@api_router.get("/balance-assessment/{user_id}")
async def get_balance_assessments(user_id: str):
    assessments = await db.balance_assessments.find({"user_id": user_id}).to_list(100)
    return [BalanceAssessment(**a) for a in assessments]

@api_router.get("/balance-assessment/{user_id}/latest")
async def get_latest_assessment(user_id: str, type: str = None):
    query = {"user_id": user_id}
    if type:
        query["type"] = type
    assessment = await db.balance_assessments.find_one(query, sort=[("timestamp", -1)])
    if not assessment:
        return None
    return BalanceAssessment(**assessment)

# ========== Lesson Progress Routes ==========
@api_router.post("/lesson-progress", response_model=LessonProgress)
async def save_lesson_progress(progress: LessonProgress):
    if progress.completed and not progress.completed_at:
        progress.completed_at = datetime.utcnow()
    
    existing = await db.lesson_progress.find_one({
        "user_id": progress.user_id,
        "lesson_id": progress.lesson_id
    })
    
    if existing:
        await db.lesson_progress.update_one(
            {"id": existing["id"]},
            {"$set": progress.dict()}
        )
    else:
        await db.lesson_progress.insert_one(progress.dict())
    
    # Update user XP
    if progress.completed and progress.xp_earned > 0:
        await db.users.update_one(
            {"user_id": progress.user_id},
            {"$inc": {"xp": progress.xp_earned}}
        )
    
    return progress

@api_router.get("/lesson-progress/{user_id}")
async def get_lesson_progress(user_id: str):
    progress_list = await db.lesson_progress.find({"user_id": user_id}).to_list(1000)
    return [LessonProgress(**p) for p in progress_list]

@api_router.get("/lesson-progress/{user_id}/stats")
async def get_user_stats(user_id: str):
    progress_list = await db.lesson_progress.find({"user_id": user_id}).to_list(1000)
    completed = [p for p in progress_list if p.get("completed")]
    
    modules_stats = {}
    for module in ["boundaries", "confidence", "emotions", "relationships"]:
        module_lessons = [p for p in progress_list if p.get("module") == module]
        module_completed = [p for p in module_lessons if p.get("completed")]
        modules_stats[module] = {
            "total": len(module_lessons),
            "completed": len(module_completed),
            "progress": (len(module_completed) / len(module_lessons) * 100) if module_lessons else 0
        }
    
    return {
        "total_lessons": len(progress_list),
        "completed_lessons": len(completed),
        "modules": modules_stats
    }

# ========== Check-in Routes ==========
@api_router.post("/checkin", response_model=CheckIn)
async def save_checkin(checkin: CheckIn):
    await db.checkins.insert_one(checkin.dict())
    
    # Update user last activity
    await db.users.update_one(
        {"user_id": checkin.user_id},
        {"$set": {"last_activity": datetime.utcnow()}}
    )
    
    return checkin

@api_router.get("/checkin/{user_id}")
async def get_checkins(user_id: str, limit: int = 30):
    checkins = await db.checkins.find({"user_id": user_id}).sort("timestamp", -1).to_list(limit)
    return [CheckIn(**c) for c in checkins]

# ========== Root ==========
@api_router.get("/")
async def root():
    return {
        "app": "MyTeens.Space API",
        "version": "1.0.0",
        "endpoints": {
            "users": "/api/users",
            "balance": "/api/balance-assessment",
            "progress": "/api/lesson-progress",
            "checkin": "/api/checkin"
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
