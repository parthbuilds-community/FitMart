import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/apiClient';

export default function DevAdminLogin() {
  const navigate = useNavigate();
  const defaultEmail = import.meta.env.VITE_DEV_ADMIN_EMAIL || '';
  const [email, setEmail] = useState(defaultEmail);
  const [error, setError] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    try {
      const data = await apiFetch('/api/dev/login', {
        method: 'POST',
        body: { email },
      });

      // Store dev token for local requests
      localStorage.setItem('dev_token', data.token);
      // optional flag for UI
      localStorage.setItem('dev_admin', 'true');
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Dev login failed');
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Local Dev Admin Login</h2>
      <p style={{ maxWidth: 600 }}>
        This page only appears in development. It lets you sign in locally as the
        development admin configured by the server (DEV_ADMIN_EMAIL).
      </p>
      <form onSubmit={handleLogin}>
        <label>
          Admin email
          <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ marginLeft: 8 }} />
        </label>
        <div style={{ marginTop: 12 }}>
          <button type="submit">Login as Dev Admin</button>
        </div>
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      </form>
    </div>
  );
}
