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

interface ParentLearningProps {
  onBack: () => void;
}

const ParentLearning = ({ onBack }: ParentLearningProps) => {
  const { user, haptic } = useTelegram();
  
  // State
  const [currentModule, setCurrentModule] = useState<string | null>(null);
  const [currentLesson, setCurrentLesson] = useState<string | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [completionData, setCompletionData] = useState<any>(null);
  const [showLessonPreview, setShowLessonPreview] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);

  // Progress from localStorage
  const completedLessons = JSON.parse(localStorage.getItem('parentCompletedLessons') || '[]');
  const parentXP = parseInt(localStorage.getItem('parentXP') || '0');
  const parentLevel = Math.floor(parentXP / 500) + 1;

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

  const handleLessonComplete = (lessonId: string, score: number, xpEarned: number) => {
    // Save completion
    const newCompleted = [...completedLessons, lessonId];
    localStorage.setItem('parentCompletedLessons', JSON.stringify(newCompleted));
    
    // Update XP
    const newXP = parentXP + xpEarned;
    localStorage.setItem('parentXP', newXP.toString());

    setCompletionData({ lessonId, score, xpEarned });
    setCurrentLesson(null);
    setShowCompletion(true);
  };

  const handleCompletionClose = () => {
    setShowCompletion(false);
    setCompletionData(null);
  };

  const getNextLesson = () => {
    const currentLessonIndex = PARENT_LESSONS.findIndex(l => l.id === completionData?.lessonId);
    if (currentLessonIndex === -1) return null;
    
    for (let i = currentLessonIndex + 1; i < PARENT_LESSONS.length; i++) {
      if (!completedLessons.includes(PARENT_LESSONS[i].id)) {
        return PARENT_LESSONS[i];
      }
    }
    return null;
  };

  const handleNextLesson = () => {
    const nextLesson = getNextLesson();
    if (nextLesson) {
      setShowCompletion(false);
      setSelectedLesson(nextLesson);
      setShowLessonPreview(true);
    }
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
        lesson={lesson}
        onComplete={(score) => {
          const xpEarned = Math.round(lesson.xp * (score / 100));
          handleLessonComplete(lesson.id, score, xpEarned);
        }}
        onExit={() => setCurrentLesson(null)}
      />
    );
  }

  // Render module room
  if (currentModule) {
    const moduleLessons = PARENT_LESSONS.filter(l => l.module === currentModule);
    const moduleInfo = PARENT_MODULES.find(m => m.id === currentModule);

    return (
      <ModuleRoom
        module={{
          id: currentModule,
          name: moduleInfo?.name || currentModule,
          description: moduleInfo?.description || '',
          theme: currentModule as any
        }}
        lessons={moduleLessons}
        completedLessons={completedLessons}
        onClose={() => setCurrentModule(null)}
        onLessonStart={handleLessonStart}
      />
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
                {user?.first_name || 'Родитель'} • Уровень {parentLevel}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Trophy className="w-3 h-3" />
                {parentXP} XP
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
                <span>{500 - (parentXP % 500)} XP</span>
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
            score={completionData.score}
            xpEarned={completionData.xpEarned}
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
