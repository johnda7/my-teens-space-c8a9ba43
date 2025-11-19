import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Coins, Gem, Zap, Shield, Clock, ShoppingBag, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

const RewardsTab = () => {
  const [activeSection, setActiveSection] = useState<'shop' | 'inventory'>('shop');
  
  // Mock data
  const coins = 1250;
  const gems = 45;

  const shopItems = [
    { id: 1, name: 'Заморозка стрика', price: 300, currency: 'coins', icon: '❄️', description: 'Сохрани стрик, если пропустишь день' },
    { id: 2, name: 'Удвоение XP', price: 200, currency: 'coins', icon: '⚡', description: 'Получай x2 опыта следующие 30 минут' },
    { id: 3, name: 'Восстановление жизни', price: 150, currency: 'coins', icon: '❤️', description: 'Полное восстановление сердец' },
    { id: 4, name: 'Премиум аватар', price: 50, currency: 'gems', icon: '👑', description: 'Золотая рамка для профиля' },
  ];

  const inventoryItems = [
    { id: 1, name: 'Заморозка стрика', count: 2, icon: '❄️' },
    { id: 2, name: 'Удвоение XP', count: 1, icon: '⚡' },
  ];

  return (
    <div className="p-4 pb-24 max-w-md mx-auto h-full flex flex-col">
      {/* Currency Header */}
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
            <Coins className="w-5 h-5 text-yellow-600" />
          </div>
          <span className="font-bold text-lg text-gray-800">{coins}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Gem className="w-5 h-5 text-blue-600" />
          </div>
          <span className="font-bold text-lg text-gray-800">{gems}</span>
        </div>
      </div>

      {/* Toggle Switch */}
      <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
        <button
          onClick={() => setActiveSection('shop')}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
            activeSection === 'shop' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            Магазин
          </div>
        </button>
        <button
          onClick={() => setActiveSection('inventory')}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
            activeSection === 'inventory' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Package className="w-4 h-4" />
            Инвентарь
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeSection === 'shop' ? (
          <div className="grid grid-cols-1 gap-4">
            {shopItems.map((item) => (
              <motion.div
                key={item.id}
                whileTap={{ scale: 0.98 }}
                className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4"
              >
                <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center text-3xl">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{item.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                </div>
                <Button 
                  className={`h-10 px-4 rounded-xl font-bold ${
                    item.currency === 'gems' 
                      ? 'bg-blue-500 hover:bg-blue-600' 
                      : 'bg-yellow-500 hover:bg-yellow-600'
                  }`}
                >
                  {item.price} {item.currency === 'gems' ? '💎' : '🪙'}
                </Button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {inventoryItems.map((item) => (
              <motion.div
                key={item.id}
                className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center text-3xl mb-3">
                  {item.icon}
                </div>
                <h3 className="font-bold text-gray-900 text-sm">{item.name}</h3>
                <div className="mt-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">
                  x{item.count}
                </div>
                <Button variant="outline" className="w-full mt-3 h-8 text-xs">
                  Использовать
                </Button>
              </motion.div>
            ))}
            {/* Empty slots filler */}
            {[1, 2, 3, 4].map((i) => (
              <div key={`empty-${i}`} className="bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200 flex items-center justify-center h-40">
                <span className="text-gray-300 text-xs">Пусто</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RewardsTab;
