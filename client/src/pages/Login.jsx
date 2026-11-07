import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplet, Lock, Phone } from 'lucide-react';
import { apiFetch } from '../utils/api';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/customer');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px', position: 'relative', overflow: 'hidden' }}>
      {/* Water Waves Animation */}
      <div className="wave-container">
        <div className="wave wave3"></div>
        <div className="wave wave2"></div>
        <div className="wave wave1"></div>
      </div>

      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '40px 30px', textAlign: 'center', zIndex: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div className="floating-icon" style={{ background: 'rgba(0, 200, 255, 0.1)', padding: '16px', borderRadius: '50%', border: '1px solid rgba(0, 200, 255, 0.3)', boxShadow: '0 0 30px rgba(0, 225, 255, 0.3)' }}>
            <Droplet size={36} color="#00e1ff" />
          </div>
        </div>
        <h2 style={{ marginBottom: '8px' }}>Welcome to <span className="text-gradient">Alakh Kirpa</span></h2>
        <h3 style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: '18px', color: 'var(--text-primary)', marginBottom: '8px' }}>Water Solutions</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '30px' }}>Log in to access your RO Service Dashboard</p>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--status-danger)', padding: '10px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '14px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '20px' }}>
            <label>Phone Number</label>
            <div style={{ position: 'relative' }}>
              <Phone size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Enter your phone number" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ paddingLeft: '40px' }}
                required 
              />
            </div>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                placeholder="Enter your password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '40px' }}
                required 
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={loading}>
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '24px', fontSize: '13px', color: 'var(--text-muted)' }}>
          <p>Don't have an account? Contact your service provider.</p>
        </div>
      </div>
    </div>
  );
}
