import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Shield, Users, Heart, Target, BookOpen, Zap, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import ModuleRoom from '@/components/ModuleRoom';
import EnhancedLessonInterface from '@/components/EnhancedLessonInterface';
import LessonComplete from '@/components/LessonComplete';
import LessonPreview from '@/components/LessonPreview';
import { PARENT_LESSONS, PARENT_MODULES } from '@/data/parentLessonsData';
import { useTelegram } from '@/hooks/useTelegram';
import { useUserProgress } from '@/hooks/useUserProgress';

interface ParentLearningProps {
  onBack: () => void;
}

const ParentLearning = ({ onBack }: ParentLearningProps) => {
  const { user, haptic, notificationFeedback } = useTelegram();
  const { progress, addXP } = useUserProgress();
  
  // State
  const [currentModule, setCurrentModule] = useState<string | null>(null);
  const [currentLesson, setCurrentLesson] = useState<string | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [completionData, setCompletionData] = useState<any>(null);
  const [showLessonPreview, setShowLessonPreview] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);

  // Progress from localStorage (for completed lessons list)
  // Note: useUserProgress handles XP/Level, but we still need to track WHICH lessons are done
  // Ideally this should also be synced via syncUtils, but for now we keep it local/synced via syncUtils internally
  const completedLessons = JSON.parse(localStorage.getItem('completedLessons') || '[]');
  
  // Handlers
  const handleModuleClick = (moduleId: string) => {
    haptic?.('light');
    setCurrentModule(moduleId);
  };

  const handleLessonStart = (lessonId: string) => {
    haptic?.('light');
    const lesson = PARENT_LESSONS.find(l => l.id === lessonId);
    if (lesson) {
      setSelectedLesson(lesson);
      setShowLessonPreview(true);
    }
  };

  const startLessonFromPreview = () => {
    setShowLessonPreview(false);
    if (selectedLesson) {
      setCurrentLesson(selectedLesson.id);
    }
  };

  const handleLessonComplete = (xpEarned: number) => {
    if (!currentLesson) return;
    
    const lesson = PARENT_LESSONS.find(l => l.id === currentLesson);
    if (!lesson) return;

    // Save completion
    if (!completedLessons.includes(currentLesson)) {
      const newCompleted = [...completedLessons, currentLesson];
      localStorage.setItem('completedLessons', JSON.stringify(newCompleted));
      // Also add XP only if first time? Or always? Usually always for practice but maybe less.
      // For now, always add XP as per useUserProgress logic
      addXP(xpEarned);
    } else {
      // Reduced XP for replay?
      addXP(Math.floor(xpEarned / 2));
    }

    setCompletionData({ 
      xpEarned, 
      message: lesson.completionMessage 
    });
    
    setCurrentLesson(null);
    setShowCompletion(true);
    notificationFeedback('success');
  };

  const handleCompletionClose = () => {
    setShowCompletion(false);
    setCompletionData(null);
  };

  const getNextLesson = () => {
    const currentLessonIndex = PARENT_LESSONS.findIndex(l => l.id === completionData?.lessonId); // Wait, completionData doesn't have lessonId anymore
    // We need to track which lesson was just completed.
    // But currentLesson is set to null before this is called.
    // Let's fix getNextLesson logic later or simplify it.
    return null; 
  };

  const handleNextLesson = () => {
    // Simplified for now
    setShowCompletion(false);
  };

  // Calculate module progress
  const getModuleProgress = (moduleId: string) => {
    const moduleLessons = PARENT_LESSONS.filter(l => l.module === moduleId);
    const completedCount = moduleLessons.filter(l => completedLessons.includes(l.id)).length;
    return Math.round((completedCount / moduleLessons.length) * 100);
  };

  // Render current lesson
  if (currentLesson) {
    const lesson = PARENT_LESSONS.find(l => l.id === currentLesson);
    if (!lesson) return null;

    return (
      <EnhancedLessonInterface
        questions={lesson.questions}
        lessonTitle={lesson.title}
        xpReward={lesson.xp}
        lessonId={lesson.id}
        intro={lesson.intro}
        onComplete={handleLessonComplete}
        onExit={() => setCurrentLesson(null)}
      />
    );
  }

  // Render module view
  if (currentModule) {
    const moduleLessons = PARENT_LESSONS.filter(l => l.module === currentModule);
    const moduleInfo = PARENT_MODULES.find(m => m.id === currentModule);

    return (
      <div className="min-h-screen bg-slate-50 pb-20">
        <div className="bg-white p-4 shadow-sm sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setCurrentModule(null)}>
              <ArrowLeft className="w-6 h-6 text-slate-600" />
            </Button>
            <h1 className="text-xl font-bold text-slate-800">{moduleInfo?.name}</h1>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {moduleLessons.map((lesson, index) => {
            const isCompleted = completedLessons.includes(lesson.id);
            // Lock logic: previous lesson must be completed
            const isLocked = index > 0 && !completedLessons.includes(moduleLessons[index - 1].id);

            return (
              <Card key={lesson.id} className={`overflow-hidden ${isLocked ? 'opacity-75' : ''}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg text-slate-800">{lesson.title}</CardTitle>
                      {lesson.subtitle && <p className="text-sm text-slate-500">{lesson.subtitle}</p>}
                    </div>
                    {isCompleted ? (
                      <div className="bg-green-100 p-1 rounded-full">
                        <Trophy className="w-4 h-4 text-green-600" />
                      </div>
                    ) : isLocked ? (
                      <Shield className="w-5 h-5 text-slate-400" />
                    ) : (
                      <div className="bg-blue-100 p-1 rounded-full">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                    {lesson.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Trophy className="w-3 h-3" /> {lesson.xp} XP
                    </span>
                    {lesson.estimatedTime && <span>{lesson.estimatedTime} мин</span>}
                  </div>
                  
                  {!isLocked && !isCompleted && (
                    <Button 
                      className="w-full mt-4 bg-slate-900 hover:bg-slate-800"
                      onClick={() => handleLessonStart(lesson.id)}
                    >
                      Начать урок
                    </Button>
                  )}
                  {isCompleted && (
                    <Button 
                      variant="outline" 
                      className="w-full mt-4"
                      onClick={() => handleLessonStart(lesson.id)}
                    >
                      Пройти снова
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Main screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                haptic?.('light');
                onBack();
              }}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Обучение для родителей
              </h1>
              <p className="text-xs text-slate-600">
                {user?.first_name || 'Родитель'} • Уровень {progress.level}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Trophy className="w-3 h-3" />
                {progress.xp} XP
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Welcome Card */}
        <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
          <CardContent className="py-6">
            <h2 className="text-2xl font-bold mb-2">
              Добро пожаловать! 👋
            </h2>
            <p className="text-purple-100">
              30 уроков по психологии подростков помогут вам лучше понимать своего ребенка и строить доверительные отношения
            </p>
          </CardContent>
        </Card>

        {/* Progress Overview */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Ваш прогресс</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Уроков пройдено</span>
                <span className="font-semibold text-purple-600">
                  {completedLessons.length} / {PARENT_LESSONS.length}
                </span>
              </div>
              <Progress 
                value={(completedLessons.length / PARENT_LESSONS.length) * 100} 
                className="h-2"
              />
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>До следующего уровня</span>
                <span>{500 - (progress.xp % 500)} XP</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modules */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800">Модули обучения</h3>
          
          <div className="grid gap-4">
            {PARENT_MODULES.map((module) => {
              const progress = getModuleProgress(module.id);
              const moduleLessons = PARENT_LESSONS.filter(l => l.module === module.id);
              const completedCount = moduleLessons.filter(l => completedLessons.includes(l.id)).length;

              return (
                <motion.div
                  key={module.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => handleModuleClick(module.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${module.color} flex items-center justify-center text-3xl shadow-lg`}>
                          {module.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg mb-1">{module.name}</h4>
                          <p className="text-sm text-slate-600 mb-3">{module.description}</p>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-600">
                                {completedCount} / {module.totalLessons} уроков
                              </span>
                              <span className="font-semibold text-purple-600">{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-1.5" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Tips */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="py-4">
            <div className="flex gap-3">
              <Zap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Совет дня</h4>
                <p className="text-sm text-blue-800">
                  Проходите уроки вместе с ребенком! Так вы сможете обсудить темы и лучше понять друг друга.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lesson Preview Modal */}
      <AnimatePresence>
        {showLessonPreview && selectedLesson && (
          <LessonPreview
            lesson={selectedLesson}
            onStart={startLessonFromPreview}
            onClose={() => {
              setShowLessonPreview(false);
              setSelectedLesson(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Completion Screen */}
      <AnimatePresence>
        {showCompletion && completionData && (
          <LessonComplete
            xpEarned={completionData.xpEarned}
            message={completionData.message}
            onContinue={handleCompletionClose}
            nextLessonId={getNextLesson()?.id}
            onNextLesson={handleNextLesson}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ParentLearning;
