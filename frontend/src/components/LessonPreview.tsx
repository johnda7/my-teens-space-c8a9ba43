import { motion } from 'framer-motion';
import { Book, Clock, Trophy, ChevronRight, X } from 'lucide-react';
import { Button } from './ui/button';
import { useTelegram } from '@/hooks/useTelegram';

interface LessonPreviewProps {
  lesson: {
    id: string;
    title: string;
    description?: string;
    subtitle?: string;
    xp: number;
    questions: any[];
    module: string;
    estimatedTime?: number;
  };
  onStart: () => void;
  onClose: () => void;
}

const LessonPreview = ({ lesson, onStart, onClose }: LessonPreviewProps) => {
  const { haptic } = useTelegram();
  
  const moduleColors: Record<string, string> = {
    boundaries: 'from-purple-500 to-pink-500',
    confidence: 'from-blue-500 to-cyan-500',
    emotions: 'from-pink-500 to-rose-500',
    relationships: 'from-green-500 to-emerald-500'
  };

  const moduleColor = moduleColors[lesson.module] || 'from-purple-500 to-pink-500';

  const handleStart = () => {
    haptic?.('light');
    onStart();
  };

  const estimatedTime = lesson.estimatedTime || Math.ceil(lesson.questions.length * 1.5);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-md bg-white rounded-t-3xl p-6 pb-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Шапка */}
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-2xl bg-gradient-to-r ${moduleColor} shadow-lg`}>
            <Book className="w-6 h-6 text-white" />
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Заголовок */}
        <h2 className="text-2xl font-bold mb-2 text-gray-900">{lesson.title}</h2>
        {lesson.subtitle && (
          <p className="text-gray-600 mb-4">{lesson.subtitle}</p>
        )}

        {/* Информация об уроке */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
            <Trophy className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Награда за урок</p>
              <p className="font-bold text-purple-600">+{lesson.xp} XP</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
            <Clock className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Время прохождения</p>
              <p className="font-bold text-blue-600">~{estimatedTime} мин</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
            <Book className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Вопросов в уроке</p>
              <p className="font-bold text-green-600">{lesson.questions.length}</p>
            </div>
          </div>
        </div>

        {/* Описание */}
        {lesson.description && (
          <p className="text-gray-600 mb-6 p-4 bg-gray-50 rounded-xl text-sm">
            {lesson.description}
          </p>
        )}

        {/* Кнопка старта */}
        <Button
          onClick={handleStart}
          className={`w-full h-14 text-lg font-bold bg-gradient-to-r ${moduleColor} hover:opacity-90 transition-all transform hover:scale-[1.02] shadow-lg`}
        >
          <span className="mr-2">Начать урок</span>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default LessonPreview;
