'use client';

import { useState, useEffect } from 'react';

interface Condominio {
  id: string;
  nombre: string;
}

interface ProfileEditFormProps {
  initialData: {
    nombre_abuelo?: string;
    apellido_abuelo?: string;
    fecha_nacimiento?: string;
    ciudad?: string;
    condominio?: string;
    phone?: string;
    email?: string;
  };
  onSave?: (data: any) => void;
}

export default function ProfileEditForm({ initialData, onSave }: ProfileEditFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [condominios, setCondominios] = useState<Condominio[]>([]);
  const [condominiosLoading, setCondominiosLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre_abuelo: initialData.nombre_abuelo || '',
    apellido_abuelo: initialData.apellido_abuelo || '',
    fecha_nacimiento: initialData.fecha_nacimiento || '',
    ciudad: initialData.ciudad || '',
    condominio: initialData.condominio || '',
    phone: initialData.phone || '',
  });

  // ✅ Cargar lista de condominios al montar
  useEffect(() => {
    const fetchCondominios = async () => {
      setCondominiosLoading(true);
      try {
        const response = await fetch('/api/condominios/list');
        if (response.ok) {
          const data = await response.json();
          setCondominios(data);
        } else {
          console.error('Error fetching condominios');
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setCondominiosLoading(false);
      }
    };

    fetchCondominios();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setMessage('❌ No hay token de autenticación');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/dashboard/update-profile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre_abuelo: formData.nombre_abuelo,
          apellido_abuelo: formData.apellido_abuelo,
          fecha_nacimiento: formData.fecha_nacimiento,
          ciudad: formData.ciudad,
          condominio: formData.condominio,
          telefono: formData.phone,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        setMessage(`❌ Error: ${error.error}`);
        setLoading(false);
        return;
      }

      const result = await response.json();
      setMessage('✅ Perfil actualizado correctamente');
      setIsEditing(false);
      
      if (onSave) {
        onSave(result.user);
      }

      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Información Personal</h3>
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition"
            >
              ✏️ Editar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Nombre</p>
              <p className="text-lg font-semibold text-gray-900">{formData.nombre_abuelo || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Apellido</p>
              <p className="text-lg font-semibold text-gray-900">{formData.apellido_abuelo || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-lg font-semibold text-gray-900">{initialData.email || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Teléfono</p>
              <p className="text-lg font-semibold text-gray-900">{formData.phone || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Fecha de Nacimiento</p>
              <p className="text-lg font-semibold text-gray-900">
                {formData.fecha_nacimiento ? new Date(formData.fecha_nacimiento).toLocaleDateString('es-CO') : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Ciudad</p>
              <p className="text-lg font-semibold text-gray-900">{formData.ciudad || '-'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">Condominio / Conjunto</p>
              <p className="text-lg font-semibold text-gray-900">{formData.condominio || '-'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Editar Información Personal</h3>

        {message && (
          <div className={`mb-4 p-4 rounded-lg ${message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message}
          </div>
        )}

        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Nombre</label>
              <input
                type="text"
                name="nombre_abuelo"
                value={formData.nombre_abuelo}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Apellido</label>
              <input
                type="text"
                name="apellido_abuelo"
                value={formData.apellido_abuelo}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Teléfono</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Fecha de Nacimiento</label>
              <input
                type="date"
                name="fecha_nacimiento"
                value={formData.fecha_nacimiento}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Ciudad</label>
              <input
                type="text"
                name="ciudad"
                value={formData.ciudad}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Condominio / Conjunto</label>
              <select
                name="condominio"
                value={formData.condominio}
                onChange={handleChange}
                disabled={condominiosLoading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">
                  {condominiosLoading ? 'Cargando condominios...' : 'Selecciona un condominio'}
                </option>
                {condominios.map((cond) => (
                  <option key={cond.id} value={cond.nombre}>
                    {cond.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition disabled:opacity-50"
            >
              {loading ? 'Guardando...' : '✅ Guardar Cambios'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  nombre_abuelo: initialData.nombre_abuelo || '',
                  apellido_abuelo: initialData.apellido_abuelo || '',
                  fecha_nacimiento: initialData.fecha_nacimiento || '',
                  ciudad: initialData.ciudad || '',
                  condominio: initialData.condominio || '',
                  phone: initialData.phone || '',
                });
              }}
              className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg font-semibold transition"
            >
              ❌ Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
