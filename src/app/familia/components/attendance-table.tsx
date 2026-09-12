'use client';

interface AttendanceTableProps {
  limit?: number;
}

export default function AttendanceTable({ limit = 100 }: AttendanceTableProps) {
  const attendanceData = [
    { id: 1, fecha: '2026-09-08', actividad: 'Yoga Terapéutico', asistencia: true, duracion: '60 min', facilitador: 'María Rodríguez' },
    { id: 2, fecha: '2026-09-07', actividad: 'Cine Club', asistencia: true, duracion: '120 min', facilitador: 'Carlos López' },
    { id: 3, fecha: '2026-09-06', actividad: 'Taller de Arte', asistencia: true, duracion: '90 min', facilitador: 'Patricia Gómez' },
    { id: 4, fecha: '2026-09-05', actividad: 'Tertulias Literarias', asistencia: false, duracion: '-', facilitador: 'Juan Pérez' },
    { id: 5, fecha: '2026-09-04', actividad: 'Yoga Terapéutico', asistencia: true, duracion: '60 min', facilitador: 'María Rodríguez' },
  ];

  const displayedData = attendanceData.slice(0, limit);
  const totalAsistencias = displayedData.filter(a => a.asistencia).length;
  const tasa = Math.round((totalAsistencias / displayedData.length) * 100);

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 px-6 pt-6">
        <div className="text-center">
          <p className="text-gray-600 text-sm">TOTAL ACTIVIDADES</p>
          <p className="text-3xl font-bold text-gray-900">{displayedData.length}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-600 text-sm">ASISTENCIAS</p>
          <p className="text-3xl font-bold text-blue-500">{totalAsistencias}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-600 text-sm">TASA DE ASISTENCIA</p>
          <p className="text-3xl font-bold text-blue-500">{tasa}%</p>
        </div>
      </div>

      <table className="w-full">
        <thead className="bg-gray-100 border-y border-gray-300">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Fecha</th>
            <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Actividad</th>
            <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Facilitador</th>
            <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Duración</th>
            <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">Asistencia</th>
          </tr>
        </thead>
        <tbody>
          {displayedData.map((row, index) => (
            <tr
              key={row.id}
              className={`border-b border-gray-200 hover:bg-gray-50 transition ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
            >
              <td className="px-6 py-4 text-sm text-gray-900">{formatearFecha(row.fecha)}</td>
              <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{row.actividad}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{row.facilitador}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{row.duracion}</td>
              <td className="px-6 py-4 text-center">
                {row.asistencia ? (
                  <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">
                    ✓ Presente
                  </span>
                ) : (
                  <span className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold">
                    ✗ Ausente
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
