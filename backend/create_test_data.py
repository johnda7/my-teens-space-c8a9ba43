#!/usr/bin/env python3
"""
Скрипт для создания тестовых данных
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import uuid
from datetime import datetime, timedelta
import random
import string

# MongoDB подключение
client = AsyncIOMotorClient('mongodb://localhost:27017')
db = client['myteens_space']

async def create_curator():
    """Создать куратора"""
    curator_id = str(uuid.uuid4())
    curator = {
        "id": curator_id,
        "name": "Тестовый Куратор",
        "age": 30,
        "role": "curator",
        "created_at": datetime.utcnow(),
        "xp": 0,
        "level": 1,
        "streak": 0,
        "achievements": [],
        "notifications_enabled": True
    }
    
    await db.users.insert_one(curator)
    print(f"✅ Куратор создан: ID = {curator_id}")
    return curator_id

async def generate_code(curator_id):
    """Сгенерировать код доступа"""
    # Генерируем уникальный 6-значный код
    code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    
    access_code = {
        "code": code,
        "curator_id": curator_id,
        "role": "student",
        "name": "Тестовый Ученик",
        "age": 14,
        "used": False,
        "created_at": datetime.utcnow(),
        "expires_at": datetime.utcnow() + timedelta(days=30)
    }
    
    await db.access_codes.insert_one(access_code)
    print(f"✅ Код для ученика создан: {code}")
    return code

async def generate_curator_code(curator_id):
    """Сгенерировать код для входа куратора"""
    code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    
    access_code = {
        "code": code,
        "curator_id": curator_id,
        "role": "curator",
        "name": "Тестовый Куратор",
        "age": 30,
        "used": False,
        "created_at": datetime.utcnow(),
        "expires_at": datetime.utcnow() + timedelta(days=30)
    }
    
    await db.access_codes.insert_one(access_code)
    print(f"✅ Код для куратора создан: {code}")
    return code

async def main():
    print("\n🎯 Создание тестовых данных для MyTeens.Space\n")
    
    # Создаем куратора
    curator_id = await create_curator()
    
    # Генерируем коды
    student_code = await generate_code(curator_id)
    curator_code = await generate_curator_code(curator_id)
    
    print("\n" + "="*50)
    print("📋 ТЕСТОВЫЕ КОДЫ ДОСТУПА:")
    print("="*50)
    print(f"\n👨‍🎓 Код для УЧЕНИКА: {student_code}")
    print(f"👨‍🏫 Код для КУРАТОРА: {curator_code}")
    print("\n💡 Введите любой из кодов на странице http://localhost:3001")
    print("="*50 + "\n")

if __name__ == "__main__":
    asyncio.run(main())
