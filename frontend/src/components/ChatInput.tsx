import React, { useState } from 'react';
import { ArrowUp, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading?: boolean;
  remainingRequests?: number;
}

export default function ChatInput({ onSendMessage, isLoading = false, remainingRequests = 10 }: ChatInputProps) {
  const [input, setInput] = useState('');
  const limitReached = remainingRequests <= 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading && !limitReached) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <footer className="fixed bottom-0 right-0 left-0 md:left-72 px-4 md:px-8 pb-5 pt-3 pointer-events-none z-30">
      <div className="max-w-3xl mx-auto w-full pointer-events-auto">
        {limitReached && (
          <div className="mb-2 px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold text-center">
            Daily limit reached (10/10). Resets at midnight.
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading || limitReached}
              rows={1}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted/50 resize-none focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              placeholder={
                limitReached
                  ? 'Daily limit reached. Resets at midnight.'
                  : isLoading
                  ? 'Processing...'
                  : 'Ask anything about your purchase orders...'
              }
              style={{ minHeight: '44px', maxHeight: '160px' }}
              onInput={e => {
                const el = e.currentTarget;
                el.style.height = 'auto';
                el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
              }}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading || limitReached}
            className="w-10 h-10 flex items-center justify-center bg-brand text-white rounded-xl disabled:opacity-30 hover:bg-brand/90 active:scale-95 transition-all flex-shrink-0 shadow-md shadow-brand/20"
          >
            {isLoading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            }
          </button>
        </form>

        <p className="text-center text-[10px] text-muted/50 font-medium mt-2 uppercase tracking-widest">
          Powered by Fusion Intelligence
        </p>
      </div>
    </footer>
  );
}
