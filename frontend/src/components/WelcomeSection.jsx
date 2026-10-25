import React from 'react';
import { Sparkles, Code2, Lightbulb, Compass, MessageSquare } from 'lucide-react';

const SUGGESTIONS = [
  {
    icon: Lightbulb,
    title: 'Explain a complex concept',
    prompt: 'Explain how machine learning neural networks work using a simple everyday analogy.'
  },
  {
    icon: Code2,
    title: 'Write or debug code',
    prompt: 'Write a clean Node.js script using fetch to request an API and handle errors gracefully.'
  },
  {
    icon: Sparkles,
    title: 'Brainstorm creative ideas',
    prompt: 'Give me 5 practical and creative project ideas using AI and modern web technologies.'
  },
  {
    icon: Compass,
    title: 'Study & summarize notes',
    prompt: 'Summarize the core differences between synchronous and asynchronous programming.'
  }
];

export default function WelcomeSection({ onSendMessage, isLocalMode }) {
  return (
    <div className="chatgpt-welcome-container">
      <div className="welcome-hero">
        <div className="welcome-avatar-glow">
          <MessageSquare size={36} className="welcome-avatar-icon" />
        </div>
        <h2 className="welcome-heading">How can I help you today?</h2>
        <p className="welcome-subtext">
          {isLocalMode 
            ? 'Running locally with Gemma 3 (270M) via Ollama — fully offline and private.'
            : 'Powered by Google Gemini with resilient auto-failover to Backboard and OpenRouter.'}
        </p>
      </div>

      <div className="suggestions-grid" role="group" aria-label="Prompt suggestions">
        {SUGGESTIONS.map((s, idx) => {
          const Icon = s.icon;
          return (
            <button
              key={idx}
              type="button"
              className="chatgpt-suggestion-card"
              onClick={() => onSendMessage && onSendMessage(s.prompt)}
            >
              <div className="card-top">
                <span className="card-title">{s.title}</span>
                <Icon size={16} className="card-icon" />
              </div>
              <p className="card-prompt">{s.prompt}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
