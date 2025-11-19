import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Clock } from 'lucide-react';
import { Card } from './ui/card';

const MAX_ENERGY = 100;
const REFILL_RATE_MS = 60000; // 1 minute
const ENERGY_PER_TICK = 1;

export const useEnergy = () => {
  const [energy, setEnergy] = useState(() => {
    const saved = localStorage.getItem('userEnergy');
    return saved ? parseInt(saved) : MAX_ENERGY;
  });
  
  const [lastRefill, setLastRefill] = useState(() => {
    const saved = localStorage.getItem('lastEnergyRefill');
    return saved ? parseInt(saved) : Date.now();
  });

  useEffect(() => {
    const calculateRefill = () => {
      const now = Date.now();
      const timeDiff = now - lastRefill;
      
      if (timeDiff >= REFILL_RATE_MS && energy < MAX_ENERGY) {
        const energyToAdd = Math.floor(timeDiff / REFILL_RATE_MS) * ENERGY_PER_TICK;
        const newEnergy = Math.min(MAX_ENERGY, energy + energyToAdd);
        
        if (newEnergy !== energy) {
          setEnergy(newEnergy);
          setLastRefill(now - (timeDiff % REFILL_RATE_MS));
        }
      }
    };

    const interval = setInterval(calculateRefill, 1000);
    calculateRefill(); // Initial check

    return () => clearInterval(interval);
  }, [energy, lastRefill]);

  useEffect(() => {
    localStorage.setItem('userEnergy', energy.toString());
    localStorage.setItem('lastEnergyRefill', lastRefill.toString());
  }, [energy, lastRefill]);

  const consumeEnergy = (amount: number): boolean => {
    if (energy >= amount) {
      setEnergy(prev => prev - amount);
      return true;
    }
    return false;
  };

  const refillEnergy = (amount: number) => {
    setEnergy(prev => Math.min(MAX_ENERGY, prev + amount));
  };

  return { energy, consumeEnergy, refillEnergy, maxEnergy: MAX_ENERGY };
};

export const EnergySystem: React.FC = () => {
  const { energy, maxEnergy } = useEnergy();
  const [showTooltip, setShowTooltip] = useState(false);

  // Calculate time to next energy
  const [timeToNext, setTimeToNext] = useState(60);

  useEffect(() => {
    if (energy >= maxEnergy) return;
    
    const interval = setInterval(() => {
      const lastRefill = parseInt(localStorage.getItem('lastEnergyRefill') || Date.now().toString());
      const now = Date.now();
      const elapsed = now - lastRefill;
      const remaining = Math.max(0, 60 - Math.floor(elapsed / 1000));
      setTimeToNext(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [energy, maxEnergy]);

  return (
    <div className="relative z-50">
      <motion.button
        className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-amber-200 shadow-sm hover:bg-white transition-colors"
        onClick={() => setShowTooltip(!showTooltip)}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative">
          <Zap 
            size={18} 
            className={`${energy === 0 ? 'text-slate-400' : 'text-amber-500'} fill-current`} 
          />
          {energy < maxEnergy && (
            <motion.div
              className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-white"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          )}
        </div>
        <span className="font-bold text-slate-700 text-sm">
          {energy}/{maxEnergy}
        </span>
      </motion.button>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute top-full right-0 mt-2 w-64"
          >
            <Card className="p-4 bg-white/90 backdrop-blur-xl border-amber-100 shadow-xl">
              <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                <Zap size={16} className="text-amber-500" />
                Энергия
              </h4>
              <p className="text-xs text-slate-600 mb-3">
                Нужна для прохождения уроков. Восстанавливается со временем.
              </p>
              
              {energy < maxEnergy ? (
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-100 p-2 rounded-lg">
                  <Clock size={14} />
                  <span>+1 энергия через {timeToNext} сек</span>
                </div>
              ) : (
                <div className="text-xs font-medium text-green-600 bg-green-50 p-2 rounded-lg text-center">
                  Энергия полная! ⚡️
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


