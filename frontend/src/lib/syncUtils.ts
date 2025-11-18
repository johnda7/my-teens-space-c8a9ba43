// Утилита для синхронизации прогресса с backend через Telegram ID

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface ProgressData {
  completedLessons: string[];
  xp: number;
  level: number;
  coins: number;
  gems: number;
  streak: number;
  energy: number;
  inventory: Record<string, number>;
  balanceScores: Record<string, number>;
}

interface SyncedProgress extends ProgressData {
  telegram_id: string;
  user_id: string;
  name: string;
  role: string;
  last_activity: string;
}

/**
 * Синхронизировать локальный прогресс с сервером
 */
export async function syncProgressToServer(telegramId: string): Promise<boolean> {
  try {
    // Собираем данные из localStorage
    const progressData: ProgressData = {
      completedLessons: JSON.parse(localStorage.getItem('completedLessons') || '[]'),
      xp: parseInt(localStorage.getItem('userXP') || '0'),
      level: parseInt(localStorage.getItem('userLevel') || '1'),
      coins: parseInt(localStorage.getItem('userCoins') || '0'),
      gems: parseInt(localStorage.getItem('userGems') || '0'),
      streak: parseInt(localStorage.getItem('currentStreak') || '0'),
      energy: parseInt(localStorage.getItem('userEnergy') || '100'),
      inventory: JSON.parse(localStorage.getItem('userInventory') || '{}'),
      balanceScores: JSON.parse(localStorage.getItem('initialBalanceScores') || '{}'),
    };

    const response = await fetch(`${API_URL}/sync/progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        telegram_id: telegramId,
        progress_data: progressData,
      }),
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Прогресс синхронизирован с сервером:', result);
    
    // Сохраняем время последней синхронизации
    localStorage.setItem('lastSyncTime', new Date().toISOString());
    
    return true;
  } catch (error) {
    console.error('❌ Ошибка синхронизации прогресса:', error);
    return false;
  }
}

/**
 * Загрузить прогресс с сервера
 */
export async function loadProgressFromServer(telegramId: string): Promise<SyncedProgress | null> {
  try {
    const response = await fetch(`${API_URL}/sync/progress/${telegramId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log('⚠️ Пользователь не найден на сервере - первый запуск');
        return null;
      }
      throw new Error(`Load failed: ${response.statusText}`);
    }

    const progress: SyncedProgress = await response.json();
    console.log('✅ Прогресс загружен с сервера:', progress);
    
    return progress;
  } catch (error) {
    console.error('❌ Ошибка загрузки прогресса:', error);
    return null;
  }
}

/**
 * Применить загруженный прогресс к localStorage
 */
export function applyProgressToLocalStorage(progress: SyncedProgress) {
  localStorage.setItem('userId', progress.user_id);
  localStorage.setItem('userName', progress.name);
  localStorage.setItem('userRole', progress.role);
  localStorage.setItem('telegramId', progress.telegram_id);
  
  localStorage.setItem('completedLessons', JSON.stringify(progress.completedLessons));
  localStorage.setItem('userXP', progress.xp.toString());
  localStorage.setItem('userLevel', progress.level.toString());
  localStorage.setItem('userCoins', progress.coins.toString());
  localStorage.setItem('userGems', progress.gems.toString());
  localStorage.setItem('currentStreak', progress.streak.toString());
  localStorage.setItem('userEnergy', progress.energy.toString());
  localStorage.setItem('userInventory', JSON.stringify(progress.inventory));
  localStorage.setItem('initialBalanceScores', JSON.stringify(progress.balanceScores));
  
  localStorage.setItem('lastSyncTime', new Date().toISOString());
  
  console.log('✅ Прогресс применён к localStorage');
}

/**
 * Завершить урок с синхронизацией
 */
export async function completeLessonWithSync(
  telegramId: string,
  lessonId: string,
  score: number,
  answers: Record<string, any>,
  timeSpent: number,
  xpEarned: number
): Promise<{ success: boolean; data?: any }> {
  try {
    const response = await fetch(`${API_URL}/telegram/complete-lesson`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        telegram_id: telegramId,
        lesson_id: lessonId,
        score,
        answers,
        time_spent: timeSpent,
        xp_earned: xpEarned,
      }),
    });

    if (!response.ok) {
      throw new Error(`Complete lesson failed: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Урок завершён на сервере:', result);
    
    return { success: true, data: result };
  } catch (error) {
    console.error('❌ Ошибка завершения урока:', error);
    return { success: false };
  }
}

/**
 * Полная синхронизация при запуске приложения
 */
export async function fullSync(telegramId: string): Promise<boolean> {
  try {
    console.log('🔄 Начинаем полную синхронизацию...');
    
    // 1. Пытаемся загрузить прогресс с сервера
    const serverProgress = await loadProgressFromServer(telegramId);
    
    if (serverProgress) {
      // Есть прогресс на сервере - применяем его
      applyProgressToLocalStorage(serverProgress);
      console.log('✅ Синхронизация завершена: данные загружены с сервера');
      return true;
    } else {
      // Нет прогресса на сервере - отправляем локальный
      const syncResult = await syncProgressToServer(telegramId);
      if (syncResult) {
        console.log('✅ Синхронизация завершена: локальные данные отправлены на сервер');
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('❌ Ошибка полной синхронизации:', error);
    return false;
  }
}

/**
 * Автоматическая синхронизация каждые N минут
 */
export function setupAutoSync(telegramId: string, intervalMinutes: number = 5) {
  const intervalMs = intervalMinutes * 60 * 1000;
  
  const syncInterval = setInterval(async () => {
    console.log('⏰ Автоматическая синхронизация...');
    await syncProgressToServer(telegramId);
  }, intervalMs);
  
  // Синхронизация при закрытии/перезагрузке страницы
  window.addEventListener('beforeunload', () => {
    syncProgressToServer(telegramId);
  });
  
  return () => {
    clearInterval(syncInterval);
  };
}

/**
 * Проверить нужна ли синхронизация (если прошло >5 минут)
 */
export function needsSync(): boolean {
  const lastSync = localStorage.getItem('lastSyncTime');
  if (!lastSync) return true;
  
  const lastSyncTime = new Date(lastSync).getTime();
  const now = new Date().getTime();
  const minutesSinceSync = (now - lastSyncTime) / 1000 / 60;
  
  return minutesSinceSync > 5;
}
