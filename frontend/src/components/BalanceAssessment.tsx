import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Progress } from './ui/progress';
import EnhancedKatya from './EnhancedKatya';
import { BALANCE_CATEGORIES, getAllQuestions, calculateCategoryScore, BalanceQuestion } from '@/data/wheelOfBalance';
import { ArrowRight, ArrowLeft } from 'lucide-react';

interface BalanceAssessmentProps {
  onComplete: (scores: Record<string, number>, answers: Record<string, string>) => void;
  type: 'initial' | 'final';
}

const BalanceAssessment = ({ onComplete, type }: BalanceAssessmentProps) => {
  const allQuestions = getAllQuestions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [sliderValue, setSliderValue] = useState([5]);
  const [showIntro, setShowIntro] = useState(true);

  const currentQuestion = allQuestions[currentIndex];
  const progress = ((currentIndex + 1) / allQuestions.length) * 100;
  const category = BALANCE_CATEGORIES.find(c => c.id === currentQuestion?.category);

  const handleAnswer = () => {
    const newAnswers = { ...answers, [currentQuestion.id]: sliderValue[0].toString() };
    setAnswers(newAnswers);

    if (currentIndex < allQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSliderValue([5]);
    } else {
      // Завершение оценки
      const scores: Record<string, number> = {};
      BALANCE_CATEGORIES.forEach(cat => {
        scores[cat.id] = calculateCategoryScore(cat.id, newAnswers);
      });
      onComplete(scores, newAnswers);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      const prevAnswer = answers[allQuestions[currentIndex - 1].id];
      setSliderValue([parseInt(prevAnswer) || 5]);
    }
  };

  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute w-[600px] h-[600px] rounded-full blur-3xl opacity-20"
            style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', top: '-10%', left: '-10%' }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15], x: [0, 30, 0], y: [0, -30, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-20"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', bottom: '-10%', right: '-10%' }}
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.15, 0.2], x: [0, -30, 0], y: [0, 30, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 5 }}
          />
        </div>

        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          className="max-w-2xl w-full bg-white/70 backdrop-blur-[40px] rounded-3xl p-8 shadow-[0_20px_60px_-25px_rgba(79,70,229,0.25)] border border-white/20 relative z-10"
        >
          <div className="text-center">
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center mb-6"
            >
              <div className="w-40 h-40">
                <EnhancedKatya mood="celebrate" autoAnimate={true} />
              </div>
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-4xl font-bold text-gray-900 mb-4 ios-headline"
            >
              {type === 'initial' ? 'Давай познакомимся! 👋' : 'Посмотрим твой прогресс! 🎉'}
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-lg text-gray-600 mb-8 leading-relaxed ios-body"
            >
              {type === 'initial'
                ? 'Сейчас я задам тебе несколько вопросов о разных сферах твоей жизни. Это поможет понять, с чего начать наше путешествие! 🌟'
                : 'Давай посмотрим как ты вырос за это время! Ответь на те же вопросы, что и в начале. 📈'}
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="space-y-4 mb-8"
            >
              <div className="flex items-center justify-center gap-3 text-left">
                <span className="text-3xl">⏱️</span>
                <p className="text-sm text-muted-foreground">
                  Займет всего 5-7 минут<br/>
                  <span className="font-semibold">{allQuestions.length} коротких вопросов</span>
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 text-left">
                <span className="text-3xl">🎯</span>
                <p className="text-sm text-muted-foreground">
                  Нет правильных или неправильных ответов<br/>
                  <span className="font-semibold">Отвечай честно!</span>
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1, type: 'spring' }}
            >
              <Button
                size="lg"
                onClick={() => setShowIntro(false)}
                className="px-8 py-6 text-lg"
              >
                Начать оценку <ArrowRight className="ml-2" />
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-15"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #a855f7)', top: '10%', left: '5%' }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.25, 0.15], x: [0, 50, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full blur-3xl opacity-15"
          style={{ background: 'linear-gradient(135deg, #ec4899, #3b82f6)', bottom: '5%', right: '10%' }}
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.15, 0.2], y: [0, -40, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 7 }}
        />
      </div>

      {/* Header */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 bg-white/70 backdrop-blur-[40px] border-b border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
      >
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {category && (
                <>
                  <span className="text-3xl">{category.icon}</span>
                  <span className="font-bold text-sm">{category.name}</span>
                </>
              )}
            </div>
            <div className="text-sm font-bold text-muted-foreground">
              {currentIndex + 1} / {allQuestions.length}
            </div>
          </div>
          <Progress value={progress} className="h-4 bg-gray-200" />
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            {/* Katya */}
            <div className="flex justify-center mb-8">
              <div className="w-32 h-32">
                <EnhancedKatya mood="thinking" autoAnimate={true} />
              </div>
            </div>

            {/* Question Card */}
            <motion.div
              className="bg-white/70 backdrop-blur-[40px] rounded-3xl p-8 shadow-[0_20px_60px_-25px_rgba(79,70,229,0.25)] border border-white/20"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center leading-relaxed ios-title">
                {currentQuestion.question}
              </h3>

              {/* Slider */}
              <div className="space-y-8">
                <div className="px-6">
                  <div className="flex justify-between text-sm text-muted-foreground mb-4 font-semibold">
                    <span>1 - Совсем нет</span>
                    <span>10 - Отлично</span>
                  </div>
                  
                  <Slider
                    value={sliderValue}
                    onValueChange={setSliderValue}
                    max={10}
                    min={1}
                    step={1}
                    className="my-8"
                  />
                  
                  <motion.div
                    className="text-center"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.3 }}
                    key={sliderValue[0]}
                  >
                    <div className="text-7xl font-bold text-purple-600 mb-2">
                      {sliderValue[0]}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {sliderValue[0] <= 3 && 'Есть над чем работать'}
                      {sliderValue[0] > 3 && sliderValue[0] <= 6 && 'Неплохо, но можно лучше'}
                      {sliderValue[0] > 6 && sliderValue[0] <= 8 && 'Здорово!'}
                      {sliderValue[0] > 8 && 'Отлично!'}
                    </div>
                  </motion.div>
                </div>

                {/* Buttons */}
                <div className="flex gap-4">
                  {currentIndex > 0 && (
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      className="flex-1 py-6 text-lg"
                    >
                      <ArrowLeft className="mr-2" /> Назад
                    </Button>
                  )}
                  <Button
                    onClick={handleAnswer}
                    className="flex-1 py-6 text-lg"
                  >
                    {currentIndex === allQuestions.length - 1 ? 'Завершить' : 'Далее'}
                    <ArrowRight className="ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BalanceAssessment;