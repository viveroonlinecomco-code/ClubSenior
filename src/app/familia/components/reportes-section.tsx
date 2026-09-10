'use client';

import { useState } from 'react';

interface Reporte {
  id: string;
  participante_id: string;
  semana_inicio: string;
  semana_fin: string;
  contenido_sesion: string;
  comportamiento?: string;
  progreso?: string;
  recomendaciones?: string;
  calificacion: number;
  created_at: string;
}

export interface ReportesData {
  participante: string;
  participante_id: string;
  reportes: Reporte[];
}

interface ReportesSectionProps {
  reportes?: ReportesData[];
}

export default function ReportesSection({ reportes = [] }: ReportesSectionProps) {
  const [expandedReporte, setExpandedReporte] = useState<string | null>(null);

  const getCalificacionColor = (calificacion: number) => {
    if (calificacion >= 4) return 'text-green-600';
    if (calificacion >= 3) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getCalificacionStars = (calificacion: number) => {
    return '⭐'.repeat(Math.round(calificacion));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' });
  };

  if (!reportes || reportes.length === 0 || reportes.every(d => d.reportes.length === 0)) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-600">No hay reportes semanales disponibles aún</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reportes.map((grupo) =>
        grupo.reportes.length > 0 && (
          <div key={grupo.participante_id} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              📋 Reportes - {grupo.participante}
            </h3>

            <div className="space-y-3">
              {grupo.reportes.map((reporte) => (
                <div
                  key={reporte.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  {/* Header expandible */}
                  <button
                    onClick={() =>
                      setExpandedReporte(
                        expandedReporte === reporte.id ? null : reporte.id
                      )
                    }
                    className="w-full flex items-center justify-between text-left"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">
                          Semana {formatDate(reporte.semana_inicio)} a{' '}
                          {formatDate(reporte.semana_fin)}
                        </span>
                        <span
                          className={`font-bold ${getCalificacionColor(
                            reporte.calificacion
                          )}`}
                        >
                          {getCalificacionStars(reporte.calificacion)}
                        </span>
                      </div>
                      <p className="text-gray-700 font-semibold mt-1 line-clamp-2">
                        {reporte.contenido_sesion}
                      </p>
                    </div>

                    <div className="text-2xl">
                      {expandedReporte === reporte.id ? '▼' : '▶'}
                    </div>
                  </button>

                  {/* Contenido expandido */}
                  {expandedReporte === reporte.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm mb-2">
                          Contenido de la Sesión
                        </h4>
                        <p className="text-gray-700 text-sm">
                          {reporte.contenido_sesion}
                        </p>
                      </div>

                      {reporte.comportamiento && (
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm mb-2">
                            Comportamiento
                          </h4>
                          <p className="text-gray-700 text-sm">
                            {reporte.comportamiento}
                          </p>
                        </div>
                      )}

                      {reporte.progreso && (
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm mb-2">
                            Progreso
                          </h4>
                          <p className="text-gray-700 text-sm">
                            {reporte.progreso}
                          </p>
                        </div>
                      )}

                      {reporte.recomendaciones && (
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm mb-2">
                            Recomendaciones
                          </h4>
                          <p className="text-gray-700 text-sm">
                            {reporte.recomendaciones}
                          </p>
                        </div>
                      )}

                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm mb-2">
                          Calificación
                        </h4>
                        <div
                          className={`text-2xl font-bold ${getCalificacionColor(
                            reporte.calificacion
                          )}`}
                        >
                          {getCalificacionStars(reporte.calificacion)}{' '}
                          <span className="text-sm">({reporte.calificacion}/5)</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}
