// frontend/src/components/GameLesson/GameLessonPro.tsx
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useTelegram } from '@/hooks/useTelegram'

// 🏰 ЭПИЧНЫЙ 3D ЗАМОК С ПАРАЛЛАКСОМ
const EpicCastle = ({ progress }: { progress: number }) => {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  const rotateX = useTransform(mouseY, [-300, 300], [5, -5])
  const rotateY = useTransform(mouseX, [-300, 300], [-5, 5])

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left - rect.width / 2)
    mouseY.set(e.clientY - rect.top - rect.height / 2)
  }

  return (
    <motion.div 
      className="relative w-full h-80 rounded-3xl overflow-hidden cursor-move"
      onMouseMove={handleMouseMove}
      style={{
        perspective: 2000,
        background: 'linear-gradient(180deg, #1a0033 0%, #2d1b69 50%, #573b8a 100%)',
      }}
    >
      {/* Звездное небо с анимацией */}
      <div className="absolute inset-0">
        {[...Array(100)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 60}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, Math.random() * 2 + 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Луна с свечением */}
      <motion.div
        className="absolute top-10 right-10 w-20 h-20 rounded-full"
        style={{
          background: 'radial-gradient(circle, #fff9e6 0%, #ffeb99 50%, transparent 100%)',
          boxShadow: '0 0 60px 20px rgba(255, 235, 153, 0.5)',
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      {/* Облака параллакс */}
      <motion.div
        className="absolute inset-0"
        style={{ rotateX, rotateY }}
      >
        {[
          { size: 'w-40 h-20', x: '-10%', y: '20%', z: 100, opacity: 0.3 },
          { size: 'w-32 h-16', x: '60%', y: '15%', z: 200, opacity: 0.2 },
          { size: 'w-48 h-24', x: '30%', y: '35%', z: 150, opacity: 0.25 },
        ].map((cloud, i) => (
          <motion.div
            key={i}
            className={`absolute ${cloud.size} rounded-full`}
            style={{
              left: cloud.x,
              top: cloud.y,
              background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              backdropFilter: 'blur(10px)',
              transform: `translateZ(${cloud.z}px)`,
              opacity: cloud.opacity,
            }}
            animate={{
              x: [0, 30, 0],
              y: [0, -10, 0],
            }}
            transition={{
              duration: 15 + i * 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>

      {/* 3D Замок с тенями и светом */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2"
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Основание замка с градиентом */}
        <motion.div
          className="relative"
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Главная башня */}
          <div className="relative">
            <motion.div
              className="w-48 h-40 mx-auto"
              style={{
                background: 'linear-gradient(180deg, #8b5cf6 0%, #6d28d9 50%, #4c1d95 100%)',
                clipPath: 'polygon(20% 100%, 10% 60%, 10% 30%, 0% 30%, 15% 0%, 85% 0%, 100% 30%, 90% 30%, 90% 60%, 80% 100%)',
                boxShadow: 'inset 0 10px 30px rgba(255,255,255,0.2), 0 20px 60px rgba(0,0,0,0.5)',
                transform: 'translateZ(50px)',
              }}
            />
            
            {/* Окна с светом */}
            {[
              { left: '25%', top: '40%' },
              { left: '65%', top: '40%' },
              { left: '45%', top: '60%' },
            ].map((window, i) => (
              <motion.div
                key={i}
                className="absolute w-4 h-6 rounded-t-full"
                style={{
                  left: window.left,
                  top: window.top,
                  background: 'linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%)',
                  boxShadow: '0 0 20px 5px rgba(251, 191, 36, 0.6)',
                }}
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2 + i,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
            
            {/* Флаг на башне */}
            <motion.div
              className="absolute -top-8 left-1/2 -translate-x-1/2"
              animate={{
                rotate: [0, 10, 0, -10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
            >
              <div className="w-1 h-12 bg-gray-700" />
              <motion.div
                className="absolute top-0 left-1 w-8 h-5"
                style={{
                  background: 'linear-gradient(90deg, #dc2626 0%, #ef4444 100%)',
                  clipPath: 'polygon(0 0, 100% 0, 85% 50%, 100% 100%, 0 100%)',
                }}
                animate={{
                  scaleX: [1, 1.1, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                }}
              />
            </motion.div>
          </div>

          {/* Боковые башни */}
          {[-80, 80].map((x, i) => (
            <motion.div
              key={i}
              className="absolute bottom-0 w-16 h-32"
              style={{
                left: `calc(50% + ${x}px)`,
                background: 'linear-gradient(180deg, #7c3aed 0%, #5b21b6 100%)',
                clipPath: 'polygon(30% 100%, 20% 60%, 20% 20%, 0% 20%, 50% 0%, 100% 20%, 80% 20%, 80% 60%, 70% 100%)',
                transform: `translateZ(${30 - i * 10}px)`,
                boxShadow: '0 15px 40px rgba(0,0,0,0.4)',
              }}
              animate={{
                y: [0, -3, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            />
          ))}

          {/* Ворота */}
          <motion.div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-16 bg-black/50 rounded-t-full"
            style={{
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
            }}
            whileHover={{
              scale: 1.05,
              boxShadow: 'inset 0 0 30px rgba(139, 92, 246, 0.5)',
            }}
          />
        </motion.div>
      </motion.div>

      {/* Прогресс бар в виде моста */}
      <div className="absolute bottom-4 left-8 right-8 h-3 bg-black/30 rounded-full overflow-hidden">
        <motion.div
          className="h-full relative overflow-hidden"
          style={{
            background: 'linear-gradient(90deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
            }}
            animate={{
              x: [-100, 200],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
        </motion.div>
      </div>

      {/* Текст прогресса */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white font-bold text-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Прогресс: {Math.round(progress * 100)}%
      </motion.div>
    </motion.div>
  )
}

// 💜 УЛУЧШЕННАЯ КАТЯ С ЭМОЦИЯМИ И ФИЗИКОЙ
const SuperKatya = ({ mood = 'default', message = '', onComplete }: any) => {
  const katyaImages: Record<string, string> = {
    default: '/katya-mascot.png',
    celebrating: '/katya-celebrate.png',
    thinking: '/katya-thinking.png',
    support: '/katya-support.png',
  }

  const currentImage = katyaImages[mood] || katyaImages.default
  const springConfig = { stiffness: 300, damping: 20 }

  return (
    <motion.div className="relative">
      {/* Контейнер Кати с физикой */}
      <motion.div
        className="relative w-56 h-56 mx-auto"
        initial={{ scale: 0, rotate: -360 }}
        animate={{ 
          scale: 1, 
          rotate: 0,
          y: mood === 'celebrating' ? [0, -20, 0] : [0, -5, 0],
        }}
        transition={mood === 'celebrating' ? {
          scale: { type: "spring", ...springConfig },
          rotate: { duration: 0.8 },
          y: { duration: 0.5, repeat: 3 }
        } : {
          scale: { type: "spring", ...springConfig },
          y: { duration: 3, repeat: Infinity }
        }}
      >
        {/* Аура вокруг Кати */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: mood === 'celebrating' 
              ? 'radial-gradient(circle, rgba(251,191,36,0.3) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Частицы вокруг Кати */}
        {mood === 'celebrating' && (
          <>
            {[...Array(12)].map((_, i) => {
              const angle = (i * 30) * Math.PI / 180
              return (
                <motion.div
                  key={i}
                  className="absolute top-1/2 left-1/2"
                  initial={{ x: 0, y: 0, scale: 0 }}
                  animate={{
                    x: Math.cos(angle) * 100,
                    y: Math.sin(angle) * 100,
                    scale: [0, 1, 0],
                    opacity: [1, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: 3,
                    delay: i * 0.05,
                  }}
                >
                  <span className="text-2xl">
                    {['⭐', '✨', '💜', '🎉', '🌟'][i % 5]}
                  </span>
                </motion.div>
              )
            })}
          </>
        )}

        {/* Изображение Кати */}
        <motion.img 
          src={currentImage} 
          alt="Катя" 
          className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
          whileHover={{ scale: 1.05 }}
          drag={mood === 'default'}
          dragConstraints={{ left: -20, right: 20, top: -20, bottom: 20 }}
          dragElastic={0.2}
        />
      </motion.div>

      {/* Сообщение в стильном пузыре */}
      {message && (
        <motion.div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 min-w-[250px] max-w-sm"
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.3, type: "spring", ...springConfig }}
        >
          <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl px-6 py-4 shadow-2xl border border-purple-200">
            <p className="text-gray-800 font-medium text-center text-lg">
              {message}
            </p>
            
            {/* Типографские точки анимация */}
            <motion.div
              className="absolute -top-6 left-1/2 -translate-x-1/2 flex gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-purple-400 rounded-full"
                  animate={{
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

// 🎮 УЛУЧШЕННАЯ МИНИ-ИГРА С ФИЗИКОЙ
const SuperMinigame = ({ onComplete }: { onComplete: (score: number) => void }) => {
  const [blocks, setBlocks] = useState<any[]>([])
  const [score, setScore] = useState(0)
  const [placedBlocks, setPlacedBlocks] = useState<string[]>([])
  const [showSuccess, setShowSuccess] = useState(false)
  const { hapticFeedback } = useTelegram()

  useEffect(() => {
    setBlocks([
      { id: '1', type: 'physical', icon: '🛡️', color: 'from-purple-500 to-purple-700', name: 'Физические' },
      { id: '2', type: 'emotional', icon: '❤️', color: 'from-pink-500 to-pink-700', name: 'Эмоциональные' },
      { id: '3', type: 'time', icon: '⏰', color: 'from-blue-500 to-blue-700', name: 'Временные' },
      { id: '4', type: 'digital', icon: '💻', color: 'from-cyan-500 to-cyan-700', name: 'Цифровые' },
    ])
  }, [])

  const handleDrop = (blockId: string) => {
    hapticFeedback('medium')
    
    const block = blocks.find(b => b.id === blockId)
    if (!block || placedBlocks.includes(blockId)) return

    setPlacedBlocks([...placedBlocks, blockId])
    setScore(score + 25)

    // Эффект успеха
    confetti({
      particleCount: 20,
      spread: 30,
      origin: { y: 0.7 },
      colors: ['#8b5cf6', '#ec4899', '#3b82f6', '#06b6d4']
    })

    if (placedBlocks.length === 3) {
      setTimeout(() => {
        setShowSuccess(true)
        hapticFeedback('heavy')
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
        setTimeout(() => onComplete(100), 1500)
      }, 500)
    }
  }

  return (
    <motion.div 
      className="relative min-h-[500px] rounded-3xl p-6 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      {/* Фоновая анимация */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-64 h-64 bg-white rounded-full blur-3xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      <h2 className="text-3xl font-bold text-white text-center mb-8 relative z-10">
        🏗️ Построй стену своих границ!
      </h2>

      {/* Блоки для перетаскивания */}
      <div className="flex flex-wrap justify-center gap-4 mb-12 relative z-10">
        {blocks.filter(b => !placedBlocks.includes(b.id)).map((block, index) => (
          <motion.div
            key={block.id}
            className={`relative w-28 h-28 bg-gradient-to-br ${block.color} rounded-2xl cursor-move shadow-2xl`}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 1.2 }}
            drag
            dragSnapToOrigin
            dragElastic={0.3}
            onDragEnd={(e, info) => {
              if (info.point.y > 300) {
                handleDrop(block.id)
              }
            }}
          >
            <motion.div 
              className="absolute inset-0 flex flex-col items-center justify-center"
              animate={{
                rotate: [0, 5, 0, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: index * 0.2,
              }}
            >
              <span className="text-4xl mb-1">{block.icon}</span>
              <span className="text-white text-xs font-medium">{block.name}</span>
            </motion.div>

            {/* Эффект свечения */}
            <motion.div
              className="absolute inset-0 rounded-2xl"
              style={{
                background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
              }}
              animate={{
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Зона постройки стены */}
      <motion.div 
        className="relative h-40 mx-auto max-w-lg border-4 border-dashed border-white/50 rounded-3xl bg-white/10 backdrop-blur-md overflow-hidden"
        animate={{
          borderColor: placedBlocks.length > 0 ? '#ffffff' : 'rgba(255,255,255,0.5)',
        }}
      >
        {/* Сетка для размещения */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute h-full w-0.5 bg-white/30"
              style={{ left: `${(i + 1) * 25}%` }}
            />
          ))}
        </div>

        <div className="flex items-center justify-center h-full gap-3 relative z-10">
          {placedBlocks.map((blockId, index) => {
            const block = blocks.find(b => b.id === blockId)
            return block ? (
              <motion.div
                key={blockId}
                className={`w-24 h-24 bg-gradient-to-br ${block.color} rounded-xl shadow-2xl flex items-center justify-center`}
                initial={{ scale: 0, rotate: -180, y: -100 }}
                animate={{ scale: 1, rotate: 0, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: index * 0.1,
                }}
              >
                <motion.span 
                  className="text-3xl"
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 0.5,
                    delay: 0.3,
                  }}
                >
                  {block.icon}
                </motion.span>
              </motion.div>
            ) : null
          })}
          
          {placedBlocks.length === 0 && (
            <motion.p 
              className="text-white/70 font-medium text-lg"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Перетащи блоки сюда ⬇️
            </motion.p>
          )}
        </div>

        {/* Эффект построения */}
        {placedBlocks.length > 0 && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
              }}
              animate={{
                x: [-200, 200],
              }}
              transition={{
                duration: 1,
                repeat: 2,
              }}
            />
          </motion.div>
        )}
      </motion.div>

      {/* Счетчик очков */}
      <motion.div 
        className="absolute top-6 right-6 bg-white/95 backdrop-blur rounded-2xl px-6 py-3 shadow-2xl"
        animate={score > 0 ? { scale: [1, 1.1, 1] } : {}}
      >
        <span className="font-bold text-purple-600 text-xl">Очки: {score}</span>
      </motion.div>

      {/* Сообщение об успехе */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-8 text-center"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <span className="text-6xl">🎉</span>
              </motion.div>
              <h3 className="text-2xl font-bold mt-4">Отлично!</h3>
              <p className="text-gray-600 mt-2">Ты построил свои границы!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// 🎯 ГЛАВНЫЙ КОМПОНЕНТ ИГРОВОГО УРОКА
export const GameLessonPro: React.FC<{
  lesson: any
  onComplete: (data: { xp_earned: number }) => void
}> = ({ lesson, onComplete }) => {
  const [stage, setStage] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const { hapticFeedback, notificationFeedback } = useTelegram()

  const stages = [
    { type: 'intro', title: 'Введение' },
    { type: 'question', title: 'Вопрос' },
    { type: 'minigame', title: 'Игра' },
    { type: 'complete', title: 'Завершение' },
  ]

  const handleNextStage = () => {
    hapticFeedback('light')
    if (stage < stages.length - 1) {
      setStage(stage + 1)
    } else {
      const xpEarned = Math.round((totalScore / 125) * (lesson.xp || 50))
      setTimeout(() => {
        onComplete({ xp_earned: xpEarned })
      }, 500)
    }
  }

  const handleAnswer = (answer: string, isCorrect: boolean) => {
    setSelectedAnswer(answer)
    if (isCorrect) {
      hapticFeedback('medium')
      notificationFeedback('success')
      setTotalScore(totalScore + 25)
      confetti({
        particleCount: 30,
        spread: 40,
        origin: { y: 0.7 }
      })
      setTimeout(handleNextStage, 1500)
    } else {
      hapticFeedback('light')
      notificationFeedback('error')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* 3D Замок на фоне */}
      <EpicCastle progress={(stage + 1) / stages.length} />

      {/* Контент */}
      <div className="container mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {/* Стадия 1: Введение */}
          {stage === 0 && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="text-center"
            >
              <SuperKatya 
                mood="default"
                message="Привет! Сегодня мы изучаем личные границы! 🏰"
              />
              
              <motion.button
                className="mt-8 px-10 py-5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-full shadow-2xl text-xl"
                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(139, 92, 246, 0.4)' }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNextStage}
              >
                <span className="flex items-center gap-2">
                  Начать приключение
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </span>
              </motion.button>
            </motion.div>
          )}

          {/* Стадия 2: Вопрос */}
          {stage === 1 && (
            <motion.div
              key="question"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="max-w-2xl mx-auto"
            >
              <motion.div
                className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl"
                initial={{ rotateY: 180 }}
                animate={{ rotateY: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  🤔 Что такое личные границы?
                </h2>
                
                <div className="space-y-4">
                  {[
                    { text: 'Стены, которые мы строим от других', correct: false },
                    { text: 'Правила о том, что для нас ок, а что нет', correct: true },
                    { text: 'Способ контролировать других', correct: false },
                    { text: 'Отказ от общения', correct: false },
                  ].map((option, index) => (
                    <motion.button
                      key={index}
                      className={`
                        w-full p-5 rounded-2xl text-left font-medium text-lg transition-all
                        ${selectedAnswer === option.text 
                          ? option.correct
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                            : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                          : 'bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-purple-800'
                        }
                      `}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(option.text, option.correct)}
                      disabled={selectedAnswer !== null}
                    >
                      <span className="flex items-center gap-3">
                        <motion.span
                          className="text-2xl"
                          animate={selectedAnswer === option.text ? {
                            rotate: option.correct ? 360 : [-5, 5, -5, 5, 0]
                          } : {}}
                        >
                          {selectedAnswer === option.text 
                            ? option.correct ? '✅' : '❌'
                            : '🤔'
                          }
                        </motion.span>
                        {option.text}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Стадия 3: Мини-игра */}
          {stage === 2 && (
            <motion.div
              key="game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <SuperMinigame 
                onComplete={(score) => {
                  setTotalScore(totalScore + score)
                  handleNextStage()
                }}
              />
            </motion.div>
          )}

          {/* Стадия 4: Завершение */}
          {stage === 3 && (
            <motion.div
              key="complete"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <SuperKatya 
                mood="celebrating"
                message="Поздравляю! Ты отлично справился! 🎉"
              />
              
              <motion.div
                className="mt-8 bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-md mx-auto shadow-2xl"
                initial={{ scale: 0, rotate: -360 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <h3 className="text-2xl font-bold mb-6">Твои награды:</h3>
                
                <div className="space-y-4">
                  {[
                    { icon: '🎯', label: 'Очки', value: totalScore },
                    { icon: '⭐', label: 'XP', value: `+${Math.round((totalScore / 125) * (lesson.xp || 50))}` },
                    { icon: '💎', label: 'Кристаллы', value: '+10' },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      className="flex justify-between items-center bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4"
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.2 }}
                    >
                      <span className="flex items-center gap-3 text-lg">
                        <motion.span
                          className="text-3xl"
                          animate={{ rotate: 360 }}
                          transition={{ delay: index * 0.3, duration: 1 }}
                        >
                          {item.icon}
                        </motion.span>
                        {item.label}:
                      </span>
                      <motion.span
                        className="font-bold text-xl text-purple-600"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ delay: index * 0.3 + 0.5 }}
                      >
                        {item.value}
                      </motion.span>
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  className="mt-6 w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl shadow-lg text-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNextStage}
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
