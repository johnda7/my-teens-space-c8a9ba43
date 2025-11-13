import { motion, useMotionValue, useTransform, useSpring, AnimatePresence, useAnimation } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import katyaMascot from '@/assets/katya-mascot.png';
import katyaCelebrate from '@/assets/katya-celebrate.png';
import katyaThinking from '@/assets/katya-thinking.png';
import katyaSupport from '@/assets/katya-support.png';

type KatyaMood = 'default' | 'celebrate' | 'thinking' | 'support';

interface AnimatedKatyaV2Props {
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

// Particle component with advanced physics
const Particle = ({ 
  delay, 
  duration, 
  x, 
  y, 
  emoji, 
  type = 'float' 
}: { 
  delay: number; 
  duration: number; 
  x: number; 
  y: number; 
  emoji: string;
  type?: 'float' | 'orbit' | 'burst';
}) => {
  const variants = {
    float: {
      opacity: [0, 1, 1, 0],
      scale: [0, 1.5, 1.2, 0],
      x: [0, x, x * 1.2, x * 0.8],
      y: [0, y, y * 1.5, y * 2],
      rotate: [0, 180, 360, 540],
    },
    orbit: {
      opacity: [0, 1, 1, 0],
      scale: [0, 1, 1, 0],
      x: [
        0,
        Math.cos(0) * x,
        Math.cos(Math.PI) * x,
        Math.cos(2 * Math.PI) * x,
      ],
      y: [
        0,
        Math.sin(0) * y,
        Math.sin(Math.PI) * y,
        Math.sin(2 * Math.PI) * y,
      ],
      rotate: [0, 360],
    },
    burst: {
      opacity: [0, 1, 1, 0],
      scale: [0, 2, 1.5, 0],
      x: x,
      y: y,
      rotate: [0, 720],
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
      animate={variants[type]}
      transition={{
        duration: duration,
        delay: delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="absolute text-2xl pointer-events-none"
      style={{ 
        left: '50%', 
        top: '50%',
        filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))',
      }}
    >
      {emoji}
    </motion.div>
  );
};

// Breathing overlay component
const BreathingOverlay = () => (
  <motion.div
    className="absolute inset-0 pointer-events-none"
    animate={{
      scale: [1, 1.02, 1],
      opacity: [0.3, 0.5, 0.3],
    }}
    transition={{
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    }}
    style={{
      background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
    }}
  />
);

// Blinking overlay for eyes
const BlinkingEyes = () => (
  <motion.div
    className="absolute inset-0 pointer-events-none"
    animate={{
      opacity: [0, 0, 1, 0],
    }}
    transition={{
      duration: 0.3,
      repeat: Infinity,
      repeatDelay: 3,
      ease: "easeInOut",
    }}
    style={{
      background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 40%, transparent 50%)',
    }}
  />
);

// Glow effect component
const GlowEffect = ({ color, intensity = 0.4 }: { color: string; intensity?: number }) => (
  <motion.div
    className="absolute inset-0 pointer-events-none rounded-full"
    animate={{
      opacity: [intensity * 0.5, intensity, intensity * 0.5],
      scale: [1, 1.1, 1],
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    }}
    style={{
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      filter: 'blur(20px)',
    }}
  />
);

const AnimatedKatyaV2 = ({ 
  mood = 'default', 
  message, 
  className = '',
  animate = true 
}: AnimatedKatyaV2Props) => {
  const [currentMood, setCurrentMood] = useState<KatyaMood>(mood);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  
  // 3D Mouse tracking with parallax layers
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Multiple layers for parallax depth
  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [20, -20]), {
    stiffness: 150,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-20, 20]), {
    stiffness: 150,
    damping: 30,
  });
  
  // Shadow dynamics
  const shadowX = useSpring(useTransform(mouseX, [-300, 300], [-30, 30]), {
    stiffness: 100,
    damping: 20,
  });
  const shadowY = useSpring(useTransform(mouseY, [-300, 300], [-30, 30]), {
    stiffness: 100,
    damping: 20,
  });

  useEffect(() => {
    setCurrentMood(mood);
    
    // Trigger entrance animation
    if (animate) {
      controls.start({
        scale: [0, 1.2, 1],
        rotateZ: [0, 10, -10, 0],
        transition: {
          duration: 0.8,
          ease: "easeOut",
        },
      });
    }
  }, [mood, animate, controls]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !animate || isDragging) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    
    mouseX.set(deltaX);
    mouseY.set(deltaY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    // Bounce back animation
    controls.start({
      x: 0,
      y: 0,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
      },
    });
  };

  // Mood configurations
  const moodConfig = {
    default: {
      color: 'hsl(88 50% 53%)',
      glow: 'rgba(120, 200, 80, 0.4)',
      particles: [
        { emoji: '✨', count: 3, type: 'float' as const },
      ],
      breath: true,
    },
    celebrate: {
      color: 'hsl(45 100% 51%)',
      glow: 'rgba(255, 215, 0, 0.6)',
      particles: [
        { emoji: '🎉', count: 4, type: 'burst' as const },
        { emoji: '⭐', count: 4, type: 'float' as const },
        { emoji: '🌟', count: 3, type: 'orbit' as const },
      ],
      breath: false,
    },
    support: {
      color: 'hsl(0 70% 60%)',
      glow: 'rgba(255, 120, 150, 0.5)',
      particles: [
        { emoji: '💗', count: 5, type: 'float' as const },
        { emoji: '💕', count: 3, type: 'orbit' as const },
      ],
      breath: true,
    },
    thinking: {
      color: 'hsl(200 92% 60%)',
      glow: 'rgba(100, 180, 255, 0.4)',
      particles: [
        { emoji: '💭', count: 3, type: 'orbit' as const },
        { emoji: '❓', count: 2, type: 'float' as const },
      ],
      breath: true,
    },
  };

  const config = moodConfig[currentMood];

  // Idle micro-movements
  const idleVariants = {
    animate: {
      y: [0, -5, 0],
      rotate: [0, 1, -1, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div 
      ref={containerRef}
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: '1000px' }}
    >
      {/* Glow Effect */}
      <GlowEffect color={config.glow} intensity={0.5} />

      {/* Main Katya Container */}
      <motion.div
        animate={controls}
        variants={idleVariants}
        initial={animate ? { 
          scale: 0, 
          opacity: 0,
          rotateZ: -180,
        } : false}
        whileHover={animate ? { 
          scale: 1.1,
          transition: { type: "spring", stiffness: 300, damping: 20 }
        } : undefined}
        whileTap={animate ? { 
          scale: 0.95,
          transition: { duration: 0.1 }
        } : undefined}
        drag={animate}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        style={{
          rotateX: animate ? rotateX : 0,
          rotateY: animate ? rotateY : 0,
          cursor: animate ? 'grab' : 'default',
        }}
        className="relative"
      >
        {/* Shadow Layer */}
        <motion.div
          className="absolute inset-0 rounded-full opacity-30"
          style={{
            x: shadowX,
            y: shadowY,
            filter: 'blur(20px)',
            background: 'radial-gradient(circle, rgba(0,0,0,0.3) 0%, transparent 70%)',
          }}
        />

        {/* Image Container */}
        <motion.div
          className="relative z-10"
          animate={{
            filter: currentMood === 'celebrate' 
              ? ["brightness(1) saturate(1)", "brightness(1.2) saturate(1.4)", "brightness(1) saturate(1)"]
              : "brightness(1) saturate(1)",
          }}
          transition={{
            duration: 1.5,
            repeat: currentMood === 'celebrate' ? Infinity : 0,
          }}
        >
          <img
            src={KATYA_IMAGES[currentMood]}
            alt="Katya mascot"
            className="w-full h-full object-contain select-none"
            draggable={false}
            style={{
              filter: 'drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3))',
            }}
          />
          
          {/* Breathing effect */}
          {config.breath && <BreathingOverlay />}
          
          {/* Blinking eyes */}
          {animate && <BlinkingEyes />}
        </motion.div>

        {/* Particles */}
        {animate && config.particles.map((particleGroup, groupIndex) => 
          Array.from({ length: particleGroup.count }).map((_, i) => {
            const angle = (i / particleGroup.count) * Math.PI * 2;
            const distance = 80 + Math.random() * 40;
            return (
              <Particle
                key={`${groupIndex}-${i}`}
                delay={i * 0.2 + groupIndex * 0.3}
                duration={2 + Math.random() * 2}
                x={Math.cos(angle) * distance}
                y={Math.sin(angle) * distance}
                emoji={particleGroup.emoji}
                type={particleGroup.type}
              />
            );
          })
        )}
      </motion.div>

      {/* Message Bubble */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 z-20"
          >
            <motion.div
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative"
            >
              {/* Glow behind bubble */}
              <motion.div
                className="absolute inset-0 rounded-2xl"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
                style={{
                  background: config.glow,
                  filter: 'blur(15px)',
                }}
              />
              
              {/* Message content */}
              <div 
                className="relative bg-card text-card-foreground px-6 py-3 rounded-2xl shadow-lg border-2"
                style={{ 
                  borderColor: config.color,
                  maxWidth: '200px',
                }}
              >
                <motion.p 
                  className="text-sm font-medium text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, staggerChildren: 0.02 }}
                >
                  {message.split('').map((char, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </motion.p>
                
                {/* Tail */}
                <div 
                  className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 rotate-45"
                  style={{ 
                    backgroundColor: config.color,
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnimatedKatyaV2;
