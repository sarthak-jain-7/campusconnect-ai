import React from 'react';
import { Plus, MessageSquare, Trash2, X, Zap } from 'lucide-react';
import type { ChatSession } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  onClearAllSessions: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onClearAllSessions
}) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 sm:w-80 bg-slate-950 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top brand & close on mobile */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">
              CC
            </div>
            <div>
              <h2 className="font-display font-bold text-sm text-white">CampusConnect AI</h2>
              <p className="text-[10px] text-slate-400">Virtual Helpdesk</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Button: New Chat */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition hover:shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" />
            Start New Chat
          </button>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="flex items-center justify-between px-2 py-1">
            <p className="text-[10px] font-semibold tracking-wider uppercase text-slate-500">
              Conversations
            </p>
            {sessions.length > 0 && (
              <button
                onClick={onClearAllSessions}
                className="text-[10px] text-slate-500 hover:text-rose-400 transition"
                title="Clear all chat history"
              >
                Clear All
              </button>
            )}
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-6 px-3 text-slate-500 text-xs">
              <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-30" />
              No previous conversations. Start a new chat!
            </div>
          ) : (
            sessions.map((sess) => (
              <div
                key={sess.id}
                onClick={() => {
                  onSelectSession(sess.id);
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`group w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition ${
                  activeSessionId === sess.id
                    ? 'bg-slate-800/90 text-white font-medium border border-slate-700/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <MessageSquare className="w-3.5 h-3.5 shrink-0 text-slate-500 group-hover:text-indigo-400" />
                  <span className="truncate">{sess.title || 'Conversation'}</span>
                </div>
                <button
                  onClick={(e) => onDeleteSession(sess.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded transition"
                  title="Delete conversation"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Engine status footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/90">
          <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-[11px] flex items-center gap-2 text-slate-400">
            <Zap className="w-4 h-4 text-orange-400 shrink-0" />
            <div className="truncate">
              <span className="font-semibold text-slate-300 block truncate">Groq LPU Engine</span>
              <span className="text-[10px] text-slate-500 block truncate">High-speed inference</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
