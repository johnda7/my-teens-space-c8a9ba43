
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
      <h3 className="text-lg font-bold mb-2">{question.title}</h3>
      <p className="mb-4">{question.question}</p>
      
      <div className="mb-4">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={question.placeholder}
        />
        <Button onClick={handleTextSubmit} className="mt-2 w-full">
          <Send className="mr-2 h-4 w-4" /> Отправить текст
        </Button>
      </div>

      {question.options && (question.options as { voice?: boolean }).voice && (
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-2">Или запиши голосовое</p>
          <motion.button
            onClick={handleVoiceRecording}
            className={`p-4 rounded-full ${isRecording ? 'bg-red-500' : 'bg-purple-500'} text-white`}
            whileTap={{ scale: 1.1 }}
          >
            <Mic size={32} />
          </motion.button>
          {isRecording && <p className="text-red-500 animate-pulse mt-2">Запись...</p>}
        </div>
      )}
    </div>
  );
};
