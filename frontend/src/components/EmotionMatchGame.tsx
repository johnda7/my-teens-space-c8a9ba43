import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { X, Trophy, Clock, Star } from 'lucide-react';
import { Button } from './ui/button';
import confetti from 'canvas-confetti';

interface Card {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

const EMOTIONS = ['😊', '😢', '😡', '😨', '🤗', '😴', '🤔', '😍'];

interface EmotionMatchGameProps {
  onClose: () => void;
  onComplete: (score: number) => void;
}

export const EmotionMatchGame = ({ onClose, onComplete }: EmotionMatchGameProps) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Инициализация карточек
    const emotions = EMOTIONS.slice(0, 6);
    const pairs = [...emotions, ...emotions];
    const shuffled = pairs.sort(() => Math.random() - 0.5).map((emoji, index) => ({
      id: index,
      emoji,
      flipped: false,
      matched: false,
    }));
    setCards(shuffled);
  }, []);

  useEffect(() => {
    // Таймер
    if (timeLeft > 0 && !gameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameOver(true);
      onComplete(score);
    }
  }, [timeLeft, gameOver, score, onComplete]);

  useEffect(() => {
    // Проверка совпадения
    if (flipped.length === 2) {
      const [first, second] = flipped;
      if (cards[first].emoji === cards[second].emoji) {
        setMatched([...matched, first, second]);
        const points = 100 + (timeLeft * 2); // Бонус за скорость
        setScore(score + points);
        confetti({
          particleCount: 20,
          spread: 40,
          origin: { y: 0.6 },
        });
        setFlipped([]);
        
        // Проверка победы
        if (matched.length + 2 === cards.length) {
          setGameOver(true);
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
          onComplete(score + points);
        }
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
      setMoves(moves + 1);
    }
  }, [flipped, cards, matched, score, timeLeft, moves, onComplete]);

  const handleCardClick = (index: number) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) {
      return;
    }
    setFlipped([...flipped, index]);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-purple-900 via-pink-900 to-blue-900 z-50 overflow-auto"
    >
      <div className="min-h-screen p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <button onClick={onClose} className="text-white">
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex gap-4 text-white">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              <Trophy className="w-4 h-4" />
              <span className="font-bold">{score}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              <Clock className="w-4 h-4" />
              <span className="font-bold">{timeLeft}s</span>
            </div>
          </div>
        </div>

        {/* Заголовок */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">🎮 Найди пары эмоций</h2>
          <p className="text-white/80 text-sm">Ходов: {moves}</p>
        </div>

        {/* Игровое поле */}
        <div className="grid grid-cols-4 gap-3 max-w-md mx-auto mb-6">
          {cards.map((card, index) => (
            <motion.button
              key={card.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCardClick(index)}
              disabled={matched.includes(index)}
              className={`aspect-square rounded-2xl flex items-center justify-center text-4xl transition-all ${
                matched.includes(index)
                  ? 'bg-green-500/30 backdrop-blur-sm border-2 border-green-400'
                  : flipped.includes(index)
                  ? 'bg-white/90 backdrop-blur-sm'
                  : 'bg-white/20 backdrop-blur-sm border-2 border-white/40'
              }`}
            >
              <AnimatePresence mode="wait">
                {(flipped.includes(index) || matched.includes(index)) ? (
                  <motion.span
                    key="emoji"
                    initial={{ rotateY: 90 }}
                    animate={{ rotateY: 0 }}
                    exit={{ rotateY: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    {card.emoji}
                  </motion.span>
                ) : (
                  <motion.span
                    key="question"
                    initial={{ rotateY: 90 }}
                    animate={{ rotateY: 0 }}
                    className="text-white text-2xl"
                  >
                    ?
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>

        {/* Game Over */}
        <AnimatePresence>
          {gameOver && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="bg-white rounded-3xl p-8 max-w-sm mx-4 text-center"
              >
                <div className="text-6xl mb-4">
                  {matched.length === cards.length ? '🎉' : '⏱️'}
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  {matched.length === cards.length ? 'Победа!' : 'Время вышло!'}
                </h3>
                <p className="text-slate-600 mb-1">Счёт: {score}</p>
                <p className="text-slate-600 mb-4">Ходов: {moves}</p>
                
                <div className="space-y-2">
                  <Button
                    onClick={() => {
                      window.location.reload();
                    }}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    Играть снова
                  </Button>
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="w-full"
                  >
                    Закрыть
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
