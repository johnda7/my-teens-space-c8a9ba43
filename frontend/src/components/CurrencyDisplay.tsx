import { motion } from 'framer-motion';
import { Coins, Gem } from 'lucide-react';

interface CurrencyDisplayProps {
  coins: number;
  gems: number;
  onCoinsClick?: () => void;
  onGemsClick?: () => void;
}

export const CurrencyDisplay = ({ coins, gems, onCoinsClick, onGemsClick }: CurrencyDisplayProps) => {
  return (
    <div className="flex gap-2">
      {/* Монеты */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onCoinsClick}
        className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-400 to-yellow-500 px-3 py-1.5 rounded-full shadow-md"
      >
        <span className="text-lg">🪙</span>
        <span className="font-bold text-yellow-900 text-sm">{coins.toLocaleString()}</span>
      </motion.button>

      {/* Кристаллы */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onGemsClick}
        className="flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1.5 rounded-full shadow-md"
      >
        <span className="text-lg">💎</span>
        <span className="font-bold text-white text-sm">{gems.toLocaleString()}</span>
      </motion.button>
    </div>
  );
};

// Хук для управления валютой
export const useCurrency = () => {
  const getCoins = (): number => {
    const saved = localStorage.getItem('userCoins');
    return saved ? parseInt(saved) : 0;
  };

  const getGems = (): number => {
    const saved = localStorage.getItem('userGems');
    return saved ? parseInt(saved) : 0;
  };

  const addCoins = (amount: number) => {
    const current = getCoins();
    const newAmount = current + amount;
    localStorage.setItem('userCoins', newAmount.toString());
    return newAmount;
  };

  const addGems = (amount: number) => {
    const current = getGems();
    const newAmount = current + amount;
    localStorage.setItem('userGems', newAmount.toString());
    return newAmount;
  };

  const spendCoins = (amount: number): boolean => {
    const current = getCoins();
    if (current >= amount) {
      localStorage.setItem('userCoins', (current - amount).toString());
      return true;
    }
    return false;
  };

  const spendGems = (amount: number): boolean => {
    const current = getGems();
    if (current >= amount) {
      localStorage.setItem('userGems', (current - amount).toString());
      return true;
    }
    return false;
  };

  return {
    getCoins,
    getGems,
    addCoins,
    addGems,
    spendCoins,
    spendGems,
  };
};
