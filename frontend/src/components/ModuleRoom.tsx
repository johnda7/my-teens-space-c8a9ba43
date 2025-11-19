import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ModuleRoomProps {
  title: string;
  description: string;
  icon: ReactNode;
  theme: 'boundaries' | 'confidence' | 'emotions' | 'relationships';
  progress: number;
  isLocked?: boolean;
  children: ReactNode;
}

const ROOM_THEMES = {
  boundaries: {
    gradient: 'from-purple-500/20 via-pink-500/20 to-blue-500/20',
    accentColor: 'text-purple-600',
    bgPattern: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80',
  },
  confidence: {
    gradient: 'from-yellow-500/20 via-orange-500/20 to-red-500/20',
    accentColor: 'text-yellow-600',
    bgPattern: 'https://images.unsplash.com/photo-1534536281715-e28d76689b4d?w=800&q=80',
  },
  emotions: {
    gradient: 'from-blue-500/20 via-cyan-500/20 to-teal-500/20',
    accentColor: 'text-blue-600',
    bgPattern: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  },
  relationships: {
    gradient: 'from-pink-500/20 via-rose-500/20 to-purple-500/20',
    accentColor: 'text-pink-600',
    bgPattern: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&q=80',
  },
};

const ModuleRoom = ({ 
  title, 
  description, 
  icon, 
  theme, 
  progress,
  isLocked,
  children 
}: ModuleRoomProps) => {
  const themeConfig = ROOM_THEMES[theme];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full blur-3xl opacity-20"
          style={{
            background: `linear-gradient(135deg, ${
              theme === 'boundaries' ? '#a855f7, #ec4899' :
              theme === 'confidence' ? '#eab308, #f97316' :
              theme === 'emotions' ? '#3b82f6, #06b6d4' :
              '#ec4899, #a855f7'
            })`,
            top: '-10%',
            left: '-10%',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-20"
          style={{
            background: `linear-gradient(135deg, ${
              theme === 'boundaries' ? '#ec4899, #3b82f6' :
              theme === 'confidence' ? '#f97316, #ef4444' :
              theme === 'emotions' ? '#06b6d4, #14b8a6' :
              '#a855f7, #ec4899'
            })`,
            bottom: '-10%',
            right: '-10%',
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.15, 0.2],
            x: [0, -30, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Room Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 md:p-8"
        >
          <div className="max-w-4xl mx-auto">
            {/* Glassmorphism Header Card */}
            <div className="bg-white/70 backdrop-blur-[40px] rounded-3xl p-6 border border-white/20 shadow-[0_20px_60px_-25px_rgba(79,70,229,0.25)]">
              <div className="flex items-center gap-4 mb-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${
                      theme === 'boundaries' ? '#a855f7, #ec4899' :
                      theme === 'confidence' ? '#eab308, #f97316' :
                      theme === 'emotions' ? '#3b82f6, #06b6d4' :
                      '#ec4899, #a855f7'
                    })`,
                  }}
                >
                  <div className="scale-75">
                    {icon}
                  </div>
                </motion.div>
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 ios-headline">
                    {title}
                  </h1>
                  <p className="text-sm text-gray-600 ios-body">
                    {description}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative h-3 bg-gray-200/50 rounded-full overflow-hidden">
                <motion.div
                  className="h-full"
                  style={{
                    background: `linear-gradient(to right, ${
                      theme === 'boundaries' ? '#a855f7, #ec4899' :
                      theme === 'confidence' ? '#eab308, #f97316' :
                      theme === 'emotions' ? '#3b82f6, #06b6d4' :
                      '#ec4899, #a855f7'
                    })`,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1.5, ease: "easeOut", type: "spring", stiffness: 400, damping: 17 }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-900 drop-shadow-sm">
                    {progress}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Room Content */}
        <div className="px-4 pb-24">
          {isLocked ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-4xl mx-auto text-center py-20"
            >
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Комната заблокирована
              </h2>
              <p className="text-muted-foreground">
                Завершите предыдущий модуль, чтобы разблокировать этот
              </p>
            </motion.div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
};

export default ModuleRoom;