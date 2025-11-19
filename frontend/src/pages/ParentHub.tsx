import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ParentDashboard from './ParentDashboard';
import ParentLearning from './ParentLearning';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const ParentHub = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('children');

  return (
    <div className="min-h-screen bg-tg-secondary-bg text-tg-text">
      <div className="sticky top-0 z-50 bg-tg-bg/80 backdrop-blur-xl border-b border-tg-hint/20 p-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Родительский центр</h1>
        </div>
      </div>

      <Tabs defaultValue="children" className="w-full" onValueChange={setActiveTab}>
        <div className="px-4 pt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="children">Мои дети</TabsTrigger>
            <TabsTrigger value="learning">Обучение</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="children" className="mt-0">
          <div className="pb-20">
             <ParentDashboard embedded={true} />
          </div>
        </TabsContent>

        <TabsContent value="learning" className="mt-0">
          <ParentLearning onBack={() => setActiveTab('children')} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ParentHub;
