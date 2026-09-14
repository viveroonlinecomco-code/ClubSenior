'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

const planes = [
  {
    id: 1,
    nombre: 'Plan Mensual - 4 Sesiones',
    precio: 150000,
    descripcion: '4 sesiones de 2 horas cada una. Válido por 6 semanas. Si faltas, sin problema - tienes tiempo extra para usar tus sesiones.',
    caracteristicas: [
      '✓ 4 sesiones de 2 horas',
      '✓ Válido por 6 semanas',
      '✓ Sin penalizaciones por faltas',
      '✓ Acceso a facilitador especializado',
      '✓ Cafe incluidos',
    ],
    recomendado: true,
    slug: 'mensual',
  },
  {
    id: 2,
    nombre: 'Pago por Sesión',
    precio: 40000,
    descripcion: 'Paga solo por lo que usas. $40,000 por sesión de 2 horas. Sin compromisos ni contratos.',
    caracteristicas: [
      '✓ $40,000 por sesión de 2 horas',
      '✓ Sin contratos',
      '✓ Flexibilidad total',
      '✓ Acceso a facilitador especializado',
      '✓ Cafe incluido',
    ],
    recomendado: false,
    slug: 'sesion',
  },
];

export default function PlanesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ FIX #1: Detectar plan desde URL (?plan=mensual o ?plan=sesion)
  useEffect(() => {
    const planParam = searchParams.get('plan');
    if (planParam) {
      const plan = planes.find(p => p.slug === planParam);
      if (plan) {
        setSelectedPlan(plan.id);
      }
    }
  }, [searchParams]);

  const handleSelectPlan = async (planId: number) => {
    setSelectedPlan(planId);
    setLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      const email = localStorage.getItem('auth_email');

      if (!token || !email) {
        alert('Necesitas estar autenticado para crear una suscripción');
        router.push('/signin');
        return;
      }

      const response = await fetch('/api/suscripcion/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          email,
          plan_id: planId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Error: ${data.error || 'No se pudo crear la suscripción'}`);
        setLoading(false);
        return;
      }

      // ✅ FIX #2: Redirigir a flujo de PAGO, no a dashboard
      const selectedPlanSlug = planes.find(p => p.id === planId)?.slug || 'mensual';
      router.push(`/pagar?plan=${selectedPlanSlug}`);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Elige tu Plan</h1>
          <p className="text-blue-200 text-lg">
            Tardes de Café, Mente & Saberes - Conectando generaciones
          </p>
        </div>
      </div>

      {/* Planes */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {planes.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-lg shadow-lg overflow-hidden transition transform hover:scale-105 ${
                selectedPlan === plan.id
                  ? 'ring-4 ring-blue-500 scale-105'
                  : plan.recomendado
                  ? 'ring-2 ring-blue-600'
                  : ''
              } bg-white`}
            >
              {plan.recomendado && (
                <div className="bg-blue-500 hover:bg-blue-600 transition-colors text-white text-center py-2 text-sm font-bold">
                  ⭐ MÁS POPULAR
                </div>
              )}

              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{plan.nombre}</h2>
                <p className="text-gray-600 text-sm mb-6">{plan.descripcion}</p>

                {/* Precio */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-gray-900">
                      ${plan.precio.toLocaleString('es-CO')}
                    </span>
                    <span className="text-gray-600">
                      {plan.id === 1 ? '/mes' : '/sesión'}
                    </span>
                  </div>
                </div>

                {/* Características */}
                <div className="space-y-3 mb-8">
                  {plan.caracteristicas.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="text-blue-500 font-bold">✓</span>
                      <span className="text-gray-700">{feature.substring(2)}</span>
                    </div>
                  ))}
                </div>

                {/* ✅ FIX #3: Botón con color dinámico + visual feedback */}
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={loading && selectedPlan === plan.id}
                  className={`w-full py-3 rounded-lg font-bold text-white transition transform ${
                    selectedPlan === plan.id
                      ? 'bg-blue-600 hover:bg-blue-700 ring-2 ring-blue-400 scale-105'
                      : plan.recomendado
                      ? 'bg-blue-500 hover:bg-blue-600'
                      : 'bg-indigo-500 hover:bg-indigo-600'
                  } ${loading && selectedPlan === plan.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading && selectedPlan === plan.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Procesando...
                    </span>
                  ) : (
                    `${selectedPlan === plan.id ? '✓ ' : ''}Seleccionar Plan`
                  )}
                </button>

                {/* ✅ FIX #4: Indicador visual de selección */}
                {selectedPlan === plan.id && (
                  <div className="mt-3 text-center">
                    <span className="text-blue-600 font-semibold text-sm">✓ Plan seleccionado</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Info adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 mt-12">
          <h3 className="text-lg font-bold text-gray-900 mb-4">¿Preguntas?</h3>
          <p className="text-gray-700 mb-4">
            Si tienes dudas sobre cuál plan es mejor para ti, contáctanos:
          </p>
          <ul className="text-gray-700 space-y-2">
            <li>📧 info@clubsenior.com.co</li>
            <li>📞 <a href="https://wa.me/573002937403" className="text-blue-500 hover:underline">WhatsApp: 3002937403</a></li>
            <li>💬 Chat en vivo (Lun-Vie 9-18)</li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-100 border-t border-gray-300 py-8 px-4 mt-12">
        <div className="max-w-6xl mx-auto text-center text-gray-600 text-sm">
          <p>&copy; 2026 ClubSenior. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
}
