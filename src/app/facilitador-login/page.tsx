'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FacilitadorLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/facilitador/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error enviando OTP');
        return;
      }

      setSuccess('✅ Código enviado a tu email');
      setStep('otp');
      
      // Dev mode: mostrar código
      if (data.code) {
        console.log('DEV MODE - OTP Code:', data.code);
      }
    } catch (err: any) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // 1. Verificar OTP
      const verifyResponse = await fetch('/api/facilitador/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp }),
      });

      if (!verifyResponse.ok) {
        const data = await verifyResponse.json();
        setError(data.error || 'OTP inválido');
        return;
      }

      // 2. Generar token
      const registerResponse = await fetch('/api/facilitador/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const registerData = await registerResponse.json();

      if (!registerResponse.ok) {
        setError(registerData.error || 'Error en registro');
        return;
      }

      // 3. Guardar token y datos
      localStorage.setItem('facilitador_token', registerData.token);
      localStorage.setItem('facilitador_email', registerData.email);
      localStorage.setItem('facilitador_nombre', registerData.nombre);
      localStorage.setItem('facilitador_role', registerData.rol);
      localStorage.setItem('facilitador_condominio_id', registerData.condominio_id);

      setSuccess('✅ Login exitoso, redireccionando...');
      setTimeout(() => {
        router.push('/facilitador');
      }, 1500);
    } catch (err: any) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8">
            <h1 className="text-3xl font-bold mb-2">🎯 Facilitador</h1>
            <p className="text-purple-100">Panel de Control - Tardes de Café</p>
          </div>

          {/* Content */}
          <div className="p-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm">
                {success}
              </div>
            )}

            {step === 'email' ? (
              // Email Step
              <form onSubmit={handleSendOTP} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Facilitador
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="facilitador@ejemplo.com"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className={`w-full font-semibold py-3 rounded-lg text-white transition ${
                    loading || !email
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                  }`}
                >
                  {loading ? '⏳ Enviando...' : '📧 Enviar Código'}
                </button>

                <p className="text-center text-sm text-gray-600">
                  ¿No eres facilitador?{' '}
                  <a href="/inscribir" className="text-purple-600 hover:text-purple-700 font-semibold">
                    Acceso Familia
                  </a>
                </p>
              </form>
            ) : (
              // OTP Step
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Código de Verificación
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    required
                    autoComplete="off"
                    className="w-full px-4 py-3 text-2xl tracking-widest border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-center font-mono text-gray-900"
                  />
                  <p className="text-xs text-gray-600 mt-2">
                    Código enviado a: <strong>{email}</strong>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className={`w-full font-semibold py-3 rounded-lg text-white transition ${
                    loading || otp.length !== 6
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                  }`}
                >
                  {loading ? '⏳ Verificando...' : '✅ Verificar Código'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setOtp('');
                    setError('');
                  }}
                  className="w-full text-purple-600 hover:text-purple-700 font-semibold py-2"
                >
                  ← Volver
                </button>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
            <p className="text-xs text-gray-600 text-center">
              🔐 Tu acceso es seguro. Nunca compartimos tu información.
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-4 text-white text-sm">
          <p>
            <strong>💡 Tip:</strong> En modo desarrollo, el código aparece en la consola del navegador.
          </p>
        </div>
      </div>
    </div>
  );
}
