import { Menu, Moon, Sun, X, Clock, BookOpen, Info, Wifi, WifiOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ChatThread } from '../types';

interface HeaderProps {
  threads?: ChatThread[];
  onThreadSelect?: (id: string) => void;
  remainingRequests?: number;
  dailyLimit?: number;
}

type Panel = 'history' | 'docs' | 'about' | null;

export default function Header({ threads = [], onThreadSelect, remainingRequests = 10, dailyLimit = 10 }: HeaderProps) {
  const [isDark, setIsDark] = useState(false);
  const [activePanel, setActivePanel] = useState<Panel>(null);
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);

  // Dark mode toggle
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Server health check — polls every 30s
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/api/health', { method: 'GET', signal: AbortSignal.timeout(5000) });
        setServerOnline(res.ok);
      } catch {
        setServerOnline(false);
      }
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  const togglePanel = (panel: Panel) => {
    setActivePanel(prev => (prev === panel ? null : panel));
  };

  const handleThreadClick = (id: string) => {
    onThreadSelect?.(id);
    setActivePanel(null);
  };

  return (
    <>
      {/* ── Header bar ── z-40 (below panel) */}
      <header className="fixed top-0 right-0 left-0 md:left-72 z-40 flex justify-between items-center px-6 md:px-10 py-5 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-4">
          <button className="md:hidden p-1 text-foreground">
            <Menu className="w-6 h-6" />
          </button>
          {/* Server status indicator */}
          <div className="flex items-center gap-2">
            {serverOnline === null ? (
              <span className="w-2 h-2 bg-muted rounded-full animate-pulse" />
            ) : serverOnline ? (
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            ) : (
              <span className="w-2 h-2 bg-red-500 rounded-full" />
            )}
            <h2 className={`text-sm font-bold tracking-tight ${
              serverOnline === null
                ? 'text-muted'
                : serverOnline
                ? 'text-foreground'
                : 'text-red-500'
            }`}>
              {serverOnline === null
                ? 'Checking...'
                : serverOnline
                ? 'Server Online'
                : 'Server Offline'}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <nav className="hidden lg:flex items-center gap-6 pr-6 border-r border-border">
            {(['history', 'docs', 'about'] as Panel[]).map((tab) => (
              <button
                key={tab}
                onClick={() => togglePanel(tab)}
                className={`font-semibold text-sm transition-colors capitalize ${
                  activePanel === tab
                    ? 'text-brand'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {/* Request counter badge */}
            <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
              remainingRequests === 0
                ? 'border-red-400/40 text-red-500 bg-red-50 dark:bg-red-950/30'
                : remainingRequests <= 3
                ? 'border-amber-400/40 text-amber-600 bg-amber-50 dark:bg-amber-950/30'
                : 'border-border text-muted bg-sidebar'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                remainingRequests === 0 ? 'bg-red-500' : remainingRequests <= 3 ? 'bg-amber-500' : 'bg-green-500'
              }`} />
              {remainingRequests}/{dailyLimit} today
            </div>

            <button
              onClick={() => setIsDark(!isDark)}
              className="w-8 h-8 flex items-center justify-center text-muted hover:text-brand bg-muted/5 rounded-lg transition-colors border border-border"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Backdrop — z-[60]: above header (40) + chatinput (50) ── */}
      {activePanel && (
        <div
          className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm"
          onClick={() => setActivePanel(null)}
        />
      )}

      {/* ── Slide-in panel — z-[70]: topmost ── */}
      {activePanel && (
        <aside className="fixed top-0 right-0 h-full w-full max-w-md z-[70] bg-background border-l border-border shadow-2xl flex flex-col animate-fade-in overflow-hidden">
          {/* Panel header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-border">
            <div className="flex items-center gap-3">
              {activePanel === 'history' && <Clock className="w-5 h-5 text-brand" />}
              {activePanel === 'docs' && <BookOpen className="w-5 h-5 text-brand" />}
              {activePanel === 'about' && <Info className="w-5 h-5 text-brand" />}
              <h3 className="text-base font-bold text-foreground capitalize">{activePanel}</h3>
            </div>
            <button
              onClick={() => setActivePanel(null)}
              className="w-8 h-8 flex items-center justify-center text-muted hover:text-foreground hover:bg-border/50 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Panel body */}
          <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-4">

            {/* ─── HISTORY ─── */}
            {activePanel === 'history' && (
              <>
                {threads.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center gap-3">
                    <Clock className="w-10 h-10 text-muted/30" />
                    <p className="text-muted text-sm font-medium">No conversations yet.</p>
                    <p className="text-muted/60 text-xs">Start a chat to see your history here.</p>
                  </div>
                ) : (
                  threads.map(t => (
                    <button
                      key={t.id}
                      onClick={() => handleThreadClick(t.id)}
                      className="w-full text-left px-4 py-4 rounded-xl border border-border hover:border-brand/40 hover:bg-brand-light transition-all group"
                    >
                      <p className="text-sm font-semibold text-foreground truncate group-hover:text-brand transition-colors">{t.title}</p>
                      <p className="text-[11px] text-muted mt-1 font-medium">{t.lastUpdate}</p>
                    </button>
                  ))
                )}
              </>
            )}

            {/* ─── DOCS ─── */}
            {activePanel === 'docs' && (
              <div className="space-y-6 text-sm leading-relaxed">
                <div className="p-4 rounded-xl bg-brand-light border border-brand/20">
                  <p className="text-brand font-bold text-xs uppercase tracking-widest mb-1">Getting Started</p>
                  <p className="text-foreground font-medium">Fusion Intelligence is a conversational AI assistant designed to help you query Oracle Fusion dashboard data using natural language.</p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-foreground text-xs uppercase tracking-widest">How to ask effective questions</h4>
                  <div className="space-y-2">
                    {[
                      { label: '✅ Be specific', desc: 'Include time periods, supplier names, or PO numbers when possible. e.g. "Show me open POs from last month"' },
                      { label: '✅ Name your entity', desc: 'Mention what you\'re looking for — Purchase Orders, Invoices, Receipts, Suppliers. e.g. "List all unpaid invoices for Supplier XYZ"' },
                      { label: '✅ State your goal', desc: 'Mention what you want to do — summarize, list, filter, compare. e.g. "Summarize overdue deliveries by region"' },
                      { label: '⚠️ Avoid vague questions', desc: 'Questions like "Show me data" are too broad. Always add context about what type of data you need.' },
                      { label: '⚠️ One task at a time', desc: 'For best results, ask one question per message rather than combining multiple queries.' },
                    ].map((item, i) => (
                      <div key={i} className="p-4 rounded-xl border border-border bg-background">
                        <p className="font-bold text-foreground mb-1">{item.label}</p>
                        <p className="text-muted">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-foreground text-xs uppercase tracking-widest">Example prompts</h4>
                  {[
                    'What are the top 5 suppliers by invoice value this quarter?',
                    'Show me all purchase orders with a total above ₹10 lakhs',
                    'List overdue invoices from April 2025',
                    'Which POs have not been received yet?',
                    'Summarize pending approvals for the current week',
                  ].map((prompt, i) => (
                    <div key={i} className="px-4 py-2.5 rounded-lg bg-sidebar border border-border text-muted text-xs font-mono">
                      {prompt}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── ABOUT ─── */}
            {activePanel === 'about' && (
              <div className="space-y-6 text-sm">
                <div className="flex flex-col items-center text-center gap-4 py-8">
                  <div className="w-16 h-16 bg-brand flex items-center justify-center rounded-2xl text-white shadow-lg shadow-brand/30">
                    <Info className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-foreground tracking-tight">Fusion Intelligence</h3>
                    <p className="text-muted text-xs font-semibold uppercase tracking-widest mt-1">Oracle Fusion PO Dashboard Assistant</p>
                  </div>
                  {/* Live server status in about panel */}
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${
                    serverOnline === null
                      ? 'border-muted/30 text-muted bg-muted/10'
                      : serverOnline
                      ? 'border-green-500/30 text-green-600 bg-green-50 dark:bg-green-950/30'
                      : 'border-red-500/30 text-red-600 bg-red-50 dark:bg-red-950/30'
                  }`}>
                    {serverOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                    {serverOnline === null ? 'Checking server...' : serverOnline ? 'Backend API online' : 'Backend API offline'}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-border bg-background space-y-2">
                    <p className="text-xs font-bold text-brand uppercase tracking-widest">What is this?</p>
                    <p className="text-foreground leading-relaxed font-medium">
                      Fusion Intelligence is an AI-powered assistant built to help Oracle Fusion users query and analyze Purchase Order (PO) dashboard data using natural language — no SQL or technical knowledge required.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-background space-y-2">
                    <p className="text-xs font-bold text-brand uppercase tracking-widest">Capabilities</p>
                    <ul className="space-y-1.5 text-foreground font-medium">
                      {[
                        'Query PO status, supplier data, and invoice details',
                        'Filter and summarize transactional data',
                        'Get insights on approvals, receipts, and payments',
                        'Ask follow-up questions in natural language',
                      ].map((cap, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-brand rounded-full mt-1.5 flex-shrink-0" />
                          {cap}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl border border-brand/20 bg-brand-light space-y-2">
                    <p className="text-xs font-bold text-brand uppercase tracking-widest">Contact & Support</p>
                    <p className="text-foreground font-medium leading-relaxed">
                      For any queries, issues, or feedback, please reach out to:
                    </p>
                    <a
                      href="mailto:vijayybala.31@gmail.com"
                      className="inline-flex items-center gap-2 font-bold text-brand hover:underline transition-all"
                    >
                      vijayybala.31@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      )}
    </>
  );
}
