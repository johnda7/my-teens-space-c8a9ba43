import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Clock } from 'lucide-react';
import { Progress } from './ui/progress';

interface EnergySystemProps {
  maxEnergy?: number;
  refillTime?: number; // минуты до полного восстановления
}

export const EnergySystem = ({ maxEnergy = 100, refillTime = 100 }: EnergySystemProps) => {
  const [energy, setEnergy] = useState(() => {
    const saved = localStorage.getItem('userEnergy');
    const lastUpdate = localStorage.getItem('lastEnergyUpdate');
    
    if (saved && lastUpdate) {
      const minutesPassed = Math.floor((Date.now() - parseInt(lastUpdate)) / 60000);
      const restoredEnergy = Math.min(parseInt(saved) + minutesPassed, maxEnergy);
      return restoredEnergy;
    }
    return maxEnergy;
  });

  const [nextRefillIn, setNextRefillIn] = useState(60); // секунды до следующей энергии

  useEffect(() => {
    // Авто-восстановление энергии (1 энергия в минуту)
    const timer = setInterval(() => {
      setEnergy(prev => {
        const newEnergy = Math.min(prev + 1, maxEnergy);
        localStorage.setItem('userEnergy', newEnergy.toString());
        localStorage.setItem('lastEnergyUpdate', Date.now().toString());
        return newEnergy;
      });
    }, 60000); // каждую минуту

    return () => clearInterval(timer);
  }, [maxEnergy]);

  useEffect(() => {
    // Обратный отсчет до следующего восстановления
    const countdown = setInterval(() => {
      setNextRefillIn(prev => (prev > 0 ? prev - 1 : 60));
    }, 1000);

    return () => clearInterval(countdown);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const energyPercent = (energy / maxEnergy) * 100;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative"
    >
      <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-2 rounded-full shadow-lg">
        <motion.div
          animate={{
            scale: energy < 20 ? [1, 1.2, 1] : 1,
          }}
          transition={{
            duration: 0.5,
            repeat: energy < 20 ? Infinity : 0,
          }}
        >
          <Zap className={`w-5 h-5 ${energy < 20 ? 'text-red-100' : 'text-white'}`} fill="currentColor" />
        </motion.div>
        
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="text-white font-bold text-sm">{energy}</span>
            <span className="text-white/80 text-xs">/ {maxEnergy}</span>
          </div>
          {energy < maxEnergy && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-white/70" />
              <span className="text-white/70 text-xs">{formatTime(nextRefillIn)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Мини прогресс-бар */}
      {energy < maxEnergy && (
        <div className="absolute -bottom-1 left-2 right-2">
          <div className="h-1 bg-white/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white"
              initial={{ width: 0 }}
              animate={{ width: `${energyPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Хук для управления энергией
export const useEnergy = () => {
  const [energy, setEnergy] = useState(() => {
    const saved = localStorage.getItem('userEnergy');
    return saved ? parseInt(saved) : 100;
  });

  const consumeEnergy = (amount: number): boolean => {
    if (energy >= amount) {
      const newEnergy = energy - amount;
      setEnergy(newEnergy);
      localStorage.setItem('userEnergy', newEnergy.toString());
      localStorage.setItem('lastEnergyUpdate', Date.now().toString());
      return true;
    }
    return false;
  };

  const refillEnergy = (amount: number) => {
    const newEnergy = Math.min(energy + amount, 100);
    setEnergy(newEnergy);
    localStorage.setItem('userEnergy', newEnergy.toString());
    localStorage.setItem('lastEnergyUpdate', Date.now().toString());
  };

  return { energy, consumeEnergy, refillEnergy };
};
