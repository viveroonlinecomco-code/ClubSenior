'use client';

import { useState } from 'react';
import { z } from 'zod';

const Step3Schema = z.object({
  planSeleccionado: z.enum(['mensual', 'sesion']),
});

interface Step3FormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
}

const PLANES = {
  mensual: {
    nombre: 'Plan Mensual',
    precio: 150000,
    descripcion: '4 sesiones de 2 horas cada una',
    beneficios: [
      '4 sesiones de 2 horas',
      'Válido por 6 semanas',
      'Sin penalizaciones por faltas',
      'Acceso a facilitador especializado',
      'Reportes de progreso',
      'Acceso a dashboard familiar',
    ],
  },
  sesion: {
    nombre: 'Plan Por Sesión',
    precio: 40000,
    descripcion: 'Paga solo por cada sesión',
    beneficios: [
      '1 sesión de 2 horas',
      'Sin compromiso de continuidad',
      'Máxima flexibilidad',
      'Acceso a facilitador especializado',
      'Ambiente seguro y acogedor',
      'Acceso a dashboard familiar',
    ],
  },
};

export default function Step3Form({ onSubmit, initialData }: Step3FormProps) {
  const [planSeleccionado, setPlanSeleccionado] = useState<'mensual' | 'sesion'>(
    initialData?.planSeleccionado || 'mensual'
  );
  const [loading, setLoading] = useState(false);

  const planInfo = PLANES[planSeleccionado];

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(valor);
  };

  // ✅ CRITICAL FIX: Solo enviar plan seleccionado
  // Wompi maneja el pago - NO solicitamos datos de tarjeta
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Completando registro con plan:', planSeleccionado);
      // Enviar solo el plan seleccionado
      // El pago será manejado por Wompi en el siguiente paso
      onSubmit({ planSeleccionado });
    } catch (error) {
      console.error('Error:', error);
      alert('Error. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Selecciona tu Plan</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {(['mensual', 'sesion'] as const).map(plan => (
          <div
            key={plan}
            onClick={() => setPlanSeleccionado(plan)}
            className={`p-6 rounded-lg border-2 cursor-pointer transition ${
              planSeleccionado === plan
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{PLANES[plan].nombre}</h3>
                <p className="text-gray-600 text-sm">{PLANES[plan].descripcion}</p>
              </div>
              <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
                {planSeleccionado === plan && (
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                )}
              </div>
            </div>

            <div className="text-3xl font-bold text-blue-500 mb-4">
              {formatearMoneda(PLANES[plan].precio)}
            </div>

            <ul className="space-y-2">
              {PLANES[plan].beneficios.map((beneficio, i) => (
                <li key={i} className="text-gray-600 text-sm flex items-start gap-2">
                  <span className="text-blue-500 font-bold">✓</span>
                  {beneficio}
                </li>
              ))}
            </ul>

            <div className="mt-4 pt-4 border-t border-gray-300">
              <p className="text-xs text-gray-500">Facturación mensual</p>
            </div>
          </div>
        ))}
      </div>

      {/* Resumen de pago */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-300">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Plan Seleccionado:</span>
          <span className="font-semibold">{planInfo.nombre}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Valor mensual:</span>
          <span className="font-semibold">{formatearMoneda(planInfo.precio)}</span>
        </div>
        <div className="border-t border-gray-300 pt-4 mt-4">
          <div className="flex justify-between">
            <span className="text-lg font-bold text-gray-900">Total a pagar:</span>
            <span className="text-2xl font-bold text-blue-500">{formatearMoneda(planInfo.precio)}</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          *Primer pago del mes. Se renovará automáticamente cada mes.
        </p>
      </div>

      {/* ✅ INFO: Wompi maneja el pago */}
      <div className="bg-green-50 p-4 rounded border border-green-300 text-green-800 text-sm">
        <p className="font-semibold mb-2">🔒 Seguridad de Pago</p>
        <p>
          El pago es procesado de forma segura por Wompi (proveedor oficial de pagos).
          Después de completar el registro, serás redirigido a Wompi para completar la transacción.
        </p>
      </div>

      {/* ✅ SOLO botón de completar - SIN pedir datos de tarjeta */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
      >
        {loading ? 'Procesando...' : 'Completar Registro (Paso a Wompi)'}
      </button>

      <button
        type="button"
        onClick={() => window.history.back()}
        className="w-full text-gray-600 hover:text-gray-900 font-semibold py-2"
      >
        ← Atrás
      </button>
    </form>
  );
}
