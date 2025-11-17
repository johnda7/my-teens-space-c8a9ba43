import { motion } from 'framer-motion';
import { Trophy, Lock, Check, Gift } from 'lucide-react';
import { Progress } from './ui/progress';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'progress' | 'special' | 'social';
  unlocked: boolean;
  progress?: number;
  target?: number;
  reward: {
    xp?: number;
    coins?: number;
    gems?: number;
  };
}

const ACHIEVEMENTS: Achievement[] = [
  // Прогресс обучения
  {
    id: 'first_lesson',
    name: 'Новичок',
    description: 'Пройти первый урок',
    icon: '🎓',
    category: 'progress',
    unlocked: false,
    progress: 0,
    target: 1,
    reward: { xp: 50, coins: 50 },
  },
  {
    id: 'lessons_10',
    name: 'Любознательный',
    description: 'Пройти 10 уроков',
    icon: '📚',
    category: 'progress',
    unlocked: false,
    progress: 0,
    target: 10,
    reward: { xp: 100, coins: 100 },
  },
  {
    id: 'lessons_25',
    name: 'Знаток',
    description: 'Пройти 25 уроков',
    icon: '🧠',
    category: 'progress',
    unlocked: false,
    progress: 0,
    target: 25,
    reward: { xp: 250, coins: 200, gems: 5 },
  },
  {
    id: 'lessons_all',
    name: 'Мастер',
    description: 'Пройти все 44 урока',
    icon: '👑',
    category: 'progress',
    unlocked: false,
    progress: 0,
    target: 44,
    reward: { xp: 500, coins: 500, gems: 20 },
  },
  {
    id: 'perfect_score',
    name: 'Перфекционист',
    description: 'Получить 100% за урок',
    icon: '🎯',
    category: 'progress',
    unlocked: false,
    reward: { xp: 100, coins: 100 },
  },

  // Специальные
  {
    id: 'streak_7',
    name: 'Неделя силы',
    description: 'Держать стрик 7 дней',
    icon: '🔥',
    category: 'special',
    unlocked: false,
    progress: 0,
    target: 7,
    reward: { xp: 200, coins: 150, gems: 5 },
  },
  {
    id: 'streak_30',
    name: 'Железная воля',
    description: 'Держать стрик 30 дней',
    icon: '💪',
    category: 'special',
    unlocked: false,
    progress: 0,
    target: 30,
    reward: { xp: 1000, coins: 500, gems: 25 },
  },
  {
    id: 'energy_full',
    name: 'Энерджайзер',
    description: 'Накопить максимум энергии',
    icon: '⚡',
    category: 'special',
    unlocked: false,
    reward: { coins: 100 },
  },
  {
    id: 'coins_1000',
    name: 'Богач',
    description: 'Накопить 1000 монет',
    icon: '💰',
    category: 'special',
    unlocked: false,
    progress: 0,
    target: 1000,
    reward: { gems: 10 },
  },
  {
    id: 'balance_perfect',
    name: 'Гуру баланса',
    description: 'Финальный тест на 90+ баллов',
    icon: '🌟',
    category: 'special',
    unlocked: false,
    reward: { xp: 500, coins: 300, gems: 15 },
  },
];

interface AchievementsProps {
  onClose?: () => void;
}

export const Achievements = ({ onClose }: AchievementsProps) => {
  // Загружаем достижения из localStorage
  const savedAchievements = localStorage.getItem('userAchievements');
  const achievements: Achievement[] = savedAchievements
    ? JSON.parse(savedAchievements)
    : ACHIEVEMENTS;

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalRewards = achievements
    .filter(a => a.unlocked)
    .reduce(
      (acc, a) => ({
        xp: acc.xp + (a.reward.xp || 0),
        coins: acc.coins + (a.reward.coins || 0),
        gems: acc.gems + (a.reward.gems || 0),
      }),
      { xp: 0, coins: 0, gems: 0 }
    );

  const categories = [
    { id: 'progress', label: 'Обучение', icon: '📚' },
    { id: 'special', label: 'Особые', icon: '⭐' },
    { id: 'social', label: 'Социальные', icon: '👥' },
  ];

  return (
    <div className="space-y-6">
      {/* Header stats */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-3xl text-white">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">Достижения</h2>
            <p className="text-white/80 text-sm">
              {unlockedCount} из {achievements.length} разблокировано
            </p>
          </div>
        </div>

        <Progress value={(unlockedCount / achievements.length) * 100} className="h-2 mb-4" />

        {/* Total rewards */}
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Gift className="w-4 h-4" />
            <span>Получено:</span>
          </div>
          {totalRewards.xp > 0 && <span>+{totalRewards.xp} XP</span>}
          {totalRewards.coins > 0 && <span>🪙 {totalRewards.coins}</span>}
          {totalRewards.gems > 0 && <span>💎 {totalRewards.gems}</span>}
        </div>
      </div>

      {/* Categories */}
      {categories.map(category => {
        const categoryAchievements = achievements.filter(a => a.category === category.id);
        if (categoryAchievements.length === 0) return null;

        return (
          <div key={category.id}>
            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span>{category.icon}</span>
              {category.label}
            </h3>

            <div className="space-y-2">
              {categoryAchievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white/90 backdrop-blur-sm p-4 rounded-2xl border-2 ${
                    achievement.unlocked
                      ? 'border-green-400 shadow-md'
                      : 'border-white/60 opacity-70'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="relative">
                      <div className="text-4xl">{achievement.icon}</div>
                      {achievement.unlocked && (
                        <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      {!achievement.unlocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                          <Lock className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 mb-1">{achievement.name}</h4>
                      <p className="text-sm text-slate-600 mb-2">{achievement.description}</p>

                      {/* Progress bar */}
                      {achievement.target && typeof achievement.progress === 'number' && (
                        <div className="mb-2">
                          <div className="flex justify-between text-xs text-slate-600 mb-1">
                            <span>
                              {achievement.progress}/{achievement.target}
                            </span>
                            <span>{Math.round((achievement.progress / achievement.target) * 100)}%</span>
                          </div>
                          <Progress
                            value={(achievement.progress / achievement.target) * 100}
                            className="h-1.5"
                          />
                        </div>
                      )}

                      {/* Rewards */}
                      <div className="flex items-center gap-2 text-xs">
                        {achievement.unlocked ? (
                          <span className="text-green-600 font-semibold">✓ Получено</span>
                        ) : (
                          <>
                            <span className="text-slate-500">Награда:</span>
                            {achievement.reward.xp && (
                              <span className="text-purple-600 font-semibold">
                                +{achievement.reward.xp} XP
                              </span>
                            )}
                            {achievement.reward.coins && (
                              <span className="font-semibold">🪙 {achievement.reward.coins}</span>
                            )}
                            {achievement.reward.gems && (
                              <span className="font-semibold">💎 {achievement.reward.gems}</span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Хук для проверки и разблокировки достижений
export const useAchievements = () => {
  const checkAchievement = (achievementId: string): boolean => {
    const saved = localStorage.getItem('userAchievements');
    const achievements: Achievement[] = saved ? JSON.parse(saved) : ACHIEVEMENTS;
    const achievement = achievements.find(a => a.id === achievementId);
    return achievement?.unlocked || false;
  };

  const unlockAchievement = (achievementId: string): Achievement | null => {
    const saved = localStorage.getItem('userAchievements');
    const achievements: Achievement[] = saved ? JSON.parse(saved) : ACHIEVEMENTS;
    const achievement = achievements.find(a => a.id === achievementId);

    if (!achievement || achievement.unlocked) return null;

    achievement.unlocked = true;
    localStorage.setItem('userAchievements', JSON.stringify(achievements));

    // Начисляем награды
    if (achievement.reward.xp) {
      const currentXP = parseInt(localStorage.getItem('userXP') || '0');
      localStorage.setItem('userXP', (currentXP + achievement.reward.xp).toString());
    }
    if (achievement.reward.coins) {
      const currentCoins = parseInt(localStorage.getItem('userCoins') || '0');
      localStorage.setItem('userCoins', (currentCoins + achievement.reward.coins).toString());
    }
    if (achievement.reward.gems) {
      const currentGems = parseInt(localStorage.getItem('userGems') || '0');
      localStorage.setItem('userGems', (currentGems + achievement.reward.gems).toString());
    }

    return achievement;
  };

  const updateProgress = (achievementId: string, progress: number) => {
    const saved = localStorage.getItem('userAchievements');
    const achievements: Achievement[] = saved ? JSON.parse(saved) : ACHIEVEMENTS;
    const achievement = achievements.find(a => a.id === achievementId);

    if (!achievement || achievement.unlocked) return;

    achievement.progress = progress;

    // Автоматически разблокировать если достигнута цель
    if (achievement.target && progress >= achievement.target) {
      unlockAchievement(achievementId);
    } else {
      localStorage.setItem('userAchievements', JSON.stringify(achievements));
    }
  };

  return { checkAchievement, unlockAchievement, updateProgress };
};
