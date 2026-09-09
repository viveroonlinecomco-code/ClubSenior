'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingStep1 } from '@/components/onboarding/step1-form';
import { OnboardingStep2 } from '@/components/onboarding/step2-legal';
import { OnboardingStep3 } from '@/components/onboarding/step3-payment';
import { OnboardingStep1Input } from '@/schemas';

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [condominios, setCondominios] = useState<Array<{ id: string; nombre: string }>>([]);
  const router = useRouter();

  // Load condominios
  useEffect(() => {
    const loadCondominios = async () => {
      // In production, fetch from API
      setCondominios([
        { id: '123e4567-e89b-12d3-a456-426614174000', nombre: 'Condominio Cajicá Premium' },
        { id: '223e4567-e89b-12d3-a456-426614174000', nombre: 'Residencias Chía Executive' },
        { id: '323e4567-e89b-12d3-a456-426614174000', nombre: 'Conjunto Sabana Golf' },
      ]);
    };

    loadCondominios();
  }, []);

  const handleStep1 = async (data: OnboardingStep1Input) => {
    setLoading(true);
    setError(null);

    try {
      // Lazy import onboarding service only when needed
      const { createSubscriptionDraft } = await import('@/services/onboarding');

      // In production, use actual user ID from session
      const userId = crypto.randomUUID();

      // Create subscription draft
      const result = await createSubscriptionDraft(data, userId);

      if (!result.success) {
        setError(result.error || 'Error desconocido');
        return;
      }

      // Move to step 2
      setCurrentStep(2);
    } catch (err) {
      setError('Error procesando tus datos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = async () => {
    setLoading(true);
    setError(null);

    try {
      // In production, accept legal documents
      // For now, just move forward
      setCurrentStep(3);
    } catch (err) {
      setError('Error aceptando términos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStep3 = async (wompiReference: string) => {
    setLoading(true);
    setError(null);

    try {
      // In production, initiate payment through Wompi
      // For now, redirect to payment success
      router.push(`/inscribir/success?reference=${wompiReference}`);
    } catch (err) {
      setError('Error procesando pago');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      {/* Container */}
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Bienvenido a Tardes de Café
          </h1>
          <p className="text-gray-600">Paso {currentStep} de 3</p>
        </div>

        {/* Progress bar */}
        <div className="mb-8 flex gap-2">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`flex-1 h-2 rounded-full transition-all ${
                step <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Content card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {currentStep === 1 && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Cuéntanos sobre ti
              </h2>
              <OnboardingStep1
                onNext={handleStep1}
                loading={loading}
                error={error || undefined}
                condominios={condominios}
              />
            </>
          )}

          {currentStep === 2 && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Acepta nuestros términos
              </h2>
              <OnboardingStep2
                onNext={handleStep2}
                onBack={() => setCurrentStep(1)}
                loading={loading}
                error={error || undefined}
              />
            </>
          )}

          {currentStep === 3 && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Completa tu pago
              </h2>
              <OnboardingStep3
                onPaymentInitiated={handleStep3}
                onBack={() => setCurrentStep(2)}
                loading={loading}
                error={error || undefined}
              />
            </>
          )}
        </div>

        {/* Info footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            ¿Preguntas? Contáctanos en{' '}
            <a
              href="mailto:info@tardesdecafe.com"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              info@tardesdecafe.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
