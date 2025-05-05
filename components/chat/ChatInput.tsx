import React, { useEffect, useImperativeHandle, useState, useRef } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSend?: (message: string) => void;
  maxLength?: number;
  placeholder?: string;
  initialMessage?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
  height?: 'sm' | 'md' | 'lg';
}

const ChatInput = React.forwardRef(({
  onSend,
  maxLength = 2000,
  placeholder = "Start a new conversation...",
  initialMessage = '',
  isLoading = false,
  isDisabled = false,
  height = 'md',
}: ChatInputProps, ref: React.ForwardedRef<{ clear: () => void }>) => {
  const [message, setMessage] = useState(initialMessage);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Helper function to get height class
  const getHeightClass = () => {
    switch (height) {
      case 'sm':
        return 'min-h-[70px]';
      case 'lg':
        return 'min-h-[100px]';
      default: // 'md'
        return 'min-h-[85px]';
    }
  };

  useEffect(() => {
    setMessage(initialMessage);
  }, [initialMessage]);

  useImperativeHandle(ref, () => ({
    clear: () => setMessage(''),
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && message.length <= maxLength && !isLoading) {
      onSend?.(message);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setMessage(newValue);
  };

  const heightClass = getHeightClass();

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className={`relative rounded-lg backdrop-blur-md bg-gray-800/30 border border-gray-700/40 w-full transition-colors ${isFocused ? 'border-gray-400/40' : ''}`}>
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={3}
            className={`w-full bg-transparent px-2 py-2 text-xs text-gray-200 placeholder-gray-400 outline-none resize-none ${heightClass} absolute inset-0 caret-gray-200`}
            maxLength={maxLength}
            disabled={isLoading}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          <div className={`w-full bg-transparent px-2 py-2 text-xs text-gray-200 ${heightClass} whitespace-pre-wrap pointer-events-none`}>
            {message ? message : (
              <span className="text-gray-400">{placeholder}</span>
            )}
          </div>
        </div>

        <div className="absolute bottom-1.5 right-1.5 flex items-center gap-2">
          <span className="text-[10px] text-gray-400">
            {message.length}/{maxLength}
          </span>
          <button
            type="submit"
            disabled={!message.trim() || message.length > maxLength || isLoading || isDisabled}
            className="p-1.5 rounded-md bg-gray-500/20 text-gray-200 hover:bg-gray-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <ArrowRight size={14} />
            )}
          </button>
        </div>
      </div>
    </form>
  );
});

ChatInput.displayName = 'ChatInput';

export default ChatInput;