import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, MessageCircle } from 'lucide-react';
import { EMOTION_COLORS, EMOTIONS } from '../utils/constants.js';

/**
 * VoicePanel — Voice assistant conversation panel.
 *
 * Shows scrollable conversation transcript, voice activity indicator,
 * manual text input fallback, and start/stop listening toggle.
 */
export default function VoicePanel({
  voiceAssistant,
  emotion,
  isListening,
  isSpeaking,
  onToggleListening,
  conversationHistory,
}) {
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef(null);
  const color = EMOTION_COLORS[emotion] || EMOTION_COLORS[EMOTIONS.NEUTRAL];

  /* Auto-scroll to bottom on new messages */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversationHistory]);

  const handleSendText = async () => {
    if (!inputText.trim() || !voiceAssistant) return;
    const text = inputText.trim();
    setInputText('');
    await voiceAssistant.processTextInput(text);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  return (
    <div className="glass-panel rounded-2xl flex flex-col h-full" id="voice-panel">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/[0.04] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle size={14} className="text-text-muted" strokeWidth={1.5} />
          <span className="system-label">VOICE ASSISTANT</span>
        </div>
        <div className="flex items-center gap-2">
          {isSpeaking && (
            <div className="flex items-center gap-1">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-0.5 rounded-full animate-breathe"
                  style={{
                    height: `${8 + i * 4}px`,
                    backgroundColor: color.primary,
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
          )}
          {isListening && (
            <div className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full animate-breathe"
                style={{ backgroundColor: color.primary }}
              />
              <span className="system-label" style={{ color: color.dim }}>LISTENING</span>
            </div>
          )}
        </div>
      </div>

      {/* Conversation Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0"
      >
        {conversationHistory.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Mic size={24} className="text-text-muted/30 mx-auto mb-3" strokeWidth={1} />
              <p className="text-body-sm text-text-muted">
                Start a conversation or begin a check-in
              </p>
              <p className="text-label text-text-muted/50 mt-1">
                Try saying "How are you?" or click the mic
              </p>
            </div>
          </div>
        ) : (
          conversationHistory.map((msg, i) => (
            <div
              key={`${msg.timestamp}-${i}`}
              className={`max-w-[85%] ${msg.role === 'user' ? 'ml-auto' : 'mr-auto'} animate-slide-up`}
              style={{ animationDuration: '0.3s' }}
            >
              <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'}>
                <p className="text-body-sm text-text-primary/90 leading-relaxed">
                  {msg.text}
                </p>
              </div>
              <p className={`text-[0.6rem] text-text-muted/40 mt-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="px-3 py-3 border-t border-white/[0.04]">
        <div className="flex items-center gap-2">
          {/* Mic Toggle */}
          <button
            onClick={onToggleListening}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
              isListening
                ? 'bg-rose/20 border border-rose/30 text-rose'
                : 'bg-white/[0.03] border border-white/[0.06] text-text-muted hover:text-text-secondary hover:bg-white/[0.06]'
            }`}
            id="mic-toggle-btn"
            title={isListening ? 'Stop listening' : 'Start listening'}
          >
            {isListening ? <MicOff size={14} /> : <Mic size={14} />}
          </button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2 text-body-sm text-text-primary placeholder-text-muted/40 focus:outline-none focus:border-white/[0.1] transition-colors"
              id="voice-text-input"
            />
          </div>

          {/* Send */}
          <button
            onClick={handleSendText}
            disabled={!inputText.trim()}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/[0.03] border border-white/[0.06] text-text-muted hover:text-text-secondary hover:bg-white/[0.06] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
            id="send-btn"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
