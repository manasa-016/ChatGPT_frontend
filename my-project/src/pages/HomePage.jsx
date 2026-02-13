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

      if (!response.ok) throw new Error('fail');
      const data = await response.json();
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: data.response }]);
    } catch {
      // Fallback simulation when backend is unavailable
      await new Promise(r => setTimeout(r, 700));
      const q = messageText.toLowerCase();
      let reply;
      if (q.includes('hello') || q.includes('hi')) {
        reply = "Hello! 👋 I'm **Lumina AI**, your creative assistant. Ask me anything — I can help with writing, coding, planning, and more!\n\nTry asking me to:\n- Write a poem or story\n- Explain a concept\n- Help debug code\n- Plan a trip";
      } else if (q.includes('poem')) {
        reply = "## 🌊 The Ocean's Song\n\nThe ocean whispers with a restless soul,\nA vast expanse where tides eternally roll.\nWaves dance in silver under the moon's soft glow,\nSecret stories in the depths that only spirits know.\n\nShe cradles ships upon her foamy breast,\nAnd sings the weary sailor songs of rest.";
      } else if (q.includes('italy') || q.includes('trip') || q.includes('plan')) {
        reply = "## 🇮🇹 Italy Trip Plan\n\n**Day 1-2: Rome**\n- Colosseum & Roman Forum\n- Vatican Museums & Sistine Chapel\n- Trastevere neighborhood for dinner\n\n**Day 3-4: Amalfi Coast**\n- Positano — stunning cliff-side views\n- Ravello — Villa Rufolo gardens\n- Boat tour to Capri\n\n**Day 5: Florence**\n- Uffizi Gallery\n- Ponte Vecchio\n- David by Michelangelo\n\n> 💡 **Tip:** Book trains on Trenitalia early for the best prices!";
      } else if (q.includes('tech') || q.includes('trend')) {
        reply = "## 🚀 Top Tech Trends\n\n1. **Generative AI** — LLMs, image generation, AI agents\n2. **Edge Computing** — Processing data closer to the source\n3. **Quantum Computing** — IBM, Google making breakthroughs\n4. **Sustainable Tech** — Green energy & carbon-neutral data centers\n5. **AR/VR** — Apple Vision Pro, Meta Quest\n\n*The AI revolution is just getting started!*";
      } else if (q.includes('code') || q.includes('debug') || q.includes('python') || q.includes('javascript')) {
        reply = "I'd be happy to help with coding! Here's a quick example:\n\n```python\ndef fibonacci(n):\n    \"\"\"Generate Fibonacci sequence up to n terms\"\"\"\n    a, b = 0, 1\n    result = []\n    for _ in range(n):\n        result.append(a)\n        a, b = b, a + b\n    return result\n\nprint(fibonacci(10))\n# Output: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]\n```\n\nFeel free to paste your code and I'll help debug it!";
      } else if (q.includes('brainstorm') || q.includes('name') || q.includes('startup')) {
        reply = "## 💡 Startup Name Ideas\n\n| Name | Vibe |\n|------|------|\n| **NovaMind** | Fresh thinking, bright future |\n| **PulseForge** | Energy and creation |\n| **CloudPetal** | Soft tech, big reach |\n| **ZenithLab** | Peak innovation |\n| **SparkNest** | Where ideas are born |\n| **ByteBloom** | Digital growth |\n\nWant me to brainstorm in a specific direction? (e.g., fintech, health, AI)";
      } else {
        reply = `Great question! Here's my take on **"${messageText.trim()}"**:\n\nI've analyzed your request and here are some thoughts:\n\n- This is an interesting topic worth exploring deeper\n- I can provide more specific help if you give me more details\n- Feel free to ask follow-up questions!\n\n> 💡 **Tip:** Sign in to save your conversation history and access more features!\n\nWhat else would you like to know?`;
      }
      setMessages(prev => [...prev, { id: Date.now() + Math.random(), role: 'assistant', content: String(reply || '') }]);
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
            <ErrorBoundary fallback={<div className="text-red-400 p-4 bg-red-500/10 rounded-xl border border-red-500/20 text-center text-sm">Something went wrong in the chat area. Please refresh.</div>}>
              {messages.map(msg => (
                <div key={msg.id} className={`flex gap-3 animate-gemini-entry ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-[#2d2e30] text-gemini-text'}`}>
                    {msg.role === 'user' ? 'U' : 'L'}
                  </div>
                  <div className={`max-w-[85%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                    <div className={`text-[15px] leading-relaxed ${msg.role === 'user' ? 'bg-[#1e1f20] p-3.5 rounded-2xl inline-block text-left border border-white/5' : 'text-gemini-text'}`}>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        className="prose prose-invert max-w-none prose-p:my-2 prose-headings:mb-3 prose-headings:mt-4 prose-code:text-pink-300 prose-pre:bg-[#1e1f20] prose-pre:p-4 prose-pre:rounded-lg"
                      >
                        {String(msg.content || '')}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
            </ErrorBoundary>
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