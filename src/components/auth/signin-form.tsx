'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export function SignInForm() {
  const [email, setEmail] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { sendOTP, verifyOTP } = useAuth();
  const router = useRouter();

  // Step 1: Send OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await sendOTP(email);

      if (result.success) {
        setStep('otp');
      } else {
        setError(result.error || 'Error sending OTP');
      }
    } catch {
      setError('Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await verifyOTP(email, otpToken);

      if (result.success) {
        // Redirect to onboarding
        router.push('/inscribir');
      } else {
        setError(result.error || 'Error verifying OTP');
      }
    } catch {
      setError('Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Step 1: Email */}
      {step === 'email' && (
        <form onSubmit={handleSendOTP} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@ejemplo.com"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              required
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-2">
              Recibirás un código OTP por email
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || !email}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 font-semibold"
          >
            {loading ? 'Enviando...' : 'Enviar código'}
          </Button>
        </form>
      )}

      {/* Step 2: OTP */}
      {step === 'otp' && (
        <form onSubmit={handleVerifyOTP} className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              Hemos enviado un código de 6 dígitos a <br />
              <strong>{email}</strong>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código OTP
            </label>
            <input
              type="text"
              value={otpToken}
              onChange={(e) => setOtpToken(e.target.value.toUpperCase())}
              placeholder="000000"
              maxLength={6}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-mono text-2xl text-center tracking-widest"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || otpToken.length !== 6}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 font-semibold"
          >
            {loading ? 'Verificando...' : 'Verificar código'}
          </Button>

          <button
            type="button"
            onClick={() => {
              setStep('email');
              setOtpToken('');
              setError(null);
            }}
            className="w-full text-blue-600 hover:text-blue-700 font-medium text-sm py-2"
          >
            Usar otro email
          </button>
        </form>
      )}

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-600">
          ¿No tienes cuenta?{' '}
          <a href="/inscribir" className="text-blue-600 hover:text-blue-700 font-medium">
            Regístrate aquí
          </a>
        </p>
      </div>
    </div>
  );
}
