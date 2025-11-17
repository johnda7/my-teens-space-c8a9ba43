import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, BookOpen, Target, TrendingUp, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import ParentLearning from './ParentLearning';
import { useTelegram } from '@/hooks/useTelegram';

const ParentApp = () => {
  const { user, haptic } = useTelegram();
  const [activeTab, setActiveTab] = useState<'monitoring' | 'learning'>('monitoring');
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Получение списка детей родителя
  useEffect(() => {
    const fetchChildren = async () => {
      const parentId = localStorage.getItem('userId');
      if (!parentId) return;

      try {
        // TODO: Заменить на реальный API endpoint
        // const response = await fetch(`/api/parent/${parentId}/children`);
        // const data = await response.json();
        
        // Пока используем mock данные
        const mockChildren = [
          {
            id: '1',
            name: 'Мария',
            age: 14,
            progress: {
              boundaries: 75,
              confidence: 60,
              emotions: 45,
              relationships: 30
            },
            totalXP: 1250,
            level: 3,
            streak: 7,
            lastActivity: new Date().toISOString()
          }
        ];
        
        setChildren(mockChildren);
      } catch (error) {
        console.error('Ошибка загрузки детей:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, []);

  const handleTabChange = (tab: 'monitoring' | 'learning') => {
    haptic?.('light');
    setActiveTab(tab);
  };

  if (activeTab === 'learning') {
    return <ParentLearning onBack={() => setActiveTab('monitoring')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Родительская Зона
              </h1>
              <p className="text-sm text-slate-600">
                {user?.first_name || 'Родитель'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={activeTab === 'monitoring' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleTabChange('monitoring')}
                className="gap-2"
              >
                <Users className="w-4 h-4" />
                Дети
              </Button>
              <Button
                variant={activeTab === 'learning' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleTabChange('learning')}
                className="gap-2"
              >
                <BookOpen className="w-4 h-4" />
                Обучение
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-purple-200 bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">{children.length}</p>
                  <p className="text-xs text-slate-600">Детей подключено</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-pink-200 bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-pink-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-pink-600">
                    {children.reduce((sum, child) => sum + (child.progress?.boundaries || 0), 0) / (children.length || 1)}%
                  </p>
                  <p className="text-xs text-slate-600">Средний прогресс</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Children List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Загрузка данных...</p>
          </div>
        ) : children.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="py-12 text-center">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                Нет подключенных детей
              </h3>
              <p className="text-slate-600 mb-6">
                Попросите вашего ребенка ввести код доступа в приложении
              </p>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                Получить код доступа
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {children.map((child) => (
              <motion.div
                key={child.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {child.name[0]}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{child.name}</CardTitle>
                          <p className="text-sm text-slate-600">{child.age} лет</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-amber-600">
                          <Star className="w-4 h-4 fill-amber-600" />
                          <span className="font-semibold">Уровень {child.level}</span>
                        </div>
                        <p className="text-xs text-slate-600">{child.totalXP} XP</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Target className="w-4 h-4 text-green-600" />
                        <span className="text-slate-600">Стрик:</span>
                        <span className="font-semibold text-green-600">{child.streak} дней</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="text-slate-600">Активность:</span>
                        <span className="font-semibold text-blue-600">Сегодня</span>
                      </div>
                    </div>

                    {/* Module Progress */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-slate-700">Прогресс по модулям</h4>
                      
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-600">🛡️ Границы</span>
                            <span className="font-semibold text-purple-600">{child.progress.boundaries}%</span>
                          </div>
                          <Progress value={child.progress.boundaries} className="h-2" />
                        </div>

                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-600">🎯 Уверенность</span>
                            <span className="font-semibold text-blue-600">{child.progress.confidence}%</span>
                          </div>
                          <Progress value={child.progress.confidence} className="h-2" />
                        </div>

                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-600">💜 Эмоции</span>
                            <span className="font-semibold text-pink-600">{child.progress.emotions}%</span>
                          </div>
                          <Progress value={child.progress.emotions} className="h-2" />
                        </div>

                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-600">🤝 Отношения</span>
                            <span className="font-semibold text-green-600">{child.progress.relationships}%</span>
                          </div>
                          <Progress value={child.progress.relationships} className="h-2" />
                        </div>
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        haptic?.('light');
                        // TODO: Открыть детальный просмотр
                      }}
                    >
                      Подробнее
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Learning CTA */}
        <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-1">
                  Учитесь вместе с ребенком! 💜
                </h3>
                <p className="text-sm text-purple-100">
                  30 уроков по психологии подростков специально для родителей
                </p>
              </div>
              <Button 
                variant="secondary"
                onClick={() => handleTabChange('learning')}
                className="ml-4"
              >
                Начать
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ParentApp;
