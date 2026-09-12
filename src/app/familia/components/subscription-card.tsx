'use client';

import { useState } from 'react';

interface SubscriptionData {
  id: string;
  estado: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  plan_id: string;
  planes?: {
    nombre: string;
    descripcion: string;
    precio_cop: number;
    duracion_dias: number;
  };
  participantes?: {
    nombre: string;
    edad: number;
  };
}

interface SubscriptionCardProps {
  suscripcion?: SubscriptionData | null;
}

export default function SubscriptionCard({ suscripcion }: SubscriptionCardProps) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(valor);
  };

  const formatearFecha = (fecha: string | undefined) => {
    if (!fecha) return 'No definida';
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!suscripcion) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-600 mb-4">No hay suscripción activa</p>
        <a
          href="/planes"
          className="inline-block bg-blue-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg"
        >
          Crear Suscripción
        </a>
      </div>
    );
  }

  const plan = suscripcion.planes;
  const participante = suscripcion.participantes;
  const estadoBadgeColor =
    suscripcion.estado === 'ACTIVE'
      ? 'bg-green-100 text-green-800'
      : suscripcion.estado === 'PAYMENT_PENDING'
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-gray-100 text-gray-800';

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm font-semibold mb-1">SUSCRIPCIÓN</p>
              <h2 className="text-3xl font-bold">{plan?.nombre || 'Plan'}</h2>
              {participante && (
                <p className="text-blue-100 text-sm mt-2">{participante.nombre}, {participante.edad} años</p>
              )}
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${estadoBadgeColor}`}>
              {suscripcion.estado === 'ACTIVE' ? '✓ Activa' : suscripcion.estado}
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="border-b border-gray-200 pb-6">
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-bold text-gray-900">
                {plan ? formatearMoneda(plan.precio_cop) : 'N/A'}
              </span>
              <span className="text-gray-600">/mes</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-gray-600 text-sm font-semibold mb-1">FECHA DE INICIO</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatearFecha(suscripcion.fecha_inicio)}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-semibold mb-1">VENCIMIENTO</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatearFecha(suscripcion.fecha_fin)}
              </p>
            </div>
          </div>

          <div>
            <p className="text-gray-600 text-sm font-semibold mb-2">DESCRIPCIÓN DEL PLAN</p>
            <p className="text-gray-700">{plan?.descripcion || 'Sin descripción'}</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-sm">
              ✓ Renovación automática cada {plan?.duracion_dias || 30} días
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <a
              href="/planes"
              className="flex-1 bg-blue-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition text-center block"
            >
              Cambiar Plan
            </a>
            <button
              onClick={() => setShowCancelModal(true)}
              className="flex-1 border-2 border-red-600 text-red-600 hover:bg-red-50 font-semibold py-2 rounded-lg transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>

      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Cancelar Suscripción</h3>
            <p className="text-gray-600 mb-4">¿Por qué deseas cancelar tu suscripción?</p>

            <select
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 mb-6"
            >
              <option value="">Selecciona una razón</option>
              <option value="precio">Es muy caro</option>
              <option value="no-uso">No lo uso</option>
              <option value="cambio-planes">Quiero otro plan</option>
              <option value="tiempo">No tengo tiempo</option>
              <option value="otro">Otro motivo</option>
            </select>

            <div className="flex gap-4">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50"
              >
                Mantener Suscripción
              </button>
              <button
                onClick={async () => {
                  if (!cancelReason) {
                    alert('Por favor selecciona una razón');
                    return;
                  }

                  try {
                    const token = localStorage.getItem('auth_token');
                    const response = await fetch('/api/suscripcion/cancel', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                      },
                      body: JSON.stringify({
                        suscripcion_id: suscripcion.id,
                        razon: cancelReason,
                      }),
                    });

                    if (response.ok) {
                      alert('✅ Suscripción cancelada correctamente');
                      window.location.reload();
                    } else {
                      const error = await response.json();
                      alert(`Error: ${error.error}`);
                    }
                  } catch (error: any) {
                    alert(`Error: ${error.message}`);
                  }

                  setShowCancelModal(false);
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Confirmar Cancelación
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
