import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../types';
import { Sparkles, Copy, Check } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (isUser) {
    return (
      <div className="flex flex-col items-end gap-2 animate-fade-in group">
        <div className="bg-brand text-white px-5 py-3 rounded-2xl rounded-tr-none max-w-[85%] md:max-w-[70%] shadow-md shadow-brand/15 transition-all hover:shadow-brand/25 [&::selection]:bg-white/30 [&::selection]:text-white [&_*::selection]:bg-white/30 [&_*::selection]:text-white">
          <p className="text-sm leading-relaxed font-medium">{message.content}</p>
        </div>
        <span className="text-[10px] text-muted font-bold uppercase tracking-widest px-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {message.timestamp}
        </span>
      </div>
    );
  }

  return (
    <div className="flex gap-4 md:gap-6 max-w-5xl mx-auto py-4 animate-fade-in">
      {/* Avatar */}
      <div className="flex-shrink-0 mt-1">
        <div className="w-9 h-9 bg-brand-light flex items-center justify-center text-brand rounded-xl border border-brand/20">
          <Sparkles className="w-4 h-4" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="modern-card overflow-hidden">
          <div className="markdown-body">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Headings
                h1: ({ children }) => (
                  <h1 className="text-xl font-black text-foreground mb-4 pb-2 border-b border-border">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-base font-bold text-foreground mt-6 mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-brand rounded-full inline-block flex-shrink-0" />
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-sm font-bold text-brand uppercase tracking-widest mt-4 mb-2">{children}</h3>
                ),

                // Paragraph
                p: ({ children }) => (
                  <p className="text-foreground text-sm leading-7 mb-4 last:mb-0 font-medium">{children}</p>
                ),

                // Strong / Bold
                strong: ({ children }) => (
                  <strong className="font-bold text-foreground">{children}</strong>
                ),

                // Emphasis / Italic
                em: ({ children }) => (
                  <em className="italic text-muted">{children}</em>
                ),

                // Unordered list
                ul: ({ children }) => (
                  <ul className="space-y-2 mb-4 ml-1">{children}</ul>
                ),

                // Ordered list
                ol: ({ children }) => (
                  <ol className="space-y-2 mb-4 ml-1 list-decimal list-inside">{children}</ol>
                ),

                // List item — renders as a clean card row
                li: ({ children }) => (
                  <li className="flex items-start gap-3 px-4 py-3 rounded-xl bg-sidebar border border-border hover:border-brand/30 transition-all group">
                    <span className="w-1.5 h-1.5 bg-brand rounded-full mt-[7px] flex-shrink-0" />
                    <span className="text-sm text-foreground font-medium leading-relaxed flex-1">{children}</span>
                  </li>
                ),

                // Horizontal rule — section divider
                hr: () => (
                  <hr className="my-6 border-border" />
                ),

                // Blockquote
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-brand pl-4 my-4 py-1 bg-brand-light rounded-r-xl">
                    <div className="text-foreground text-sm font-medium italic">{children}</div>
                  </blockquote>
                ),

                // Inline code
                code: ({ children, className }) => {
                  const isBlock = className?.includes('language-');
                  if (isBlock) {
                    return (
                      <pre className="bg-sidebar border border-border rounded-xl p-4 overflow-x-auto my-4">
                        <code className="text-xs font-mono text-foreground">{children}</code>
                      </pre>
                    );
                  }
                  return (
                    <code className="bg-brand-light text-brand text-xs font-mono px-1.5 py-0.5 rounded-md font-semibold">
                      {children}
                    </code>
                  );
                },

                // Tables
                table: ({ children }) => (
                  <div className="overflow-x-auto my-4 rounded-xl border border-border">
                    <table className="w-full text-sm">{children}</table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-brand-light">{children}</thead>
                ),
                th: ({ children }) => (
                  <th className="px-4 py-3 text-left text-xs font-bold text-brand uppercase tracking-wider border-b border-border">
                    {children}
                  </th>
                ),
                tbody: ({ children }) => (
                  <tbody className="divide-y divide-border">{children}</tbody>
                ),
                tr: ({ children }) => (
                  <tr className="hover:bg-sidebar transition-colors">{children}</tr>
                ),
                td: ({ children }) => (
                  <td className="px-4 py-3 text-foreground font-medium">{children}</td>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>

          {/* Footer actions */}
          <div className="flex items-center gap-1 mt-5 pt-4 border-t border-border">
            <button
              onClick={handleCopy}
              title="Copy to clipboard"
              className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-brand-light rounded-lg transition-all text-muted hover:text-brand text-xs font-medium"
            >
              {copied
                ? <><Check className="w-3.5 h-3.5 text-green-500" /><span className="text-green-500">Copied!</span></>
                : <><Copy className="w-3.5 h-3.5" /><span>Copy</span></>
              }
            </button>
            <span className="text-[10px] text-muted/40 ml-auto font-mono">{message.timestamp}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
