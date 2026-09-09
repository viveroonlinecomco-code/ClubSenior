'use client';

import { useState } from 'react';

export default function PaymentHistory() {
  const [expandedPayment, setExpandedPayment] = useState<string | null>(null);

  const payments = [
    {
      id: 'pago_001',
      fecha: '2026-09-01',
      monto: 160000,
      plan: 'Plan Individual',
      estado: 'completado',
      metodo: 'Tarjeta de Crédito',
      ultimos4Digitos: '4242',
      recibo: 'RCP-2026-0901-001',
      proximaPago: '2026-10-01',
    },
    {
      id: 'pago_002',
      fecha: '2026-08-01',
      monto: 160000,
      plan: 'Plan Individual',
      estado: 'completado',
      metodo: 'Tarjeta de Crédito',
      ultimos4Digitos: '4242',
      recibo: 'RCP-2026-0801-001',
      proximaPago: '2026-09-01',
    },
  ];

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

  const totalPagado = payments.reduce((sum, p) => sum + p.monto, 0);

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Historial de Pagos</h1>
        <p className="text-gray-600">Administra y descarga tus recibos de suscripción</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
          <p className="text-gray-600 text-sm font-semibold mb-2">TOTAL PAGADO</p>
          <p className="text-3xl font-bold text-gray-900">{formatearMoneda(totalPagado)}</p>
          <p className="text-gray-500 text-xs mt-2">{payments.length} pagos realizados</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
          <p className="text-gray-600 text-sm font-semibold mb-2">PRÓXIMO PAGO</p>
          <p className="text-3xl font-bold text-gray-900">{formatearMoneda(160000)}</p>
          <p className="text-gray-500 text-xs mt-2">El {formatearFecha(payments[0].proximaPago)}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
          <p className="text-gray-600 text-sm font-semibold mb-2">ESTADO</p>
          <p className="text-2xl font-bold text-green-600">✓ Al día</p>
          <p className="text-gray-500 text-xs mt-2">Sin pagos pendientes</p>
        </div>
      </div>

      <div className="space-y-4">
        {payments.map(payment => (
          <div
            key={payment.id}
            className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-lg transition"
          >
            <button
              onClick={() => setExpandedPayment(expandedPayment === payment.id ? null : payment.id)}
              className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition text-left"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-xl">
                    💳
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{payment.plan}</p>
                    <p className="text-sm text-gray-600">
                      {formatearFecha(payment.fecha)} • Recibo: {payment.recibo}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-right mr-4">
                <p className="text-2xl font-bold text-gray-900">{formatearMoneda(payment.monto)}</p>
                <span
                  className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${
                    payment.estado === 'completado'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {payment.estado === 'completado' ? '✓ Completado' : '⏳ Pendiente'}
                </span>
              </div>

              <div className={`transform transition text-gray-600 text-xl ${expandedPayment === payment.id ? 'rotate-180' : ''}`}>
                ▼
              </div>
            </button>

            {expandedPayment === payment.id && (
              <div className="bg-gray-50 border-t border-gray-200 px-6 py-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm font-semibold mb-1">FECHA DE PAGO</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatearFecha(payment.fecha)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-semibold mb-1">MONTO</p>
                    <p className="text-lg font-semibold text-gray-900">{formatearMoneda(payment.monto)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-semibold mb-1">MÉTODO DE PAGO</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {payment.metodo} •••• {payment.ultimos4Digitos}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-semibold mb-1">PRÓXIMO PAGO</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatearFecha(payment.proximaPago)}
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-gray-300 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Suscripción mensual</span>
                    <span className="font-semibold text-gray-900">{formatearMoneda(payment.monto)}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-3 flex justify-between">
                    <span className="text-gray-900 font-bold">TOTAL</span>
                    <span className="text-lg font-bold text-blue-600">
                      {formatearMoneda(payment.monto)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition">
                    Descargar Recibo PDF
                  </button>
                  <button className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-2 px-4 rounded-lg transition">
                    Ver Detalles
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
        <p className="text-sm text-gray-700">
          <strong>📋 Nota:</strong> Tus recibos están disponibles para descargar. Se enviarán automáticamente
          a tu correo electrónico después de cada pago.
        </p>
      </div>
    </div>
  );
}
