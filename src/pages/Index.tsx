import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Home, 
  MessageCircle, 
  Users, 
  Video, 
  Target,
  Flame,
  Trophy,
  Star,
  Heart,
  BookOpen,
  Calendar
} from 'lucide-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'checkin' | 'chat' | 'group' | 'videos'>('home');
  const [streak, setStreak] = useState(7);
  const [level, setLevel] = useState(3);
  const [xp, setXp] = useState(450);
  const [nextLevelXP, setNextLevelXP] = useState(600);

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
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {activeTab === 'home' && (
          <>
            {/* Психолог Катя - Персонаж */}
            <Card className="bg-gradient-to-br from-purple-500 to-pink-500 border-0 overflow-hidden">
              <div className="p-6 text-white relative">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-5 h-5" fill="currentColor" />
                      <span className="text-sm font-medium">Психолог Катя</span>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">
                      Привет! Готов(а) учиться новому? 🎯
                    </h2>
                    <p className="text-sm opacity-90 mb-4">
                      Сегодня у тебя новый урок. Давай разберём, как строить здоровые границы с друзьями!
                    </p>
                    <Button className="bg-white text-purple-600 hover:bg-gray-100">
                      Начать урок
                    </Button>
                  </div>
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                    <Heart className="w-12 h-12 text-white" />
                  </div>
                </div>
              </div>
            </Card>

            {/* Прогресс */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900">Твой прогресс</h3>
                <span className="text-sm text-gray-500">{xp} / {nextLevelXP} XP</span>
              </div>
              <Progress value={(xp / nextLevelXP) * 100} className="h-3 mb-2" />
              <p className="text-xs text-gray-500">Ещё {nextLevelXP - xp} XP до уровня {level + 1}</p>
            </Card>

            {/* Колесо баланса */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-gray-900">Колесо баланса</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
                  <div className="text-2xl mb-1">👨‍👩‍👧</div>
                  <p className="text-sm font-medium text-gray-700">Семья</p>
                  <div className="flex items-center gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`w-2 h-2 rounded-full ${i < 3 ? 'bg-green-500' : 'bg-gray-300'}`} />
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                  <div className="text-2xl mb-1">👫</div>
                  <p className="text-sm font-medium text-gray-700">Друзья</p>
                  <div className="flex items-center gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`w-2 h-2 rounded-full ${i < 4 ? 'bg-blue-500' : 'bg-gray-300'}`} />
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
                  <div className="text-2xl mb-1">📚</div>
                  <p className="text-sm font-medium text-gray-700">Учёба</p>
                  <div className="flex items-center gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`w-2 h-2 rounded-full ${i < 2 ? 'bg-purple-500' : 'bg-gray-300'}`} />
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-pink-50 rounded-xl border-2 border-pink-200">
                  <div className="text-2xl mb-1">💝</div>
                  <p className="text-sm font-medium text-gray-700">Любовь</p>
                  <div className="flex items-center gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`w-2 h-2 rounded-full ${i < 1 ? 'bg-pink-500' : 'bg-gray-300'}`} />
                    ))}
                  </div>
                </div>
              </div>
              <Button className="w-full mt-4" variant="outline">
                Обновить баланс
              </Button>
            </Card>

            {/* Уроки недели */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Уроки этой недели</h3>
                <Badge variant="secondary">Неделя 1</Badge>
              </div>
              <div className="space-y-3">
                {[
                  { title: 'Что такое личные границы?', status: 'completed', xp: 50 },
                  { title: 'Признаки нарушенных границ', status: 'completed', xp: 50 },
                  { title: 'Как говорить "нет"', status: 'current', xp: 50 },
                  { title: 'Границы в семье', status: 'locked', xp: 50 },
                ].map((lesson, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border-2 flex items-center justify-between ${
                    lesson.status === 'completed' ? 'bg-green-50 border-green-200' :
                    lesson.status === 'current' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        lesson.status === 'completed' ? 'bg-green-500' :
                        lesson.status === 'current' ? 'bg-yellow-500' :
                        'bg-gray-400'
                      }`}>
                        {lesson.status === 'completed' ? (
                          <Star className="w-5 h-5 text-white" fill="currentColor" />
                        ) : lesson.status === 'current' ? (
                          <BookOpen className="w-5 h-5 text-white" />
                        ) : (
                          <span className="text-white text-lg">🔒</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900">{lesson.title}</p>
                        <p className="text-xs text-gray-500">+{lesson.xp} XP</p>
                      </div>
                    </div>
                    {lesson.status === 'current' && (
                      <Button size="sm">Начать</Button>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </>
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
