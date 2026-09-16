'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';

const Step1Schema = z.object({
  nombreAbuelo: z.string().min(2, 'Nombre requerido'),
  apellidoAbuelo: z.string().min(2, 'Apellido requerido'),
  email: z.string().email('Email inválido'),
  telefono: z.string().min(10, 'Teléfono inválido'),
  fechaNacimiento: z.string().min(1, 'Fecha requerida'),
  ciudad: z.string().min(2, 'Ciudad requerida'),
  eps: z.string().min(2, 'EPS requerida'),
  emergenciaNombre: z.string().min(2, 'Nombre de contacto requerido'),
  emergenciaTelefono: z.string().min(10, 'Teléfono de emergencia inválido'),
  familiarNombre: z.string().min(2, 'Nombre del familiar requerido'),
  familiarRelacion: z.string().min(2, 'Relación requerida'),
  familiarTelefono: z.string().min(10, 'Teléfono del familiar inválido'),
});

interface Step1FormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
}

export default function Step1Form({ onSubmit, initialData }: Step1FormProps) {
  const router = useRouter();
  const { signInWithEmail } = useAuth();
  
  const [formData, setFormData] = useState({
    nombreAbuelo: initialData?.nombreAbuelo || '',
    apellidoAbuelo: initialData?.apellidoAbuelo || '',
    email: initialData?.email || '',
    telefono: initialData?.telefono || '',
    fechaNacimiento: initialData?.fechaNacimiento || '',
    ciudad: initialData?.ciudad || '',
    eps: initialData?.eps || '',
    emergenciaNombre: initialData?.emergenciaNombre || '',
    emergenciaTelefono: initialData?.emergenciaTelefono || '',
    familiarNombre: initialData?.familiarNombre || '',
    familiarRelacion: initialData?.familiarRelacion || '',
    familiarTelefono: initialData?.familiarTelefono || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
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
      // Validar con Zod
      const validated = Step1Schema.parse(formData);

      // Enviar OTP a Supabase
      const result = await signInWithEmail(validated.email);
      
      if (result.error) {
        setErrors({ email: result.error.message || 'Error al enviar OTP' });
        setLoading(false);
        return;
      }

      // Guardar datos en sessionStorage para posterior verificación
      sessionStorage.setItem('pendingEmail', validated.email);
      sessionStorage.setItem('inscribirData', JSON.stringify(validated));

      // Redirigir a verificación OTP
      router.push('/verificar-otp');
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
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Información del Adulto Mayor</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Nombre</label>
          <input
            type="text"
            name="nombreAbuelo"
            value={formData.nombreAbuelo}
            onChange={handleChange}
            placeholder="Ej: Juan"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
              errors.nombreAbuelo ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.nombreAbuelo && (
            <p className="text-red-500 text-sm mt-1">{errors.nombreAbuelo}</p>
          )}
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">Apellido</label>
          <input
            type="text"
            name="apellidoAbuelo"
            value={formData.apellidoAbuelo}
            onChange={handleChange}
            placeholder="Ej: García"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
              errors.apellidoAbuelo ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.apellidoAbuelo && (
            <p className="text-red-500 text-sm mt-1">{errors.apellidoAbuelo}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-2">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="correo@ejemplo.com"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-2">Teléfono</label>
        <input
          type="tel"
          name="telefono"
          value={formData.telefono}
          onChange={handleChange}
          placeholder="+57 320 1234567"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
            errors.telefono ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.telefono && <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>}
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-2">Fecha de Nacimiento</label>
        <input
          type="date"
          name="fechaNacimiento"
          value={formData.fechaNacimiento}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
            errors.fechaNacimiento ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.fechaNacimiento && (
          <p className="text-red-500 text-sm mt-1">{errors.fechaNacimiento}</p>
        )}
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-2">Ciudad</label>
        <select
          name="ciudad"
          value={formData.ciudad}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
            errors.ciudad ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Selecciona una ciudad</option>
          <option value="Cajicá">Cajicá</option>
          <option value="Chía">Chía</option>
          <option value="Tabio">Tabio</option>
          <option value="Sopó">Sopó</option>
          <option value="Zipaquirá">Zipaquirá</option>
        </select>
        {errors.ciudad && <p className="text-red-500 text-sm mt-1">{errors.ciudad}</p>}
      </div>

      {/* SECCIÓN: EPS */}
      <div className="border-t pt-6 mt-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Información de Salud</h3>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">EPS (Entidad Promotora de Salud)</label>
          <select
            name="eps"
            value={formData.eps}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
              errors.eps ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Selecciona tu EPS</option>
            <option value="Sura">Sura</option>
            <option value="Sanitas">Sanitas</option>
            <option value="Axa Colpatria">Axa Colpatria</option>
            <option value="Coomeva">Coomeva</option>
            <option value="Famisanar">Famisanar</option>
            <option value="Capchur">Capchur</option>
            <option value="Salud Total">Salud Total</option>
            <option value="Compensar">Compensar</option>
            <option value="Nueva EPS">Nueva EPS</option>
            <option value="Otra">Otra</option>
          </select>
          {errors.eps && <p className="text-red-500 text-sm mt-1">{errors.eps}</p>}
        </div>
      </div>

      {/* SECCIÓN: CONTACTO DE EMERGENCIA */}
      <div className="border-t pt-6 mt-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Contacto de Emergencia</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Nombre del Contacto</label>
            <input
              type="text"
              name="emergenciaNombre"
              value={formData.emergenciaNombre}
              onChange={handleChange}
              placeholder="Ej: María García"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                errors.emergenciaNombre ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.emergenciaNombre && (
              <p className="text-red-500 text-sm mt-1">{errors.emergenciaNombre}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Teléfono de Emergencia</label>
            <input
              type="tel"
              name="emergenciaTelefono"
              value={formData.emergenciaTelefono}
              onChange={handleChange}
              placeholder="+57 320 1234567"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                errors.emergenciaTelefono ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.emergenciaTelefono && (
              <p className="text-red-500 text-sm mt-1">{errors.emergenciaTelefono}</p>
            )}
          </div>
        </div>
      </div>

      {/* SECCIÓN: FAMILIAR RESPONSABLE */}
      <div className="border-t pt-6 mt-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Familiar Responsable</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Nombre del Familiar</label>
            <input
              type="text"
              name="familiarNombre"
              value={formData.familiarNombre}
              onChange={handleChange}
              placeholder="Ej: Carlos García"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                errors.familiarNombre ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.familiarNombre && (
              <p className="text-red-500 text-sm mt-1">{errors.familiarNombre}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Relación (Ej: Hijo/a, Nieto/a)</label>
            <input
              type="text"
              name="familiarRelacion"
              value={formData.familiarRelacion}
              onChange={handleChange}
              placeholder="Ej: Hijo"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                errors.familiarRelacion ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.familiarRelacion && (
              <p className="text-red-500 text-sm mt-1">{errors.familiarRelacion}</p>
            )}
          </div>
        </div>
        <div className="mt-6">
          <label className="block text-gray-700 font-semibold mb-2">Teléfono del Familiar</label>
          <input
            type="tel"
            name="familiarTelefono"
            value={formData.familiarTelefono}
            onChange={handleChange}
            placeholder="+57 320 1234567"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
              errors.familiarTelefono ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.familiarTelefono && (
            <p className="text-red-500 text-sm mt-1">{errors.familiarTelefono}</p>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800 text-sm">
        📧 Se enviará un código de verificación a tu email. Necesitarás este código para continuar.
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 hover:bg-blue-600 transition:bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 mt-8"
      >
        {loading ? 'Enviando código de verificación...' : 'Continuar al Paso 2'}
      </button>
    </form>
  );
}
