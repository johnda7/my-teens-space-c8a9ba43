import { motion, useAnimation } from 'framer-motion';
import { useState, useEffect } from 'react';
import katyaMascot from '@/assets/katya-mascot.png';
import katyaCelebrate from '@/assets/katya-celebrate.png';
import katyaThinking from '@/assets/katya-thinking.png';
import katyaSupport from '@/assets/katya-support.png';

type KatyaMood = 'default' | 'celebrate' | 'thinking' | 'support' | 'bounce' | 'shake';

interface EnhancedKatyaProps {
  mood?: KatyaMood;
  message?: string;
  className?: string;
  autoAnimate?: boolean;
}

const KATYA_IMAGES = {
  default: katyaMascot,
  celebrate: katyaCelebrate,
  thinking: katyaThinking,
  support: katyaSupport,
  bounce: katyaCelebrate,
  shake: katyaSupport,
};

const EnhancedKatya = ({ 
  mood = 'default', 
  message, 
  className = '',
  autoAnimate = true 
}: EnhancedKatyaProps) => {
  const controls = useAnimation();
  const [currentMood, setCurrentMood] = useState<KatyaMood>(mood);

  useEffect(() => {
    setCurrentMood(mood);
    
    // Bounce animation for correct answers
    if (mood === 'bounce' || mood === 'celebrate') {
      controls.start({
        y: [0, -30, 0, -15, 0],
        scale: [1, 1.1, 1, 1.05, 1],
        rotate: [0, -5, 5, -3, 0],
        transition: {
          duration: 0.6,
          times: [0, 0.2, 0.4, 0.6, 1],
          ease: "easeOut"
        }
      });
    }
    
    // Shake animation for wrong answers
    if (mood === 'shake') {
      controls.start({
        x: [0, -10, 10, -10, 10, -5, 5, 0],
        rotate: [0, -2, 2, -2, 2, -1, 1, 0],
        transition: {
          duration: 0.5,
          times: [0, 0.1, 0.2, 0.3, 0.4, 0.6, 0.8, 1]
        }
      });
    }
  }, [mood, controls]);

  // Idle breathing animation
  const idleAnimation = autoAnimate && (mood === 'default' || mood === 'thinking') ? {
    y: [0, -8, 0],
    scale: [1, 1.02, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  } : {};

  return (
    <div className={`relative ${className}`}>
      <motion.div
        animate={autoAnimate ? { ...idleAnimation, ...controls } : controls}
        className="relative"
      >
        <motion.img
          key={currentMood}
          src={KATYA_IMAGES[currentMood]}
          alt="Психолог Катя Карпенко"
          className="w-full h-full object-contain drop-shadow-2xl"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Sparkles for celebrate mood */}
        {mood === 'celebrate' && (
          <>
            <motion.div
              className="absolute top-0 right-0 text-4xl"
              animate={{
                scale: [0, 1.5, 0],
                rotate: [0, 180, 360],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 0.5
              }}
            >
              ✨
            </motion.div>
            <motion.div
              className="absolute top-0 left-0 text-4xl"
              animate={{
                scale: [0, 1.5, 0],
                rotate: [0, -180, -360],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 0.8
              }}
            >
              🌟
            </motion.div>
          </>
        )}

        {/* Hearts for support mood */}
        {mood === 'support' && (
          <motion.div
            className="absolute -top-4 right-0 text-3xl"
            animate={{
              y: [0, -20, -40],
              opacity: [1, 0.8, 0],
              scale: [0.8, 1, 1.2]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1
            }}
          >
            💜
          </motion.div>
        )}
      </motion.div>

      {/* Message bubble */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="mt-4 relative"
        >
          <div className="absolute -top-3 left-8 w-6 h-6 bg-white transform rotate-45 shadow-lg" />
          <div className="relative bg-white p-5 rounded-3xl shadow-2xl border-2 border-primary/20">
            <p className="text-base text-gray-800 font-medium leading-relaxed">
              {message}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default EnhancedKatya;