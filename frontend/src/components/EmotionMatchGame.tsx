import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Trophy, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { useQuestProgress } from './DailyQuests';
import { useCurrency } from './CurrencyDisplay';

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const EMOTIONS = ['😄', '😢', '😠', '😨', '😲', '😍', '😎', '🤔'];

export const EmotionMatchGame: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  
  const { updateMiniGameQuest } = useQuestProgress();
  const { addCoins } = useCurrency();

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const shuffledEmotions = [...EMOTIONS, ...EMOTIONS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));
    
    setCards(shuffledEmotions);
    setFlippedCards([]);
    setMoves(0);
    setIsWon(false);
    setIsLocked(false);
  };

  const handleCardClick = (id: number) => {
    if (isLocked || cards[id].isFlipped || cards[id].isMatched) return;

    const newCards = [...cards];
    newCards[id].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setIsLocked(true);
      setMoves(prev => prev + 1);
      checkForMatch(newFlipped);
    }
  };

  const checkForMatch = (currentFlipped: number[]) => {
    const [first, second] = currentFlipped;
    
    if (cards[first].emoji === cards[second].emoji) {
      // Match found
      setTimeout(() => {
        setCards(prev => prev.map(card => 
          currentFlipped.includes(card.id) 
            ? { ...card, isMatched: true } 
            : card
        ));
        setFlippedCards([]);
        setIsLocked(false);
      }, 500);
    } else {
      // No match
      setTimeout(() => {
        setCards(prev => prev.map(card => 
          currentFlipped.includes(card.id) 
            ? { ...card, isFlipped: false } 
            : card
        ));
        setFlippedCards([]);
        setIsLocked(false);
      }, 1000);
    }
  };

  // Check for win condition
  useEffect(() => {
    if (cards.length > 0 && cards.every(c => c.isMatched)) {
      handleWin();
    }
  }, [cards]);

  const handleWin = () => {
    if (isWon) return; // Prevent double execution
    setIsWon(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    
    // Rewards
    addCoins(20); // 20 coins for winning
    updateMiniGameQuest(); // Complete daily quest
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Найди пару</h2>
            <p className="text-slate-500 text-sm">Ходов: {moves}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-100">
            <X className="w-6 h-6 text-slate-500" />
          </Button>
        </div>

        {/* Game Grid */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {cards.map(card => (
            <motion.button
              key={card.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCardClick(card.id)}
              className={`aspect-square rounded-xl text-3xl flex items-center justify-center transition-all duration-300 ${
                card.isFlipped || card.isMatched
                  ? 'bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-200 rotate-0'
                  : 'bg-gradient-to-br from-purple-500 to-indigo-600 rotate-y-180 shadow-md'
              }`}
              disabled={card.isMatched}
            >
              {(card.isFlipped || card.isMatched) ? card.emoji : '❓'}
            </motion.button>
          ))}
        </div>

        {/* Win State Overlay */}
        <AnimatePresence>
          {isWon && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute inset-0 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-10"
            >
              <Trophy className="w-20 h-20 text-yellow-400 mb-4 drop-shadow-lg" />
              <h3 className="text-3xl font-bold text-slate-800 mb-2">Победа! 🎉</h3>
              <p className="text-slate-600 mb-6">
                Ты нашел все пары за {moves} ходов!
              </p>
              
              <div className="flex items-center gap-2 mb-8 bg-amber-100 px-4 py-2 rounded-full text-amber-700 font-bold">
                <span>+20</span> 🪙 Монет
              </div>

              <div className="flex gap-3 w-full">
                <Button 
                  onClick={initializeGame} 
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-xl py-6"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Играть снова
                </Button>
                <Button 
                  onClick={onClose}
                  variant="outline" 
                  className="flex-1 border-2 rounded-xl py-6"
                >
                  Выйти
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
