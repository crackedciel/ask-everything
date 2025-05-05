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
  const [suggestion, setSuggestion] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Helper function to get height class
  const getHeightClass = () => {
    switch (height) {
      case 'sm':
        return 'min-h-[100px]';
      case 'lg':
        return 'min-h-[140px]';
      default: // 'md'
        return 'min-h-[120px]';
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

  const insertMention = () => {
    if (!textareaRef.current || !suggestion) return;
    
    const textarea = textareaRef.current;
    const cursorPos = textarea.selectionStart;
    const beforeCursor = message.slice(0, cursorPos);
    const afterCursor = message.slice(cursorPos);
    const lastAtPos = beforeCursor.lastIndexOf('@');
    
    if (lastAtPos === -1) return;
    
    const newMessage = beforeCursor.slice(0, lastAtPos) + '@agoria ' + afterCursor;
    setMessage(newMessage);
    setSuggestion('');
    
    // Set cursor position after the inserted mention
    const newCursorPos = lastAtPos + '@agoria '.length;
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.selectionStart = newCursorPos;
        textareaRef.current.selectionEnd = newCursorPos;
        textareaRef.current.focus();
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    } else if (e.key === 'Tab' && suggestion) {
      e.preventDefault();
      insertMention();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setMessage(newValue);
    
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = newValue.slice(0, cursorPos);
    const lastAtPos = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtPos !== -1) {
      const typedMention = textBeforeCursor.slice(lastAtPos);
      if (typedMention.startsWith('@') && '@agoria'.startsWith(typedMention.toLowerCase())) {
        setSuggestion('@agoria'.slice(typedMention.length));
      } else {
        setSuggestion('');
      }
    } else {
      setSuggestion('');
    }
  };

  // Style the message with purple @mentions
  const renderStyledMessage = () => {
    if (!message) return null;

    const parts = message.split(/(@agoria)/g);
    const styledParts = parts.map((part, index) => 
      part === '@agoria' ? (
        <span key={index} className="text-purple-400">{part}</span>
      ) : part
    );

    // Add suggestion if exists
    if (suggestion && textareaRef.current) {
      const cursorPos = textareaRef.current.selectionStart;
      const textBeforeCursor = message.slice(0, cursorPos);
      const lastAtPos = textBeforeCursor.lastIndexOf('@');
      
      if (lastAtPos !== -1) {
        const typedMention = textBeforeCursor.slice(lastAtPos);
        if ('@agoria'.startsWith(typedMention.toLowerCase())) {
          return (
            <>
              {styledParts}
              <span className="text-purple-300/70">{suggestion}</span>
            </>
          );
        }
      }
    }

    return styledParts;
  };

  const heightClass = getHeightClass();

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className={`relative rounded-xl backdrop-blur-md bg-gray-800/30 border border-gray-700/40 w-full transition-colors ${isFocused ? 'border-gray-400/30' : ''}`}>
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={4}
            className={`w-full bg-transparent px-4 py-4 text-sm text-gray-200 placeholder-gray-400 outline-none resize-none ${heightClass} absolute inset-0 caret-gray-200`}
            maxLength={maxLength}
            disabled={isLoading}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          <div className={`w-full bg-transparent px-4 py-4 text-sm text-gray-200 ${heightClass} whitespace-pre-wrap pointer-events-none`}>
            {message || suggestion ? renderStyledMessage() : (
              <span className="text-gray-400">{placeholder}</span>
            )}
          </div>
        </div>

        <div className="absolute bottom-3 right-3 flex items-center gap-3">
          <span className="text-xs text-gray-400">
            {message.length}/{maxLength}
          </span>
          <button
            type="submit"
            disabled={!message.trim() || message.length > maxLength || isLoading || isDisabled}
            className="p-2 rounded-md bg-gray-500/20 text-gray-200 hover:bg-gray-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <ArrowRight size={18} />
            )}
          </button>
        </div>
      </div>
    </form>
  );
});

ChatInput.displayName = 'ChatInput';

export default ChatInput;