import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Gift, Target, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import confetti from 'canvas-confetti';
import { useCurrency } from './CurrencyDisplay';
import { useEnergy } from './EnergySystem';

interface Quest {
  id: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  completed: boolean;
  rewards: {
    xp: number;
    coins?: number;
    gems?: number;
    energy?: number;
  };
}

const DEFAULT_QUESTS: Quest[] = [
  {
    id: 'daily-1',
    title: 'Усердный ученик',
    description: 'Заверши 1 урок',
    target: 1,
    progress: 0,
    completed: false,
    rewards: { xp: 50, coins: 20, energy: 10 }
  },
  {
    id: 'daily-2',
    title: 'Собиратель знаний',
    description: 'Заработай 100 XP',
    target: 100,
    progress: 0,
    completed: false,
    rewards: { xp: 30, coins: 15 }
  },
  {
    id: 'daily-3',
    title: 'Игровой мастер',
    description: 'Сыграй в мини-игру',
    target: 1,
    progress: 0,
    completed: false,
    rewards: { xp: 40, gems: 1 }
  }
];

export const DailyQuests: React.FC = () => {
  const [quests, setQuests] = useState<Quest[]>([]);
  const { addCoins, addGems } = useCurrency();
  const { addEnergy } = useEnergy();

  useEffect(() => {
    // Загружаем или инициализируем квесты
    const saved = localStorage.getItem('dailyQuests');
    const lastUpdate = localStorage.getItem('dailyQuestsDate');
    const today = new Date().toDateString();

    if (saved && lastUpdate === today) {
      setQuests(JSON.parse(saved));
    } else {
      // Новые квесты на сегодня
      setQuests(DEFAULT_QUESTS);
      localStorage.setItem('dailyQuests', JSON.stringify(DEFAULT_QUESTS));
      localStorage.setItem('dailyQuestsDate', today);
    }
  }, []);

  const claimReward = (questId: string) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest || !quest.completed) return;

    // Выдаем награды
    if (quest.rewards.xp) {
      const currentXP = parseInt(localStorage.getItem('userXP') || '0');
      localStorage.setItem('userXP', (currentXP + quest.rewards.xp).toString());
      window.dispatchEvent(new Event('storage')); // Notify other components
    }
    if (quest.rewards.coins) {
      addCoins(quest.rewards.coins);
    }
    if (quest.rewards.gems) {
      addGems(quest.rewards.gems);
    }
    if (quest.rewards.energy) {
      addEnergy(quest.rewards.energy);
    }

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
    });

    // Удаляем выполненный квест из списка (визуально)
    setQuests(prev => {
      const updated = prev.filter(q => q.id !== questId);
      localStorage.setItem('dailyQuests', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {quests.map((quest, index) => (
          <motion.div
            key={quest.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border ${
              quest.completed ? 'border-green-400/50 bg-green-50/50' : 'border-white/60'
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
                  className="flex items-center gap-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm"
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
                className="h-2 bg-slate-100"
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500 font-medium">
                  {quest.progress}/{quest.target}
                </span>
                
                {/* Награды */}
                <div className="flex items-center gap-2 text-xs">
                  {quest.rewards.xp && (
                    <span className="text-purple-600 font-bold">+{quest.rewards.xp} XP</span>
                  )}
                  {quest.rewards.coins && (
                    <span className="flex items-center gap-0.5 font-medium text-amber-600">
                      🪙 {quest.rewards.coins}
                    </span>
                  )}
                  {quest.rewards.gems && (
                    <span className="flex items-center gap-0.5 font-medium text-cyan-600">
                      💎 {quest.rewards.gems}
                    </span>
                  )}
                  {quest.rewards.energy && (
                    <span className="flex items-center gap-0.5 font-medium text-yellow-600">
                      ⚡ {quest.rewards.energy}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {quests.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/60"
        >
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 mb-1">Все квесты выполнены! 🎉</h3>
          <p className="text-sm text-slate-600">Возвращайся завтра за новыми заданиями</p>
          <div className="mt-4 flex justify-center gap-2 text-xs text-slate-400">
            <Clock className="w-3 h-3" />
            <span>Обновление в 00:00</span>
          </div>
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
        q.id === 'daily-1' ? { ...q, progress: Math.min(q.progress + 1, q.target), completed: q.progress + 1 >= q.target } : q
      );
      localStorage.setItem('dailyQuests', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    }
  };

  const updateXPQuest = (xpEarned: number) => {
    const saved = localStorage.getItem('dailyQuests');
    if (!saved) return;
    
    const quests: Quest[] = JSON.parse(saved);
    const xpQuest = quests.find(q => q.id === 'daily-2');
    
    if (xpQuest && !xpQuest.completed) {
      const newProgress = xpQuest.progress + xpEarned;
      const updated = quests.map(q => 
        q.id === 'daily-2' ? { ...q, progress: Math.min(newProgress, xpQuest.target), completed: newProgress >= xpQuest.target } : q
      );
      localStorage.setItem('dailyQuests', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
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
      window.dispatchEvent(new Event('storage'));
    }
  };

  return {
    updateLessonQuest,
    updateXPQuest,
    updateMiniGameQuest,
  };
};
