import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Shield, Lightbulb, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

export const ActiveEffects = () => {
  const [effects, setEffects] = useState<any[]>([]);
  
  useEffect(() => {
    const updateEffects = () => {
      const newEffects = [];
      
      const hasXPBoost = localStorage.getItem('activeXPBoost') === 'true';
      const hasStreakProtection = localStorage.getItem('streakProtection') === 'true';
      const streakProtectionDate = localStorage.getItem('streakProtectionDate');
      
      if (hasXPBoost) {
        newEffects.push({
          id: 'xp_boost',
          icon: <Sparkles className="w-4 h-4" />,
          label: '×2 XP',
          color: 'from-purple-500 to-pink-500',
          timer: 'До следующего урока',
        });
      }
      
      if (hasStreakProtection && streakProtectionDate) {
        const protectionDate = new Date(streakProtectionDate);
        const now = new Date();
        const diffDays = Math.ceil((now.getTime() - protectionDate.getTime()) / (1000 * 60 * 60 * 24));
        const daysLeft = Math.max(0, 7 - diffDays); // Защита на 7 дней
        
        newEffects.push({
          id: 'streak_protection',
          icon: <Shield className="w-4 h-4" />,
          label: 'Защита',
          color: 'from-orange-500 to-red-500',
          timer: daysLeft > 0 ? `${daysLeft}д` : 'Истекает',
        });
      }
      
      // Проверяем подсказки в инвентаре
      try {
        const inventory = JSON.parse(localStorage.getItem('userInventory') || '{}');
        if (inventory.hint_pack && inventory.hint_pack > 0) {
          newEffects.push({
            id: 'hints',
            icon: <Lightbulb className="w-4 h-4" />,
            label: `×${inventory.hint_pack}`,
            color: 'from-blue-400 to-cyan-500',
            timer: 'Доступны',
          });
        }
      } catch (e) {
        console.error('Error parsing inventory:', e);
      }
      
      setEffects(newEffects);
    };
    
    updateEffects();
    const interval = setInterval(updateEffects, 60000); // Обновляем каждую минуту
    
    return () => clearInterval(interval);
  }, []);

  if (effects.length === 0) return null;

  return (
    <div className="flex gap-2 flex-wrap">
      <AnimatePresence>
        {effects.map((effect) => (
          <motion.div
            key={effect.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`bg-gradient-to-r ${effect.color} px-3 py-2 rounded-full shadow-lg`}
          >
            <div className="flex items-center gap-2">
              <div className="text-white animate-pulse">
                {effect.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-white text-xs font-bold leading-none">
                  {effect.label}
                </span>
                {effect.timer && (
                  <span className="text-white/80 text-[10px] leading-none mt-0.5 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {effect.timer}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
