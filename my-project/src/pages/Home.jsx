import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-indigo-100">

      {/* ─── Premium Header ─── */}
      <header className="flex justify-between items-center px-8 md:px-12 py-6 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
          <div className="bg-slate-950 text-white w-9 h-9 flex items-center justify-center rounded-[12px] font-black text-xl shadow-lg group-hover:rotate-[10deg] transition-transform duration-500 italic">
            L
          </div>
          <span className="text-xl font-black tracking-tighter text-slate-900 group-hover:tracking-tight transition-all">Lumina AI</span>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors px-4 py-2 rounded-full hover:bg-slate-100/50">
            Log in
          </Link>
          <Link to="/signup" className="text-sm font-bold bg-slate-950 text-white px-6 py-2.5 rounded-full hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95">
            Sign up
          </Link>
        </div>
      </header>

      {/* ─── Main Content: Center Stage ─── */}
      <main className="flex-grow flex flex-col items-center justify-center px-6 -mt-16">

        <div className="w-full max-w-3xl flex flex-col items-center animate-fade-in-up">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-8 tracking-tighter text-center">
            What's on your mind today?
          </h1>

          <form
            onSubmit={handleSearch}
            className="w-full relative group"
          >
            {/* The Iconic Pill */}
            <div className="flex items-center bg-white border border-slate-200/60 rounded-[2.5rem] p-3 pl-6 pr-3 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] focus-within:shadow-[0_30px_70px_-20px_rgba(0,0,0,0.15)] focus-within:border-indigo-100 transition-all duration-700">

              <button type="button" className="p-2.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-2xl transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              </button>

              <input
                type="text"
                placeholder="Message Lumina AI..."
                className="flex-1 bg-transparent px-4 outline-none text-lg text-slate-800 placeholder-slate-400 font-medium"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />

              <div className="flex items-center gap-3">
                <button type="button" className="hidden md:flex p-2.5 text-slate-400 hover:text-slate-600 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                </button>
                <button
                  type="submit"
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${query.trim()
                      ? "bg-slate-950 text-white shadow-xl hover:scale-110"
                      : "bg-slate-50 text-slate-200"
                    }`}
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 4v16m4-12v8m4-6v4M8 8v8M4 10v4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Suggestion Chips */}
            <div className="mt-8 flex flex-wrap justify-center gap-3 opacity-0 animate-fade-in [animation-delay:400ms]">
              {["Brand concept", "Plan a trip", "Code a bot", "Email draft"].map((hint) => (
                <button
                  key={hint}
                  type="button"
                  onClick={() => setQuery(hint)}
                  className="px-5 py-2 rounded-full bg-slate-50 border border-slate-100 text-[13px] font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all active:scale-95"
                >
                  {hint}
                </button>
              ))}
            </div>
          </form>
        </div>
      </main>

      {/* ─── Footer ─── */}
      <footer className="py-8 text-center">
        <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em] font-sans">
          Lumina AI can make mistakes. Check important info.
        </p>
      </footer>
    </div>
  );
};

export default Home;