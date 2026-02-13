import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const Dashboard = () => {
    const navigate = useNavigate();

    // ─── State ─────────────────────────────────────────────────
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [query, setQuery] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [editingChatId, setEditingChatId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [settingsTab, setSettingsTab] = useState('general');

    // Settings state
    const [settingsData, setSettingsData] = useState({
        theme: 'dark',
        userName: localStorage.getItem('userName') || 'User',
        userEmail: localStorage.getItem('userEmail') || '',
        notifications: true,
        chatHistory: true,
        dataSharing: false,
    });

    const messagesEndRef = useRef(null);
    const profileRef = useRef(null);

    // ─── Chat State ────────────────────────────────────────────
    const [chatHistory, setChatHistory] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);
    const [allMessages, setAllMessages] = useState({});

    // ─── Auth Guard & Fetch History ────────────────────────────
    useEffect(() => {
        let cancelled = false;
        const token = localStorage.getItem('access_token');
        if (!token) { navigate('/login'); return; }

        (async () => {
            try {
                const res = await fetch('http://127.0.0.1:8000/ai/history', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (cancelled) return;
                if (res.ok) {
                    const data = await res.json();
                    const grouped = {};
                    (data.history || []).forEach(msg => {
                        if (!grouped[msg.conversation_id]) grouped[msg.conversation_id] = [];
                        grouped[msg.conversation_id].push(
                            { id: msg.id * 2, role: 'user', content: msg.message || '' },
                            { id: msg.id * 2 + 1, role: 'assistant', content: msg.response || '' }
                        );
                    });
                    setAllMessages(grouped);

                    const seen = new Set();
                    const convs = [];
                    (data.history || []).forEach(msg => {
                        if (!seen.has(msg.conversation_id)) {
                            seen.add(msg.conversation_id);
                            convs.push({
                                id: msg.conversation_id,
                                title: msg.message ? msg.message.slice(0, 35) + (msg.message.length > 35 ? '…' : '') : `Chat ${msg.conversation_id}`,
                                date: msg.timestamp ? new Date(msg.timestamp).toLocaleDateString() : 'Today'
                            });
                        }
                    });
                    convs.sort((a, b) => b.id - a.id);
                    setChatHistory(convs);
                    if (convs.length > 0) setActiveChatId(convs[0].id);
                } else if (res.status === 401) {
                    localStorage.clear();
                    navigate('/login');
                }
            } catch (e) {
                // Backend may be down — still allow dashboard usage
            }
        })();
        return () => { cancelled = true; };
    }, []);

    // ─── Derived ───────────────────────────────────────────────
    const messages = allMessages[activeChatId] || [];
    const filteredHistory = chatHistory.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));

    const userName = localStorage.getItem('userName') || 'User';
    const userEmail = localStorage.getItem('userEmail') || '';
    const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

    // ─── Auto Scroll ──────────────────────────────────────────
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isProcessing]);

    // ─── Click Outside Profile Menu ───────────────────────────
    useEffect(() => {
        const handler = (e) => { if (profileRef.current && !profileRef.current.contains(e.target)) setProfileMenuOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ─── Send Message ─────────────────────────────────────────
    const handleSend = async () => {
        if (!query.trim() || isProcessing) return;
        const token = localStorage.getItem('access_token');
        const text = query.trim();
        const chatId = activeChatId || 'temp';
        const userMsg = { id: Date.now(), role: 'user', content: text };

        setAllMessages(prev => ({ ...prev, [chatId]: [...(prev[chatId] || []), userMsg] }));
        setQuery('');
        setIsProcessing(true);

        try {
            const controller = new AbortController();
            const tid = setTimeout(() => controller.abort(), 30000);
            const res = await fetch('http://127.0.0.1:8000/ai/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ message: text, conversation_id: activeChatId }),
                signal: controller.signal
            });
            clearTimeout(tid);

            if (res.status === 429) {
                const bot = { id: Date.now() + 1, role: 'assistant', content: "⚠️ **Rate limit reached.** The AI is getting too many requests right now. Please wait a moment and try again." };
                setAllMessages(prev => ({ ...prev, [chatId]: [...(prev[chatId] || []), bot] }));
                setIsProcessing(false);
                return;
            }

            if (!res.ok) throw new Error('fail');

            const data = await res.json();
            const bot = { id: Date.now() + 1, role: 'assistant', content: data.response };
            const cid = activeChatId || data.conversation_id || chatId;

            setAllMessages(prev => ({ ...prev, [cid]: [...(prev[cid] || []), bot] }));
            if (!activeChatId && data.conversation_id) {
                setActiveChatId(data.conversation_id);
                setChatHistory(prev => [{ id: data.conversation_id, title: text.slice(0, 35) + (text.length > 35 ? '…' : ''), date: 'Today' }, ...prev.filter(c => c.id !== 'temp')]);
            }
        } catch {
            // Fallback simulation
            await new Promise(r => setTimeout(r, 700));
            const q = text.toLowerCase();
            let reply;
            if (q.includes('hello') || q.includes('hi')) {
                reply = "Hello! 👋 I'm **Lumina AI**. How can I assist you today?\n\nI can help with:\n- ✍️ Writing & content creation\n- 💻 Code & debugging\n- 📊 Analysis & research\n- 💡 Brainstorming & ideas";
            } else if (q.includes('code') || q.includes('python') || q.includes('javascript') || q.includes('debug')) {
                reply = "Here's an example to get you started:\n\n```python\ndef greet(name):\n    return f\"Hello, {name}! Welcome to Lumina AI.\"\n\nprint(greet(\"Developer\"))\n```\n\nFeel free to paste your code and I'll help debug or improve it!";
            } else if (q.includes('poem') || q.includes('write')) {
                reply = "## ✨ A Digital Dream\n\nIn circuits deep where data streams flow,\nA spark of thought begins to grow.\nThrough silicon valleys, vast and wide,\nCreativity and code reside.\n\n*— Generated by Lumina AI*";
            } else {
                reply = `Great question about **"${text}"**! Here's my analysis:\n\n1. **Understanding**: I've processed your request carefully\n2. **Key Insight**: This is an interesting area to explore\n3. **Suggestion**: I can dive deeper if you provide more context\n\n> 💡 Your chat history is being saved automatically.\n\nWhat would you like to know more about?`;
            }
            const bot = { id: Date.now() + 1, role: 'assistant', content: reply };
            setAllMessages(prev => ({ ...prev, [chatId]: [...(prev[chatId] || []), bot] }));

            if (!activeChatId) {
                const newId = Date.now() + 2;
                const tempMsgs = [...(allMessages['temp'] || []), userMsg, bot];
                setActiveChatId(newId);
                setChatHistory(prev => [{ id: newId, title: text.slice(0, 35) + (text.length > 35 ? '…' : ''), date: 'Today' }, ...prev.filter(c => c.id !== 'temp')]);
                setAllMessages(prev => { const { temp, ...rest } = prev; return { ...rest, [newId]: tempMsgs }; });
            }
        } finally {
            setIsProcessing(false);
        }
    };

    // ─── Chat Actions ─────────────────────────────────────────
    const handleNewChat = () => { setActiveChatId(null); setQuery(''); };

    const saveEdit = (id) => {
        setChatHistory(prev => prev.map(c => c.id === id ? { ...c, title: editTitle.trim() || 'Untitled' } : c));
        setEditingChatId(null);
    };

    const deleteChat = async (id) => {
        const token = localStorage.getItem('access_token');
        try { await fetch(`http://127.0.0.1:8000/ai/conversation/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }); } catch { }
        const rest = chatHistory.filter(c => c.id !== id);
        setChatHistory(rest);
        const { [id]: _, ...msgs } = allMessages;
        setAllMessages(msgs);
        if (activeChatId === id) setActiveChatId(rest.length > 0 ? rest[0].id : null);
    };

    const handleLogout = () => { localStorage.clear(); navigate('/'); };

    const saveSettings = () => {
        localStorage.setItem('userName', settingsData.userName);
        localStorage.setItem('userEmail', settingsData.userEmail);
        setSettingsOpen(false);
    };

    // ─── RENDER ────────────────────────────────────────────────
    return (
        <div className="flex h-screen dark-theme font-sans overflow-hidden">
            {/* ═══ SIDEBAR ═══ */}
            <aside className={`${sidebarOpen ? 'w-72' : 'w-0 md:w-14'} gemini-sidebar h-full flex flex-col transition-all duration-300 z-30 overflow-hidden shrink-0`}>
                {/* Top */}
                <div className="p-3 flex items-center justify-between shrink-0">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="gemini-icon-btn">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                    {sidebarOpen && <span className="text-base font-bold">Lumina AI</span>}
                </div>

                {/* New Chat */}
                <div className="px-2 shrink-0">
                    <button onClick={handleNewChat} className={`flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-white/5 transition-colors w-full border border-white/10 ${!sidebarOpen && 'justify-center'}`}>
                        <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        {sidebarOpen && <span className="text-sm font-medium">New Chat</span>}
                    </button>
                </div>

                {/* Search + History */}
                {sidebarOpen && (
                    <div className="flex-grow overflow-y-auto custom-scrollbar px-2 mt-3">
                        {/* Search */}
                        <div className="relative mb-3">
                            <svg className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gemini-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            <input
                                type="text" placeholder="Search chats..."
                                className="w-full bg-white/5 border border-white/5 rounded-lg pl-8 pr-3 py-2 text-xs text-gemini-text outline-none focus:border-white/10"
                                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {filteredHistory.length > 0 ? (
                            <>
                                <p className="text-[10px] font-bold text-gemini-text-muted uppercase tracking-widest mb-2 px-1">Recent</p>
                                <div className="space-y-0.5">
                                    {filteredHistory.map(chat => (
                                        <div key={chat.id}
                                            className={`group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${activeChatId === chat.id ? 'bg-white/10 text-white' : 'text-gemini-text-muted hover:bg-white/5 hover:text-white'}`}
                                            onClick={() => setActiveChatId(chat.id)}>
                                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                                            {editingChatId === chat.id ? (
                                                <input autoFocus className="bg-transparent border-b border-indigo-500 outline-none text-xs w-full" value={editTitle}
                                                    onChange={(e) => setEditTitle(e.target.value)}
                                                    onBlur={() => saveEdit(chat.id)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            saveEdit(chat.id);
                                                        }
                                                    }}
                                                    onClick={(e) => e.stopPropagation()} />
                                            ) : (
                                                <span className="text-xs truncate flex-1">{chat.title}</span>
                                            )}
                                            {editingChatId !== chat.id && (
                                                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                                    <button onClick={(e) => { e.stopPropagation(); setEditingChatId(chat.id); setEditTitle(chat.title); }} className="p-1 hover:text-indigo-400" title="Rename">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }} className="p-1 hover:text-red-400" title="Delete">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p className="text-center text-xs text-gemini-text-muted mt-6">{searchQuery ? 'No results.' : 'No chats yet.'}</p>
                        )}
                    </div>
                )}

                {/* Profile */}
                <div className="p-2 border-t border-gemini-border relative shrink-0" ref={profileRef}>
                    {profileMenuOpen && (
                        <div className="absolute bottom-full left-1 right-1 mb-1 bg-[#1e1f20] border border-gemini-border rounded-xl shadow-2xl overflow-hidden animate-gemini-entry z-50">
                            <div className="p-3 border-b border-gemini-border flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">{initials}</div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-white truncate">{userName}</p>
                                    <p className="text-[10px] text-gemini-text-muted truncate">{userEmail}</p>
                                </div>
                            </div>
                            <button onClick={() => { setSettingsOpen(true); setProfileMenuOpen(false); }} className="w-full text-left px-3 py-2.5 text-sm hover:bg-white/5 transition-colors flex items-center gap-2.5 text-gemini-text">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                Settings
                            </button>
                            <button onClick={handleLogout} className="w-full text-left px-3 py-2.5 text-sm hover:bg-red-500/10 text-red-400 transition-colors flex items-center gap-2.5 border-t border-gemini-border">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                Sign Out
                            </button>
                        </div>
                    )}
                    <button onClick={() => setProfileMenuOpen(!profileMenuOpen)} className={`flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-white/5 transition-colors w-full ${!sidebarOpen && 'justify-center'}`}>
                        <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">{initials}</div>
                        {sidebarOpen && <p className="text-sm font-medium truncate">{userName}</p>}
                    </button>
                </div>
            </aside>

            {/* ═══ MAIN ═══ */}
            <div className="flex-grow flex flex-col relative overflow-hidden h-full">
                {/* Header */}
                <header className="h-12 flex items-center justify-between px-4 border-b border-white/5 shrink-0 z-10">
                    <div className="flex items-center gap-2">
                        {!sidebarOpen && (
                            <button onClick={() => setSidebarOpen(true)} className="gemini-icon-btn p-1.5 md:hidden">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                            </button>
                        )}
                        {!sidebarOpen && <span className="text-base font-bold">Lumina AI</span>}
                    </div>
                    <div></div>
                </header>

                {/* Messages */}
                <div className="flex-grow overflow-y-auto custom-scrollbar px-4 pt-4 pb-44 flex flex-col items-center">
                    {!activeChatId && messages.length === 0 ? (
                        <div className="w-full max-w-2xl text-center mt-12 animate-gemini-entry">
                            <h1 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight">Welcome, {userName}</h1>
                            <p className="text-base text-gemini-text-muted font-medium mb-10">What would you like to explore?</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                                {[
                                    { icon: "✍️", label: "Help me write", detail: "a creative story" },
                                    { icon: "💻", label: "Debug code", detail: "find and fix bugs" },
                                    { icon: "📊", label: "Analyze data", detail: "get insights" },
                                    { icon: "💡", label: "Brainstorm", detail: "generate ideas" }
                                ].map((item, idx) => (
                                    <button key={idx} onClick={() => setQuery(`${item.label} ${item.detail}`)}
                                        className="p-3.5 bg-[#1e1f20] border border-white/5 rounded-xl hover:bg-white/5 hover:border-white/10 transition-all group text-left">
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
                                        {msg.role === 'user' ? initials : 'L'}
                                    </div>
                                    <div className={`max-w-[85%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                                        <div className={`text-[15px] leading-relaxed ${msg.role === 'user' ? 'bg-[#1e1f20] p-3.5 rounded-2xl inline-block text-left border border-white/5' : 'text-gemini-text'}`}>
                                            {msg.role === 'user' ? (msg.content || '') : (
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}
                                                    className="prose prose-invert max-w-none prose-p:my-2 prose-headings:mb-3 prose-headings:mt-4 prose-code:text-pink-300 prose-pre:bg-[#1e1f20] prose-pre:p-4 prose-pre:rounded-lg"
                                                    components={{
                                                        code({ node, inline, className, children, ...props }) {
                                                            return !inline ? (
                                                                <pre className="bg-[#1e1f20] p-4 rounded-lg overflow-x-auto my-3 custom-scrollbar border border-white/10">
                                                                    <code className={className} {...props}>{children}</code>
                                                                </pre>
                                                            ) : (
                                                                <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono text-pink-300" {...props}>{children}</code>
                                                            );
                                                        }
                                                    }}>
                                                    {msg.content || ''}
                                                </ReactMarkdown>
                                            )}
                                        </div>
                                        {msg.role === 'assistant' && (
                                            <div className="flex gap-2 mt-2 opacity-0 hover:opacity-60 transition-opacity">
                                                <button className="gemini-icon-btn p-1" title="Copy"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></button>
                                                <button className="gemini-icon-btn p-1" title="Like"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg></button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isProcessing && (
                                <div className="flex gap-3 items-center animate-gemini-entry">
                                    <div className="w-7 h-7 rounded-full bg-[#2d2e30] flex items-center justify-center">
                                        <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-indigo-400 rounded-full animate-spin"></div>
                                    </div>
                                    <div className="space-y-2 max-w-[50%]">
                                        <div className="h-3 bg-white/5 rounded w-3/4 animate-pulse"></div>
                                        <div className="h-3 bg-white/5 rounded w-1/2 animate-pulse"></div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Input */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#131314] via-[#131314] to-transparent">
                    <div className="max-w-3xl mx-auto pb-4">
                        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                            className="flex items-end gap-2 p-2 rounded-[24px] border border-white/5 bg-[#1e1f20] shadow-2xl">
                            <textarea rows="1" placeholder="Message Lumina AI..."
                                className="bg-transparent text-base text-gemini-text placeholder-gemini-text-muted px-3 py-2.5 outline-none resize-none flex-grow font-medium disabled:opacity-50"
                                value={query} onChange={(e) => setQuery(e.target.value)}
                                disabled={isProcessing}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleSend();
                                    }
                                }} />
                            <button type="submit" disabled={!query.trim() || isProcessing}
                                className="bg-indigo-600 disabled:bg-[#2d2e30] text-white disabled:text-gemini-text-muted p-2 rounded-full transition-all active:scale-90 shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                            </button>
                        </form>
                        <p className="text-center text-[10px] text-gemini-text-muted mt-2">Lumina AI can make mistakes. Check important info.</p>
                    </div>
                </div>
            </div>

            {/* ═══ SETTINGS MODAL ═══ */}
            {settingsOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSettingsOpen(false)}>
                    <div className="bg-[#1e1f20] rounded-2xl border border-gemini-border w-full max-w-lg shadow-2xl animate-gemini-entry max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-gemini-border shrink-0">
                            <h2 className="text-lg font-bold text-white">Settings</h2>
                            <button onClick={() => setSettingsOpen(false)} className="gemini-icon-btn p-1.5">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-gemini-border px-5 shrink-0">
                            {[
                                { id: 'general', label: 'General' },
                                { id: 'profile', label: 'Profile' },
                                { id: 'privacy', label: 'Privacy' },
                            ].map(tab => (
                                <button key={tab.id} onClick={() => setSettingsTab(tab.id)}
                                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${settingsTab === tab.id ? 'border-indigo-500 text-white' : 'border-transparent text-gemini-text-muted hover:text-white'}`}>
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="p-5 overflow-y-auto custom-scrollbar flex-grow space-y-5">
                            {settingsTab === 'general' && (
                                <>
                                    {/* Theme */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-white">Theme</p>
                                            <p className="text-xs text-gemini-text-muted mt-0.5">Choose appearance</p>
                                        </div>
                                        <select value={settingsData.theme} onChange={(e) => setSettingsData({ ...settingsData, theme: e.target.value })}
                                            className="bg-[#131314] border border-gemini-border rounded-lg px-3 py-1.5 text-sm text-white outline-none">
                                            <option value="dark">Dark</option>
                                            <option value="light">Light</option>
                                            <option value="system">System</option>
                                        </select>
                                    </div>
                                    {/* Notifications */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-white">Notifications</p>
                                            <p className="text-xs text-gemini-text-muted mt-0.5">Get notified about updates</p>
                                        </div>
                                        <button onClick={() => setSettingsData({ ...settingsData, notifications: !settingsData.notifications })}
                                            className={`w-10 h-6 rounded-full relative transition-colors ${settingsData.notifications ? 'bg-indigo-600' : 'bg-[#333]'}`}>
                                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow ${settingsData.notifications ? 'right-1' : 'left-1'}`}></div>
                                        </button>
                                    </div>
                                    {/* Chat History */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-white">Save Chat History</p>
                                            <p className="text-xs text-gemini-text-muted mt-0.5">Store conversations</p>
                                        </div>
                                        <button onClick={() => setSettingsData({ ...settingsData, chatHistory: !settingsData.chatHistory })}
                                            className={`w-10 h-6 rounded-full relative transition-colors ${settingsData.chatHistory ? 'bg-indigo-600' : 'bg-[#333]'}`}>
                                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow ${settingsData.chatHistory ? 'right-1' : 'left-1'}`}></div>
                                        </button>
                                    </div>
                                    {/* Delete All */}
                                    <div className="pt-3 border-t border-gemini-border">
                                        <button onClick={() => { setChatHistory([]); setAllMessages({}); setActiveChatId(null); }}
                                            className="text-sm text-red-400 hover:text-red-300 font-medium transition-colors">
                                            Delete all chat history
                                        </button>
                                    </div>
                                </>
                            )}

                            {settingsTab === 'profile' && (
                                <>
                                    {/* Avatar */}
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center text-lg font-bold text-white">{initials}</div>
                                        <div>
                                            <p className="text-sm font-semibold text-white">{settingsData.userName}</p>
                                            <p className="text-xs text-gemini-text-muted">{settingsData.userEmail}</p>
                                        </div>
                                    </div>
                                    {/* Name */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gemini-text-muted uppercase tracking-widest">Display Name</label>
                                        <input type="text" value={settingsData.userName}
                                            onChange={(e) => setSettingsData({ ...settingsData, userName: e.target.value })}
                                            className="w-full bg-[#131314] border border-gemini-border rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-indigo-500/50 transition-all" />
                                    </div>
                                    {/* Email */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gemini-text-muted uppercase tracking-widest">Email</label>
                                        <input type="email" value={settingsData.userEmail}
                                            onChange={(e) => setSettingsData({ ...settingsData, userEmail: e.target.value })}
                                            className="w-full bg-[#131314] border border-gemini-border rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-indigo-500/50 transition-all" />
                                    </div>
                                    {/* Change Password */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gemini-text-muted uppercase tracking-widest">New Password</label>
                                        <input type="password" placeholder="••••••••"
                                            className="w-full bg-[#131314] border border-gemini-border rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-indigo-500/50 transition-all placeholder-[#555]" />
                                    </div>
                                    {/* Save */}
                                    <button onClick={saveSettings}
                                        className="w-full bg-indigo-600 text-white rounded-full py-2.5 font-bold text-sm hover:bg-indigo-500 active:scale-[0.98] transition-all mt-2">
                                        Save Changes
                                    </button>
                                </>
                            )}

                            {settingsTab === 'privacy' && (
                                <>
                                    {/* Data Sharing */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-white">Data Sharing</p>
                                            <p className="text-xs text-gemini-text-muted mt-0.5">Share usage data to improve AI</p>
                                        </div>
                                        <button onClick={() => setSettingsData({ ...settingsData, dataSharing: !settingsData.dataSharing })}
                                            className={`w-10 h-6 rounded-full relative transition-colors ${settingsData.dataSharing ? 'bg-indigo-600' : 'bg-[#333]'}`}>
                                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow ${settingsData.dataSharing ? 'right-1' : 'left-1'}`}></div>
                                        </button>
                                    </div>
                                    {/* Permissions */}
                                    <div className="space-y-3">
                                        <p className="text-sm font-semibold text-white">Permissions</p>
                                        {[
                                            { label: 'Camera Access', enabled: false },
                                            { label: 'Microphone Access', enabled: false },
                                            { label: 'Location Access', enabled: false },
                                        ].map((perm, idx) => (
                                            <div key={idx} className="flex items-center justify-between py-1">
                                                <p className="text-xs text-gemini-text-muted">{perm.label}</p>
                                                <div className={`w-10 h-6 rounded-full relative ${perm.enabled ? 'bg-indigo-600' : 'bg-[#333]'}`}>
                                                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow ${perm.enabled ? 'right-1' : 'left-1'}`}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Contact & Export */}
                                    <div className="pt-3 border-t border-gemini-border space-y-3">
                                        <div>
                                            <p className="text-sm font-semibold text-white mb-1">Contact Support</p>
                                            <p className="text-xs text-gemini-text-muted">Email: support@lumina-ai.com</p>
                                        </div>
                                        <button className="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                                            Export my data
                                        </button>
                                        <button className="text-sm text-red-400 hover:text-red-300 font-medium transition-colors block">
                                            Delete my account
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
