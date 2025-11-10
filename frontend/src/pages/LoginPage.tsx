import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AnimatedKatya from '@/components/AnimatedKatya';

const LoginPage = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!code.trim() || code.length !== 6) {
      setError('Код должен состоять из 6 символов');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/api/auth/login?code=${code.toUpperCase()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        const user = data.user;
        
        // Сохраняем данные пользователя
        localStorage.setItem('userId', user.id);
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('userName', user.name);
        localStorage.setItem('userAge', user.age);
        localStorage.setItem('userXP', user.xp || 0);
        localStorage.setItem('userLevel', user.level || 1);
        localStorage.setItem('userStreak', user.streak || 0);
        
        // Перенаправляем в зависимости от роли
        if (user.role === 'curator') {
          navigate('/curator');
        } else if (user.role === 'parent') {
          navigate('/parent');
        } else {
          navigate('/');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Неверный код. Попробуйте снова.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Ошибка входа. Проверьте подключение к интернету.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-none bg-white/95 backdrop-blur">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-32 h-32">
                <AnimatedKatya mood="default" />
              </div>
            </div>
            
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              MyTeens.Space
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Введите код от куратора для входа
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="АБВ123"
                value={code}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                  if (value.length <= 6) {
                    setCode(value);
                    setError('');
                  }
                }}
                onKeyPress={handleKeyPress}
                maxLength={6}
                className="text-center text-2xl font-mono tracking-widest uppercase h-14 text-purple-600 border-2 border-purple-200 focus:border-purple-500"
                disabled={loading}
                autoFocus
              />
              
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-500 text-center"
                >
                  {error}
                </motion.p>
              )}
            </div>

            <Button
              onClick={handleLogin}
              disabled={loading || code.length !== 6}
              className="w-full h-12 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              size="lg"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Вход...
                </span>
              ) : (
                'Войти'
              )}
            </Button>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center leading-relaxed">
                💡 <strong>Нет кода?</strong><br />
                Попросите у вашего куратора или учителя.
              </p>
            </div>
          </CardContent>
        </Card>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6 text-sm text-gray-600"
        >
          Безопасная образовательная платформа для подростков
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
