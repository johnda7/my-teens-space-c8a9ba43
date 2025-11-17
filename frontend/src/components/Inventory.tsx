import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Sparkles, Shield, Lightbulb } from 'lucide-react';
import { Button } from './ui/button';
import { useTelegram } from '@/hooks/useTelegram';
import { useInventory } from './Shop';
import confetti from 'canvas-confetti';

interface InventoryProps {
  onClose: () => void;
  onUseItem: (itemId: string, effect: { type: string; value: number }) => void;
}

interface InventoryItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  effect: {
    type: 'energy' | 'xp_boost' | 'streak_protection' | 'hint';
    value: number;
  };
  useLabel: string;
  color: string;
}

const INVENTORY_ITEMS: InventoryItem[] = [
  {
    id: 'energy_boost',
    name: 'Энергетик',
    description: 'Восстановит 50 энергии',
    icon: '⚡',
    effect: { type: 'energy', value: 50 },
    useLabel: 'Использовать',
    color: 'from-yellow-400 to-orange-500',
  },
  {
    id: 'xp_booster',
    name: 'Удвоитель XP',
    description: 'Удвоит XP за следующий урок',
    icon: '⏰',
    effect: { type: 'xp_boost', value: 2 },
    useLabel: 'Активировать',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'streak_shield',
    name: 'Защита стрика',
    description: 'Защитит стрик на 1 день',
    icon: '🔥',
    effect: { type: 'streak_protection', value: 1 },
    useLabel: 'Активировать',
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 'hint_pack',
    name: 'Подсказка',
    description: 'Подскажет правильный ответ',
    icon: '💡',
    effect: { type: 'hint', value: 1 },
    useLabel: 'Готово к уроку',
    color: 'from-blue-400 to-cyan-500',
  },
  {
    id: 'mega_energy',
    name: 'Мега-энергия',
    description: 'Восстановит всю энергию',
    icon: '⚡⚡',
    effect: { type: 'energy', value: 100 },
    useLabel: 'Использовать',
    color: 'from-yellow-500 to-orange-600',
  },
];

export const Inventory = ({ onClose, onUseItem }: InventoryProps) => {
  const { haptic } = useTelegram();
  const inventory = useInventory();

  const handleUse = (item: InventoryItem) => {
    if (inventory.useItem(item.id)) {
      haptic?.('medium');
      
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f59e0b', '#8b5cf6', '#ec4899'],
      });

      onUseItem(item.id, item.effect);
    } else {
      haptic?.('heavy');
    }
  };

  const itemsWithCount = INVENTORY_ITEMS.map(item => ({
    ...item,
    count: inventory.getItemCount(item.id),
  })).filter(item => item.count > 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-slate-900/95 via-purple-900/95 to-pink-900/95 backdrop-blur-sm z-50 overflow-auto"
    >
      <div className="min-h-screen p-4 pb-20">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              🎒 Рюкзак
            </h2>
            <p className="text-white/70 text-sm">Твои предметы</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/10 rounded-full p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Items */}
        {itemsWithCount.length > 0 ? (
          <div className="space-y-3">
            {itemsWithCount.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/90 backdrop-blur-sm rounded-2xl p-4"
              >
                <div className="flex items-start gap-4">
                  {/* Icon with badge */}
                  <div className="relative">
                    <div className="text-5xl">{item.icon}</div>
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                      {item.count}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 mb-1">{item.name}</h3>
                    <p className="text-sm text-slate-600 mb-3">{item.description}</p>

                    {/* Use button */}
                    <Button
                      onClick={() => handleUse(item)}
                      className={`w-full bg-gradient-to-r ${item.color} hover:opacity-90 transition-opacity`}
                    >
                      {item.useLabel}
                    </Button>
                  </div>
                </div>

                {/* Effect hint */}
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    {item.effect.type === 'energy' && (
                      <>
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <span>+{item.effect.value} энергии</span>
                      </>
                    )}
                    {item.effect.type === 'xp_boost' && (
                      <>
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        <span>×{item.effect.value} XP на 1 урок</span>
                      </>
                    )}
                    {item.effect.type === 'streak_protection' && (
                      <>
                        <Shield className="w-4 h-4 text-orange-500" />
                        <span>Защита стрика активна</span>
                      </>
                    )}
                    {item.effect.type === 'hint' && (
                      <>
                        <Lightbulb className="w-4 h-4 text-blue-500" />
                        <span>Доступна в уроках</span>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎒</div>
            <h3 className="text-white text-xl font-bold mb-2">Рюкзак пуст</h3>
            <p className="text-white/70 mb-6">
              Покупай предметы в магазине, чтобы прокачать свою игру!
            </p>
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Закрыть
            </Button>
          </div>
        )}

        {/* Active effects indicator */}
        <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Активные эффекты
          </h3>
          <div className="space-y-2">
            {localStorage.getItem('activeXPBoost') && (
              <div className="flex items-center gap-2 text-white/90 text-sm">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span>Удвоение XP активно</span>
              </div>
            )}
            {localStorage.getItem('streakProtection') && (
              <div className="flex items-center gap-2 text-white/90 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span>Защита стрика активна</span>
              </div>
            )}
            {inventory.getItemCount('hint_pack') > 0 && (
              <div className="flex items-center gap-2 text-white/90 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Подсказок: {inventory.getItemCount('hint_pack')}</span>
              </div>
            )}
            {!localStorage.getItem('activeXPBoost') && 
             !localStorage.getItem('streakProtection') && 
             inventory.getItemCount('hint_pack') === 0 && (
              <p className="text-white/50 text-sm">Нет активных эффектов</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
