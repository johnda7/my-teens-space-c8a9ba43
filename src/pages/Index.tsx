import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import LearningPath from '@/components/LearningPath';
import AnimatedKatya from '@/components/AnimatedKatya';
import { 
  Home, 
  MessageCircle, 
  Users, 
  Video, 
  Target,
  Flame,
  Trophy,
  Heart,
  Calendar
} from 'lucide-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'checkin' | 'chat' | 'group' | 'videos'>('home');
  const [streak] = useState(7);
  const [level] = useState(3);
  const [xp] = useState(450);
  const [nextLevelXP] = useState(600);

  const lessons = [
    { id: '1', title: 'Что такое личные границы?', status: 'completed' as const, xp: 50 },
    { id: '2', title: 'Признаки нарушенных границ', status: 'completed' as const, xp: 50 },
    { id: '3', title: 'Как говорить "нет"', status: 'current' as const, xp: 50 },
    { id: '4', title: 'Границы в семье', status: 'available' as const, xp: 50 },
    { id: '5', title: 'Границы с друзьями', status: 'locked' as const, xp: 50 },
    { id: '6', title: 'Цифровые границы', status: 'locked' as const, xp: 50 },
    { id: '7', title: 'Эмоциональные границы', status: 'locked' as const, xp: 50 },
    { id: '8', title: 'Практика в реальной жизни', status: 'locked' as const, xp: 75 },
    { id: '9', title: 'Итоговый тест', status: 'locked' as const, xp: 100 },
  ];

  const currentLessonIndex = lessons.findIndex(l => l.status === 'current');

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">MyTeens.Space</h1>
              <p className="text-xs text-gray-500">с психологом Катей</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="font-bold">{streak}</span>
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="font-bold">Ур. {level}</span>
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto">
        {activeTab === 'home' && (
          <LearningPath
            lessons={lessons}
            currentLessonIndex={currentLessonIndex}
            onLessonStart={(lessonId) => {
              console.log('Starting lesson:', lessonId);
              // TODO: Navigate to lesson
            }}
            weekNumber={1}
          />
        )}

        {activeTab === 'checkin' && (
          <Card className="p-6">
            <h3 className="font-bold text-gray-900 mb-4">Ежедневный чек-ин</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Как твоё настроение сегодня?
                </label>
                <div className="flex gap-2">
                  {['😢', '😕', '😐', '🙂', '😊'].map((emoji, idx) => (
                    <button key={idx} className="text-3xl hover:scale-110 transition-transform">
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Уровень тревоги (1-10)
                </label>
                <input type="range" min="1" max="10" className="w-full" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Сколько часов спал(а)?
                </label>
                <input type="number" min="0" max="24" placeholder="8" className="w-full p-2 border rounded-lg" />
              </div>
              <Button className="w-full">Сохранить</Button>
            </div>
          </Card>
        )}

        {activeTab === 'chat' && (
          <Card className="p-6">
            <h3 className="font-bold text-gray-900 mb-4">Чат с психологом Катей</h3>
            <div className="space-y-4 mb-4 h-96 overflow-y-auto">
              <div className="flex gap-2">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-tl-none p-3 max-w-xs">
                  <p className="text-sm">Привет! Как прошёл сегодняшний день?</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <input type="text" placeholder="Напиши сообщение..." className="flex-1 p-2 border rounded-lg" />
              <Button>Отправить</Button>
            </div>
          </Card>
        )}

        {activeTab === 'group' && (
          <Card className="p-6">
            <h3 className="font-bold text-gray-900 mb-4">Группа в Telegram</h3>
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-10 h-10 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Группа "Личные границы"</p>
                <p className="text-sm text-gray-500">23 участника</p>
              </div>
              <Button className="w-full">Присоединиться к группе</Button>
            </div>
          </Card>
        )}

        {activeTab === 'videos' && (
          <Card className="p-6">
            <h3 className="font-bold text-gray-900 mb-4">Записи встреч с Катей</h3>
            <div className="space-y-3">
              {[
                { title: 'Введение в личные границы', date: '12.01.2025', duration: '45 мин' },
                { title: 'Практика: говорим "нет"', date: '09.01.2025', duration: '30 мин' },
                { title: 'Границы в семье', date: '05.01.2025', duration: '50 мин' },
              ].map((video, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200 flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900">{video.title}</p>
                    <p className="text-xs text-gray-500">{video.date} • {video.duration}</p>
                  </div>
                  <Button size="sm" variant="outline">Смотреть</Button>
                </div>
              ))}
            </div>
          </Card>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe">
        <div className="max-w-4xl mx-auto px-4 py-2">
          <div className="grid grid-cols-5 gap-2">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center gap-1 py-2 rounded-lg transition-colors ${
                activeTab === 'home' ? 'bg-purple-50 text-purple-600' : 'text-gray-500'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-xs font-medium">Главная</span>
            </button>
            <button
              onClick={() => setActiveTab('checkin')}
              className={`flex flex-col items-center gap-1 py-2 rounded-lg transition-colors ${
                activeTab === 'checkin' ? 'bg-purple-50 text-purple-600' : 'text-gray-500'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span className="text-xs font-medium">Чек-ин</span>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex flex-col items-center gap-1 py-2 rounded-lg transition-colors ${
                activeTab === 'chat' ? 'bg-purple-50 text-purple-600' : 'text-gray-500'
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-xs font-medium">Чат</span>
            </button>
            <button
              onClick={() => setActiveTab('group')}
              className={`flex flex-col items-center gap-1 py-2 rounded-lg transition-colors ${
                activeTab === 'group' ? 'bg-purple-50 text-purple-600' : 'text-gray-500'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="text-xs font-medium">Группа</span>
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`flex flex-col items-center gap-1 py-2 rounded-lg transition-colors ${
                activeTab === 'videos' ? 'bg-purple-50 text-purple-600' : 'text-gray-500'
              }`}
            >
              <Video className="w-5 h-5" />
              <span className="text-xs font-medium">Записи</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Index;
