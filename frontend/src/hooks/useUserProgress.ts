import { useState, useEffect } from 'react';
import { syncProgressToServer, loadProgressFromServer, applyProgressToLocalStorage } from '@/lib/syncUtils';
import { useTelegram } from './useTelegram';

export interface UserProgress {
  xp: number;
  level: number;
  streak: number;
  lastActivity: string | null; // ISO date string
}

export const useUserProgress = () => {
  const { user } = useTelegram();
  const [progress, setProgress] = useState<UserProgress>({
    xp: 0,
    level: 1,
    streak: 0,
    lastActivity: null,
  });

  // Load from localStorage on mount and sync with server
  useEffect(() => {
    const loadAndSync = async () => {
      // 1. Load from localStorage first (fast)
      const storedXP = parseInt(localStorage.getItem('userXP') || '0');
      const storedLevel = parseInt(localStorage.getItem('userLevel') || '1');
      const storedStreak = parseInt(localStorage.getItem('currentStreak') || '0'); // Note: syncUtils uses 'currentStreak'
      const storedLastActivity = localStorage.getItem('lastActivity');

      setProgress({
        xp: storedXP,
        level: storedLevel,
        streak: storedStreak,
        lastActivity: storedLastActivity,
      });

      // 2. Sync with server if Telegram user is available
      if (user?.id) {
        const telegramId = user.id.toString();
        const serverProgress = await loadProgressFromServer(telegramId);
        
        if (serverProgress) {
          applyProgressToLocalStorage(serverProgress);
          // Update state with server data
          setProgress({
            xp: serverProgress.xp,
            level: serverProgress.level,
            streak: serverProgress.streak,
            lastActivity: serverProgress.last_activity,
          });
        } else {
          // If no server progress, sync local to server
          await syncProgressToServer(telegramId);
        }
      }
    };

    loadAndSync();
  }, [user]);

  const addXP = (amount: number) => {
    setProgress(prev => {
      const newXP = prev.xp + amount;
      // Simple level formula: 1 level every 500 XP
      const newLevel = Math.floor(newXP / 500) + 1;
      
      localStorage.setItem('userXP', newXP.toString());
      localStorage.setItem('userLevel', newLevel.toString());
      
      // Check for level up
      if (newLevel > prev.level) {
        console.log('Level Up!', newLevel);
      }

      // Sync to server if possible
      if (user?.id) {
        syncProgressToServer(user.id.toString());
      }

      return { ...prev, xp: newXP, level: newLevel };
    });
  };

  const updateStreak = () => {
    const today = new Date().toISOString().split('T')[0];
    const last = localStorage.getItem('lastActivity');
    
    if (last && last.split('T')[0] === today) return; // Already active today

    let newStreak = 1;
    if (last) {
      const lastDate = new Date(last);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
        newStreak = (parseInt(localStorage.getItem('currentStreak') || '0')) + 1;
      }
    }

    localStorage.setItem('currentStreak', newStreak.toString());
    localStorage.setItem('lastActivity', new Date().toISOString());
    
    setProgress(prev => ({
      ...prev,
      streak: newStreak,
      lastActivity: new Date().toISOString()
    }));

    // Sync to server
    if (user?.id) {
      syncProgressToServer(user.id.toString());
    }
  };

  return {
    progress,
    addXP,
    updateStreak
  };
};
