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
              className={`rounded-xl shadow-lg overflow-hidden transition-all duration-300 transform hover:shadow-2xl hover:scale-105 ${
                selectedPlan === plan.id
                  ? 'ring-4 ring-blue-500 scale-105'
                  : plan.recomendado
                  ? 'ring-2 ring-blue-300 hover:ring-blue-500'
                  : 'hover:ring-2 hover:ring-indigo-300'
              } bg-white`}
            >
              {plan.recomendado && (
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all text-white text-center py-3 text-sm font-bold animate-pulse">
                  ⭐ MÁS POPULAR
                </div>
              )}

              <div className="p-8 h-full flex flex-col">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition">{plan.nombre}</h2>
                <p className="text-gray-600 text-sm mb-6 flex-grow">{plan.descripcion}</p>

                {/* Precio con efecto hover */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-8 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-gray-900">
                      ${plan.precio.toLocaleString('es-CO')}
                    </span>
                    <span className="text-gray-600">
                      {plan.id === 1 ? '/mes' : '/sesión'}
                    </span>
                  </div>
                </div>

                {/* Características con animación */}
                <div className="space-y-3 mb-8">
                  {plan.caracteristicas.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 hover:translate-x-1 transition-transform">
                      <span className="text-blue-500 font-bold text-lg">✓</span>
                      <span className="text-gray-700">{feature.substring(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Botón con más feedback visual */}
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={loading && selectedPlan === plan.id}
                  className={`w-full py-3 rounded-lg font-bold text-white transition-all transform duration-200 ${
                    selectedPlan === plan.id
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 ring-2 ring-blue-400 scale-105'
                      : plan.recomendado
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg'
                      : 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 hover:shadow-lg'
                  } ${loading && selectedPlan === plan.id ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
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

                {/* Indicador visual mejorado */}
                {selectedPlan === plan.id && (
                  <div className="mt-3 text-center animate-pulse">
                    <span className="text-blue-600 font-semibold text-sm">✓ Plan seleccionado</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Info adicional - Mejorada */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-8 mt-12 hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-bold text-gray-900 mb-4">¿Preguntas sobre nuestros planes?</h3>
          <p className="text-gray-700 mb-6 text-lg">
            Estamos disponibles para ayudarte a elegir el mejor plan para ti.
          </p>
          <div className="flex flex-wrap gap-6 items-center">
            {/* Email */}
            <a
              href="mailto:info@clubsenior.com.co"
              className="flex items-center gap-3 bg-white px-6 py-3 rounded-lg hover:bg-blue-50 transition-all hover:shadow-md group"
            >
              <span className="text-2xl">📧</span>
              <div>
                <div className="text-xs text-gray-500">Email</div>
                <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition">
                  info@clubsenior.com.co
                </div>
              </div>
            </a>
            
            {/* WhatsApp con icono */}
            <a
              href="https://wa.me/573002937403?text=Hola%20ClubSenior%2C%20tengo%20preguntas%20sobre%20los%20planes"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white px-6 py-3 rounded-lg hover:bg-green-50 transition-all hover:shadow-md group"
            >
              <span className="text-2xl">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-green-500 group-hover:scale-110 transition-transform">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.869 1.171c-.384.202-.778.405-1.156.605C3.416 2.4.998.559.213 3.957 1.43 7.357 4.412 11.255 8.131 13.39c.78.413 1.542.798 2.271 1.146 1.265.665 2.672 1.184 4.177 1.184h.004c2.418 0 4.709-.768 6.632-2.228.732-.577 1.404-1.264 1.985-2.032.58-.768 1.077-1.621 1.368-2.529.29-.908.444-1.869.444-2.86 0-2.418-.768-4.709-2.228-6.632z"/>
                </svg>
              </span>
              <div>
                <div className="text-xs text-gray-500">WhatsApp</div>
                <div className="font-semibold text-gray-900 group-hover:text-green-600 transition">
                  3002937403
                </div>
              </div>
            </a>
          </div>
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
