import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    return (
        <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Branding */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                            <span className="text-white font-black text-xl">L</span>
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-slate-800">Lumina AI</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-10 text-xs font-black uppercase tracking-[0.2em]">
                        <Link to="/" className={`transition-colors ${location.pathname === '/' ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}>Home</Link>
                        <Link to="/about" className={`transition-colors ${location.pathname === '/about' ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}>About</Link>
                        <Link to="/contact" className={`transition-colors ${location.pathname === '/contact' ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}>Contact</Link>
                    </nav>

                    {/* CTA Section */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link to="/login" className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 hover:text-indigo-600 transition-colors">Login</Link>
                        <Link to="/dashboard" className="px-8 py-3.5 bg-indigo-600 text-white rounded-full text-xs font-black uppercase tracking-[0.25em] hover:bg-indigo-700 transition shadow-xl shadow-indigo-100 transform active:scale-95">
                            Launch Bot
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 text-slate-400 hover:text-slate-900 transition-colors focus:outline-none"
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                            {isMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Dropdown */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-b border-slate-100 px-6 py-8 space-y-6 shadow-2xl animate-fade-in">
                    <Link to="/" className="block text-sm font-black uppercase tracking-widest text-slate-800" onClick={() => setIsMenuOpen(false)}>Home</Link>
                    <Link to="/about" className="block text-sm font-black uppercase tracking-widest text-slate-800" onClick={() => setIsMenuOpen(false)}>About</Link>
                    <Link to="/contact" className="block text-sm font-black uppercase tracking-widest text-slate-800" onClick={() => setIsMenuOpen(false)}>Contact</Link>
                    <div className="pt-6 flex flex-col gap-4">
                        <Link to="/login" className="text-center py-3 text-xs font-black uppercase tracking-[0.2em] text-slate-500" onClick={() => setIsMenuOpen(false)}>Login</Link>
                        <Link to="/dashboard" className="text-center py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-[0.25em]" onClick={() => setIsMenuOpen(false)}>
                            Launch Bot
                        </Link>
                    </div>
                </div>
            )}
        </header>
    )
}

export default Header
