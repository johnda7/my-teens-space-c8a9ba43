import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import ParentDashboard from "./pages/ParentDashboard";
import ParentHub from "./pages/ParentHub";
import CuratorDashboard from "./pages/CuratorDashboard";
import LoginPage from "./pages/LoginPage";
import RoleSelection from "./pages/RoleSelection";
import NotFound from "./pages/NotFound";
import GamePage from "./pages/GamePage";
import GameMode from "./pages/GameMode";
import { RiveTest } from "./pages/RiveTest";
// import ReplikaTest from "./pages/ReplikaTest";

const queryClient = new QueryClient();

// Компонент для защищенных маршрутов
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');
  
  // 🚧 DEV MODE: Временно отключена проверка для разработки
  // TODO: Включить в production!
  const DEV_MODE = true;
  
  if (DEV_MODE) {
    return <>{children}</>;
  }
  
  // Если нет userId, редирект на выбор роли
  if (!userId) {
    return <Navigate to="/role-selection" replace />;
  }
  
  // Если указаны разрешенные роли и роль пользователя не подходит
  if (allowedRoles && !allowedRoles.includes(userRole || '')) {
    // Редирект на дашборд в зависимости от роли
    if (userRole === 'student') return <Navigate to="/" replace />;
    if (userRole === 'parent') return <Navigate to="/parent" replace />;
    if (userRole === 'parent_learning') return <Navigate to="/parent-learning" replace />;
    if (userRole === 'curator') return <Navigate to="/curator" replace />;
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  // Basename для GitHub Pages или если путь содержит /my-teens-space-c8a9ba43/
  const basename = window.location.hostname.includes('github.io') || 
                   window.location.pathname.includes('/my-teens-space-c8a9ba43')
    ? '/my-teens-space-c8a9ba43' 
    : ''; // Пустой для обычного localhost
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter 
          basename={basename}
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <Routes>
            {/* Публичные роуты */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/role-selection" element={<RoleSelection />} />
            <Route path="/game" element={<GamePage />} />
            <Route path="/game-mode" element={<GameMode />} />
            
            {/* Защищенные роуты с проверкой ролей */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Index />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/parent" 
              element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <ParentDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Parent Learning App - объединяет мониторинг + обучение */}
            <Route 
              path="/parent-app" 
              element={
                <ProtectedRoute allowedRoles={['parent', 'parent_learning']}>
                  <ParentHub />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/curator" 
              element={
                <ProtectedRoute allowedRoles={['curator']}>
                  <CuratorDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Тестовая страница для Rive анимации */}
            <Route path="/rive-test" element={<RiveTest />} />
            {/* Экспериментальный чатовый экран временно отключен, чтобы не путать пользователей */}
            {/* <Route path="/replika-test" element={<ReplikaTest />} /> */}
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
