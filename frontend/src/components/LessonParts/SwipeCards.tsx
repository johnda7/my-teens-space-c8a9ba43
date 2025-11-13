
import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Question } from '@/data/allLessonsData';

interface SwipeCardsProps {
  question: Question;
  onAnswer: (isCorrect: boolean, answer: string) => void;
}

export const SwipeCards: React.FC<SwipeCardsProps> = ({ question, onAnswer }) => {
  const [cardIndex, setCardIndex] = useState(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, 200], [0, 1]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -100) {
      // Swiped left
      checkAnswer('not-ok');
    } else if (info.offset.x > 100) {
      // Swiped right
      checkAnswer('ok');
    }
  };

  const checkAnswer = (answer: 'ok' | 'not-ok') => {
    const card = question.cards?.[cardIndex];
    if (card) {
      const isCorrect = card.correctAnswer === answer;
      onAnswer(isCorrect, answer);
      setCardIndex(prev => prev + 1);
      x.set(0);
    }
  };

  if (cardIndex >= (question.cards?.length || 0)) {
    return <p>Все карточки просмотрены!</p>;
  }

  const card = question.cards?.[cardIndex];

  return (
    <div className="p-4 flex flex-col items-center">
      <h3 className="text-lg font-bold mb-2">{question.title}</h3>
      <p className="mb-4">{question.question}</p>
      <div className="relative w-64 h-80">
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          style={{ x, rotate, opacity }}
          className="absolute w-full h-full p-4 rounded-xl bg-white shadow-lg flex flex-col items-center justify-center text-center"
        >
          <span className="text-4xl mb-4">{card?.emoji}</span>
          <p>{card?.situation}</p>
        </motion.div>
      </div>
      <div className="flex justify-between w-full mt-4">
        <button onClick={() => checkAnswer('not-ok')} className="text-red-500 font-bold">❌ НЕ ОК</button>
        <button onClick={() => checkAnswer('ok')} className="text-green-500 font-bold">✅ ОК</button>
      </div>
    </div>
  );
};
