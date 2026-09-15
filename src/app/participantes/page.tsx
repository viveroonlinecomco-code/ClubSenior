'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface Participante {
  id: string;
  nombre: string;
  edad: number;
  genero?: string;
  notas?: string;
}

export default function ParticipantesPage() {
  const router = useRouter();
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    edad: '',
    genero: '',
    notas: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Cargar participantes
  useEffect(() => {
    const loadParticipantes = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          router.push('/signin');
          return;
        }

        const response = await fetch('/api/participantes/list', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setParticipantes(data.participantes || []);
        }
      } catch (err) {
        console.error('Error loading participantes:', err);
      } finally {
        setLoading(false);
      }
    };

    loadParticipantes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.nombre || !formData.edad) {
      setError('Nombre y edad son requeridos');
      return;
    }

    try {
      const email = localStorage.getItem('auth_email');
      const token = localStorage.getItem('auth_token');

      if (!email || !token) {
        router.push('/signin');
        return;
      }

      const response = await fetch('/api/participantes/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          email,
          nombre: formData.nombre,
          edad: formData.edad,
          genero: formData.genero || undefined,
          notas: formData.notas || undefined,
        }),
      });

      if (response.ok) {
        setSuccess('✅ Participante agregado correctamente');
        setFormData({ nombre: '', edad: '', genero: '', notas: '' });
        setShowForm(false);
        
        // Recargar participantes
        setTimeout(() => window.location.reload(), 1000);
      } else {
        const data = await response.json();
        setError(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setError(`Error: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Participantes</h1>
          <p className="text-blue-100">Gestiona los abuelos vinculados a tu familia</p>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Botón Agregar */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg"
        >
          + Agregar Participante
        </button>

        {/* Formulario */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Agregar Nuevo Participante</h2>

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
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Nombre del Abuelo *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Ej: Juan García"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Edad *
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="120"
                    value={formData.edad}
                    onChange={(e) => setFormData({ ...formData, edad: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Ej: 75"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Género
                  </label>
                  <select
                    value={formData.genero}
                    onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">Seleccionar</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Notas (Opcional)
                </label>
                <textarea
                  value={formData.notas}
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Ej: Tiene diabetes, preferencias..."
                  rows={3}
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg"
                >
                  Agregar Participante
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border-2 border-gray-300 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de Participantes */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Participantes Registrados
            </h2>
          </div>

          {loading ? (
            <div className="p-6 text-center text-gray-600">Cargando...</div>
          ) : participantes.length === 0 ? (
            <div className="p-6 text-center text-gray-600">
              No hay participantes registrados aún
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Edad
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Género
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Notas
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {participantes.map((p) => (
                    <tr key={p.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-900 font-semibold">{p.nombre}</td>
                      <td className="px-6 py-4 text-gray-600">{p.edad} años</td>
                      <td className="px-6 py-4 text-gray-600">
                        {p.genero === 'M' ? 'Masculino' : p.genero === 'F' ? 'Femenino' : '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{p.notas || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-100 border-t border-gray-300 py-8 px-4 mt-12">
        <div className="max-w-6xl mx-auto text-center text-gray-600 text-sm">
          <p>&copy; 2026 Grupo Plateado. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
}
