import React from 'react';
import { Plus, MessageSquare, Trash2, Sun, Moon, Cpu, Wifi } from 'lucide-react';
import { useTheme } from '../useTheme';

export default function Sidebar({
  sessions = [],
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onClearAll,
  aiMode = 'online',
  localStatus = {},
  isOpen = true,
  onCloseMobile = () => {}
}) {
  const { isDark, toggleTheme } = useTheme();
  const isOnline = aiMode === 'online';

  return (
    <aside className={`chatgpt-sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-top">
        <button
          type="button"
          className="chatgpt-new-chat-btn"
          onClick={() => {
            onNewSession();
            onCloseMobile();
          }}
          title="Start a new chat"
        >
          <Plus size={16} />
          <span>New chat</span>
        </button>
      </div>

      <div className="sidebar-history-container">
        <div className="sidebar-history-label">Recent Chats</div>
        {sessions.length === 0 ? (
          <div className="sidebar-no-history">No conversations yet</div>
        ) : (
          <ul className="sidebar-sessions-list">
            {sessions.map((s) => {
              const isActive = s.id === currentSessionId;
              return (
                <li key={s.id} className={`sidebar-session-item ${isActive ? 'active' : ''}`}>
                  <button
                    type="button"
                    className="sidebar-session-select-btn"
                    onClick={() => {
                      onSelectSession(s.id);
                      onCloseMobile();
                    }}
                    title={s.title || 'Untitled chat'}
                  >
                    <MessageSquare size={14} className="session-icon" />
                    <span className="session-title">{s.title || 'Untitled chat'}</span>
                  </button>
                  <button
                    type="button"
                    className="sidebar-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(s.id);
                    }}
                    title="Delete chat"
                    aria-label="Delete chat"
                  >
                    <Trash2 size={13} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="sidebar-footer">
        {/* Status card */}
        <div className={`sidebar-status-card ${isOnline ? 'online' : 'offline'}`}>
          <div className="status-header">
            {isOnline ? <Wifi size={14} /> : <Cpu size={14} />}
            <span className="status-title">{isOnline ? 'Online Engine' : 'Offline Engine'}</span>
          </div>
          <p className="status-detail">
            {isOnline 
              ? 'Gemini 2.5 Flash (Auto-failover enabled)' 
              : localStatus.available 
                ? 'Gemma 4 E2B (Ready)' 
                : 'Ollama not detected'}
          </p>
        </div>

        <div className="sidebar-footer-actions">
          {sessions.length > 0 && (
            <button
              type="button"
              className="sidebar-clear-btn"
              onClick={onClearAll}
              title="Clear all chat history"
            >
              <Trash2 size={14} />
              <span>Clear chats</span>
            </button>
          )}

          <button
            type="button"
            className="sidebar-theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle dark/light theme"
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
            <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
