'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Step1Form from './components/step1-form';
import Step2Form from './components/step2-form';
import Step2BContratosForm from './components/step2b-contratos-form';
import Step3Form from './components/step3-form';

export default function InscribirPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    nombreAbuelo: '',
    apellidoAbuelo: '',
    email: '',
    telefono: '',
    fechaNacimiento: '',
    ciudad: '',
    terminosAceptados: false,
    politicaPrivacidadAceptada: false,
    sponsorContractAceptado: false,
    participantContractAceptado: false,
    sponsorFirma: '',
    participantFirma: '',
    planSeleccionado: 'individual',
  });
  const router = useRouter();

  const handleStep1Submit = (data: any) => {
    // Verificar que el usuario tiene auth_token (pasó por OTP)
    const token = localStorage.getItem('auth_token');

    if (!token) {
      alert('Debes completar la verificación de OTP primero.');
      router.push('/signin');
      return;
    }

    setFormData(prev => ({
      ...prev,
      nombreAbuelo: data.nombreAbuelo,
      apellidoAbuelo: data.apellidoAbuelo,
      email: data.email,
      telefono: data.telefono,
      fechaNacimiento: data.fechaNacimiento,
      ciudad: data.ciudad,
    }));
    setCurrentStep(2);
  };

  const handleStep2Submit = (data: any) => {
    setFormData(prev => ({
      ...prev,
      terminosAceptados: data.terminosAceptados,
      politicaPrivacidadAceptada: data.politicaPrivacidadAceptada,
    }));
    setCurrentStep(3);
  };

  const handleStep2BSubmit = async (data: any) => {
    setFormData(prev => ({
      ...prev,
      sponsorContractAceptado: data.sponsorContractAceptado,
      participantContractAceptado: data.participantContractAceptado,
      sponsorFirma: data.sponsorFirma,
      participantFirma: data.participantFirma,
    }));
    // Guardar contratos en API y esperar resultado
    const result = await saveContracts(data);
    if (result.success) {
      setCurrentStep(4);
    } else {
      console.error('No se pudieron guardar los contratos. Intenta de nuevo.');
      // Aquí se podría mostrar un toast/error al usuario
    }
  };

  const saveContracts = async (data: any): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch('/api/contratos/guardar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuarioId: formData.email, // Usar email como ID temporal
          email: formData.email,
          sponsorContractAceptado: data.sponsorContractAceptado,
          participantContractAceptado: data.participantContractAceptado,
          sponsorFirma: data.sponsorFirma,
          participantFirma: data.participantFirma,
        }),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('Error guardando contratos:', responseData);
        return { success: false, message: responseData.error || 'Error desconocido' };
      }
      
      return { success: true, message: 'Contratos guardados correctamente' };
    } catch (error: any) {
      console.error('Error al guardar contratos:', error);
      return { success: false, message: error.message };
    }
  };

  const handleStep3Submit = async (data: any) => {
    try {
      setFormData(prev => ({
        ...prev,
        planSeleccionado: data.planSeleccionado,
      }));

      const datosCompletos = {
        // Paso 1
        nombreAbuelo: formData.nombreAbuelo,
        apellidoAbuelo: formData.apellidoAbuelo,
        email: formData.email,
        telefono: formData.telefono,
        fechaNacimiento: formData.fechaNacimiento,
        ciudad: formData.ciudad,

        // Paso 2
        terminosAceptados: formData.terminosAceptados,
        politicaPrivacidadAceptada: formData.politicaPrivacidadAceptada,

        // Paso 3
        sponsorContractAceptado: formData.sponsorContractAceptado,
        participantContractAceptado: formData.participantContractAceptado,
        sponsorFirma: formData.sponsorFirma,
        participantFirma: formData.participantFirma,

        // Paso 4
        planSeleccionado: data.planSeleccionado,
      };

      console.log('Datos completos para guardar:', datosCompletos);

      // PASO 1: Registrar usuario (crear en BD)
      console.log('Registrando usuario...');
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          nombreAbuelo: formData.nombreAbuelo,
          apellidoAbuelo: formData.apellidoAbuelo,
          telefono: formData.telefono,
        }),
      });

      const registerData = await registerResponse.json();

      if (!registerResponse.ok) {
        // Si el usuario ya existe, continuar (no es error)
        if (registerResponse.status === 409) {
          console.log('Usuario ya existe, continuando...');
        } else {
          throw new Error(registerData.error || 'Error registrando usuario');
        }
      } else {
        console.log('Usuario registrado exitosamente:', registerData);
        // Guardar token en localStorage si se retorna
        if (registerData.token) {
          localStorage.setItem('auth_token', registerData.token);
          localStorage.setItem('auth_email', formData.email);
        }
      }

      // PASO 2: Crear suscripción
      console.log('Creando suscripción...');
      const token = localStorage.getItem('auth_token') || '';

      const subscripcionResponse = await fetch('/api/suscripcion/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: formData.email,
          planSeleccionado: data.planSeleccionado,
        }),
      });

      const subscripcionData = await subscripcionResponse.json();

      if (!subscripcionResponse.ok) {
        console.error('Error creando suscripción:', subscripcionData);
        throw new Error(subscripcionData.error || 'No se pudo crear la suscripción');
      }

      console.log('Suscripción creada exitosamente:', subscripcionData);

      // PASO 3: Ir a /familia
      console.log('Redirigiendo a /familia...');
      router.push('/familia');
    } catch (error: any) {
      console.error('Error en handleStep3Submit:', error);
      alert(
        'Error completando registro: ' +
          (error.message || 'Por favor intenta de nuevo')
      );
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
        {/* Back Button */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-blue-500 hover:text-blue-600 font-medium mb-4"
          >
            ← Atrás
          </button>
        </div>

        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Únete a Grupo Plateado
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Paso {currentStep} de 4 • {Math.round((currentStep / 4) * 100)}% completado
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 sm:mb-10">
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / 4) * 100}%` }}
              role="progressbar"
              aria-valuenow={currentStep}
              aria-valuemin={1}
              aria-valuemax={4}
            ></div>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between mb-8 sm:mb-12">
          {[1, 2, 3, 4].map((step, idx) => (
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
              <Step2BContratosForm onSubmit={handleStep2BSubmit} initialData={formData} />
            )}
            {currentStep === 4 && (
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
            {currentStep === 2 && '✓ Acepta los términos y condiciones'}
            {currentStep === 3 && '✍️ Acepta contratos legales con firma digital'}
            {currentStep === 4 && '💳 Selecciona tu plan'}
          </p>
        </div>

        {/* Mobile Help */}
        <div className="mt-12 sm:mt-16 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-500">
          <p>¿Necesitas ayuda? Contacta a servicioalcliente@tardesdelcafe.com</p>
        </div>
      </div>
    </div>
  );
}
