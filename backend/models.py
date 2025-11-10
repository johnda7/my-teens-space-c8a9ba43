"""
Модели данных для MyTeens.Space
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    STUDENT = "student"
    PARENT = "parent"
    CURATOR = "curator"


class ModuleType(str, Enum):
    BOUNDARIES = "boundaries"
    CONFIDENCE = "confidence"
    EMOTIONS = "emotions"
    RELATIONSHIPS = "relationships"


class LessonStatus(str, Enum):
    LOCKED = "locked"
    AVAILABLE = "available"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


# ========== User Models ==========
class UserCreate(BaseModel):
    name: str
    age: int
    role: UserRole = UserRole.STUDENT
    curator_id: Optional[str] = None
    parent_id: Optional[str] = None


class User(BaseModel):
    id: str
    name: str
    age: int
    role: UserRole
    curator_id: Optional[str] = None
    parent_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Геймификация
    xp: int = 0
    level: int = 1
    streak: int = 0
    last_activity: Optional[datetime] = None
    achievements: List[str] = []
    
    # Настройки
    notifications_enabled: bool = True
    avatar_url: Optional[str] = None


# ========== Access Code Models ==========
class AccessCode(BaseModel):
    code: str
    curator_id: str
    role: UserRole
    name: str
    age: Optional[int] = None
    used: bool = False
    used_by: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = None


# ========== Balance Assessment Models ==========
class BalanceAssessment(BaseModel):
    id: str
    user_id: str
    type: str  # 'initial' or 'final'
    scores: Dict[str, int]  # categoryId -> score
    answers: Dict[str, str]  # questionId -> answer
    overall_score: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# ========== Lesson Progress Models ==========
class LessonProgress(BaseModel):
    id: str
    user_id: str
    lesson_id: str
    module: ModuleType
    status: LessonStatus = LessonStatus.AVAILABLE
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    score: Optional[int] = None
    xp_earned: int = 0
    time_spent: int = 0  # в секундах
    answers: Dict = {}
    attempts: int = 0


# ========== Check-in Models ==========
class CheckIn(BaseModel):
    id: str
    user_id: str
    mood: str
    anxiety_level: int
    sleep_hours: float
    notes: str = ""
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# ========== Achievement Models ==========
class Achievement(BaseModel):
    id: str
    user_id: str
    achievement_type: str
    title: str
    description: str
    earned_at: datetime = Field(default_factory=datetime.utcnow)


# ========== Notification Models ==========
class Notification(BaseModel):
    id: str
    user_id: str
    type: str  # 'achievement', 'reminder', 'parent_alert', etc.
    title: str
    description: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    read: bool = False
