import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import katyaMascot from '@/assets/katya-mascot.png';
import katyaCelebrate from '@/assets/katya-celebrate.png';
import katyaThinking from '@/assets/katya-thinking.png';
import katyaSupport from '@/assets/katya-support.png';

type KatyaMood = 'default' | 'celebrate' | 'thinking' | 'support';

interface AnimatedKatyaProps {
  mood?: KatyaMood;
  message?: string;
  className?: string;
  animate?: boolean;
}

const KATYA_IMAGES = {
  default: katyaMascot,
  celebrate: katyaCelebrate,
  thinking: katyaThinking,
  support: katyaSupport,
};

// Частицы для эффектов
const Particle = ({ delay, duration, x, y, emoji }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
    animate={{ 
      opacity: [0, 1, 1, 0],
      scale: [0, 1.5, 1, 0],
      x: x,
      y: y,
      rotate: [0, 360]
    }}
    transition={{
      duration: duration,
      delay: delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className="absolute text-2xl pointer-events-none"
    style={{ left: '50%', top: '50%' }}
  >
    {emoji}
  </motion.div>
);

const AnimatedKatya = ({ 
  mood = 'default', 
  message, 
  className = '',
  animate = true 
}: AnimatedKatyaProps) => {
  const [currentMood, setCurrentMood] = useState<KatyaMood>(mood);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 3D следование за мышью
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [15, -15]), {
    stiffness: 100,
    damping: 30
  });
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-15, 15]), {
    stiffness: 100,
    damping: 30
  });

  useEffect(() => {
    setCurrentMood(mood);
  }, [mood]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !animate) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Анимации для разных настроений
  const moodAnimations = {
    default: {
      scale: 1,
      filter: "brightness(1) saturate(1)",
    },
    celebrate: {
      scale: [1, 1.1, 1],
      filter: ["brightness(1) saturate(1)", "brightness(1.2) saturate(1.3)", "brightness(1) saturate(1)"],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    thinking: {
      scale: 1,
      filter: "brightness(0.95) saturate(0.9)",
    },
    support: {
      scale: [1, 1.05, 1],
      filter: ["brightness(1) saturate(1)", "brightness(1.1) saturate(1.2)", "brightness(1) saturate(1)"],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        initial={animate ? { 
          scale: 0, 
          rotateY: -180,
          rotateX: -180,
          opacity: 0 
        } : false}
        animate={{ 
          scale: 1, 
          rotateY: 0,
          rotateX: 0,
          opacity: 1 
        }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 15,
          duration: 1.2
        }}
        style={{
          perspective: 1000,
          transformStyle: "preserve-3d"
        }}
        className="relative"
      >
        {/* Световой ореол */}
        <motion.div
          className="absolute inset-0 rounded-full blur-3xl opacity-40"
          animate={{
            background: mood === 'celebrate' 
              ? ["radial-gradient(circle, rgba(255,215,0,0.6) 0%, transparent 70%)", 
                 "radial-gradient(circle, rgba(255,105,180,0.6) 0%, transparent 70%)",
                 "radial-gradient(circle, rgba(138,43,226,0.6) 0%, transparent 70%)"]
              : mood === 'support'
              ? ["radial-gradient(circle, rgba(147,51,234,0.5) 0%, transparent 70%)",
                 "radial-gradient(circle, rgba(236,72,153,0.5) 0%, transparent 70%)"]
              : mood === 'thinking'
              ? ["radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)"]
              : ["radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%)"]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />

        {/* Главное изображение с 3D эффектом */}
        <motion.div
          style={{
            rotateX: animate ? rotateX : 0,
            rotateY: animate ? rotateY : 0,
            transformStyle: "preserve-3d"
          }}
          whileHover={animate ? { 
            scale: 1.08,
            transition: { duration: 0.3 }
          } : undefined}
          className="relative"
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={currentMood}
              src={KATYA_IMAGES[currentMood]}
              alt="Психолог Катя"
              className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
              initial={{ opacity: 0, y: 30, rotateX: -30 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                rotateX: 0,
                ...moodAnimations[currentMood]
              }}
              exit={{ opacity: 0, scale: 0.8, rotateX: 30 }}
              transition={{ 
                duration: 0.6,
                type: "spring",
                stiffness: 120,
                damping: 20
              }}
            />
          </AnimatePresence>

          {/* Дыхание - легкое движение вверх-вниз */}
          {animate && mood === 'default' && (
            <motion.div
              className="absolute inset-0"
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
        </motion.div>

        {/* Частицы и эффекты для разных настроений */}
        {animate && (
          <div className="absolute inset-0 pointer-events-none">
            {mood === 'celebrate' && (
              <>
                {[...Array(8)].map((_, i) => (
                  <Particle 
                    key={i}
                    delay={i * 0.2}
                    duration={2 + i * 0.1}
                    x={Math.cos(i * Math.PI / 4) * 80}
                    y={Math.sin(i * Math.PI / 4) * 80}
                    emoji={['✨', '🎉', '⭐', '💫', '🌟'][i % 5]}
                  />
                ))}
                {/* Конфетти */}
                {[...Array(15)].map((_, i) => (
                  <motion.div
                    key={`confetti-${i}`}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      left: '50%',
                      top: '20%',
                      background: ['#FFD700', '#FF69B4', '#8A2BE2', '#00CED1', '#FF4500'][i % 5]
                    }}
                    animate={{
                      y: [0, 200],
                      x: [(Math.random() - 0.5) * 100, (Math.random() - 0.5) * 200],
                      rotate: [0, Math.random() * 720],
                      opacity: [1, 0]
                    }}
                    transition={{
                      duration: 2 + Math.random(),
                      delay: i * 0.1,
                      repeat: Infinity
                    }}
                  />
                ))}
              </>
            )}

            {mood === 'support' && (
              <>
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-3xl"
                    style={{ left: '50%', top: '50%' }}
                    animate={{
                      scale: [0, 1.5, 0],
                      opacity: [0, 0.8, 0],
                      y: [-20, -80],
                      x: Math.cos(i * Math.PI / 3) * 60
                    }}
                    transition={{
                      duration: 3,
                      delay: i * 0.5,
                      repeat: Infinity
                    }}
                  >
                    💜
                  </motion.div>
                ))}
              </>
            )}

            {mood === 'thinking' && (
              <motion.div
                className="absolute top-0 right-0 text-4xl"
                animate={{
                  y: [-10, -30, -10],
                  x: [10, 20, 10],
                  rotate: [0, 10, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                💭
              </motion.div>
            )}
          </div>
        )}
      </motion.div>

      {/* Улучшенное сообщение */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            transition={{ 
              type: "spring",
              stiffness: 200,
              damping: 20,
              delay: 0.2
            }}
            className="mt-6 relative"
          >
            {/* Световой эффект за сообщением */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-blue-400/20 rounded-3xl blur-xl"
              animate={{
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            <div className="relative p-6 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-100">
              {/* Хвостик */}
              <div className="absolute -top-3 left-10 w-6 h-6 bg-white/95 backdrop-blur-xl transform rotate-45 border-l border-t border-purple-100" />
              
              {/* Декоративные элементы */}
              <motion.div
                className="absolute top-2 right-2 text-xl"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ✨
              </motion.div>
              
              <p className="text-sm text-gray-800 font-medium leading-relaxed relative z-10">
                {message}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnimatedKatya;