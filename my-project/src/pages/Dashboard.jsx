import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();

    // ─── State ──────────────────────────────────────────
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [inputValue, setInputValue] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [editingChatId, setEditingChatId] = useState(null);
    const [tempTitle, setTempTitle] = useState('');

    const messagesEndRef = useRef(null);
    const profileRef = useRef(null);
    const inputRef = useRef(null);

    // ─── Chat History ──────
    const [chatHistory, setChatHistory] = useState([
        { id: 1, title: 'Project Brainstorming', date: 'Today' },
        { id: 2, title: 'React Hooks Guide', date: 'Yesterday' },
        { id: 3, title: 'Tailwind Best Practices', date: 'Yesterday' },
    ]);

    const [activeChatId, setActiveChatId] = useState(1);
    const [allMessages, setAllMessages] = useState({
        1: [
            { id: 1, role: 'assistant', content: 'Hello! I am Lumina. How can I help you refine your ideas today?' },
        ],
    });

    const messages = allMessages[activeChatId] || [];

    // Filtered History
    const filteredHistory = chatHistory.filter(chat =>
        chat.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Profile Data
    const storedName = localStorage.getItem('userName') || 'User Name';
    const profile = {
        name: storedName,
        initials: storedName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
    };

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isProcessing]);

    // Close profile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setProfileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ─── Fetch Backend History ───
    useEffect(() => {
        const fetchHistory = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) return;

            try {
                const response = await fetch("http://127.0.0.1:8000/ai/history", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.history && data.history.length > 0) {
                        // For simplicity, we'll map the database records 
                        // to the simplified single-chat structure for now.
                        // Ideally, we'd eventually want grouped conversations.

                        const historyMessages = data.history.flatMap(h => [
                            { id: `u-${h.id}`, role: 'user', content: h.message },
                            { id: `a-${h.id}`, role: 'assistant', content: h.response }
                        ]);

                        setAllMessages(prev => ({
                            ...prev,
                            [activeChatId]: [...(prev[activeChatId] || []), ...historyMessages]
                        }));
                    }
                }
            } catch (err) {
                console.error("Failed to fetch history:", err);
            }
        };

        fetchHistory();
    }, []); // Run once on mount

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isProcessing) return;

        const userMsg = { id: Date.now(), role: 'user', content: inputValue };
        setAllMessages(prev => ({
            ...prev,
            [activeChatId]: [...(prev[activeChatId] || []), userMsg]
        }));
        setInputValue('');
        setIsProcessing(true);

        const token = localStorage.getItem('access_token');
        const headers = { "Content-Type": "application/json" };
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        try {
            const response = await fetch("http://127.0.0.1:8000/ai/ask", {
                method: "POST",
                headers: headers,
                body: JSON.stringify({
                    message: userMsg.content,
                    system_prompt: "You are Lumina AI, a helpful and clean chatbot."
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setAllMessages(prev => ({
                    ...prev,
                    [activeChatId]: [...(prev[activeChatId] || []), { id: Date.now() + 1, role: 'assistant', content: data.response }]
                }));
            } else {
                throw new Error('Backend error');
            }
        } catch (error) {
            console.error("Fetch error:", error);
            setTimeout(() => {
                setAllMessages(prev => ({
                    ...prev,
                    [activeChatId]: [...(prev[activeChatId] || []), { id: Date.now() + 1, role: 'assistant', content: "Got it! Lumina here. I'm ready for the next challenge." }]
                }));
                setIsProcessing(false);
            }, 1000);
            return;
        } finally {
            setTimeout(() => setIsProcessing(false), 800);
        }
    };

    const handleNewChat = () => {
        const newId = Date.now();
        const newChat = { id: newId, title: 'New chat', date: 'Today' };
        setChatHistory([newChat, ...chatHistory]);
        setAllMessages({ ...allMessages, [newId]: [{ id: 1, role: 'assistant', content: 'New session started. How can I assist you?' }] });
        setActiveChatId(newId);
    };

    const startEditing = (chat) => {
        setEditingChatId(chat.id);
        setTempTitle(chat.title);
    };

    const saveTitle = (id) => {
        setChatHistory(prev => prev.map(c => c.id === id ? { ...c, title: tempTitle || 'Untitled Chat' } : c));
        setEditingChatId(null);
    };

    return (
        <div className="flex h-screen bg-white font-sans text-slate-900 overflow-hidden selection:bg-indigo-100">

            {/* ─── Premium Modern Sidebar ─── */}
            <aside className={`${sidebarOpen ? 'w-[300px]' : 'w-0'} bg-slate-50 border-r border-slate-200/50 flex flex-col transition-all duration-500 ease-in-out overflow-hidden shrink-0 shadow-sm relative z-40`}>
                <div className="flex flex-col h-full">

                    {/* Header: New Chat & Hide Sidebar */}
                    <div className="p-5 flex items-center justify-between mb-2">
                        <button
                            onClick={handleNewChat}
                            className="flex-1 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all text-[13px] font-black text-slate-700 active:scale-[0.97]"
                        >
                            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" /></svg>
                            New Chat
                        </button>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="ml-3 p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-xl transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
                        </button>
                    </div>

                    {/* Search Field */}
                    <div className="px-5 mb-6">
                        <div className="relative group">
                            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            <input
                                type="text"
                                placeholder="Search reflections..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-slate-200/40 border-transparent focus:bg-white focus:border-indigo-100 border-2 rounded-2xl text-[12px] outline-none transition-all placeholder-slate-400 font-bold uppercase tracking-wider"
                            />
                        </div>
                    </div>

                    {/* Scrollable History */}
                    <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar px-3 pb-6">
                        <div className="px-4 mb-3">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Chronicle</p>
                        </div>
                        {filteredHistory.map(chat => (
                            <div
                                key={chat.id}
                                className={`group relative flex items-center rounded-[1.2rem] transition-all duration-300 mx-1 ${activeChatId === chat.id ? 'bg-white shadow-lg ring-1 ring-slate-100' : 'hover:bg-slate-100'}`}
                            >
                                {editingChatId === chat.id ? (
                                    <input
                                        autoFocus
                                        value={tempTitle}
                                        onChange={(e) => setTempTitle(e.target.value)}
                                        onBlur={() => saveTitle(chat.id)}
                                        onKeyDown={(e) => e.key === 'Enter' && saveTitle(chat.id)}
                                        className="w-full bg-white px-4 py-3.5 rounded-[1.2rem] text-[13px] outline-none border-2 border-indigo-200 shadow-inner font-bold"
                                    />
                                ) : (
                                    <button
                                        onClick={() => setActiveChatId(chat.id)}
                                        className={`flex-1 flex items-center gap-4 px-4 py-4 text-[13px] truncate rounded-[1.2rem] transition-all ${activeChatId === chat.id ? 'font-black text-slate-900' : 'text-slate-500 font-bold'}`}
                                    >
                                        <div className={`w-2 h-2 rounded-full shrink-0 transition-all ${activeChatId === chat.id ? 'bg-indigo-500 scale-125 shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'bg-slate-300 shadow-none'}`}></div>
                                        <span className="truncate">{chat.title}</span>
                                    </button>
                                )}

                                {editingChatId !== chat.id && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); startEditing(chat); }}
                                        className="absolute right-3 opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-indigo-500 hover:bg-white rounded-lg transition-all shadow-sm"
                                        title="Rename"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Account: Consolidated Menu */}
                    <div className="mt-auto p-4 border-t border-slate-200/60 relative" ref={profileRef}>
                        {profileMenuOpen && (
                            <div className="absolute bottom-[calc(100%+12px)] left-4 right-4 bg-white border border-slate-200/80 rounded-[2.2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden animate-scale-up z-50 p-2.5">
                                <button className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 rounded-2xl text-[13px] font-black text-slate-700 transition-all group">
                                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    </div>
                                    Settings
                                </button>
                                <div className="h-px bg-slate-50 my-1.5 mx-3"></div>
                                <button
                                    onClick={() => navigate('/')}
                                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-red-50 rounded-2xl text-[13px] font-black text-red-600 transition-all group"
                                >
                                    <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-red-400 group-hover:bg-red-100 group-hover:text-red-600 transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                    </div>
                                    Sign Out
                                </button>
                            </div>
                        )}
                        <button
                            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                            className={`w-full flex items-center gap-4 p-4 rounded-[1.8rem] transition-all duration-300 text-left group ${profileMenuOpen ? 'bg-indigo-50 ring-2 ring-indigo-100/50' : 'hover:bg-white shadow-sm hover:shadow-md'}`}
                        >
                            <div className="w-11 h-11 rounded-[1.2rem] bg-slate-950 text-white flex items-center justify-center text-sm font-black shrink-0 shadow-lg group-hover:rotate-[-5deg] transition-all">
                                {profile.initials}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[14px] font-black truncate text-slate-900 leading-none mb-1.5 tracking-tight">{profile.name}</p>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] leading-none">Standard Tier</p>
                            </div>
                            <svg className={`w-5 h-5 text-slate-300 transition-transform duration-500 ease-out ${profileMenuOpen ? 'rotate-180 text-indigo-400' : 'group-hover:text-slate-500'}`} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" /></svg>
                        </button>
                    </div>
                </div>
            </aside>

            {/* ─── Main Conversational Stage ─── */}
            <main className="flex-1 flex flex-col relative bg-white">

                {/* Floating Navigation Header */}
                <header className="h-20 flex items-center justify-between px-10 shrink-0 relative z-30 bg-white/60 backdrop-blur-xl border-b border-slate-50">
                    <div className="flex items-center gap-6">
                        {!sidebarOpen && (
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="p-3.5 bg-white shadow-xl shadow-slate-200/40 rounded-2xl hover:bg-slate-50 transition-all active:scale-90 border border-slate-100 text-slate-900"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" /></svg>
                            </button>
                        )}
                        <div className="flex items-center gap-4 group cursor-default">
                            <h2 className="text-xl font-black text-slate-900 tracking-tighter transition-all duration-500">Lumina 4.0</h2>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 shadow-sm">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.6)]"></div>
                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none">System Ready</span>
                            </div>
                        </div>
                    </div>

                    <div className="hidden lg:flex items-center gap-4">
                        <div className="flex items-center -space-x-4 hover:space-x-1 transition-all duration-500">
                            {['UX', 'AI', 'WEB'].map((tag, i) => (
                                <div key={i} className="w-11 h-11 rounded-full border-[3px] border-white bg-slate-100/80 backdrop-blur flex items-center justify-center text-[10px] font-black text-slate-400 shadow-sm hover:scale-110 transition-transform cursor-pointer">
                                    {tag}
                                </div>
                            ))}
                        </div>
                        <button className="h-12 px-7 rounded-full bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.25em] shadow-2xl hover:bg-slate-700 transition-all active:scale-95">
                            Share Concept
                        </button>
                    </div>
                </header>

                {/* Chat Container */}
                <div className="flex-1 overflow-y-auto px-6 py-10 relative scroll-smooth custom-scrollbar z-20">
                    <div className="max-w-4xl mx-auto space-y-20 pb-60">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex gap-10 animate-fade-in group ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                {msg.role === 'assistant' && (
                                    <div className="w-14 h-14 rounded-[1.8rem] bg-slate-950 text-white flex items-center justify-center shrink-0 mt-3 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] group-hover:rotate-6 transition-transform relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent"></div>
                                        <span className="text-2xl font-black italic z-10">L</span>
                                    </div>
                                )}
                                <div className={`flex flex-col max-w-[85%] relative ${msg.role === 'user' ? 'items-end' : ''}`}>
                                    <div className={`px-10 py-7 rounded-[3rem] text-[17px] leading-[1.8] transition-all duration-700 relative ${msg.role === 'user'
                                        ? 'bg-slate-100 text-slate-800 rounded-tr-none border border-slate-200/40 hover:bg-slate-200/30'
                                        : 'bg-white border border-slate-100 text-slate-700 font-medium hover:shadow-2xl hover:-translate-y-1'
                                        }`}>
                                        {msg.content}

                                        {/* Dynamic Post-Response Actions (Assistant Hover) */}
                                        {msg.role === 'assistant' && (
                                            <div className="absolute -bottom-12 left-6 flex gap-6 opacity-0 group-hover:opacity-100 transition-all translate-y-3 group-hover:translate-y-0 duration-500">
                                                <button className="flex items-center gap-2 text-[11px] font-black text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-[0.15em]">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                                                    Cite Source
                                                </button>
                                                <button className="flex items-center gap-2 text-[11px] font-black text-slate-400 hover:text-pink-500 transition-colors uppercase tracking-[0.15em]">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                                    Cherish
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {msg.role === 'user' && (
                                    <div className="w-14 h-14 rounded-full border-[6px] border-white shadow-2xl bg-slate-50 text-slate-400 flex items-center justify-center shrink-0 mt-3 text-[12px] font-black group-hover:scale-110 transition-all ring-1 ring-slate-100">
                                        {profile.initials}
                                    </div>
                                )}
                            </div>
                        ))}
                        {isProcessing && (
                            <div className="flex gap-10 items-center pl-6">
                                <div className="w-14 h-14 rounded-[1.8rem] bg-slate-50 border border-slate-100 animate-pulse shrink-0"></div>
                                <div className="flex gap-2.5 bg-indigo-50/40 px-6 py-4 rounded-full border border-indigo-100 ring-4 ring-indigo-50/20">
                                    <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce"></div>
                                </div>
                                <span className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.5em] animate-pulse">Converging Insight</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Ultimate Command Hub */}
                <div className="absolute bottom-12 left-0 right-0 z-40 flex flex-col items-center">
                    <div className="w-full max-w-4xl px-8 relative">

                        {/* Interactive Input Ambient Glow */}
                        <div className={`absolute -inset-6 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent rounded-[5rem] blur-3xl opacity-0 transition-opacity duration-1000 ${inputValue.trim() ? 'opacity-100' : ''}`}></div>

                        <div className={`relative flex items-center bg-white border-2 h-24 pl-10 pr-5 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.12)] transition-all duration-1000 transform ${isProcessing ? 'rounded-[2.8rem] border-indigo-100 bg-indigo-50/10' : 'rounded-[4rem] border-slate-100 focus-within:border-indigo-100 focus-within:shadow-[0_50px_120px_-40px_rgba(0,0,0,0.15)] group-hover:-translate-y-1'
                            }`}>

                            {/* Attachment Trigger */}
                            <button className="p-4 bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-950 rounded-[1.5rem] transition-all active:scale-90 group/attach">
                                <svg className="w-8 h-8 transition-transform group-hover/attach:rotate-90 group-hover/attach:text-indigo-600" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                            </button>

                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Ignite your creative nexus..."
                                className="flex-1 bg-transparent px-10 outline-none text-xl font-medium text-slate-800 placeholder-slate-300 transition-all"
                            />

                            <div className="flex items-center gap-6">
                                <button className="p-4 text-slate-300 hover:text-indigo-600 transition-all active:scale-90 group/mic">
                                    <svg className="w-9 h-9 transition-transform group-hover/mic:scale-110" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                                </button>
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!inputValue.trim() || isProcessing}
                                    className={`relative w-16 h-16 rounded-[2.2rem] flex items-center justify-center transition-all duration-1000 ${inputValue.trim() && !isProcessing
                                        ? "bg-slate-950 text-white shadow-2xl hover:scale-105 active:scale-95 group/send"
                                        : "bg-slate-50 text-slate-200 scale-90"
                                        }`}
                                >
                                    {isProcessing ? (
                                        <div className="w-8 h-8 border-[4px] border-slate-700 border-t-indigo-500 rounded-full animate-spin"></div>
                                    ) : (
                                        <svg className="w-9 h-9 transition-transform group-hover/send:translate-x-1" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24"><path d="M13 5l7 7-7 7M5 12h14" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>
                        <p className="text-center mt-7 text-[11px] font-black text-slate-300 uppercase tracking-[0.4em]">Lumina AI may hallucinate. Verify mission-critical data.</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
