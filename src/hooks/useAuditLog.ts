/**
 * Hook para facilitar el registro de auditoría
 */

export function useAuditLog() {
  const logAction = async (
    accion: string,
    tabla_afectada: string,
    options?: {
      registro_id?: string;
      datos_previos?: any;
      datos_nuevos?: any;
      detalles?: string;
      resultado?: 'EXITOSO' | 'ERROR' | 'RECHAZADO';
    }
  ) => {
    try {
      const token = localStorage.getItem('facilitador_token');
      if (!token) return; // No log si no hay token

      const response = await fetch('/api/facilitador/audit/log', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accion,
          tabla_afectada,
          ...options,
        }),
      });

      if (!response.ok) {
        console.warn('[AUDIT-HOOK] Failed to log');
      }
    } catch (error) {
      console.error('[AUDIT-HOOK] Error:', error);
      // Silently fail - auditoría es complementaria
    }
  };

  return { logAction };
}
