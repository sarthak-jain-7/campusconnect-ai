import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2, Bot, Sparkles, Zap, BookOpen, GraduationCap, Calculator, FileText, Building2 } from 'lucide-react';
import type { ChatMessage } from '../../types';
import { MessageBubble } from './MessageBubble';
import { QuickActionChips } from './QuickActionChips';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onClearChat: () => void;
  isLoading: boolean;
}

const ACADEMIC_SHORTCUTS = [
  {
    label: '📚 Syllabus Lookup',
    icon: <BookOpen className="w-3 h-3 text-blue-400" />,
    template: 'Provide a detailed semester-wise syllabus breakdown and recommended textbooks for: Computer Science Engineering'
  },
  {
    label: '💡 Explain Subject Concept',
    icon: <GraduationCap className="w-3 h-3 text-emerald-400" />,
    template: 'Explain this academic concept clearly with exam-ready definitions, diagrams/examples, and key points: '
  },
  {
    label: '📊 CGPA & SGPA Formula',
    icon: <Calculator className="w-3 h-3 text-purple-400" />,
    template: 'How is SGPA and CGPA calculated under the 10-point Credit-Based Choice System (CBCS)? Show the formula with a calculation example.'
  },
  {
    label: '📝 Exam Prep & PYQ Strategy',
    icon: <FileText className="w-3 h-3 text-amber-400" />,
    template: 'What are the most high-weightage topics and best revision roadmap to prepare for university semester end-exams?'
  },
  {
    label: '🏛️ College Procedures',
    icon: <Building2 className="w-3 h-3 text-cyan-400" />,
    template: 'What is the procedure and required documents to apply for a Bonafide Certificate, transcripts, and student ID card?'
  }
];

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  onClearChat,
  isLoading
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  const handleShortcutClick = (template: string) => {
    setInputText(template);
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = 'auto';
    }
  };

  const isChatEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full flex-1 max-w-5xl mx-auto w-full px-2 sm:px-4 py-2 sm:py-4">
      {/* Top chat banner */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-300">
            College Virtual Helpdesk & Academic Assistant
          </span>
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-950/70 text-indigo-300 border border-indigo-800/60">
            Syllabus • Academics • Campus
          </span>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={onClearChat}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-slate-400 hover:text-rose-400 hover:bg-slate-900 border border-slate-800 transition"
              title="Clear conversation"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear Chat</span>
            </button>
          )}
        </div>
      </div>

      {/* Main chat viewport */}
      <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-2">
        {isChatEmpty ? (
          /* Welcome Screen */
          <div className="flex flex-col items-center justify-center min-h-[60vh] py-6 sm:py-10 text-center">
            <div className="relative mb-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 p-1 shadow-xl flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Bot className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 p-1 bg-indigo-600 rounded-full border-2 border-slate-950">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight mb-2">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-blue-400">CampusConnect AI</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mb-1">
              Your intelligent companion for <span className="text-indigo-300 font-medium">course syllabus</span>, <span className="text-cyan-300 font-medium">academic doubt solving</span>, <span className="text-blue-300 font-medium">exam prep & CGPA calculations</span>, and all college administrative procedures.
            </p>
            <p className="text-[11px] text-slate-500 max-w-md mb-6">
              Powered by Groq LPU • Ultra-fast AI inference
            </p>

            <div className="w-full max-w-3xl bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 sm:p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3 text-left">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-indigo-400" />
                  Explore Academic & Campus Inquiries
                </span>
                <span className="text-[11px] text-slate-500">Filter topics or click to ask</span>
              </div>
              <QuickActionChips onSelectPrompt={(p) => onSendMessage(p)} disabled={isLoading} />
            </div>
          </div>
        ) : (
          /* Message Stream */
          <div className="pt-2">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input container */}
      <div className="mt-2 pt-2 border-t border-slate-800/80">
        {/* Quick Academic Shortcut Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider shrink-0 pl-1">
            Quick Ask:
          </span>
          {ACADEMIC_SHORTCUTS.map((sc, i) => (
            <button
              key={i}
              type="button"
              disabled={isLoading}
              onClick={() => handleShortcutClick(sc.template)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 whitespace-nowrap transition-all shadow-sm shrink-0 disabled:opacity-50"
            >
              {sc.icon}
              <span>{sc.label}</span>
            </button>
          ))}
        </div>

        {/* Text input form */}
        <form onSubmit={handleSubmit} className="relative flex items-end gap-2 bg-slate-900/90 border border-slate-700/80 rounded-2xl p-2 shadow-lg focus-within:border-indigo-500 transition-colors">
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={handleTextareaInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask for syllabus, subject concepts, CGPA, exams, fees, library..."
            disabled={isLoading}
            className="flex-1 bg-transparent border-0 text-slate-100 placeholder:text-slate-500 text-xs sm:text-sm resize-none focus:outline-none px-2 py-1.5 max-h-36 overflow-y-auto"
          />

          <div className="flex items-center gap-1.5 shrink-0">
            {inputText.trim().length > 0 && (
              <button
                type="button"
                onClick={() => setInputText('')}
                className="p-2 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition"
                title="Clear input"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white font-medium shadow-md transition-all flex items-center justify-center"
              title="Send (Enter)"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>

        <p className="text-[10px] text-center text-slate-500 mt-1.5">
          Press <kbd className="px-1 py-0.5 rounded bg-slate-800 font-mono text-[9px]">Enter</kbd> to send, <kbd className="px-1 py-0.5 rounded bg-slate-800 font-mono text-[9px]">Shift+Enter</kbd> for newline.
        </p>
      </div>
    </div>
  );
};
