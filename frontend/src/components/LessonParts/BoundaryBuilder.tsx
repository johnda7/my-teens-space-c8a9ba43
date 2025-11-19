
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Question } from '@/data/allLessonsData';
import { Progress } from '@/components/ui/progress';

interface BoundaryBuilderProps {
  question: Question;
  onAnswer: (isCorrect: boolean, answer: string[]) => void;
}

export const BoundaryBuilder: React.FC<BoundaryBuilderProps> = ({ question, onAnswer }) => {
  const [selectedBricks, setSelectedBricks] = useState<string[]>([]);
  const [strength, setStrength] = useState(0);

  const handleBrickClick = (brickText: string) => {
    const brick = question.bricks?.find(b => b.text === brickText);
    if (brick) {
      setSelectedBricks(prev =>
        prev.includes(brickText) ? prev.filter(t => t !== brickText) : [...prev, brickText]
      );
    }
  };

  useMemo(() => {
    const newStrength = selectedBricks.reduce((acc, text) => {
      const brick = question.bricks?.find(b => b.text === text);
      return acc + (brick?.power || 0);
    }, 0);
    setStrength(newStrength);
  }, [selectedBricks, question.bricks]);

  const checkAnswer = () => {
    const correctBricks = question.bricks?.filter(b => b.correct).map(b => b.text) || [];
    const isCorrect = selectedBricks.every(text => correctBricks.includes(text));
    onAnswer(isCorrect, selectedBricks);
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-bold mb-2 text-slate-900">{question.title}</h3>
      <p className="mb-6 text-slate-600">{question.instruction}</p>
      
      <div className="mb-6 bg-white/50 p-4 rounded-2xl border border-white/20 shadow-sm backdrop-blur-sm">
        <div className="flex justify-between mb-2 text-sm font-bold">
          <span className="text-purple-600">Прочность стены</span>
          <span className="text-slate-900">{strength}%</span>
        </div>
        <Progress 
          value={strength} 
          className="w-full h-3 bg-slate-200 [&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-pink-500" 
        />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {question.bricks?.map(brick => (
          <motion.div
            key={brick.text}
            onClick={() => handleBrickClick(brick.text)}
            className={`p-4 rounded-xl text-center cursor-pointer border transition-all font-medium ${
              selectedBricks.includes(brick.text) 
                ? 'bg-purple-100 border-purple-500 text-purple-900 shadow-md' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-purple-200'
            }`}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
          >
            {brick.text}
          </motion.div>
        ))}
      </div>

      <motion.button
        onClick={checkAnswer}
        className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-purple-200"
        whileTap={{ scale: 0.98 }}
        whileHover={{ filter: "brightness(1.1)" }}
      >
        Построить!
      </motion.button>
    </div>
  );
};
