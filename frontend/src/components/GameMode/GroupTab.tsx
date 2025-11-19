import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, UserPlus, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

const GroupTab = () => {
  const leaderboard = [
    { id: 1, name: 'Алина', xp: 2450, rank: 1, avatar: '👩‍🦰' },
    { id: 2, name: 'Макс', xp: 2100, rank: 2, avatar: '🧑‍🦱' },
    { id: 3, name: 'Ты', xp: 1850, rank: 3, avatar: '😎', isMe: true },
    { id: 4, name: 'Соня', xp: 1600, rank: 4, avatar: '👩' },
    { id: 5, name: 'Дим', xp: 1450, rank: 5, avatar: '🧑' },
  ];

  return (
    <div className="p-4 pb-24 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8 pt-4">
        <h1 className="text-2xl font-bold text-gray-900">Твоя Лига</h1>
        <p className="text-purple-600 font-medium flex items-center justify-center gap-2 mt-1">
          <Shield className="w-4 h-4" />
          Серебряная лига
        </p>
        <div className="mt-4 text-sm text-gray-500">
          До конца турнира: 2 дня 14 часов
        </div>
      </div>

      {/* Top 3 Podium (Visual flair) */}
      <div className="flex justify-center items-end gap-4 mb-8 h-40">
        {/* 2nd Place */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-2xl mb-2 border-2 border-gray-300">
            {leaderboard[1].avatar}
          </div>
          <div className="w-16 h-24 bg-gray-200 rounded-t-lg flex items-end justify-center pb-2 relative">
            <span className="font-bold text-gray-600">2</span>
          </div>
          <span className="text-xs font-bold mt-1">{leaderboard[1].name}</span>
        </div>

        {/* 1st Place */}
        <div className="flex flex-col items-center z-10">
          <div className="relative">
            <Trophy className="w-6 h-6 text-yellow-500 absolute -top-6 left-1/2 -translate-x-1/2 animate-bounce" />
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center text-3xl mb-2 border-4 border-yellow-400">
              {leaderboard[0].avatar}
            </div>
          </div>
          <div className="w-20 h-32 bg-gradient-to-b from-yellow-300 to-yellow-500 rounded-t-lg flex items-end justify-center pb-2 shadow-lg">
            <span className="font-bold text-white text-xl">1</span>
          </div>
          <span className="text-xs font-bold mt-1">{leaderboard[0].name}</span>
        </div>

        {/* 3rd Place */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl mb-2 border-2 border-orange-300">
            {leaderboard[2].avatar}
          </div>
          <div className="w-16 h-20 bg-orange-200 rounded-t-lg flex items-end justify-center pb-2">
            <span className="font-bold text-orange-800">3</span>
          </div>
          <span className="text-xs font-bold mt-1">{leaderboard[2].name}</span>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {leaderboard.slice(3).map((user) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4"
          >
            <span className="font-bold text-gray-400 w-6 text-center">{user.rank}</span>
            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-xl">
              {user.avatar}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">{user.name}</h3>
            </div>
            <div className="font-bold text-purple-600">{user.xp} XP</div>
          </motion.div>
        ))}
      </div>

      {/* Invite Button */}
      <div className="mt-8">
        <Button className="w-full py-6 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold shadow-lg shadow-blue-200">
          <UserPlus className="w-5 h-5 mr-2" />
          Пригласить друзей
        </Button>
      </div>
    </div>
  );
};

export default GroupTab;
