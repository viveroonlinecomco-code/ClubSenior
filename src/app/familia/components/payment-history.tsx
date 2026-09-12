'use client';

import { useState } from 'react';

interface PaymentData {
  id: string;
  monto_cop: number;
  estado: string;
  created_at: string;
}

interface PaymentHistoryProps {
  pagos?: PaymentData[] | null;
}

export default function PaymentHistory({ pagos }: PaymentHistoryProps) {
  const [expandedPayment, setExpandedPayment] = useState<string | null>(null);

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(valor);
  };

  const formatDate = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'APPROVED':
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!pagos || pagos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-600">No hay pagos registrados</p>
      </div>
    );
  }

  const totalPagado = pagos
    .filter(p => p.estado === 'APPROVED' || p.estado === 'approved')
    .reduce((sum, p) => sum + p.monto_cop, 0);

  const proximoPago = pagos[0];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm font-semibold mb-2">TOTAL PAGADO</div>
          <p className="text-3xl font-bold text-blue-600">
            {formatearMoneda(totalPagado)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm font-semibold mb-2">NÚMERO DE PAGOS</div>
          <p className="text-3xl font-bold text-blue-600">{pagos.length}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm font-semibold mb-2">PRÓXIMO PAGO</div>
          <p className="text-lg font-bold text-gray-900">
            {proximoPago ? formatearMoneda(proximoPago.monto_cop) : 'N/A'}
          </p>
          <p className="text-gray-600 text-xs mt-1">
            {proximoPago ? formatDate(proximoPago.created_at) : '-'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Historial de Pagos</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {pagos.map(pago => (
            <div
              key={pago.id}
              className="p-6 hover:bg-gray-50 transition cursor-pointer"
              onClick={() => setExpandedPayment(expandedPayment === pago.id ? null : pago.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-gray-900">
                    {formatearMoneda(pago.monto_cop)}
                  </p>
                  <p className="text-gray-600 text-sm">{formatDate(pago.created_at)}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                    pago.estado
                  )}`}
                >
                  {pago.estado === 'APPROVED' || pago.estado === 'approved'
                    ? '✓ Aprobado'
                    : pago.estado === 'PENDING' || pago.estado === 'pending'
                      ? '⏳ Pendiente'
                      : '✗ Fallido'}
                </span>
              </div>

              {expandedPayment === pago.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
                  <div className="space-y-2">
                    <div>
                      <span className="font-semibold text-gray-900">ID de Pago:</span> {pago.id}
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">Estado:</span> {pago.estado}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
