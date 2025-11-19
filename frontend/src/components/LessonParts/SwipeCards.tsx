
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
    return <p className="text-center text-slate-600 font-medium">Все карточки просмотрены! 🎉</p>;
  }

  const card = question.cards?.[cardIndex];

  return (
    <div className="p-4 flex flex-col items-center">
      <h3 className="text-lg font-bold mb-2 text-slate-900">{question.title}</h3>
      <p className="mb-6 text-slate-600 text-center">{question.question}</p>
      <div className="relative w-full max-w-xs h-80">
        {/* Background cards for stack effect */}
        <div className="absolute top-2 left-2 w-full h-full rounded-3xl bg-white/40 border border-white/40 shadow-sm" />
        <div className="absolute top-1 left-1 w-full h-full rounded-3xl bg-white/60 border border-white/60 shadow-md" />
        
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          style={{ x, rotate, opacity }}
          className="absolute w-full h-full p-6 rounded-3xl bg-white border border-white/80 shadow-xl flex flex-col items-center justify-center text-center cursor-grab active:cursor-grabbing"
        >
          <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mb-6 border border-slate-100">
            <span className="text-6xl">{card?.emoji}</span>
          </div>
          <p className="text-xl font-bold text-slate-900 leading-relaxed">{card?.situation}</p>
          
          <div className="absolute bottom-4 flex w-full justify-between px-8 opacity-50 text-xs font-bold tracking-widest text-slate-400">
            <span>НЕ ОК</span>
            <span>ОК</span>
          </div>
        </motion.div>
      </div>
      
      <div className="flex justify-between w-full max-w-xs mt-8 gap-4">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => checkAnswer('not-ok')} 
          className="flex-1 py-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 font-black shadow-sm hover:bg-rose-100 transition-colors"
        >
          ❌ НЕ ОК
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => checkAnswer('ok')} 
          className="flex-1 py-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 font-black shadow-sm hover:bg-emerald-100 transition-colors"
        >
          ✅ ОК
        </motion.button>
      </div>
    </div>
  );
};
