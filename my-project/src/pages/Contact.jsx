import React, { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // Simulate API call
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans overflow-x-hidden">
      <div className="max-w-4xl mx-auto pt-24 pb-16 px-4">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-block px-3 py-1 mb-6 text-xs font-bold tracking-[0.2em] text-indigo-600 uppercase bg-indigo-50 rounded-full">
            Get In Touch
          </div>
          <h1 className="text-4xl md:text-5xl font-light text-slate-900 mb-6 tracking-tight">Connect with Lumina</h1>
          <p className="text-slate-500 font-light max-w-lg mx-auto italic leading-relaxed">
            Whether you have a query, a collaborative idea, or simple curiosity, our team of specialists is ready to assist.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {/* Info Card */}
          <div className="md:col-span-1 space-y-8 animate-slide-up">
            <div>
              <h3 className="text-xs uppercase tracking-widest font-bold text-indigo-600 mb-2">Our Presence</h3>
              <p className="text-sm font-light leading-relaxed">Innovation Center, Tech District<br />Silicon Valley, CA 94025</p>
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-widest font-bold text-indigo-600 mb-2">Inquiries</h3>
              <p className="text-sm font-light">hello@lumina-ai.com</p>
              <p className="text-sm font-light">+1 (888) LUMINA-AI</p>
            </div>
          </div>

          {/* Form Card */}
          <div className="md:col-span-2 bg-white rounded-3xl p-8 shadow-xl border border-slate-100 animate-slide-up [animation-delay:0.2s]">
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-light mb-2">Message Received</h3>
                <p className="text-slate-500 text-sm">Thank you. Our team will reach out to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Identity</label>
                    <input
                      type="text"
                      placeholder="Your name"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-100 transition"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Digital Address</label>
                    <input
                      type="email"
                      placeholder="Your email"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-100 transition"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Inquiry</label>
                  <textarea
                    rows="4"
                    placeholder="How can we assist you?"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-100 transition resize-none"
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white font-semibold py-4 rounded-xl shadow-lg hover:bg-indigo-700 transition transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  Send Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;