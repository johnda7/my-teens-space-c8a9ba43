import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart } from 'lucide-react';
import { ChatMessage } from '@/components/ReplikaChat/ChatMessage';
import { ChatInput } from '@/components/ReplikaChat/ChatInput';

interface LessonStep {
  text?: string;
  delay?: number;
  question?: string;
  waitForAnswer?: boolean;
}

type Sender = 'katya' | 'user';
interface Message {
  id: number;
  text: string;
  sender: Sender;
}

const lessonScript: LessonStep[] = [
  { text: 'Привет! Я Катя 💜', delay: 600 },
  { text: 'Сегодня мы начнем первый урок про личные границы.', delay: 1800 },
  { text: 'Это разговорный формат. Я буду задавать вопросы, а ты делиться мыслями.', delay: 2200 },
  { question: 'Как ты чувствуешь границы? Что для тебя значит "сказать нет"?', waitForAnswer: true }
];

export default function ReplikaTest() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [canAnswer, setCanAnswer] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    playStep(stepIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const playStep = (index: number) => {
    const step = lessonScript[index];
    if (!step) return;

    if (step.text) {
      setIsTyping(true);
      setTimeout(() => {
        pushMessage(step.text!, 'katya');
        setIsTyping(false);
        setStepIndex((prev) => prev + 1);
        setTimeout(() => playStep(index + 1), step.delay || 1500);
      }, step.delay || 1000);
    } else if (step.question) {
      setIsTyping(true);
      setTimeout(() => {
        pushMessage(step.question!, 'katya');
        setIsTyping(false);
        setCanAnswer(true);
      }, 1000);
    }
  };

  const pushMessage = (text: string, sender: Sender) => {
    setMessages((prev) => [...prev, { id: Date.now(), text, sender }]);
  };

  const handleSend = (text: string) => {
    pushMessage(text, 'user');
    setCanAnswer(false);

    setTimeout(() => {
      pushMessage('Спасибо, что делишься. Давай продолжим в этом формате 💜', 'katya');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 via-white to-white">
      <header className="p-4 flex items-center justify-between bg-white/80 backdrop-blur border-b">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100">
          <ArrowLeft size={22} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 text-white flex items-center justify-center text-lg font-semibold">
            К
          </div>
          <div>
            <p className="text-sm font-semibold">Катя</p>
            <p className="text-xs text-green-500">онлайн</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-purple-500 font-semibold">
          <Heart size={18} />
          <span>15</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg.text} sender={msg.sender} />
        ))}
        {isTyping && <ChatMessage message="" sender="katya" isTyping />}
        <div ref={endRef} />
      </main>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 pb-2 text-xs text-center text-gray-400"
      >
        Lesson 1 · Boundaries · Chat Mode
      </motion.div>

      <ChatInput onSend={handleSend} disabled={!canAnswer} placeholder="Ответь Кате..." />
    </div>
  );
}
