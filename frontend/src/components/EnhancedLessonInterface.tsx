import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Slider } from './ui/slider';
import { Progress } from './ui/progress';
import { RiveKatya } from './RiveKatya';
import { Question } from '@/data/allLessonsData';
import { 
  X, 
  Check, 
  ChevronRight, 
  Star, 
  Trophy, 
  Sparkles, 
  Heart, 
  Shield, 
  Target, 
  Zap,
  ArrowRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Volume2,
  Pause,
  Play
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { InteractiveZones } from './LessonParts/InteractiveZones';
import { SwipeCards } from './LessonParts/SwipeCards';
import { MoodSlider } from './LessonParts/MoodSlider';
import { BoundaryBuilder } from './LessonParts/BoundaryBuilder';
import { VoiceNote } from './LessonParts/VoiceNote';
import RoleplaySimulator from './LessonParts/RoleplaySimulator';
import ManifestCreator from './LessonParts/ManifestCreator';
import RealWorldScenario from './LessonParts/RealWorldScenario';

// Telegram WebApp для haptic feedback
const WebApp = typeof window !== 'undefined' && (window as any).Telegram?.WebApp;

interface EnhancedLessonInterfaceProps {
  questions: Question[];
  onComplete: (xpEarned: number) => void;
  onExit: () => void;
  lessonTitle: string;
  xpReward: number;
  lessonId?: string;
  intro?: any;
  completionMeta?: any;
}

const Stepper = ({ total, current }: { total: number; current: number }) => {
  return (
    <div className="flex gap-1.5 w-full max-w-md mx-auto px-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-2.5 flex-1 rounded-full transition-all duration-500 ${
            i < current
              ? 'bg-green-500 shadow-sm'
              : i === current
              ? 'bg-slate-200 relative overflow-hidden'
              : 'bg-slate-200'
          }`}
        >
          {i === current && (
             <motion.div
               className="absolute inset-0 bg-green-500"
               initial={{ x: '-100%' }}
               animate={{ x: '0%' }}
               transition={{ duration: 0.5 }}
             />
          )}
        </div>
      ))}
    </div>
  );
};

const EnhancedLessonInterface = ({ 
  questions, 
  onComplete, 
  onExit,
  lessonTitle,
  xpReward,
  lessonId,
  intro,
  completionMeta
}: EnhancedLessonInterfaceProps) => {
  console.log('Rendering EnhancedLessonInterface', { lessonId, questionsLength: questions?.length });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [sliderValue, setSliderValue] = useState([5]);
  const [selectedMultiple, setSelectedMultiple] = useState<string[]>([]);
  const [katyaMood, setKatyaMood] = useState<'default' | 'celebrate' | 'thinking' | 'support' | 'bounce' | 'shake'>('thinking');
  const [katyaMessage, setKatyaMessage] = useState<string>('Сегодня у нас важная миссия. Давай пройдём её вместе 💜');
  const [showIntro, setShowIntro] = useState<boolean>(lessonId === 'boundaries-w1-1' && !!intro);
  const [introSlideIndex, setIntroSlideIndex] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bonusXP, setBonusXP] = useState(0);
  const [showMissionComplete, setShowMissionComplete] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [startTime] = useState(Date.now());
  const [userName, setUserName] = useState<string>('друг');
  const [currentEmotion, setCurrentEmotion] = useState('😊');
  const [showEmotionPicker, setShowEmotionPicker] = useState(false);

  // Advanced 3D mouse tracking
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Spring physics for smooth following
  const springConfig = { damping: 25, stiffness: 150 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), springConfig);
  const scale = useSpring(1, springConfig);

  // Track mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);
  const [dailyChallenge, setDailyChallenge] = useState({
    type: 'perfect-score',
    progress: 0,
    goal: questions.length,
    xpReward: 50
  });
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [encouragementMessage, setEncouragementMessage] = useState('');
  const [hintsAvailable, setHintsAvailable] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hearts, setHearts] = useState(5); // New: Hearts system
  
  // Mission Checklist для первого урока
  const [missionChecklist, setMissionChecklist] = useState([
    { id: 'understand', label: 'Понять, что такое границы', completed: false },
    { id: 'feel', label: 'Почувствовать свои границы', completed: false },
    { id: 'practice', label: 'Попробовать поставить границу', completed: false }
  ]);

  if (!questions || questions.length === 0) {
    return <div className="flex items-center justify-center h-screen text-white">Загрузка урока...</div>;
  }

  const question = questions[currentQuestion];
  
  if (!question) {
    return <div className="flex items-center justify-center h-screen text-white">Ошибка: Вопрос не найден</div>;
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isFirstLesson = lessonId === 'boundaries-w1-1';
  const missionCinematicEnabled = Boolean(isFirstLesson && completionMeta);
  const totalXpEarned = xpReward + bonusXP;
  const earnedStats = (completionMeta?.stats?.earned as string[]) || [];
  const shareEnabled = Boolean(completionMeta?.share?.enabled);

  // Получить имя из Telegram
  useEffect(() => {
    if (WebApp?.initDataUnsafe?.user) {
      const firstName = WebApp.initDataUnsafe.user.first_name;
      setUserName(firstName || 'друг');
    }
    
    // Проверить доступные подсказки из инвентаря
    try {
      const inventory = JSON.parse(localStorage.getItem('userInventory') || '{}');
      const hints = inventory.hint_pack || 0;
      setHintsAvailable(hints);
    } catch (e) {
      console.error('Error loading hints:', e);
    }
  }, []);

  // Трекинг времени для speed challenge
  useEffect(() => {
    const checkSpeedChallenge = () => {
      const elapsedMinutes = (Date.now() - startTime) / 1000 / 60;
      if (dailyChallenge.type === 'speed-learner' && elapsedMinutes <= 5) {
        setDailyChallenge(prev => ({ ...prev, progress: Math.min(100, (elapsedMinutes / 5) * 100) }));
      }
    };
    const interval = setInterval(checkSpeedChallenge, 5000);
    return () => clearInterval(interval);
  }, [startTime, dailyChallenge.type]);

  // Голосовое сопровождение
  const speakMessage = (text: string) => {
    try {
      if ('speechSynthesis' in window && WebApp?.initDataUnsafe?.user) {
        // Очистить предыдущее
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ru-RU';
        utterance.pitch = 1.2; // Молодежный голос
        utterance.rate = 0.9;
        utterance.volume = 0.8;
        
        // Найти женский голос
        const voices = window.speechSynthesis.getVoices();
        const femaleVoice = voices.find(v => 
          v.lang.startsWith('ru') && (v.name.includes('female') || v.name.includes('Female'))
        ) || voices.find(v => v.lang.startsWith('ru'));
        
        if (femaleVoice) utterance.voice = femaleVoice;
        
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.log('Speech synthesis not available');
    }
  };

  // Haptic feedback helper
  const triggerHaptic = (style: 'light' | 'medium' | 'heavy' = 'medium') => {
    try {
      if (WebApp?.HapticFeedback) {
        WebApp.HapticFeedback.impactOccurred(style);
      }
    } catch (err) {
      console.log('Haptic not available');
    }
  };

  // Создать частицы вокруг Кати
  const createParticles = () => {
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 2000);
  };

  useEffect(() => {
    if (combo > 0) {
      createParticles();
      triggerHaptic('heavy');
      
      // Показать поощрительное сообщение при комбо
      if (combo === 3) {
        setEncouragementMessage(`${userName}, огонь! 🔥 Комбо x3!`);
        setShowEncouragement(true);
        setTimeout(() => setShowEncouragement(false), 3000);
      } else if (combo === 5) {
        setEncouragementMessage(`${userName}, ты неостановим! 💪 Комбо x5!`);
        setShowEncouragement(true);
        setTimeout(() => setShowEncouragement(false), 3000);
      }
    }
  }, [combo, userName]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#a855f7', '#ec4899', '#f59e0b', '#10b981'],
      ticks: 200,
      gravity: 0.8,
      scalar: 1.2
    });
    triggerHaptic('heavy');
  };

  // Использовать подсказку
  const useHint = () => {
    if (hintsAvailable > 0 && !hintUsed && !showHint) {
      // Уменьшить количество подсказок в инвентаре
      try {
        const inventory = JSON.parse(localStorage.getItem('userInventory') || '{}');
        inventory.hint_pack = Math.max(0, (inventory.hint_pack || 0) - 1);
        localStorage.setItem('userInventory', JSON.stringify(inventory));
        
        setHintsAvailable(prev => prev - 1);
        setHintUsed(true);
        setShowHint(true);
        
        triggerHaptic('medium');
        
        setKatyaMood('support');
        setKatyaMessage('💡 Подсказка: ' + (question.explanation || 'Подумай о своих чувствах и границах'));
        
        console.log('💡 Подсказка использована');
      } catch (e) {
        console.error('Error using hint:', e);
      }
    }
  };

  const handleAnswer = (answer: any) => {
    const newAnswers = { ...answers, [question.id]: answer };
    setAnswers(newAnswers);

    if (question.correctAnswer) {
      let correct = false;
      
      if (question.type === 'interactive-zones') {
        const correctZones = question.zones?.filter(z => z.correct).map(z => z.id) || [];
        correct = answer.length === correctZones.length && answer.every((id: string) => correctZones.includes(id));
      } else if (question.type === 'boundary-builder') {
        const correctBricks = question.bricks?.filter(b => b.correct).map(b => b.text) || [];
        correct = answer.every((text: string) => correctBricks.includes(text));
      }
      else if (Array.isArray(question.correctAnswer)) {
        const answerArray = Array.isArray(answer) ? answer : [answer];
        correct = question.correctAnswer.length === answerArray.length &&
                 question.correctAnswer.every(item => answerArray.includes(item));
      } else {
        correct = answer === question.correctAnswer;
      }
      
      setIsCorrect(correct);
      setKatyaMood(correct ? 'bounce' : 'shake');
      if (correct) {
        setCombo(prev => prev + 1);
        triggerHaptic('heavy');
        
        // Perfect score challenge
        if (dailyChallenge.type === 'perfect-score') {
          setDailyChallenge(prev => ({
            ...prev,
            progress: prev.progress + 1
          }));
        }
        
        // Обновить чеклист миссии для первого урока
        if (isFirstLesson) {
          if (currentQuestion === 0) {
            setMissionChecklist(prev => prev.map(item => 
              item.id === 'understand' ? { ...item, completed: true } : item
            ));
          } else if (currentQuestion === Math.floor(questions.length / 2)) {
            setMissionChecklist(prev => prev.map(item => 
              item.id === 'feel' ? { ...item, completed: true } : item
            ));
          } else if (currentQuestion === questions.length - 1) {
            setMissionChecklist(prev => prev.map(item => 
              item.id === 'practice' ? { ...item, completed: true } : item
            ));
          }
        }
      } else {
        setCombo(0);
        setHearts(prev => Math.max(0, prev - 1)); // Lose a heart
        triggerHaptic('light');
        
        // Сбросить perfect score challenge
        if (dailyChallenge.type === 'perfect-score') {
          setDailyChallenge(prev => ({ ...prev, progress: 0 }));
        }
      }
      
      // Персонализированные ответы Кати
      const personalizedResponses = {
        correct: [
          `${userName}, ты просто супер! 🌟`,
          `Да, ${userName}! Именно так! ✨`,
          `${userName}, ты схватываешь на лету! 🔥`,
          `Браво, ${userName}! 👏`
        ],
        incorrect: [
          `${userName}, всё ок! Давай разберём вместе 💜`,
          `Ничего страшного, ${userName}. Это нормально! 🤗`,
          `${userName}, ошибки — это часть пути! �`
        ]
      };
      
      const responseArray = correct ? personalizedResponses.correct : personalizedResponses.incorrect;
      const randomResponse = responseArray[Math.floor(Math.random() * responseArray.length)];
      
      setKatyaMessage(
        question.katyaResponse || randomResponse
      );
      setShowFeedback(true);
      
      if (correct) {
        triggerConfetti();
      }
      
      // For first lesson, wait for user to click Continue (Duolingo style)
      if (lessonId !== 'boundaries-w1-1') {
        setTimeout(() => {
          setShowFeedback(false);
          setIsCorrect(null);
          setKatyaMood('thinking');
          moveToNext();
        }, 2500);
      }
    } else {
      setKatyaMood('support');
      setKatyaMessage(
        question.katyaResponse ||
          'Спасибо, что делишься. Любой ответ — это шаг к тому, чтобы лучше понимать себя 💜'
      );
      setShowFeedback(true);
      
      if (lessonId !== 'boundaries-w1-1') {
        setTimeout(() => {
          setShowFeedback(false);
          setKatyaMood('thinking');
          moveToNext();
        }, 2000);
      }
    }
  };

  const handleContinue = () => {
    setShowFeedback(false);
    setIsCorrect(null);
    setKatyaMood('thinking');
    moveToNext();
  };

  const moveToNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setInputValue('');
      setSliderValue([5]);
      setSelectedMultiple([]);
    } else {
      setKatyaMood('celebrate');
      setKatyaMessage(`${userName}, ты прошёл эту миссию! Я тобой горжусь, серьёзно 🥹✨`);
      
      // Проверить выполнение челленджа
      let challengeBonus = 0;
      if (dailyChallenge.progress >= dailyChallenge.goal) {
        challengeBonus = dailyChallenge.xpReward;
        setBonusXP(prev => prev + challengeBonus);
      }
      
      if (missionCinematicEnabled) {
        const cinematicBonus = completionMeta?.minigame?.rewards?.perfect?.xp
          ?? completionMeta?.minigame?.rewards?.good?.xp
          ?? completionMeta?.minigame?.rewards?.ok?.xp
          ?? 0;
        setBonusXP(prev => prev + cinematicBonus);
        triggerConfetti();
        setShowMissionComplete(true);
      } else {
        setTimeout(() => onComplete(xpReward + challengeBonus), 500);
      }
    }
  };

  const handleMultipleToggle = (option: string) => {
    setSelectedMultiple(prev => 
      prev.includes(option)
        ? prev.filter(item => item !== option)
        : [...prev, option]
    );
  };

  const handleClaimRewards = () => {
    setShowMissionComplete(false);
    onComplete(totalXpEarned);
  };

  const handleShareMission = async () => {
    if (!shareEnabled) return;
    const shareText = completionMeta.share.text || 'Я прошёл урок в MyTeens.Space!';
    try {
      if (typeof navigator !== 'undefined' && 'share' in navigator) {
        await (navigator as any).share({ text: shareText });
        return;
      }
      if (
        typeof navigator !== 'undefined' &&
        'clipboard' in navigator &&
        (navigator as any).clipboard?.writeText
      ) {
        await (navigator as any).clipboard.writeText(shareText);
      }
      setKatyaMessage('Я сохранила текст, можешь вставить куда угодно 💌');
    } catch (err) {
      console.error('share failed', err);
      setKatyaMessage('Не вышло поделиться, но можно просто рассказать друзьям ✨');
    }
  };

  return (
  <motion.div 
    ref={containerRef}
    style={{
      perspective: 1000,
      transformStyle: "preserve-3d"
    }}
    className="min-h-screen bg-slate-50/50 text-slate-900 relative overflow-hidden font-sans selection:bg-purple-200 selection:text-purple-900"
  >
      {/* Glassmorphism Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.1, 1],
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          style={{
            x: useTransform(mouseX, [-0.5, 0.5], [-30, 30]),
            y: useTransform(mouseY, [-0.5, 0.5], [-30, 30])
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-primary/20 via-secondary/15 to-accent/10 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.2, 1],
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          style={{
            x: useTransform(mouseX, [-0.5, 0.5], [40, -40]),
            y: useTransform(mouseY, [-0.5, 0.5], [40, -40])
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-tl from-accent/20 via-primary/15 to-secondary/10 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            opacity: [0.2, 0.4, 0.2],
            rotate: [0, 180, 360],
          }}
          style={{
            scale: useSpring(useTransform(mouseX, [-0.5, 0.5], [0.9, 1.1]), springConfig)
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-secondary/20 via-primary/15 to-accent/10 rounded-full blur-[120px]"
        />
      </div>
      </div>

      {/* Header - Glassmorphism */}
      <motion.div 
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 16 }}
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-[40px] border-b border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
      >
        <div className="max-w-3xl mx-auto px-4 pt-3 pb-4">
          <div className="flex items-center justify-between mb-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onExit}
              className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all rounded-xl"
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Hearts & Combo */}
            <div className="flex items-center gap-3">
              {combo > 0 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-1 text-sm font-bold text-orange-500"
                >
                  <span className="text-lg">🔥</span> {combo}
                </motion.div>
              )}
              
              <motion.div 
                key={hearts}
                initial={{ scale: 1.5, color: '#ef4444' }}
                animate={{ scale: 1, color: '#ef4444' }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                className="flex items-center gap-1"
              >
                <Heart className={`w-6 h-6 ${hearts > 0 ? 'text-red-500 fill-red-500' : 'text-gray-300'}`} />
                <span className="text-lg font-bold text-red-500">{hearts}</span>
              </motion.div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
              <motion.div 
                className="absolute top-0 left-0 h-full bg-green-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <div className="absolute top-1 right-2 w-2/3 h-1 bg-white/30 rounded-full" />
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="relative max-w-3xl mx-auto px-3 pt-4 pb-8">
        {/* Encouragement Toast */}
        <AnimatePresence>
          {showEncouragement && (
            <motion.div
              initial={{ y: -100, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -100, opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-500/90 to-orange-500/90 backdrop-blur-xl border-2 border-amber-300/50 shadow-[0_20px_60px_rgba(251,191,36,0.6)]"
            >
              <p className="text-white font-black text-lg text-center drop-shadow-lg">
                {encouragementMessage}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Daily Challenge Banner - Disabled for cleaner UI */}
        {isFirstLesson && false && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-400 backdrop-blur-xl shadow-lg shadow-amber-200"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-black text-amber-600 tracking-wide">🎯 ЧЕЛЛЕНДЖ ДНЯ</h4>
              <span className="text-xs font-bold text-amber-700">+{dailyChallenge.xpReward} XP</span>
            </div>
            <p className="text-xs text-amber-700/80 mb-2">
              {dailyChallenge.type === 'perfect-score' && 'Ответь правильно на все вопросы подряд'}
              {dailyChallenge.type === 'speed-learner' && 'Пройди урок за 5 минут'}
              {dailyChallenge.type === 'boundary-master' && 'Набери комбо x5'}
            </p>
            <div className="relative h-2 bg-amber-200/40 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(dailyChallenge.progress / dailyChallenge.goal) * 100}%` }}
                transition={{ type: "spring", stiffness: 100 }}
              />
            </div>
            <p className="text-[10px] text-amber-600/70 mt-1 text-right">
              {dailyChallenge.progress} / {dailyChallenge.goal}
            </p>
          </motion.div>
        )}
        
        {/* Mission Checklist для первого урока - Disabled for cleaner UI */}
        {isFirstLesson && !showIntro && !showMissionComplete && false && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-4 p-4 rounded-2xl bg-white/90 backdrop-blur-xl border-2 border-purple-300 shadow-lg shadow-purple-200"
          >
            <h4 className="text-sm font-black text-purple-700 tracking-wide mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              МИССИЯ: Освоить границы
            </h4>
            <div className="space-y-2">
              {missionChecklist.map((item) => (
                <motion.div
                  key={item.id}
                  animate={{
                    scale: item.completed ? [1, 1.05, 1] : 1,
                    opacity: item.completed ? 1 : 0.6
                  }}
                  transition={{ duration: 0.3 }}
                  className={`flex items-center gap-3 p-2 rounded-xl transition-all ${
                    item.completed 
                      ? 'bg-[#5961F9]/20 border border-[#5961F9]' 
                      : 'bg-white/5 border border-white/10'
                  }`}
                >
                  <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center border ${
                    item.completed 
                      ? 'bg-[#5961F9] border-[#5961F9]' 
                      : 'bg-transparent border-white/30'
                  }`}>
                    {item.completed && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      >
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </div>
                  <span className={`text-xs font-semibold ${
                    item.completed ? 'text-[#5961F9]' : 'text-white/60'
                  }`}>
                    {item.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Emotion Tracker */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-6 right-4 z-50"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowEmotionPicker(!showEmotionPicker)}
            className="w-16 h-16 rounded-full bg-[#070811]/90 backdrop-blur-2xl border border-[#EE9AE5] flex items-center justify-center text-3xl shadow-lg shadow-[#EE9AE5]/20 hover:shadow-[#EE9AE5]/40 transition-shadow"
          >
            {currentEmotion}
          </motion.button>
          <span className="text-[10px] text-[#EE9AE5] mt-1 block text-center font-semibold">Как ты?</span>
          
          {/* Emotion Picker */}
          <AnimatePresence>
            {showEmotionPicker && (
              <motion.div
                initial={{ scale: 0, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0, opacity: 0, y: 20 }}
                className="absolute bottom-20 right-0 bg-[#070811]/95 backdrop-blur-xl rounded-2xl p-3 border border-[#EE9AE5] shadow-2xl shadow-[#EE9AE5]/20"
              >
                <p className="text-xs text-[#EE9AE5] mb-2 text-center font-bold">Выбери эмоцию</p>
                <div className="grid grid-cols-3 gap-2">
                  {['😊', '😐', '😔', '😡', '🤔', '😴', '🤗', '😱', '🥳'].map((emotion) => (
                    <motion.button
                      key={emotion}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setCurrentEmotion(emotion);
                        setShowEmotionPicker(false);
                        triggerHaptic('light');
                      }}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-2xl ${
                        currentEmotion === emotion 
                          ? 'bg-[#EE9AE5]/20 border border-[#EE9AE5]' 
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {emotion}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        <AnimatePresence mode="wait">
          {showIntro && isFirstLesson && intro ? (
            <motion.div
              key="intro"
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05, y: -40 }}
              transition={{ type: "spring", stiffness: 100, damping: 20, duration: 0.6 }}
              className="relative flex flex-col items-center justify-center min-h-[75vh] text-center px-4"
            >
              {/* Темные неоновые градиенты */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 90, 0],
                  opacity: [0.4, 0.6, 0.4]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-20 -left-20 w-80 h-80 bg-gradient-to-br from-[#5961F9]/40 via-[#EE9AE5]/30 to-[#5961F9]/20 blur-3xl rounded-full"
              />
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  rotate: [0, -90, 0],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-20 -right-20 w-96 h-96 bg-gradient-to-tl from-[#40C9FF]/30 via-[#5961F9]/40 to-[#EE9AE5]/20 blur-3xl rounded-full"
              />

              <motion.div
                key={`slide-${introSlideIndex}`}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -30, scale: 0.9 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 flex flex-col items-center space-y-8"
              >
                {/* Катя - крупная и анимированная */}
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotate: [-2, 2, -2]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="w-64 h-64 md:w-72 md:h-72 drop-shadow-[0_0_30px_rgba(89,97,249,0.4)]"
                >
                  <RiveKatya
                    mood={intro.slides?.[introSlideIndex]?.katya || 'celebrate'}
                    message={intro.slides?.[introSlideIndex]?.text || 'Готов(а) к первой миссии о границах'}
                    showBubble={true}
                  />
                </motion.div>

                {/* Текст с премиум-типографикой */}
                <div className="space-y-4 max-w-lg w-full px-4">
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl md:text-4xl font-black text-white leading-tight drop-shadow-lg text-center"
                  >
                    {intro.slides?.[introSlideIndex]?.text?.replace('Я Катя', `Я Катя, ${userName}`) || `Привет, ${userName}! Я Катя! 💜`}
                  </motion.h2>
                  
                  {intro.slides?.[introSlideIndex]?.subtext && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10"
                    >
                      <p className="text-lg text-white font-medium leading-relaxed text-center">
                        {intro.slides[introSlideIndex].subtext}
                      </p>
                    </motion.div>
                  )}
                  
                  {/* Voice Button - REMOVED */}
                  
                </div>

                {/* Прогресс слайдов */}
                <div className="flex items-center justify-center gap-2 mt-8 mb-4">
                  {intro.slides?.map((_: any, idx: number) => (
                    <motion.div
                      key={idx}
                      animate={{
                        width: idx === introSlideIndex ? 32 : 8,
                        backgroundColor: idx === introSlideIndex 
                          ? '#EE9AE5' 
                          : 'rgba(255, 255, 255, 0.2)'
                      }}
                      className="h-2 rounded-full transition-all duration-300"
                    />
                  ))}
                </div>

                {/* Кнопка продолжения */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="w-full mt-8"
                >
                  <Button
                    className="w-full py-6 text-lg font-bold bg-gradient-to-r from-[#5961F9] via-[#EE9AE5] to-[#F5576C] hover:brightness-110 text-white rounded-2xl shadow-xl shadow-[#EE9AE5]/30 border-0 active:scale-95 transition-transform"
                    onClick={() => {
                      triggerHaptic('medium');
                      if (introSlideIndex < (intro.slides?.length || 1) - 1) {
                        setIntroSlideIndex((i) => i + 1);
                      } else {
                        setShowIntro(false);
                        setKatyaMood('thinking');
                        setKatyaMessage('Поехали в миссию про твои границы 💜');
                      }
                    }}
                  >
                    {intro.slides?.[introSlideIndex]?.action || (introSlideIndex < (intro.slides?.length || 1) - 1 ? 'Дальше ✨' : 'Погнали в миссию 🚀')}
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          ) : showMissionComplete && completionMeta ? (
            <motion.div
              key="mission-complete"
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -30 }}
              transition={{ type: "spring", stiffness: 140, damping: 20 }}
              className="relative overflow-hidden rounded-3xl bg-[#070811]/90 backdrop-blur-xl border border-white/10 p-6 shadow-2xl shadow-[#5961F9]/20"
            >
              <div className="absolute inset-0 opacity-40">
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#EE9AE5]/20 blur-3xl" />
                <div className="absolute -bottom-16 -left-12 w-72 h-72 bg-[#5961F9]/20 blur-3xl" />
              </div>
              <div className="relative z-10 flex flex-col items-center text-center space-y-5">
                <motion.div
                  animate={{ scale: [1, 1.05, 1], rotate: [-1, 1, -1] }}
                  transition={{ repeat: Infinity, duration: 6 }}
                  className="w-44 h-44"
                >
                  <RiveKatya
                    mood={completionMeta.katya?.mood || 'celebrate'}
                    message={completionMeta.katya?.message || 'Катя буквально обнимает тебя 🤗'}
                    showBubble
                  />
                </motion.div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[#EE9AE5] mb-2 font-bold">МИССИЯ ВЫПОЛНЕНА</p>
                  <h3 className="text-3xl font-extrabold text-white drop-shadow-lg">
                    {completionMeta.message || 'Ты легенда!'}
                  </h3>
                  {completionMeta.subMessage && (
                    <p className="text-sm text-white/80 mt-2">{completionMeta.subMessage}</p>
                  )}
                </div>
                {earnedStats.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 w-full">
                    {earnedStats.map((stat: string) => (
                      <div
                        key={stat}
                        className="rounded-2xl bg-white/5 border border-white/10 py-3 px-2"
                      >
                        <p className="text-[11px] uppercase tracking-wide text-[#EE9AE5] font-bold">{stat}</p>
                        <p className="text-lg font-bold text-white">+1</p>
                      </div>
                    ))}
                  </div>
                )}
                {completionMeta.minigame && (
                  <div className="w-full rounded-2xl bg-white/5 border border-white/10 p-4 text-left">
                    <p className="text-xs text-[#EE9AE5] uppercase tracking-[0.4em] mb-1 font-bold">MINI-GAME BONUS</p>
                    <p className="text-white font-semibold text-lg">{completionMeta.minigame.title}</p>
                    <p className="text-white/70 text-sm mb-3">{completionMeta.minigame.description}</p>
                    <div className="flex items-center justify-between text-[#5961F9] text-sm">
                      <span>Бонус XP</span>
                      <span className="font-bold">+{bonusXP}</span>
                    </div>
                  </div>
                )}
                {completionMeta.stats?.nextUnlock && (
                  <p className="text-xs text-white/50">{completionMeta.stats.nextUnlock}</p>
                )}
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  {shareEnabled && (
                    <Button
                      variant="secondary"
                      className="flex-1 bg-white/10 hover:bg-white/20 border border-white/10 text-white"
                      onClick={handleShareMission}
                    >
                      Поделиться
                    </Button>
                  )}
                  <Button
                    className="flex-1 bg-gradient-to-r from-[#5961F9] via-[#EE9AE5] to-[#F5576C] text-white font-semibold shadow-xl shadow-[#EE9AE5]/30 border-0"
                    onClick={handleClaimRewards}
                  >
                    Забрать {totalXpEarned} XP
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={currentQuestion}
              initial={{ x: 300, opacity: 0, scale: 0.8 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: -300, opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
            >
            {/* Katya - Rive анимированный персонаж */}
            <motion.div
              className="flex justify-center mb-3 relative"
              animate={{
                y: [0, -8, 0],
                rotate: [-1, 1, -1]
              }}
              style={{
                rotateX: useTransform(mouseY, [-0.5, 0.5], [-5, 5]),
                rotateY: useTransform(mouseX, [-0.5, 0.5], [5, -5]),
                transformStyle: "preserve-3d",
                transform: "translateZ(80px)"
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Частицы вокруг Кати */}
              {particles.map((particle) => (
                <motion.div
                  key={particle.id}
                  initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                  animate={{
                    opacity: [1, 0],
                    scale: [0, 1.5],
                    x: particle.x,
                    y: particle.y,
                    rotate: [0, 360]
                  }}
                  transition={{ 
                    duration: 2, 
                    ease: "easeOut",
                    rotate: { duration: 2, ease: "linear" }
                  }}
                  style={{
                    transformStyle: "preserve-3d"
                  }}
                  className="absolute top-1/2 left-1/2 pointer-events-none"
                >
                  <motion.div
                    animate={{
                      rotateZ: [0, 360]
                    }}
                    transition={{ duration: 2, ease: "linear" }}
                  >
                    <Sparkles className="w-5 h-5 text-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]" />
                  </motion.div>
                </motion.div>
              ))}
              
              {/* Пульсирующий ореол при combo */}
              {combo > 0 && (
                <motion.div
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.4, 0.7, 0.4]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300/50 to-orange-400/50 blur-2xl"
                />
              )}
              
              {/* Voice button для Кати - REMOVED as per user request */}
              
              <motion.div 
                style={{
                  rotateX: useTransform(mouseY, [-0.5, 0.5], [-5, 5]),
                  rotateY: useTransform(mouseX, [-0.5, 0.5], [5, -5]),
                  transformStyle: "preserve-3d",
                  transform: "translateZ(100px)"
                }}
                className="relative w-44 h-44 md:w-56 md:h-56 drop-shadow-[0_15px_60px_rgba(139,92,246,0.5)]"
              >
                <RiveKatya
                  mood={katyaMood}
                  message={katyaMessage}
                  showBubble={true}
                  className="mx-auto"
                />
              </motion.div>
            </motion.div>

            {/* Question Progress Indicator */}
            {!showIntro && !showMissionComplete && (
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-3 text-center"
              >
                <p className="text-sm font-bold text-[#EE9AE5] mb-2">
                  Вопрос {currentQuestion + 1} из {questions.length}
                </p>
                <div className="max-w-xs mx-auto">
                  <Progress 
                    value={((currentQuestion + 1) / questions.length) * 100} 
                    className="h-1.5 bg-white/10 [&>div]:bg-gradient-to-r [&>div]:from-[#5961F9] [&>div]:to-[#EE9AE5] rounded-full"
                  />
                </div>
              </motion.div>
            )}

            {/* Question Card */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{
                rotateX,
                rotateY,
                scale,
                transformStyle: "preserve-3d",
                transform: "translateZ(50px)"
              }}
              whileHover={{ scale: 1.02 }}
              onHoverStart={() => scale.set(1.02)}
              onHoverEnd={() => scale.set(1)}
              className="relative overflow-hidden rounded-3xl bg-white/60 backdrop-blur-[20px] border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] px-6 pt-6 pb-7 mb-4"
            >
              {/* Светлые анимированные градиенты */}
              <div className="pointer-events-none absolute inset-0 opacity-30">
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    x: [-20, 20, -20],
                    y: [-15, 15, -15],
                    rotate: [0, 90, 180, 270, 360]
                  }}
                  transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-32 -right-36 w-80 h-80 bg-gradient-to-br from-purple-200/40 via-pink-200/30 to-rose-200/20 blur-3xl rounded-full"
                />
                <motion.div
                  animate={{
                    scale: [1, 1.4, 1],
                    x: [20, -20, 20],
                    y: [15, -15, 15],
                    rotate: [360, 270, 180, 90, 0]
                  }}
                  transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                  className="absolute -bottom-36 -left-28 w-72 h-72 bg-gradient-to-tr from-blue-200/30 via-purple-200/40 to-pink-200/20 blur-3xl rounded-full"
                />
              </div>

              <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion}
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -50, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="flex items-start justify-between gap-4 mb-8">
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex-1 text-2xl md:text-3xl font-black text-slate-900 text-center leading-relaxed drop-shadow-sm"
                  >
                    {question.question}
                  </motion.h3>
              
              {/* Кнопка подсказки */}
              {hintsAvailable > 0 && !hintUsed && !showFeedback && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={useHint}
                  className="relative shrink-0 bg-white/50 hover:bg-white/80 p-3 rounded-2xl shadow-sm border border-white/40"
                  title={`Использовать подсказку (${hintsAvailable})`}
                >
                  <span className="text-2xl">💡</span>
                  <div className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                    {hintsAvailable}
                  </div>
                </motion.button>
              )}
              </div>
              
              {/* Показать подсказку */}
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💡</span>
                    <div>
                      <h4 className="font-bold text-blue-600 mb-1">Подсказка:</h4>
                      <p className="text-slate-700">{question.explanation || 'Подумай о своих чувствах и границах'}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Gamified Question Types */}
              {question.type === 'interactive-zones' && (
                <InteractiveZones question={question} onAnswer={(isCorrect, answer) => handleAnswer(answer)} />
              )}
              {question.type === 'swipe-cards' && (
                <SwipeCards question={question} onAnswer={(isCorrect, answer) => handleAnswer(answer)} />
              )}
              {question.type === 'mood-slider' && (
                <MoodSlider question={question} onAnswer={(answer) => handleAnswer(answer)} />
              )}
              {question.type === 'boundary-builder' && (
                <BoundaryBuilder question={question} onAnswer={(isCorrect, answer) => handleAnswer(answer)} />
              )}
              {question.type === 'voice-note' && (
                <VoiceNote question={question} onAnswer={(answer) => handleAnswer(answer)} />
              )}
              {question.type === 'roleplay' && (
                <RoleplaySimulator 
                  scenarios={question.scenarios || []} 
                  onComplete={(data) => handleAnswer(data)} 
                />
              )}
              {question.type === 'manifest' && (
                <ManifestCreator 
                  onComplete={(manifest) => handleAnswer(manifest)} 
                />
              )}
              {question.type === 'real-world-scenario' && (
                <RealWorldScenario 
                  title={question.title || question.question}
                  context={question.context || ''}
                  situation={question.situation || ''}
                  choices={question.scenarioChoices || []}
                  onComplete={(data) => {
                    handleAnswer(data);
                    setAnswers(prev => ({ ...prev, [question.id]: data }));
                  }}
                />
              )}


              {/* Choice Questions */}
              {question.type === 'choice' && question.options && (
                <div className="space-y-3">
                  {question.options.map((option, index) => (
                    <motion.button
                      key={index}
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ 
                        scale: 1.03, 
                        x: 8,
                        rotateY: 5,
                        rotateX: -2
                      }}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        transformStyle: "preserve-3d",
                        transform: "translateZ(20px)"
                      }}
                      onClick={() => {
                        triggerHaptic('light');
                        handleAnswer(option);
                      }}
                      disabled={showFeedback}
                      className="group relative w-full px-6 py-6 rounded-2xl bg-white/50 hover:bg-white/80 backdrop-blur-md border border-white/40 hover:border-purple-300 transition-all text-left font-bold text-[16px] disabled:opacity-50 shadow-sm hover:shadow-md overflow-hidden text-slate-800"
                    >
                      {/* Градиентный hover-эффект */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        style={{
                          transform: "translateZ(10px)"
                        }}
                        className="absolute inset-0 bg-gradient-to-r from-purple-100/50 via-pink-100/50 to-rose-100/50"
                      />
                      
                      {/* Анимированная рамка при hover */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileHover={{ 
                          opacity: [0, 1, 0],
                          scale: [0.8, 1.2, 1.4]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        style={{
                          transform: "translateZ(5px)"
                        }}
                        className="absolute inset-0 border border-purple-200 rounded-2xl"
                      />
                      
                      <div className="relative flex items-center gap-4" style={{ transform: "translateZ(30px)" }}>
                        <motion.span
                          whileHover={{ 
                            rotate: [0, -10, 10, 0], 
                            scale: 1.1,
                            z: 10
                          }}
                          transition={{ duration: 0.5 }}
                          className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-[15px] font-black text-white shadow-md"
                        >
                          {String.fromCharCode(65 + index)}
                        </motion.span>
                        <span className="text-slate-700 font-medium group-hover:text-slate-900 transition-colors">{option}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Multiple Choice */}
              {question.type === 'multiple' && question.options && (
                <div className="space-y-3">
                  {question.options.map((option, index) => (
                    <motion.button
                      key={index}
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleMultipleToggle(option)}
                      disabled={showFeedback}
                      className={`w-full px-4 py-4 rounded-2xl border transition-all text-left font-semibold text-[15px] disabled:opacity-50 shadow-sm flex items-center gap-3 ${
                        selectedMultiple.includes(option)
                          ? 'bg-purple-500 text-white border-purple-600 scale-[1.02] shadow-lg shadow-purple-200'
                          : 'bg-white/50 border-white/40 hover:border-purple-200 text-slate-700 hover:bg-white/80'
                      }`}
                    >
                      <div className={`flex items-center justify-center w-6 h-6 rounded-md border ${selectedMultiple.includes(option) ? 'bg-white border-white' : 'border-slate-300 bg-white/50'}`}>
                        {selectedMultiple.includes(option) && (
                          <span className="text-[12px] font-bold text-purple-600">✓</span>
                        )}
                      </div>
                      <span className={selectedMultiple.includes(option) ? "text-white" : "text-slate-700"}>{option}</span>
                    </motion.button>
                  ))}
                  <Button 
                    onClick={() => handleAnswer(selectedMultiple)} 
                    disabled={showFeedback} 
                    className="w-full mt-4 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 border-0 shadow-lg shadow-purple-200 text-white font-bold hover:brightness-110 py-6 text-lg rounded-2xl"
                  >
                    Подтвердить
                  </Button>
                </div>
              )}

              {/* Input Questions */}
              {question.type === 'input' && (
                <div className="space-y-4">
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Твой ответ здесь..."
                      className="text-[16px] px-4 py-6 border border-slate-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 rounded-2xl shadow-inner bg-white/80 placeholder:text-slate-400 text-slate-900"
                      disabled={showFeedback}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && inputValue.trim()) {
                          triggerHaptic('medium');
                          handleAnswer(inputValue);
                        }
                      }}
                    />
                  </motion.div>
                  <Button 
                    onClick={() => {
                      triggerHaptic('medium');
                      handleAnswer(inputValue);
                    }}
                    disabled={!inputValue.trim() || showFeedback}
                    className="w-full py-4 text-[16px] bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:brightness-110 border-0 shadow-lg shadow-purple-200 text-white font-bold"
                    size="lg"
                  >
                    Продолжить <ArrowRight className="ml-2" />
                  </Button>
                </div>
              )}

              {/* Slider Questions */}
              {question.type === 'slider' && (
                <div className="text-center">
                  <Slider 
                    value={sliderValue}
                    onValueChange={setSliderValue}
                    max={10}
                    min={1}
                    step={1}
                    disabled={showFeedback}
                    className="my-8 [&>[role=slider]]:bg-white [&>[role=slider]]:border-4 [&>[role=slider]]:border-purple-500 [&>[role=slider]]:shadow-md [&>[role=track]]:bg-slate-200 [&>[role=range]]:bg-gradient-to-r [&>[role=range]]:from-purple-500 [&>[role=range]]:to-pink-500"
                  />
                  <motion.div 
                    className="text-center text-6xl font-black text-slate-800 drop-shadow-sm"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.3 }}
                    key={sliderValue[0]}
                  >
                    {sliderValue[0]}
                  </motion.div>
                  <Button 
                    onClick={() => handleAnswer(sliderValue[0])} 
                    disabled={showFeedback} 
                    className="mt-8 w-full py-4 text-lg font-bold bg-gradient-to-r from-purple-500 to-pink-500 hover:brightness-110 text-white shadow-lg shadow-purple-200 rounded-2xl"
                  >
                    Ответить
                  </Button>
                </div>
              )}

              {/* Matching Questions */}
              {question.type === 'matching' && (
                <p className="text-center text-sm text-[#EE9AE5]/80">
                  Этот тип вопроса пока в разработке — скоро здесь будет интерактив 🛠️
                </p>
              )}

              </motion.div>
              </AnimatePresence>
              </div>
            </motion.div>

            {/* Enhanced Empathetic Feedback Overlay (Glassmorphism) */}
            <AnimatePresence>
              {showFeedback && (
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className={`fixed bottom-0 left-0 right-0 z-[100] p-6 pb-12 rounded-t-3xl border-t shadow-[0_-10px_40px_rgba(0,0,0,0.1)] backdrop-blur-xl ${
                    isCorrect === true 
                      ? 'bg-white/95 border-green-200' 
                      : isCorrect === false
                      ? 'bg-white/95 border-rose-200'
                      : 'bg-white/95 border-purple-200'
                  }`}
                >
                  {/* Subtle animated background glow */}
                  <motion.div
                    animate={{
                      opacity: [0.3, 0.5, 0.3],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className={`absolute inset-0 blur-3xl ${
                      isCorrect === true 
                        ? 'bg-green-200/30' 
                        : isCorrect === false
                        ? 'bg-rose-200/30'
                        : 'bg-purple-200/30'
                    }`}
                  />
                  
                  <div className="relative flex items-start gap-4 max-w-3xl mx-auto">
                    {isCorrect !== null && (
                      <motion.div 
                        className="flex-shrink-0"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                      >
                        {isCorrect ? (
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-200">
                            <CheckCircle2 className="w-8 h-8 text-white" />
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-200">
                            <XCircle className="w-8 h-8 text-white" />
                          </div>
                        )}
                      </motion.div>
                    )}
                    
                    <div className="flex-1">
                      {/* Empathetic headline */}
                      <motion.h4
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className={`text-lg font-black mb-2 ${
                          isCorrect === true 
                            ? 'text-green-600' 
                            : isCorrect === false
                            ? 'text-rose-600'
                            : 'text-purple-600'
                        }`}
                      >
                        {isCorrect === true && '✨ Точно в цель!'}
                        {isCorrect === false && '💜 Всё в порядке'}
                        {isCorrect === null && '🌟 Спасибо за откровенность'}
                      </motion.h4>
                      
                      {/* Katya's response */}
                      {question.katyaResponse && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="text-base font-semibold mb-2 leading-relaxed text-slate-800"
                        >
                          {question.katyaResponse}
                        </motion.p>
                      )}
                      
                      {/* Explanation */}
                      {question.explanation && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="text-sm text-slate-600 leading-relaxed"
                        >
                          {question.explanation}
                        </motion.p>
                      )}
                      
                      {/* XP badge for correct answers */}
                      {isCorrect === true && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.4, type: "spring" }}
                          className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-black shadow-md"
                        >
                          <Star className="w-3.5 h-3.5" />
                          +{Math.floor(xpReward / questions.length)} XP
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Continue Button */}
                  <div className="mt-6 max-w-3xl mx-auto">
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      onClick={handleContinue}
                      className={`w-full py-4 rounded-2xl font-black text-lg shadow-lg transition-transform active:scale-95 ${
                        isCorrect === true 
                          ? 'bg-green-500 text-white shadow-green-200 hover:bg-green-600' 
                          : isCorrect === false
                          ? 'bg-rose-500 text-white shadow-rose-200 hover:bg-rose-600'
                          : 'bg-purple-500 text-white shadow-purple-200 hover:bg-purple-600'
                      }`}
                    >
                      ПРОДОЛЖИТЬ
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Over Overlay */}
        <AnimatePresence>
          {hearts === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[150] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
              >
                <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-12 h-12 text-rose-500 fill-rose-500" />
                </div>
                
                <h2 className="text-2xl font-black text-slate-800 mb-2">
                  Сердечки закончились!
                </h2>
                
                <p className="text-slate-600 mb-8">
                  Ты допустил слишком много ошибок. Отдохни немного или восстанови сердечки, чтобы продолжить.
                </p>
                
                <div className="space-y-3">
                  <Button 
                    onClick={() => setHearts(5)}
                    className="w-full py-6 text-lg font-bold bg-gradient-to-r from-rose-500 to-pink-500 hover:brightness-110 text-white shadow-lg shadow-rose-200 rounded-2xl"
                  >
                    Восстановить ❤️
                  </Button>
                  
                  <Button 
                    variant="ghost"
                    onClick={onExit}
                    className="w-full py-4 text-slate-500 font-bold hover:bg-slate-100 rounded-2xl"
                  >
                    Выйти из урока
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default EnhancedLessonInterface;