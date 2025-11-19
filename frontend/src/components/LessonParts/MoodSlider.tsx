
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Question } from '@/data/allLessonsData';
import { Slider } from '@/components/ui/slider';

interface MoodSliderProps {
  question: Question;
  onAnswer: (answer: number) => void;
}

export const MoodSlider: React.FC<MoodSliderProps> = ({ question, onAnswer }) => {
  const [value, setValue] = useState(5);
  const emojis = question.emoji?.split('') || [];
  const currentEmoji = emojis[Math.floor(((value - 1) / 9) * (emojis.length - 1))] || '😐';

  const handleSliderChange = (newValue: number[]) => {
    setValue(newValue[0]);
  };

  const handleSubmit = () => {
    onAnswer(value);
  };

  return (
    <div className="p-4 text-center">
      <h3 className="text-lg font-bold mb-2 text-slate-900">{question.title}</h3>
      <p className="mb-6 text-slate-600">{question.question}</p>
      <motion.div 
        key={currentEmoji}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-8xl mb-8 drop-shadow-lg"
      >
        {currentEmoji}
      </motion.div>
      <Slider
        min={1}
        max={10}
        step={1}
        value={[value]}
        onValueChange={handleSliderChange}
        className="mb-8 [&>[role=slider]]:bg-white [&>[role=slider]]:border-4 [&>[role=slider]]:border-purple-500 [&>[role=slider]]:shadow-md [&>[role=track]]:bg-slate-200 [&>[role=range]]:bg-gradient-to-r [&>[role=range]]:from-purple-500 [&>[role=range]]:to-pink-500"
      />
      <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
        {question.labels?.map((label, index) => (
          <span key={index}>{label}</span>
        ))}
      </div>
      <motion.button
        onClick={handleSubmit}
        className="mt-8 w-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-purple-200"
        whileTap={{ scale: 0.98 }}
        whileHover={{ filter: "brightness(1.1)" }}
      >
        Ответить
      </motion.button>
    </div>
  );
};
