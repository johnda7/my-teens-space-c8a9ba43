import { motion } from 'framer-motion';
import { Lock, Star, BookOpen, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

type LessonStatus = 'locked' | 'available' | 'current' | 'completed';

interface LessonNodeProps {
  title: string;
  status: LessonStatus;
  xp: number;
  index: number;
  total: number;
  onStart?: () => void;
}

const LessonNode = ({ title, status, xp, index, total, onStart }: LessonNodeProps) => {
  const isEven = index % 2 === 0;
  
  const getNodeColor = () => {
    switch (status) {
      case 'completed': return 'from-success/20 to-success/5 border-success';
      case 'current': return 'from-warning/20 to-warning/5 border-warning';
      case 'available': return 'from-primary/20 to-primary/5 border-primary';
      default: return 'from-muted to-muted/50 border-border';
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'completed': 
        return <CheckCircle2 className="w-8 h-8 text-success" fill="currentColor" />;
      case 'current': 
        return <Star className="w-8 h-8 text-warning" fill="currentColor" />;
      case 'available': 
        return <BookOpen className="w-8 h-8 text-primary" />;
      default: 
        return <Lock className="w-8 h-8 text-muted-foreground" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: isEven ? -50 : 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
      className={`relative mb-8 ${isEven ? 'mr-auto' : 'ml-auto'} w-[85%]`}
    >
      {/* Connecting Line */}
      {index < total - 1 && (
        <div 
          className={`absolute ${isEven ? 'right-0' : 'left-0'} top-full h-8 w-0.5 bg-gradient-to-b ${
            status === 'completed' ? 'from-success to-primary' : 'from-border to-muted'
          } ${isEven ? 'translate-x-1/2' : '-translate-x-1/2'}`}
        />
      )}

      <motion.div
        whileHover={status !== 'locked' ? { scale: 1.03, y: -2 } : undefined}
        whileTap={status !== 'locked' ? { scale: 0.98 } : undefined}
        className={`relative p-6 rounded-3xl bg-gradient-to-br ${getNodeColor()} border-2 backdrop-blur-sm transition-all duration-300`}
      >
        {/* Glow Effect for Current */}
        {status === 'current' && (
          <motion.div
            className="absolute inset-0 rounded-3xl bg-warning/20"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        <div className="relative flex items-start gap-4">
          {/* Icon */}
          <motion.div
            animate={status === 'current' ? {
              rotate: [0, -10, 10, -10, 0],
              scale: [1, 1.1, 1],
            } : undefined}
            transition={{
              duration: 2,
              repeat: status === 'current' ? Infinity : 0,
              repeatDelay: 1,
            }}
            className={`flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center ${
              status === 'completed' ? 'bg-success/20' :
              status === 'current' ? 'bg-warning/20' :
              status === 'available' ? 'bg-primary/20' :
              'bg-muted'
            }`}
          >
            {getIcon()}
          </motion.div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className={`text-base font-bold ${
                status === 'locked' ? 'text-muted-foreground' : 'text-foreground'
              }`}>
                {title}
              </h3>
              <Badge 
                variant={status === 'completed' ? 'default' : 'secondary'}
                className="flex-shrink-0"
              >
                +{xp} XP
              </Badge>
            </div>

            {status === 'locked' && (
              <p className="text-xs text-muted-foreground mb-3">
                Завершите предыдущий урок
              </p>
            )}

            {status === 'completed' && (
              <p className="text-xs text-success mb-3 font-medium">
                ✓ Урок пройден
              </p>
            )}

            {status === 'current' && (
              <div className="space-y-2">
                <p className="text-xs text-foreground font-medium">
                  Готов(а) продолжить обучение? 🚀
                </p>
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={onStart}
                >
                  Начать урок
                </Button>
              </div>
            )}

            {status === 'available' && (
              <Button 
                size="sm" 
                variant="outline"
                className="w-full mt-2"
                onClick={onStart}
              >
                Начать
              </Button>
            )}
          </div>
        </div>

        {/* Completion Stars */}
        {status === 'completed' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 flex gap-0.5"
          >
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1 * i, type: "spring" }}
              >
                <Star className="w-5 h-5 text-warning fill-warning" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default LessonNode;