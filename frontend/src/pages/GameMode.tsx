import { useState } from 'react';
import { BookOpen, Heart, Users, Trophy, PieChart } from 'lucide-react';
import { motion } from 'framer-motion';
import JourneyMap from '@/components/GameMode/JourneyMap';
import CheckIn from '@/components/GameMode/CheckIn';
import GroupTab from '@/components/GameMode/GroupTab';
import RewardsTab from '@/components/GameMode/RewardsTab';
import ProgressTab from '@/components/GameMode/ProgressTab';
import EnhancedLessonInterface from '@/components/EnhancedLessonInterface';
import { useToast } from '@/hooks/use-toast';
import { COMPLETE_LESSONS } from '@/data/allLessonsData';

const GameMode = () => {
  const [activeTab, setActiveTab] = useState('modules');
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleLessonComplete = (results: any) => {
    console.log('Lesson completed:', results);
    toast({
      title: "Урок завершен! 🎉",
      description: `Ты заработал ${results.xpEarned} XP!`,
    });
    setSelectedLessonId(null);
    // TODO: Update progress state here
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'modules':
        return <JourneyMap onLessonSelect={setSelectedLessonId} />;
      case 'checkin':
        return <CheckIn />;
      case 'group':
        return <GroupTab />;
      case 'rewards':
        return <RewardsTab />;
      case 'progress':
        return <ProgressTab />;
      default:
        return null;
    }
  };

  const selectedLesson = selectedLessonId ? COMPLETE_LESSONS.find(l => l.id === selectedLessonId) : null;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Lesson Overlay */}
      {selectedLessonId && selectedLesson && (
        <div className="fixed inset-0 z-50 bg-white">
          <EnhancedLessonInterface
            questions={selectedLesson.questions}
            lessonTitle={selectedLesson.title}
            xpReward={selectedLesson.xp}
            lessonId={selectedLessonId}
            intro={selectedLesson.intro}
            completionMeta={selectedLesson.completion}
            onComplete={handleLessonComplete}
            onExit={() => setSelectedLessonId(null)}
          />
        </div>
      )}

      {/* Main Content Area */}
      <main className="h-full">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe">
        <div className="flex justify-around items-center h-16 px-2">
          {[
            { id: 'modules', label: 'Модули', icon: BookOpen },
            { id: 'checkin', label: 'Чек-ин', icon: Heart },
            { id: 'group', label: 'Группа', icon: Users },
            { id: 'rewards', label: 'Награды', icon: Trophy },
            { id: 'progress', label: 'Прогресс', icon: PieChart },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                  isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                >
                  <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                </motion.div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default GameMode;
