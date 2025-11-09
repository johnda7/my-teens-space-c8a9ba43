import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { BALANCE_CATEGORIES, BalanceAssessment, calculateCategoryScore } from '@/data/wheelOfBalance';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from 'recharts';

interface WheelOfBalanceProps {
  scores: Record<string, number>;
  type?: 'initial' | 'final' | 'comparison';
  initialScores?: Record<string, number>;
  size?: 'small' | 'medium' | 'large';
}

const WheelOfBalance = ({ scores, type = 'initial', initialScores, size = 'medium' }: WheelOfBalanceProps) => {
  const [animatedScores, setAnimatedScores] = useState<Record<string, number>>({});

  useEffect(() => {
    // Анимация появления значений
    const timer = setTimeout(() => {
      setAnimatedScores(scores);
    }, 500);
    return () => clearTimeout(timer);
  }, [scores]);

  const chartData = BALANCE_CATEGORIES.map(category => ({
    category: category.name,
    current: scores[category.id] || 0,
    initial: initialScores ? (initialScores[category.id] || 0) : 0,
    fullMark: 10
  }));

  const overallScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length || 0;
  const initialOverallScore = initialScores 
    ? Object.values(initialScores).reduce((a, b) => a + b, 0) / Object.values(initialScores).length 
    : 0;
  
  const improvement = overallScore - initialOverallScore;

  const sizeClasses = {
    small: 'h-64',
    medium: 'h-96',
    large: 'h-[32rem]'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-3xl p-6 shadow-xl"
    >
      {/* Заголовок */}
      <div className="text-center mb-6">
        <motion.h2 
          className="text-3xl font-bold text-foreground mb-2"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {type === 'initial' && 'Колесо баланса'}
          {type === 'final' && 'Твой результат! 🎉'}
          {type === 'comparison' && 'Твой прогресс! 📈'}
        </motion.h2>
        
        {type === 'comparison' && improvement > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: 'spring' }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full font-bold"
          >
            <span className="text-2xl">📈</span>
            <span>Улучшение на {improvement.toFixed(1)} баллов!</span>
          </motion.div>
        )}
      </div>

      {/* График */}
      <div className={sizeClasses[size]}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis 
              dataKey="category" 
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
            />
            
            {type === 'comparison' && initialScores && (
              <Radar
                name="Начало"
                dataKey="initial"
                stroke="#94a3b8"
                fill="#cbd5e1"
                fillOpacity={0.3}
              />
            )}
            
            <Radar
              name={type === 'comparison' ? 'Сейчас' : 'Уровень'}
              dataKey="current"
              stroke="#8b5cf6"
              fill="#a78bfa"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Детали категорий */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        {BALANCE_CATEGORIES.map((category, index) => {
          const score = scores[category.id] || 0;
          const initialScore = initialScores?.[category.id] || 0;
          const categoryImprovement = score - initialScore;
          
          return (
            <motion.div
              key={category.id}
              initial={{ x: index % 2 === 0 ? -20 : 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 * index }}
              className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-100"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{category.icon}</span>
                <h3 className="font-bold text-sm text-foreground">{category.name}</h3>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <motion.div 
                    className="text-3xl font-bold" 
                    style={{ color: category.color }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1, type: 'spring' }}
                  >
                    {score.toFixed(1)}
                  </motion.div>
                  <span className="text-sm text-muted-foreground">/10</span>
                </div>
                
                {type === 'comparison' && categoryImprovement !== 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`text-sm font-bold px-2 py-1 rounded-full ${
                      categoryImprovement > 0 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {categoryImprovement > 0 ? '+' : ''}{categoryImprovement.toFixed(1)}
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Общий балл */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-6 p-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl text-white text-center"
      >
        <p className="text-sm font-medium mb-2">Общий балл</p>
        <motion.p 
          className="text-5xl font-bold"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, type: 'spring', stiffness: 200 }}
        >
          {overallScore.toFixed(1)}<span className="text-2xl">/10</span>
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default WheelOfBalance;