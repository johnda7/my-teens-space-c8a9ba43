import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Calendar, MessageCircle, Users, Award, Target, Shield, Heart, Video } from 'lucide-react';
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
import AnimatedKatyaV2 from '@/components/AnimatedKatyaV2';
import { useTelegram } from '@/hooks/useTelegram';
import { COMPLETE_LESSONS, getModuleLessons, getWeekLessons } from '@/data/allLessonsData';
import { motion, AnimatePresence } from 'framer-motion';
import '@/styles/game.css';

const Index = () => {
  const navigate = useNavigate();
  const { haptic, isInTelegram, user } = useTelegram();
  const [activeTab, setActiveTab] = useState<'learning' | 'checkin' | 'chat' | 'group' | 'profile'>('learning');
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
    }
    // Не форсим колесо баланса на первом экране — запускаем его по кнопке
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

  // Простейшая логика "миссии дня": первый урок первого модуля
  const dailyMissionLesson = COMPLETE_LESSONS.find(
    (lesson) => lesson.module === 'boundaries'
  );

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
  };

  const renderLearningTab = () => {
    return (
      <div className="space-y-6">
        {/* Миссия дня */}
        {dailyMissionLesson && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-sm p-5 rounded-3xl shadow-lg border border-white/60"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Миссия дня</h3>
                <p className="text-xs text-slate-600">+{dailyMissionLesson.xp} XP</p>
              </div>
            </div>
            <p className="text-sm text-slate-700 mb-3">{dailyMissionLesson.title}</p>
            <Button
              onClick={() => handleLessonStart(dailyMissionLesson.id)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Начать урок
            </Button>
          </motion.div>
        )}

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl text-center">
            <div className="text-2xl mb-1">🔥</div>
            <div className="text-xs text-slate-600">Стрик</div>
            <div className="text-lg font-bold text-slate-900">{streak}</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl text-center">
            <div className="text-2xl mb-1">⭐</div>
            <div className="text-xs text-slate-600">Уровень</div>
            <div className="text-lg font-bold text-slate-900">{level}</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl text-center">
            <div className="text-2xl mb-1">📚</div>
            <div className="text-xs text-slate-600">Модуль</div>
            <div className="text-lg font-bold text-slate-900">{currentModule || 'N/A'}</div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start bg-white/80 backdrop-blur-sm"
            onClick={() => {
              if (!initialScores) {
                setShowBalanceWheel(true);
                setBalanceType('initial');
              } else {
                setShowBalanceWheel(true);
                setBalanceType('final');
              }
            }}
          >
            {!initialScores ? '🎯 Стартовый тест баланса' : '📊 Измерить баланс'}
          </Button>
        </div>

        {/* Модули */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">Модули обучения</h3>
          <div className="grid grid-cols-2 gap-3">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <motion.div
                  key={module.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentModule(module.id)}
                  className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                >
                  <Icon className="w-6 h-6 text-purple-600 mb-2" />
                  <h4 className="text-sm font-semibold text-slate-900 mb-1">{module.name}</h4>
                  <div className="flex items-center gap-2">
                    <Progress value={module.progress} className="h-1 flex-1" />
                    <span className="text-xs text-slate-600">{module.progress}%</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Колесо баланса preview */}
        {initialScores && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/80 backdrop-blur-sm p-4 rounded-3xl"
          >
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Твой баланс</h3>
            <WheelOfBalance
              scores={finalScores || initialScores}
              type={finalScores ? 'comparison' : 'initial'}
              initialScores={finalScores ? initialScores : undefined}
              size="small"
            />
          </motion.div>
        )}
      </div>
    );
  };

  const renderCheckInTab = () => {
    return (
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">Чек-ин с Катей</h2>
        <p className="text-xs text-slate-600">
          Здесь будет ежедневный чек-ин и практики для сна и расслабления, перенесённые из старого приложения.
        </p>
      </div>
    );
  };

  const renderChatTab = () => {
    return (
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">Чат с Катей</h2>
        <p className="text-xs text-slate-600">
          Сюда добавим живой диалог с Катей и быстрые подсказки.
        </p>
      </div>
    );
  };

  const renderGroupTab = () => {
    return (
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">Группа</h2>
        <p className="text-xs text-slate-600">
          Здесь будет доступ к Telegram-группе и эфиром. Можно будет открыть чат прямо из приложения.
        </p>
      </div>
    );
  };

  const renderProfileTab = () => {
    return (
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">Профиль и награды</h2>
        <p className="text-xs text-slate-600">
          Здесь будут твои бейджи, прогресс по модулям и настройки.
        </p>
      </div>
    );
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'learning':
        return renderLearningTab();
      case 'checkin':
        return renderCheckInTab();
      case 'chat':
        return renderChatTab();
      case 'group':
        return renderGroupTab();
      case 'profile':
        return renderProfileTab();
      default:
        return renderLearningTab();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 pb-20 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.15, 0.1, 0.15],
            x: [0, -30, 0],
            y: [0, 50, 0]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5
          }}
        />
        <motion.div
          className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-400/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.15, 0.1],
            x: [0, -40, 0],
            y: [0, -20, 0]
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 10
          }}
        />
      </div>

      {/* Header with glassmorphism */}
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 400,
          damping: 17
        }}
        className="relative bg-white/70 backdrop-blur-[40px] p-6 text-gray-900 shadow-[0_8px_32px_rgba(0,0,0,0.12)] sticky top-0 z-40 border-b border-white/20"
      >
        
        <div className="relative flex items-center justify-between mb-4">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <motion.h1 
              className="text-2xl font-bold"
              whileHover={{ scale: 1.02 }}
            >
              MyTeens.Space
            </motion.h1>
            <motion.p 
              className="text-sm opacity-90"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.9 }}
              transition={{ delay: 0.4 }}
            >
              с психологом Катей Карпенко
            </motion.p>
          </motion.div>
          <div className="flex gap-3">
            <motion.div 
              whileHover={{ scale: 1.15, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              animate={{ 
                y: [0, -5, 0],
              }}
              transition={{
                y: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
              className="relative flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-lg shadow-lg border border-white/30"
            >
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400/20 to-orange-400/20"
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.span 
                className="text-2xl relative z-10"
                animate={{ 
                  rotate: [0, 15, -15, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                🔥
              </motion.span>
              <span className="font-bold text-lg relative z-10">{streak}</span>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.15, rotate: -5 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                rotate: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
              className="relative flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-lg shadow-lg border border-white/30"
            >
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-300/20 to-yellow-500/20"
                animate={{ 
                  scale: [1, 1.05, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <Award className="w-6 h-6 relative z-10" />
              <span className="font-bold text-lg relative z-10">{level}</span>
            </motion.div>
          </div>
        </div>
        <div className="space-y-2 relative">
          <div className="flex justify-between text-sm font-medium">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Уровень {level}
            </motion.span>
            <motion.span
              key={xp}
              initial={{ scale: 1.3, y: -5 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="font-bold"
            >
              {xp}/{nextLevelXP} XP
            </motion.span>
          </div>
          <div className="relative rounded-full overflow-hidden">
            <Progress value={(xp / nextLevelXP) * 100} className="h-4 bg-white/30" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full"
              animate={{ x: ["-100%", "200%"] }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                repeatDelay: 0.5,
                ease: "easeInOut" 
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          {/* Header with glassmorphism */}
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 17,
            }}
            className="relative bg-white/70 backdrop-blur-[40px] px-4 pt-4 pb-3 text-gray-900 shadow-[0_8px_32px_rgba(0,0,0,0.12)] sticky top-0 z-40 border-b border-white/20"
          >
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-500 mb-0.5">Сегодня</p>
                <h1 className="text-lg font-semibold text-slate-900">
                  {user?.first_name ? `${user.first_name}, привет!` : 'Привет!'}
                </h1>
                <p className="text-[12px] text-slate-600">
                  Можно зайти в урок, сделать чек-ин или заглянуть в группу.
                </p>
              </div>
              <div className="w-16 h-16 relative hidden sm:block">
                <AnimatedKatyaV2 />
              </div>
            </div>
          </motion.div>

          <main className="relative z-10 px-4 pt-4 pb-24 max-w-3xl mx-auto">
            {renderActiveTab()}
          </main>

          {/* NOTE: legacy tab-specific content below is obsolete and will be removed in favor of renderActiveTab; keep only if needed. */}

          {/* Example of old 'progress' tab content (no longer used) */}
          {false && activeTab === 'progress' && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {initialScores && (
                <WheelOfBalance 
                  scores={finalScores || initialScores}
                  type={finalScores ? 'comparison' : 'initial'}
                  initialScores={finalScores ? initialScores : undefined}
                  size="large"
                />
              )}
              
              {!initialScores && (
                <div className="bg-card p-8 rounded-3xl shadow-lg border border-border text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-6xl mb-4"
                  >
                    📊
                  </motion.div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    Колесо баланса
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Пройди начальную оценку, чтобы увидеть свой прогресс!
                  </p>
                  <Button 
                    size="lg"
                    onClick={() => {
                      setShowBalanceWheel(true);
                      setBalanceType('initial');
                    }}
                  >
                    Начать оценку
                  </Button>
                </div>
              )}
              
              {initialScores && !finalScores && (
                <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-6 rounded-3xl border-2 border-purple-200">
                  <p className="text-center text-muted-foreground">
                    💡 <strong>Совет:</strong> Пройди все модули обучения, чтобы увидеть свой прогресс в конце!
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {false && activeTab === 'checkin' && (
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

          {false && activeTab === 'chat' && (
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

          {false && activeTab === 'group' && (
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

          {false && activeTab === 'videos' && (
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

      {/* Модальные окна и оверлеи */}
      <AnimatePresence>
        {showBalanceWheel && (
          <BalanceAssessment
            type={balanceType}
            onComplete={(scores) => {
              if (balanceType === 'initial') {
                setInitialScores(scores);
                localStorage.setItem('initialBalanceScores', JSON.stringify(scores));
              } else {
                setFinalScores(scores);
                localStorage.setItem('finalBalanceScores', JSON.stringify(scores));
              }
              setShowBalanceWheel(false);
            }}
            onClose={() => setShowBalanceWheel(false)}
          />
        )}

        {currentModule && !currentLesson && (
          <ModuleRoom
            moduleId={currentModule}
            lessons={weekLessons}
            onLessonSelect={handleLessonStart}
            onClose={() => setCurrentModule(null)}
            currentWeek={currentWeek}
            onWeekChange={setCurrentWeek}
          />
        )}

        {currentLesson && (
          <EnhancedLessonInterface
            lesson={COMPLETE_LESSONS.find(l => l.id === currentLesson)!}
            onComplete={handleLessonComplete}
            onClose={() => setCurrentLesson(null)}
          />
        )}

        {showCompletion && completedLesson && (
          <LessonComplete
            xpEarned={completedLesson.xpEarned}
            message={completedLesson.message}
            onContinue={() => {
              setShowCompletion(false);
              setCompletedLesson(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Bottom navigation - табы как в GameMode */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-md">
        <div className="grid grid-cols-5 gap-2 rounded-3xl bg-white/90 backdrop-blur-xl shadow-[0_18px_45px_rgba(15,23,42,0.22)] border border-white/80 px-3 py-2">
          {[
            { id: 'learning' as const, label: 'Учёба', icon: Home },
            { id: 'checkin' as const, label: 'Чек-ин', icon: Calendar },
            { id: 'chat' as const, label: 'Чат', icon: MessageCircle },
            { id: 'group' as const, label: 'Группа', icon: Users },
            { id: 'profile' as const, label: 'Профиль', icon: Award },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  haptic?.('light');
                }}
                className={`flex flex-col items-center justify-center gap-0.5 rounded-2xl px-2 py-1.5 text-[10px] font-medium transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-[0_10px_30px_rgba(147,51,234,0.45)]'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Index;
