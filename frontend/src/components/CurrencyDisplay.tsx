import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Coins, Gem } from 'lucide-react';

export const useCurrency = () => {
  const [coins, setCoins] = useState(() => {
    const saved = localStorage.getItem('userCoins');
    return saved ? parseInt(saved) : 0;
  });
  
  const [gems, setGems] = useState(() => {
    const saved = localStorage.getItem('userGems');
    return saved ? parseInt(saved) : 0;
  });

  useEffect(() => {
    localStorage.setItem('userCoins', coins.toString());
    localStorage.setItem('userGems', gems.toString());
  }, [coins, gems]);

  const addCoins = (amount: number) => setCoins(prev => prev + amount);
  const spendCoins = (amount: number) => {
    if (coins >= amount) {
      setCoins(prev => prev - amount);
      return true;
    }
    return false;
  };

  const addGems = (amount: number) => setGems(prev => prev + amount);
  const spendGems = (amount: number) => {
    if (gems >= amount) {
      setGems(prev => prev - amount);
      return true;
    }
    return false;
  };

  return { coins, gems, addCoins, spendCoins, addGems, spendGems };
};

export const CurrencyDisplay: React.FC<{
  onCoinsClick?: () => void;
  onGemsClick?: () => void;
}> = ({ onCoinsClick, onGemsClick }) => {
  const { coins, gems } = useCurrency();

  return (
    <div className="flex items-center gap-2">
      <motion.div 
        className="flex items-center gap-1.5 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-amber-200 shadow-sm cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onCoinsClick}
      >
        <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center">
          <Coins size={12} className="text-amber-600" />
        </div>
        <span className="font-bold text-slate-700 text-sm">{coins}</span>
      </motion.div>

      <motion.div 
        className="flex items-center gap-1.5 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-blue-200 shadow-sm cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onGemsClick}
      >
        <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
          <Gem size={12} className="text-blue-600" />
        </div>
        <span className="font-bold text-slate-700 text-sm">{gems}</span>
      </motion.div>
    </div>
  );
};
