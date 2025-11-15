import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Lightbulb, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Choice {
  id: string;
  text: string;
  isHealthy: boolean;
  feedback: string;
  consequence: string;
  skillsUsed: string[];
}

interface RealWorldScenarioProps {
  title: string;
  context: string;
  situation: string;
  choices: Choice[];
  onComplete?: (data: { scenarioId: string; selectedChoice: string; isHealthy: boolean }) => void;
}

export default function RealWorldScenario({
  title,
  context,
  situation,
  choices,
  onComplete
}: RealWorldScenarioProps) {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleChoiceSelect = (choiceId: string) => {
    setSelectedChoice(choiceId);
    setShowResult(true);
    
    const choice = choices.find(c => c.id === choiceId);
    if (choice && onComplete) {
      onComplete({
        scenarioId: title,
        selectedChoice: choiceId,
        isHealthy: choice.isHealthy
      });
    }
  };

  const handleTryAgain = () => {
    setSelectedChoice(null);
    setShowResult(false);
  };

  const selectedChoiceData = choices.find(c => c.id === selectedChoice);

  return (
    <div className="space-y-4">
      {/* Context Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/60 backdrop-blur-[20px] rounded-3xl p-6 border border-white/20 shadow-ios-soft"
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="ios-title text-gray-900 mb-1">{title}</h3>
            <p className="ios-caption text-gray-600">{context}</p>
          </div>
        </div>
        
        {/* Situation */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100">
          <p className="ios-body text-gray-800 leading-relaxed">{situation}</p>
        </div>
      </motion.div>

      {/* Choices */}
      {!showResult && (
        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="ios-body text-gray-700 font-semibold px-2">Как ты поступишь?</p>
          {choices.map((choice, index) => (
            <motion.button
              key={choice.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index, type: "spring", stiffness: 400, damping: 17 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleChoiceSelect(choice.id)}
              className="w-full bg-white/70 backdrop-blur-[20px] rounded-2xl p-4 border border-white/30 hover:border-purple-200 hover:shadow-[0_8px_24px_rgba(139,92,246,0.15)] transition-all text-left group"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0 group-hover:from-purple-100 group-hover:to-pink-100 transition-all">
                  <span className="text-sm font-bold text-gray-600 group-hover:text-purple-600">
                    {String.fromCharCode(65 + index)}
                  </span>
                </div>
                <p className="ios-body text-gray-800 flex-1">{choice.text}</p>
              </div>
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Result */}
      <AnimatePresence>
        {showResult && selectedChoiceData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="space-y-4"
          >
            {/* Feedback Card */}
            <Card className={`border-2 ${
              selectedChoiceData.isHealthy 
                ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100' 
                : 'border-rose-200 bg-gradient-to-br from-rose-50 to-rose-100'
            }`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 12, delay: 0.1 }}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      selectedChoiceData.isHealthy 
                        ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' 
                        : 'bg-gradient-to-br from-rose-400 to-rose-600'
                    }`}
                  >
                    {selectedChoiceData.isHealthy ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-white" />
                    )}
                  </motion.div>
                  <div className="flex-1">
                    <h4 className={`ios-title mb-1 ${
                      selectedChoiceData.isHealthy ? 'text-emerald-800' : 'text-rose-800'
                    }`}>
                      {selectedChoiceData.isHealthy ? '✨ Отличный выбор!' : '💭 Есть вариант получше'}
                    </h4>
                    <p className={`ios-body ${
                      selectedChoiceData.isHealthy ? 'text-emerald-700' : 'text-rose-700'
                    }`}>
                      {selectedChoiceData.feedback}
                    </p>
                  </div>
                </div>

                {/* Consequence */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/50 rounded-2xl p-4 mb-4"
                >
                  <p className="text-xs font-semibold text-gray-600 mb-2">Что произойдёт дальше:</p>
                  <p className="ios-body text-gray-800 leading-relaxed">
                    {selectedChoiceData.consequence}
                  </p>
                </motion.div>

                {/* Skills Used */}
                {selectedChoiceData.skillsUsed.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                      <p className="text-xs font-semibold text-purple-700">
                        {selectedChoiceData.isHealthy ? 'Ты применил:' : 'Стоит поработать над:'}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedChoiceData.skillsUsed.map((skill, index) => (
                        <motion.span
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 + index * 0.05 }}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                            selectedChoiceData.isHealthy
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-100 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {skill}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Action Button */}
            {!selectedChoiceData.isHealthy && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  onClick={handleTryAgain}
                  variant="outline"
                  className="w-full rounded-2xl border-purple-200 hover:bg-purple-50"
                >
                  🔄 Попробовать другой вариант
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
