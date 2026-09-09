'use client';

import { useState } from 'react';
import { z } from 'zod';

const Step3Schema = z.object({
  planSeleccionado: z.enum(['individual', 'condominio']),
});

interface Step3FormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
}

const PLANES = {
  individual: {
    nombre: 'Plan Individual',
    precio: 160000,
    descripcion: 'Perfecto para un adulto mayor',
    beneficios: [
      '1 Adulto Mayor',
      'Actividades semanales',
      'Reportes de bienestar',
      'Acceso a dashboard familiar',
      'Soporte por email',
    ],
  },
  condominio: {
    nombre: 'Plan Condominio',
    precio: 450000,
    descripcion: 'Para comunidades y condominios',
    beneficios: [
      'Hasta 50 Adultos Mayores',
      'Actividades diarias',
      'Reportes detallados',
      'Dashboard para administrador',
      'Soporte prioritario',
      'Capacitación de facilitadores',
    ],
  },
};

export default function Step3Form({ onSubmit, initialData }: Step3FormProps) {
  const [planSeleccionado, setPlanSeleccionado] = useState<'individual' | 'condominio'>(
    initialData?.planSeleccionado || 'individual'
  );
  const [loading, setLoading] = useState(false);
  const [mostrarPago, setMostrarPago] = useState(false);
  const [email, setEmail] = useState('');
  const [nombreTarjeta, setNombreTarjeta] = useState('');
  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [vencimiento, setVencimiento] = useState('');
  const [cvv, setCvv] = useState('');

  const planInfo = PLANES[planSeleccionado];

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(valor);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!email || !nombreTarjeta || !numeroTarjeta || !vencimiento || !cvv) {
        alert('Por favor completa todos los campos de pago');
        setLoading(false);
        return;
      }

      console.log('Procesando pago con Wompi...', {
        plan: planSeleccionado,
        monto: planInfo.precio,
        email,
      });

      await new Promise(resolve => setTimeout(resolve, 2000));
      onSubmit({ planSeleccionado });
    } catch (error) {
      console.error('Error en pago:', error);
      alert('Error al procesar el pago. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Selecciona tu Plan</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {(['individual', 'condominio'] as const).map(plan => (
          <div
            key={plan}
            onClick={() => setPlanSeleccionado(plan)}
            className={`p-6 rounded-lg border-2 cursor-pointer transition ${
              planSeleccionado === plan
                ? 'border-blue-600 bg-blue-50'
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
                  <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                )}
              </div>
            </div>

            <div className="text-3xl font-bold text-blue-600 mb-4">
              {formatearMoneda(PLANES[plan].precio)}
            </div>

            <ul className="space-y-2">
              {PLANES[plan].beneficios.map((beneficio, i) => (
                <li key={i} className="text-gray-600 text-sm flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
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

      <div className="bg-gray-50 p-6 rounded-lg border border-gray-300">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Plan:</span>
          <span className="font-semibold">{planInfo.nombre}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Valor mensual:</span>
          <span className="font-semibold">{formatearMoneda(planInfo.precio)}</span>
        </div>
        <div className="border-t border-gray-300 pt-4 mt-4">
          <div className="flex justify-between">
            <span className="text-lg font-bold text-gray-900">Total a pagar:</span>
            <span className="text-2xl font-bold text-blue-600">{formatearMoneda(planInfo.precio)}</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4">*Primer pago del mes. Se renovará automáticamente cada mes.</p>
      </div>

      {!mostrarPago ? (
        <button
          type="button"
          onClick={() => setMostrarPago(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
        >
          Proceder al Pago
        </button>
      ) : (
        <>
          <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-300 space-y-4">
            <h3 className="font-bold text-gray-900 mb-4">Información de Pago</h3>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Nombre en Tarjeta</label>
              <input
                type="text"
                value={nombreTarjeta}
                onChange={e => setNombreTarjeta(e.target.value)}
                placeholder="Juan García"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Número de Tarjeta</label>
              <input
                type="text"
                value={numeroTarjeta}
                onChange={e => setNumeroTarjeta(e.target.value.replace(/\D/g, '').slice(0, 16))}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Vencimiento</label>
                <input
                  type="text"
                  value={vencimiento}
                  onChange={e => setVencimiento(e.target.value)}
                  placeholder="MM/YY"
                  maxLength={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">CVV</label>
                <input
                  type="text"
                  value={cvv}
                  onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="123"
                  maxLength={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                  required
                />
              </div>
            </div>

            <div className="bg-yellow-50 p-3 rounded border border-yellow-200 text-yellow-800 text-sm">
              🔒 Esta es una demo. En producción usaremos Wompi para procesar pagos de forma segura.
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Procesando pago...' : `Pagar ${formatearMoneda(planInfo.precio)}`}
          </button>

          <button
            type="button"
            onClick={() => setMostrarPago(false)}
            className="w-full text-gray-600 hover:text-gray-900 font-semibold py-2"
          >
            Cancelar Pago
          </button>
        </>
      )}
    </form>
  );
}
