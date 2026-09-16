'use client';

import { useState } from 'react';

interface Step3FormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
}

export default function Step3Form({ onSubmit, initialData }: Step3FormProps) {
  const [planSeleccionado, setPlanSeleccionado] = useState<'mensual' | 'sesion'>(
    initialData?.planSeleccionado || 'mensual'
  );
  const [loading, setLoading] = useState(false);

  const PLANES = {
    mensual: {
      nombre: 'Plan Mensual',
      precio: 150000,
      descripcion: '4 sesiones de 2 horas cada una',
    },
    sesion: {
      nombre: 'Plan Por Sesión',
      precio: 40000,
      descripcion: 'Paga solo por cada sesión',
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      onSubmit({ planSeleccionado });
    } catch (error) {
      console.error('Error:', error);
      alert('Error. Intenta nuevamente.');
      setLoading(false);
    }
  };

  const plan = PLANES[planSeleccionado];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Selecciona tu Plan</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Plan Mensual */}
        <div
          onClick={() => setPlanSeleccionado('mensual')}
          className={`p-6 rounded-lg border-2 cursor-pointer transition ${
            planSeleccionado === 'mensual'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Plan Mensual</h3>
              <p className="text-gray-600 text-sm">4 sesiones de 2 horas cada una</p>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 ${
              planSeleccionado === 'mensual' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
            }`}></div>
          </div>
          <p className="text-3xl font-bold text-blue-500 mb-4">$150.000</p>
        </div>

        {/* Plan Por Sesión */}
        <div
          onClick={() => setPlanSeleccionado('sesion')}
          className={`p-6 rounded-lg border-2 cursor-pointer transition ${
            planSeleccionado === 'sesion'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Plan Por Sesión</h3>
              <p className="text-gray-600 text-sm">Paga solo por cada sesión</p>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 ${
              planSeleccionado === 'sesion' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
            }`}></div>
          </div>
          <p className="text-3xl font-bold text-blue-500 mb-4">$40.000</p>
        </div>
      </div>

      {/* Resumen */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-300">
        <div className="flex justify-between mb-3">
          <span className="text-gray-600">Plan seleccionado:</span>
          <span className="font-semibold">{plan.nombre}</span>
        </div>
        <div className="border-t border-gray-300 pt-3 mt-3">
          <div className="flex justify-between">
            <span className="text-lg font-bold text-gray-900">Valor a pagar:</span>
            <span className="text-2xl font-bold text-blue-500">
              ${plan.precio.toLocaleString('es-CO')}
            </span>
          </div>
        </div>
      </div>

      {/* Seguridad */}
      <div className="bg-green-50 p-4 rounded border border-green-300 text-green-800 text-sm">
        <p className="font-semibold mb-2">🔒 Seguridad de Pago</p>
        <p>El pago es procesado de forma segura por Wompi. Serás redirigido a completar la transacción.</p>
      </div>

      {/* Botón */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
      >
        {loading ? 'Procesando...' : 'Completar Registro (Ir a Wompi)'}
      </button>
    </form>
  );
}
