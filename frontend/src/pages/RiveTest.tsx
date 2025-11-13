// frontend/src/pages/RiveTest.tsx
import React, { useState } from 'react'
import { RiveKatya } from '@/components/RiveKatya'
import { motion } from 'framer-motion'

export const RiveTest: React.FC = () => {
  const [mood, setMood] = useState<'default' | 'celebrate' | 'thinking' | 'support' | 'bounce' | 'shake'>('default')
  const [message, setMessage] = useState('Привет! Я Катя! 💜')
  const [showBubble, setShowBubble] = useState(true)

  const moods = [
    { value: 'default', label: '😊 Обычное', color: 'from-gray-400 to-gray-600' },
    { value: 'celebrate', label: '🎉 Празднование', color: 'from-yellow-400 to-yellow-600' },
    { value: 'thinking', label: '🤔 Думает', color: 'from-blue-400 to-blue-600' },
    { value: 'support', label: '💜 Поддержка', color: 'from-purple-400 to-purple-600' },
    { value: 'bounce', label: '⬆️ Подпрыгивает', color: 'from-green-400 to-green-600' },
    { value: 'shake', label: '↔️ Качается', color: 'from-red-400 to-red-600' },
  ]

  const messages = [
    'Привет! Я Катя! 💜',
    'Отлично справился! 🎉',
    'Давай подумаем вместе 🤔',
    'Я здесь, чтобы помочь 💜',
    'Ты молодец! 🌟',
    'Продолжай в том же духе! ✨',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
      <div className="container mx-auto max-w-6xl">
        <motion.h1
          className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          🎭 Тест Rive Анимации Кати
        </motion.h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Панель управления */}
          <motion.div
            className="bg-white rounded-3xl p-6 shadow-xl"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Настройки</h2>

            {/* Выбор настроения */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-gray-700">Настроение:</h3>
              <div className="grid grid-cols-2 gap-3">
                {moods.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setMood(m.value as any)}
                    className={`p-3 rounded-xl font-medium transition-all ${
                      mood === m.value
                        ? `bg-gradient-to-r ${m.color} text-white shadow-lg scale-105`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Выбор сообщения */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-gray-700">Сообщение:</h3>
              <div className="space-y-2">
                {messages.map((msg, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMessage(msg)}
                    className={`w-full p-3 rounded-xl text-left transition-all ${
                      message === msg
                        ? 'bg-purple-100 border-2 border-purple-500 text-purple-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {msg}
                  </button>
                ))}
              </div>
              
              {/* Кастомное сообщение */}
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Или введите своё..."
                className="w-full mt-3 p-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
              />
            </div>

            {/* Переключатель облачка */}
            <div className="flex items-center justify-between p-3 bg-gray-100 rounded-xl">
              <span className="font-semibold text-gray-700">Показывать облачко:</span>
              <button
                onClick={() => setShowBubble(!showBubble)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  showBubble
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-300 text-gray-700'
                }`}
              >
                {showBubble ? 'Да ✓' : 'Нет ✗'}
              </button>
            </div>

            {/* Информация */}
            <div className="mt-6 p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-gray-600">
                <strong>Текущие параметры:</strong>
              </p>
              <ul className="text-sm text-gray-600 mt-2 space-y-1">
                <li>• Настроение: <strong>{mood}</strong></li>
                <li>• Сообщение: <strong>{message}</strong></li>
                <li>• Облачко: <strong>{showBubble ? 'Видимо' : 'Скрыто'}</strong></li>
              </ul>
            </div>
          </motion.div>

          {/* Область просмотра */}
          <motion.div
            className="bg-white rounded-3xl p-8 shadow-xl"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Предварительный просмотр</h2>
            
            <div className="flex items-center justify-center min-h-[500px]">
              <div className="w-full max-w-md">
                <RiveKatya
                  mood={mood}
                  message={message}
                  showBubble={showBubble}
                  className="w-80 h-80"
                />
              </div>
            </div>

            {/* Инструкция */}
            <div className="mt-6 p-4 bg-purple-50 rounded-xl">
              <p className="text-sm text-gray-600 text-center">
                💡 <strong>Совет:</strong> Попробуйте разные комбинации настроений и сообщений, 
                чтобы увидеть, как Катя реагирует!
              </p>
            </div>
          </motion.div>
        </div>

        {/* Примеры использования */}
        <motion.div
          className="mt-8 bg-white rounded-3xl p-6 shadow-xl"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Примеры использования в коде:</h2>
          
          <div className="space-y-4">
            <div className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto">
              <pre className="text-sm">
{`// Обычное состояние
<RiveKatya 
  mood="default"
  message="Привет! Я Катя! 💜"
  showBubble={true}
  className="w-40 h-40"
/>`}
              </pre>
            </div>

            <div className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto">
              <pre className="text-sm">
{`// Празднование успеха
<RiveKatya 
  mood="celebrate"
  message="Отлично справился! 🎉"
  showBubble={true}
  className="w-40 h-40"
/>`}
              </pre>
            </div>

            <div className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto">
              <pre className="text-sm">
{`// Без облачка с сообщением
<RiveKatya 
  mood="thinking"
  message="Думаю..."
  showBubble={false}
  className="w-40 h-40"
/>`}
              </pre>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
