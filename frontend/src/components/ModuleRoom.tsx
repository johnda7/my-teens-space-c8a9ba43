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
    <div className="relative min-h-screen overflow-hidden">
      {/* Background with Pattern */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url(${themeConfig.bgPattern})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className={`absolute inset-0 bg-gradient-to-br ${themeConfig.gradient}`} />
      </div>

      {/* Animated Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/30 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, Math.random() * window.innerHeight],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
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
            <div className="flex items-center gap-4 mb-4">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200 }}
                className={`w-20 h-20 rounded-3xl bg-background/80 backdrop-blur-sm flex items-center justify-center ${themeConfig.accentColor}`}
              >
                {icon}
              </motion.div>
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {title}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {description}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-3 bg-background/50 rounded-full overflow-hidden backdrop-blur-sm">
              <motion.div
                className={`h-full bg-gradient-to-r ${themeConfig.gradient.replace('/20', '')}`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-foreground drop-shadow-sm">
                  {progress}%
                </span>
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