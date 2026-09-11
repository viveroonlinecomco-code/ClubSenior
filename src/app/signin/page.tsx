'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');
    setDebugInfo('');
    setLoading(true);

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setErrors({ email: 'Email válido requerido' });
      setLoading(false);
      return;
    }

    try {
      setDebugInfo('📤 Enviando OTP...');
      
      // Enviar OTP directamente al endpoint
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setDebugInfo(`❌ Error: ${data.error || response.statusText}`);
        setErrors({ email: data.error || 'Error al enviar código' });
        setLoading(false);
        return;
      }

      // Guardar email en sessionStorage para verificación
      sessionStorage.setItem('pendingEmail', email);
      setSuccessMessage('✅ Código enviado a tu email!');
      setDebugInfo('✅ Redirigiendo en 2 segundos...');
      
      // Redirigir a verificación después de 2 segundos
      setTimeout(() => {
        router.push('/verificar-otp');
      }, 2000);
    } catch (error: any) {
      setDebugInfo(`❌ Exception: ${error.message}`);
      setErrors({ email: error.message || 'Error al enviar código' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bienvenido</h1>
          <p className="text-gray-600">ClubSenior - Tardes de Café, Mente & Saberes</p>
        </div>

        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
            {successMessage}
          </div>
        )}

        {debugInfo && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800 text-sm font-mono">
            {debugInfo}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              disabled={loading}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800 text-sm">
            📧 Recibirás un código de 6 dígitos en tu email. Úsalo para verificar tu identidad.
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Enviando código...' : 'Enviar Código'}
          </button>
        </form>

        <div className="border-t border-gray-300 pt-6">
          <p className="text-gray-600 text-center mb-3">¿Nuevo usuario?</p>
          <button
            onClick={() => router.push('/inscribir')}
            className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-2 rounded-lg transition"
          >
            Crear Cuenta
          </button>
        </div>
      </div>
    </div>
  );
}
