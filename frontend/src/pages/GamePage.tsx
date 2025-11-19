import React from 'react';
import { useNavigate } from 'react-router-dom';
import GameLessonUltra from '@/components/GameLesson/GameLessonUltra';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const GamePage = () => {
  const navigate = useNavigate();

  const handleComplete = (summary: any) => {
    console.log('Game completed:', summary);
    // Here you would typically save progress to the backend
    navigate('/');
  };

  const handleExit = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <GameLessonUltra 
        onComplete={handleComplete}
        onExit={handleExit}
      />
    </div>
  );
};

export default GamePage;
