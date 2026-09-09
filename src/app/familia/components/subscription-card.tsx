'use client';

import { useState } from 'react';

export default function SubscriptionCard() {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const subscription = {
    id: 'sub_001',
    plan: 'individual',
    nombrePlan: 'Plan Individual',
    precio: 160000,
    estado: 'activa',
    fechaInicio: '2026-09-01',
    proximaFactura: '2026-10-01',
    diasRestantes: 22,
    renovacionAutomatica: true,
  };

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(valor);
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleCancel = async () => {
    if (!cancelReason) {
      alert('Por favor selecciona una razón para cancelar');
      return;
    }

    console.log('Cancelando suscripción:', { id: subscription.id, reason: cancelReason });
    alert('Suscripción cancelada. Te despedimos pronto.');
    setShowCancelModal(false);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm font-semibold mb-1">SUSCRIPCIÓN ACTIVA</p>
              <h2 className="text-3xl font-bold">{subscription.nombrePlan}</h2>
            </div>
            <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-semibold">
              ✓ Activa
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="border-b border-gray-200 pb-6">
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-bold text-gray-900">
                {formatearMoneda(subscription.precio)}
              </span>
              <span className="text-gray-600">/mes</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-gray-600 text-sm font-semibold mb-1">FECHA DE INICIO</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatearFecha(subscription.fechaInicio)}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-semibold mb-1">PRÓXIMA FACTURA</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatearFecha(subscription.proximaFactura)}
              </p>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-700 font-semibold">Período actual</span>
              <span className="text-blue-600 font-bold">{subscription.diasRestantes} días</span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${((30 - subscription.diasRestantes) / 30) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200 flex items-start gap-3">
            <span className="text-green-600 text-2xl">✓</span>
            <div>
              <p className="font-semibold text-gray-900">Renovación Automática Activa</p>
              <p className="text-gray-600 text-sm">
                Tu suscripción se renovará automáticamente el {formatearFecha(subscription.proximaFactura)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 flex gap-4">
          <button className="flex-1 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition">
            Cambiar Plan
          </button>
          <button
            onClick={() => setShowCancelModal(true)}
            className="flex-1 px-6 py-2 border-2 border-red-600 text-red-600 hover:bg-red-50 font-semibold rounded-lg transition"
          >
            Cancelar Suscripción
          </button>
        </div>
      </div>

      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Cancelar Suscripción</h3>
            <p className="text-gray-600 mb-6">
              Sentiremos que te vayas. ¿Hay algo en lo que podamos mejorar?
            </p>

            <select
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 mb-6"
            >
              <option value="">Selecciona una razón...</option>
              <option value="expensive">Es muy caro</option>
              <option value="not_using">No lo estoy usando</option>
              <option value="found_alternative">Encontré una alternativa</option>
              <option value="technical_issues">Problemas técnicos</option>
              <option value="other">Otra razón</option>
            </select>

            <div className="flex gap-4">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
              >
                Mantener Suscripción
              </button>
              <button
                onClick={handleCancel}
                disabled={!cancelReason}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
              >
                Cancelar Ahora
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
