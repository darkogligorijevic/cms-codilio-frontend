'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  Settings, 
  User, 
  Globe,
  Mail,
  Shield,
  Loader2
} from 'lucide-react';
import { setupApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useSetup } from '@/lib/setup-context';
import { CompleteSetupDto } from '@/lib/types';
import { toast } from 'sonner';

const STEPS = [
  {
    id: 'welcome',
    title: 'Dobrodošli',
    description: 'Konfigurišimo vaš CMS'
  },
  {
    id: 'site',
    title: 'Informacije o sajtu',
    description: 'Osnovne informacije'
  },
  {
    id: 'admin',
    title: 'Administrator',
    description: 'Kreiranje admin naloga'
  },
  {
    id: 'contact',
    title: 'Kontakt',
    description: 'Kontakt informacije'
  },
  {
    id: 'complete',
    title: 'Završeno',
    description: 'Setup je završen'
  }
];

export function SetupWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const { checkSetupStatus } = useSetup();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger
  } = useForm<CompleteSetupDto>();

  const nextStep = async () => {
    let fieldsToValidate: (keyof CompleteSetupDto)[] = [];
    
    switch (currentStep) {
      case 1: // Site info
        fieldsToValidate = ['siteName', 'siteTagline'];
        break;
      case 2: // Admin
        fieldsToValidate = ['adminName', 'adminEmail', 'adminPassword'];
        break;
      case 3: // Contact
        fieldsToValidate = ['contactEmail'];
        break;
    }

    if (fieldsToValidate.length > 0) {
      const isValid = await trigger(fieldsToValidate);
      if (!isValid) return;
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: CompleteSetupDto) => {
    try {
      setIsSubmitting(true);
      
      const result = await setupApi.completeSetup(data);
      
      if (result.success) {
        // Auto-login the created admin user
        localStorage.setItem('access_token', result.access_token);
        localStorage.setItem('user', JSON.stringify(result.user));
        
        // Update auth context
        await login({ email: data.adminEmail, password: data.adminPassword });
        
        // Update setup status
        await checkSetupStatus();
        
        setCurrentStep(4); // Go to completion step
        toast.success('Setup je uspešno završen! Dobrodošli u CodilioCMS.');
      }
    } catch (error: any) {
      console.error('Setup error:', error);
      toast.error(error.response?.data?.message || 'Greška prilikom setup-a');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Welcome
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <Settings className="h-10 w-10 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Dobrodošli u CodilioCMS
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Konfigurišimo vaš Content Management System u nekoliko jednostavnih koraka. 
                Ovo će potrajati samo nekoliko minuta.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Brza instalacija</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Sigurno</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Jednostavno</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Prilagodljivo</span>
              </div>
            </div>
          </div>
        );

      case 1: // Site Information
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Globe className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Informacije o sajtu</h2>
              <p className="text-gray-600">Osnovne informacije o vašoj instituciji</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="siteName">Naziv sajta *</Label>
                <Input
                  id="siteName"
                  {...register('siteName', { 
                    required: 'Naziv sajta je obavezan',
                    maxLength: { value: 100, message: 'Maksimalno 100 karaktera' }
                  })}
                  placeholder="Lokalna samouprava Stari Grad"
                  className={errors.siteName ? 'border-red-500' : ''}
                />
                {errors.siteName && (
                  <p className="text-red-500 text-sm mt-1">{errors.siteName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="siteTagline">Slogan/Opis sajta *</Label>
                <Textarea
                  id="siteTagline"
                  {...register('siteTagline', { 
                    required: 'Slogan je obavezan',
                    maxLength: { value: 200, message: 'Maksimalno 200 karaktera' }
                  })}
                  placeholder="Transparentnost i dostupnost u službi građana"
                  rows={3}
                  className={errors.siteTagline ? 'border-red-500' : ''}
                />
                {errors.siteTagline && (
                  <p className="text-red-500 text-sm mt-1">{errors.siteTagline.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 2: // Admin User
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Administrator nalog</h2>
              <p className="text-gray-600">Kreirajte svoj admin nalog</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="adminName">Puno ime *</Label>
                <Input
                  id="adminName"
                  {...register('adminName', { 
                    required: 'Ime je obavezno',
                    maxLength: { value: 100, message: 'Maksimalno 100 karaktera' }
                  })}
                  placeholder="Marko Petrović"
                  className={errors.adminName ? 'border-red-500' : ''}
                />
                {errors.adminName && (
                  <p className="text-red-500 text-sm mt-1">{errors.adminName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="adminEmail">Email adresa *</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  {...register('adminEmail', { 
                    required: 'Email je obavezan',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Neispravna email adresa'
                    }
                  })}
                  placeholder="admin@mojainstitucija.rs"
                  className={errors.adminEmail ? 'border-red-500' : ''}
                />
                {errors.adminEmail && (
                  <p className="text-red-500 text-sm mt-1">{errors.adminEmail.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="adminPassword">Lozinka *</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  {...register('adminPassword', { 
                    required: 'Lozinka je obavezna',
                    minLength: { value: 6, message: 'Minimum 6 karaktera' },
                    maxLength: { value: 50, message: 'Maksimalno 50 karaktera' }
                  })}
                  placeholder="••••••••"
                  className={errors.adminPassword ? 'border-red-500' : ''}
                />
                {errors.adminPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.adminPassword.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Koristićete ove podatke za prijavljivanje u admin panel
                </p>
              </div>
            </div>
          </div>
        );

      case 3: // Contact
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Kontakt informacije</h2>
              <p className="text-gray-600">Email za kontakt forme i obaveštenja</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="contactEmail">Kontakt email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  {...register('contactEmail', { 
                    required: 'Kontakt email je obavezan',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Neispravna email adresa'
                    }
                  })}
                  placeholder="info@mojainstitucija.rs"
                  className={errors.contactEmail ? 'border-red-500' : ''}
                />
                {errors.contactEmail && (
                  <p className="text-red-500 text-sm mt-1">{errors.contactEmail.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Na ovaj email će stizati poruke sa kontakt forme
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  💡 Napredna podešavanja
                </h4>
                <p className="text-sm text-blue-700">
                  Nakon setup-a možete podesiti dodatne opcije kao što su SMTP konfiguracija, 
                  socialne mreže, SEO podešavanja i mnogo više u admin panelu.
                </p>
              </div>
            </div>
          </div>
        );

      case 4: // Complete
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Setup je završen!
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Vaš CodilioCMS je uspešno konfigurisan. Automatski ste prijavljeni kao administrator.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
              <Card className="p-4">
                <h4 className="font-medium mb-2">Sledeći koraci</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Dodajte objave i stranice</li>
                  <li>• Konfigurišite dodatna podešavanja</li>
                  <li>• Prilagodite dizajn</li>
                </ul>
              </Card>
              <Card className="p-4">
                <h4 className="font-medium mb-2">Korisni resursi</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Dokumentacija</li>
                  <li>• Email podrška</li>
                  <li>• Zajednica korisnika</li>
                </ul>
              </Card>
            </div>
            <Button 
              size="lg"
              onClick={() => window.location.href = '/dashboard'}
              className="mt-6"
            >
              <Shield className="mr-2 h-4 w-4" />
              Idite u admin panel
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${index <= currentStep 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                  }
                `}>
                  {index < currentStep ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`
                    w-full h-1 mx-2
                    ${index < currentStep ? 'bg-blue-600' : 'bg-gray-200'}
                  `} />
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 text-center">
            <h3 className="text-sm font-medium text-gray-900">
              {STEPS[currentStep].title}
            </h3>
            <p className="text-xs text-gray-500">
              {STEPS[currentStep].description}
            </p>
          </div>
        </div>

        {/* Main Card */}
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-lg">Korak {currentStep + 1} od {STEPS.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              {renderStepContent()}

              {/* Navigation Buttons */}
              {currentStep < 4 && (
                <div className="flex justify-between mt-8 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Nazad
                  </Button>

                  {currentStep === 3 ? (
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="min-w-[120px]"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Završavam...
                        </>
                      ) : (
                        <>
                          Završi setup
                          <CheckCircle className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button 
                      type="button" 
                      onClick={nextStep}
                    >
                      Dalje
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            CodilioCMS &copy; 2024 - Content Management System za lokalne institucije
          </p>
        </div>
      </div>
    </div>
  );
}