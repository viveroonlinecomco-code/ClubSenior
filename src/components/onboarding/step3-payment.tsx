'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { generateWompiCheckoutUrl } from '@/lib/wompi';

interface Step3Props {
  onPaymentInitiated: (wompiReference: string) => void;
  onBack: () => void;
  loading?: boolean;
  error?: string;
}

export function OnboardingStep3({
  onPaymentInitiated,
  onBack,
  loading,
  error,
}: Step3Props) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'quarterly'>('monthly');
  const [initiatingPayment, setInitiatingPayment] = useState(false);

  const plans = [
    {
      id: 'monthly',
      name: 'Mensual',
      price: 160000,
      duration: '4 sesiones',
      description: 'Plan flexible mes a mes',
    },
    {
      id: 'quarterly',
      name: 'Trimestral',
      price: 450000,
      duration: '12 sesiones',
      description: 'Ahorra 6% vs mensual',
    },
  ];

  const currentPlan = plans.find((p) => p.id === selectedPlan) || plans[0];

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setInitiatingPayment(true);

    try {
      const wompiReference = `pago_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const checkoutUrl = generateWompiCheckoutUrl(wompiReference, currentPlan.price * 100);

      onPaymentInitiated(wompiReference);

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } catch (err) {
      console.error('Error initiating payment:', err);
    } finally {
      setInitiatingPayment(false);
    }
  };

  return (
    <form onSubmit={handlePayment} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Elige tu plan</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {plans.map((plan) => (
            <label
              key={plan.id}
              className={`relative p-6 border-2 rounded-lg cursor-pointer transition-all ${
                selectedPlan === plan.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input
                type="radio"
                name="plan"
                value={plan.id}
                checked={selectedPlan === plan.id}
                onChange={(e) => setSelectedPlan(e.target.value as 'monthly' | 'quarterly')}
                className="sr-only"
                disabled={loading || initiatingPayment}
              />
              <div>
                <p className="font-semibold text-gray-900">{plan.name}</p>
                <p className="text-2xl font-bold text-blue-600 my-2">
                  ${plan.price.toLocaleString('es-CO')}
                </p>
                <p className="text-xs text-gray-500">{plan.duration}</p>
                <p className="text-xs text-gray-600 mt-2">{plan.description}</p>
              </div>
              {selectedPlan === plan.id && (
                <div className="absolute top-2 right-2 text-blue-600 font-bold">✓</div>
              )}
            </label>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-4">Resumen del pago</h4>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Plan:</span>
            <span className="font-medium text-gray-900">{currentPlan.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Duración:</span>
            <span className="font-medium text-gray-900">{currentPlan.duration}</span>
          </div>
          <div className="border-t border-gray-300 pt-3 flex justify-between">
            <span className="font-semibold text-gray-900">Total a pagar:</span>
            <span className="text-2xl font-bold text-blue-600">
              ${currentPlan.price.toLocaleString('es-CO')} COP
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4 leading-relaxed">
          Se procesará un pago seguro a través de Wompi. No guardamos tus datos de tarjeta.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>🔒 Pago seguro:</strong> Todos los pagos se procesan a través de Wompi,
          un procesador de pagos certificado en Colombia. No almacenamos tus datos bancarios.
        </p>
      </div>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={loading || initiatingPayment}
          className="flex-1 py-3"
        >
          Atrás
        </Button>
        <Button
          type="submit"
          disabled={loading || initiatingPayment}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 font-semibold"
        >
          {initiatingPayment ? 'Redirigiendo a Wompi...' : 'Proceder al pago'}
        </Button>
      </div>
    </form>
  );
}
