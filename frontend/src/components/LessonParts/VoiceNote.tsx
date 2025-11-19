
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Send } from 'lucide-react';
import { Question } from '@/data/allLessonsData';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface VoiceNoteProps {
  question: Question;
  onAnswer: (answer: { text?: string; voiceUrl?: string }) => void;
}

export const VoiceNote: React.FC<VoiceNoteProps> = ({ question, onAnswer }) => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const handleTextSubmit = () => {
    if (text.trim()) {
      onAnswer({ text });
    }
  };

  const handleVoiceRecording = () => {
    // Placeholder for voice recording logic
    setIsRecording(!isRecording);
    if (isRecording) {
        // onAnswer({ voiceUrl: 'https://example.com/voice.mp3' });
        alert("Voice recording is not implemented yet.")
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-bold mb-2 text-slate-900">{question.title}</h3>
      <p className="mb-6 text-slate-600">{question.question}</p>
      
      <div className="mb-6">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={question.placeholder}
          className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:ring-purple-500/20 min-h-[120px] rounded-2xl shadow-sm"
        />
        <Button 
          onClick={handleTextSubmit} 
          className="mt-4 w-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white font-bold py-6 rounded-2xl shadow-lg shadow-purple-200 hover:brightness-110 border-0"
        >
          <Send className="mr-2 h-4 w-4" /> Отправить текст
        </Button>
      </div>

      {question.options && (question.options as { voice?: boolean }).voice && (
        <div className="text-center">
          <p className="text-sm text-slate-400 mb-4 font-medium uppercase tracking-wider">Или запиши голосовое</p>
          <motion.button
            onClick={handleVoiceRecording}
            className={`p-6 rounded-full ${
              isRecording 
                ? 'bg-rose-500 shadow-lg shadow-rose-200' 
                : 'bg-purple-500 shadow-lg shadow-purple-200'
            } text-white border-4 border-white`}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
          >
            <Mic size={32} />
          </motion.button>
          {isRecording && <p className="text-rose-500 animate-pulse mt-4 font-bold">Запись...</p>}
        </div>
      )}
    </div>
  );
};
