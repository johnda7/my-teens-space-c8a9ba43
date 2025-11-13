"""
Модуль для аутентификации пользователей через Telegram WebApp
Валидация initData согласно документации Telegram: 
https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
"""
import hmac
import hashlib
from urllib.parse import parse_qsl
from typing import Optional, Dict
import os


def validate_telegram_webapp_data(init_data: str, bot_token: Optional[str] = None) -> bool:
    """
    Проверяет подлинность данных, полученных от Telegram WebApp
    
    Args:
        init_data: Строка initData от Telegram WebApp
        bot_token: Telegram Bot Token (если None, берется из env TELEGRAM_BOT_TOKEN)
    
    Returns:
        bool: True если данные валидны, False если нет
    """
    if not bot_token:
        bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
        
    if not bot_token:
        raise ValueError("TELEGRAM_BOT_TOKEN не найден в environment variables")
    
    try:
        # Парсим initData
        parsed_data = dict(parse_qsl(init_data))
        
        # Извлекаем hash из данных
        received_hash = parsed_data.pop('hash', None)
        if not received_hash:
            return False
        
        # Сортируем пары ключ-значение по ключу
        data_check_string = '\n'.join(
            f"{key}={value}" 
            for key, value in sorted(parsed_data.items())
        )
        
        # Создаем секретный ключ из bot token
        secret_key = hmac.new(
            key=b"WebAppData",
            msg=bot_token.encode(),
            digestmod=hashlib.sha256
        ).digest()
        
        # Вычисляем hash
        calculated_hash = hmac.new(
            key=secret_key,
            msg=data_check_string.encode(),
            digestmod=hashlib.sha256
        ).hexdigest()
        
        # Сравниваем хеши (constant-time comparison)
        return hmac.compare_digest(calculated_hash, received_hash)
        
    except Exception as e:
        print(f"Ошибка валидации Telegram WebApp data: {e}")
        return False


def parse_telegram_user_data(init_data: str) -> Optional[Dict]:
    """
    Извлекает данные пользователя из initData
    
    Args:
        init_data: Строка initData от Telegram WebApp
    
    Returns:
        Dict с данными пользователя или None если ошибка
    """
    try:
        import json
        parsed_data = dict(parse_qsl(init_data))
        
        if 'user' in parsed_data:
            user_data = json.loads(parsed_data['user'])
            return {
                'telegram_id': str(user_data.get('id')),
                'first_name': user_data.get('first_name', ''),
                'last_name': user_data.get('last_name', ''),
                'username': user_data.get('username', ''),
                'language_code': user_data.get('language_code', 'ru'),
                'is_premium': user_data.get('is_premium', False),
                'photo_url': user_data.get('photo_url', ''),
            }
        return None
        
    except Exception as e:
        print(f"Ошибка парсинга user data: {e}")
        return None
