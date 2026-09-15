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
});

interface Step2FormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
}

export default function Step2Form({ onSubmit, initialData }: Step2FormProps) {
  const [formData, setFormData] = useState({
    terminosAceptados: initialData?.terminosAceptados || false,
    politicaPrivacidadAceptada: initialData?.politicaPrivacidadAceptada || false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [expandedSection, setExpandedSection] = useState<'terms' | 'privacy' | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
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
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Términos y Condiciones</h2>

      <div className="border border-gray-300 rounded-lg overflow-hidden">
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
            <p><strong>1. Aceptación de Términos</strong><br />Al utilizar Grupo Plateado, aceptas estos términos y condiciones en su totalidad.</p>
            <p><strong>2. Descripción del Servicio</strong><br />Grupo Plateado proporciona actividades recreativas y educativas para adultos mayores.</p>
            <p><strong>3. Responsabilidades del Usuario</strong><br />El usuario es responsable de la exactitud de la información proporcionada.</p>
            <p><strong>4. Limitación de Responsabilidad</strong><br />Grupo Plateado no es responsable de daños indirectos que surjan del uso del servicio.</p>
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
          Acepto los <a href="/terminos" target="_blank" className="font-semibold text-blue-500 hover:underline">Términos de Servicio</a> de Grupo Plateado
        </label>
      </div>
      {errors.terminosAceptados && (
        <p className="text-red-500 text-sm -mt-4">{errors.terminosAceptados}</p>
      )}

      <div className="border border-gray-300 rounded-lg overflow-hidden">
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
            <p><strong>1. Recopilación de Datos</strong><br />Grupo Plateado recopila información personal para proporcionar nuestros servicios.</p>
            <p><strong>2. Uso de Información</strong><br />Utilizamos tu información para procesar pagos, enviar notificaciones y mejorar nuestro servicio.</p>
            <p><strong>3. Protección de Datos</strong><br />Implementamos medidas de seguridad estándar para proteger tu información.</p>
            <p><strong>4. Compartir Información</strong><br />No compartimos tu información personal con terceros sin tu consentimiento.</p>
          </div>
        )}
      </div>

      <div className={`flex items-start gap-3 p-4 rounded-lg ${errors.politicaPrivacidadAceptada ? 'bg-red-50 border border-red-200' : 'bg-blue-50'}`}>
        <input
          type="checkbox"
          name="politicaPrivacidadAceptada"
          checked={formData.politicaPrivacidadAceptada}
          onChange={handleChange}
          className="w-5 h-5 mt-1 cursor-pointer"
        />
        <label className="text-gray-700 cursor-pointer">
          Acepto la <a href="/privacidad" target="_blank" className="font-semibold text-blue-500 hover:underline">Política de Privacidad</a> de Grupo Plateado
        </label>
      </div>
      {errors.politicaPrivacidadAceptada && (
        <p className="text-red-500 text-sm -mt-4">{errors.politicaPrivacidadAceptada}</p>
      )}

      <button
        type="submit"
        disabled={loading || (!formData.terminosAceptados && !formData.politicaPrivacidadAceptada)}
        className="w-full bg-blue-500 hover:bg-blue-600 transition:bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 mt-8"
      >
        {loading ? 'Procesando...' : 'Continuar al Paso 3'}
      </button>
    </form>
  );
}
