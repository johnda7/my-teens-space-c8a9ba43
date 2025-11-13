
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
      <h3 className="text-lg font-bold mb-2">{question.title}</h3>
      <p className="mb-4">{question.question}</p>
      <div className="text-6xl mb-4">{currentEmoji}</div>
      <Slider
        min={1}
        max={10}
        step={1}
        value={[value]}
        onValueChange={handleSliderChange}
        className="mb-4"
      />
      <div className="flex justify-between text-xs text-gray-500">
        {question.labels?.map((label, index) => (
          <span key={index}>{label}</span>
        ))}
      </div>
      <motion.button
        onClick={handleSubmit}
        className="mt-6 w-full bg-purple-500 text-white py-2 rounded-lg"
        whileTap={{ scale: 0.98 }}
      >
        Ответить
      </motion.button>
    </div>
  );
};
