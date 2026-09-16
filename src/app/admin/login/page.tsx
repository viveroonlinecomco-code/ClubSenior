'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('promesaobca@gmail.com');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // STEP 1: Send OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al enviar código');
      }

      console.log('[ADMIN LOGIN] Código enviado a', email);
      setStep('otp');
      setCode('');
    } catch (err: any) {
      console.error('[ADMIN LOGIN] Error:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Código inválido');
      }

      const result = await response.json();

      // ✅ Guardar token en localStorage
      localStorage.setItem('admin_token', result.token);
      localStorage.setItem('admin_email', email);

      console.log('[ADMIN LOGIN] ✅ Sesión iniciada:', email);

      // ✅ Redirigir a dashboard
      router.push('/admin/dashboard');
    } catch (err: any) {
      console.error('[ADMIN LOGIN] Error:', err.message);
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
        onSubmit={step === 'email' ? handleSendOTP : handleVerifyOTP}
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
          Grupo Plateado Dashboard
        </p>

        {/* Progress indicator */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontSize: '12px' }}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: step === 'email' ? '#667eea' : '#ccc',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 4px',
              fontWeight: '600',
            }}>
              1
            </div>
            <span style={{ color: step === 'email' ? '#667eea' : '#999' }}>Email</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '2px', background: '#ccc' }} />
          </div>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: step === 'otp' ? '#667eea' : '#ccc',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 4px',
              fontWeight: '600',
            }}>
              2
            </div>
            <span style={{ color: step === 'otp' ? '#667eea' : '#999' }}>Código</span>
          </div>
        </div>

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

        {/* STEP 1: Email */}
        {step === 'email' && (
          <>
            <div style={{ marginBottom: '24px' }}>
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
              <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                Recibirás un código en tu email
              </p>
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
              {loading ? '⏳ Enviando...' : '📧 Enviar Código'}
            </button>
          </>
        )}

        {/* STEP 2: OTP */}
        {step === 'otp' && (
          <>
            <div style={{ marginBottom: '8px' }}>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
                Hemos enviado un código a <strong>{email}</strong>
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Código de Verificación
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="000000"
                maxLength={6}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '18px',
                  fontFamily: 'monospace',
                  textAlign: 'center',
                  letterSpacing: '4px',
                }}
                required
              />
              <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                Código válido por 10 minutos
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              style={{
                width: '100%',
                padding: '12px',
                background: loading || code.length !== 6 ? '#ccc' : '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontWeight: '600',
                cursor: loading || code.length !== 6 ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s',
              }}
            >
              {loading ? '⏳ Verificando...' : '🔓 Ingresar'}
            </button>

            <button
              type="button"
              onClick={() => setStep('email')}
              style={{
                width: '100%',
                marginTop: '12px',
                padding: '8px',
                background: 'transparent',
                color: '#667eea',
                border: '1px solid #667eea',
                borderRadius: '4px',
                fontWeight: '500',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Cambiar email
            </button>
          </>
        )}

        <p style={{ textAlign: 'center', color: '#999', marginTop: '24px', fontSize: '12px' }}>
          v1.0 MVP - 16h Sprint
        </p>
      </form>
    </div>
  );
}
