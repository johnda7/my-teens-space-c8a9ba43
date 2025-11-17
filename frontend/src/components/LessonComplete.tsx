import { motion } from 'framer-motion';
import { Button } from './ui/button';
import AnimatedKatya from './AnimatedKatya';
import { Trophy, Star, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

interface LessonCompleteProps {
  xpEarned: number;
  message: string;
  onContinue: () => void;
  xpBoosted?: boolean;
  coinsEarned?: number;
  nextLessonId?: string; // ID следующего урока
  onNextLesson?: () => void; // Callback для перехода к следующему уроку
}

const LessonComplete = ({ 
  xpEarned, 
  message, 
  onContinue, 
  xpBoosted, 
  coinsEarned,
  nextLessonId,
  onNextLesson 
}: LessonCompleteProps) => {
  useEffect(() => {
    // Confetti animation
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#58cc02', '#ffc800', '#ff4b4b', '#ce82ff']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#58cc02', '#ffc800', '#ff4b4b', '#ce82ff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-success/20 via-primary/20 to-warning/20 p-4">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="max-w-md w-full bg-card rounded-3xl p-8 shadow-2xl border-4 border-success"
      >
        {/* Trophy Animation */}
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="flex justify-center mb-6"
        >
          <div className="relative">
            <Trophy className="w-24 h-24 text-warning fill-warning" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute -top-2 -right-2"
            >
              <Star className="w-8 h-8 text-warning fill-warning" />
            </motion.div>
          </div>
        </motion.div>

        {/* Katya */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="flex justify-center mb-6"
        >
          <div className="w-32 h-32">
            <AnimatedKatya mood="celebrate" />
          </div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center mb-6"
        >
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Урок завершен! 🎉
          </h2>
          <p className="text-lg text-muted-foreground mb-4">
            {message}
          </p>
          
          {/* XP Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.9, type: "spring", stiffness: 200 }}
            className="space-y-2"
          >
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-warning to-warning/80 rounded-full shadow-lg">
              <Star className="w-6 h-6 text-white fill-white" />
              <span className="text-2xl font-bold text-white">+{xpEarned} XP</span>
            </div>
            
            {/* Бонус бустера */}
            {xpBoosted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1 }}
                className="text-sm text-purple-600 font-semibold"
              >
                🚀 XP удвоен бустером!
              </motion.div>
            )}
            
            {/* Монеты */}
            {coinsEarned && (
              <div className="flex items-center justify-center gap-2 text-yellow-600 font-semibold">
                <span className="text-xl">🪙</span>
                <span>+{coinsEarned} монет</span>
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* Stars */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="flex justify-center gap-2 mb-6"
        >
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 1.1 + i * 0.1, type: "spring" }}
            >
              <Star className="w-12 h-12 text-warning fill-warning" />
            </motion.div>
          ))}
        </motion.div>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
        >
          {nextLessonId && onNextLesson ? (
            <div className="flex flex-col gap-3">
              <Button
                onClick={onNextLesson}
                size="lg"
                className="w-full text-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                Следующий урок <ArrowRight className="ml-2" />
              </Button>
              <Button
                onClick={onContinue}
                size="lg"
                variant="outline"
                className="w-full text-lg"
              >
                Вернуться на главную
              </Button>
            </div>
          ) : (
            <Button
              onClick={onContinue}
              size="lg"
              className="w-full text-lg"
            >
              Продолжить <ArrowRight className="ml-2" />
            </Button>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LessonComplete;
