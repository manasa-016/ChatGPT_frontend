import React, { useState } from 'react';

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Simple validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: formData.fullName, // Adjust keys to match your backend
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Signup Successful!");
      } else {
        setError(data.detail || "Signup failed");
      }
    } catch (err) {
      setError("Cannot connect to server. Check if backend is running on port 8000.");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.iconBox}>🔒</div>
      <h2 style={styles.headerText}>Create your new account</h2>

      <div style={styles.card}>
        {error && <p style={{ color: 'red', fontSize: '12px', textAlign: 'center' }}>{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full name</label>
            <input 
              style={styles.input} 
              name="fullName" 
              type="text"
              placeholder="John Doe" 
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email address</label>
            <input 
              style={styles.input} 
              name="email" 
              type="email"
              placeholder="you@example.com" 
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <input 
              style={styles.input} 
              name="password" 
              type="password"
              placeholder="Password" 
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <input 
              style={styles.input} 
              name="confirmPassword" 
              type="password"
              placeholder="Confirm password" 
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" style={styles.signUpBtn}>Sign up</button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerLine}></span>
          <span style={styles.dividerText}>Or continue with</span>
          <span style={styles.dividerLine}></span>
        </div>

        <div style={styles.socialGroup}>
          <button type="button" style={styles.socialBtn}>Google</button>
          <button type="button" style={styles.socialBtn}>GitHub</button>
        </div>
      </div>

      <p style={styles.footerText}>
        Already have an account? <a href="/login" style={styles.link}>Log in</a>
      </p>
    </div>
  );
};

// Styles remain the same as previous (omitted for brevity)
const styles = {
  page: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#F9FAFB', fontFamily: 'Inter, system-ui, sans-serif' },
  iconBox: { width: '48px', height: '48px', backgroundColor: '#5850EC', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', color: 'white', fontSize: '20px' },
  headerText: { fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '24px' },
  card: { backgroundColor: '#ffffff', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', width: '100%', maxWidth: '380px' },
  inputGroup: { marginBottom: '12px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' },
  input: { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px', boxSizing: 'border-box' },
  signUpBtn: { width: '100%', padding: '12px', backgroundColor: '#5850EC', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', marginTop: '10px' },
  divider: { display: 'flex', alignItems: 'center', margin: '20px 0' },
  dividerLine: { flex: 1, height: '1px', backgroundColor: '#E5E7EB' },
  dividerText: { margin: '0 10px', fontSize: '12px', color: '#6B7280' },
  socialGroup: { display: 'flex', gap: '12px' },
  socialBtn: { flex: 1, padding: '10px', border: '1px solid #D1D5DB', borderRadius: '8px', backgroundColor: 'white', cursor: 'pointer', fontSize: '14px' },
  footerText: { marginTop: '20px', color: '#6B7280', fontSize: '14px' },
  link: { color: '#5850EC', textDecoration: 'none', fontWeight: '600' }
};

export default Signup;