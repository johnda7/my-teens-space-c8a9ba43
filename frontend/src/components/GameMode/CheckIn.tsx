import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle2 } from 'lucide-react';

const CheckIn = () => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  const moods = [
    { emoji: '😫', label: 'Усталость' },
    { emoji: '😢', label: 'Грусть' },
    { emoji: '😐', label: 'Норм' },
    { emoji: '🙂', label: 'Хорошо' },
    { emoji: '🤩', label: 'Супер' }
  ];

  const handleCheckIn = () => {
    if (selectedMood) {
      setIsCheckedIn(true);
      // TODO: Save check-in to backend
    }
  };

  if (isCheckedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center"
        >
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </motion.div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Отмечено!</h2>
          <p className="text-gray-500 mt-2">Ты молодец, что следишь за собой.</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 w-full max-w-xs">
          <div className="flex items-center justify-center gap-2 text-orange-600 font-bold">
            <span className="text-2xl">🔥</span>
            <span>Стрик: 8 дней</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col h-full max-w-md mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Ежедневный чек-ин</h1>
        <p className="text-gray-500 mt-2">Как ты себя чувствуешь сегодня?</p>
      </header>

      <div className="flex-1 grid grid-cols-1 gap-4 content-center">
        {moods.map((mood) => (
          <motion.button
            key={mood.label}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedMood(mood.label)}
            className={`p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${
              selectedMood === mood.label
                ? 'border-purple-500 bg-purple-50 shadow-md'
                : 'border-gray-100 bg-white hover:border-purple-200'
            }`}
          >
            <span className="text-4xl">{mood.emoji}</span>
            <span className="font-medium text-lg text-gray-700">{mood.label}</span>
            {selectedMood === mood.label && (
              <motion.div layoutId="check" className="ml-auto">
                <CheckCircle2 className="w-6 h-6 text-purple-500" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      <div className="mt-8 pb-20">
        <Button
          onClick={handleCheckIn}
          disabled={!selectedMood}
          className="w-full py-6 text-lg font-bold rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-200 disabled:opacity-50"
        >
          Отметить
        </Button>
      </div>
    </div>
  );
};

export default CheckIn;
