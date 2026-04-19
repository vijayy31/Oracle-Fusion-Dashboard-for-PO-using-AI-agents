import { Sparkles, Plus, Settings } from 'lucide-react';
import { ChatThread } from '../types';

interface SidebarProps {
  threads: ChatThread[];
  activeThreadId: string | null;
  onNewChat: () => void;
  onThreadSelect: (id: string) => void;
}

export default function Sidebar({ threads, activeThreadId, onNewChat, onThreadSelect }: SidebarProps) {
  const history = threads.filter(t => !t.isPinned && !t.isArchived);

  return (
    <aside className="hidden md:flex flex-col h-screen w-72 bg-sidebar p-6 border-r border-border shadow-sm">
      <div className="flex items-center gap-3 mb-12 px-2">
        <div className="w-10 h-10 bg-brand flex items-center justify-center rounded-xl text-white shadow-lg shadow-brand/20">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg font-bold tracking-tight text-foreground leading-none">Fusion</h1>
          <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-1">Intelligence</p>
        </div>
      </div>

      <button 
        onClick={onNewChat}
        className="flex items-center gap-3 w-full px-5 py-3.5 bg-foreground text-white rounded-xl shadow-md hover:bg-foreground/90 transition-all font-semibold text-sm group"
      >
        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
        <span>New Chat</span>
      </button>

      <nav className="flex-1 space-y-8 overflow-y-auto py-8 scrollbar-hide">


        <div className="space-y-4">
          <p className="text-[10px] text-muted font-bold uppercase tracking-widest px-2">History</p>
          <div className="space-y-1">
            {history.map(item => (
              <a 
                key={item.id}
                onClick={(e) => {
                  e.preventDefault();
                  onThreadSelect(item.id);
                }}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all font-medium text-sm cursor-pointer ${
                  activeThreadId === item.id
                    ? 'bg-brand-light text-brand border border-brand/20'
                    : 'text-foreground/80 hover:text-brand hover:bg-brand-light'
                }`}
              >
                <div className="w-1.5 h-1.5 bg-border rounded-full" />
                <span className="truncate">{item.title}</span>
              </a>
            ))}
          </div>
        </div>
      </nav>

      <div className="pt-6 border-t border-border space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-foreground/60 hover:text-foreground hover:bg-border/50 rounded-lg transition-all font-medium text-sm">
          <Settings className="w-4 h-4" />
          <span>Dashboard</span>
        </button>
      </div>
    </aside>
  );
}
