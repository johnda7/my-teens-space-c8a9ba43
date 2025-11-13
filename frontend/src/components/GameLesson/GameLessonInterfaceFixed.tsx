// frontend/src/components/GameLesson/GameLessonInterfaceFixed.tsx
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useTelegram } from '@/hooks/useTelegram'

// CSS 3D Замок вместо Three.js
const Castle3D = ({ progress }: { progress: number }) => {
  return (
    <motion.div 
      className="relative w-full h-64 perspective-1000"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, type: "spring" }}
    >
      {/* Фон с градиентом */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900 via-purple-700 to-pink-600 rounded-3xl overflow-hidden">
        {/* Анимированные облака */}
        <motion.div
          className="absolute top-10 left-10 w-24 h-12 bg-white/20 rounded-full blur-xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -10, 0],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-20 right-10 w-32 h-16 bg-white/15 rounded-full blur-xl"
          animate={{
            x: [0, -30, 0],
            y: [0, 10, 0],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        
        {/* Звезды/искры */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-yellow-300 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 60}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
        
        {/* 3D Замок с CSS transforms */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{
            rotateY: [0, 5, 0, -5, 0],
          }}
          transition={{ duration: 6, repeat: Infinity }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Основание замка */}
          <div className="relative">
            {/* Стены */}
            <motion.div 
              className="w-32 h-24 bg-gradient-to-b from-purple-400 to-purple-600 rounded-t-lg shadow-2xl"
              style={{ transform: 'rotateX(5deg)' }}
            />
            
            {/* Башни */}
            <motion.div 
              className="absolute -left-4 bottom-0 w-8 h-32 bg-gradient-to-b from-purple-300 to-purple-500 rounded-t-full"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.div 
              className="absolute -right-4 bottom-0 w-8 h-32 bg-gradient-to-b from-purple-300 to-purple-500 rounded-t-full"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
            />
            
            {/* Центральная башня */}
            <motion.div 
              className="absolute left-1/2 -translate-x-1/2 bottom-6 w-12 h-20 bg-gradient-to-b from-pink-300 to-pink-500 rounded-t-full"
              animate={{ 
                y: [0, -3, 0],
                rotate: [0, 1, 0, -1, 0]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              {/* Флаг */}
              <motion.div
                className="absolute -top-4 left-1/2 w-8 h-6 bg-gradient-to-r from-red-500 to-pink-500"
                style={{ clipPath: 'polygon(0 0, 100% 0, 80% 50%, 100% 100%, 0 100%)' }}
                animate={{ rotateY: [0, 180, 360] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </motion.div>
            
            {/* Ворота */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-10 bg-purple-900 rounded-t-full" />
          </div>
        </motion.div>
        
        {/* Прогресс бар внизу */}
        <div className="absolute bottom-2 left-4 right-4 h-2 bg-white/20 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg"
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </motion.div>
  )
}

// Анимированная Катя с CSS анимациями
const KatyaAnimated = ({ 
  mood = 'default', 
  message = '', 
  onComplete 
}: { 
  mood: string
  message: string
  onComplete?: () => void 
}) => {
  const katyaImages: Record<string, string> = {
    default: '/katya-mascot.png',
    idle: '/katya-mascot.png',
    talking: '/katya-mascot.png',
    celebrating: '/katya-celebrate.png',
    thinking: '/katya-thinking.png',
    support: '/katya-support.png'
  }

  const currentImage = katyaImages[mood] || katyaImages.default

  useEffect(() => {
    if (onComplete && mood !== 'idle') {
      const timer = setTimeout(onComplete, 2000)
      return () => clearTimeout(timer)
    }
  }, [mood, onComplete])

  // Определяем анимацию в зависимости от настроения
  const getAnimation = () => {
    switch(mood) {
      case 'celebrating':
        return {
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
          y: [0, -10, 0]
        }
      case 'thinking':
        return {
          rotate: [0, -2, 2, -2, 0],
          x: [0, -5, 5, 0]
        }
      case 'talking':
        return {
          scale: [1, 1.02, 1],
          y: [0, -2, 0]
        }
      default:
        return {
          y: [0, -5, 0],
          scale: [1, 1.01, 1]
        }
    }
  }

  return (
    <motion.div 
      className="relative"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 260, 
        damping: 20 
      }}
    >
      {/* Контейнер для Кати с анимацией */}
      <motion.div
        className="relative w-48 h-48 mx-auto"
        animate={getAnimation()}
        transition={{ 
          duration: mood === 'celebrating' ? 0.5 : 2,
          repeat: mood === 'celebrating' ? 3 : Infinity,
          onComplete: mood === 'celebrating' ? onComplete : undefined
        }}
      >
        {/* Эффект свечения */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: [
              '0 0 20px rgba(139, 92, 246, 0.3)',
              '0 0 40px rgba(139, 92, 246, 0.6)',
              '0 0 20px rgba(139, 92, 246, 0.3)',
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        {/* Изображение Кати */}
        <img 
          src={currentImage} 
          alt="Катя" 
          className="w-full h-full object-contain relative z-10"
        />
        
        {/* Эмоциональные частицы вокруг Кати */}
        {mood === 'celebrating' && (
          <>
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute top-1/2 left-1/2 w-2 h-2 bg-yellow-400 rounded-full"
                initial={{ x: 0, y: 0, scale: 0 }}
                animate={{
                  x: Math.cos(i * Math.PI / 4) * 80,
                  y: Math.sin(i * Math.PI / 4) * 80,
                  scale: [0, 1, 0],
                  opacity: [1, 0]
                }}
                transition={{
                  duration: 1,
                  repeat: 3,
                  delay: i * 0.1
                }}
              />
            ))}
          </>
        )}
      </motion.div>

      {/* Сообщение в красивом пузыре */}
      {message && (
        <motion.div
          className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-md rounded-2xl px-6 py-3 shadow-2xl min-w-[200px] max-w-xs"
          initial={{ opacity: 0, y: -20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          <div className="text-gray-800 font-medium text-center">
            {message}
          </div>
          
          {/* Анимированный хвостик пузыря */}
          <motion.div 
            className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white/95 rotate-45"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      )}
    </motion.div>
  )
}

// Мини-игра: Построение стены границ с физикой
const BoundaryWallMinigame = ({ 
  onComplete 
}: { 
  onComplete: (score: number) => void 
}) => {
  const [blocks, setBlocks] = useState<Array<{
    id: string
    type: 'physical' | 'emotional' | 'time'
    x: number
    y: number
    placed: boolean
    color: string
    icon: string
  }>>([])
  
  const [score, setScore] = useState(0)
  const [placedBlocks, setPlacedBlocks] = useState<string[]>([])
  const { hapticFeedback } = useTelegram()

  useEffect(() => {
    // Инициализация блоков
    setBlocks([
      { id: '1', type: 'physical', x: 50, y: 50, placed: false, color: 'from-purple-400 to-purple-600', icon: '🛡️' },
      { id: '2', type: 'emotional', x: 150, y: 50, placed: false, color: 'from-pink-400 to-pink-600', icon: '❤️' },
      { id: '3', type: 'time', x: 250, y: 50, placed: false, color: 'from-blue-400 to-blue-600', icon: '⏰' },
    ])
  }, [])

  const handleDrop = (blockId: string) => {
    hapticFeedback('medium')
    
    setBlocks(prev => prev.map(block => 
      block.id === blockId 
        ? { ...block, placed: true }
        : block
    ))
    
    setPlacedBlocks(prev => [...prev, blockId])
    setScore(prev => prev + 30)
    
    // Проверяем завершение
    if (placedBlocks.length === 2) { // Это будет третий блок
      setTimeout(() => {
        hapticFeedback('heavy')
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
        onComplete(score + 30)
      }, 500)
    }
  }

  return (
    <motion.div 
      className="relative h-[400px] bg-gradient-to-b from-purple-100 to-pink-100 rounded-3xl p-6 overflow-hidden"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      {/* Фоновая анимация */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-32 h-32 bg-purple-300 rounded-full blur-3xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, 30, 0],
              y: [0, -30, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <h3 className="text-center text-2xl font-bold mb-6 relative z-10">
        Построй стену своих границ! 🏗️
      </h3>
      
      {/* Блоки для перетаскивания */}
      <div className="flex gap-4 justify-center relative z-10 mb-8">
        {blocks.filter(b => !b.placed).map(block => (
          <motion.div
            key={block.id}
            className={`w-24 h-24 bg-gradient-to-br ${block.color} rounded-2xl cursor-move flex items-center justify-center shadow-lg`}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 1.2 }}
            drag
            dragSnapToOrigin
            dragElastic={0.2}
            onDragEnd={(e, info) => {
              // Если перетащили в зону стройки
              if (info.point.y > 250) {
                handleDrop(block.id)
              }
            }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: parseInt(block.id) * 0.1 }}
          >
            <span className="text-4xl">{block.icon}</span>
          </motion.div>
        ))}
      </div>
      
      {/* Зона для постройки стены */}
      <motion.div 
        className="absolute bottom-4 left-4 right-4 h-32 border-4 border-dashed border-purple-300 rounded-2xl flex items-center justify-center bg-white/50 backdrop-blur"
        animate={{
          borderColor: placedBlocks.length > 0 ? '#9333ea' : '#d8b4fe',
        }}
      >
        <div className="flex gap-2">
          {placedBlocks.map((blockId, index) => {
            const block = blocks.find(b => b.id === blockId)
            return block ? (
              <motion.div
                key={blockId}
                className={`w-20 h-20 bg-gradient-to-br ${block.color} rounded-xl flex items-center justify-center shadow-xl`}
                initial={{ scale: 0, rotate: 180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring",
                  delay: index * 0.1,
                  stiffness: 200
                }}
              >
                <span className="text-3xl">{block.icon}</span>
              </motion.div>
            ) : null
          })}
        </div>
        
        {placedBlocks.length === 0 && (
          <motion.p 
            className="text-gray-500 font-medium"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Перетащи блоки сюда ⬇️
          </motion.p>
        )}
      </motion.div>
      
      {/* Счет с анимацией */}
      <motion.div 
        className="absolute top-4 right-4 bg-white rounded-full px-6 py-3 shadow-xl"
        animate={{ scale: score > 0 ? [1, 1.2, 1] : 1 }}
        transition={{ duration: 0.3 }}
      >
        <span className="font-bold text-purple-600 text-lg">Очки: {score}</span>
      </motion.div>
    </motion.div>
  )
}

// Главный компонент игрового урока
export const GameLessonInterfaceFixed: React.FC<{
  lesson: any
  onComplete: (data: { xp_earned: number }) => void
}> = ({ lesson, onComplete }) => {
  const [stage, setStage] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [totalScore, setTotalScore] = useState(0)
  const { hapticFeedback, notificationFeedback } = useTelegram()

  const handleStageComplete = () => {
    hapticFeedback('light')
    
    if (stage < 3) {
      setStage(stage + 1)
    } else {
      // Урок завершен
      notificationFeedback('success')
      
      // Эпичное конфетти финал
      const duration = 3 * 1000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min
      }

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        })
      }, 250)

      // Вызываем onComplete с XP
      const xpEarned = Math.round((totalScore / 100) * (lesson.xp || 50))
      setTimeout(() => {
        onComplete({ xp_earned: xpEarned })
      }, 3500)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600 overflow-hidden">
      {/* CSS 3D Замок вместо Three.js */}
      <Castle3D progress={(stage + 1) / 4} />

      {/* Основной контент */}
      <div className="relative z-10 container mx-auto px-4 py-4">
        <AnimatePresence mode="wait">
          {/* Стадия 1: Введение с Катей */}
          {stage === 0 && (
            <motion.div
              key="stage-0"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center"
            >
              <KatyaAnimated 
                mood="talking"
                message="Привет! Сегодня мы изучаем границы! 🏰"
              />
              
              <motion.button
                className="mt-8 px-8 py-4 bg-white text-purple-600 font-bold rounded-full shadow-2xl text-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStageComplete}
              >
                Начать приключение! ✨
              </motion.button>
            </motion.div>
          )}

          {/* Стадия 2: Интерактивный вопрос */}
          {stage === 1 && (
            <motion.div
              key="stage-1"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="bg-white/90 backdrop-blur-md rounded-3xl p-8 max-w-2xl mx-auto shadow-2xl"
            >
              <h2 className="text-2xl font-bold mb-6 text-center">
                🤔 Что такое личные границы?
              </h2>
              
              <div className="space-y-4">
                {[
                  'Стены, которые мы строим от других',
                  'Правила о том, что для нас ок, а что нет',
                  'Способ контролировать других',
                  'Отказ от общения'
                ].map((option, index) => (
                  <motion.button
                    key={index}
                    className={`
                      w-full p-4 rounded-xl text-left font-medium transition-all
                      ${answers.q1 === option 
                        ? 'bg-purple-500 text-white shadow-lg' 
                        : 'bg-purple-100 hover:bg-purple-200 text-purple-800'
                      }
                    `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => {
                      hapticFeedback('light')
                      setAnswers({ ...answers, q1: option })
                      
                      if (option === 'Правила о том, что для нас ок, а что нет') {
                        notificationFeedback('success')
                        setTotalScore(prev => prev + 25)
                        setTimeout(handleStageComplete, 1000)
                      } else {
                        notificationFeedback('error')
                      }
                    }}
                  >
                    <span className="text-lg">{option}</span>
                  </motion.button>
                ))}
              </div>
              
              {answers.q1 === 'Правила о том, что для нас ок, а что нет' && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="mt-6 p-4 bg-green-100 rounded-xl"
                >
                  <p className="text-green-800 font-medium">
                    ✅ Правильно! Границы - это наши личные правила!
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Стадия 3: Мини-игра */}
          {stage === 2 && (
            <motion.div
              key="stage-2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <BoundaryWallMinigame 
                onComplete={(score) => {
                  setTotalScore(prev => prev + score)
                  handleStageComplete()
                }}
              />
            </motion.div>
          )}

          {/* Стадия 4: Рефлексия и награды */}
          {stage === 3 && (
            <motion.div
              key="stage-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <KatyaAnimated 
                mood="celebrating"
                message="Ты молодец! Заработал XP! 🎉"
              />
              
              <motion.div
                className="mt-8 bg-white/90 backdrop-blur-md rounded-2xl p-6 max-w-md mx-auto"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="text-xl font-bold mb-4">Твои достижения:</h3>
                <div className="space-y-3">
                  <motion.div 
                    className="flex justify-between items-center"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <span className="text-lg">🎯 Очки:</span>
                    <motion.span 
                      className="font-bold text-lg"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ delay: 0.8 }}
                    >
                      {totalScore}
                    </motion.span>
                  </motion.div>
                  <motion.div 
                    className="flex justify-between items-center"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.9 }}
                  >
                    <span className="text-lg">⭐ XP:</span>
                    <motion.span 
                      className="font-bold text-lg"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ delay: 1 }}
                    >
                      +{Math.round((totalScore / 100) * (lesson.xp || 50))}
                    </motion.span>
                  </motion.div>
                  <motion.div 
                    className="flex justify-between items-center"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.1 }}
                  >
                    <span className="text-lg">💎 Кристаллы:</span>
                    <motion.span 
                      className="font-bold text-lg"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ delay: 1.2 }}
                    >
                      +10
                    </motion.span>
                  </motion.div>
                </div>
                
                <motion.button
                  className="mt-6 w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleStageComplete}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.3 }}
                >
                  Завершить урок ✨
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
