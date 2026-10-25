import React from 'react';
import { Zap, Cpu, Wifi, Sun, Moon, PanelLeft } from 'lucide-react';
import { useTheme } from '../useTheme';

export default function Header({ 
  aiMode = 'online', 
  onSelectAiMode = () => {}, 
  localStatus = {},
  onToggleSidebar = () => {}
}) {
  const isOnline = aiMode === 'online';
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          type="button"
          className="sidebar-toggle-btn"
          onClick={onToggleSidebar}
          title="Toggle sidebar"
          aria-label="Toggle sidebar"
        >
          <PanelLeft size={18} />
        </button>

        <div className="brand-wrapper">
          <div className="brand-icon">
            <Zap size={18} />
          </div>
          <div className="brand-text">
            <h1 className="brand-title">Need A Help</h1>
          </div>
        </div>
      </div>

      <div className="header-center">
        {/* The Full Toggle Button: Online vs Offline */}
        <div className="full-mode-toggle" role="group" aria-label="Engine Mode Selection">
          <button
            type="button"
            className={`toggle-option ${isOnline ? 'selected online' : ''}`}
            onClick={() => onSelectAiMode('online')}
            aria-pressed={isOnline}
            title="Online Mode: Google Gemini API with automatic fallback to Backboard & OpenRouter"
          >
            <Wifi size={14} className="toggle-icon" />
            <span className="toggle-label">Online</span>
          </button>
          
          <button
            type="button"
            className={`toggle-option ${!isOnline ? 'selected offline' : ''}`}
            onClick={() => onSelectAiMode('local')}
            aria-pressed={!isOnline}
            title="Offline Mode: Local Gemma 3 270M via Ollama — fully offline on your device"
          >
            <Cpu size={14} className="toggle-icon" />
            <span className="toggle-label">Offline</span>
          </button>
        </div>
      </div>

      <div className="header-right">
        <div className={`engine-status-pill ${isOnline ? 'online-pill' : 'offline-pill'}`}>
          <span 
            className="status-dot"
            style={!isOnline ? { backgroundColor: localStatus.available ? '#10b981' : '#f87171' } : undefined}
          ></span>
          <span className="pill-text">
            {isOnline 
              ? 'Gemini 2.5 Flash' 
              : localStatus.available 
                ? 'Gemma 3 (270M)' 
                : 'Ollama Offline'}
          </span>
        </div>

        <button
          type="button"
          className="theme-toggle-btn"
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
          title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
}
