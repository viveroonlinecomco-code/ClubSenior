'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

interface Plan {
  id: string;
  nombre: string;
  descripcion: string;
  precio_cop: number;
}

interface Suscripcion {
  id: string;
  plan_id: string;
  estado: string;
}

export default function PagarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [suscripcion, setSuscripcion] = useState<Suscripcion | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Check for payment status from redirect
  useEffect(() => {
    const paymentStatus = searchParams.get('payment_status');
    const reference = searchParams.get('reference');

    if (paymentStatus === 'success' && reference) {
      setSuccess(`✅ Pago procesado correctamente (Ref: ${reference}). Por favor espera a que se confirme...`);
      setTimeout(() => {
        window.location.href = '/familia';
      }, 3000);
    }
  }, [searchParams]);

  // Load subscription data
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          router.push('/inscribir');
          return;
        }

        // Get dashboard data
        const response = await fetch('/api/dashboard/data', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          setError('No se pudo cargar los datos');
          return;
        }

        const data = await response.json();
        setSuscripcion(data.suscripcion);

        // Get plan details if suscripcion exists
        if (data.suscripcion?.plan_id) {
          const planResponse = await fetch(
            `/api/dashboard/data?plan_id=${data.suscripcion.plan_id}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            }
          );

          // For now, we'll show basic info from suscripcion
          setPlan({
            id: data.suscripcion.plan_id,
            nombre: 'Plan Seleccionado',
            descripcion: '',
            precio_cop: 150000, // Default
          });
        }
      } catch (err: any) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const handleInitiatePayment = async () => {
    if (!suscripcion) {
      setError('No hay suscripción activa');
      return;
    }

    setProcessingPayment(true);
    setError('');

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/inscribir');
        return;
      }

      // Call create payment endpoint
      const response = await fetch('/api/pagos/crear', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          suscripcion_id: suscripcion.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(`Error: ${data.error}`);
        return;
      }

      const paymentData = await response.json();

      // Redirect to Wompi checkout
      if (paymentData.wompi_checkout_url) {
        window.location.href = paymentData.wompi_checkout_url;
      } else {
        setError('No se pudo generar el enlace de pago');
      }
    } catch (err: any) {
      setError(`Error: ${err.message}`);
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información de pago...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">💳 Procesar Pago</h1>
          <p className="text-blue-100">Completa el pago de tu suscripción a través de Wompi</p>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* Payment Card */}
        {suscripcion ? (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Resumen del Pago
              </h2>
              <p className="text-gray-600">
                Verifica los detalles antes de proceder
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-8 border-2 border-gray-200">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Plan</p>
                  <p className="text-lg font-bold text-gray-900">
                    {plan?.nombre || 'Plan Seleccionado'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Estado</p>
                  <p className="text-lg font-bold text-yellow-600">
                    {suscripcion.estado === 'PAYMENT_PENDING' ? '⏳ Pendiente' : suscripcion.estado}
                  </p>
                </div>
              </div>

              <div className="border-t-2 border-gray-300 pt-4">
                <div className="flex justify-between items-center">
                  <p className="text-gray-600 font-semibold">Monto a Pagar</p>
                  <p className="text-3xl font-bold text-blue-600">
                    ${(plan?.precio_cop || 150000).toLocaleString('es-CO')}
                  </p>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Información</h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Serás redirigido a Wompi para completar el pago</li>
                <li>Aceptamos tarjetas de crédito y débito</li>
                <li>El pago es seguro y encriptado</li>
                <li>Recibirás una confirmación por email</li>
              </ul>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleInitiatePayment}
                disabled={processingPayment}
                className={`flex-1 font-semibold py-3 rounded-lg text-white transition ${
                  processingPayment
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-green-700'
                }`}
              >
                {processingPayment ? 'Procesando...' : '💳 Ir a Pagar con Wompi'}
              </button>

              <button
                onClick={() => router.push('/planes')}
                disabled={processingPayment}
                className="flex-1 border-2 border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition"
              >
                Volver
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-gray-600 mb-6">
              No tienes una suscripción pendiente de pago.
            </p>
            <button
              onClick={() => router.push('/planes')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg"
            >
              Ver Planes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
