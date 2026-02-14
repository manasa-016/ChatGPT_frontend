import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ErrorBoundary } from "react-error-boundary";

const Home = () => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef(null);

  const sendMessage = async (text) => {
    const messageText = text || query;
    if (!messageText.trim() || isProcessing) return;

    const userMsg = { id: Date.now(), role: 'user', content: messageText.trim() };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setIsProcessing(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      const response = await fetch('http://127.0.0.1:8000/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText.trim(), conversation_id: null }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.status === 429) {
        setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: "⚠️ **Rate limit reached.** The AI is getting too many requests right now. Please wait a moment and try again." }]);
        setIsProcessing(false);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Service unavailable');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: data.response }]);
    } catch (err) {
      const errorMsg = err.message === 'fail' ? 'The AI is having trouble right now.' : err.message;
      setMessages(prev => [...prev, {
        id: Date.now() + Math.random(),
        role: 'assistant',
        content: `⚠️ **Service Error:** ${errorMsg}\n\nPlease try again in a few moments.`
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const showWelcome = messages.length === 0 && !isProcessing;

  return (
    <div className="flex flex-col h-screen dark-theme font-sans overflow-hidden">
      {/* ─── Header ─── */}
      <header className="h-14 flex items-center justify-between px-5 border-b border-white/5 shrink-0 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-black shadow-lg shadow-indigo-900/30">L</div>
          <span className="text-lg font-bold tracking-tight">Lumina AI</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/login" className="text-sm font-semibold text-gemini-text-muted hover:text-white px-4 py-1.5 rounded-full hover:bg-white/5 transition-all">
            Log in
          </Link>
          <Link to="/signup" className="bg-indigo-600 text-white px-5 py-1.5 rounded-full text-sm font-bold hover:bg-indigo-500 active:scale-95 transition-all shadow-lg shadow-indigo-900/20">
            Sign up
          </Link>
        </div>
      </header>

      {/* ─── Chat Area ─── */}
      <main className="flex-grow overflow-y-auto custom-scrollbar px-4 pt-4 pb-44 flex flex-col items-center">
        {showWelcome ? (
          <div className="w-full max-w-2xl text-center mt-16 animate-gemini-entry">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              Hello there.
            </h1>
            <p className="text-lg text-gemini-text-muted font-medium mb-10">
              How can I help you today?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              {[
                { icon: "✍️", label: "Help me write", detail: "a poem about the ocean" },
                { icon: "🗺️", label: "Plan a trip", detail: "to Italy's Amalfi Coast" },
                { icon: "📊", label: "Summarize", detail: "the latest tech trends" },
                { icon: "💡", label: "Brainstorm", detail: "a name for my startup" }
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(`${item.label} ${item.detail}`)}
                  className="p-4 bg-[#1e1f20] border border-white/5 rounded-2xl hover:bg-white/5 hover:border-white/10 transition-all group text-left"
                >
                  <span className="text-base mb-1 block">{item.icon}</span>
                  <p className="text-sm font-bold text-white group-hover:text-indigo-400 mb-0.5">{item.label}</p>
                  <p className="text-xs text-gemini-text-muted">{item.detail}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full max-w-3xl space-y-6">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-3 animate-gemini-entry ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-[#2d2e30] text-gemini-text'}`}>
                  {msg.role === 'user' ? 'U' : 'L'}
                </div>
                <div className={`max-w-[85%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                  <div className={`text-[15px] leading-relaxed ${msg.role === 'user' ? 'bg-[#1e1f20] p-3.5 rounded-2xl inline-block text-left border border-white/5' : 'text-gemini-text'}`}>
                    <ErrorBoundary
                      fallbackRender={({ error }) => (
                        <div className="text-[10px] text-red-400 p-2 italic bg-red-500/5 rounded">
                          Render Error: {error.message}
                        </div>
                      )}
                    >
                      {msg.role === 'user' ? (
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      ) : (
                        <div className="prose prose-invert max-w-none prose-p:my-2 prose-code:text-pink-300">
                          <ReactMarkdown>
                            {String(msg.content || '')}
                          </ReactMarkdown>
                        </div>
                      )}
                    </ErrorBoundary>
                  </div>
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex gap-3 items-center">
                <div className="w-7 h-7 rounded-full bg-[#2d2e30] flex items-center justify-center">
                  <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-indigo-400 rounded-full animate-spin"></div>
                </div>
                <div className="space-y-2 flex-grow max-w-[60%]">
                  <div className="h-3.5 bg-white/5 rounded w-3/4 animate-pulse"></div>
                  <div className="h-3.5 bg-white/5 rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* ─── Input Bar ─── */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#131314] via-[#131314] to-transparent">
        <div className="max-w-3xl mx-auto pb-4">
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
            className="flex items-end gap-2 p-2 rounded-[24px] border border-white/5 bg-[#1e1f20] shadow-2xl">
            <textarea
              rows="1"
              placeholder="Message Lumina AI..."
              className="bg-transparent text-base text-gemini-text placeholder-gemini-text-muted px-3 py-2.5 outline-none resize-none flex-grow font-medium disabled:opacity-50"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isProcessing}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  e.stopPropagation();
                  sendMessage();
                }
              }}
            />
            <button
              type="submit"
              disabled={!query.trim() || isProcessing}
              className="bg-indigo-600 disabled:bg-[#2d2e30] text-white disabled:text-gemini-text-muted p-2 rounded-full transition-all active:scale-90 shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
            </button>
          </form>
          <p className="text-center text-[10px] text-gemini-text-muted mt-2">
            Lumina AI can make mistakes. Sign in to save conversations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;