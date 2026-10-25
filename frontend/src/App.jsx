import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from './api';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const SESSIONS_STORAGE_KEY = 'need_a_help_chat_sessions';
const AI_MODE_STORAGE_KEY = 'need_a_help_ai_mode';

function createNewSession() {
  return {
    id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: 'New conversation',
    messages: [],
    createdAt: Date.now()
  };
}

export default function App() {
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse saved sessions', e);
    }
    return [createNewSession()];
  });

  const [currentSessionId, setCurrentSessionId] = useState(() => {
    return sessions[0]?.id || '';
  });

  const [aiMode, setAiMode] = useState(() => {
    try {
      return localStorage.getItem(AI_MODE_STORAGE_KEY) || 'online';
    } catch {
      return 'online';
    }
  });

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [localStatus, setLocalStatus] = useState({ available: false, checked: false });
  const chatLock = useRef(false);

  // Sync sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.warn('Failed to save sessions to localStorage', e);
    }
  }, [sessions]);

  // Sync AI mode to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(AI_MODE_STORAGE_KEY, aiMode);
    } catch (e) {}
  }, [aiMode]);

  // Check Ollama Local AI status
  const checkLocalStatus = () => {
    apiFetch(`${API_BASE_URL}/api/local-ai/status`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setLocalStatus({
            available: Boolean(data.available),
            checked: true,
            model: 'gemma4:e2b'
          });
        }
      })
      .catch(() => {
        setLocalStatus({ available: false, checked: true });
      });
  };

  useEffect(() => {
    checkLocalStatus();
    // Poll local status periodically when in offline mode
    const interval = setInterval(() => {
      checkLocalStatus();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const activeSession = sessions.find((s) => s.id === currentSessionId) || sessions[0] || createNewSession();

  const handleSelectAiMode = (mode) => {
    setAiMode(mode);
    if (mode === 'local') {
      checkLocalStatus();
    }
  };

  const handleNewSession = () => {
    const newSession = createNewSession();
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  };

  const handleDeleteSession = (idToDelete) => {
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== idToDelete);
      if (filtered.length === 0) {
        const fresh = createNewSession();
        setCurrentSessionId(fresh.id);
        return [fresh];
      }
      if (currentSessionId === idToDelete) {
        setCurrentSessionId(filtered[0].id);
      }
      return filtered;
    });
  };

  const handleClearAllSessions = () => {
    if (window.confirm('Are you sure you want to clear all chat conversations?')) {
      const fresh = createNewSession();
      setSessions([fresh]);
      setCurrentSessionId(fresh.id);
    }
  };

  const handleSendMessage = async (text) => {
    if (chatLock.current || !text.trim() || isLoading) return;
    chatLock.current = true;
    setIsLoading(true);

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMessage = {
      id: `msg_${Date.now()}_u`,
      sender: 'user',
      content: text,
      timestamp: timeStr
    };

    // Update current session with user message and generate title if first message
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== activeSession.id) return s;
        const isFirst = s.messages.length === 0;
        const newTitle = isFirst ? (text.length > 28 ? text.slice(0, 28) + '...' : text) : s.title;
        return {
          ...s,
          title: newTitle,
          messages: [...s.messages, userMessage]
        };
      })
    );

    // Format conversation history for API
    const historyPayload = activeSession.messages
      .filter((m) => m.content && (m.sender === 'user' || m.sender === 'assistant'))
      .map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.content
      }));
    historyPayload.push({ role: 'user', content: text });

    try {
      if (aiMode === 'local') {
        // Local Mode: Gemma 4 (E2B) via Ollama
        const response = await apiFetch(`${API_BASE_URL}/api/local-chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            messages: historyPayload.slice(-8)
          })
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Local AI unavailable. Please ensure Ollama is running with gemma4:e2b.');
        }

        const assistantMessage = {
          id: `msg_${Date.now()}_a`,
          sender: 'assistant',
          content: data.content || data.message || '',
          modelName: 'gemma4:e2b',
          provider: 'Local Ollama',
          local: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setSessions((prev) =>
          prev.map((s) => {
            if (s.id !== activeSession.id) return s;
            return {
              ...s,
              messages: [...s.messages, assistantMessage]
            };
          })
        );
      } else {
        // Online Mode: Gemini API with automatic fallback to Backboard & OpenRouter
        const response = await apiFetch(`${API_BASE_URL}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            messages: historyPayload.slice(-10),
            mode: 'chat'
          })
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || 'AI request failed. Please check your backend connection.');
        }

        const assistantMessage = {
          id: `msg_${Date.now()}_a`,
          sender: 'assistant',
          content: data.content || '',
          modelName: data.model?.name || 'gemini-2.5-flash',
          provider: data.model?.provider || 'gemini',
          local: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setSessions((prev) =>
          prev.map((s) => {
            if (s.id !== activeSession.id) return s;
            return {
              ...s,
              messages: [...s.messages, assistantMessage]
            };
          })
        );
      }
    } catch (err) {
      console.error('[Chat Error]:', err);
      const errorMessage = {
        id: `msg_${Date.now()}_err`,
        sender: 'assistant',
        content: `⚠️ **Unable to complete response:** ${err.message || 'An error occurred while generating the response.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== activeSession.id) return s;
          return {
            ...s,
            messages: [...s.messages, errorMessage]
          };
        })
      );
    } finally {
      chatLock.current = false;
      setIsLoading(false);
    }
  };

  return (
    <div className="chatgpt-layout">
      <Header
        aiMode={aiMode}
        onSelectAiMode={handleSelectAiMode}
        localStatus={localStatus}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      <div className="chatgpt-body">
        <Sidebar
          sessions={sessions}
          currentSessionId={activeSession.id}
          onSelectSession={(id) => setCurrentSessionId(id)}
          onNewSession={handleNewSession}
          onDeleteSession={handleDeleteSession}
          onClearAll={handleClearAllSessions}
          aiMode={aiMode}
          localStatus={localStatus}
          isOpen={sidebarOpen}
          onCloseMobile={() => {
            if (window.innerWidth < 768) setSidebarOpen(false);
          }}
        />

        <main className="chatgpt-workspace">
          <ChatInterface
            messages={activeSession.messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            aiMode={aiMode}
            isLocalMode={aiMode === 'local'}
          />
        </main>
      </div>
    </div>
  );
}
