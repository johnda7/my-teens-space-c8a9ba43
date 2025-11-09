import { useState, useEffect } from 'react';
import { Home, Calendar, MessageCircle, Users, Video, Award, Target, Shield, Heart, Brain, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import LearningPath from '@/components/LearningPath';
import ModuleRoom from '@/components/ModuleRoom';
import EnhancedLessonInterface from '@/components/EnhancedLessonInterface';
import LessonComplete from '@/components/LessonComplete';
import BalanceAssessment from '@/components/BalanceAssessment';
import WheelOfBalance from '@/components/WheelOfBalance';
import { COMPLETE_LESSONS, getModuleLessons, getWeekLessons } from '@/data/allLessonsData';
import { motion, AnimatePresence } from 'framer-motion';

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [currentModule, setCurrentModule] = useState<string | null>(null);
  const [currentLesson, setCurrentLesson] = useState<string | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [completedLesson, setCompletedLesson] = useState<any>(null);

  const [streak, setStreak] = useState(7);
  const [level, setLevel] = useState(3);
  const [xp, setXp] = useState(450);
  const [nextLevelXP] = useState(600);
  const [currentWeek, setCurrentWeek] = useState(1);
  
  // Колесо баланса
  const [showBalanceWheel, setShowBalanceWheel] = useState(false);
  const [balanceType, setBalanceType] = useState<'initial' | 'final'>('initial');
  const [initialScores, setInitialScores] = useState<Record<string, number> | null>(null);
  const [finalScores, setFinalScores] = useState<Record<string, number> | null>(null);
  
  useEffect(() => {
    // Проверяем есть ли сохраненная начальная оценка
    const savedInitialScores = localStorage.getItem('initialBalanceScores');
    if (savedInitialScores) {
      setInitialScores(JSON.parse(savedInitialScores));
    } else {
      // Показываем колесо баланса при первом запуске
      setShowBalanceWheel(true);
      setBalanceType('initial');
    }
  }, []);

  const getModuleWeekLessons = () => {
    if (!currentModule) return [];
    return getWeekLessons(currentWeek)
      .filter(lesson => lesson.module === currentModule)
      .map((lesson, index) => ({
        id: lesson.id,
        title: lesson.title,
        status: (index === 0 ? 'current' : index < 2 ? 'available' : 'locked') as 'locked' | 'available' | 'current' | 'completed',
        xp: lesson.xp,
      }));
  };

  const weekLessons = getModuleWeekLessons();

  const modules = [
    { id: 'boundaries', name: 'Границы', icon: Shield, theme: 'boundaries' as const, progress: 25 },
    { id: 'confidence', name: 'Уверенность', icon: Target, theme: 'confidence' as const, progress: 10 },
    { id: 'emotions', name: 'Эмоции', icon: Heart, theme: 'emotions' as const, progress: 0 },
    { id: 'relationships', name: 'Отношения', icon: Users, theme: 'relationships' as const, progress: 0 },
  ];

  const handleLessonStart = (lessonId: string) => {
    setCurrentLesson(lessonId);
  };

  const handleLessonComplete = (xpEarned: number) => {
    const lesson = COMPLETE_LESSONS.find(l => l.id === currentLesson);
    setXp(prev => prev + xpEarned);
    setCompletedLesson({ xpEarned, message: lesson?.completionMessage || 'Отлично!' });
    setCurrentLesson(null);
    setShowCompletion(true);
    
    // Проверяем, завершен ли последний урок последнего модуля
    const allModulesComplete = modules.every(m => m.progress >= 100);
    if (allModulesComplete && initialScores && !finalScores) {
      // Показываем финальное колесо баланса
      setTimeout(() => {
        setShowBalanceWheel(true);
        setBalanceType('final');
      }, 2000);
    }
  };
  
  const handleBalanceComplete = (scores: Record<string, number>, answers: Record<string, string>) => {
    if (balanceType === 'initial') {
      setInitialScores(scores);
      localStorage.setItem('initialBalanceScores', JSON.stringify(scores));
      localStorage.setItem('initialBalanceAnswers', JSON.stringify(answers));
    } else {
      setFinalScores(scores);
      localStorage.setItem('finalBalanceScores', JSON.stringify(scores));
      localStorage.setItem('finalBalanceAnswers', JSON.stringify(answers));
    }
    setShowBalanceWheel(false);
  };

  const handleContinueAfterCompletion = () => {
    setShowCompletion(false);
    setCompletedLesson(null);
  };

  // If showing balance assessment
  if (showBalanceWheel) {
    return (
      <BalanceAssessment 
        onComplete={handleBalanceComplete}
        type={balanceType}
      />
    );
  }
  
  // If showing lesson
  if (currentLesson) {
    const lesson = COMPLETE_LESSONS.find(l => l.id === currentLesson);
    if (lesson) {
      return (
        <EnhancedLessonInterface
          questions={lesson.questions}
          onComplete={handleLessonComplete}
          onExit={() => setCurrentLesson(null)}
          lessonTitle={lesson.title}
          xpReward={lesson.xp}
        />
      );
    }
  }

  // If showing completion
  if (showCompletion && completedLesson) {
    return (
      <LessonComplete
        xpEarned={completedLesson.xpEarned}
        message={completedLesson.message}
        onContinue={handleContinueAfterCompletion}
      />
    );
  }

  // If in module room
  if (currentModule) {
    const module = modules.find(m => m.id === currentModule);
    if (module) {
      const Icon = module.icon;
      return (
        <div className="min-h-screen">
          <ModuleRoom
            title={module.name}
            description={`Твой путь к пониманию ${module.name.toLowerCase()}`}
            icon={<Icon className="w-12 h-12" />}
            theme={module.theme}
            progress={module.progress}
          >
            <div className="max-w-4xl mx-auto">
              <Button 
                onClick={() => setCurrentModule(null)}
                variant="outline"
                className="mb-6"
              >
                ← Назад к модулям
              </Button>
              <LearningPath
                lessons={weekLessons}
                currentLessonIndex={1}
                onLessonStart={handleLessonStart}
                weekNumber={currentWeek}
              />
            </div>
          </ModuleRoom>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 pb-20">
      {/* Header */}
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="bg-gradient-to-r from-primary via-secondary to-accent p-6 text-white shadow-2xl sticky top-0 z-40"
      >
        <div className="flex items-center justify-between mb-4">
          <motion.div
            initial={{ x: -50 }}
            animate={{ x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-2xl font-bold">MyTeens.Space</h1>
            <p className="text-sm opacity-90">с психологом Катей Карпенко</p>
          </motion.div>
          <div className="flex gap-3">
            <motion.div 
              whileHover={{ scale: 1.15, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              animate={{ 
                scale: [1, 1.1, 1],
              }}
              transition={{
                scale: {
                  duration: 1,
                  repeat: Infinity,
                  repeatDelay: 2
                }
              }}
              className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-lg shadow-lg border border-white/30"
            >
              <motion.span 
                className="text-2xl"
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
              >
                🔥
              </motion.span>
              <span className="font-bold text-lg">{streak}</span>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.15, rotate: -5 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-lg shadow-lg border border-white/30"
            >
              <Award className="w-6 h-6" />
              <span className="font-bold text-lg">{level}</span>
            </motion.div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span>Уровень {level}</span>
            <motion.span
              key={xp}
              initial={{ scale: 1.5, color: "#ffc800" }}
              animate={{ scale: 1, color: "#ffffff" }}
            >
              {xp}/{nextLevelXP} XP
            </motion.span>
          </div>
          <div className="relative">
            <Progress value={(xp / nextLevelXP) * 100} className="h-4 bg-white/30" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            />
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Modules Grid */}
              <div>
                <motion.h2 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="text-3xl font-bold text-foreground mb-6"
                >
                  Модули обучения
                </motion.h2>
                <div className="grid grid-cols-2 gap-5">
                  {modules.map((module, index) => {
                    const Icon = module.icon;
                    return (
                      <motion.button
                        key={module.id}
                        initial={{ scale: 0, rotate: -180, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        transition={{ 
                          delay: index * 0.15, 
                          type: "spring",
                          stiffness: 200,
                          damping: 15
                        }}
                        whileHover={{ 
                          scale: 1.08, 
                          y: -8,
                          boxShadow: "0 20px 40px rgba(0,0,0,0.15)"
                        }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentModule(module.id)}
                        className="bg-card p-6 rounded-3xl shadow-xl border-3 border-border hover:border-primary transition-all relative overflow-hidden"
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"
                          whileHover={{ opacity: 1 }}
                          initial={{ opacity: 0 }}
                        />
                        <div className="relative flex flex-col items-center gap-3">
                          <motion.div 
                            className={`w-20 h-20 rounded-3xl flex items-center justify-center bg-gradient-to-br shadow-lg ${
                              module.theme === 'boundaries' ? 'from-purple-500/30 to-pink-500/30' :
                              module.theme === 'confidence' ? 'from-yellow-500/30 to-orange-500/30' :
                              module.theme === 'emotions' ? 'from-blue-500/30 to-cyan-500/30' :
                              'from-pink-500/30 to-rose-500/30'
                            }`}
                            whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                            transition={{ duration: 0.5 }}
                          >
                            <Icon className="w-10 h-10 text-primary" />
                          </motion.div>
                          <h3 className="font-bold text-lg text-foreground">{module.name}</h3>
                          <div className="w-full">
                            <Progress value={module.progress} className="w-full h-3 mb-2" />
                            <span className="text-sm font-semibold text-muted-foreground">{module.progress}%</span>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Stats */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-card p-6 rounded-3xl shadow-lg border border-border"
              >
                <h3 className="text-lg font-bold text-foreground mb-4">Твой прогресс</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{streak}</div>
                    <div className="text-xs text-muted-foreground">Дней подряд</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-secondary">{xp}</div>
                    <div className="text-xs text-muted-foreground">Всего XP</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent">{level}</div>
                    <div className="text-xs text-muted-foreground">Уровень</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'checkin' && (
            <motion.div
              key="checkin"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="bg-card p-6 rounded-3xl shadow-lg border border-border">
                <h2 className="text-2xl font-bold text-foreground mb-6">Ежедневный чек-ин</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">
                      Как твое настроение?
                    </label>
                    <div className="flex justify-around">
                      {['😢', '😐', '🙂', '😊', '😄'].map((emoji, index) => (
                        <motion.button
                          key={emoji}
                          whileHover={{ scale: 1.3, rotate: 10 }}
                          whileTap={{ scale: 0.9 }}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="text-4xl"
                        >
                          {emoji}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">
                      Уровень тревожности (0-10)
                    </label>
                    <Slider defaultValue={[5]} max={10} step={1} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">
                      Сколько часов спал(а)?
                    </label>
                    <Input type="number" placeholder="8" className="text-center text-lg" />
                  </div>

                  <Button className="w-full" size="lg">
                    Сохранить чек-ин
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <div className="bg-card p-6 rounded-3xl shadow-lg border border-border">
                <h2 className="text-2xl font-bold text-foreground mb-4">Чат с Катей</h2>
                <div className="space-y-4 mb-4 h-96 overflow-y-auto">
                  <motion.div 
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex gap-3"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-xl flex-shrink-0">
                      👩‍⚕️
                    </div>
                    <div className="bg-primary/10 p-4 rounded-2xl rounded-tl-none">
                      <p className="text-foreground">Привет! Как твой день?</p>
                    </div>
                  </motion.div>
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Напиши сообщение..." className="flex-1" />
                  <Button size="icon">
                    <MessageCircle className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'group' && (
            <motion.div
              key="group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <div className="bg-card p-6 rounded-3xl shadow-lg border border-border">
                <h2 className="text-2xl font-bold text-foreground mb-4">Группа в Telegram</h2>
                <p className="text-muted-foreground mb-6">
                  Присоединяйся к нашему сообществу, где ты можешь общаться с другими подростками
                  и получать поддержку.
                </p>
                <Button className="w-full" size="lg">
                  Присоединиться к группе
                </Button>
              </div>
            </motion.div>
          )}

          {activeTab === 'videos' && (
            <motion.div
              key="videos"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <div className="bg-card p-6 rounded-3xl shadow-lg border border-border">
                <h2 className="text-2xl font-bold text-foreground mb-4">Записи сессий</h2>
                <div className="space-y-3">
                  {['Введение в эмоции', 'Техники релаксации', 'Уверенность в себе'].map(
                    (title, index) => (
                      <motion.div
                        key={index}
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, x: 5 }}
                        className="p-4 bg-muted rounded-xl cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <Video className="w-8 h-8 text-primary" />
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{title}</p>
                            <p className="text-sm text-muted-foreground">15 минут</p>
                          </div>
                        </div>
                      </motion.div>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t-4 border-primary/20 shadow-2xl z-50"
      >
        <div className="flex justify-around p-2">
          {[
            { id: 'home', icon: Home, label: 'Главная' },
            { id: 'progress', icon: TrendingUp, label: 'Прогресс' },
            { id: 'checkin', icon: Calendar, label: 'Чек-ин' },
            { id: 'chat', icon: MessageCircle, label: 'Чат' },
            { id: 'videos', icon: Video, label: 'Видео' },
          ].map((tab, index) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.9 }}
              className={`flex flex-col items-center gap-1 px-3 py-3 rounded-2xl transition-all relative ${
                activeTab === tab.id
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <AnimatePresence>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary/10 rounded-2xl"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </AnimatePresence>
              <motion.div
                animate={activeTab === tab.id ? { 
                  y: [0, -3, 0],
                  scale: [1, 1.1, 1]
                } : {}}
                transition={{ duration: 0.3 }}
                className="relative z-10"
              >
                <tab.icon className="w-6 h-6" />
              </motion.div>
              <span className="text-xs font-semibold relative z-10">{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Index;
