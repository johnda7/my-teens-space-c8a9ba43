// frontend/src/components/GameLesson/GameLessonInterface.tsx
import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Sparkles, Cloud } from '@react-three/drei'
import confetti from 'canvas-confetti'
import { useTelegram } from '@/hooks/useTelegram'

// Звуковые эффекты (отключены пока нет файлов)
const sounds = {
  correct: { play: () => console.log('correct sound') },
  wrong: { play: () => console.log('wrong sound') },
  levelUp: { play: () => console.log('levelup sound') },
  click: { play: () => console.log('click sound') },
  ambient: { play: () => console.log('ambient sound'), stop: () => {} }
}

// 3D Замок (Three.js компонент)
const Castle3D = ({ progress }: { progress: number }) => {
  const meshRef = useRef<any>()
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  return (
    <group>
      {/* Облака на фоне */}
      <Cloud position={[-4, 3, -5]} speed={0.2} opacity={0.5} />
      <Cloud position={[4, 2, -5]} speed={0.1} opacity={0.3} />
      
      {/* Искры вокруг замка */}
      <Sparkles 
        count={50} 
        scale={10} 
        size={2} 
        speed={0.5}
        color="#8b5cf6"
      />
      
      {/* Парящий текст */}
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <mesh ref={meshRef}>
          <boxGeometry args={[2, 2, 2]} />
          <meshNormalMaterial />
        </mesh>
      </Float>
      
      {/* Прогресс бар в 3D */}
      <mesh position={[0, -2, 0]}>
        <boxGeometry args={[progress * 5, 0.3, 0.3]} />
        <meshStandardMaterial color="#58cc02" emissive="#58cc02" emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}

// Анимированная Катя (используем PNG вместо Lottie)
const KatyaAnimated = ({ 
  mood, 
  message, 
  onComplete 
}: { 
  mood: string
  message: string
  onComplete?: () => void 
}) => {
  const { hapticFeedback } = useTelegram()
  
  // Используем существующие PNG изображения Кати
  const katyaImages = {
    idle: '/katya-mascot.png',
    talking: '/katya-mascot.png',
    celebrating: '/katya-celebrate.png',
    thinking: '/katya-thinking.png',
    support: '/katya-support.png'
  }

  useEffect(() => {
    if (onComplete && mood !== 'idle') {
      const timer = setTimeout(onComplete, 2000)
      return () => clearTimeout(timer)
    }
  }, [mood, onComplete])

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
      {/* PNG изображение Кати с анимацией */}
      <div className="relative w-48 h-48">
        <motion.img
          src={katyaImages[mood as keyof typeof katyaImages] || katyaImages.idle}
          alt="Katya"
          className="w-full h-full object-contain"
          animate={mood === 'celebrating' ? {
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          } : mood === 'thinking' ? {
            x: [0, -5, 5, 0]
          } : {}}
          transition={{ duration: 0.5, repeat: mood === 'idle' ? Infinity : 0 }}
        />
        
        {/* Эффект свечения вокруг Кати */}
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
      </div>

      {/* Сообщение в красивом пузыре */}
      <motion.div
        className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-md rounded-2xl px-6 py-3 shadow-xl min-w-[200px]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="text-gray-800 font-medium text-center">
          {message}
        </div>
        
        {/* Хвостик пузыря */}
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white/90 rotate-45" />
      </motion.div>
    </motion.div>
  )
}

// Мини-игра: Построение стены границ
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
  }>>([])
  
  const [score, setScore] = useState(0)
  const { hapticFeedback } = useTelegram()
  
  // Драг-н-дроп логика
  const handleDrop = (blockId: string, dropZone: string) => {
    hapticFeedback('medium')
    sounds.click.play()
    
    setBlocks(prev => prev.map(block => 
      block.id === blockId 
        ? { ...block, placed: true, x: parseInt(dropZone) * 100, y: 300 }
        : block
    ))
    
    setScore(prev => prev + 10)
    
    // Проверяем завершение
    if (blocks.filter(b => b.placed).length === blocks.length - 1) {
      sounds.levelUp.play()
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
      setTimeout(() => onComplete(score + 10), 1000)
    }
  }

  useEffect(() => {
    // Инициализация блоков
    setBlocks([
      { id: '1', type: 'physical', x: 50, y: 50, placed: false },
      { id: '2', type: 'emotional', x: 150, y: 50, placed: false },
      { id: '3', type: 'time', x: 250, y: 50, placed: false },
    ])
  }, [])

  return (
    <div className="relative h-[400px] bg-gradient-to-b from-purple-100 to-pink-100 rounded-xl p-4">
      <h3 className="text-center text-xl font-bold mb-4">
        Построй стену своих границ! 🏗️
      </h3>
      
      {/* Блоки для перетаскивания */}
      <div className="flex gap-4 justify-center">
        {blocks.filter(b => !b.placed).map(block => (
          <motion.div
            key={block.id}
            className={`
              w-20 h-20 rounded-lg cursor-move flex items-center justify-center
              ${block.type === 'physical' ? 'bg-purple-500' : ''}
              ${block.type === 'emotional' ? 'bg-pink-500' : ''}
              ${block.type === 'time' ? 'bg-blue-500' : ''}
            `}
            drag
            dragSnapToOrigin
            whileDrag={{ scale: 1.2 }}
            onDragEnd={(e, info) => {
              // Простая логика дропа
              if (info.point.y > 250) {
                handleDrop(block.id, '1')
              }
            }}
          >
            <span className="text-white text-2xl">
              {block.type === 'physical' ? '🛡️' : ''}
              {block.type === 'emotional' ? '❤️' : ''}
              {block.type === 'time' ? '⏰' : ''}
            </span>
          </motion.div>
        ))}
      </div>
      
      {/* Зона для постройки стены */}
      <div className="absolute bottom-4 left-4 right-4 h-32 border-4 border-dashed border-purple-300 rounded-lg flex items-center justify-center">
        {blocks.filter(b => b.placed).map(block => (
          <motion.div
            key={block.id}
            className="w-20 h-20 rounded-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              backgroundColor: 
                block.type === 'physical' ? '#8b5cf6' :
                block.type === 'emotional' ? '#ec4899' : '#3b82f6'
            }}
          />
        ))}
        
        {blocks.filter(b => b.placed).length === 0 && (
          <p className="text-gray-400">Перетащи блоки сюда</p>
        )}
      </div>
      
      {/* Счет */}
      <div className="absolute top-4 right-4 bg-white rounded-full px-4 py-2 shadow-lg">
        <span className="font-bold text-purple-600">Очки: {score}</span>
      </div>
    </div>
  )
}

// Главный компонент игрового урока
export const GameLessonInterface: React.FC<{
  lesson: any
  onComplete: (data: any) => void
}> = ({ lesson, onComplete }) => {
  const [stage, setStage] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [showMinigame, setShowMinigame] = useState(false)
  const [totalScore, setTotalScore] = useState(0)
  const { hapticFeedback, notificationFeedback, showMainButton, hideMainButton } = useTelegram()

  useEffect(() => {
    // Запускаем фоновую музыку
    sounds.ambient.play()
    
    return () => {
      sounds.ambient.stop()
    }
  }, [])

  const handleStageComplete = () => {
    hapticFeedback('light')
    
    if (stage < 3) { // Предполагаем 4 стадии
      setStage(stage + 1)
    } else {
      // Урок завершен
      notificationFeedback('success')
      sounds.levelUp.play()
      
      // Эпичное конфетти
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

      onComplete({
        score: totalScore,
        answers,
        xp_earned: 100,
        gems_earned: 10
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600 overflow-hidden">
      {/* 3D Фон с замком */}
      <div className="absolute inset-0 opacity-50">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Castle3D progress={(stage + 1) / 4} />
        </Canvas>
      </div>

      {/* Основной контент */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Прогресс бар урока */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-white/20 backdrop-blur-md rounded-full h-4 overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-green-400 to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${((stage + 1) / 4) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-white text-center mt-2 font-medium">
            Этап {stage + 1} из 4
          </p>
        </motion.div>

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
                className="mt-8 px-8 py-4 bg-white text-purple-600 font-bold rounded-full shadow-2xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  sounds.click.play()
                  handleStageComplete()
                }}
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
                      w-full p-4 rounded-xl text-left font-medium
                      ${answers.q1 === option 
                        ? 'bg-purple-500 text-white' 
                        : 'bg-purple-100 hover:bg-purple-200 text-purple-800'
                      }
                    `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      hapticFeedback('light')
                      sounds.click.play()
                      setAnswers({ ...answers, q1: option })
                      
                      if (option === 'Правила о том, что для нас ок, а что нет') {
                        sounds.correct.play()
                        notificationFeedback('success')
                        setTotalScore(prev => prev + 25)
                        setTimeout(handleStageComplete, 1000)
                      } else {
                        sounds.wrong.play()
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
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
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

          {/* Стадия 4: Рефлексия */}
          {stage === 3 && (
            <motion.div
              key="stage-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <KatyaAnimated 
                mood="celebrating"
                message="Ты молодец! Заработал 100 XP! 🎉"
              />
              
              <motion.div
                className="mt-8 bg-white/90 backdrop-blur-md rounded-2xl p-6 max-w-md mx-auto"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="text-xl font-bold mb-4">Твои достижения:</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>🎯 Очки:</span>
                    <span className="font-bold">{totalScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>⭐ XP:</span>
                    <span className="font-bold">+100</span>
                  </div>
                  <div className="flex justify-between">
                    <span>💎 Кристаллы:</span>
                    <span className="font-bold">+10</span>
                  </div>
                </div>
                
                <motion.button
                  className="mt-6 w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleStageComplete}
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
