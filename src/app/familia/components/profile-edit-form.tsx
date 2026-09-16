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
    eps?: string;
    emergencia_nombre?: string;
    emergencia_telefono?: string;
    familiar_nombre?: string;
    familiar_relacion?: string;
    familiar_telefono?: string;
    contratos_aceptados?: boolean;
    terminos_aceptados?: boolean;
    politica_privacidad_aceptada?: boolean;
    contratos_fecha_aceptacion?: string;
    updated_at?: string;
  };
  readOnlyFields?: string[];
  onSave?: (data: any) => void;
}

export default function ProfileEditForm({ initialData, readOnlyFields = [], onSave }: ProfileEditFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [condominios, setCondominios] = useState<Condominio[]>([]);
  const [condominiosLoading, setCondominiosLoading] = useState(false);
  
  const isReadOnly = (fieldName: string) => readOnlyFields.includes(fieldName);
  
  // Aceptaciones siempre son read-only (responsabilidad legal)
  const acceptanceReadOnly = ['contratos_aceptados', 'terminos_aceptados', 'politica_privacidad_aceptada'];
  
  const [formData, setFormData] = useState({
    nombre_abuelo: initialData.nombre_abuelo || '',
    apellido_abuelo: initialData.apellido_abuelo || '',
    fecha_nacimiento: initialData.fecha_nacimiento || '',
    ciudad: initialData.ciudad || '',
    condominio: initialData.condominio || '',
    phone: initialData.phone || '',
    eps: initialData.eps || '',
    emergencia_nombre: initialData.emergencia_nombre || '',
    emergencia_telefono: initialData.emergencia_telefono || '',
    familiar_nombre: initialData.familiar_nombre || '',
    familiar_relacion: initialData.familiar_relacion || '',
    familiar_telefono: initialData.familiar_telefono || '',
    contratos_aceptados: initialData.contratos_aceptados || false,
    terminos_aceptados: initialData.terminos_aceptados || false,
    politica_privacidad_aceptada: initialData.politica_privacidad_aceptada || false,
  });

  useEffect(() => {
    const fetchCondominios = async () => {
      setCondominiosLoading(true);
      try {
        const response = await fetch('/api/condominios/list');
        if (response.ok) {
          const data = await response.json();
          setCondominios(data);
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
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
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
        body: JSON.stringify(formData),
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
            <h3 className="text-xl font-semibold text-gray-900">Mi Perfil</h3>
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition"
            >
              ✏️ Editar
            </button>
          </div>

          {/* DATOS PERSONALES */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">📋 Datos Personales</h4>
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

          {/* SALUD */}
          <div className="mb-8 pb-6 border-b">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">🏥 Información de Salud</h4>
            <div>
              <p className="text-sm text-gray-600">EPS</p>
              <p className="text-lg font-semibold text-gray-900">{formData.eps || '-'}</p>
            </div>
          </div>

          {/* EMERGENCIA */}
          <div className="mb-8 pb-6 border-b">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">🚨 Contacto de Emergencia</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nombre</p>
                <p className="text-lg font-semibold text-gray-900">{formData.emergencia_nombre || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Teléfono</p>
                <p className="text-lg font-semibold text-gray-900">{formData.emergencia_telefono || '-'}</p>
              </div>
            </div>
          </div>

          {/* FAMILIAR */}
          <div className="mb-8 pb-6 border-b">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">👨‍👩‍👧 Contacto Familiar</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nombre</p>
                <p className="text-lg font-semibold text-gray-900">{formData.familiar_nombre || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Relación</p>
                <p className="text-lg font-semibold text-gray-900">{formData.familiar_relacion || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Teléfono</p>
                <p className="text-lg font-semibold text-gray-900">{formData.familiar_telefono || '-'}</p>
              </div>
            </div>
          </div>

          {/* ACEPTACIONES - DOCUMENTADAS CON FECHA */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">📋 Aceptaciones Registradas</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className={formData.contratos_aceptados ? '✅' : '❌'} />
                <div>
                  <p className="text-gray-900 font-semibold">Contratos aceptados</p>
                  {formData.contratos_aceptados && initialData.contratos_fecha_aceptacion && (
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(initialData.contratos_fecha_aceptacion).toLocaleDateString('es-CO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                  {formData.contratos_aceptados && !initialData.contratos_fecha_aceptacion && initialData.updated_at && (
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(initialData.updated_at).toLocaleDateString('es-CO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className={formData.terminos_aceptados ? '✅' : '❌'} />
                <div>
                  <p className="text-gray-900 font-semibold">Términos y condiciones</p>
                  {formData.terminos_aceptados && initialData.updated_at && (
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(initialData.updated_at).toLocaleDateString('es-CO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className={formData.politica_privacidad_aceptada ? '✅' : '❌'} />
                <div>
                  <p className="text-gray-900 font-semibold">Política de privacidad</p>
                  {formData.politica_privacidad_aceptada && initialData.updated_at && (
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(initialData.updated_at).toLocaleDateString('es-CO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <p className="text-xs text-green-700 mt-4">
              ✓ Estas aceptaciones se registran como consentimiento informado desde la fecha indicada. No se pueden modificar retroactivamente.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Editar Mi Perfil</h3>

        {message && (
          <div className={`mb-4 p-4 rounded-lg ${message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message}
          </div>
        )}

        <form className="space-y-8">
          {readOnlyFields.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                🔒 <strong>Campos protegidos:</strong> Algunos campos son editables solo por administrador. Contáctanos si necesitas cambiarlos.
              </p>
            </div>
          )}

          {/* DATOS PERSONALES */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">📋 Datos Personales</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Nombre {isReadOnly('nombre_abuelo') && '🔒'}
                </label>
                <input 
                  type="text" 
                  name="nombre_abuelo" 
                  value={formData.nombre_abuelo} 
                  onChange={handleChange}
                  disabled={isReadOnly('nombre_abuelo')}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${isReadOnly('nombre_abuelo') ? 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed' : 'border-gray-300 focus:ring-blue-500'}`}
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Apellido {isReadOnly('apellido_abuelo') && '🔒'}
                </label>
                <input 
                  type="text" 
                  name="apellido_abuelo" 
                  value={formData.apellido_abuelo} 
                  onChange={handleChange}
                  disabled={isReadOnly('apellido_abuelo')}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${isReadOnly('apellido_abuelo') ? 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed' : 'border-gray-300 focus:ring-blue-500'}`}
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Teléfono {isReadOnly('phone') && '🔒'}
                </label>
                <input 
                  type="text" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange}
                  disabled={isReadOnly('phone')}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${isReadOnly('phone') ? 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed' : 'border-gray-300 focus:ring-blue-500'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Fecha de Nacimiento</label>
                <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Ciudad</label>
                <input type="text" name="ciudad" value={formData.ciudad} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Condominio / Conjunto</label>
                <select name="condominio" value={formData.condominio} onChange={handleChange} disabled={condominiosLoading} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100">
                  <option value="">{condominiosLoading ? 'Cargando...' : 'Selecciona'}</option>
                  {condominios.map((cond) => (
                    <option key={cond.id} value={cond.nombre}>{cond.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SALUD */}
          <div className="pb-6 border-b">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">🏥 Información de Salud</h4>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">EPS</label>
              <input type="text" name="eps" value={formData.eps} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ej: Sanitas, Axa, etc." />
            </div>
          </div>

          {/* EMERGENCIA */}
          <div className="pb-6 border-b">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">🚨 Contacto de Emergencia</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Nombre</label>
                <input type="text" name="emergencia_nombre" value={formData.emergencia_nombre} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Teléfono</label>
                <input type="text" name="emergencia_telefono" value={formData.emergencia_telefono} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          {/* FAMILIAR */}
          <div className="pb-6 border-b">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">👨‍👩‍👧 Contacto Familiar</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Nombre</label>
                <input type="text" name="familiar_nombre" value={formData.familiar_nombre} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Relación</label>
                <input type="text" name="familiar_relacion" value={formData.familiar_relacion} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ej: Hija, Hijo, Nieto" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-900 mb-2">Teléfono</label>
                <input type="text" name="familiar_telefono" value={formData.familiar_telefono} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          {/* ACEPTACIONES - DOCUMENTADAS CON FECHA (No editables) */}
          <div className="pb-6 border-b bg-green-50 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">📋 Aceptaciones Registradas</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className={formData.contratos_aceptados ? '✅' : '❌'} />
                <div>
                  <p className="text-gray-900 font-semibold">Contratos aceptados</p>
                  {formData.contratos_aceptados && initialData.contratos_fecha_aceptacion && (
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(initialData.contratos_fecha_aceptacion).toLocaleDateString('es-CO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                  {formData.contratos_aceptados && !initialData.contratos_fecha_aceptacion && initialData.updated_at && (
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(initialData.updated_at).toLocaleDateString('es-CO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className={formData.terminos_aceptados ? '✅' : '❌'} />
                <div>
                  <p className="text-gray-900 font-semibold">Términos y condiciones</p>
                  {formData.terminos_aceptados && initialData.updated_at && (
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(initialData.updated_at).toLocaleDateString('es-CO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className={formData.politica_privacidad_aceptada ? '✅' : '❌'} />
                <div>
                  <p className="text-gray-900 font-semibold">Política de privacidad</p>
                  {formData.politica_privacidad_aceptada && initialData.updated_at && (
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(initialData.updated_at).toLocaleDateString('es-CO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <p className="text-xs text-green-700 mt-4">
              ✓ Estas aceptaciones se registran como consentimiento informado desde la fecha indicada. No se pueden modificar retroactivamente.
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={handleSave} disabled={loading} className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition disabled:opacity-50">
              {loading ? 'Guardando...' : '✅ Guardar Cambios'}
            </button>
            <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg font-semibold transition">
              ❌ Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
