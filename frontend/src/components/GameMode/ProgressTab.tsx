import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, Star, Target, Settings, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const ProgressTab = () => {
  // Mock data
  const user = {
    name: 'Evgeniy',
    level: 5,
    xp: 2450,
    nextLevelXp: 3000,
    streak: 8,
    totalLessons: 12,
    avatar: '😎'
  };

  const achievements = [
    { id: 1, name: 'Первые шаги', description: 'Заверши 1 урок', icon: '🎯', unlocked: true },
    { id: 2, name: 'Неделя в огне', description: 'Стрик 7 дней', icon: '🔥', unlocked: true },
    { id: 3, name: 'Мастер дзен', description: 'Сделай 10 чек-инов', icon: '🧘', unlocked: false },
    { id: 4, name: 'Богач', description: 'Накопи 1000 монет', icon: '💰', unlocked: false },
  ];

  return (
    <div className="p-4 pb-24 max-w-md mx-auto">
      {/* Header Profile */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Профиль</h1>
        <Button variant="ghost" size="icon">
          <Settings className="w-6 h-6 text-gray-500" />
        </Button>
      </div>

      <div className="flex flex-col items-center mb-8">
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-5xl border-4 border-white shadow-lg">
            {user.avatar}
          </div>
          <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md border border-gray-100">
            <Edit2 className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <h2 className="text-xl font-bold mt-4">{user.name}</h2>
        <p className="text-gray-500 font-medium">Уровень {user.level}</p>
      </div>

      {/* Level Progress */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <div className="flex justify-between text-sm font-bold mb-2">
          <span className="text-purple-600">{user.xp} XP</span>
          <span className="text-gray-400">{user.nextLevelXp} XP</span>
        </div>
        <Progress value={(user.xp / user.nextLevelXp) * 100} className="h-3" />
        <p className="text-xs text-center mt-2 text-gray-400">До следующего уровня {user.nextLevelXp - user.xp} XP</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 flex flex-col items-center">
          <Flame className="w-8 h-8 text-orange-500 mb-2" />
          <span className="text-2xl font-bold text-gray-900">{user.streak}</span>
          <span className="text-xs text-orange-600 font-bold uppercase">Дней стрик</span>
        </div>
        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex flex-col items-center">
          <Target className="w-8 h-8 text-blue-500 mb-2" />
          <span className="text-2xl font-bold text-gray-900">{user.totalLessons}</span>
          <span className="text-xs text-blue-600 font-bold uppercase">Уроков</span>
        </div>
      </div>

      {/* Achievements */}
      <h3 className="text-lg font-bold mb-4">Достижения</h3>
      <div className="space-y-3">
        {achievements.map((achievement) => (
          <div 
            key={achievement.id} 
            className={`flex items-center gap-4 p-3 rounded-xl border ${
              achievement.unlocked 
                ? 'bg-white border-gray-100 shadow-sm' 
                : 'bg-gray-50 border-gray-100 opacity-60 grayscale'
            }`}
          >
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
              {achievement.icon}
            </div>
            <div>
              <h4 className="font-bold text-sm">{achievement.name}</h4>
              <p className="text-xs text-gray-500">{achievement.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressTab;
