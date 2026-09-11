'use client';

import { useState, useEffect } from 'react';

interface Participante {
  id: string;
  nombre: string;
  edad: number;
}

interface GenerateReportProps {
  condominio_id: string;
}

export function GenerateReportForm({ condominio_id }: GenerateReportProps) {
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedParticipante, setSelectedParticipante] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    contenido_sesion: '',
    comportamiento: '',
    progreso: '',
    recomendaciones: '',
    calificacion: 5,
  });

  useEffect(() => {
    loadParticipantes();
  }, [condominio_id]);

  const loadParticipantes = async () => {
    try {
      // Nota: Este endpoint aún no existe, es un placeholder
      // Deberías reemplazarlo con un endpoint real
      setParticipantes([
        { id: 'part-1', nombre: 'Abuelo José', edad: 78 },
        { id: 'part-2', nombre: 'Abuela María', edad: 82 },
      ]);
    } catch (err) {
      console.error('Error loading participants:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'calificacion' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedParticipante) {
      setError('Por favor selecciona un participante');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch('/api/reportes/crear', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participante_id: selectedParticipante,
          ...formData,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(`Error: ${data.error}`);
        return;
      }

      setSuccess('✅ Reporte creado correctamente');
      setFormData({
        contenido_sesion: '',
        comportamiento: '',
        progreso: '',
        recomendaciones: '',
        calificacion: 5,
      });
      setSelectedParticipante('');
    } catch (err: any) {
      setError(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-600">Cargando participantes...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">📝 Generar Reporte Semanal</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seleccionar Participante */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Seleccionar Participante *
          </label>
          <select
            value={selectedParticipante}
            onChange={e => setSelectedParticipante(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">-- Elige un participante --</option>
            {participantes.map(p => (
              <option key={p.id} value={p.id}>
                {p.nombre} ({p.edad} años)
              </option>
            ))}
          </select>
        </div>

        {/* Contenido de la Sesión */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Contenido de la Sesión *
          </label>
          <textarea
            name="contenido_sesion"
            value={formData.contenido_sesion}
            onChange={handleChange}
            placeholder="¿Qué hizo en la sesión? Describe las actividades realizadas..."
            rows={3}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Comportamiento */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Comportamiento
          </label>
          <textarea
            name="comportamiento"
            value={formData.comportamiento}
            onChange={handleChange}
            placeholder="¿Cómo se comportó? Actitud, disposición, interacción con otros..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Progreso */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Progreso Observado
          </label>
          <textarea
            name="progreso"
            value={formData.progreso}
            onChange={handleChange}
            placeholder="¿Cómo evolucionó comparado con semanas anteriores? Mejoras identificadas..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Recomendaciones */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Recomendaciones
          </label>
          <textarea
            name="recomendaciones"
            value={formData.recomendaciones}
            onChange={handleChange}
            placeholder="¿Qué se recomienda para mejorar? Actividades específicas, apoyo especial..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Calificación */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Calificación
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              name="calificacion"
              min="1"
              max="5"
              value={formData.calificacion}
              onChange={handleChange}
              className="flex-1"
            />
            <div className="text-2xl font-bold text-purple-600">
              {'⭐'.repeat(formData.calificacion)}
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {formData.calificacion === 5 && 'Excelente desempeño'}
            {formData.calificacion === 4 && 'Muy buen desempeño'}
            {formData.calificacion === 3 && 'Buen desempeño'}
            {formData.calificacion === 2 && 'Desempeño regular'}
            {formData.calificacion === 1 && 'Necesita apoyo'}
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className={`w-full font-semibold py-3 rounded-lg text-white transition ${
            submitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700'
          }`}
        >
          {submitting ? 'Guardando...' : '✅ Guardar Reporte'}
        </button>
      </form>
    </div>
  );
}
