import React from 'react';
import { Code2, Compass, Sparkles, Brain, Zap } from 'lucide-react';

const SUGGESTIONS = [
  {
    icon: Code2,
    title: 'Explain this Code',
    desc: 'Debug a function, explain algorithms, or optimize performance.'
  },
  {
    icon: Compass,
    title: 'Plan a Project or Study',
    desc: 'Create a structured roadmap, interview plan, or learning track.'
  },
  {
    icon: Sparkles,
    title: 'Brainstorm Ideas',
    desc: 'Generate creative concepts, build systems, or explore new topics.'
  }
];

export default function WelcomeSection({ onSendMessage, isLocalMode }) {
  return (
    <div className="premium-welcome-wrapper">
      {/* Central Cosmic Glowing Orb */}
      <div className="cosmic-orb-container">
        <div className="cosmic-orb-outer-glow"></div>
        <div className="cosmic-orb-sphere">
          <div className="cosmic-orb-inner-swirl"></div>
          <Zap size={28} className="cosmic-orb-icon" />
        </div>
      </div>

      {/* Hero Typography */}
      <div className="premium-welcome-hero">
        <h2 className="premium-hero-heading">Welcome to your cognitive co-pilot</h2>
        <p className="premium-hero-subheading">
          I am <strong>Need A Help</strong>. You can ask me to write, code, plan, or explore any idea.
        </p>
        <span className="premium-engine-badge">
          {isLocalMode 
            ? '💻 Offline Mode Active • Gemma 4 (E2B) running locally via Ollama'
            : '☁️ Online Mode Active • Gemini 2.5 Flash with Backboard & OpenRouter Failover'}
        </span>
      </div>

      {/* 3 Horizontal Glass Cards (As seen in workspace preview) */}
      <div className="premium-cards-grid" role="group" aria-label="Quick start prompts">
        {SUGGESTIONS.map((s, idx) => {
          const Icon = s.icon;
          return (
            <button
              key={idx}
              type="button"
              className="premium-glass-card"
              onClick={() => onSendMessage && onSendMessage(`${s.title}: ${s.desc}`)}
            >
              <div className="glass-card-header">
                <div className="glass-card-icon-pill">
                  <Icon size={16} />
                </div>
                <span className="glass-card-title">{s.title}</span>
              </div>
              <p className="glass-card-desc">{s.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
