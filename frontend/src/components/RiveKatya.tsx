// frontend/src/components/RiveKatya.tsx
import React, { useEffect } from 'react'
import { useRive, UseRiveParameters, Layout, Fit, Alignment } from '@rive-app/react-canvas'
import { motion } from 'framer-motion'

interface RiveKatyaProps {
  mood?: 'default' | 'celebrate' | 'thinking' | 'support' | 'bounce' | 'shake'
  message?: string
  showBubble?: boolean
  className?: string
}

export const RiveKatya: React.FC<RiveKatyaProps> = ({
  mood = 'default',
  message = '',
  showBubble = true,
  className = ''
}) => {
  // Настройки Rive анимации
  const riveParams: UseRiveParameters = {
    src: '/my-teens-space-c8a9ba43/katya.riv',
    autoplay: true,
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
    onLoadError: (error) => {
      console.error('Ошибка загрузки Rive:', error)
    },
    onLoad: () => {
      console.log('✅ Rive анимация загружена успешно!')
    }
  }

  const { RiveComponent, rive } = useRive(riveParams)

  useEffect(() => {
    if (rive) {
      console.log('Rive объект создан:', rive)
      // Здесь можно управлять анимациями через state machine
    }
  }, [rive])

  // Анимация для разных настроений
  const getAnimationVariants = () => {
    switch (mood) {
      case 'celebrate':
        return {
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
          transition: { duration: 0.5, repeat: 2 }
        }
      case 'bounce':
        return {
          y: [0, -20, 0],
          transition: { duration: 0.6, repeat: Infinity }
        }
      case 'shake':
        return {
          x: [0, -10, 10, -10, 10, 0],
          transition: { duration: 0.5 }
        }
      case 'thinking':
        return {
          rotate: [-2, 2, -2],
          transition: { duration: 2, repeat: Infinity }
        }
      default:
        return {
          y: [0, -5, 0],
          transition: { duration: 3, repeat: Infinity }
        }
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Светящаяся аура */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255, 182, 193, 0.3) 0%, transparent 70%)',
          filter: 'blur(20px)',
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      {/* Rive анимация */}
      <motion.div
        className="relative z-10 w-full h-full"
        animate={getAnimationVariants()}
      >
        <RiveComponent />
      </motion.div>

      {/* Сообщение в облачке */}
      {showBubble && message && (
        <motion.div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 min-w-[200px] max-w-xs"
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          <div className="relative bg-white rounded-2xl px-4 py-3 shadow-xl">
            <p className="text-gray-800 font-medium text-center text-sm">
              {message}
            </p>
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45" />
          </div>
        </motion.div>
      )}

      {/* Эмоциональные сердечки при праздновании */}
      {mood === 'celebrate' && (
        <>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute top-1/2 left-1/2 text-2xl"
              initial={{ x: 0, y: 0, scale: 0 }}
              animate={{
                x: Math.cos(i * 60 * Math.PI / 180) * 60,
                y: Math.sin(i * 60 * Math.PI / 180) * 60,
                scale: [0, 1, 0],
                opacity: [1, 0],
              }}
              transition={{
                duration: 1,
                repeat: 2,
                delay: i * 0.1,
              }}
            >
              💜
            </motion.div>
          ))}
        </>
      )}
    </div>
  )
}
