'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function VerificarOtpPage() {
  const router = useRouter();
  const { verifyOtp, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Obtener email de sessionStorage
  useEffect(() => {
    const storedEmail = sessionStorage.getItem('pendingEmail');
    if (!storedEmail) {
      router.push('/inscribir');
      return;
    }
    setEmail(storedEmail);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (!token || token.length < 6) {
      setErrors({ token: 'Código debe tener al menos 6 dígitos' });
      setLoading(false);
      return;
    }

    try {
      const result = await verifyOtp(email, token);
      
      if (result.error) {
        setErrors({ token: result.error.message || 'Código inválido' });
      } else {
        // Verify successful - check if this is inscribir flow or signin flow
        const inscribirData = sessionStorage.getItem('inscribirData');
        
        if (inscribirData) {
          // FLOW 1: Full registration from /inscribir
          const data = JSON.parse(inscribirData);
          
          // Call API to create profile and participante
          const profileResponse = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });

          console.log('[VERIFY-OTP] Register response status:', profileResponse.status);

          if (!profileResponse.ok) {
            const errorData = await profileResponse.json();
            console.error('[VERIFY-OTP] Register failed:', errorData);
            setErrors({ token: `Error: ${errorData.error || 'Unknown error'}` });
            setLoading(false);
            return;
          }

          // Get token from response
          const responseData = await profileResponse.json();
          console.log('[VERIFY-OTP] Register success response:', responseData);
          
          if (responseData.token) {
            localStorage.setItem('auth_token', responseData.token);
            localStorage.setItem('auth_email', responseData.email);
            console.log('[VERIFY-OTP] Token saved to localStorage');
          } else {
            console.warn('[VERIFY-OTP] No token in response!');
          }
        } else {
          // FLOW 2: Simple signin without inscribir data
          console.log('[VERIFY-OTP] Simple signin flow - creating basic user');
          
          const signinResponse = await fetch('/api/auth/signin-register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          });

          if (!signinResponse.ok) {
            const errorData = await signinResponse.json();
            console.error('[VERIFY-OTP] Signin register failed:', errorData);
            setErrors({ token: `Error: ${errorData.error || 'Unknown error'}` });
            setLoading(false);
            return;
          }

          const signinData = await signinResponse.json();
          console.log('[VERIFY-OTP] Signin register success:', signinData);

          if (signinData.token) {
            localStorage.setItem('auth_token', signinData.token);
            localStorage.setItem('auth_email', signinData.email);
            console.log('[VERIFY-OTP] Signin token saved to localStorage');
          }
        }

        setSuccessMessage('✅ Correo verificado! Redirigiendo...');
        sessionStorage.removeItem('pendingEmail');
        sessionStorage.removeItem('inscribirData');
        setTimeout(() => {
          router.push('/familia');
        }, 2000);
      }
    } catch (error: any) {
      setErrors({ token: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 text-center">Verificar Email</h1>
          <p className="text-gray-600 text-center">
            Hemos enviado un código a <strong>{email}</strong>
          </p>

          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Código de Verificación</label>
              <input
                type="text"
                value={token}
                onChange={e => setToken(e.target.value.toUpperCase())}
                placeholder="000000"
                maxLength={6}
                className={`w-full px-4 py-2 text-center text-2xl tracking-widest border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                  errors.token ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.token && (
                <p className="text-red-500 text-sm mt-1">{errors.token}</p>
              )}
            </div>

            <p className="text-sm text-gray-600 text-center">
              Revisa tu email por el código de 6 dígitos. Puede tomar unos segundos en llegar.
            </p>

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full bg-blue-500 hover:bg-blue-600 transition:bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Verificando...' : 'Verificar Código'}
            </button>
          </form>

          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                sessionStorage.removeItem('pendingEmail');
                router.push('/inscribir');
              }}
              className="w-full text-gray-600 hover:text-gray-900 font-semibold py-2"
            >
              Volver al Registro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
