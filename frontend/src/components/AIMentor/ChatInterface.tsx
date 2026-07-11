// ─── ChatInterface — full AI Mentor chat panel ────────────────────────────────
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ChatMessage } from '../../types';
import { ChatMessage as ChatMessageComponent } from './ChatMessage';
import { streamMentorChat } from '../../api/client';
import './ChatInterface.css';

const SUGGESTED_PROMPTS = [
  'Explain how the EVM works',
  'What is a reentrancy attack?',
  'Show me a basic ERC-20 token',
  'How does a liquidity pool work?',
  'What is a DAO proposal lifecycle?',
];

interface ChatInterfaceProps {
  mentorContext?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  mentorContext = 'General Developer Academy curriculum',
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "👋 Hey! I'm your **AI Mentor** for the Developer Academy. I can help you understand blockchain concepts, debug Solidity code, and guide you through DeFi protocols.\n\nWhat would you like to learn today?",
    },
  ]);
  const [input, setInput]         = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef    = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => { scrollToBottom(); }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [input]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };

    const assistantId = `a-${Date.now()}`;
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput('');
    setIsStreaming(true);

    try {
      const gen = streamMentorChat(trimmed, mentorContext, (delta) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: m.content + delta } : m,
          ),
        );
      });

      // Consume the async generator
      for await (const _ of gen) { /* chunks delivered via onChunk callback */ }
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: `Error: ${err instanceof Error ? err.message : 'Unknown error'}` }
            : m,
        ),
      );
    } finally {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, isStreaming: false } : m,
        ),
      );
      setIsStreaming(false);
    }
  }, [isStreaming, mentorContext]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="chat">
      {/* Context badge */}
      <div className="chat__context-bar glass">
        <span className="chat__context-icon">📍</span>
        <span className="chat__context-label">Context:</span>
        <span className="chat__context-value">{mentorContext}</span>
      </div>

      {/* Messages */}
      <div className="chat__messages" id="chat-messages-container">
        {messages.map((msg) => (
          <ChatMessageComponent key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="chat__suggestions">
          {SUGGESTED_PROMPTS.map((p) => (
            <button
              key={p}
              className="chat__suggestion-chip"
              onClick={() => sendMessage(p)}
              disabled={isStreaming}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="chat__input-area glass">
        <textarea
          ref={textareaRef}
          id="mentor-chat-input"
          className="chat__textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything… (Enter to send, Shift+Enter for newline)"
          rows={1}
          disabled={isStreaming}
          aria-label="Message to AI Mentor"
        />
        <button
          id="mentor-send-btn"
          className={`btn btn--primary chat__send-btn ${isStreaming ? 'chat__send-btn--loading' : ''}`}
          onClick={() => sendMessage(input)}
          disabled={isStreaming || !input.trim()}
          aria-label="Send message"
        >
          {isStreaming ? (
            <span className="chat__spinner" />
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
