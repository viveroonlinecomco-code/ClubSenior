'use client';

import { useState } from 'react';

export default function ReportsSection() {
  const [expandedReport, setExpandedReport] = useState<string | null>(null);

  const reports = [
    {
      id: 'report_001',
      semana: 'Semana del 2 - 8 de Septiembre',
      fecha: '2026-09-08',
      facilitador: 'María Rodríguez',
      titulo: 'Semana de integración exitosa',
      resumen: 'Excelente participación en todas las actividades. Juan mostró mucho entusiasmo.',
      detalles: {
        actividades: [
          { nombre: 'Yoga Terapéutico', asistencia: 'Presente', duracion: '60 min' },
          { nombre: 'Taller de Arte', asistencia: 'Presente', duracion: '90 min' },
          { nombre: 'Cine Club', asistencia: 'Presente', duracion: '120 min' },
        ],
        estadoEmocional: 'Muy alegre',
        novedades: 'Se integró bien con otros miembros del grupo',
        recomendaciones: 'Continuar fomentando la participación en actividades sociales',
      },
    },
    {
      id: 'report_002',
      semana: 'Semana del 26 de Agosto - 1 de Septiembre',
      fecha: '2026-09-01',
      facilitador: 'Carlos López',
      titulo: 'Primera semana adaptación',
      resumen: 'Juan se está adaptando bien a la rutina. Participa activamente en actividades.',
      detalles: {
        actividades: [
          { nombre: 'Yoga Terapéutico', asistencia: 'Presente', duracion: '60 min' },
        ],
        estadoEmocional: 'Alegre',
        novedades: 'Conoció a otros miembros del grupo',
        recomendaciones: 'Incrementar actividades de integración social',
      },
    },
  ];

  const formatearFecha = (fecha: string) => {
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

      {reports.map(report => (
        <div
          key={report.id}
          className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 hover:shadow-lg transition"
        >
          <button
            onClick={() => setExpandedReport(expandedReport === report.id ? null : report.id)}
            className="w-full px-6 py-4 flex justify-between items-start hover:bg-gray-50 transition text-left"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded">
                  {report.semana}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{report.titulo}</h3>
              <p className="text-gray-600 mb-2">{report.resumen}</p>
              <div className="flex gap-4 text-sm text-gray-500">
                <span>👤 {report.facilitador}</span>
                <span>📅 {formatearFecha(report.fecha)}</span>
              </div>
            </div>
            <div className={`transform transition ml-4 text-gray-600 text-xl ${expandedReport === report.id ? 'rotate-180' : ''}`}>
              ▼
            </div>
          </button>

          {expandedReport === report.id && (
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-6 space-y-6">
              <div>
                <h4 className="font-bold text-gray-900 mb-4">Actividades de la Semana</h4>
                <div className="space-y-2">
                  {report.detalles.actividades.map((actividad, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center p-3 bg-white rounded border border-gray-200"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">{actividad.nombre}</p>
                      </div>
                      <div className="flex gap-6 items-center">
                        <span
                          className={`px-3 py-1 rounded text-sm font-semibold ${
                            actividad.asistencia === 'Presente'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {actividad.asistencia}
                        </span>
                        <span className="text-gray-600 text-sm">{actividad.duracion}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-2">Estado Emocional</h4>
                <p className="text-gray-700">{report.detalles.estadoEmocional}</p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-2">Novedades</h4>
                <p className="text-gray-700">{report.detalles.novedades}</p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-2">Recomendaciones</h4>
                <p className="text-gray-700">{report.detalles.recomendaciones}</p>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <p className="text-sm text-gray-600">
                  Reportado por: <span className="font-semibold">{report.facilitador}</span>
                </p>
                <button className="mt-3 text-blue-600 hover:text-blue-800 font-semibold text-sm">
                  Contactar Facilitador
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
