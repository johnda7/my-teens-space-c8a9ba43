import { motion } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import WheelOfBalance from '@/components/WheelOfBalance';
import { ArrowLeft, TrendingUp, Award, Calendar, BookOpen, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ParentDashboard = () => {
  const navigate = useNavigate();
  
  // Получаем данные из localStorage (в реальности это будет API)
  const childName = localStorage.getItem('childName') || 'Ваш ребенок';
  const initialScores = JSON.parse(localStorage.getItem('initialBalanceScores') || '{}');
  const finalScores = JSON.parse(localStorage.getItem('finalBalanceScores') || '{}');
  
  const hasInitial = Object.keys(initialScores).length > 0;
  const hasFinal = Object.keys(finalScores).length > 0;
  
  // Статистика обучения (mock данные)
  const stats = {
    completedLessons: 12,
    totalLessons: 44,
    streak: 7,
    level: 3,
    xp: 850,
    modulesProgress: [
      { name: 'Границы', progress: 75, color: '#9b59b6' },
      { name: 'Уверенность', progress: 50, color: '#f39c12' },
      { name: 'Эмоции', progress: 25, color: '#1abc9c' },
      { name: 'Отношения', progress: 15, color: '#e74c3c' }
    ]
  };

  return (
    <div className=\"min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pb-20\">
      {/* Header */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className=\"bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white shadow-2xl sticky top-0 z-40\"
      >
        <div className=\"flex items-center gap-4 mb-4\">
          <Button
            variant=\"ghost\"
            size=\"sm\"
            onClick={() => navigate('/')}
            className=\"text-white hover:bg-white/20\"
          >
            <ArrowLeft className=\"w-5 h-5\" />
          </Button>
          <div>
            <h1 className=\"text-2xl font-bold\">Родительский кабинет</h1>
            <p className=\"text-sm opacity-90\">Прогресс: {childName}</p>
          </div>
        </div>
      </motion.div>

      <div className=\"max-w-6xl mx-auto px-4 py-8 space-y-8\">
        {/* Статистика */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className=\"grid grid-cols-2 md:grid-cols-4 gap-4\"
        >
          <div className=\"bg-white p-6 rounded-3xl shadow-xl border-2 border-purple-100\">
            <div className=\"flex items-center gap-3 mb-2\">
              <BookOpen className=\"w-8 h-8 text-purple-600\" />
              <p className=\"text-sm text-muted-foreground\">Уроки</p>
            </div>
            <p className=\"text-3xl font-bold text-foreground\">
              {stats.completedLessons}/{stats.totalLessons}
            </p>
          </div>

          <div className=\"bg-white p-6 rounded-3xl shadow-xl border-2 border-orange-100\">
            <div className=\"flex items-center gap-3 mb-2\">
              <Calendar className=\"w-8 h-8 text-orange-600\" />
              <p className=\"text-sm text-muted-foreground\">Стрик</p>
            </div>
            <p className=\"text-3xl font-bold text-foreground\">
              {stats.streak} дней 🔥
            </p>
          </div>

          <div className=\"bg-white p-6 rounded-3xl shadow-xl border-2 border-blue-100\">
            <div className=\"flex items-center gap-3 mb-2\">
              <Award className=\"w-8 h-8 text-blue-600\" />
              <p className=\"text-sm text-muted-foreground\">Уровень</p>
            </div>
            <p className=\"text-3xl font-bold text-foreground\">
              {stats.level}
            </p>
          </div>

          <div className=\"bg-white p-6 rounded-3xl shadow-xl border-2 border-green-100\">
            <div className=\"flex items-center gap-3 mb-2\">
              <TrendingUp className=\"w-8 h-8 text-green-600\" />
              <p className=\"text-sm text-muted-foreground\">Опыт</p>
            </div>
            <p className=\"text-3xl font-bold text-foreground\">
              {stats.xp} XP
            </p>
          </div>
        </motion.div>

        {/* Прогресс модулей */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className=\"bg-white rounded-3xl p-8 shadow-xl border-2 border-purple-100\"
        >
          <h2 className=\"text-2xl font-bold text-foreground mb-6 flex items-center gap-2\">
            <BookOpen className=\"w-7 h-7 text-purple-600\" />
            Прогресс по модулям
          </h2>
          <div className=\"space-y-6\">
            {stats.modulesProgress.map((module, index) => (
              <motion.div
                key={index}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 * index }}
              >
                <div className=\"flex justify-between mb-2\">
                  <span className=\"font-semibold text-foreground\">{module.name}</span>
                  <span className=\"text-muted-foreground font-bold\">{module.progress}%</span>
                </div>
                <Progress 
                  value={module.progress} 
                  className=\"h-4\"
                  style={{ 
                    backgroundColor: `${module.color}20`,
                  }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Колесо баланса */}
        {hasInitial && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className=\"text-3xl font-bold text-foreground mb-6 flex items-center gap-2\">
              <Heart className=\"w-8 h-8 text-red-500\" />
              Эмоциональное развитие
            </h2>
            <WheelOfBalance
              scores={hasFinal ? finalScores : initialScores}
              type={hasFinal ? 'comparison' : 'initial'}
              initialScores={hasFinal ? initialScores : undefined}
              size=\"large\"
            />
          </motion.div>
        )}

        {/* Рекомендации */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className=\"bg-gradient-to-r from-purple-100 to-blue-100 rounded-3xl p-8 border-2 border-purple-200\"
        >
          <h3 className=\"text-2xl font-bold text-foreground mb-4\">
            💡 Рекомендации для родителей
          </h3>
          <div className=\"space-y-4 text-foreground\">
            <div className=\"bg-white/70 p-4 rounded-2xl\">
              <p className=\"font-semibold mb-2\">✅ Что идет хорошо:</p>
              <ul className=\"list-disc list-inside space-y-1 text-sm\">
                <li>Ребенок регулярно занимается (стрик {stats.streak} дней)</li>
                <li>Хороший прогресс в модуле \"Границы\"</li>
                <li>Активно взаимодействует с материалом</li>
              </ul>
            </div>
            
            <div className=\"bg-white/70 p-4 rounded-2xl\">
              <p className=\"font-semibold mb-2\">💪 Области для внимания:</p>
              <ul className=\"list-disc list-inside space-y-1 text-sm\">
                <li>Поговорите о теме эмоций - модуль только начат</li>
                <li>Поддержите в установлении личных границ дома</li>
                <li>Обсудите пройденные уроки за ужином</li>
              </ul>
            </div>

            <div className=\"bg-white/70 p-4 rounded-2xl\">
              <p className=\"font-semibold mb-2\">❤️ Советы Кати Карпенко:</p>
              <p className=\"text-sm italic\">
                \"Хвалите ребенка за регулярность, а не только за результаты. 
                Создайте безопасное пространство для обсуждения эмоций дома. 
                Покажите пример уважения границ друг друга в семье.\"
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ParentDashboard;
