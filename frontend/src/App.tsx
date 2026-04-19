import { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import LoadingMessage from './components/LoadingMessage';
import { Message, ChatThread } from './types';

const STORAGE_KEY = 'stitch_chat_history';
const USAGE_KEY = 'fusion_daily_usage';
const DAILY_LIMIT = 15;
const MAX_THREADS = 10;
const MAX_AGE_DAYS = 15;

// ─── Daily usage helpers ───────────────────────────────────────────────────
const todayStr = () => new Date().toISOString().split('T')[0];

function getUsageToday(): number {
  try {
    const raw = localStorage.getItem(USAGE_KEY);
    if (!raw) return 0;
    const { date, count } = JSON.parse(raw);
    return date === todayStr() ? (count as number) : 0;
  } catch {
    return 0;
  }
}

function incrementUsage(): number {
  const count = getUsageToday() + 1;
  localStorage.setItem(USAGE_KEY, JSON.stringify({ date: todayStr(), count }));
  return count;
}

// ─── Thread pruning ────────────────────────────────────────────────────────
function pruneThreads(threads: ChatThread[]): ChatThread[] {
  const cutoff = Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  return threads
    .filter(t => {
      // Keep threads without createdAt (legacy) or those within age limit
      if (!t.createdAt) return true;
      return new Date(t.createdAt).getTime() > cutoff;
    })
    .slice(0, MAX_THREADS);
}

// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  const [threads, setThreads] = useState<ChatThread[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed: ChatThread[] = saved ? JSON.parse(saved) : [];
      return pruneThreads(parsed);
    } catch {
      return [];
    }
  });

  // null = fresh (empty) chat on every page load
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [usedToday, setUsedToday] = useState<number>(getUsageToday);

  const remainingRequests = Math.max(0, DAILY_LIMIT - usedToday);

  const activeThread = threads.find(t => t.id === activeThreadId);
  const messages = activeThread ? activeThread.messages : [];

  const scrollRef = useRef<HTMLDivElement>(null);

  // Persist to localStorage whenever threads change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
  }, [threads]);

  // Auto-scroll on new messages or loading state change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleNewChat = () => setActiveThreadId(null);

  const handleThreadSelect = (id: string) => setActiveThreadId(id);

  const handleSendMessage = async (content: string) => {
    if (isLoading) return;
    if (remainingRequests <= 0) return; // limit reached

    // ── Determine the thread ID BEFORE any state mutation so we never
    //    accidentally capture a stale/mutated closure variable.
    const isNewThread = !activeThreadId;
    const threadId = activeThreadId ?? `thread-${Date.now()}`;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: timeStr,
    };

    if (isNewThread) {
      const newThread: ChatThread = {
        id: threadId,
        title: content.slice(0, 35) + (content.length > 35 ? '...' : ''),
        lastUpdate: timeStr,
        createdAt: now.toISOString(),
        messages: [newMessage],
      };
      setThreads(prev => pruneThreads([newThread, ...prev]));
      setActiveThreadId(threadId);
    } else {
      setThreads(prev =>
        prev.map(t =>
          t.id === threadId
            ? { ...t, messages: [...t.messages, newMessage], lastUpdate: timeStr }
            : t
        )
      );
    }

    setIsLoading(true);

    // Increment usage counter
    const newCount = incrementUsage();
    setUsedToday(newCount);

    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: content }),
      });

      let responseText: string;
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ detail: 'Unknown error' }));
        responseText = `**Error ${res.status}:** ${errBody.detail ?? 'Something went wrong.'}`;
      } else {
        const data = await res.json();
        responseText = data.response ?? 'No response received.';
      }

      const aiResponse: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      // Use threadId (stable, captured before async gap) — never touches other threads
      setThreads(prev =>
        prev.map(t =>
          t.id === threadId ? { ...t, messages: [...t.messages, aiResponse] } : t
        )
      );
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Network error — could not reach the backend.';
      const errResponse: Message = {
        id: `msg-${Date.now() + 2}`,
        role: 'assistant',
        content: `⚠️ ${errorMsg}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setThreads(prev =>
        prev.map(t =>
          t.id === threadId ? { ...t, messages: [...t.messages, errResponse] } : t
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        threads={threads}
        activeThreadId={activeThreadId}
        onNewChat={handleNewChat}
        onThreadSelect={handleThreadSelect}
      />

      <main className="flex-1 flex flex-col relative bg-background h-full">
        <Header
          threads={threads}
          onThreadSelect={handleThreadSelect}
          remainingRequests={remainingRequests}
          dailyLimit={DAILY_LIMIT}
        />

        <section
          ref={scrollRef}
          className="flex-1 overflow-y-auto pt-20 pb-36 scrollbar-hide px-4 md:px-8 lg:px-16 flex flex-col"
        >
          {messages.length === 0 && !isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in">
              <h1 className="text-2xl md:text-4xl font-black tracking-tight text-foreground/20 mb-3">
                How can I help you today?
              </h1>
              <p className="text-xs text-muted/50 font-medium">
                {remainingRequests} of {DAILY_LIMIT} requests remaining today
              </p>
            </div>
          ) : (
            <div className="space-y-6 pb-10 w-full max-w-4xl mx-auto">
              {messages.map(msg => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              {isLoading && <LoadingMessage />}
            </div>
          )}
        </section>

        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          remainingRequests={remainingRequests}
        />
      </main>
    </div>
  );
}
