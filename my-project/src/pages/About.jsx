import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100">

      {/* ─── Hero Section ─── */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-indigo-50 to-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block px-4 py-1.5 mb-6 text-xs font-black tracking-[0.25em] text-indigo-600 uppercase bg-indigo-50 rounded-full border border-indigo-100">
            Lumina Intelligence
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-tight mb-8">
            Redefining the <br /> <span className="text-indigo-600 font-serif italic">Future of Thought</span>.
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
            We bridge the gap between complex artificial intelligence and intuitive human experience. Lumina is designed to be your most powerful digital ally.
          </p>
        </div>
      </section>

      {/* ─── Modern Card Grid ─── */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* Card 1: Vision */}
          <div className="p-10 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-8 text-2xl group-hover:rotate-12 transition-transform">🚀</div>
            <h3 className="text-2xl font-bold text-slate-800 mb-4 tracking-tight">Our Vision</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              To democratize access to world-class intelligence, enabling everyone to achieve their creative and technical peaks without friction.
            </p>
          </div>

          {/* Card 2: Technology */}
          <div className="p-10 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-8 text-2xl group-hover:rotate-12 transition-transform">🧩</div>
            <h3 className="text-2xl font-bold text-slate-800 mb-4 tracking-tight">Neural Core</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              Built on proprietary neural architectures that prioritize privacy, accuracy, and human-like contextual understanding above all else.
            </p>
          </div>

          {/* Card 3: Philosophy */}
          <div className="p-10 bg-slate-900 text-white rounded-[2.5rem] shadow-xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden lg:col-span-1 md:col-span-2 lg:md:col-span-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-8 text-2xl group-hover:scale-110 transition-transform relative z-10">✨</div>
            <h3 className="text-2xl font-bold mb-4 tracking-tight relative z-10">Pure Simplicity</h3>
            <p className="text-slate-400 font-medium leading-relaxed relative z-10">
              We believe true sophistication lies in the essence of simplicity. Our interface is invisible, so your focus remains on your results.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Global Impact Statistics ─── */}
      <section className="py-24 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <div>
            <div className="text-4xl font-black text-indigo-600 mb-2 tracking-tight">10M+</div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Total Queries</div>
          </div>
          <div>
            <div className="text-4xl font-black text-slate-800 mb-2 tracking-tight">150+</div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Languages</div>
          </div>
          <div>
            <div className="text-4xl font-black text-slate-800 mb-2 tracking-tight">99.8%</div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Satisfaction</div>
          </div>
          <div>
            <div className="text-4xl font-black text-indigo-600 mb-2 tracking-tight">24/7</div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Availability</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
