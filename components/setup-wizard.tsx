'use client';

import { useState, useEffect } from 'react';
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
  Loader2,
  Palette,
  Phone,
  MapPin,
  Clock,
  Building,
  Sparkles,
  Check,
  X,
  Info,
  Star,
  Lightbulb,
  Rocket,
  Target,
  Zap,
  Heart,
  Eye,
  Sun,
  Moon,
  Wifi,
  Lock,
  Database,
  Search,
  Bell,
  Image,
  Users,
  FileText,
  Share2,
  BarChart3
} from 'lucide-react';
import { CompleteSetupDto } from '@/lib/types';
import { toast } from 'sonner';
import { settingsApi, setupApi } from '@/lib/api';

const STEPS = [
  {
    id: 'welcome',
    title: 'Dobrodošli',
    subtitle: 'Konfigurišimo vaš CMS',
    description: 'Kreiraćemo vaš profesionalni portal u 5 minuta',
    icon: Sparkles,
    color: 'from-violet-500 to-purple-600'
  },
  {
    id: 'site',
    title: 'Osnove sajta',
    subtitle: 'Identitet vaše institucije',
    description: 'Naziv, logo i osnovne informacije',
    icon: Building,
    color: 'from-blue-500 to-cyan-600'
  },
  {
    id: 'admin',
    title: 'Administrator',
    subtitle: 'Vaš admin nalog',
    description: 'Kreiranje sigurnog pristupa',
    icon: Shield,
    color: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'contact',
    title: 'Kontakt podaci',
    subtitle: 'Kako vas mogu kontaktirati',
    description: 'Email, telefon i adresa',
    icon: Phone,
    color: 'from-orange-500 to-red-600'
  },
  {
    id: 'appearance',
    title: 'Izgled',
    subtitle: 'Personalizujte dizajn',
    description: 'Boje, fontovi i stil',
    icon: Palette,
    color: 'from-pink-500 to-rose-600'
  },
  {
    id: 'features',
    title: 'Funkcionalnosti',
    subtitle: 'Šta želite da omogućite',
    description: 'Email, komentari, analitika',
    icon: Target,
    color: 'from-indigo-500 to-purple-600'
  },
  {
    id: 'complete',
    title: 'Gotovo!',
    subtitle: 'Vaš CMS je spreman',
    description: 'Možete početi da koristite sistem',
    icon: Rocket,
    color: 'from-green-500 to-emerald-600'
  }
];

interface EnhancedSetupFormData extends CompleteSetupDto {
  // Appearance
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  darkMode: boolean;
  
  // Contact details
  phone?: string;
  address?: string;
  workingHours?: string;
  
  // Features
  enableComments: boolean;
  enableNewsletter: boolean;
  enableAnalytics: boolean;
  maintenanceMode: boolean;
  
  // Social media
  facebook?: string;
  twitter?: string;
  instagram?: string;
  
  // Email settings
  smtpHost?: string;
  smtpPort?: string;
  smtpUser?: string;
}

export function SetupWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
    setValue,
    getValues
  } = useForm<EnhancedSetupFormData>({
    defaultValues: {
      primaryColor: '#3B82F6',
      secondaryColor: '#10B981',
      fontFamily: 'Inter',
      darkMode: false,
      enableComments: false,
      enableNewsletter: true,
      enableAnalytics: false,
      maintenanceMode: false,
      workingHours: 'Ponedeljak - Petak: 08:00 - 16:00'
    }
  });

  const currentStepData = STEPS[currentStep];
  const watchedValues = watch();

  // Mark step as completed when moving forward
  const nextStep = async () => {
    console.log('🚀 nextStep called, currentStep:', currentStep);
    
    let fieldsToValidate: (keyof EnhancedSetupFormData)[] = [];
    
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
      case 4: // Appearance - optional
      case 5: // Features - optional
        console.log('📝 Optional step, no validation needed');
        break;
    }

    console.log('🔍 Fields to validate:', fieldsToValidate);

    if (fieldsToValidate.length > 0) {
      const isValid = await trigger(fieldsToValidate);
      console.log('✅ Validation result:', isValid);
      if (!isValid) {
        console.log('❌ Validation failed, stopping');
        return;
      }
    }

    // Mark current step as completed
    if (!completedSteps.includes(currentStep)) {
      console.log('✅ Marking step as completed:', currentStep);
      setCompletedSteps(prev => [...prev, currentStep]);
    }

    // KRITIČNA IZMENA: Eksplicitno zaustavi napredovanje na koraku 5
    if (currentStep >= 5) {
      console.log('🛑 Reached step 5 or higher, stopping auto-advance');
      return;
    }

    // Samo za korake 0-4, dozvoli automatsko napredovanje
    const nextStepIndex = currentStep + 1;
    console.log('🎯 Next step would be:', nextStepIndex);

    if (nextStepIndex <= 5) { // Maksimalno idi do koraka 5
      console.log('➡️ Advancing to step:', nextStepIndex);
      setCurrentStep(nextStepIndex);
    } else {
      console.log('🚫 Cannot advance further, at step:', currentStep);
    }
  };

  // I dodaj ovu funkciju za lakše testiranje
  const debugCurrentState = () => {
    console.log('🐛 DEBUG STATE:');
    console.log('Current step:', currentStep);
    console.log('Completed steps:', completedSteps);
    console.log('Total steps:', STEPS.length);
    console.log('Current step data:', STEPS[currentStep]);
  };
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    console.log(`🎯 goToStep called with stepIndex: ${stepIndex}`);
    console.log(`📊 Current completed steps: [${completedSteps.join(', ')}]`);
    
    // Allow access to:
    // 1. Completed steps
    // 2. Next step after completed steps  
    // 3. Always allow going back to previous steps
    const maxCompletedStep = Math.max(...completedSteps, -1);
    const maxAccessibleStep = maxCompletedStep + 1;
    
    console.log(`✅ Max completed step: ${maxCompletedStep}`);
    console.log(`🚪 Max accessible step: ${maxAccessibleStep}`);
    
    const canAccess = stepIndex <= maxAccessibleStep || stepIndex <= currentStep;
    
    console.log(`🔒 Can access step ${stepIndex}: ${canAccess}`);
    
    if (canAccess) {
      console.log(`➡️ Setting current step to: ${stepIndex}`);
      setCurrentStep(stepIndex);
    } else {
      console.log(`❌ Access denied to step ${stepIndex}`);
    }
  };

  const onSubmit = async (data: EnhancedSetupFormData) => {
    try {
      setIsSubmitting(true);
      
      // Pripremi osnovne setup podatke
      const setupData: CompleteSetupDto = {
        siteName: data.siteName,
        siteTagline: data.siteTagline,
        adminName: data.adminName,
        adminEmail: data.adminEmail,
        adminPassword: data.adminPassword,
        contactEmail: data.contactEmail,
      };
      
      // Pozovi setup API
      const result = await setupApi.completeSetup(setupData);
      
      // Sačuvaj token
      if (result.access_token) {
        localStorage.setItem('access_token', result.access_token);
      }
      
      // Ažuriraj dodatna podešavanja ako su potrebna
      if (data.primaryColor || data.secondaryColor || data.fontFamily) {
        const additionalSettings = [];
        
        if (data.primaryColor) {
          additionalSettings.push({ key: 'theme_primary_color', value: data.primaryColor });
        }
        if (data.secondaryColor) {
          additionalSettings.push({ key: 'theme_secondary_color', value: data.secondaryColor });
        }
        if (data.fontFamily) {
          additionalSettings.push({ key: 'theme_font_family', value: data.fontFamily });
        }
        if (data.phone) {
          additionalSettings.push({ key: 'contact_phone', value: data.phone });
        }
        if (data.address) {
          additionalSettings.push({ key: 'contact_address', value: data.address });
        }
        if (data.workingHours) {
          additionalSettings.push({ key: 'contact_working_hours', value: data.workingHours });
        }
        
        // Dodaj email podešavanja ako su uneta
        if (data.smtpHost) {
          additionalSettings.push({ key: 'email_smtp_host', value: data.smtpHost });
        }
        if (data.smtpPort) {
          additionalSettings.push({ key: 'email_smtp_port', value: data.smtpPort });
        }
        if (data.smtpUser) {
          additionalSettings.push({ key: 'email_smtp_user', value: data.smtpUser });
        }
        
        // Dodaj social media linkove
        if (data.facebook) {
          additionalSettings.push({ key: 'social_facebook', value: data.facebook });
        }
        if (data.twitter) {
          additionalSettings.push({ key: 'social_twitter', value: data.twitter });
        }
        if (data.instagram) {
          additionalSettings.push({ key: 'social_instagram', value: data.instagram });
        }
        
        // Funkcionalnosti
        additionalSettings.push({ key: 'allow_comments', value: data.enableComments.toString() });
        additionalSettings.push({ key: 'theme_dark_mode', value: data.darkMode.toString() });
        
        // Pošalji dodatna podešavanja
        if (additionalSettings.length > 0) {
          try {
            await settingsApi.updateMultiple({ settings: additionalSettings });
          } catch (settingsError) {
            console.warn('Failed to update additional settings:', settingsError);
            // Ne prekidaj setup zbog toga
          }
        }
      }
      
      setCompletedSteps(prev => [...prev, currentStep]);
      setCurrentStep(6); // Idi na completion step
      toast.success('Setup je uspešno završen! Dobrodošli u CodilioCMS.');
      
      // Refresh setup status
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error: any) {
      console.error('Setup error:', error);
      toast.error(error.response?.data?.message || 'Greška prilikom setup-a');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Zameni getStepIcon funkciju u setup-wizard.tsx

  const getStepIcon = (stepIndex: number) => {
    const StepIcon = STEPS[stepIndex].icon;
    const isCompleted = completedSteps.includes(stepIndex);
    const isCurrent = stepIndex === currentStep;
    const isAccessible = stepIndex <= Math.max(...completedSteps, 0) + 1;

    console.log(`🎯 Step ${stepIndex}: completed=${isCompleted}, current=${isCurrent}, accessible=${isAccessible}`);

    return (
      <div
        onClick={() => {
          console.log(`🖱️ Clicked step ${stepIndex}`);
          goToStep(stepIndex);
        }}
        className={`
          relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 group
          ${isCompleted 
            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg cursor-pointer' 
            : isCurrent 
              ? `bg-gradient-to-r ${STEPS[stepIndex].color} text-white shadow-lg scale-110 cursor-pointer` 
              : isAccessible
                ? 'bg-gray-100 text-gray-400 hover:bg-gray-200 cursor-pointer'
                : 'bg-gray-50 text-gray-300 cursor-not-allowed'
          }
        `}
      >
        {isCompleted ? (
          <Check className="w-6 h-6" />
        ) : (
          <StepIcon className={`w-6 h-6 ${isCurrent ? 'animate-pulse' : ''}`} />
        )}
        
        {/* Connecting line */}
        {stepIndex < STEPS.length - 1 && (
          <div className={`
            absolute top-1/2 left-full w-8 h-0.5 -translate-y-1/2
            ${stepIndex < Math.max(...completedSteps, 0) 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
              : 'bg-gray-200'
            }
          `} />
        )}
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Welcome
        return (
          <div className="text-center space-y-8">
            <div className="relative">
              <div className="mx-auto w-32 h-32 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-2xl">
                <Sparkles className="h-16 w-16 text-white animate-pulse" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                <Star className="w-4 h-4 text-yellow-800" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                Dobrodošli u CodilioCMS
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Kreiraćemo profesionalni portal vaše lokalne institucije u svega nekoliko koraka. 
                Proces je brz, siguran i potpuno prilagođen vašim potrebama.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { icon: Zap, title: 'Brza instalacija', desc: '5 minuta' },
                { icon: Shield, title: 'Potpuno sigurno', desc: 'SSL zaštićeno' },
                { icon: Heart, title: 'Jednostavno', desc: 'Bez tehničkih znanja' },
                { icon: Target, title: 'Prilagodljivo', desc: 'Za sve institucije' }
              ].map((feature, index) => (
                <div key={index} className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all">
                  <feature.icon className="h-8 w-8 text-violet-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.desc}</p>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-100">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Lightbulb className="h-5 w-5 text-violet-600" />
                <span className="text-sm font-medium text-violet-800">Pro tip</span>
              </div>
              <p className="text-violet-700 text-sm">
                Pripremite logo vaše institucije (PNG ili JPG format) i osnovne kontakt informacije 
                da biste ubrzali proces konfiguracije.
              </p>
            </div>
          </div>
        );

      case 1: // Site Information
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mb-6 shadow-xl">
                <Building className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Identitet vaše institucije</h2>
              <p className="text-gray-600">Osnovne informacije koje će se prikazivati na vašem portalu</p>
            </div>

            <div className="grid gap-6 max-w-2xl mx-auto">
              <div className="space-y-2">
                <Label htmlFor="siteName" className="flex items-center space-x-2">
                  <Building className="w-4 h-4 text-blue-600" />
                  <span>Naziv institucije *</span>
                </Label>
                <Input
                  id="siteName"
                  {...register('siteName', { 
                    required: 'Naziv je obavezan',
                    maxLength: { value: 100, message: 'Maksimalno 100 karaktera' }
                  })}
                  placeholder="npr. Opština Mladenovac"
                  className={`h-12 ${errors.siteName ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                />
                {errors.siteName && (
                  <p className="text-red-500 text-sm flex items-center space-x-1">
                    <X className="w-4 h-4" />
                    <span>{errors.siteName.message}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteTagline" className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Slogan/Opis *</span>
                </Label>
                <Textarea
                  id="siteTagline"
                  {...register('siteTagline', { 
                    required: 'Opis je obavezan',
                    maxLength: { value: 200, message: 'Maksimalno 200 karaktera' }
                  })}
                  placeholder="npr. Transparentnost i dostupnost u službi građana"
                  rows={3}
                  className={errors.siteTagline ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}
                />
                {errors.siteTagline && (
                  <p className="text-red-500 text-sm flex items-center space-x-1">
                    <X className="w-4 h-4" />
                    <span>{errors.siteTagline.message}</span>
                  </p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex space-x-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 mb-1">💡 Saveti za dobar naziv</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Koristite zvanični naziv vaše institucije</li>
                      <li>• Kratko i jasno - lakše za pamćenje</li>
                      <li>• Izbegavajte skraćenice koje nisu opšte poznate</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2: // Admin User
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mb-6 shadow-xl">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Vaš administrator nalog</h2>
              <p className="text-gray-600">Kreiraćemo siguran pristup za upravljanje portalom</p>
            </div>

            <div className="grid gap-6 max-w-2xl mx-auto">
              <div className="space-y-2">
                <Label htmlFor="adminName" className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>Puno ime *</span>
                </Label>
                <Input
                  id="adminName"
                  {...register('adminName', { 
                    required: 'Ime je obavezno',
                    maxLength: { value: 100, message: 'Maksimalno 100 karaktera' }
                  })}
                  placeholder="Marko Petrović"
                  className={`h-12 ${errors.adminName ? 'border-red-500' : 'focus:border-emerald-500'}`}
                />
                {errors.adminName && (
                  <p className="text-red-500 text-sm flex items-center space-x-1">
                    <X className="w-4 h-4" />
                    <span>{errors.adminName.message}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminEmail" className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-emerald-600" />
                  <span>Email adresa *</span>
                </Label>
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
                  className={`h-12 ${errors.adminEmail ? 'border-red-500' : 'focus:border-emerald-500'}`}
                />
                {errors.adminEmail && (
                  <p className="text-red-500 text-sm flex items-center space-x-1">
                    <X className="w-4 h-4" />
                    <span>{errors.adminEmail.message}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminPassword" className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <span>Lozinka *</span>
                </Label>
                <Input
                  id="adminPassword"
                  type="password"
                  {...register('adminPassword', { 
                    required: 'Lozinka je obavezna',
                    minLength: { value: 6, message: 'Minimum 6 karaktera' },
                    maxLength: { value: 50, message: 'Maksimalno 50 karaktera' }
                  })}
                  placeholder="••••••••"
                  className={`h-12 ${errors.adminPassword ? 'border-red-500' : 'focus:border-emerald-500'}`}
                />
                {errors.adminPassword && (
                  <p className="text-red-500 text-sm flex items-center space-x-1">
                    <X className="w-4 h-4" />
                    <span>{errors.adminPassword.message}</span>
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Koristićete ove podatke za prijavljivanje u admin panel
                </p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex space-x-3">
                  <Shield className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-emerald-900 mb-1">🔒 Sigurnost na prvom mestu</h4>
                    <ul className="text-sm text-emerald-700 space-y-1">
                      <li>• Koristite jaku lozinku (najmanje 8 karaktera)</li>
                      <li>• Kombinujte slova, brojeve i simbole</li>
                      <li>• Nikad ne delite pristupne podatke</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3: // Contact
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mb-6 shadow-xl">
                <Phone className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Kontakt informacije</h2>
              <p className="text-gray-600">Kako vas građani mogu kontaktirati</p>
            </div>

            <div className="grid gap-6 max-w-2xl mx-auto">
              <div className="space-y-2">
                <Label htmlFor="contactEmail" className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-orange-600" />
                  <span>Glavni email *</span>
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  {...register('contactEmail', { 
                    required: 'Email je obavezan',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Neispravna email adresa'
                    }
                  })}
                  placeholder="info@mojainstitucija.rs"
                  className={`h-12 ${errors.contactEmail ? 'border-red-500' : 'focus:border-orange-500'}`}
                />
                {errors.contactEmail && (
                  <p className="text-red-500 text-sm flex items-center space-x-1">
                    <X className="w-4 h-4" />
                    <span>{errors.contactEmail.message}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-orange-600" />
                  <span>Telefon</span>
                </Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="+381 11 123 4567"
                  className="h-12 focus:border-orange-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-orange-600" />
                  <span>Adresa</span>
                </Label>
                <Textarea
                  id="address"
                  {...register('address')}
                  placeholder="Trg Republike 1, 11000 Beograd"
                  rows={2}
                  className="focus:border-orange-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workingHours" className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span>Radno vreme</span>
                </Label>
                <Input
                  id="workingHours"
                  {...register('workingHours')}
                  placeholder="Ponedeljak - Petak: 08:00 - 16:00"
                  className="h-12 focus:border-orange-500"
                />
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <div className="flex space-x-3">
                  <Bell className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-orange-900 mb-1">📧 Napomena</h4>
                    <p className="text-sm text-orange-700">
                      Na glavni email će stizati sve poruke sa kontakt forme. 
                      Ostale informacije su opcione i možete ih dodati kasnije.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4: // Appearance
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full flex items-center justify-center mb-6 shadow-xl">
                <Palette className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Vizuelni identitet</h2>
              <p className="text-gray-600">Prilagodite boje i stil portala</p>
            </div>

            <div className="grid gap-8 max-w-2xl mx-auto">
              {/* Color Scheme */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Palette className="w-5 h-5 text-pink-600" />
                  <span>Paleta boja</span>
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primarna boja</Label>
                    <div className="flex items-center space-x-3">
                      <input
                        id="primaryColor"
                        type="color"
                        {...register('primaryColor')}
                        className="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
                      />
                      <Input
                        value={watchedValues.primaryColor}
                        onChange={(e) => setValue('primaryColor', e.target.value)}
                        placeholder="#3B82F6"
                        className="flex-1 h-12"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Sekundarna boja</Label>
                    <div className="flex items-center space-x-3">
                      <input
                        id="secondaryColor"
                        type="color"
                        {...register('secondaryColor')}
                        className="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
                      />
                      <Input
                        value={watchedValues.secondaryColor}
                        onChange={(e) => setValue('secondaryColor', e.target.value)}
                        placeholder="#10B981"
                        className="flex-1 h-12"
                      />
                    </div>
                  </div>
                </div>

                {/* Color Preview */}
                <div className="bg-gray-50 rounded-xl p-4 border-2 border-dashed border-gray-200">
                  <h4 className="text-sm font-medium mb-3">Pregled boja</h4>
                  <div className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-8 h-8 rounded-lg border"
                        style={{ backgroundColor: watchedValues.primaryColor }}
                      />
                      <span className="text-sm">Primarna</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-8 h-8 rounded-lg border"
                        style={{ backgroundColor: watchedValues.secondaryColor }}
                      />
                      <span className="text-sm">Sekundarna</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Font Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <span className="text-xl">Aa</span>
                  <span>Tipografija</span>
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  {['Inter', 'Roboto', 'Open Sans', 'Lato'].map((font) => (
                    <label key={font} className="cursor-pointer">
                      <input
                        type="radio"
                        value={font}
                        {...register('fontFamily')}
                        className="sr-only"
                      />
                      <div className={`
                        p-4 rounded-lg border-2 transition-all text-center
                        ${watchedValues.fontFamily === font 
                          ? 'border-pink-500 bg-pink-50' 
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}>
                        <span style={{ fontFamily: font }} className="text-lg font-medium">
                          {font}
                        </span>
                        <p style={{ fontFamily: font }} className="text-sm text-gray-500 mt-1">
                          Brzo smeđe lisice skoče
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Dark Mode Toggle */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Sun className="w-4 h-4" />
                    <Moon className="w-4 h-4" />
                  </div>
                  <span>Tema</span>
                </h3>
                
                <label className="flex items-center justify-between p-4 rounded-lg border-2 border-gray-200 cursor-pointer hover:border-gray-300">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-900 rounded-lg">
                      <Moon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium">Omogući tamnu temu</h4>
                      <p className="text-sm text-gray-500">Korisnici mogu birati između svetle i tamne teme</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    {...register('darkMode')}
                    className="sr-only"
                  />
                  <div className={`
                    w-12 h-6 rounded-full transition-colors relative
                    ${watchedValues.darkMode ? 'bg-pink-500' : 'bg-gray-200'}
                  `}>
                    <div className={`
                      w-5 h-5 bg-white rounded-full shadow-sm transition-transform absolute top-0.5
                      ${watchedValues.darkMode ? 'translate-x-6' : 'translate-x-0.5'}
                    `} />
                  </div>
                </label>
              </div>
            </div>
          </div>
        );

      case 5: // Features
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-xl">
                <Target className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Funkcionalnosti</h2>
              <p className="text-gray-600">Izaberite šta želite da omogućite na portalu</p>
            </div>

            <div className="grid gap-6 max-w-2xl mx-auto">
              {/* Core Features */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-indigo-600" />
                  <span>Osnovne funkcije</span>
                </h3>
                
                <div className="space-y-3">
                  {[
                    {
                      key: 'enableNewsletter' as keyof EnhancedSetupFormData,
                      icon: Mail,
                      title: 'Newsletter sistem',
                      description: 'Omogućite građanima da se pretplate na novosti',
                      recommended: true
                    },
                    {
                      key: 'enableComments' as keyof EnhancedSetupFormData,
                      icon: Bell,
                      title: 'Komentari na objave',
                      description: 'Dozvolite komentrisanje objava',
                      recommended: false
                    },
                    {
                      key: 'enableAnalytics' as keyof EnhancedSetupFormData,
                      icon: BarChart3,
                      title: 'Google Analytics',
                      description: 'Pratite statistike poseta sajta',
                      recommended: true
                    }
                  ].map((feature) => (
                    <label key={feature.key} className="flex items-center justify-between p-4 rounded-lg border-2 border-gray-200 cursor-pointer hover:border-gray-300 transition-all">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          watchedValues[feature.key] ? 'bg-indigo-100' : 'bg-gray-100'
                        }`}>
                          <feature.icon className={`w-5 h-5 ${
                            watchedValues[feature.key] ? 'text-indigo-600' : 'text-gray-500'
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{feature.title}</h4>
                            {feature.recommended && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                Preporučeno
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{feature.description}</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        {...register(feature.key)}
                        className="sr-only"
                      />
                      <div className={`
                        w-12 h-6 rounded-full transition-colors relative
                        ${watchedValues[feature.key] ? 'bg-indigo-500' : 'bg-gray-200'}
                      `}>
                        <div className={`
                          w-5 h-5 bg-white rounded-full shadow-sm transition-transform absolute top-0.5
                          ${watchedValues[feature.key] ? 'translate-x-6' : 'translate-x-0.5'}
                        `} />
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Social Media */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Share2 className="w-5 h-5 text-indigo-600" />
                  <span>Društvene mreže</span>
                </h3>
                
                <div className="grid gap-3">
                  <Input
                    {...register('facebook')}
                    placeholder="Facebook stranica (opciono)"
                    className="h-12 focus:border-indigo-500"
                  />
                  <Input
                    {...register('twitter')}
                    placeholder="Twitter/X profil (opciono)"
                    className="h-12 focus:border-indigo-500"
                  />
                  <Input
                    {...register('instagram')}
                    placeholder="Instagram profil (opciono)"
                    className="h-12 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Email Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Wifi className="w-5 h-5 text-indigo-600" />
                  <span>Email podešavanja (opciono)</span>
                </h3>
                
                <div className="grid gap-3">
                  <Input
                    {...register('smtpHost')}
                    placeholder="SMTP host (npr. smtp.gmail.com)"
                    className="h-12 focus:border-indigo-500"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      {...register('smtpPort')}
                      placeholder="Port (587)"
                      className="h-12 focus:border-indigo-500"
                    />
                    <Input
                      {...register('smtpUser')}
                      placeholder="Korisničko ime"
                      className="h-12 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                  <div className="flex space-x-3">
                    <Info className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-indigo-900 mb-1">📧 Email konfiguracija</h4>
                      <p className="text-sm text-indigo-700">
                        Ova podešavanja možete promeniti kasnije u admin panelu. 
                        Bez njih će sistem koristiti osnovnu konfiguraciju.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 6: // Complete
        return (
          <div className="text-center space-y-8">
            <div className="relative">
              <div className="mx-auto w-32 h-32 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-2xl">
                <Rocket className="h-16 w-16 text-white animate-bounce" />
              </div>
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center animate-spin">
                <Sparkles className="w-6 h-6 text-yellow-800" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Čestitamo! 🎉
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Vaš CodilioCMS portal je uspešno konfigurisan i spreman za korišćenje. 
                Automatski ste prijavljeni kao administrator.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Card className="p-6 border-green-200 bg-green-50">
                <CardHeader className="p-0 mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Lightbulb className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-center text-green-900">Sledeći koraci</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ul className="text-sm text-green-800 space-y-2">
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Dodajte prve objave i stranice</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Postavite logo i favicon</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Konfigurišite dodatna podešavanja</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Pozovite tim da koristi CMS</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="p-6 border-blue-200 bg-blue-50">
                <CardHeader className="p-0 mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-center text-blue-900">Podrška i resursi</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ul className="text-sm text-blue-800 space-y-2">
                    <li className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>Dokumentacija za korisnike</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span>Email podrška 24/7</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span>Zajednica korisnika</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Database className="w-4 h-4 text-blue-600" />
                      <span>Redovni backup i ažuriranja</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Button 
                size="lg"
                onClick={() => window.location.href = '/dashboard'}
                className="h-14 px-8 text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                <Shield className="mr-3 h-6 w-6" />
                Idite u admin panel
              </Button>
              
              <Button 
                variant="outline"
                size="lg"
                onClick={() => window.open('/', '_blank')}
                className="h-14 px-8 text-lg ml-4"
              >
                <Eye className="mr-3 h-6 w-6" />
                Pogledajte sajt
              </Button>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <Star className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Hvala vam!</span>
              </div>
              <p className="text-green-700 text-sm">
                Hvala što ste izabrali CodilioCMS. Vaš feedback nam pomaže da poboljšavamo sistem. 
                Ukoliko imate pitanja, slobodno nas kontaktirajte.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-400 to-purple-600 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-full opacity-10 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full opacity-5 animate-spin" style={{ animationDuration: '20s' }}></div>
      </div>

      <div className="w-full max-w-6xl relative">
        {process.env.NODE_ENV === 'development' && (
  <div className="fixed top-4 right-4 z-50 bg-black text-white p-2 rounded text-xs">
    <div>Step: {currentStep}/{STEPS.length - 1}</div>
    <div>Completed: [{completedSteps.join(', ')}]</div>
    <button 
      onClick={() => {
        console.log('🐛 DEBUG STATE:');
        console.log('Current step:', currentStep);
        console.log('Completed steps:', completedSteps);
        console.log('Current step data:', STEPS[currentStep]);
      }}
      className="bg-red-500 px-2 py-1 mt-1 rounded text-xs"
    >
      Debug
    </button>
  </div>
        )}{process.env.NODE_ENV === 'development' && (
          <div className="fixed top-4 right-4 z-50 bg-black text-white p-2 rounded text-xs">
            <div>Step: {currentStep}/{STEPS.length - 1}</div>
            <div>Completed: [{completedSteps.join(', ')}]</div>
            <button 
              onClick={() => {
                console.log('🐛 DEBUG STATE:');
                console.log('Current step:', currentStep);
                console.log('Completed steps:', completedSteps);
                console.log('Current step data:', STEPS[currentStep]);
              }}
              className="bg-red-500 px-2 py-1 mt-1 rounded text-xs"
            >
              Debug
            </button>
          </div>
        )}
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center relative">
                {getStepIcon(index)}
                <div className="mt-3 text-center">
                  <h3 className={`text-sm font-medium transition-colors ${
                    index === currentStep 
                      ? 'text-gray-900' 
                      : completedSteps.includes(index)
                        ? 'text-green-600'
                        : 'text-gray-400'
                  }`}>
                    {step.title}
                  </h3>
                  <p className={`text-xs mt-1 transition-colors ${
                    index === currentStep ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {step.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Progress percentage */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-violet-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
            />
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Korak {currentStep + 1} od {STEPS.length} • {Math.round((currentStep / (STEPS.length - 1)) * 100)}% završeno
            </p>
          </div>
        </div>

        {/* Main Card */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-8 relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-r ${currentStepData.color} opacity-5`}></div>
            <div className="relative">
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                {currentStepData.title}
              </CardTitle>
              <CardDescription className="text-gray-600 text-lg">
                {currentStepData.description}
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="min-h-[500px]">
                {renderStepContent()}
              </div>

              {/* Navigation Buttons */}
              {currentStep < 6 && (
                <div className="flex justify-between mt-12 pt-8 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="h-12 px-6"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Nazad
                  </Button>

                  {currentStep === 5 ? (
                    <Button 
                      type="button"  // KRITIČNO: Promenio sa "submit" na "button"
                      onClick={handleSubmit(onSubmit)}  // KRITIČNO: Eksplicitno pozovi submit
                      disabled={isSubmitting}
                      className={`h-12 px-8 bg-gradient-to-r ${currentStepData.color} hover:opacity-90 transition-all`}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Završavam setup...
                        </>
                      ) : (
                        <>
                          <Rocket className="mr-2 h-5 w-5" />
                          Završi konfiguraciju
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button 
                      type="button" 
                      onClick={(e) => {
                        e.preventDefault(); // KRITIČNO: Zaustavi default form behavior
                        console.log('🖱️ Dalje button clicked');
                        nextStep();
                      }}
                      className={`h-12 px-6 bg-gradient-to-r ${currentStepData.color} hover:opacity-90 transition-all`}
                    >
                      Dalje
                      <ArrowRight className="ml-2 h-5 w-5" />
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
            CodilioCMS &copy; 2025 - Profesionalni CMS za lokalne institucije
          </p>
        </div>
      </div>
    </div>
  );
}