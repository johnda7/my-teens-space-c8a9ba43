import { motion } from 'framer-motion';
import LessonNode from './LessonNode';
import AnimatedKatya from './AnimatedKatya';

interface Lesson {
  id: string;
  title: string;
  status: 'locked' | 'available' | 'current' | 'completed';
  xp: number;
}

interface LearningPathProps {
  lessons: Lesson[];
  currentLessonIndex: number;
  onLessonStart?: (lessonId: string) => void;
  weekNumber?: number;
}

const LearningPath = ({ 
  lessons, 
  currentLessonIndex,
  onLessonStart,
  weekNumber = 1 
}: LearningPathProps) => {
  const completedLessons = lessons.filter(l => l.status === 'completed').length;
  const progressPercentage = (completedLessons / lessons.length) * 100;

  return (
    <div className="relative min-h-screen pb-20">
      {/* Animated Background Path */}
      <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2">
        <motion.div
          className="h-full w-full bg-gradient-to-b from-primary/30 via-secondary/30 to-accent/30 rounded-full"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ transformOrigin: 'top' }}
        />
        
        {/* Progress Overlay */}
        <motion.div
          className="absolute top-0 left-0 w-full bg-gradient-to-b from-success via-primary to-warning rounded-full"
          initial={{ height: 0 }}
          animate={{ height: `${progressPercentage}%` }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </div>

      {/* Header with Katya */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mb-12 p-6 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rounded-3xl mx-4"
      >
        <div className="flex items-start gap-4">
          <div className="w-24 h-24 flex-shrink-0">
            <AnimatedKatya 
              mood={currentLessonIndex === 0 ? 'default' : completedLessons === lessons.length ? 'celebrate' : 'support'}
            />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {completedLessons === lessons.length 
                ? 'Поздравляю! 🎉' 
                : currentLessonIndex === 0
                ? 'Привет! Начнём? 👋'
                : 'Продолжай, у тебя получается! 💪'}
            </h2>
            <p className="text-sm text-muted-foreground mb-3">
              {completedLessons === lessons.length
                ? 'Ты завершил(а) все уроки этой недели!'
                : `Неделя ${weekNumber} • ${completedLessons}/${lessons.length} уроков`}
            </p>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-success via-primary to-warning"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Lessons Path */}
      <div className="relative z-10 px-4">
        {lessons.map((lesson, index) => (
          <LessonNode
            key={lesson.id}
            title={lesson.title}
            status={lesson.status}
            xp={lesson.xp}
            index={index}
            total={lessons.length}
            onStart={() => onLessonStart?.(lesson.id)}
          />
        ))}
      </div>

      {/* Katya at the end */}
      {completedLessons === lessons.length && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="relative z-10 mx-4 p-6 bg-gradient-to-br from-success/20 to-primary/20 rounded-3xl border-2 border-success"
        >
          <div className="flex items-center gap-4">
            <div className="w-20 h-20">
              <AnimatedKatya mood="celebrate" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground mb-1">
                Отличная работа!
              </h3>
              <p className="text-sm text-muted-foreground">
                Переходи к следующей неделе или повтори материал
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default LearningPath;