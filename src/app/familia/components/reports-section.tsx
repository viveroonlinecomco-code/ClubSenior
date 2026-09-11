'use client';

import { useState } from 'react';

interface ReportData {
  id: string;
  semana_inicio: string;
  semana_fin: string;
  observaciones?: string;
  resumen?: string;
  actividades_realizadas?: number;
  asistencias?: number;
  calificacion_general?: number;
}

interface ReportsSectionProps {
  reportes?: ReportData[] | null;
}

export default function ReportsSection({ reportes }: ReportsSectionProps) {
  const [expandedReport, setExpandedReport] = useState<string | null>(null);

  if (!reportes || reportes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-600">No hay reportes disponibles aún</p>
      </div>
    );
  }

  const formatDate = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reportes Semanales</h1>
        <p className="text-gray-600">
          Seguimiento del bienestar y participación en actividades
        </p>
      </div>

      {reportes.map(report => (
        <div
          key={report.id}
          className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 hover:shadow-lg transition"
        >
          <button
            onClick={() => setExpandedReport(expandedReport === report.id ? null : report.id)}
            className="w-full px-6 py-4 flex justify-between items-start hover:bg-gray-50 transition text-left"
          >
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg">
                Semana de {formatDate(report.semana_inicio)} a {formatDate(report.semana_fin)}
              </h3>
              <p className="text-gray-600 text-sm mt-1">{report.resumen || report.observaciones || 'Sin descripción'}</p>

              {report.asistencias && (
                <div className="flex gap-4 mt-3 text-sm">
                  <div>
                    <span className="font-semibold text-gray-900">{report.asistencias}</span>
                    <span className="text-gray-600 ml-1">asistencias</span>
                  </div>
                  {report.calificacion_general && (
                    <div>
                      <span className="font-semibold text-yellow-600">
                        ★ {report.calificacion_general}/5
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="text-2xl">
              {expandedReport === report.id ? '▼' : '▶'}
            </div>
          </button>

          {expandedReport === report.id && (
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
              <div className="space-y-4">
                {report.actividades_realizadas && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Actividades Realizadas</h4>
                    <p className="text-gray-600 text-sm">{report.actividades_realizadas} actividades</p>
                  </div>
                )}

                {report.observaciones && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Observaciones</h4>
                    <p className="text-gray-600 text-sm">{report.observaciones}</p>
                  </div>
                )}

                <div className="bg-green-50 border border-green-200 rounded p-3 mt-4">
                  <p className="text-green-800 text-sm">
                    Para más detalles, contacta con el facilitador de ClubSenior
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
