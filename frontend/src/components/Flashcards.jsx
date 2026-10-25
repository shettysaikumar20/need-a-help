import React, { useState, useEffect } from 'react';
import { RotateCw, ArrowLeft, ArrowRight, Download, CheckCircle, AlertCircle, X, Sparkles, Layers } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default function Flashcards({ deck, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardStatus, setCardStatus] = useState({});

  const cards = deck?.cards || [];
  const currentCard = cards[currentIndex] || {};
  const total = cards.length;

  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (e.key === 'ArrowRight' && currentIndex < total - 1) {
        e.preventDefault();
        setCurrentIndex(prev => prev + 1);
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        e.preventDefault();
        setCurrentIndex(prev => prev - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, total]);

  const handleRate = (status) => {
    setCardStatus(prev => ({
      ...prev,
      [currentCard.id || currentIndex]: status
    }));
    if (currentIndex < total - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const exportToAnki = () => {
    if (!cards.length) return;
    const header = '#separator:tab\n#html:true\n#tags column:3\n';
    const rows = cards.map(c => {
      const front = (c.front || '').replace(/\t/g, ' ').replace(/\n/g, '<br/>');
      const back = (c.back || '').replace(/\t/g, ' ').replace(/\n/g, '<br/>');
      const tag = (c.tag || deck.topic || 'NeedAHelp').replace(/\s+/g, '_');
      return `${front}\t${back}\t${tag}`;
    }).join('\n');

    const blob = new Blob([header + rows], { type: 'text/tab-separated-values;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `need-a-help-${(deck.topic || 'flashcards').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!cards.length) return null;

  return (
    <section className="forge-card flashcard-deck-card" aria-label="Flashcards study session">
      <div className="flashcard-deck-header">
        <div className="deck-title-wrap">
          <Layers size={18} className="deck-icon" />
          <div>
            <h2 className="deck-topic-title">{deck.topic || 'Flashcard Deck'}</h2>
            <span className="deck-progress-text">Card {currentIndex + 1} of {total}</span>
          </div>
        </div>
        <div className="deck-actions">
          <button 
            type="button" 
            className="browse-btn export-btn" 
            onClick={exportToAnki}
            title="Download Anki-compatible study file"
          >
            <Download size={13} style={{ marginRight: '5px' }} />
            Export to Anki
          </button>
          {onClose && (
            <button 
              type="button" 
              className="deck-close-btn" 
              onClick={onClose}
              aria-label="Close flashcards"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="deck-progress-bar">
        <div 
          className="deck-progress-fill" 
          style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
        />
      </div>

      {/* 3D Flip Card Container */}
      <div 
        className={`flashcard-scene ${isFlipped ? 'flipped' : ''}`}
        onClick={() => setIsFlipped(prev => !prev)}
        role="button"
        tabIndex={0}
        aria-label={isFlipped ? 'Answer side visible. Click to flip back.' : 'Question side visible. Click to reveal answer.'}
      >
        <div className="flashcard-inner">
          {/* Card Front */}
          <div className="flashcard-face flashcard-front">
            <div className="card-badge-row">
              <span className="card-tag">{currentCard.tag || 'Prompt'}</span>
              <span className="flip-hint">
                <RotateCw size={12} /> Click or spacebar to flip
              </span>
            </div>
            <div className="card-body-content markdown-body">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {currentCard.front || ''}
              </ReactMarkdown>
            </div>
          </div>

          {/* Card Back */}
          <div className="flashcard-face flashcard-back">
            <div className="card-badge-row">
              <span className="card-tag answer-tag">Explanation</span>
              <span className="flip-hint">
                <RotateCw size={12} /> Click to flip front
              </span>
            </div>
            <div className="card-body-content markdown-body">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {currentCard.back || ''}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation & Spaced Repetition Rating */}
      <div className="deck-controls">
        <button
          type="button"
          className="browse-btn nav-btn"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex(prev => prev - 1)}
          aria-label="Previous card"
        >
          <ArrowLeft size={14} /> Prev
        </button>

        <div className="srs-rating-group">
          <button
            type="button"
            className="srs-btn srs-hard"
            onClick={() => handleRate('hard')}
            title="Mark as needing review"
          >
            <AlertCircle size={14} style={{ marginRight: '4px' }} />
            Need Review
          </button>
          <button
            type="button"
            className="srs-btn srs-easy"
            onClick={() => handleRate('easy')}
            title="Mark as mastered"
          >
            <CheckCircle size={14} style={{ marginRight: '4px' }} />
            Mastered
          </button>
        </div>

        <button
          type="button"
          className="browse-btn nav-btn"
          disabled={currentIndex === total - 1}
          onClick={() => setCurrentIndex(prev => prev + 1)}
          aria-label="Next card"
        >
          Next <ArrowRight size={14} />
        </button>
      </div>
    </section>
  );
}
