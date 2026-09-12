'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

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
  },
];

export default function PlanesPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

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

      // Suscripción creada exitosamente
      alert(`✅ Suscripción creada correctamente. Redirigiendo al dashboard...`);
      router.push('/familia');
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
          <p className="text-blue-100 text-lg">
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
                plan.recomendado ? 'ring-2 ring-blue-600 bg-white' : 'bg-white'
              }`}
            >
              {plan.recomendado && (
                <div className="bg-blue-600 text-white text-center py-2 text-sm font-bold">
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
                      <span className="text-blue-600 font-bold">✓</span>
                      <span className="text-gray-700">{feature.substring(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Botón */}
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={loading && selectedPlan === plan.id}
                  className={`w-full py-3 rounded-lg font-bold text-white transition ${
                    plan.recomendado
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-600 hover:bg-gray-700'
                  } ${loading && selectedPlan === plan.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading && selectedPlan === plan.id ? 'Procesando...' : 'Seleccionar Plan'}
                </button>
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
            <li>📧 soporte@clubsenior.co</li>
            <li>📞 +57 1 8000 000</li>
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
