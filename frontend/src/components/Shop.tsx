import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { X, Zap, Clock, Shield, Sparkles, ShoppingBag } from 'lucide-react';
import { Button } from './ui/button';
import confetti from 'canvas-confetti';
import { useTelegram } from '@/hooks/useTelegram';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number;
  currency: 'coins' | 'gems';
  effect: {
    type: 'energy' | 'xp_boost' | 'streak_protection' | 'hint';
    value: number;
  };
  category: 'booster' | 'cosmetic' | 'content';
}

const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'energy_boost',
    name: 'Энергетик',
    description: 'Мгновенно восстанавливает 50 энергии',
    icon: '⚡',
    price: 100,
    currency: 'coins',
    effect: { type: 'energy', value: 50 },
    category: 'booster',
  },
  {
    id: 'xp_booster',
    name: 'Удвоитель XP',
    description: 'Удваивает XP за следующий урок',
    icon: '⏰',
    price: 200,
    currency: 'coins',
    effect: { type: 'xp_boost', value: 2 },
    category: 'booster',
  },
  {
    id: 'streak_shield',
    name: 'Защита стрика',
    description: 'Стрик не сбросится если пропустишь день',
    icon: '🔥',
    price: 300,
    currency: 'coins',
    effect: { type: 'streak_protection', value: 1 },
    category: 'booster',
  },
  {
    id: 'hint_pack',
    name: 'Пакет подсказок',
    description: '3 подсказки для сложных вопросов',
    icon: '💡',
    price: 150,
    currency: 'coins',
    effect: { type: 'hint', value: 3 },
    category: 'booster',
  },
  {
    id: 'mega_energy',
    name: 'Мега-энергия',
    description: 'Полностью восстанавливает энергию',
    icon: '⚡⚡',
    price: 5,
    currency: 'gems',
    effect: { type: 'energy', value: 100 },
    category: 'booster',
  },
];

interface ShopProps {
  onClose: () => void;
  coins: number;
  gems: number;
  onPurchase: (item: ShopItem) => void;
}

export const Shop = ({ onClose, coins, gems, onPurchase }: ShopProps) => {
  const [selectedCategory, setSelectedCategory] = useState<'booster' | 'cosmetic' | 'content'>('booster');
  const [purchaseAnimation, setPurchaseAnimation] = useState<string | null>(null);
  const { haptic } = useTelegram();

  const filteredItems = SHOP_ITEMS.filter(item => item.category === selectedCategory);

  const canAfford = (item: ShopItem) => {
    if (item.currency === 'coins') {
      return coins >= item.price;
    }
    return gems >= item.price;
  };

  const handlePurchase = (item: ShopItem) => {
    if (!canAfford(item)) {
      haptic?.('heavy');
      return;
    }

    // Анимация покупки
    setPurchaseAnimation(item.id);
    haptic?.('medium');
    
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.6 },
    });

    setTimeout(() => {
      onPurchase(item);
      setPurchaseAnimation(null);
    }, 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-purple-900/95 via-pink-900/95 to-blue-900/95 backdrop-blur-sm z-50 overflow-auto"
    >
      <div className="min-h-screen p-4 pb-20">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-7 h-7" />
              Магазин
            </h2>
            <p className="text-white/70 text-sm">Прокачай свою игру!</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/10 rounded-full p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Balance */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 p-4 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-yellow-900 font-semibold">Монеты</span>
              <div className="flex items-center gap-1">
                <span className="text-2xl">🪙</span>
                <span className="text-2xl font-bold text-yellow-900">{coins}</span>
              </div>
            </div>
          </div>
          <div className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-white font-semibold">Кристаллы</span>
              <div className="flex items-center gap-1">
                <span className="text-2xl">💎</span>
                <span className="text-2xl font-bold text-white">{gems}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'booster' as const, label: 'Бустеры', icon: '⚡' },
            { id: 'cosmetic' as const, label: 'Косметика', icon: '🎨', disabled: true },
            { id: 'content' as const, label: 'Контент', icon: '📚', disabled: true },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => !cat.disabled && setSelectedCategory(cat.id)}
              disabled={cat.disabled}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-white text-purple-900 shadow-lg'
                  : cat.disabled
                  ? 'bg-white/10 text-white/40 cursor-not-allowed'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <span className="mr-2">{cat.icon}</span>
              {cat.label}
              {cat.disabled && <span className="ml-2 text-xs">Скоро</span>}
            </button>
          ))}
        </div>

        {/* Items grid */}
        <div className="space-y-3">
          {filteredItems.map((item, index) => {
            const affordable = canAfford(item);
            const isPurchasing = purchaseAnimation === item.id;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white/90 backdrop-blur-sm rounded-2xl p-4 ${
                  !affordable ? 'opacity-60' : ''
                } ${isPurchasing ? 'scale-95' : ''} transition-all`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="text-5xl">{item.icon}</div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 mb-1">{item.name}</h3>
                    <p className="text-sm text-slate-600 mb-3">{item.description}</p>

                    {/* Price & Button */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">
                          {item.currency === 'coins' ? '🪙' : '💎'}
                        </span>
                        <span className="text-xl font-bold text-purple-600">
                          {item.price}
                        </span>
                      </div>

                      <Button
                        onClick={() => handlePurchase(item)}
                        disabled={!affordable || isPurchasing}
                        className={`${
                          affordable
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                            : 'bg-gray-400'
                        }`}
                      >
                        {isPurchasing ? '✨ Покупаю...' : affordable ? 'Купить' : 'Не хватает'}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty state if no items */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎁</div>
            <h3 className="text-white text-xl font-bold mb-2">Скоро здесь появятся товары!</h3>
            <p className="text-white/70">Следи за обновлениями</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Хук для управления инвентарём
export const useInventory = () => {
  const getInventory = (): Record<string, number> => {
    const saved = localStorage.getItem('userInventory');
    return saved ? JSON.parse(saved) : {};
  };

  const addItem = (itemId: string, quantity: number = 1) => {
    const inventory = getInventory();
    inventory[itemId] = (inventory[itemId] || 0) + quantity;
    localStorage.setItem('userInventory', JSON.stringify(inventory));
    return inventory;
  };

  const useItem = (itemId: string): boolean => {
    const inventory = getInventory();
    if (inventory[itemId] && inventory[itemId] > 0) {
      inventory[itemId] -= 1;
      localStorage.setItem('userInventory', JSON.stringify(inventory));
      return true;
    }
    return false;
  };

  const getItemCount = (itemId: string): number => {
    const inventory = getInventory();
    return inventory[itemId] || 0;
  };

  return { getInventory, addItem, useItem, getItemCount };
};
