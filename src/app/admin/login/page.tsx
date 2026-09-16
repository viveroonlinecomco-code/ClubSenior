'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('promesaobca@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al login');
      }

      const result = await response.json();

      // ✅ Guardar token en localStorage (para cliente)
      localStorage.setItem('admin_token', result.token);
      localStorage.setItem('admin_email', email);

      console.log('[LOGIN] ✅ Sesión iniciada:', email);

      // ✅ Redirigir a dashboard
      router.push('/admin/dashboard');
    } catch (err: any) {
      console.error('[LOGIN] Error:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          background: 'white',
          padding: '40px',
          borderRadius: '8px',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
        }}
      >
        <h1 style={{ marginBottom: '8px', textAlign: 'center', fontSize: '28px', fontWeight: '600' }}>
          🎯 Admin
        </h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '32px', fontSize: '14px' }}>
          ClubSenior Dashboard
        </p>

        {error && (
          <div
            style={{
              background: '#fee2e2',
              color: '#991b1b',
              padding: '12px',
              borderRadius: '4px',
              marginBottom: '16px',
              fontSize: '14px',
            }}
          >
            ❌ {error}
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              fontFamily: 'inherit',
            }}
            required
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              fontFamily: 'inherit',
            }}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: loading ? '#ccc' : '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s',
          }}
        >
          {loading ? '⏳ Ingresando...' : '🔓 Ingresar'}
        </button>

        <p style={{ textAlign: 'center', color: '#999', marginTop: '16px', fontSize: '12px' }}>
          v1.0 MVP - 16h Sprint
        </p>
      </form>
    </div>
  );
}
