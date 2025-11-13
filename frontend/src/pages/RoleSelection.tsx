import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTelegram } from '@/hooks/useTelegram';
import { GraduationCap, Eye, BookOpen, Users } from 'lucide-react';

interface RoleOption {
  id: string;
  title: string;
  description: string;
  icon: typeof GraduationCap;
  color: string;
  route: string;
}

const RoleSelection = () => {
  const navigate = useNavigate();
  const { user, initData, hapticFeedback, notificationFeedback } = useTelegram();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const roles: RoleOption[] = [
    {
      id: 'student',
      title: 'Ученик',
      description: 'Я хочу учиться и развиваться',
      icon: GraduationCap,
      color: 'from-purple-500 to-pink-500',
      route: '/'
    },
    {
      id: 'parent',
      title: 'Родитель (Мониторинг)',
      description: 'Я хочу следить за успехами ребенка',
      icon: Eye,
      color: 'from-blue-500 to-cyan-500',
      route: '/parent'
    },
    {
      id: 'parent_learning',
      title: 'Родитель (Обучение)',
      description: 'Я хочу учиться вместе с ребенком',
      icon: BookOpen,
      color: 'from-green-500 to-emerald-500',
      route: '/parent-learning'
    },
    {
      id: 'curator',
      title: 'Куратор',
      description: 'Я веду группу учеников',
      icon: Users,
      color: 'from-orange-500 to-red-500',
      route: '/curator'
    }
  ];

  const handleRoleSelect = async (roleId: string) => {
    if (loading) return;
    
    hapticFeedback('medium');
    setSelectedRole(roleId);
    setLoading(true);

    try {
      // Отправляем запрос на бэкенд с выбранной ролью
      const response = await fetch('http://localhost:8001/api/auth/telegram-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          init_data: initData || '',
          selected_role: roleId
        })
      });

      if (!response.ok) {
        throw new Error('Ошибка при создании аккаунта');
      }

      const data = await response.json();

      // Сохраняем данные пользователя в localStorage
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('userRole', data.user.role);
      localStorage.setItem('userName', data.user.name);
      localStorage.setItem('telegramId', data.user.telegram_id);

      notificationFeedback('success');

      // Переход на соответствующий дашборд
      const role = roles.find(r => r.id === roleId);
      if (role) {
        setTimeout(() => {
          navigate(role.route);
        }, 500);
      }

    } catch (error) {
      console.error('Ошибка при выборе роли:', error);
      notificationFeedback('error');
      setLoading(false);
      setSelectedRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Добро пожаловать в MyTeens.Space! 👋
          </h1>
          <p className="text-gray-600">
            {user ? `Привет, ${user.first_name}!` : ''} Выбери свою роль для начала
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {roles.map((role, index) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            
            return (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`
                    p-6 cursor-pointer transition-all duration-300 hover:shadow-xl
                    ${isSelected ? 'ring-4 ring-purple-500 scale-105' : 'hover:scale-105'}
                    ${loading && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  onClick={() => !loading && handleRoleSelect(role.id)}
                >
                  <div className={`
                    w-16 h-16 rounded-full bg-gradient-to-br ${role.color} 
                    flex items-center justify-center mb-4 mx-auto
                  `}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-center mb-2">
                    {role.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 text-center">
                    {role.description}
                  </p>

                  {isSelected && loading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-4 text-center"
                    >
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Вы сможете изменить роль позже в настройках</p>
        </div>
      </motion.div>
    </div>
  );
};

export default RoleSelection;
