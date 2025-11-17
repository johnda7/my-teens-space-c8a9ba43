import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Shield, Lightbulb } from 'lucide-react';

export const ActiveEffects = () => {
  const hasXPBoost = localStorage.getItem('activeXPBoost') === 'true';
  const hasStreakProtection = localStorage.getItem('streakProtection') === 'true';
  const hintsCount = parseInt(localStorage.getItem('userInventory') || '{}');
  
  const effects = [];
  
  if (hasXPBoost) {
    effects.push({
      id: 'xp_boost',
      icon: <Sparkles className="w-4 h-4" />,
      label: '×2 XP',
      color: 'from-purple-500 to-pink-500',
    });
  }
  
  if (hasStreakProtection) {
    effects.push({
      id: 'streak_protection',
      icon: <Shield className="w-4 h-4" />,
      label: 'Защита',
      color: 'from-orange-500 to-red-500',
    });
  }
  
  // Проверяем подсказки в инвентаре
  try {
    const inventory = JSON.parse(localStorage.getItem('userInventory') || '{}');
    if (inventory.hint_pack && inventory.hint_pack > 0) {
      effects.push({
        id: 'hints',
        icon: <Lightbulb className="w-4 h-4" />,
        label: `×${inventory.hint_pack}`,
        color: 'from-blue-400 to-cyan-500',
      });
    }
  } catch (e) {
    console.error('Error parsing inventory:', e);
  }

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
            className={`bg-gradient-to-r ${effect.color} px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5`}
          >
            <div className="text-white animate-pulse">
              {effect.icon}
            </div>
            <span className="text-white text-xs font-bold">
              {effect.label}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
