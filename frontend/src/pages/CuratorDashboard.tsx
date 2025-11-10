import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, Award, Calendar, Search, Plus, Copy, Check, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import WheelOfBalance from '@/components/WheelOfBalance';

interface StudentData {
  id: string;
  name: string;
  age: number;
  lastActive: string;
  progress: {
    boundaries: number;
    confidence: number;
    emotions: number;
    relationships: number;
  };
  completedLessons: number;
  totalXP: number;
  level: number;
  streak: number;
  initialBalance?: Record<string, number>;
  currentBalance?: Record<string, number>;
}

const CuratorDashboard = () => {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [loading, setLoading] = useState(true);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentAge, setNewStudentAge] = useState('14');
  const [generatedCode, setGeneratedCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  
  const navigate = useNavigate();
  const curatorId = localStorage.getItem('userId') || 'demo-curator-id';
  const curatorName = localStorage.getItem('userName') || 'Демо Куратор';

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/api/curator/${curatorId}/students`);
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('Error loading students:', error);
      toast.error('Ошибка загрузки учеников');
    } finally {
      setLoading(false);
    }
  };

  const generateInviteCode = async () => {
    if (!newStudentName.trim()) {
      toast.error('Введите имя ученика');
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/api/curator/generate-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          curator_id: curatorId,
          student_name: newStudentName,
          student_age: parseInt(newStudentAge)
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setGeneratedCode(data.code);
        toast.success('Код создан!');
      }
    } catch (error) {
      console.error('Error generating code:', error);
      toast.error('Ошибка создания кода');
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopiedCode(true);
    toast.success('Код скопирован!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const closeAddStudent = () => {
    setShowAddStudent(false);
    setNewStudentName('');
    setNewStudentAge('14');
    setGeneratedCode('');
    setCopiedCode(false);
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    const lastActiveDate = new Date(student.lastActive);
    const daysSinceActive = (Date.now() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24);
    const isActive = daysSinceActive < 7;
    
    const matchesFilter = 
      filterActive === 'all' || 
      (filterActive === 'active' && isActive) ||
      (filterActive === 'inactive' && !isActive);
    
    return matchesSearch && matchesFilter;
  });

  const activeStudents = students.filter(s => {
    const daysSinceActive = (Date.now() - new Date(s.lastActive).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceActive < 7;
  });

  const avgProgress = students.length > 0
    ? Math.round(students.reduce((acc, s) => acc + (s.completedLessons / 44 * 100), 0) / students.length)
    : 0;

  const avgStreak = students.length > 0
    ? Math.round(students.reduce((acc, s) => acc + s.streak, 0) / students.length)
    : 0;

  const getModuleName = (key: string) => {
    const names: Record<string, string> = {
      boundaries: 'Границы',
      confidence: 'Уверенность',
      emotions: 'Эмоции',
      relationships: 'Отношения'
    };
    return names[key] || key;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <p className="text-xl text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Хедер */}
      <div className="bg-white shadow-lg p-6 mb-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="text-purple-600" />
              Панель куратора
            </h1>
            <p className="text-gray-600 mt-1">Добро пожаловать, {curatorName}!</p>
          </div>
          <Button 
            onClick={() => setShowAddStudent(true)} 
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="mr-2 h-5 w-5" />
            Добавить ученика
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-12">
        {/* Общая статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-none">
              <CardContent className="pt-6">
                <Users className="w-8 h-8 mb-2" />
                <p className="text-4xl font-bold">{students.length}</p>
                <p className="text-purple-100 mt-1">Всего учеников</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white border-none">
              <CardContent className="pt-6">
                <TrendingUp className="w-8 h-8 mb-2" />
                <p className="text-4xl font-bold">{activeStudents.length}</p>
                <p className="text-green-100 mt-1">Активных</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white border-none">
              <CardContent className="pt-6">
                <Award className="w-8 h-8 mb-2" />
                <p className="text-4xl font-bold">{avgProgress}%</p>
                <p className="text-yellow-100 mt-1">Средний прогресс</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-none">
              <CardContent className="pt-6">
                <Calendar className="w-8 h-8 mb-2" />
                <p className="text-4xl font-bold">{avgStreak}</p>
                <p className="text-blue-100 mt-1">Средний стрик (дней)</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Поиск и фильтры */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Поиск ученика..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterActive === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterActive('all')}
                >
                  Все ({students.length})
                </Button>
                <Button
                  variant={filterActive === 'active' ? 'default' : 'outline'}
                  onClick={() => setFilterActive('active')}
                >
                  Активные ({activeStudents.length})
                </Button>
                <Button
                  variant={filterActive === 'inactive' ? 'default' : 'outline'}
                  onClick={() => setFilterActive('inactive')}
                >
                  Неактивные ({students.length - activeStudents.length})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Список учеников и детали */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Левая колонка - список */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Users className="h-5 w-5" />
              Ученики
            </h2>
            
            {filteredStudents.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  {students.length === 0 ? '📚 Пока нет учеников. Добавьте первого!' : '🔍 Ученики не найдены'}
                </CardContent>
              </Card>
            ) : (
              filteredStudents.map((student) => {
                const daysSinceActive = (Date.now() - new Date(student.lastActive).getTime()) / (1000 * 60 * 60 * 24);
                const isActive = daysSinceActive < 7;
                
                return (
                  <motion.div
                    key={student.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedStudent(student)}
                  >
                    <Card className={`cursor-pointer transition-all ${
                      selectedStudent?.id === student.id 
                        ? 'ring-2 ring-purple-600 shadow-lg' 
                        : 'hover:shadow-md'
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-bold text-lg">{student.name}</h3>
                            <p className="text-sm text-gray-600">
                              {student.age} лет • Уровень {student.level}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Активность: {new Date(student.lastActive).toLocaleDateString('ru-RU')}
                              {isActive && ' 🟢'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-bold text-purple-600">
                              {Math.round((student.completedLessons / 44) * 100)}%
                            </p>
                            <p className="text-xs text-gray-600">прогресс</p>
                          </div>
                        </div>
                        
                        {/* Мини прогресс-бары */}
                        <div className="space-y-2">
                          {Object.entries(student.progress).map(([module, progress]) => (
                            <div key={module} className="flex items-center gap-2">
                              <span className="text-xs text-gray-600 w-28">
                                {getModuleName(module)}
                              </span>
                              <Progress value={progress} className="flex-1 h-2" />
                              <span className="text-xs font-bold w-10 text-right">{progress.toFixed(0)}%</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-3 pt-3 border-t flex justify-between text-sm">
                          <span>💎 {student.totalXP} XP</span>
                          <span>🔥 {student.streak} дней</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Правая колонка - детали выбранного ученика */}
          <div className="lg:sticky lg:top-6 space-y-6" style={{ height: 'fit-content' }}>
            {selectedStudent ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{selectedStudent.name}</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedStudent(null)}
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">{selectedStudent.completedLessons}</p>
                        <p className="text-sm text-gray-600">Уроков</p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{selectedStudent.totalXP}</p>
                        <p className="text-sm text-gray-600">XP</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{selectedStudent.level}</p>
                        <p className="text-sm text-gray-600">Уровень</p>
                      </div>
                      <div className="bg-orange-50 p-3 rounded-lg">
                        <p className="text-2xl font-bold text-orange-600">{selectedStudent.streak}</p>
                        <p className="text-sm text-gray-600">Стрик</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Колесо баланса */}
                {selectedStudent.currentBalance && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Колесо баланса</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <WheelOfBalance
                        scores={selectedStudent.currentBalance}
                        type={selectedStudent.initialBalance ? 'comparison' : 'initial'}
                        initialScores={selectedStudent.initialBalance}
                        size="medium"
                      />
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="p-12 text-center text-gray-500">
                  <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p>Выберите ученика для просмотра деталей</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Модальное окно добавления ученика */}
      {showAddStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Добавить ученика</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!generatedCode ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Имя ученика</label>
                      <Input
                        value={newStudentName}
                        onChange={(e) => setNewStudentName(e.target.value)}
                        placeholder="Иван Иванов"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Возраст</label>
                      <Input
                        type="number"
                        value={newStudentAge}
                        onChange={(e) => setNewStudentAge(e.target.value)}
                        min="10"
                        max="18"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={generateInviteCode} className="flex-1">
                        Создать код
                      </Button>
                      <Button onClick={closeAddStudent} variant="outline">
                        Отмена
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-center py-6">
                      <p className="text-sm text-gray-600 mb-4">Код для {newStudentName}:</p>
                      <div className="bg-purple-50 p-4 rounded-lg mb-4">
                        <p className="text-4xl font-mono font-bold text-purple-600 tracking-wider">
                          {generatedCode}
                        </p>
                      </div>
                      <Button onClick={copyCode} variant="outline" className="w-full">
                        {copiedCode ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Скопировано!
                          </>
                        ) : (
                          <>
                            <Copy className="mr-2 h-4 w-4" />
                            Копировать код
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                      💡 Отправьте этот код ученику. Он сможет войти в систему используя его.
                    </div>
                    <Button onClick={() => {
                      closeAddStudent();
                      loadStudents();
                    }} className="w-full">
                      Готово
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CuratorDashboard;
