import React, { useState, useRef, useEffect } from 'react';
import { Send, Zap, Cpu, Mic, MicOff, Sparkles } from 'lucide-react';
import WelcomeSection from './WelcomeSection';
import CodeBlock from './CodeBlock';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default function ChatInterface({ 
  messages = [], 
  onSendMessage, 
  isLoading = false,
  aiMode = 'online',
  isLocalMode = false,
  disabled = false
}) {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Initialize Web Speech API for voice input
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setInputText(prev => (prev ? prev + ' ' : '') + transcript);
      };

      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  // Auto-resize textarea height as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollH = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(Math.max(scrollH, 44), 200)}px`;
    }
  }, [inputText]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Speech recognition start failed:', err);
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading || disabled) return;
    const text = inputText.trim();
    setInputText('');
    if (textareaRef.current) textareaRef.current.style.height = '44px';
    onSendMessage(text);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="chatgpt-main-view">
      {/* Scrollable conversation stream */}
      <div className="chatgpt-messages-scroll" role="log" aria-live="polite">
        <div className="chatgpt-messages-container">
          {messages.length === 0 ? (
            <WelcomeSection 
              onSendMessage={onSendMessage} 
              isLocalMode={isLocalMode} 
            />
          ) : (
            messages.map((msg) => {
              const isUser = msg.sender === 'student' || msg.sender === 'user';
              return isUser ? (
                /* User Message (ChatGPT clean right-aligned bubble) */
                <div key={msg.id} className="chatgpt-row user-row">
                  <div className="user-bubble-container">
                    <div className="user-bubble-content">
                      {msg.content}
                    </div>
                    {msg.timestamp && (
                      <span className="user-bubble-time">{msg.timestamp}</span>
                    )}
                  </div>
                </div>
              ) : (
                /* Assistant Message (ChatGPT style rich markdown) */
                <div key={msg.id} className="chatgpt-row assistant-row">
                  <div className="chatgpt-message-box">
                    <div className="chatgpt-author-header">
                      <div className="chatgpt-avatar assistant-avatar">
                        <Zap size={14} />
                      </div>
                      <span className="chatgpt-author-name">Need A Help</span>
                      {msg.timestamp && (
                        <span className="chatgpt-timestamp">{msg.timestamp}</span>
                      )}
                    </div>

                    <div className="chatgpt-message-body markdown-body">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        components={{
                          code({ node, inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '');
                            const codeString = String(children).replace(/\n$/, '');
                            if (!inline && match) {
                              return (
                                <CodeBlock 
                                  language={match[1]} 
                                  value={codeString} 
                                />
                              );
                            }
                            return (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            );
                          },
                          a: ({ href, children, ...props }) => {
                            const isSafe = /^https?:\/\//i.test(href || '') || /^\//.test(href || '') || /^#/.test(href || '');
                            if (!isSafe) return <span>{children}</span>;
                            return (
                              <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                                {children}
                              </a>
                            );
                          }
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>

                    {/* Model Metadata Pill */}
                    {msg.modelName && (
                      <div className="chatgpt-model-tag">
                        {msg.local ? <Cpu size={12} /> : <Sparkles size={12} />}
                        <span>{msg.modelName}</span>
                        {msg.provider ? <span>• {msg.provider}</span> : null}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Typing state */}
          {isLoading && (
            <div className="chatgpt-row assistant-row">
              <div className="chatgpt-message-box">
                <div className="chatgpt-author-header">
                  <div className="chatgpt-avatar assistant-avatar">
                    <Zap size={14} />
                  </div>
                  <span className="chatgpt-author-name">Need A Help</span>
                </div>
                <div className="chatgpt-typing-indicator" aria-label="Thinking...">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Docked input bar at bottom (ChatGPT style) */}
      <div className="chatgpt-input-dock">
        <div className="chatgpt-input-wrapper">
          <form onSubmit={handleSubmit} className="chatgpt-input-bar">
            <textarea
              ref={textareaRef}
              rows={1}
              className="chatgpt-textarea"
              placeholder={isLocalMode ? "Message Need A Help (Offline Gemma 4 E2B)..." : "Message Need A Help (Online Gemini)..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading || disabled}
              maxLength={6000}
              aria-label="Ask Need A Help a question"
            />

            <div className="chatgpt-input-actions">
              <button
                type="button"
                className={`chatgpt-action-btn ${isListening ? 'listening' : ''}`}
                onClick={toggleListening}
                title={isListening ? 'Stop listening' : 'Voice input'}
                aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                disabled={isLoading}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>

              <button
                type="submit"
                className={`chatgpt-send-btn ${inputText.trim() ? 'active' : ''}`}
                disabled={!inputText.trim() || isLoading || disabled}
                title="Send message"
                aria-label="Send message"
              >
                <Send size={15} />
              </button>
            </div>
          </form>

          <p className="chatgpt-disclaimer">
            Need A Help can make mistakes. Check important information.
          </p>
        </div>
      </div>
    </div>
  );
}
