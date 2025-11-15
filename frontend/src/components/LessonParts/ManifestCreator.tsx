import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Heart, Shield, Target, Sparkles, CheckCircle } from 'lucide-react';

interface ManifestCreatorProps {
  onComplete?: (manifest: Record<string, string>) => void;
}

export default function ManifestCreator({ onComplete }: ManifestCreatorProps) {
  const [currentSection, setCurrentSection] = useState(0);
  const [manifest, setManifest] = useState({
    values: '',
    rights: '',
    boundaries: '',
    mantra: '',
    support: ''
  });

  const sections = [
    {
      title: 'Мои ценности',
      description: 'Что для тебя самое важное?',
      icon: <Heart size={20} className="text-pink-600" />,
      placeholder: 'Например: Честность, уважение, самоуважение, семья...',
      key: 'values' as keyof typeof manifest
    },
    {
      title: 'Мои права',
      description: 'Напомни себе о своих правах',
      icon: <Shield size={20} className="text-blue-600" />,
      placeholder: 'Например:\n• Я имею право чувствовать то, что чувствую\n• Я имею право сказать "нет"\n• Я имею право на отдых...',
      key: 'rights' as keyof typeof manifest
    },
    {
      title: 'Мои границы',
      description: '5-7 главных границ, которые ты защищаешь',
      icon: <Target size={20} className="text-purple-600" />,
      placeholder: 'Например:\n• Мое тело — только мое решение\n• Моё время — я не обязан объяснять\n• Мой телефон — моя приватность...',
      key: 'boundaries' as keyof typeof manifest
    },
    {
      title: 'Моя мантра',
      description: 'Одна фраза, которая тебя поддерживает',
      icon: <Sparkles size={20} className="text-yellow-600" />,
      placeholder: 'Например: "Я имею право заботиться о себе" или "Границы — это не эгоизм, это самоуважение"',
      key: 'mantra' as keyof typeof manifest
    },
    {
      title: 'Мой план поддержки',
      description: 'К кому обращусь, что делаю ежедневно',
      icon: <CheckCircle size={20} className="text-green-600" />,
      placeholder: 'Например:\n• К маме, если нужна поддержка\n• Утренняя практика самоуважения\n• Перечитываю мантру перед сложными разговорами...',
      key: 'support' as keyof typeof manifest
    }
  ];

  const currentSectionData = sections[currentSection];

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(prev => prev + 1);
    } else {
      onComplete?.(manifest);
    }
  };

  const handleBack = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
    }
  };

  const progress = ((currentSection + 1) / sections.length) * 100;

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-purple-600">
            Шаг {currentSection + 1} из {sections.length}
          </span>
          <span className="text-purple-500">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 100 }}
          />
        </div>
      </div>

      {/* Current Section */}
      <motion.div
        key={currentSection}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        <Card className="bg-gradient-to-br from-white to-purple-50 border-2 border-purple-300">
          <CardContent className="p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-300 flex items-center justify-center">
                {currentSectionData.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base text-purple-900 mb-1">
                  {currentSectionData.title}
                </h3>
                <p className="text-xs text-slate-600">
                  {currentSectionData.description}
                </p>
              </div>
            </div>

            <textarea
              value={manifest[currentSectionData.key]}
              onChange={(e) => setManifest({
                ...manifest,
                [currentSectionData.key]: e.target.value
              })}
              placeholder={currentSectionData.placeholder}
              className="w-full h-32 p-3 border-2 border-purple-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            />

            <div className="flex gap-2 mt-4">
              {currentSection > 0 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  Назад
                </Button>
              )}
              <Button
                onClick={handleNext}
                disabled={!manifest[currentSectionData.key].trim()}
                className="flex-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 text-white font-semibold shadow-lg"
              >
                {currentSection === sections.length - 1 ? 'Завершить манифест ✨' : 'Дальше →'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Mini Preview of Completed Sections */}
      {currentSection > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {sections.slice(0, currentSection).map((section, idx) => (
            <motion.button
              key={idx}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setCurrentSection(idx)}
              className="p-2 rounded-xl bg-emerald-50 border border-emerald-300 text-left hover:bg-emerald-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-600" />
                <span className="text-[10px] font-semibold text-emerald-900">
                  {section.title}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
