import { motion } from 'framer-motion';

export interface ChatMessageProps {
  message: string;
  sender: 'katya' | 'user';
  timestamp?: string;
  isTyping?: boolean;
}

export function ChatMessage({ message, sender, timestamp, isTyping }: ChatMessageProps) {
  const isUser = sender === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex items-end gap-2 max-w-[80%] ${isUser ? 'flex-row-reverse' : ''}`}>
        {!isUser && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-sm">
            К
          </div>
        )}

        <div
          className={`px-4 py-2 rounded-2xl text-sm shadow-sm ${
            isUser
              ? 'bg-purple-500 text-white rounded-br-sm'
              : 'bg-white text-gray-800 rounded-bl-sm'
          }`}
        >
          {isTyping ? (
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-white/70 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-white/70 rounded-full animate-bounce [animation-delay:0.1s]" />
              <span className="w-2 h-2 bg-white/70 rounded-full animate-bounce [animation-delay:0.2s]" />
            </div>
          ) : (
            message
          )}
        </div>
      </div>
      {timestamp && <span className="text-xs text-gray-400 mt-1">{timestamp}</span>}
    </motion.div>
  );
}
