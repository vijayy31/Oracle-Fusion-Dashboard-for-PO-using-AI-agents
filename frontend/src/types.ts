export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  elements?: ContentElement[];
}

export type ContentElement = 
  | { type: 'text'; content: string }
  | { type: 'grid'; items: { title: string; subtitle: string }[] }
  | { type: 'quote'; content: string };

export interface ChatThread {
  id: string;
  title: string;
  lastUpdate: string;
  createdAt: string;        // ISO timestamp for age-based pruning
  isPinned?: boolean;
  isArchived?: boolean;
  messages: Message[];
}
