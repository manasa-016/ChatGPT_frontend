import React from 'react'

const Footer = () => {
  return (
    <footer className="py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Decorative Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

      <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
        <div className="flex items-center justify-center gap-2 mb-8 group cursor-default">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg group-hover:rotate-[15deg] transition-transform">
            <span className="text-white font-black">L</span>
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase italic">LUMINA AI</span>
        </div>

        <nav className="flex flex-wrap justify-center gap-8 mb-12 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
          <a href="#" className="hover:text-white transition-colors">Privacy Paradigm</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Interaction</a>
          <a href="#" className="hover:text-white transition-colors">Neural Safety</a>
          <a href="#" className="hover:text-white transition-colors">Company Nexus</a>
        </nav>

        <div className="w-16 h-px bg-slate-800 mx-auto mb-10"></div>

        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">
          © 2026 Lumina Intelligent Systems. Crafted for Excellence.
        </p>
      </div>
    </footer>
  )
}

export default Footer
