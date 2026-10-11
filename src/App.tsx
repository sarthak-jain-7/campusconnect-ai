import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { ChatInterface } from './components/chat/ChatInterface';
import { SettingsModal } from './components/modals/SettingsModal';
import type { ChatSession, ChatMessage, AIProvider, AISettings } from './types';
import { aiService } from './services/aiService';

const SESSIONS_STORAGE_KEY = 'campusconnect_ai_chat_sessions';

export const App: React.FC = () => {
  const [provider, setProvider] = useState<AIProvider>(aiService.getSettings().provider);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Chat sessions state
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const stored = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to load chat sessions', e);
    }
    return [
      {
        id: 'session-default',
        title: 'New Chat',
        createdAt: new Date().toISOString(),
        messages: [],
        activePromptVersion: 'v2_improved'
      }
    ];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.length > 0) return parsed[0].id;
      }
    } catch {}
    return 'session-default';
  });

  const [isLoading, setIsLoading] = useState(false);

  // Save sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.warn('Failed to persist sessions', e);
    }
  }, [sessions]);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  const handleStartNewChat = () => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'New Chat',
      createdAt: new Date().toISOString(),
      messages: [],
      activePromptVersion: 'v2_improved'
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions(prev => {
      const remaining = prev.filter(s => s.id !== id);
      if (remaining.length === 0) {
        const fallback: ChatSession = {
          id: `session-${Date.now()}`,
          title: 'New Chat',
          createdAt: new Date().toISOString(),
          messages: [],
          activePromptVersion: 'v2_improved'
        };
        setActiveSessionId(fallback.id);
        return [fallback];
      }
      if (activeSessionId === id) {
        setActiveSessionId(remaining[0].id);
      }
      return remaining;
    });
  };

  const handleClearAllSessions = () => {
    const fresh: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'New Chat',
      createdAt: new Date().toISOString(),
      messages: [],
      activePromptVersion: 'v2_improved'
    };
    setSessions([fresh]);
    setActiveSessionId(fresh.id);
  };

  const handleClearCurrentChat = () => {
    setSessions(prev =>
      prev.map(s => (s.id === activeSessionId ? { ...s, messages: [] } : s))
    );
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const pendingAssistantMessage: ChatMessage = {
      id: `msg-ai-${Date.now() + 1}`,
      sender: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isLoading: true
    };

    // Update session title if first message
    const isFirstMessage = activeSession.messages.length === 0;
    const sessionTitle = isFirstMessage 
      ? (text.length > 30 ? `${text.substring(0, 30)}...` : text)
      : activeSession.title;

    setSessions(prev =>
      prev.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            title: sessionTitle,
            messages: [...s.messages, userMessage, pendingAssistantMessage]
          };
        }
        return s;
      })
    );

    setIsLoading(true);

    try {
      const history = activeSession.messages.map(m => ({
        role: m.sender as 'user' | 'assistant',
        content: m.content
      }));

      const result = await aiService.generateResponse(text, 'v2_improved', history);

      setSessions(prev =>
        prev.map(s => {
          if (s.id === activeSessionId) {
            const updated = s.messages.map(m => {
              if (m.id === pendingAssistantMessage.id) {
                return {
                  ...m,
                  content: result.response,
                  reasoning: result.reasoning,
                  isLoading: false
                };
              }
              return m;
            });
            return { ...s, messages: updated };
          }
          return s;
        })
      );
    } catch (err: any) {
      setSessions(prev =>
        prev.map(s => {
          if (s.id === activeSessionId) {
            const updated = s.messages.map(m => {
              if (m.id === pendingAssistantMessage.id) {
                return {
                  ...m,
                  content: `⚠️ Error: ${err.message || 'Please check your connection and try again.'}`,
                  isLoading: false
                };
              }
              return m;
            });
            return { ...s, messages: updated };
          }
          return s;
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingsSaved = (settings: AISettings) => {
    setProvider(settings.provider);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <Header
        provider={provider}
        onNewChat={handleStartNewChat}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Body Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={(id) => setActiveSessionId(id)}
          onNewChat={handleStartNewChat}
          onDeleteSession={handleDeleteSession}
          onClearAllSessions={handleClearAllSessions}
        />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-950 relative">
          <ChatInterface
            messages={activeSession.messages}
            onSendMessage={handleSendMessage}
            onClearChat={handleClearCurrentChat}
            isLoading={isLoading}
          />
        </main>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsSaved={handleSettingsSaved}
      />
    </div>
  );
};
export default App;

