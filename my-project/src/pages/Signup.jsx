import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store user info and tokens then go to dashboard
        localStorage.setItem('userName', formData.fullName);
        localStorage.setItem('userEmail', formData.email);
        if (data.access_token) {
          localStorage.setItem('access_token', data.access_token);
          if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token);
          navigate('/dashboard');
        } else {
          // If signup doesn't return a token, auto-login
          try {
            const loginRes = await fetch('http://127.0.0.1:8000/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: formData.email, password: formData.password }),
            });
            if (loginRes.ok) {
              const loginData = await loginRes.json();
              localStorage.setItem('access_token', loginData.access_token);
              if (loginData.refresh_token) localStorage.setItem('refresh_token', loginData.refresh_token);
              navigate('/dashboard');
            } else {
              navigate('/login');
            }
          } catch {
            navigate('/login');
          }
        }
      } else {
        setError(data.detail || "Signup failed. Please try again.");
      }
    } catch (err) {
      setError("Cannot connect to server. Make sure your backend is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen dark-theme flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[420px] animate-gemini-entry">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black mb-4 shadow-xl shadow-indigo-900/30">
            L
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Create account</h1>
          <p className="text-sm text-gemini-text-muted mt-2 font-medium">Join the Lumina AI community</p>
        </div>

        {/* Form Card */}
        <div className="bg-[#1e1f20] p-8 rounded-[24px] border border-[#333537] shadow-2xl">
          {error && (
            <div className="mb-5 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gemini-text-muted uppercase tracking-widest pl-1">Full Name</label>
              <input
                name="fullName"
                type="text"
                placeholder="John Doe"
                className="w-full bg-[#131314] border border-[#333537] rounded-xl px-4 py-3 text-white placeholder-[#555] outline-none focus:border-indigo-500/50 transition-all font-medium"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gemini-text-muted uppercase tracking-widest pl-1">Email</label>
              <input
                name="email"
                type="email"
                placeholder="name@example.com"
                className="w-full bg-[#131314] border border-[#333537] rounded-xl px-4 py-3 text-white placeholder-[#555] outline-none focus:border-indigo-500/50 transition-all font-medium"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Passwords Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gemini-text-muted uppercase tracking-widest pl-1">Password</label>
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-[#131314] border border-[#333537] rounded-xl px-4 py-3 text-white placeholder-[#555] outline-none focus:border-indigo-500/50 transition-all font-medium"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gemini-text-muted uppercase tracking-widest pl-1">Confirm</label>
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-[#131314] border border-[#333537] rounded-xl px-4 py-3 text-white placeholder-[#555] outline-none focus:border-indigo-500/50 transition-all font-medium"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white rounded-full py-3.5 font-bold text-sm mt-2 hover:bg-indigo-500 active:scale-[0.98] transition-all shadow-lg shadow-indigo-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Sign up"}
            </button>
          </form>

          <p className="text-center text-sm text-gemini-text-muted mt-6 font-medium">
            Already have an account? <Link to="/login" className="text-indigo-400 font-bold hover:underline">Log in</Link>
          </p>
        </div>

        <p className="text-center text-[10px] text-[#444] mt-6 uppercase tracking-[0.2em] font-bold">
          By joining, you agree to our Terms and Data Policy.
        </p>
      </div>
    </div>
  );
};

export default Signup;