
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
      <h3 className="text-lg font-bold mb-2 text-slate-900">{question.title}</h3>
      <p className="mb-4 text-slate-600">{question.question}</p>
      <div className="grid grid-cols-2 gap-4 mb-4">
        {question.zones?.map(zone => (
          <motion.div
            key={zone.id}
            onClick={() => handleZoneClick(zone.id)}
            className={`p-4 rounded-2xl text-center cursor-pointer border transition-all ${
              selectedZones.includes(zone.id) 
                ? 'border-purple-500 bg-purple-50 shadow-md' 
                : 'border-slate-200 bg-white/50 hover:bg-white/80'
            }`}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
          >
            <span className="text-4xl block mb-2">{zone.emoji}</span>
            <p className={`font-medium ${selectedZones.includes(zone.id) ? 'text-purple-700' : 'text-slate-600'}`}>
              {zone.label}
            </p>
          </motion.div>
        ))}
      </div>
      <motion.button
        onClick={checkAnswer}
        className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-purple-200"
        whileTap={{ scale: 0.98 }}
        whileHover={{ brightness: 1.1 }}
      >
        Ответить
      </motion.button>
    </div>
  );
};
