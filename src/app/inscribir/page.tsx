'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Step1Form from './components/step1-form';
import Step2Form from './components/step2-form';
import Step3Form from './components/step3-form';

export default function InscribirPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // PASO 1
    nombreAbuelo: '',
    apellidoAbuelo: '',
    email: '',
    telefono: '',
    fechaNacimiento: '',
    documentoId: '',
    ciudad: '',
    // PASO 2
    terminosAceptados: false,
    politicaPrivacidadAceptada: false,
    familiarRelacion: '',
    familiarNombre: '',
    familiarEmail: '',
    familiarTelefono: '',
    eps: '',
    numeroAfiliadoEps: '',
    contratoAceptado: false,
    // PASO 3
    planSeleccionado: 'individual',
    terminosAceptado: false,
    contratoAceptado: false,
    politicaPrivacidadAceptado: false,
    firma: '',
    password: '',
    passwordConfirm: '',
  });
  const router = useRouter();

  const handleStep1Submit = (data: any) => {
    setFormData(prev => ({
      ...prev,
      nombreAbuelo: data.nombreAbuelo,
      apellidoAbuelo: data.apellidoAbuelo,
      email: data.email,
      telefono: data.telefono,
      fechaNacimiento: data.fechaNacimiento,
      documentoId: data.documentoId,
      ciudad: data.ciudad,
    }));
    setCurrentStep(2);
  };

  const handleStep2Submit = (data: any) => {
    setFormData(prev => ({
      ...prev,
      terminosAceptados: data.terminosAceptados,
      politicaPrivacidadAceptada: data.politicaPrivacidadAceptada,
      familiarRelacion: data.familiarRelacion,
      familiarNombre: data.familiarNombre,
      familiarEmail: data.familiarEmail,
      familiarTelefono: data.familiarTelefono,
      eps: data.eps,
      numeroAfiliadoEps: data.numeroAfiliadoEps,
      contratoAceptado: data.contratoAceptado,
    }));
    setCurrentStep(3);
  };

  const handleStep3Submit = async (data: any) => {
    const datosCompletos = {
      // PASO 1
      nombre: formData.nombreAbuelo,
      apellido: formData.apellidoAbuelo,
      email: formData.email,
      telefono: formData.telefono,
      fechaNacimiento: formData.fechaNacimiento,
      documentoId: formData.documentoId,
      ciudad: formData.ciudad,

      // PASO 2
      terminosAceptados: formData.terminosAceptados,
      politicaPrivacidadAceptada: formData.politicaPrivacidadAceptada,
      familiarRelacion: formData.familiarRelacion,
      familiarNombre: formData.familiarNombre,
      familiarEmail: formData.familiarEmail,
      familiarTelefono: formData.familiarTelefono,
      eps: formData.eps,
      numeroAfiliadoEps: formData.numeroAfiliadoEps,

      // PASO 3
      planSeleccionado: data.planSeleccionado,
      terminosAceptado: data.terminosAceptado,
      contratoAceptado: data.contratoAceptado,
      politicaPrivacidadAceptado: data.politicaPrivacidadAceptado,
      firma: data.firma,
      password: data.password,
    };

    try {
      console.log('Datos completos:', datosCompletos);

      // Llamar tu API endpoint para crear usuario
      const response = await fetch('/api/auth/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosCompletos),
      });

      if (response.ok) {
        router.push('/pagar');
      } else {
        const error = await response.json();
        console.error('Error:', error);
        alert(`Error al crear la cuenta: ${error.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar la solicitud');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-950 dark:to-blue-950 py-12 px-4 sm:py-16">
      <div className="max-w-2xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Únete a ClubSenior
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Paso {currentStep} de 3 • {Math.round((currentStep / 3) * 100)}% completado
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 sm:mb-10">
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / 3) * 100}%` }}
              role="progressbar"
              aria-valuenow={currentStep}
              aria-valuemin={1}
              aria-valuemax={3}
            ></div>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between mb-8 sm:mb-12">
          {[1, 2, 3].map((step, idx) => (
            <div key={step} className="flex items-center flex-1">
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-base transition-all duration-300 ${
                  step === currentStep
                    ? 'bg-blue-600 text-white shadow-lg scale-110'
                    : step < currentStep
                    ? 'bg-green-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {step < currentStep ? '✓' : step}
              </div>
              {idx < 2 && (
                <div
                  className={`flex-1 h-1 mx-2 rounded-full transition-all duration-300 ${
                    step < currentStep
                      ? 'bg-green-500'
                      : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="card-elevated p-6 sm:p-8 animate-fade-in-up">
          <div className="min-h-[400px] sm:min-h-[500px]">
            {currentStep === 1 && (
              <Step1Form onSubmit={handleStep1Submit} initialData={formData} />
            )}
            {currentStep === 2 && (
              <Step2Form onSubmit={handleStep2Submit} initialData={formData} />
            )}
            {currentStep === 3 && (
              <Step3Form onSubmit={handleStep3Submit} initialData={formData} />
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-8 sm:gap-4">
            <button
              onClick={handleBack}
              className="btn-secondary flex-1 py-2.5 sm:py-3 text-sm sm:text-base"
              disabled={currentStep === 1}
              aria-label="Ir al paso anterior"
            >
              ← Atrás
            </button>
          </div>
        </div>

        {/* Step Description */}
        <div className="mt-8 text-center">
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            {currentStep === 1 && '📋 Información básica del adulto mayor'}
            {currentStep === 2 && '👨‍👩‍👧 Información de familia y salud'}
            {currentStep === 3 && '✍️ Contrato, firma digital y contraseña'}
          </p>
        </div>

        {/* Mobile Help */}
        <div className="mt-12 sm:mt-16 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-500">
          <p>¿Necesitas ayuda? Contacta a soporte@clubsenior.com.co</p>
        </div>
      </div>
    </div>
  );
}
