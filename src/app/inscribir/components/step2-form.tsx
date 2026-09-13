'use client';

import { useState } from 'react';
import { z } from 'zod';

const Step2Schema = z.object({
  terminosAceptados: z.boolean().refine(val => val === true, {
    message: 'Debes aceptar los términos y condiciones',
  }),
  politicaPrivacidadAceptada: z.boolean().refine(val => val === true, {
    message: 'Debes aceptar la política de privacidad',
  }),
  familiarRelacion: z.string().min(1, 'Selecciona una relación'),
  familiarNombre: z.string().min(2, 'Nombre del familiar requerido'),
  familiarEmail: z.string().email('Email del familiar inválido'),
  familiarTelefono: z.string().min(10, 'Teléfono del familiar inválido'),
  eps: z.string().min(2, 'EPS requerida'),
  numeroAfiliadoEps: z.string().optional(),
});

interface Step2FormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
}

export default function Step2Form({ onSubmit, initialData }: Step2FormProps) {
  const [formData, setFormData] = useState({
    terminosAceptados: initialData?.terminosAceptados || false,
    politicaPrivacidadAceptada: initialData?.politicaPrivacidadAceptada || false,
    familiarRelacion: initialData?.familiarRelacion || '',
    familiarNombre: initialData?.familiarNombre || '',
    familiarEmail: initialData?.familiarEmail || '',
    familiarTelefono: initialData?.familiarTelefono || '',
    eps: initialData?.eps || '',
    numeroAfiliadoEps: initialData?.numeroAfiliadoEps || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [expandedSection, setExpandedSection] = useState<'terms' | 'privacy' | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type } = e.target;
    const value = type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const validated = Step2Schema.parse(formData);
      onSubmit(validated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((err: any) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Tu Familia y Salud</h2>

      {/* SECCIÓN 1: TÉRMINOS Y PRIVACIDAD */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Términos y Condiciones</h3>

        <div className="border border-gray-300 rounded-lg overflow-hidden mb-4">
          <button
            type="button"
            onClick={() => setExpandedSection(expandedSection === 'terms' ? null : 'terms')}
            className="w-full bg-gray-50 hover:bg-gray-100 px-6 py-4 flex justify-between items-center font-semibold text-gray-900"
          >
            <span>Términos de Servicio</span>
            <span className={`transform transition ${expandedSection === 'terms' ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          {expandedSection === 'terms' && (
            <div className="bg-white px-6 py-4 border-t border-gray-300 max-h-64 overflow-y-auto text-gray-600 text-sm space-y-4">
              <p><strong>1. Aceptación de Términos</strong><br />Al utilizar ClubSenior, aceptas estos términos y condiciones en su totalidad.</p>
              <p><strong>2. Descripción del Servicio</strong><br />ClubSenior proporciona actividades recreativas y educativas para adultos mayores.</p>
              <p><strong>3. Responsabilidades del Usuario</strong><br />El usuario es responsable de la exactitud de la información proporcionada.</p>
              <p><strong>4. Limitación de Responsabilidad</strong><br />ClubSenior no es responsable de daños indirectos que surjan del uso del servicio.</p>
            </div>
          )}
        </div>

        <div className={`flex items-start gap-3 p-4 rounded-lg ${errors.terminosAceptados ? 'bg-red-50 border border-red-200' : 'bg-blue-50'}`}>
          <input
            type="checkbox"
            name="terminosAceptados"
            checked={formData.terminosAceptados}
            onChange={handleChange}
            className="w-5 h-5 mt-1 cursor-pointer"
          />
          <label className="text-gray-700 cursor-pointer">
            Acepto los <span className="font-semibold">Términos de Servicio</span> de ClubSenior
          </label>
        </div>
        {errors.terminosAceptados && (
          <p className="text-red-500 text-sm">{errors.terminosAceptados}</p>
        )}

        <div className="border border-gray-300 rounded-lg overflow-hidden mt-4">
          <button
            type="button"
            onClick={() => setExpandedSection(expandedSection === 'privacy' ? null : 'privacy')}
            className="w-full bg-gray-50 hover:bg-gray-100 px-6 py-4 flex justify-between items-center font-semibold text-gray-900"
          >
            <span>Política de Privacidad</span>
            <span className={`transform transition ${expandedSection === 'privacy' ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          {expandedSection === 'privacy' && (
            <div className="bg-white px-6 py-4 border-t border-gray-300 max-h-64 overflow-y-auto text-gray-600 text-sm space-y-4">
              <p><strong>1. Recopilación de Datos</strong><br />ClubSenior recopila información personal para proporcionar nuestros servicios.</p>
              <p><strong>2. Uso de Información</strong><br />Utilizamos tu información para procesar pagos, enviar notificaciones y mejorar nuestro servicio.</p>
              <p><strong>3. Protección de Datos</strong><br />Implementamos medidas de seguridad estándar para proteger tu información.</p>
              <p><strong>4. Compartir Información</strong><br />No compartimos tu información personal con terceros sin tu consentimiento.</p>
            </div>
          )}
        </div>

        <div className={`flex items-start gap-3 p-4 rounded-lg mt-4 ${errors.politicaPrivacidadAceptada ? 'bg-red-50 border border-red-200' : 'bg-blue-50'}`}>
          <input
            type="checkbox"
            name="politicaPrivacidadAceptada"
            checked={formData.politicaPrivacidadAceptada}
            onChange={handleChange}
            className="w-5 h-5 mt-1 cursor-pointer"
          />
          <label className="text-gray-700 cursor-pointer">
            Acepto la <span className="font-semibold">Política de Privacidad</span> de ClubSenior
          </label>
        </div>
        {errors.politicaPrivacidadAceptada && (
          <p className="text-red-500 text-sm">{errors.politicaPrivacidadAceptada}</p>
        )}
      </div>

      {/* SECCIÓN 2: INFORMACIÓN DEL FAMILIAR */}
      <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
        <h3 className="font-semibold text-gray-900 mb-4">Información del Familiar</h3>
        <p className="text-sm text-gray-600 mb-4">Quién financia tu suscripción y será contacto de emergencia</p>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">¿Cuál es tu relación? *</label>
          <select
            name="familiarRelacion"
            value={formData.familiarRelacion}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
              errors.familiarRelacion ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Selecciona una opción</option>
            <option value="Mamá">Mamá</option>
            <option value="Papá">Papá</option>
            <option value="Hijo/a">Hijo/a</option>
            <option value="Nieto/a">Nieto/a</option>
            <option value="Hermano/a">Hermano/a</option>
            <option value="Otro">Otro</option>
          </select>
          {errors.familiarRelacion && (
            <p className="text-red-500 text-sm mt-1">{errors.familiarRelacion}</p>
          )}
        </div>

        <div className="mt-4">
          <label className="block text-gray-700 font-semibold mb-2">Nombre del Familiar *</label>
          <input
            type="text"
            name="familiarNombre"
            value={formData.familiarNombre}
            onChange={handleChange}
            placeholder="Ej: María García"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
              errors.familiarNombre ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.familiarNombre && (
            <p className="text-red-500 text-sm mt-1">{errors.familiarNombre}</p>
          )}
        </div>

        <div className="mt-4">
          <label className="block text-gray-700 font-semibold mb-2">Email del Familiar *</label>
          <input
            type="email"
            name="familiarEmail"
            value={formData.familiarEmail}
            onChange={handleChange}
            placeholder="familiar@email.com"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
              errors.familiarEmail ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.familiarEmail && (
            <p className="text-red-500 text-sm mt-1">{errors.familiarEmail}</p>
          )}
        </div>

        <div className="mt-4">
          <label className="block text-gray-700 font-semibold mb-2">Teléfono del Familiar *</label>
          <input
            type="tel"
            name="familiarTelefono"
            value={formData.familiarTelefono}
            onChange={handleChange}
            placeholder="+57 320 9876543"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
              errors.familiarTelefono ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.familiarTelefono && (
            <p className="text-red-500 text-sm mt-1">{errors.familiarTelefono}</p>
          )}
        </div>
      </div>

      {/* SECCIÓN 3: INFORMACIÓN DE SALUD */}
      <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
        <h3 className="font-semibold text-gray-900 mb-4">Información de Salud</h3>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">¿Tienes EPS (Plan de Salud)? *</label>
          <select
            name="eps"
            value={formData.eps}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 ${
              errors.eps ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Selecciona tu EPS</option>
            <option value="Sanitas">Sanitas</option>
            <option value="FAMISANAR">FAMISANAR</option>
            <option value="Axa Colpatria">Axa Colpatria</option>
            <option value="Caja de Compensación">Caja de Compensación</option>
            <option value="Capredena">Capredena</option>
            <option value="Otro">Otro</option>
          </select>
          {errors.eps && (
            <p className="text-red-500 text-sm mt-1">{errors.eps}</p>
          )}
        </div>

        <div className="mt-4">
          <label className="block text-gray-700 font-semibold mb-2">Número de Afiliado (Opcional)</label>
          <input
            type="text"
            name="numeroAfiliadoEps"
            value={formData.numeroAfiliadoEps}
            onChange={handleChange}
            placeholder="Ej: D123456789"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 ${
              errors.numeroAfiliadoEps ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.numeroAfiliadoEps && (
            <p className="text-red-500 text-sm mt-1">{errors.numeroAfiliadoEps}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 mt-8"
      >
        {loading ? 'Procesando...' : 'Continuar al Paso 3'}
      </button>
    </form>
  );
}
