import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Slider } from './ui/slider';
import { Progress } from './ui/progress';
import EnhancedKatya from './EnhancedKatya';
import { Question } from '@/data/allLessonsData';
import { CheckCircle2, XCircle, ArrowRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface EnhancedLessonInterfaceProps {
  questions: Question[];
  onComplete: (xpEarned: number) => void;
  onExit: () => void;
  lessonTitle: string;
  xpReward: number;
}

const EnhancedLessonInterface = ({ 
  questions, 
  onComplete, 
  onExit,
  lessonTitle,
  xpReward 
}: EnhancedLessonInterfaceProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [sliderValue, setSliderValue] = useState([5]);
  const [selectedMultiple, setSelectedMultiple] = useState<string[]>([]);
  const [katyaMood, setKatyaMood] = useState<'default' | 'celebrate' | 'thinking' | 'support' | 'bounce' | 'shake'>('thinking');

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const triggerConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#58cc02', '#ffc800', '#ff4b4b', '#ce82ff']
    });
  };

  const handleAnswer = (answer: any) => {
    const newAnswers = { ...answers, [question.id]: answer };
    setAnswers(newAnswers);

    if (question.correctAnswer) {
      let correct = false;
      
      if (Array.isArray(question.correctAnswer)) {
        const answerArray = Array.isArray(answer) ? answer : [answer];
        correct = question.correctAnswer.length === answerArray.length &&
                 question.correctAnswer.every(item => answerArray.includes(item));
      } else {
        correct = answer === question.correctAnswer;
      }
      
      setIsCorrect(correct);
      setKatyaMood(correct ? 'bounce' : 'shake');
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
      setTimeout(() => onComplete(xpReward), 500);
    }
  };

  const handleMultipleToggle = (option: string) => {
    setSelectedMultiple(prev => 
      prev.includes(option)
        ? prev.filter(item => item !== option)
        : [...prev, option]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b-4 border-primary shadow-lg"
      >
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between mb-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onExit}
              className="hover:bg-red-100 hover:text-red-600 transition-all"
            >
              ✕ Выход
            </Button>
            <h2 className="text-sm font-bold text-muted-foreground">{lessonTitle}</h2>
            <motion.div 
              className="flex items-center gap-1 text-sm font-bold text-warning bg-warning/10 px-3 py-1 rounded-full"
              whileHover={{ scale: 1.1 }}
            >
              <Sparkles className="w-4 h-4" />
              +{xpReward} XP
            </motion.div>
          </div>
          <Progress value={progress} className="h-4 bg-gray-200" />
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ x: 300, opacity: 0, scale: 0.8 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: -300, opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
          >
            {/* Katya */}
            <motion.div
              className="flex justify-center mb-8"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-40 h-40">
                <EnhancedKatya 
                  mood={katyaMood}
                  autoAnimate={true}
                />
              </div>
            </motion.div>

            {/* Question Card */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl p-8 shadow-2xl border-4 border-primary/10 mb-6"
            >
              <h3 className="text-2xl font-bold text-foreground mb-8 text-center leading-relaxed">
                {question.question}
              </h3>

              {/* Choice Questions */}
              {question.type === 'choice' && question.options && (
                <div className="space-y-4">
                  {question.options.map((option, index) => (
                    <motion.button
                      key={index}
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.03, x: 8 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleAnswer(option)}
                      disabled={showFeedback}
                      className="w-full p-5 rounded-2xl bg-gradient-to-r from-primary/5 to-secondary/5 hover:from-primary/15 hover:to-secondary/15 border-3 border-primary/20 hover:border-primary transition-all text-left font-semibold text-lg disabled:opacity-50 shadow-lg hover:shadow-xl"
                    >
                      <span className="mr-3 text-primary font-bold text-xl">{String.fromCharCode(65 + index)}.</span>
                      {option}
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Multiple Choice */}
              {question.type === 'multiple' && question.options && (
                <div className="space-y-4">
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
                      className={`w-full p-5 rounded-2xl border-3 transition-all text-left font-semibold text-lg disabled:opacity-50 shadow-lg ${
                        selectedMultiple.includes(option)
                          ? 'bg-primary text-white border-primary shadow-xl scale-105'
                          : 'bg-white border-primary/20 hover:border-primary'
                      }`}
                    >
                      <span className="mr-3">
                        {selectedMultiple.includes(option) ? '✓' : '○'}
                      </span>
                      {option}
                    </motion.button>
                  ))}
                  {selectedMultiple.length > 0 && !showFeedback && (
                    <Button 
                      onClick={() => handleAnswer(selectedMultiple)}
                      className="w-full mt-4" 
                      size="lg"
                    >
                      Проверить ответ <ArrowRight className="ml-2" />
                    </Button>
                  )}
                </div>
              )}

              {/* Emotion Questions */}
              {question.type === 'emotion' && question.options && (
                <div className="flex justify-center gap-6 flex-wrap">
                  {question.options.map((emoji, index) => (
                    <motion.button
                      key={index}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: index * 0.1, type: "spring" }}
                      whileHover={{ scale: 1.3, rotate: 15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleAnswer(emoji)}
                      disabled={showFeedback}
                      className="text-7xl p-6 rounded-3xl hover:bg-primary/10 transition-all disabled:opacity-50 shadow-xl hover:shadow-2xl"
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Input Questions */}
              {question.type === 'input' && (
                <div className="space-y-4">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Твой ответ здесь..."
                    className="text-lg p-7 border-3 border-primary/20 focus:border-primary rounded-2xl shadow-lg"
                    disabled={showFeedback}
                    onKeyPress={(e) => e.key === 'Enter' && inputValue.trim() && handleAnswer(inputValue)}
                  />
                  <Button 
                    onClick={() => handleAnswer(inputValue)}
                    disabled={!inputValue.trim() || showFeedback}
                    className="w-full py-6 text-lg"
                    size="lg"
                  >
                    Продолжить <ArrowRight className="ml-2" />
                  </Button>
                </div>
              )}

              {/* Slider Questions */}
              {question.type === 'slider' && (
                <div className="space-y-8">
                  <div className="px-6">
                    <Slider
                      value={sliderValue}
                      onValueChange={setSliderValue}
                      max={10}
                      min={1}
                      step={1}
                      disabled={showFeedback}
                      className="my-8"
                    />
                    <motion.div 
                      className="text-center text-6xl font-bold text-primary"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.3 }}
                      key={sliderValue[0]}
                    >
                      {sliderValue[0]}
                    </motion.div>
                  </div>
                  <Button 
                    onClick={() => handleAnswer(sliderValue[0])}
                    disabled={showFeedback}
                    className="w-full py-6 text-lg"
                    size="lg"
                  >
                    Продолжить <ArrowRight className="ml-2" />
                  </Button>
                </div>
              )}
            </motion.div>

            {/* Feedback */}
            <AnimatePresence>
              {showFeedback && (
                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={`p-8 rounded-3xl shadow-2xl border-4 ${
                    isCorrect === true 
                      ? 'bg-green-50 border-green-400' 
                      : isCorrect === false
                      ? 'bg-red-50 border-red-400'
                      : 'bg-blue-50 border-blue-400'
                  }`}
                >
                  <div className="flex items-start gap-6">
                    {isCorrect !== null && (
                      <motion.div 
                        className="flex-shrink-0"
                        animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.5 }}
                      >
                        {isCorrect ? (
                          <CheckCircle2 className="w-12 h-12 text-green-600" />
                        ) : (
                          <XCircle className="w-12 h-12 text-red-600" />
                        )}
                      </motion.div>
                    )}
                    <div className="flex-1">
                      {question.katyaResponse && (
                        <p className="text-xl font-bold text-foreground mb-3 leading-relaxed">
                          {question.katyaResponse}
                        </p>
                      )}
                      {question.explanation && (
                        <p className="text-base text-muted-foreground leading-relaxed">
                          {question.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EnhancedLessonInterface;