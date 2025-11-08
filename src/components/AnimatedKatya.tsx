import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
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

const AnimatedKatya = ({ 
  mood = 'default', 
  message, 
  className = '',
  animate = true 
}: AnimatedKatyaProps) => {
  const [currentMood, setCurrentMood] = useState<KatyaMood>(mood);

  useEffect(() => {
    setCurrentMood(mood);
  }, [mood]);

  return (
    <div className={`relative ${className}`}>
      <motion.div
        initial={animate ? { scale: 0, rotate: -180 } : false}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
        whileHover={animate ? { scale: 1.05 } : undefined}
        className="relative"
      >
        <motion.img
          key={currentMood}
          src={KATYA_IMAGES[currentMood]}
          alt="Психолог Катя"
          className="w-full h-full object-contain"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        />
        
        {animate && (
          <motion.div
            className="absolute -top-2 -right-2"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            {mood === 'celebrate' && <span className="text-4xl">✨</span>}
            {mood === 'support' && <span className="text-4xl">💜</span>}
          </motion.div>
        )}
      </motion.div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4 p-4 bg-white rounded-2xl shadow-lg relative"
        >
          <div className="absolute -top-2 left-8 w-4 h-4 bg-white transform rotate-45" />
          <p className="text-sm text-gray-800 font-medium">{message}</p>
        </motion.div>
      )}
    </div>
  );
};

export default AnimatedKatya;