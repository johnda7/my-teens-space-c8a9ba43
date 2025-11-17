import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Slider } from './ui/slider';
import { Progress } from './ui/progress';
import { RiveKatya } from './RiveKatya';
import { Question } from '@/data/allLessonsData';
import { CheckCircle2, XCircle, ArrowRight, Sparkles, Zap, Star } from 'lucide-react';
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
  
  // Mission Checklist для первого урока
  const [missionChecklist, setMissionChecklist] = useState([
    { id: 'understand', label: 'Понять, что такое границы', completed: false },
    { id: 'feel', label: 'Почувствовать свои границы', completed: false },
    { id: 'practice', label: 'Попробовать поставить границу', completed: false }
  ]);

  const question = questions[currentQuestion];
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
      
      setTimeout(() => {
        setShowFeedback(false);
        setIsCorrect(null);
        setKatyaMood('thinking');
        moveToNext();
      }, 2500);
    } else {
      setKatyaMood('support');
      setKatyaMessage(
        question.katyaResponse ||
          'Спасибо, что делишься. Любой ответ — это шаг к тому, чтобы лучше понимать себя 💜'
      );
      setShowFeedback(true);
      setTimeout(() => {
        setShowFeedback(false);
        setKatyaMood('thinking');
        moveToNext();
      }, 2000);
    }
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
  <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 text-slate-900 relative overflow-hidden">
      {/* Светлые фоновые эффекты как на главной */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Основной фиолетовый свет */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [-60, 60, -60],
            y: [-30, 30, -30]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-purple-300/40 rounded-full blur-[120px]"
        />
        {/* Розовый акцент */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.25, 0.45, 0.25],
            x: [80, -80, 80],
            y: [40, -40, 40]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-20 right-1/4 w-[600px] h-[600px] bg-pink-300/35 rounded-full blur-[140px]"
        />
        {/* Синий центральный */}
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.2, 0.35, 0.2],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-300/30 rounded-full blur-[160px]"
        />
      </div>

      {/* Header - светлый премиум */}
      <motion.div 
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 16 }}
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-purple-200/50 shadow-lg shadow-purple-100/50"
      >
        <div className="max-w-3xl mx-auto px-4 pt-3 pb-4">
          <div className="flex items-center justify-between mb-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onExit}
              className="text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all border border-transparent hover:border-red-300"
            >
              ✕ Выход
            </Button>
            <h2 className="text-xs font-bold text-purple-600 tracking-[0.15em] uppercase">
              {lessonTitle}
            </h2>
            <div className="flex items-center gap-2">
              {combo > 0 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="hidden sm:flex items-center gap-1 text-[11px] font-black text-orange-600 bg-gradient-to-r from-amber-100 to-orange-100 px-3 py-1.5 rounded-full border-2 border-amber-400 shadow-lg shadow-amber-200"
                >
                  🔥 COMBO x{combo}
                </motion.div>
              )}
              <motion.div 
                className="flex items-center gap-1.5 text-xs font-black text-purple-700 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full border-2 border-purple-400 shadow-lg shadow-purple-200"
                whileHover={{ scale: 1.08 }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                +{totalXpEarned} XP
              </motion.div>
            </div>
          </div>
          <div className="mt-1 flex items-center gap-3">
            <div className="relative flex-1">
              <Progress 
                value={progress} 
                className="h-2.5 bg-purple-100 [&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:via-pink-500 [&>div]:to-blue-500 rounded-full border border-purple-200 overflow-visible" 
              />
              {/* Светящаяся точка на конце прогресс-бара */}
              <motion.div
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                style={{ left: `${progress}%` }}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-purple-500 shadow-lg shadow-purple-300"
              />
            </div>
            <motion.span 
              key={Math.floor(progress / 10)}
              initial={{ scale: 1.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-[11px] text-purple-600 font-black min-w-[52px] text-right"
            >
              {Math.round(progress)}%
            </motion.span>
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
        
        {/* Daily Challenge Banner */}
        {isFirstLesson && (
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
        
        {/* Mission Checklist для первого урока */}
        {isFirstLesson && !showIntro && !showMissionComplete && (
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
                      ? 'bg-gradient-to-r from-emerald-100 to-teal-100 border border-emerald-400' 
                      : 'bg-slate-50 border border-slate-200'
                  }`}
                >
                  <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                    item.completed 
                      ? 'bg-emerald-500 border-emerald-600' 
                      : 'bg-white border-slate-300'
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
                    item.completed ? 'text-emerald-900' : 'text-slate-600'
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
            className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-2xl border-2 border-purple-300 flex items-center justify-center text-3xl shadow-lg shadow-purple-200 hover:shadow-xl hover:shadow-purple-300 transition-shadow"
          >
            {currentEmotion}
          </motion.button>
          <span className="text-[10px] text-purple-600 mt-1 block text-center font-semibold">Как ты?</span>
          
          {/* Emotion Picker */}
          <AnimatePresence>
            {showEmotionPicker && (
              <motion.div
                initial={{ scale: 0, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0, opacity: 0, y: 20 }}
                className="absolute bottom-20 right-0 bg-white/95 backdrop-blur-xl rounded-2xl p-3 border-2 border-purple-300 shadow-2xl shadow-purple-300"
              >
                <p className="text-xs text-purple-600 mb-2 text-center font-bold">Выбери эмоцию</p>
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
                          ? 'bg-purple-100 border-2 border-purple-500' 
                          : 'bg-purple-50 border border-purple-200 hover:bg-purple-100'
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
              {/* Светлые фоновые градиенты */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 90, 0],
                  opacity: [0.4, 0.6, 0.4]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-20 -left-20 w-80 h-80 bg-gradient-to-br from-purple-300/60 via-pink-300/50 to-purple-300/40 blur-3xl rounded-full"
              />
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  rotate: [0, -90, 0],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-20 -right-20 w-96 h-96 bg-gradient-to-tl from-blue-300/50 via-purple-300/40 to-pink-300/30 blur-3xl rounded-full"
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
                  className="w-64 h-64 md:w-72 md:h-72 drop-shadow-2xl"
                >
                  <RiveKatya
                    mood={intro.slides?.[introSlideIndex]?.katya || 'celebrate'}
                    message={intro.slides?.[introSlideIndex]?.text || 'Готов(а) к первой миссии о границах?'}
                    showBubble={true}
                  />
                </motion.div>

                {/* Текст с премиум-типографикой */}
                <div className="space-y-4 max-w-lg">
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent leading-tight"
                  >
                    {intro.slides?.[introSlideIndex]?.text?.replace('Я Катя', `Я Катя, ${userName}`) || `Привет, ${userName}! Я Катя! 💜`}
                  </motion.h2>
                  
                  {intro.slides?.[introSlideIndex]?.subtext && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-lg md:text-xl text-slate-700 font-medium leading-relaxed"
                    >
                      {intro.slides[introSlideIndex].subtext}
                    </motion.p>
                  )}
                  
                  {/* Voice Button */}
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const textToSpeak = intro.slides?.[introSlideIndex]?.text + '. ' + (intro.slides?.[introSlideIndex]?.subtext || '');
                      speakMessage(textToSpeak);
                      triggerHaptic('light');
                    }}
                    className="px-4 py-2 rounded-full bg-white/90 hover:bg-white backdrop-blur-xl border-2 border-purple-300 text-sm text-purple-700 hover:text-purple-900 transition-all flex items-center gap-2 mx-auto shadow-md shadow-purple-200"
                  >
                    🔊 Озвучить
                  </motion.button>
                </div>

                {/* Прогресс слайдов */}
                <div className="flex items-center gap-2 mt-6">
                  {intro.slides?.map((_: any, idx: number) => (
                    <motion.div
                      key={idx}
                      animate={{
                        width: idx === introSlideIndex ? 40 : 8,
                        backgroundColor: idx === introSlideIndex 
                          ? 'rgb(147, 51, 234)' 
                          : 'rgb(203, 213, 225)'
                      }}
                      className="h-2 rounded-full"
                    />
                  ))}
                </div>

                {/* Кнопка продолжения */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    className="px-8 py-4 text-base font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 text-white rounded-full shadow-xl shadow-purple-300 border-2 border-purple-300"
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
                    {introSlideIndex < (intro.slides?.length || 1) - 1 ? 'Дальше ✨' : 'Погнали в миссию 🚀'}
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
              className="relative overflow-hidden rounded-3xl bg-white/95 backdrop-blur-xl border-2 border-purple-300 p-6 shadow-2xl shadow-purple-300"
            >
              <div className="absolute inset-0 opacity-40">
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-pink-300/50 blur-3xl" />
                <div className="absolute -bottom-16 -left-12 w-72 h-72 bg-purple-300/50 blur-3xl" />
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
                  <p className="text-xs uppercase tracking-[0.3em] text-purple-600 mb-2 font-bold">МИССИЯ ВЫПОЛНЕНА</p>
                  <h3 className="text-3xl font-extrabold text-purple-900">
                    {completionMeta.message || 'Ты легенда!'}
                  </h3>
                  {completionMeta.subMessage && (
                    <p className="text-sm text-slate-700 mt-2">{completionMeta.subMessage}</p>
                  )}
                </div>
                {earnedStats.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 w-full">
                    {earnedStats.map((stat: string) => (
                      <div
                        key={stat}
                        className="rounded-2xl bg-purple-100 border-2 border-purple-300 py-3 px-2"
                      >
                        <p className="text-[11px] uppercase tracking-wide text-purple-600 font-bold">{stat}</p>
                        <p className="text-lg font-bold text-purple-900">+1</p>
                      </div>
                    ))}
                  </div>
                )}
                {completionMeta.minigame && (
                  <div className="w-full rounded-2xl bg-purple-100 border-2 border-purple-300 p-4 text-left">
                    <p className="text-xs text-purple-600 uppercase tracking-[0.4em] mb-1 font-bold">MINI-GAME BONUS</p>
                    <p className="text-purple-900 font-semibold text-lg">{completionMeta.minigame.title}</p>
                    <p className="text-slate-700 text-sm mb-3">{completionMeta.minigame.description}</p>
                    <div className="flex items-center justify-between text-purple-700 text-sm">
                      <span>Бонус XP</span>
                      <span className="font-bold">+{bonusXP}</span>
                    </div>
                  </div>
                )}
                {completionMeta.stats?.nextUnlock && (
                  <p className="text-xs text-slate-600">{completionMeta.stats.nextUnlock}</p>
                )}
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  {shareEnabled && (
                    <Button
                      variant="secondary"
                      className="flex-1 bg-purple-100 hover:bg-purple-200 border-2 border-purple-300 text-purple-700"
                      onClick={handleShareMission}
                    >
                      Поделиться
                    </Button>
                  )}
                  <Button
                    className="flex-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white font-semibold shadow-xl shadow-purple-300"
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
                    y: particle.y
                  }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  className="absolute top-1/2 left-1/2 pointer-events-none"
                >
                  <Sparkles className="w-5 h-5 text-pink-500" />
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
              
              {/* Voice button для Кати */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  speakMessage(katyaMessage);
                  triggerHaptic('light');
                }}
                className="absolute top-2 right-2 w-10 h-10 rounded-full bg-white/90 hover:bg-white backdrop-blur-xl border-2 border-purple-300 flex items-center justify-center text-lg transition-all shadow-md shadow-purple-200 z-10"
              >
                🔊
              </motion.button>
              
              <div className="relative w-44 h-44 md:w-56 md:h-56 drop-shadow-[0_15px_60px_rgba(139,92,246,0.5)]">
                <RiveKatya
                  mood={katyaMood}
                  message={katyaMessage}
                  showBubble={true}
                  className="mx-auto"
                />
              </div>
            </motion.div>

            {/* Question Progress Indicator */}
            {!showIntro && !showMissionComplete && (
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-3 text-center"
              >
                <p className="text-sm font-bold text-purple-600 mb-2">
                  Вопрос {currentQuestion + 1} из {questions.length}
                </p>
                <div className="max-w-xs mx-auto">
                  <Progress 
                    value={((currentQuestion + 1) / questions.length) * 100} 
                    className="h-1.5 bg-purple-100 [&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-pink-500 rounded-full"
                  />
                </div>
              </motion.div>
            )}

            {/* Question Card */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative overflow-hidden rounded-3xl bg-white/90 backdrop-blur-xl border-2 border-purple-300 shadow-2xl shadow-purple-200 px-6 pt-6 pb-7 mb-4"
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
                  className="absolute -top-32 -right-36 w-80 h-80 bg-gradient-to-br from-pink-300/60 via-purple-300/50 to-blue-300/40 blur-3xl rounded-full"
                />
                <motion.div
                  animate={{
                    scale: [1, 1.4, 1],
                    x: [20, -20, 20],
                    y: [15, -15, 15],
                    rotate: [360, 270, 180, 90, 0]
                  }}
                  transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                  className="absolute -bottom-36 -left-28 w-72 h-72 bg-gradient-to-tr from-blue-300/50 via-purple-300/60 to-pink-300/40 blur-3xl rounded-full"
                />
              </div>

              <div className="relative">
              <div className="flex items-start justify-between gap-4 mb-8">
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-700 via-pink-700 to-blue-700 bg-clip-text text-transparent text-center leading-relaxed"
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
                  className="relative shrink-0 bg-gradient-to-r from-blue-400 to-cyan-500 p-3 rounded-2xl shadow-lg"
                  title={`Использовать подсказку (${hintsAvailable})`}
                >
                  <span className="text-2xl">💡</span>
                  <div className="absolute -top-1 -right-1 bg-white text-blue-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
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
                  className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-2xl"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💡</span>
                    <div>
                      <h4 className="font-bold text-blue-900 mb-1">Подсказка:</h4>
                      <p className="text-blue-800">{question.explanation || 'Подумай о своих чувствах и границах'}</p>
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
                      whileHover={{ scale: 1.03, x: 8 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        triggerHaptic('light');
                        handleAnswer(option);
                      }}
                      disabled={showFeedback}
                      className="group relative w-full px-6 py-6 rounded-2xl bg-white/80 hover:bg-white/90 backdrop-blur-[20px] border-2 border-purple-300 hover:border-purple-500 transition-all text-left font-bold text-[16px] disabled:opacity-50 shadow-lg shadow-purple-200 hover:shadow-xl hover:shadow-purple-300 overflow-hidden text-slate-800"
                    >
                      {/* Градиентный hover-эффект */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 bg-gradient-to-r from-purple-100/50 via-pink-100/50 to-blue-100/50"
                      />
                      
                      {/* Анимированная рамка при hover */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileHover={{ 
                          opacity: [0, 1, 0],
                          scale: [0.8, 1.2, 1.4]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute inset-0 border-2 border-purple-400/40 rounded-2xl"
                      />
                      
                      <div className="relative flex items-center gap-4">
                        <motion.span
                          whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                          transition={{ duration: 0.5 }}
                          className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-500 text-[15px] font-black text-white shadow-[0_0_30px_rgba(168,85,247,0.7),0_0_60px_rgba(168,85,247,0.3)] group-hover:shadow-[0_0_50px_rgba(168,85,247,1),0_0_100px_rgba(168,85,247,0.5)] transition-shadow"
                        >
                          {String.fromCharCode(65 + index)}
                        </motion.span>
                        <span className="text-slate-100 group-hover:text-white transition-colors">{option}</span>
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
                      className={`w-full px-4 py-4 rounded-2xl border transition-all text-left font-semibold text-[15px] disabled:opacity-50 shadow-[0_10px_30px_rgba(15,23,42,0.9)] flex items-center gap-3 ${
                        selectedMultiple.includes(option)
                          ? 'bg-indigo-500/90 text-white border-indigo-300 scale-[1.02]'
                          : 'bg-slate-900/70 border-white/8 hover:border-indigo-400/60'
                      }`}
                    >
                      <div className={`flex items-center justify-center w-6 h-6 rounded-md border-2 ${selectedMultiple.includes(option) ? 'bg-indigo-400 border-indigo-200' : 'border-slate-500'}`}>
                        {selectedMultiple.includes(option) && (
                          <span className="text-[10px] font-bold text-slate-950">✓</span>
                        )}
                      </div>
                      <span className="text-slate-100">{option}</span>
                    </motion.button>
                  ))}
                  <Button 
                    onClick={() => handleAnswer(selectedMultiple)} 
                    disabled={showFeedback} 
                    className="w-full mt-4 bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-emerald-400 border-0 shadow-[0_14px_45px_rgba(129,140,248,0.9)] text-slate-950 font-semibold hover:brightness-110"
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
                      className="text-[15px] px-4 py-5 border-2 border-purple-500/20 focus:border-purple-400/60 focus:ring-0 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.9),0_0_40px_rgba(168,85,247,0.1)] bg-black/70 placeholder:text-slate-500 text-white"
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
                    className="w-full py-4 text-[15px] bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 hover:from-purple-400 hover:via-fuchsia-400 hover:to-pink-400 border-0 shadow-[0_14px_45px_rgba(168,85,247,0.7)] text-white font-bold hover:shadow-[0_20px_60px_rgba(168,85,247,0.9)]"
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
                    className="my-6 [&>[role=slider]]:bg-indigo-400"
                  />
                  <motion.div 
                    className="text-center text-5xl font-bold text-indigo-300 drop-shadow-[0_0_25px_rgba(129,140,248,0.9)]"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.3 }}
                    key={sliderValue[0]}
                  >
                    {sliderValue[0]}
                  </motion.div>
                  <Button 
                    onClick={() => handleAnswer(sliderValue[0])} 
                    disabled={showFeedback} 
                    className="mt-5 bg-slate-900/90 border border-indigo-400/60 text-indigo-200 hover:bg-indigo-500/20"
                  >
                    Ответить
                  </Button>
                </div>
              )}

              {/* Matching Questions */}
              {question.type === 'matching' && (
                <p className="text-center text-sm text-rose-300/80">
                  Этот тип вопроса пока в разработке — скоро здесь будет интерактив 🛠️
                </p>
              )}

              </div>
            </motion.div>

            {/* Enhanced Empathetic Feedback Overlay (GameLesson-style) */}
            <AnimatePresence>
              {showFeedback && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: -20 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className={`relative overflow-hidden rounded-3xl shadow-2xl border-2 p-6 ${
                    isCorrect === true 
                      ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-400' 
                      : isCorrect === false
                      ? 'bg-gradient-to-br from-rose-50 to-pink-50 border-rose-400'
                      : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-400'
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
                        ? 'bg-emerald-300/40' 
                        : isCorrect === false
                        ? 'bg-rose-300/40'
                        : 'bg-blue-300/40'
                    }`}
                  />
                  
                  <div className="relative flex items-start gap-4">
                    {isCorrect !== null && (
                      <motion.div 
                        className="flex-shrink-0"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                      >
                        {isCorrect ? (
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-300">
                            <CheckCircle2 className="w-8 h-8 text-white" />
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-300">
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
                            ? 'text-emerald-900' 
                            : isCorrect === false
                            ? 'text-rose-900'
                            : 'text-blue-900'
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
                          className={`text-base font-semibold mb-2 leading-relaxed ${
                            isCorrect === true 
                              ? 'text-emerald-800' 
                              : isCorrect === false
                              ? 'text-rose-800'
                              : 'text-blue-800'
                          }`}
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
                          className="text-sm text-slate-700 leading-relaxed"
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
                          className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-black shadow-lg shadow-amber-300"
                        >
                          <Star className="w-3.5 h-3.5" />
                          +{Math.floor(xpReward / questions.length)} XP
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EnhancedLessonInterface;