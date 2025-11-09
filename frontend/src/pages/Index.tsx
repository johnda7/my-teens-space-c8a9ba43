import { useState, useEffect } from 'react';
import { Home, Calendar, MessageCircle, Users, Video, Award, Target, Shield, Heart, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import LearningPath from '@/components/LearningPath';
import ModuleRoom from '@/components/ModuleRoom';
import EnhancedLessonInterface from '@/components/EnhancedLessonInterface';
import LessonComplete from '@/components/LessonComplete';
import { ALL_LESSONS, getModuleLessons, getWeekLessons } from '@/data/allLessonsData';
import { motion, AnimatePresence } from 'framer-motion';

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [currentModule, setCurrentModule] = useState<string | null>(null);
  const [currentLesson, setCurrentLesson] = useState<string | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [completedLesson, setCompletedLesson] = useState<any>(null);

  const [streak, setStreak] = useState(7);
  const [level, setLevel] = useState(3);
  const [xp, setXp] = useState(450);
  const [nextLevelXP] = useState(600);
  const [currentWeek, setCurrentWeek] = useState(1);

  const getModuleWeekLessons = () => {
    if (!currentModule) return [];
    return getWeekLessons(currentWeek)
      .filter(lesson => lesson.module === currentModule)
      .map((lesson, index) => ({
        id: lesson.id,
        title: lesson.title,
        status: (index === 0 ? 'current' : index < 2 ? 'available' : 'locked') as 'locked' | 'available' | 'current' | 'completed',
        xp: lesson.xp,
      }));
  };

  const weekLessons = getModuleWeekLessons();

  const modules = [
    { id: 'boundaries', name: 'Границы', icon: Shield, theme: 'boundaries' as const, progress: 25 },
    { id: 'confidence', name: 'Уверенность', icon: Target, theme: 'confidence' as const, progress: 10 },
    { id: 'emotions', name: 'Эмоции', icon: Heart, theme: 'emotions' as const, progress: 0 },
    { id: 'relationships', name: 'Отношения', icon: Users, theme: 'relationships' as const, progress: 0 },
  ];

  const handleLessonStart = (lessonId: string) => {
    setCurrentLesson(lessonId);
  };

  const handleLessonComplete = (xpEarned: number) => {
    const lesson = LESSONS_DATA.find(l => l.id === currentLesson);
    setXp(prev => prev + xpEarned);
    setCompletedLesson({ xpEarned, message: lesson?.completionMessage || 'Отлично!' });
    setCurrentLesson(null);
    setShowCompletion(true);
  };

  const handleContinueAfterCompletion = () => {
    setShowCompletion(false);
    setCompletedLesson(null);
  };

  // If showing lesson
  if (currentLesson) {
    const lesson = LESSONS_DATA.find(l => l.id === currentLesson);
    if (lesson) {
      return (
        <LessonInterface
          questions={lesson.questions}
          onComplete={handleLessonComplete}
          onExit={() => setCurrentLesson(null)}
          lessonTitle={lesson.title}
          xpReward={lesson.xp}
        />
      );
    }
  }

  // If showing completion
  if (showCompletion && completedLesson) {
    return (
      <LessonComplete
        xpEarned={completedLesson.xpEarned}
        message={completedLesson.message}
        onContinue={handleContinueAfterCompletion}
      />
    );
  }

  // If in module room
  if (currentModule) {
    const module = modules.find(m => m.id === currentModule);
    if (module) {
      const Icon = module.icon;
      return (
        <div className="min-h-screen">
          <ModuleRoom
            title={module.name}
            description={`Твой путь к пониманию ${module.name.toLowerCase()}`}
            icon={<Icon className="w-12 h-12" />}
            theme={module.theme}
            progress={module.progress}
          >
            <div className="max-w-4xl mx-auto">
              <Button 
                onClick={() => setCurrentModule(null)}
                variant="outline"
                className="mb-6"
              >
                ← Назад к модулям
              </Button>
              <LearningPath
                lessons={weekLessons}
                currentLessonIndex={1}
                onLessonStart={handleLessonStart}
                weekNumber={currentWeek}
              />
            </div>
          </ModuleRoom>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 pb-20">
      {/* Header */}
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-gradient-to-r from-primary via-secondary to-accent p-6 text-white shadow-lg sticky top-0 z-40"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">MyTeens.Space</h1>
            <p className="text-sm opacity-90">с психологом Катей</p>
          </div>
          <div className="flex gap-3">
            <motion.div 
              whileHover={{ scale: 1.1 }}
              className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full backdrop-blur"
            >
              <span className="text-xl">🔥</span>
              <span className="font-bold">{streak}</span>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.1 }}
              className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full backdrop-blur"
            >
              <Award className="w-5 h-5" />
              <span className="font-bold">{level}</span>
            </motion.div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Уровень {level}</span>
            <span>{xp}/{nextLevelXP} XP</span>
          </div>
          <Progress value={(xp / nextLevelXP) * 100} className="h-3 bg-white/30" />
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Modules Grid */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Модули обучения</h2>
                <div className="grid grid-cols-2 gap-4">
                  {modules.map((module, index) => {
                    const Icon = module.icon;
                    return (
                      <motion.button
                        key={module.id}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: index * 0.1, type: "spring" }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentModule(module.id)}
                        className="bg-card p-6 rounded-3xl shadow-lg border-2 border-border hover:border-primary transition-all"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${
                            module.theme === 'boundaries' ? 'from-purple-500/20 to-pink-500/20' :
                            module.theme === 'confidence' ? 'from-yellow-500/20 to-orange-500/20' :
                            module.theme === 'emotions' ? 'from-blue-500/20 to-cyan-500/20' :
                            'from-pink-500/20 to-rose-500/20'
                          }`}>
                            <Icon className="w-8 h-8 text-primary" />
                          </div>
                          <h3 className="font-bold text-foreground">{module.name}</h3>
                          <Progress value={module.progress} className="w-full h-2" />
                          <span className="text-xs text-muted-foreground">{module.progress}%</span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Stats */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-card p-6 rounded-3xl shadow-lg border border-border"
              >
                <h3 className="text-lg font-bold text-foreground mb-4">Твой прогресс</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{streak}</div>
                    <div className="text-xs text-muted-foreground">Дней подряд</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-secondary">{xp}</div>
                    <div className="text-xs text-muted-foreground">Всего XP</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent">{level}</div>
                    <div className="text-xs text-muted-foreground">Уровень</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'checkin' && (
            <motion.div
              key="checkin"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="bg-card p-6 rounded-3xl shadow-lg border border-border">
                <h2 className="text-2xl font-bold text-foreground mb-6">Ежедневный чек-ин</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">
                      Как твое настроение?
                    </label>
                    <div className="flex justify-around">
                      {['😢', '😐', '🙂', '😊', '😄'].map((emoji, index) => (
                        <motion.button
                          key={emoji}
                          whileHover={{ scale: 1.3, rotate: 10 }}
                          whileTap={{ scale: 0.9 }}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="text-4xl"
                        >
                          {emoji}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">
                      Уровень тревожности (0-10)
                    </label>
                    <Slider defaultValue={[5]} max={10} step={1} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">
                      Сколько часов спал(а)?
                    </label>
                    <Input type="number" placeholder="8" className="text-center text-lg" />
                  </div>

                  <Button className="w-full" size="lg">
                    Сохранить чек-ин
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <div className="bg-card p-6 rounded-3xl shadow-lg border border-border">
                <h2 className="text-2xl font-bold text-foreground mb-4">Чат с Катей</h2>
                <div className="space-y-4 mb-4 h-96 overflow-y-auto">
                  <motion.div 
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex gap-3"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-xl flex-shrink-0">
                      👩‍⚕️
                    </div>
                    <div className="bg-primary/10 p-4 rounded-2xl rounded-tl-none">
                      <p className="text-foreground">Привет! Как твой день?</p>
                    </div>
                  </motion.div>
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Напиши сообщение..." className="flex-1" />
                  <Button size="icon">
                    <MessageCircle className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'group' && (
            <motion.div
              key="group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <div className="bg-card p-6 rounded-3xl shadow-lg border border-border">
                <h2 className="text-2xl font-bold text-foreground mb-4">Группа в Telegram</h2>
                <p className="text-muted-foreground mb-6">
                  Присоединяйся к нашему сообществу, где ты можешь общаться с другими подростками
                  и получать поддержку.
                </p>
                <Button className="w-full" size="lg">
                  Присоединиться к группе
                </Button>
              </div>
            </motion.div>
          )}

          {activeTab === 'videos' && (
            <motion.div
              key="videos"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <div className="bg-card p-6 rounded-3xl shadow-lg border border-border">
                <h2 className="text-2xl font-bold text-foreground mb-4">Записи сессий</h2>
                <div className="space-y-3">
                  {['Введение в эмоции', 'Техники релаксации', 'Уверенность в себе'].map(
                    (title, index) => (
                      <motion.div
                        key={index}
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, x: 5 }}
                        className="p-4 bg-muted rounded-xl cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <Video className="w-8 h-8 text-primary" />
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{title}</p>
                            <p className="text-sm text-muted-foreground">15 минут</p>
                          </div>
                        </div>
                      </motion.div>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border shadow-lg z-50"
      >
        <div className="flex justify-around p-3">
          {[
            { id: 'home', icon: Home, label: 'Главная' },
            { id: 'checkin', icon: Calendar, label: 'Чек-ин' },
            { id: 'chat', icon: MessageCircle, label: 'Чат' },
            { id: 'group', icon: Users, label: 'Группа' },
            { id: 'videos', icon: Video, label: 'Видео' },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileTap={{ scale: 0.9 }}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-6 h-6" />
              <span className="text-xs font-medium">{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Index;
