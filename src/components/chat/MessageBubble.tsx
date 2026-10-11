import React, { useState } from 'react';
import { Bot, User, Copy, Check, Volume2, Clock, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import type { ChatMessage } from '../../types';
import { MarkdownRenderer } from '../common/MarkdownRenderer';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }
      window.speechSynthesis.cancel();
      const cleanText = message.content.replace(/[#*`_>|[\]()-]/g, ' ');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const isAssistant = message.sender === 'assistant';

  return (
    <div className={`flex w-full mb-4 sm:mb-6 ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex gap-2.5 sm:gap-3 max-w-[92%] sm:max-w-[85%] lg:max-w-[78%] ${isAssistant ? 'flex-row' : 'flex-row-reverse'}`}>
        {/* Avatar */}
        <div className="shrink-0 mt-0.5">
          {isAssistant ? (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Bot className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200">
              <User className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Bubble container */}
        <div className="flex flex-col space-y-1.5 flex-1 min-w-0">
          {/* Header metadata */}
          <div className={`flex items-center gap-2 text-[11px] ${isAssistant ? 'justify-start' : 'justify-end'}`}>
            <span className="font-semibold text-slate-300">
              {isAssistant ? 'CampusConnect AI' : 'You'}
            </span>
            <span className="text-slate-500 flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5" />
              {message.timestamp}
            </span>
          </div>

          {/* Reasoning trace (if available from model) */}
          {isAssistant && message.reasoning && (
            <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 overflow-hidden text-xs">
              <button
                type="button"
                onClick={() => setShowReasoning(!showReasoning)}
                className="w-full px-3 py-1.5 flex items-center justify-between text-slate-400 hover:text-slate-200 transition"
              >
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-indigo-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  Thought Process
                </span>
                {showReasoning ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {showReasoning && (
                <div className="px-3 pb-2.5 pt-1 text-[11px] text-slate-400 font-mono leading-relaxed border-t border-slate-800/50 whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {message.reasoning}
                </div>
              )}
            </div>
          )}

          {/* Message Body */}
          <div
            className={`p-3.5 sm:p-4 rounded-2xl text-sm leading-relaxed ${
              isAssistant
                ? 'bg-slate-900/80 border border-slate-800 text-slate-100 shadow-sm'
                : 'bg-indigo-600 text-white shadow-indigo-600/20'
            }`}
          >
            {message.isLoading ? (
              <div className="flex items-center gap-2 py-2 text-slate-400">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-xs font-medium">CampusConnect AI is thinking...</span>
              </div>
            ) : isAssistant ? (
              <MarkdownRenderer content={message.content} />
            ) : (
              <p className="whitespace-pre-wrap">{message.content}</p>
            )}
          </div>

          {/* AI Message Footer Actions */}
          {isAssistant && !message.isLoading && (
            <div className="flex items-center gap-2 pt-0.5 px-1">
              <button
                onClick={handleCopy}
                className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition flex items-center gap-1 text-[11px]"
                title="Copy message"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleSpeak}
                className={`p-1 rounded-md transition flex items-center gap-1 text-[11px] ${
                  isSpeaking 
                    ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-800/40' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
                title="Read message aloud"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isSpeaking ? 'Speaking...' : 'Listen'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
