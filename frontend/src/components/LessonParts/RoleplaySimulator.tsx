import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { CheckCircle, ArrowRight, ArrowLeft, MessageCircle, User, Sparkles } from 'lucide-react';

interface NPC {
  name: string;
  messages: string[];
}

interface Scenario {
  id: string;
  title: string;
  context: string;
  npc: NPC;
  goodResponses: string[];
}

interface RoleplaySimulatorProps {
  scenarios: Scenario[];
  onComplete?: (data: any) => void;
}

export default function RoleplaySimulator({ scenarios, onComplete }: RoleplaySimulatorProps) {
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [userResponse, setUserResponse] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [responseQuality, setResponseQuality] = useState<'excellent' | 'good' | 'needs-work' | null>(null);
  const [completedScenarios, setCompletedScenarios] = useState<string[]>([]);

  const currentScenario = scenarios[currentScenarioIndex];
  const isLastScenario = currentScenarioIndex === scenarios.length - 1;
  const isLastMessage = currentMessageIndex === currentScenario.npc.messages.length - 1;

  const evaluateResponse = (response: string): 'excellent' | 'good' | 'needs-work' => {
    const lowerResponse = response.toLowerCase();
    const goodKeywords = ['я', 'понимаю', 'чувствую', 'могу', 'давай', 'нет', 'границы', 'важно'];
    const badKeywords = ['извини', 'прости', 'ладно', 'ок', 'хорошо'];
    
    const goodMatches = goodKeywords.filter(kw => lowerResponse.includes(kw)).length;
    const badMatches = badKeywords.filter(kw => lowerResponse.includes(kw)).length;
    
    if (goodMatches >= 3 && response.length > 50) return 'excellent';
    if (goodMatches >= 2 || response.length > 30) return 'good';
    return 'needs-work';
  };

  const handleResponse = () => {
    const quality = evaluateResponse(userResponse);
    setResponseQuality(quality);
    setShowFeedback(true);

    setTimeout(() => {
      if (isLastMessage) {
        setCompletedScenarios([...completedScenarios, currentScenario.id]);
        if (isLastScenario) {
          onComplete?.({
            completedScenarios: [...completedScenarios, currentScenario.id],
            totalScenarios: scenarios.length
          });
        } else {
          setCurrentScenarioIndex(currentScenarioIndex + 1);
          setCurrentMessageIndex(0);
          setUserResponse('');
          setShowFeedback(false);
          setResponseQuality(null);
        }
      } else {
        setCurrentMessageIndex(currentMessageIndex + 1);
        setUserResponse('');
        setShowFeedback(false);
        setResponseQuality(null);
      }
    }, 3000);
  };

  const handleSkip = () => {
    if (isLastScenario) {
      onComplete?.({
        completedScenarios,
        totalScenarios: scenarios.length
      });
    } else {
      setCurrentScenarioIndex(currentScenarioIndex + 1);
      setCurrentMessageIndex(0);
      setUserResponse('');
      setShowFeedback(false);
      setResponseQuality(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between text-xs text-purple-600">
        <span className="font-semibold">Сценарий {currentScenarioIndex + 1} из {scenarios.length}</span>
        <span>{completedScenarios.length} завершено ✓</span>
      </div>

      {/* Scenario Context */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300">
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-2 flex items-center gap-2 text-purple-900">
            <MessageCircle size={16} className="text-purple-600" />
            {currentScenario.title}
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed">{currentScenario.context}</p>
        </CardContent>
      </Card>

      {/* NPC Message */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentScenarioIndex}-${currentMessageIndex}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="flex gap-2"
        >
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <User size={18} className="text-white" />
            </div>
          </div>
          <Card className="flex-1 bg-white border-2 border-purple-200">
            <CardContent className="p-3">
              <p className="text-xs font-medium text-purple-900 mb-1">{currentScenario.npc.name}</p>
              <p className="text-sm text-slate-800">{currentScenario.npc.messages[currentMessageIndex]}</p>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* User Response Area */}
      {!showFeedback && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300">
            <CardContent className="p-4">
              <label className="block text-xs font-semibold text-emerald-900 mb-2">
                Твой ответ:
              </label>
              <textarea
                value={userResponse}
                onChange={e => setUserResponse(e.target.value)}
                placeholder="Напиши, как бы ты ответил в этой ситуации..."
                className="w-full h-24 p-3 border-2 border-emerald-300 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
              <div className="flex gap-2 mt-3">
                <Button
                  onClick={handleResponse}
                  disabled={!userResponse.trim()}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold shadow-lg"
                >
                  Отправить
                  <ArrowRight size={16} className="ml-2" />
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSkip}
                  className="border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                >
                  Пропустить
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Feedback */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <Card className={`border-2 ${
              responseQuality === 'excellent' 
                ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-400' 
                : responseQuality === 'good'
                ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-400'
                : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-400'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {responseQuality === 'excellent' && (
                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                      <CheckCircle size={24} className="text-white" />
                    </div>
                  )}
                  {responseQuality === 'good' && (
                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                      <Sparkles size={24} className="text-white" />
                    </div>
                  )}
                  {responseQuality === 'needs-work' && (
                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                      <ArrowRight size={24} className="text-white" />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h4 className={`font-bold text-base mb-2 ${
                      responseQuality === 'excellent' 
                        ? 'text-emerald-900' 
                        : responseQuality === 'good'
                        ? 'text-blue-900'
                        : 'text-amber-900'
                    }`}>
                      {responseQuality === 'excellent' && '✨ Отличный ответ!'}
                      {responseQuality === 'good' && '👍 Хороший ответ!'}
                      {responseQuality === 'needs-work' && '💪 Можно лучше!'}
                    </h4>
                    
                    <p className="text-sm text-slate-700 leading-relaxed mb-3">
                      {responseQuality === 'excellent' && 
                        'Ты чётко выразил(а) свои границы, проявил(а) уважение к себе и собеседнику. Так держать!'}
                      {responseQuality === 'good' && 
                        'Хороший ответ! Можно было бы быть чуть более конкретным(ой) в формулировках границ.'}
                      {responseQuality === 'needs-work' && 
                        'Попробуй использовать "Я-сообщения" и чётче обозначить свою позицию без извинений.'}
                    </p>

                    <div className="bg-white/70 rounded-xl p-3 border border-purple-200">
                      <p className="text-[10px] font-semibold text-purple-600 mb-1 uppercase tracking-wide">Пример здорового ответа:</p>
                      <p className="text-xs text-slate-700 italic">
                        {currentScenario.goodResponses[0]}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
