'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Step1Form from './components/step1-form';
import Step2Form from './components/step2-form';
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
    planSeleccionado: 'individual',
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

  const handleStep3Submit = (data: any) => {
    setFormData(prev => ({
      ...prev,
      planSeleccionado: data.planSeleccionado,
    }));
    console.log('Datos completos:', { ...formData, ...data });
    router.push('/familia');
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">
              Paso {currentStep} de 3
            </span>
            <span className="text-sm text-gray-600">{Math.round((currentStep / 3) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="flex justify-between mb-8">
          {[1, 2, 3].map(step => (
            <div
              key={step}
              className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold ${
                step === currentStep
                  ? 'bg-blue-600 text-white'
                  : step < currentStep
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}
            >
              {step < currentStep ? '✓' : step}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {currentStep === 1 && (
            <Step1Form onSubmit={handleStep1Submit} initialData={formData} />
          )}
          {currentStep === 2 && (
            <Step2Form onSubmit={handleStep2Submit} initialData={formData} />
          )}
          {currentStep === 3 && (
            <Step3Form onSubmit={handleStep3Submit} initialData={formData} />
          )}

          <div className="flex gap-4 mt-8">
            <button
              onClick={handleBack}
              className="flex-1 px-6 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              disabled={currentStep === 1}
            >
              Atrás
            </button>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-600">
          {currentStep === 1 && <p>Información básica del adulto mayor</p>}
          {currentStep === 2 && <p>Acepta los términos y condiciones</p>}
          {currentStep === 3 && <p>Selecciona tu plan y completa el pago</p>}
        </div>
      </div>
    </div>
  );
}
