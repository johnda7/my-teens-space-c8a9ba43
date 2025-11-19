import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Calendar, MessageCircle, Users, Award, Target, Shield, Heart, Video, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import LearningPath from '@/components/LearningPath';
import ModuleRoom from '@/components/ModuleRoom';
import EnhancedLessonInterface from '@/components/EnhancedLessonInterface';
import LessonComplete from '@/components/LessonComplete';
import BalanceAssessment from '@/components/BalanceAssessment';
import WheelOfBalance from '@/components/WheelOfBalance';
import AnimatedKatyaV2 from '@/components/AnimatedKatyaV2';
import { EnergySystem } from '@/components/EnergySystem';
import { CurrencyDisplay, useCurrency } from '@/components/CurrencyDisplay';
import { DailyQuests, useQuestProgress } from '@/components/DailyQuests';
import { EmotionMatchGame } from '@/components/EmotionMatchGame';
import { Shop, useInventory } from '@/components/Shop';
import { Achievements, useAchievements } from '@/components/Achievements';
import { Inventory } from '@/components/Inventory';
import { ActiveEffects } from '@/components/ActiveEffects';
import LessonPreview from '@/components/LessonPreview';
import { useTelegram } from '@/hooks/useTelegram';
import { COMPLETE_LESSONS, getModuleLessons, getWeekLessons } from '@/data/allLessonsData';
import { motion, AnimatePresence } from 'framer-motion';
import { fullSync, syncProgressToServer, completeLessonWithSync, setupAutoSync } from '@/lib/syncUtils';
import '@/styles/game.css';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { haptic, isInTelegram, user, themeParams, selectionFeedback } = useTelegram();
  const questProgress = useQuestProgress();
  const inventory = useInventory();
  const achievementsHook = useAchievements();
  
  const [activeTab, setActiveTab] = useState<'learning' | 'checkin' | 'chat' | 'group' | 'profile'>('learning');
  const [currentModule, setCurrentModule] = useState<string | null>(null);
  const [currentLesson, setCurrentLesson] = useState<string | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [completedLesson, setCompletedLesson] = useState<any>(null);
  const [showMiniGame, setShowMiniGame] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showLessonPreview, setShowLessonPreview] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);

  const [streak, setStreak] = useState(7);
  const [level, setLevel] = useState(3);
  const [xp, setXp] = useState(450);
  const [nextLevelXP] = useState(600);
  const [currentWeek, setCurrentWeek] = useState(1);
  
  // Игровые ресурсы
  const { coins, gems, addCoins, addGems, spendCoins, spendGems } = useCurrency();
  
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
    
    // Проверяем и обновляем streak
    checkAndUpdateStreak();
    
    // Проверяем достижения при загрузке
    achievementsHook.updateProgress('streak_7', streak);
    achievementsHook.updateProgress('streak_30', streak);
    achievementsHook.updateProgress('coins_1000', coins);
    
    // Синхронизация с сервером при наличии Telegram ID
    const initSync = async () => {
      const telegramId = user?.id?.toString();
      if (telegramId) {
        console.log('🔄 Инициализация синхронизации для Telegram ID:', telegramId);
        
        // Полная синхронизация при загрузке
        const syncSuccess = await fullSync(telegramId);
        
        if (syncSuccess) {
          toast({
            title: '✅ Прогресс синхронизирован',
            description: 'Твои данные загружены с облака',
            duration: 3000,
          });
          
          // Обновляем state из обновленного localStorage
          const updatedXP = parseInt(localStorage.getItem('userXP') || '0');
          const updatedStreak = parseInt(localStorage.getItem('currentStreak') || '0');
          setXp(updatedXP);
          setStreak(updatedStreak);
        }
        
        // Настраиваем автоматическую синхронизацию каждые 5 минут
        const cleanup = setupAutoSync(telegramId, 5);
        return cleanup;
      }
    };
    
    initSync();
  }, [user]);
  
  // Функция проверки и обновления стрика
  const checkAndUpdateStreak = () => {
    const lastActivityDate = localStorage.getItem('lastActivityDate');
    const today = new Date().toDateString();
    
    if (!lastActivityDate) {
      // Первый запуск - начинаем стрик с 1
      setStreak(1);
      localStorage.setItem('lastActivityDate', today);
      localStorage.setItem('currentStreak', '1');
      return;
    }
    
    const lastDate = new Date(lastActivityDate);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Сегодня уже был - стрик не меняется
      const savedStreak = parseInt(localStorage.getItem('currentStreak') || '1');
      setStreak(savedStreak);
    } else if (diffDays === 1) {
      // Вчера был - стрик продолжается
      const savedStreak = parseInt(localStorage.getItem('currentStreak') || '1');
      const newStreak = savedStreak + 1;
      setStreak(newStreak);
      localStorage.setItem('lastActivityDate', today);
      localStorage.setItem('currentStreak', newStreak.toString());
    } else {
      // Пропущено больше 1 дня - проверяем защиту стрика
      const hasProtection = localStorage.getItem('streakProtection') === 'true';
      
      if (hasProtection) {
        // Защита активна - стрик сохраняется
        const savedStreak = parseInt(localStorage.getItem('currentStreak') || '1');
        setStreak(savedStreak);
        localStorage.setItem('lastActivityDate', today);
        
        // Убираем защиту после использования
        localStorage.removeItem('streakProtection');
        localStorage.removeItem('streakProtectionDate');
        
        console.log('🛡️ Защита стрика использована! Стрик сохранен.');
        
        // Показать уведомление
        haptic?.('medium');
        toast({
          title: '🛡️ Защита стрика сработала!',
          description: `Твой стрик ${savedStreak} дней сохранён! Защита израсходована.`,
          duration: 5000,
        });
      } else {
        // Нет защиты - стрик сбрасывается
        setStreak(1);
        localStorage.setItem('lastActivityDate', today);
        localStorage.setItem('currentStreak', '1');
        
        console.log('💔 Стрик сброшен из-за пропуска дня');
        toast({
          title: '💔 Стрик сброшен',
          description: 'Ты пропустил день. Начни новый стрик! Купи защиту стрика в магазине.',
          variant: 'destructive',
          duration: 5000,
        });
      }
    }
  };
  
  // Проверяем достижения при изменении монет
  useEffect(() => {
    achievementsHook.updateProgress('coins_1000', coins);
  }, [coins]);

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
    { id: 'boundaries', name: 'Границы', icon: Shield, theme: 'boundaries' as const, progress: 25, color: 'from-purple-500/10 to-pink-500/10' },
    { id: 'confidence', name: 'Уверенность', icon: Target, theme: 'confidence' as const, progress: 10, color: 'from-blue-500/10 to-cyan-500/10' },
    { id: 'emotions', name: 'Эмоции', icon: Heart, theme: 'emotions' as const, progress: 0, color: 'from-pink-500/10 to-rose-500/10' },
    { id: 'relationships', name: 'Отношения', icon: Users, theme: 'relationships' as const, progress: 0, color: 'from-green-500/10 to-emerald-500/10' },
  ];

  // Auto-start first lesson for new users
  useEffect(() => {
    const completedLessons = JSON.parse(localStorage.getItem('completedLessons') || '[]');
    const hasStartedFirstLesson = localStorage.getItem('hasStartedFirstLesson');
    
    if (completedLessons.length === 0 && activeTab === 'learning' && !currentLesson && !hasStartedFirstLesson) {
      // Small delay to ensure UI is ready
      const timer = setTimeout(() => {
        console.log('🚀 Auto-starting first lesson for new user');
        handleLessonStart('boundaries-w1-1');
        localStorage.setItem('hasStartedFirstLesson', 'true');
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [activeTab, currentLesson]);

  const handleLessonStart = (lessonId: string) => {
    console.log('👉 handleLessonStart called with:', lessonId);
    try {
      haptic?.('light');
    } catch (e) {
      console.error('Haptic error:', e);
    }

    // Для миссии дня сразу отправляем в урок без лишнего превью
    if (lessonId === 'boundaries-w1-1') {
      console.log('🚀 Fast starting boundaries-w1-1');
      setCurrentModule('boundaries');
      setCurrentLesson('boundaries-w1-1');
      setShowLessonPreview(false);
      return;
    }

    const lesson = COMPLETE_LESSONS.find(l => l.id === lessonId);
    if (lesson) {
      setSelectedLesson(lesson);
      setShowLessonPreview(true);
    }
  };

  const startLessonFromPreview = () => {
    setShowLessonPreview(false);
    if (selectedLesson) {
      setCurrentLesson(selectedLesson.id);
    }
  };

  // Найти следующий незавершенный урок
  const getNextLesson = () => {
    const completedLessons = JSON.parse(localStorage.getItem('completedLessons') || '[]');
    return COMPLETE_LESSONS.find(lesson => !completedLessons.includes(lesson.id));
  };

  const handleNextLesson = () => {
    setShowCompletion(false);
    setCompletedLesson(null);
    const nextLesson = getNextLesson();
    if (nextLesson) {
      handleLessonStart(nextLesson.id);
    }
  };

  const handleUseItem = (itemId: string, effect: { type: string; value: number }) => {
    switch (effect.type) {
      case 'energy':
        // Восстановление энергии
        const currentEnergy = parseInt(localStorage.getItem('userEnergy') || '100');
        const newEnergy = Math.min(100, currentEnergy + effect.value);
        localStorage.setItem('userEnergy', newEnergy.toString());
        localStorage.setItem('lastEnergyUpdate', Date.now().toString());
        
        haptic?.('medium');
        console.log(`✨ Энергия восстановлена на +${effect.value}`);
        toast({
          title: '⚡ Энергия восстановлена!',
          description: `+${effect.value} энергии. Теперь: ${newEnergy}/100`,
          duration: 3000,
        });
        break;
        
      case 'xp_boost':
        // Активировать XP бустер на следующий урок
        localStorage.setItem('activeXPBoost', 'true');
        haptic?.('medium');
        console.log('🚀 XP Booster активирован!');
        toast({
          title: '🚀 XP Booster активирован!',
          description: 'Следующий урок принесёт в 2 раза больше XP!',
          duration: 3000,
        });
        break;
        
      case 'streak_protection':
        // Защита стрика
        localStorage.setItem('streakProtection', 'true');
        localStorage.setItem('streakProtectionDate', new Date().toISOString());
        haptic?.('medium');
        console.log('🛡️ Защита стрика активирована!');
        toast({
          title: '🛡️ Защита стрика активирована!',
          description: 'Если пропустишь день, твой стрик не сбросится. Защита сработает один раз.',
          duration: 4000,
        });
        break;
        
      case 'hint':
        // Подсказки добавляются автоматически в инвентарь
        haptic?.('light');
        console.log('💡 Подсказка готова к использованию в уроке');
        break;
    }
    
    // Закрываем инвентарь
    setShowInventory(false);
  };

  const handleLessonComplete = (xpEarned: number) => {
    const lesson = COMPLETE_LESSONS.find(l => l.id === currentLesson);
    
    // Проверяем активный XP бустер
    let finalXP = xpEarned;
    if (localStorage.getItem('activeXPBoost') === 'true') {
      finalXP = xpEarned * 2;
      localStorage.removeItem('activeXPBoost');
      console.log('🚀 XP удвоен бустером!');
    }
    
    // Обновляем XP
    setXp(prev => prev + finalXP);
    
    // Начисляем монеты (10 монет за урок + бонус за XP)
    const coinsEarned = 10 + Math.floor(finalXP / 10);
    addCoins(coinsEarned);
    
    // Обновляем дату последней активности для стрика
    const today = new Date().toDateString();
    localStorage.setItem('lastActivityDate', today);
    
    // Обновляем квесты
    questProgress.updateLessonQuest();
    questProgress.updateXPQuest(finalXP);
    
    // Проверяем и разблокируем достижения
    const completedLessons = JSON.parse(localStorage.getItem('completedLessons') || '[]');
    completedLessons.push(currentLesson);
    localStorage.setItem('completedLessons', JSON.stringify(completedLessons));
    
    // Достижение "Новичок" - первый урок
    if (completedLessons.length === 1) {
      const achievement = achievementsHook.unlockAchievement('first_lesson');
      if (achievement) {
        console.log('🏆 Разблокировано достижение:', achievement.name);
      }
    }
    
    // Обновляем прогресс достижений по количеству уроков
    achievementsHook.updateProgress('lessons_10', completedLessons.length);
    achievementsHook.updateProgress('lessons_25', completedLessons.length);
    achievementsHook.updateProgress('lessons_all', completedLessons.length);
    
    // Достижение "Перфекционист" - 100% за урок
    if (xpEarned >= (lesson?.xp || 0)) {
      achievementsHook.unlockAchievement('perfect_score');
    }
    
    setCompletedLesson({ 
      xpEarned: finalXP, 
      coinsEarned,
      message: lesson?.completionMessage || 'Отлично!',
      xpBoosted: finalXP !== xpEarned // Флаг что был бустер
    });
    setCurrentLesson(null);
    setShowCompletion(true);
  };

  const renderLearningTab = () => {
    return (
      <div className="space-y-6">
        {/* Кнопка переключения в Game Mode (Beta) */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button 
            onClick={() => navigate('/game-mode')}
            className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold py-6 rounded-2xl shadow-xl border-2 border-white/20"
          >
            <Gamepad2 className="w-6 h-6 mr-2" />
            Перейти в Game Mode (Beta)
          </Button>
        </motion.div>

        {/* Энергия и валюта - игровой header */}
        <div className="flex justify-between items-center gap-2">
          <EnergySystem />
          <div className="flex items-center gap-2">
            {/* Кнопка рюкзака */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowInventory(true)}
              className="relative bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-2xl shadow-lg"
            >
              <span className="text-2xl">🎒</span>
              {inventory.getInventory() && Object.keys(inventory.getInventory()).length > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {Object.values(inventory.getInventory()).reduce((a, b) => a + b, 0)}
                </div>
              )}
            </motion.button>
            <CurrencyDisplay 
              onCoinsClick={() => setShowShop(true)}
              onGemsClick={() => setShowShop(true)}
            />
          </div>
        </div>

        {/* Активные эффекты */}
        <ActiveEffects />

        {/* Ежедневные задания */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-tg-bg/60 backdrop-blur-[20px] border border-tg-hint/20 p-4 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl">
              <Target className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-tg-text font-bold">Дневные миссии</h3>
          </div>
          <DailyQuests />
        </motion.div>

        {/* Миссия дня */}
        {dailyMissionLesson && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 bg-tg-bg/70 backdrop-blur-[20px] p-5 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-tg-hint/20"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-tg-text">Урок дня</h3>
                <p className="text-xs text-tg-hint">+{dailyMissionLesson.xp} XP • +{10 + Math.floor(dailyMissionLesson.xp / 10)} 🪙</p>
              </div>
            </div>
            <p className="text-sm text-tg-text mb-3 font-medium">{dailyMissionLesson.title}</p>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                console.log('⚡ Button clicked!');
                handleLessonStart(dailyMissionLesson.id);
              }}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 relative z-20 cursor-pointer active:scale-95 transition-transform rounded-xl shadow-lg shadow-purple-500/20"
            >
              Начать урок ⚡
            </Button>
          </motion.div>
        )}

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-tg-bg/80 backdrop-blur-xl border border-tg-hint/20 p-4 rounded-2xl text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="text-2xl mb-1">🔥</div>
            <div className="text-xs text-tg-hint font-medium uppercase tracking-wider">Стрик</div>
            <div className="text-xl font-bold text-tg-text">{streak}</div>
          </div>
          <div className="bg-tg-bg/80 backdrop-blur-xl border border-tg-hint/20 p-4 rounded-2xl text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="text-2xl mb-1">⭐</div>
            <div className="text-xs text-tg-hint font-medium uppercase tracking-wider">Уровень</div>
            <div className="text-xl font-bold text-tg-text">{level}</div>
          </div>
          <div className="bg-tg-bg/80 backdrop-blur-xl border border-tg-hint/20 p-4 rounded-2xl text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="text-2xl mb-1">📚</div>
            <div className="text-xs text-tg-hint font-medium uppercase tracking-wider">Модуль</div>
            <div className="text-xl font-bold text-tg-text truncate px-1">{currentModule ? modules.find(m => m.id === currentModule)?.name : 'Старт'}</div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start bg-tg-bg/80 backdrop-blur-xl border-tg-hint/20 h-auto py-4 px-5 rounded-2xl shadow-sm hover:shadow-md transition-all hover:bg-tg-bg/90"
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
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                <Target className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="font-bold text-tg-text text-base">{!initialScores ? 'Стартовый тест' : 'Колесо баланса'}</div>
                <div className="text-xs text-tg-hint mt-0.5">Проверь свои сферы жизни</div>
              </div>
            </div>
          </Button>
          
          {/* Мини-игра дня */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setShowMiniGame(true)}
            className="w-full bg-tg-bg/80 backdrop-blur-xl border border-tg-hint/20 p-1 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden group"
          >
            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-4 rounded-xl flex items-center justify-between group-hover:from-purple-500/20 group-hover:to-blue-500/20 transition-colors">
              <div className="flex items-center gap-4">
                <div className="text-3xl bg-tg-bg rounded-xl p-2 shadow-sm">🎮</div>
                <div className="text-left">
                  <h3 className="text-tg-text font-bold text-base">Мини-игра</h3>
                  <p className="text-tg-hint text-xs mt-0.5">Найди пары эмоций</p>
                </div>
              </div>
              <div className="text-right bg-tg-bg/50 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-tg-hint/20">
                <p className="text-purple-500 text-xs font-bold">+50 XP</p>
              </div>
            </div>
          </motion.button>
        </div>

        {/* Модули */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-tg-text px-1">Модули обучения</h3>
          <div className="grid grid-cols-2 gap-4">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <motion.div
                  key={module.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentModule(module.id)}
                  className={`
                    relative overflow-hidden rounded-3xl p-5 cursor-pointer transition-all
                    bg-tg-bg/80 backdrop-blur-xl border border-tg-hint/20 shadow-sm hover:shadow-md
                    group
                  `}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${module.color || 'from-purple-500/10 to-pink-500/10'} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-tg-bg shadow-sm flex items-center justify-center text-tg-text group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-tg-text text-base leading-tight mb-2">{module.name}</h4>
                      <div className="flex items-center gap-2">
                        <Progress value={module.progress} className="h-1.5 flex-1 bg-tg-secondary-bg" />
                        <span className="text-[10px] font-bold text-tg-hint">{module.progress}%</span>
                      </div>
                    </div>
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
            className="bg-tg-bg/80 backdrop-blur-xl border border-tg-hint/20 p-6 rounded-3xl shadow-sm"
          >
            <h3 className="text-lg font-bold text-tg-text mb-4">Твой баланс</h3>
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
        <h2 className="text-sm font-semibold text-tg-text">Чек-ин с Катей</h2>
        <p className="text-xs text-tg-hint">
          Здесь будет ежедневный чек-ин и практики для сна и расслабления, перенесённые из старого приложения.
        </p>
      </div>
    );
  };

  const renderChatTab = () => {
    return (
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-tg-text">Чат с Катей</h2>
        <p className="text-xs text-tg-hint">
          Сюда добавим живой диалог с Катей и быстрые подсказки.
        </p>
      </div>
    );
  };

  const renderGroupTab = () => {
    return (
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-tg-text">Группа</h2>
        <p className="text-xs text-tg-hint">
          Здесь будет доступ к Telegram-группе и эфиром. Можно будет открыть чат прямо из приложения.
        </p>
      </div>
    );
  };

  const renderProfileTab = () => {
    return (
      <div className="space-y-6">
        {/* Статистика пользователя */}
        <div className="bg-tg-bg/80 backdrop-blur-xl border border-tg-hint/20 p-6 rounded-3xl shadow-sm">
          <div className="flex items-center gap-5 mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl shadow-lg shadow-purple-500/20">
              😊
            </div>
            <div>
              <h3 className="text-2xl font-bold text-tg-text">
                {user?.first_name || 'Ученик'}
              </h3>
              <p className="text-tg-hint font-medium">Уровень {level}</p>
            </div>
          </div>

          {/* Прогресс до следующего уровня */}
          <div className="mb-6">
            <div className="flex justify-between text-sm font-medium text-tg-hint mb-2">
              <span>Прогресс уровня</span>
              <span className="text-tg-text">{xp} / {nextLevelXP} XP</span>
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

          {/* Быстрая статистика */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-4 bg-orange-500/10 rounded-2xl border border-orange-500/20">
              <div className="text-2xl mb-1">🔥</div>
              <div className="text-xs text-tg-hint font-medium uppercase tracking-wider">Стрик</div>
              <div className="text-xl font-bold text-tg-text">{streak}</div>
            </div>
            <div className="text-center p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
              <div className="text-2xl mb-1">🪙</div>
              <div className="text-xs text-tg-hint font-medium uppercase tracking-wider">Монеты</div>
              <div className="text-xl font-bold text-tg-text">{coins}</div>
            </div>
            <div className="text-center p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20">
              <div className="text-2xl mb-1">💎</div>
              <div className="text-xs text-tg-hint font-medium uppercase tracking-wider">Кристаллы</div>
              <div className="text-xl font-bold text-tg-text">{gems}</div>
            </div>
          </div>
        </div>

        {/* Достижения */}
        <Achievements />

        {/* Кнопка магазина */}
        <Button
          onClick={() => setShowShop(true)}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          🛒 Открыть магазин
        </Button>
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
    <div 
      className="min-h-screen bg-tg-secondary-bg text-tg-text font-sans selection:bg-purple-100 pb-24 relative overflow-hidden"
    >
      {/* Organic background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-200/30 blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-200/30 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[60%] rounded-full bg-pink-200/20 blur-[130px]" />
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
        className="relative bg-tg-bg/80 backdrop-blur-[40px] p-6 text-tg-text shadow-[0_8px_32px_rgba(0,0,0,0.12)] sticky top-0 z-40 border-b border-tg-hint/20"
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
          <div className="flex gap-3 relative z-10">
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
              className="relative flex items-center gap-2 bg-white/90 px-4 py-2 rounded-full backdrop-blur-lg shadow-ios-soft border border-white/60"
            >
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-warning/10 to-destructive/10"
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
              <span className="font-bold text-lg text-foreground relative z-10">{streak}</span>
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
              className="relative flex items-center gap-2 bg-white/90 px-4 py-2 rounded-full backdrop-blur-lg shadow-ios-soft border border-white/60"
            >
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-warning/10 to-warning/20"
                animate={{ 
                  scale: [1, 1.05, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <Award className="w-6 h-6 text-primary relative z-10" />
              <span className="font-bold text-lg text-foreground relative z-10">{level}</span>
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
      <main className="relative z-10 p-4 pb-24 max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          {renderActiveTab()}
        </AnimatePresence>
      </main>

      {/* Модальные окна и оверлеи */}
      <AnimatePresence>
        {showBalanceWheel && (
          <BalanceAssessment
            type={balanceType}
            onComplete={(scores, answers) => {
              if (balanceType === 'initial') {
                setInitialScores(scores);
                localStorage.setItem('initialBalanceScores', JSON.stringify(scores));
              } else {
                setFinalScores(scores);
                localStorage.setItem('finalBalanceScores', JSON.stringify(scores));
              }
              setShowBalanceWheel(false);
            }}
          />
        )}

        {currentModule && !currentLesson && (
          <ModuleRoom
            title={modules.find(m => m.id === currentModule)?.name || ''}
            description={`Изучай модуль ${modules.find(m => m.id === currentModule)?.name}`}
            icon={<div className="w-10 h-10" />}
            theme={currentModule as 'boundaries' | 'confidence' | 'emotions' | 'relationships'}
            progress={modules.find(m => m.id === currentModule)?.progress || 0}
          >
            <div className="space-y-4">
              <button 
                onClick={() => setCurrentModule(null)}
                className="mb-4 px-4 py-2 bg-tg-bg/80 rounded-lg text-tg-text"
              >
                ← Назад
              </button>
              
              <div className="space-y-2">
                {weekLessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => handleLessonStart(lesson.id)}
                    disabled={lesson.status === 'locked'}
                    className="w-full p-4 bg-tg-bg/80 backdrop-blur rounded-2xl text-left disabled:opacity-50"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-tg-text">{lesson.title}</span>
                      <span className="text-sm text-purple-600">+{lesson.xp} XP</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </ModuleRoom>
        )}

        {currentLesson && (
          <EnhancedLessonInterface
            questions={COMPLETE_LESSONS.find(l => l.id === currentLesson)?.questions || []}
            lessonTitle={COMPLETE_LESSONS.find(l => l.id === currentLesson)?.title || ''}
            xpReward={COMPLETE_LESSONS.find(l => l.id === currentLesson)?.xp || 0}
            lessonId={currentLesson}
            intro={COMPLETE_LESSONS.find(l => l.id === currentLesson)?.intro}
            completionMeta={COMPLETE_LESSONS.find(l => l.id === currentLesson)?.completion}
            onComplete={handleLessonComplete}
            onExit={() => setCurrentLesson(null)}
          />
        )}

        {showCompletion && completedLesson && (
          <LessonComplete
            xpEarned={completedLesson.xpEarned}
            message={completedLesson.message}
            xpBoosted={completedLesson.xpBoosted}
            coinsEarned={completedLesson.coinsEarned}
            nextLessonId={getNextLesson()?.id}
            onNextLesson={handleNextLesson}
            onContinue={() => {
              setShowCompletion(false);
              setCompletedLesson(null);
            }}
          />
        )}

        {/* Мини-игра */}
        {showMiniGame && (
          <EmotionMatchGame
            onClose={() => setShowMiniGame(false)}
          />
        )}

        {/* Магазин */}
        {showShop && (
          <Shop
            onClose={() => setShowShop(false)}
            coins={coins}
            gems={gems}
            onPurchase={(item) => {
              // Списываем валюту
              if (item.currency === 'coins') {
                spendCoins(item.price);
              } else {
                spendGems(item.price);
              }

              // Добавляем в инвентарь
              inventory.addItem(item.id, 1);

              // Применяем эффект немедленно для некоторых предметов
              if (item.effect.type === 'energy') {
                const currentEnergy = parseInt(localStorage.getItem('userEnergy') || '100');
                const newEnergy = Math.min(currentEnergy + item.effect.value, 100);
                localStorage.setItem('userEnergy', newEnergy.toString());
                localStorage.setItem('lastEnergyUpdate', Date.now().toString());
              }

              console.log(`✅ Куплено: ${item.name}`);
            }}
          />
        )}
      </AnimatePresence>

      {/* Inventory Modal */}
      <AnimatePresence>
        {showInventory && (
          <Inventory
            onClose={() => setShowInventory(false)}
            onUseItem={handleUseItem}
          />
        )}
      </AnimatePresence>

      {/* Lesson Preview Modal */}
      <AnimatePresence>
        {showLessonPreview && selectedLesson && (
          <LessonPreview
            lesson={selectedLesson}
            onStart={startLessonFromPreview}
            onClose={() => {
              setShowLessonPreview(false);
              setSelectedLesson(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Bottom navigation - табы как в GameMode */}
      {!currentLesson && (
        <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-md">
          <div className="grid grid-cols-5 gap-2 rounded-3xl bg-tg-secondary-bg/90 backdrop-blur-xl shadow-[0_18px_45px_rgba(15,23,42,0.22)] border border-tg-hint/20 px-3 py-2">
            {[
              { id: 'learning' as const, label: 'Учёба', icon: Home },
              { id: 'checkin' as const, label: 'Чек-ин', icon: Calendar },
              { id: 'game' as const, label: 'Игра', icon: Gamepad2 },
              { id: 'chat' as const, label: 'Чат', icon: MessageCircle },
              { id: 'profile' as const, label: 'Профиль', icon: Award },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'game') {
                      navigate('/game');
                    } else {
                      setActiveTab(item.id as any);
                    }
                    selectionFeedback?.();
                  }}
                  className={`flex flex-col items-center justify-center gap-0.5 rounded-2xl px-2 py-1.5 text-[10px] font-medium transition-all ${
                    isActive
                      ? 'bg-tg-button text-tg-button-text shadow-[0_10px_30px_rgba(147,51,234,0.45)]'
                      : 'text-tg-hint hover:bg-tg-bg/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
};

export default Index;
