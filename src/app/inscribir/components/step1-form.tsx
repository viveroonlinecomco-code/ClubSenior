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
  const [userExists, setUserExists] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);
  const [readOnlyFields, setReadOnlyFields] = useState<string[]>([]);

  // ✅ Verificar si el email existe cuando pierde el foco
  const handleEmailBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const email = e.target.value.trim();
    
    if (!email || !email.includes('@')) {
      return;
    }

    setCheckingEmail(true);
    setEmailChecked(false);

    try {
      const response = await fetch('/api/inscribir/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        console.error('Error checking email');
        setCheckingEmail(false);
        return;
      }

      const result = await response.json();

      if (result.exists && result.data) {
        // ✅ Usuario EXISTE - traer datos preexistentes
        console.log('✅ Usuario encontrado:', result.data);
        setFormData(prev => ({
          ...prev,
          ...result.data,
        }));
        setUserExists(true);
        setReadOnlyFields(['nombreAbuelo', 'apellidoAbuelo', 'email']);
      } else {
        // Usuario NUEVO
        console.log('ℹ️ Usuario nuevo - completar todos los campos');
        setUserExists(false);
        setReadOnlyFields([]);
      }

      setEmailChecked(true);
    } catch (error) {
      console.error('Error checking email:', error);
    } finally {
      setCheckingEmail(false);
    }
  };

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

  const isFieldReadOnly = (fieldName: string) => readOnlyFields.includes(fieldName);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Información del Adulto Mayor</h2>

      {userExists && emailChecked && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            ✅ <strong>Perfil encontrado:</strong> Hemos cargado tus datos previos. Completa cualquier campo faltante.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Nombre {isFieldReadOnly('nombreAbuelo') && '🔒'}</label>
          <input
            type="text"
            name="nombreAbuelo"
            value={formData.nombreAbuelo}
            onChange={handleChange}
            disabled={isFieldReadOnly('nombreAbuelo')}
            placeholder="Ej: Juan"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
              isFieldReadOnly('nombreAbuelo') ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
            } ${errors.nombreAbuelo ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.nombreAbuelo && (
            <p className="text-red-500 text-sm mt-1">{errors.nombreAbuelo}</p>
          )}
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">Apellido {isFieldReadOnly('apellidoAbuelo') && '🔒'}</label>
          <input
            type="text"
            name="apellidoAbuelo"
            value={formData.apellidoAbuelo}
            onChange={handleChange}
            disabled={isFieldReadOnly('apellidoAbuelo')}
            placeholder="Ej: García"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
              isFieldReadOnly('apellidoAbuelo') ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
            } ${errors.apellidoAbuelo ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.apellidoAbuelo && (
            <p className="text-red-500 text-sm mt-1">{errors.apellidoAbuelo}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-2">Email {isFieldReadOnly('email') && '🔒'}</label>
        <div className="relative">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleEmailBlur}
            disabled={isFieldReadOnly('email')}
            placeholder="correo@ejemplo.com"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
              isFieldReadOnly('email') ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
            } ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
          />
          {checkingEmail && (
            <span className="absolute right-3 top-2 text-gray-500 text-sm">Verificando...</span>
          )}
        </div>
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Teléfono</label>
          <input
            type="text"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            placeholder="Ej: 3001234567"
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
              errors.telefono ? 'border-red-500' : ''
            }`}
          />
          {errors.telefono && (
            <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>
          )}
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">Fecha de Nacimiento</label>
          <input
            type="date"
            name="fechaNacimiento"
            value={formData.fechaNacimiento}
            onChange={handleChange}
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
              errors.fechaNacimiento ? 'border-red-500' : ''
            }`}
          />
          {errors.fechaNacimiento && (
            <p className="text-red-500 text-sm mt-1">{errors.fechaNacimiento}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-2">Ciudad</label>
        <input
          type="text"
          name="ciudad"
          value={formData.ciudad}
          onChange={handleChange}
          placeholder="Ej: Bogotá"
          className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
            errors.ciudad ? 'border-red-500' : ''
          }`}
        />
        {errors.ciudad && (
          <p className="text-red-500 text-sm mt-1">{errors.ciudad}</p>
        )}
      </div>

      {/* SECCIÓN SALUD */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🏥 Información de Salud</h3>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">EPS</label>
          <input
            type="text"
            name="eps"
            value={formData.eps}
            onChange={handleChange}
            placeholder="Ej: Sanitas, Axa, Colsanitas"
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
              errors.eps ? 'border-red-500' : ''
            }`}
          />
          {errors.eps && (
            <p className="text-red-500 text-sm mt-1">{errors.eps}</p>
          )}
        </div>
      </div>

      {/* SECCIÓN EMERGENCIA */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🚨 Contacto de Emergencia</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Nombre</label>
            <input
              type="text"
              name="emergenciaNombre"
              value={formData.emergenciaNombre}
              onChange={handleChange}
              placeholder="Nombre del contacto"
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                errors.emergenciaNombre ? 'border-red-500' : ''
              }`}
            />
            {errors.emergenciaNombre && (
              <p className="text-red-500 text-sm mt-1">{errors.emergenciaNombre}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Teléfono</label>
            <input
              type="text"
              name="emergenciaTelefono"
              value={formData.emergenciaTelefono}
              onChange={handleChange}
              placeholder="Ej: 3001234567"
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                errors.emergenciaTelefono ? 'border-red-500' : ''
              }`}
            />
            {errors.emergenciaTelefono && (
              <p className="text-red-500 text-sm mt-1">{errors.emergenciaTelefono}</p>
            )}
          </div>
        </div>
      </div>

      {/* SECCIÓN FAMILIAR */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">👨‍👩‍👧 Contacto Familiar</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Nombre</label>
            <input
              type="text"
              name="familiarNombre"
              value={formData.familiarNombre}
              onChange={handleChange}
              placeholder="Nombre del familiar"
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                errors.familiarNombre ? 'border-red-500' : ''
              }`}
            />
            {errors.familiarNombre && (
              <p className="text-red-500 text-sm mt-1">{errors.familiarNombre}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Relación</label>
            <input
              type="text"
              name="familiarRelacion"
              value={formData.familiarRelacion}
              onChange={handleChange}
              placeholder="Ej: Hija, Hijo, Nieto"
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                errors.familiarRelacion ? 'border-red-500' : ''
              }`}
            />
            {errors.familiarRelacion && (
              <p className="text-red-500 text-sm mt-1">{errors.familiarRelacion}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Teléfono</label>
            <input
              type="text"
              name="familiarTelefono"
              value={formData.familiarTelefono}
              onChange={handleChange}
              placeholder="Ej: 3001234567"
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                errors.familiarTelefono ? 'border-red-500' : ''
              }`}
            />
            {errors.familiarTelefono && (
              <p className="text-red-500 text-sm mt-1">{errors.familiarTelefono}</p>
            )}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || checkingEmail}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? 'Enviando código...' : 'Enviar Código de Verificación'}
      </button>
    </form>
  );
}
