
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Question } from '@/data/allLessonsData';

interface InteractiveZonesProps {
  question: Question;
  onAnswer: (isCorrect: boolean, answer: string[]) => void;
}

export const InteractiveZones: React.FC<InteractiveZonesProps> = ({ question, onAnswer }) => {
  const [selectedZones, setSelectedZones] = useState<string[]>([]);

  const handleZoneClick = (zoneId: string) => {
    setSelectedZones(prev =>
      prev.includes(zoneId) ? prev.filter(id => id !== zoneId) : [...prev, zoneId]
    );
  };

  const checkAnswer = () => {
    const correctZones = question.zones?.filter(z => z.correct).map(z => z.id) || [];
    const isCorrect = selectedZones.length === correctZones.length && selectedZones.every(id => correctZones.includes(id));
    onAnswer(isCorrect, selectedZones);
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-bold mb-2">{question.title}</h3>
      <p className="mb-4">{question.question}</p>
      <div className="grid grid-cols-2 gap-4 mb-4">
        {question.zones?.map(zone => (
          <motion.div
            key={zone.id}
            onClick={() => handleZoneClick(zone.id)}
            className={`p-4 rounded-lg text-center cursor-pointer border-2 ${
              selectedZones.includes(zone.id) ? 'border-purple-500 bg-purple-100' : 'border-gray-300'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-3xl">{zone.emoji}</span>
            <p>{zone.label}</p>
          </motion.div>
        ))}
      </div>
      <motion.button
        onClick={checkAnswer}
        className="w-full bg-purple-500 text-white py-2 rounded-lg"
        whileTap={{ scale: 0.98 }}
      >
        Ответить
      </motion.button>
    </div>
  );
};
