import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Slider } from './ui/slider';
import { Progress } from './ui/progress';
import AnimatedKatya from './AnimatedKatya';
import { Question } from '@/data/lessonsData';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

interface LessonInterfaceProps {
  questions: Question[];
  onComplete: (xpEarned: number) => void;
  onExit: () => void;
  lessonTitle: string;
  xpReward: number;
}

const LessonInterface = ({ 
  questions, 
  onComplete, 
  onExit,
  lessonTitle,
  xpReward 
}: LessonInterfaceProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [sliderValue, setSliderValue] = useState([5]);

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (answer: any) => {
    const newAnswers = { ...answers, [question.id]: answer };
    setAnswers(newAnswers);

    if (question.correctAnswer) {
      const correct = answer === question.correctAnswer;
      setIsCorrect(correct);
      setShowFeedback(true);
      
      setTimeout(() => {
        setShowFeedback(false);
        setIsCorrect(null);
        moveToNext();
      }, 2000);
    } else {
      setShowFeedback(true);
      setTimeout(() => {
        setShowFeedback(false);
        moveToNext();
      }, 1500);
    }
  };

  const moveToNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setInputValue('');
      setSliderValue([5]);
    } else {
      onComplete(xpReward);
    }
  };

  const handleSubmitInput = () => {
    if (inputValue.trim()) {
      handleAnswer(inputValue);
    }
  };

  const handleSubmitSlider = () => {
    handleAnswer(sliderValue[0]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      {/* Header */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border shadow-sm"
      >
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between mb-3">
            <Button variant="ghost" size="sm" onClick={onExit}>
              ← Выход
            </Button>
            <h2 className="text-sm font-bold text-muted-foreground">{lessonTitle}</h2>
            <div className="text-sm font-bold text-warning">+{xpReward} XP</div>
          </div>
          <Progress value={progress} className="h-3" />
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Katya */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex justify-center mb-8"
            >
              <div className="w-32 h-32">
                <AnimatedKatya 
                  mood={showFeedback ? (isCorrect ? 'celebrate' : 'support') : 'thinking'}
                />
              </div>
            </motion.div>

            {/* Question */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-3xl p-8 shadow-xl border-2 border-border mb-6"
            >
              <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
                {question.question}
              </h3>

              {/* Choice Questions */}
              {question.type === 'choice' && question.options && (
                <div className="space-y-3">
                  {question.options.map((option, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(option)}
                      disabled={showFeedback}
                      className="w-full p-4 rounded-xl bg-background hover:bg-primary/10 border-2 border-border hover:border-primary transition-all text-left font-medium disabled:opacity-50"
                    >
                      {option}
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Emotion Questions */}
              {question.type === 'emotion' && question.options && (
                <div className="flex justify-center gap-4 flex-wrap">
                  {question.options.map((emoji, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleAnswer(emoji)}
                      disabled={showFeedback}
                      className="text-6xl p-4 rounded-2xl hover:bg-primary/10 transition-all disabled:opacity-50"
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
                    placeholder="Твой ответ..."
                    className="text-lg p-6"
                    disabled={showFeedback}
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmitInput()}
                  />
                  <Button 
                    onClick={handleSubmitInput}
                    disabled={!inputValue.trim() || showFeedback}
                    className="w-full"
                    size="lg"
                  >
                    Продолжить <ArrowRight className="ml-2" />
                  </Button>
                </div>
              )}

              {/* Slider Questions */}
              {question.type === 'slider' && (
                <div className="space-y-6">
                  <div className="px-4">
                    <Slider
                      value={sliderValue}
                      onValueChange={setSliderValue}
                      max={10}
                      min={1}
                      step={1}
                      disabled={showFeedback}
                      className="my-6"
                    />
                    <div className="text-center text-4xl font-bold text-primary">
                      {sliderValue[0]}
                    </div>
                  </div>
                  <Button 
                    onClick={handleSubmitSlider}
                    disabled={showFeedback}
                    className="w-full"
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
                  initial={{ scale: 0, y: 50 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0, y: -50 }}
                  className={`p-6 rounded-3xl shadow-xl ${
                    isCorrect === true 
                      ? 'bg-success/20 border-2 border-success' 
                      : isCorrect === false
                      ? 'bg-destructive/20 border-2 border-destructive'
                      : 'bg-primary/20 border-2 border-primary'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {isCorrect !== null && (
                      <div className="flex-shrink-0">
                        {isCorrect ? (
                          <CheckCircle2 className="w-8 h-8 text-success" />
                        ) : (
                          <XCircle className="w-8 h-8 text-destructive" />
                        )}
                      </div>
                    )}
                    <div className="flex-1">
                      {question.katyaResponse && (
                        <p className="text-lg font-bold text-foreground mb-2">
                          {question.katyaResponse}
                        </p>
                      )}
                      {question.explanation && (
                        <p className="text-sm text-muted-foreground">
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

export default LessonInterface;
