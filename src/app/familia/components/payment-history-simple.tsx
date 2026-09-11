'use client';

import { useState, useEffect } from 'react';

interface Pago {
  id: string;
  suscripcion_id: string;
  monto_cop: number;
  estado: 'PENDING' | 'APPROVED' | 'FAILED';
  metodo_pago: string;
  referencia_wompi: string;
  created_at: string;
}

interface PaymentHistoryProps {
  pagos?: Pago[];
}

export function PaymentHistory({ pagos = [] }: PaymentHistoryProps) {
  const [loading, setLoading] = useState(!pagos || pagos.length === 0);
  const [paymentList, setPaymentList] = useState<Pago[]>(pagos);

  useEffect(() => {
    if (!pagos || pagos.length === 0) {
      loadPayments();
    }
  }, [pagos]);

  const loadPayments = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('/api/pagos/historial', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPaymentList(data.pagos || []);
      }
    } catch (err) {
      console.error('Error loading payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'APPROVED':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'FAILED':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'PENDING':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'APPROVED':
        return '✅ Aprobado';
      case 'FAILED':
        return '❌ Rechazado';
      case 'PENDING':
        return '⏳ Pendiente';
      default:
        return estado;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600">
        Cargando historial de pagos...
      </div>
    );
  }

  if (!paymentList || paymentList.length === 0) {
    return (
      <div className="p-6 text-center text-gray-600">
        No hay pagos registrados aún
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {paymentList.map((pago) => (
        <div
          key={pago.id}
          className={`border rounded-lg p-4 ${getStatusColor(pago.estado)}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-semibold text-lg">
                  ${pago.monto_cop.toLocaleString('es-CO')}
                </span>
                <span className="text-sm font-medium">
                  {getStatusBadge(pago.estado)}
                </span>
              </div>

              <p className="text-xs opacity-75 mb-1">
                Referencia: {pago.referencia_wompi}
              </p>

              <p className="text-xs opacity-75">
                {formatDate(pago.created_at)}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs font-medium opacity-75">
                {pago.metodo_pago}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
