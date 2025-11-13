
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
      <h3 className="text-lg font-bold mb-2">{question.title}</h3>
      <p className="mb-4">{question.instruction}</p>
      
      <div className="mb-4">
        <Progress value={strength} className="w-full" />
        <p className="text-center text-sm mt-1">Прочность стены: {strength}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {question.bricks?.map(brick => (
          <motion.div
            key={brick.text}
            onClick={() => handleBrickClick(brick.text)}
            className={`p-2 rounded-md text-center cursor-pointer border ${
              selectedBricks.includes(brick.text) ? 'bg-purple-200 border-purple-500' : 'bg-gray-100'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            {brick.text}
          </motion.div>
        ))}
      </div>

      <motion.button
        onClick={checkAnswer}
        className="w-full bg-purple-500 text-white py-2 rounded-lg"
        whileTap={{ scale: 0.98 }}
      >
        Построить!
      </motion.button>
    </div>
  );
};
