import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access_token);
        if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('userEmail', email);
        if (!localStorage.getItem('userName')) {
          localStorage.setItem('userName', email.split('@')[0]);
        }
        if (rememberMe) localStorage.setItem('rememberMe', 'true');
        navigate('/dashboard');
      } else {
        const data = await response.json();
        setError(data.detail || 'Invalid email or password');
      }
    } catch (err) {
      setError('Cannot connect to server. Make sure your backend is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen dark-theme flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[400px] animate-gemini-entry">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black mb-4 shadow-xl shadow-indigo-900/30">
            L
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Welcome back</h1>
          <p className="text-sm text-gemini-text-muted mt-2 font-medium">Log in to your Lumina AI account</p>
        </div>

        {/* Form Card */}
        <div className="bg-[#1e1f20] p-8 rounded-[24px] border border-[#333537] shadow-2xl">
          {error && (
            <div className="mb-5 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gemini-text-muted uppercase tracking-widest pl-1">Email</label>
              <input
                type="email"
                placeholder="name@example.com"
                className="w-full bg-[#131314] border border-[#333537] rounded-xl px-4 py-3 text-[#e3e3e3] placeholder-[#555] outline-none focus:border-indigo-500/50 transition-all font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gemini-text-muted uppercase tracking-widest pl-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-[#131314] border border-[#333537] rounded-xl px-4 py-3 text-[#e3e3e3] placeholder-[#555] outline-none focus:border-indigo-500/50 transition-all font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#333537] bg-[#131314] accent-indigo-600"
                />
                <span className="text-xs font-medium text-gemini-text-muted group-hover:text-white transition-colors">Remember me</span>
              </label>
              <button type="button" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white rounded-full py-3.5 font-bold text-sm hover:bg-indigo-500 active:scale-[0.98] transition-all shadow-lg shadow-indigo-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-center text-sm text-gemini-text-muted mt-6 font-medium">
            Don't have an account? <Link to="/signup" className="text-indigo-400 font-bold hover:underline">Sign up</Link>
          </p>
        </div>

        <p className="text-center text-[10px] text-[#444] mt-6 uppercase tracking-[0.2em] font-bold">
          Lumina AI • Terms • Privacy
        </p>
      </div>
    </div>
  );
};

export default Login;