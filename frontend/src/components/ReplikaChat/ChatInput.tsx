import { useState } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ChatInput({ onSend, placeholder = 'Напиши сообщение...', disabled }: ChatInputProps) {
  const [value, setValue] = useState('');

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  };

  return (
    <div className="border-t bg-white p-4">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 px-4 py-2 bg-gray-100 rounded-full outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg disabled:opacity-40"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
