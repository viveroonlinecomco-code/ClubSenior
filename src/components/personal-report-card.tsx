import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PersonalReportProps {
  userData?: {
    nombre?: string;
    email: string;
  };
  reportData?: {
    activitiesEnrolled: number;
    activitiesAttended: number;
    attendanceRate: number;
    lastParticipation: string;
    byPilar: {
      name: string;
      attended: number;
    }[];
    contribution: {
      storiesShared: number;
      newConnections: number;
      legacyProjects: number;
    };
  };
}

export function PersonalReportCard({ userData, reportData }: PersonalReportProps) {
  // Si no hay datos, mostrar mensaje
  if (!reportData) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-600 text-sm mb-4">
          Aún no tienes participaciones registradas.
        </p>
        <p className="text-gray-500 text-xs">
          ¡Inscríbete en una actividad para comenzar!
        </p>
      </div>
    );
  }

  const data = reportData;

  const pillarColors = ['#EF4444', '#3B82F6', '#A855F7', '#FBBF24'];

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <p className="text-sm font-semibold text-blue-600 mb-1">Actividades Inscritas</p>
          <p className="text-3xl font-bold text-gray-900">{data.activitiesEnrolled}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <p className="text-sm font-semibold text-blue-600 mb-1">Actividades Asistidas</p>
          <p className="text-3xl font-bold text-gray-900">{data.activitiesAttended}</p>
        </div>
      </div>

      {/* Attendance Rate */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
        <p className="text-sm font-semibold text-green-600 mb-4">Tasa de Asistencia</p>
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-full transition-all duration-500"
                style={{ width: `${data.attendanceRate}%` }}
              ></div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-600">{data.attendanceRate}%</p>
            <p className="text-xs text-gray-600">Excelente</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-4">
          Última participación: <span className="font-semibold">{data.lastParticipation}</span>
        </p>
      </div>

      {/* Participation by Pilar */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-6 uppercase tracking-wide">
          Participación por Pilar
        </h4>
        <div className="space-y-4">
          {data.byPilar.map((pilar, idx) => (
            <div key={idx}>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-gray-700">{pilar.name}</p>
                <p className="text-sm font-semibold text-gray-900">{pilar.attended} asistencias</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${(pilar.attended / 10) * 100}%`,
                    backgroundColor: pillarColors[idx] || '#10B981',
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Community Contribution */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
        <h4 className="text-sm font-semibold text-purple-900 mb-6 uppercase tracking-wide">
          Contribución Comunitaria
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{data.contribution.storiesShared}</p>
            <p className="text-xs text-gray-600 mt-1">Historias Compartidas</p>
          </div>
          <div className="text-center border-l border-r border-purple-200">
            <p className="text-2xl font-bold text-purple-600">{data.contribution.newConnections}</p>
            <p className="text-xs text-gray-600 mt-1">Nuevas Amistades</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{data.contribution.legacyProjects}</p>
            <p className="text-xs text-gray-600 mt-1">Proyectos Legado</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
          Descargar Reporte
        </button>
        <button className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
          Ver Histórico
        </button>
      </div>
    </div>
  );
}
