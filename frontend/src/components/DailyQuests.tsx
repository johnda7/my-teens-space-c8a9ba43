import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Target, CheckCircle2, Gift } from 'lucide-react';
import { Progress } from './ui/progress';
import confetti from 'canvas-confetti';

interface Quest {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  rewards: {
    xp?: number;
    coins?: number;
    gems?: number;
    energy?: number;
  };
  completed: boolean;
}

const DEFAULT_QUESTS: Quest[] = [
  {
    id: 'daily-1',
    title: 'Пройди 3 урока',
    description: 'Завершить любые 3 урока',
    progress: 0,
    target: 3,
    rewards: { xp: 50, coins: 100 },
    completed: false,
  },
  {
    id: 'daily-2',
    title: 'Набери 100 XP',
    description: 'Получить 100 очков опыта',
    progress: 0,
    target: 100,
    rewards: { gems: 5 },
    completed: false,
  },
  {
    id: 'daily-3',
    title: 'Сыграй в мини-игру',
    description: 'Сыграть в любую мини-игру',
    progress: 0,
    target: 1,
    rewards: { energy: 20, coins: 50 },
    completed: false,
  },
];

export const DailyQuests = () => {
  const [quests, setQuests] = useState<Quest[]>(() => {
    const saved = localStorage.getItem('dailyQuests');
    const lastReset = localStorage.getItem('lastQuestReset');
    
    // Проверяем нужно ли сбросить квесты (новый день)
    const today = new Date().toDateString();
    if (lastReset !== today) {
      localStorage.setItem('lastQuestReset', today);
      localStorage.setItem('dailyQuests', JSON.stringify(DEFAULT_QUESTS));
      return DEFAULT_QUESTS;
    }
    
    return saved ? JSON.parse(saved) : DEFAULT_QUESTS;
  });

  const updateQuestProgress = (questId: string, progress: number) => {
    setQuests(prev => {
      const updated = prev.map(quest => {
        if (quest.id === questId && !quest.completed) {
          const newProgress = Math.min(progress, quest.target);
          const isCompleted = newProgress >= quest.target;
          
          if (isCompleted && !quest.completed) {
            // Показываем конфетти при завершении квеста
            confetti({
              particleCount: 30,
              spread: 60,
              origin: { y: 0.7 },
            });
          }
          
          return { ...quest, progress: newProgress, completed: isCompleted };
        }
        return quest;
      });
      
      localStorage.setItem('dailyQuests', JSON.stringify(updated));
      return updated;
    });
  };

  const claimReward = (questId: string) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest || !quest.completed) return;

    // Начисляем награды
    if (quest.rewards.xp) {
      const currentXP = parseInt(localStorage.getItem('userXP') || '0');
      localStorage.setItem('userXP', (currentXP + quest.rewards.xp).toString());
    }
    if (quest.rewards.coins) {
      const currentCoins = parseInt(localStorage.getItem('userCoins') || '0');
      localStorage.setItem('userCoins', (currentCoins + quest.rewards.coins).toString());
    }
    if (quest.rewards.gems) {
      const currentGems = parseInt(localStorage.getItem('userGems') || '0');
      localStorage.setItem('userGems', (currentGems + quest.rewards.gems).toString());
    }

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
    });

    // Помечаем как забранное
    setQuests(prev => {
      const updated = prev.filter(q => q.id !== questId);
      localStorage.setItem('dailyQuests', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className="space-y-3">
      {quests.map((quest, index) => (
        <motion.div
          key={quest.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-md border-2 ${
            quest.completed ? 'border-green-400' : 'border-white/60'
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {quest.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <Target className="w-5 h-5 text-purple-500" />
                )}
                <h4 className="font-semibold text-slate-900">{quest.title}</h4>
              </div>
              <p className="text-xs text-slate-600">{quest.description}</p>
            </div>
            
            {quest.completed && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => claimReward(quest.id)}
                className="flex items-center gap-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold"
              >
                <Gift className="w-3 h-3" />
                Забрать
              </motion.button>
            )}
          </div>

          {/* Прогресс */}
          <div className="space-y-1">
            <Progress 
              value={(quest.progress / quest.target) * 100} 
              className="h-2"
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-600">
                {quest.progress}/{quest.target}
              </span>
              
              {/* Награды */}
              <div className="flex items-center gap-2 text-xs">
                {quest.rewards.xp && (
                  <span className="text-purple-600 font-semibold">+{quest.rewards.xp} XP</span>
                )}
                {quest.rewards.coins && (
                  <span className="flex items-center gap-0.5">
                    🪙 {quest.rewards.coins}
                  </span>
                )}
                {quest.rewards.gems && (
                  <span className="flex items-center gap-0.5">
                    💎 {quest.rewards.gems}
                  </span>
                )}
                {quest.rewards.energy && (
                  <span className="flex items-center gap-0.5">
                    ⚡ {quest.rewards.energy}
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}

      {quests.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 mb-1">Все квесты выполнены! 🎉</h3>
          <p className="text-sm text-slate-600">Новые задания появятся завтра</p>
        </motion.div>
      )}
    </div>
  );
};

// Хук для обновления прогресса квестов
export const useQuestProgress = () => {
  const updateLessonQuest = () => {
    const saved = localStorage.getItem('dailyQuests');
    if (!saved) return;
    
    const quests: Quest[] = JSON.parse(saved);
    const lessonQuest = quests.find(q => q.id === 'daily-1');
    
    if (lessonQuest && !lessonQuest.completed) {
      const updated = quests.map(q => 
        q.id === 'daily-1' ? { ...q, progress: q.progress + 1 } : q
      );
      localStorage.setItem('dailyQuests', JSON.stringify(updated));
    }
  };

  const updateXPQuest = (xpEarned: number) => {
    const saved = localStorage.getItem('dailyQuests');
    if (!saved) return;
    
    const quests: Quest[] = JSON.parse(saved);
    const xpQuest = quests.find(q => q.id === 'daily-2');
    
    if (xpQuest && !xpQuest.completed) {
      const updated = quests.map(q => 
        q.id === 'daily-2' ? { ...q, progress: q.progress + xpEarned } : q
      );
      localStorage.setItem('dailyQuests', JSON.stringify(updated));
    }
  };

  const updateMiniGameQuest = () => {
    const saved = localStorage.getItem('dailyQuests');
    if (!saved) return;
    
    const quests: Quest[] = JSON.parse(saved);
    const gameQuest = quests.find(q => q.id === 'daily-3');
    
    if (gameQuest && !gameQuest.completed) {
      const updated = quests.map(q => 
        q.id === 'daily-3' ? { ...q, progress: 1, completed: true } : q
      );
      localStorage.setItem('dailyQuests', JSON.stringify(updated));
    }
  };

  return {
    updateLessonQuest,
    updateXPQuest,
    updateMiniGameQuest,
  };
};
