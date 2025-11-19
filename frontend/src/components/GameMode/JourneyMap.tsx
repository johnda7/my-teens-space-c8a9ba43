import React from 'react';
import { motion } from 'framer-motion';
import { Star, Lock, Check } from 'lucide-react';
import { COMPLETE_LESSONS } from '@/data/allLessonsData';
import { cn } from '@/lib/utils';

interface JourneyMapProps {
  onLessonSelect: (lessonId: string) => void;
}

const JourneyMap = ({ onLessonSelect }: JourneyMapProps) => {
  // Group lessons by module for visual separation
  const modules = ['boundaries', 'confidence', 'emotions', 'relationships'];
  
  // Mock progress for now (will connect to real progress later)
  const completedLessonIds = ['boundaries-w1-1', 'boundaries-w1-2'];
  const currentLessonId = 'boundaries-w1-3';

  return (
    <div className="w-full max-w-md mx-auto pb-32 pt-8 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_50%)]" />

      {modules.map((moduleName, moduleIndex) => {
        const moduleLessons = COMPLETE_LESSONS.filter(l => l.module === moduleName);
        
        return (
          <div key={moduleName} className="mb-12 relative">
            {/* Module Header */}
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md py-3 mb-8 text-center rounded-xl border border-purple-100 shadow-sm">
              <h2 className="text-lg font-bold capitalize text-purple-900">
                {moduleName === 'boundaries' && '🛡️ Границы'}
                {moduleName === 'confidence' && '🦁 Уверенность'}
                {moduleName === 'emotions' && '🎭 Эмоции'}
                {moduleName === 'relationships' && '🤝 Отношения'}
              </h2>
              <p className="text-xs text-purple-600 font-medium">Уровень {moduleIndex + 1}</p>
            </div>

            {/* Lessons Path */}
            <div className="relative flex flex-col items-center gap-8">
              {moduleLessons.map((lesson, index) => {
                const isCompleted = completedLessonIds.includes(lesson.id);
                const isCurrent = lesson.id === currentLessonId;
                const isLocked = !isCompleted && !isCurrent;
                
                // Calculate horizontal offset for winding path
                const xOffset = Math.sin(index * 0.8) * 60; 
                
                return (
                  <div 
                    key={lesson.id}
                    className="relative flex justify-center"
                    style={{ transform: `translateX(${xOffset}px)` }}
                  >
                    {/* Connecting Line (simplified) */}
                    {index < moduleLessons.length - 1 && (
                      <div 
                        className="absolute top-12 w-1 h-8 bg-gray-200 -z-10"
                        style={{ 
                          transform: `rotate(${Math.sin((index + 0.5) * 0.8) * -20}deg)`,
                          height: '40px'
                        }} 
                      />
                    )}

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => !isLocked && onLessonSelect(lesson.id)}
                      disabled={isLocked}
                      className={cn(
                        "w-16 h-16 rounded-full flex items-center justify-center shadow-[0_4px_0_0_rgba(0,0,0,0.2)] transition-all relative z-0",
                        isCompleted ? "bg-green-500 shadow-green-700" : 
                        isCurrent ? "bg-yellow-400 shadow-yellow-600 ring-4 ring-yellow-200 animate-pulse" : 
                        "bg-gray-200 shadow-gray-400 cursor-not-allowed opacity-70"
                      )}
                    >
                      {isCompleted ? (
                        <Check className="w-8 h-8 text-white" strokeWidth={3} />
                      ) : isCurrent ? (
                        <Star className="w-8 h-8 text-white fill-white" />
                      ) : (
                        <Lock className="w-6 h-6 text-gray-400" />
                      )}
                      
                      {/* Lesson Tooltip/Label */}
                      <div className="absolute -bottom-8 whitespace-nowrap bg-white/90 px-2 py-1 rounded-md text-[10px] font-bold shadow-sm border border-gray-100">
                        {lesson.week}.{index + 1}
                      </div>
                    </motion.button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default JourneyMap;
