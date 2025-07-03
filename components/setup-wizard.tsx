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
  BarChart3,
  Hospital,
  School,
  Library,
  Landmark,
  Building2
} from 'lucide-react';
import { CompleteSetupDto } from '@/lib/types';
import { toast } from 'sonner';
import { settingsApi, setupApi } from '@/lib/api';
import { InstitutionType } from '@/lib/institution-templates';

const STEPS = [
  {
    id: 'welcome',
    title: 'Добродошли',
    subtitle: 'Конфигуришимо ваш CMS',
    description: 'Креираћемо ваш професионални портал у 5 минута',
    icon: Sparkles,
    color: 'from-violet-500 to-purple-600'
  },
  {
    id: 'institution',
    title: 'Тип установе',
    subtitle: 'Изаберите вашу врсту установе',
    description: 'Прилагодићемо дизајн према типу ваше институције',
    icon: Building,
    color: 'from-indigo-500 to-blue-600'
  },
  {
    id: 'site',
    title: 'Основе сајта',
    subtitle: 'Идентитет ваше институције',
    description: 'Назив, лого и основне информације',
    icon: Globe,
    color: 'from-blue-500 to-cyan-600'
  },
  {
    id: 'admin',
    title: 'Администратор',
    subtitle: 'Ваш админ налог',
    description: 'Креирање сигурног приступа',
    icon: Shield,
    color: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'contact',
    title: 'Контакт подаци',
    subtitle: 'Како вас могу контактирати',
    description: 'Емаил, телефон и адреса',
    icon: Phone,
    color: 'from-orange-500 to-red-600'
  },
  {
    id: 'appearance',
    title: 'Изглед',
    subtitle: 'Персонализујте дизајн',
    description: 'Боје, фонтови и стил',
    icon: Palette,
    color: 'from-pink-500 to-rose-600'
  },
  {
    id: 'features',
    title: 'Функционалности',
    subtitle: 'Шта желите да омогућите',
    description: 'Емаил, коментари, аналитика',
    icon: Target,
    color: 'from-indigo-500 to-purple-600'
  },
  {
    id: 'complete',
    title: 'Готово!',
    subtitle: 'Ваш CMS је спреман',
    description: 'Можете почети да користите систем',
    icon: Rocket,
    color: 'from-green-500 to-emerald-600'
  }
];

// Institution types with Serbian translations
const INSTITUTION_TYPES = [
  {
    value: InstitutionType.MUNICIPALITY,
    label: 'Општина/Град',
    description: 'Локална самоуправа, општинска/градска управа',
    icon: Landmark,
    color: 'from-blue-600 to-indigo-600'
  },
  {
    value: InstitutionType.MUSEUM,
    label: 'Музеј/Галерија',
    description: 'Музејске институције и уметничке галерије',
    icon: Building2,
    color: 'from-amber-600 to-orange-600'
  },
  {
    value: InstitutionType.SCHOOL,
    label: 'Школа/Универзитет',
    description: 'Образовне установе свих нивоа',
    icon: School,
    color: 'from-green-600 to-emerald-600'
  },
  {
    value: InstitutionType.HOSPITAL,
    label: 'Болница/Клиника',
    description: 'Здравствене установе и медицински центри',
    icon: Hospital,
    color: 'from-red-600 to-pink-600'
  },
  {
    value: InstitutionType.LIBRARY,
    label: 'Библиотека',
    description: 'Библиотеке и информациони центри',
    icon: Library,
    color: 'from-purple-600 to-violet-600'
  },
  {
    value: InstitutionType.CULTURAL_CENTER,
    label: 'Културни центар',
    description: 'Дом културе, културно-уметничка друштва',
    icon: Star,
    color: 'from-teal-600 to-cyan-600'
  }
];

interface EnhancedSetupFormData extends CompleteSetupDto {
  // Institution type
  institutionType: InstitutionType;
  
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
      institutionType: InstitutionType.MUNICIPALITY,
      primaryColor: '#3B82F6',
      secondaryColor: '#10B981',
      fontFamily: 'Inter',
      darkMode: false,
      enableComments: false,
      enableNewsletter: true,
      enableAnalytics: false,
      maintenanceMode: false,
      workingHours: 'Понедељак - Петак: 08:00 - 16:00'
    }
  });

  const currentStepData = STEPS[currentStep];
  const watchedValues = watch();

  const nextStep = async () => {
    console.log('🚀 nextStep called, currentStep:', currentStep);
    
    let fieldsToValidate: (keyof EnhancedSetupFormData)[] = [];
    
    switch (currentStep) {
      case 1: // Institution type
        fieldsToValidate = ['institutionType'];
        break;
      case 2: // Site info
        fieldsToValidate = ['siteName', 'siteTagline'];
        break;
      case 3: // Admin
        fieldsToValidate = ['adminName', 'adminEmail', 'adminPassword'];
        break;
      case 4: // Contact
        fieldsToValidate = ['contactEmail'];
        break;
      case 5: // Appearance - optional
      case 6: // Features - optional
        console.log('📝 Optional step, no validation needed');
        break;
    }

    if (fieldsToValidate.length > 0) {
      const isValid = await trigger(fieldsToValidate);
      if (!isValid) {
        return;
      }
    }

    // Mark current step as completed
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps(prev => [...prev, currentStep]);
    }

    // Stop auto-advancement at step 6
    if (currentStep >= 6) {
      return;
    }

    const nextStepIndex = currentStep + 1;
    if (nextStepIndex <= 6) {
      setCurrentStep(nextStepIndex);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    const maxCompletedStep = Math.max(...completedSteps, -1);
    const maxAccessibleStep = maxCompletedStep + 1;
    
    const canAccess = stepIndex <= maxAccessibleStep || stepIndex <= currentStep;
    
    if (canAccess) {
      setCurrentStep(stepIndex);
    }
  };

  const onSubmit = async (data: EnhancedSetupFormData) => {
    try {
      setIsSubmitting(true);
      
      // Prepare basic setup data
      const setupData: CompleteSetupDto = {
        siteName: data.siteName,
        siteTagline: data.siteTagline,
        adminName: data.adminName,
        adminEmail: data.adminEmail,
        adminPassword: data.adminPassword,
        contactEmail: data.contactEmail,
      };
      
      // Call setup API
      const result = await setupApi.completeSetup(setupData);
      
      // Save token
      if (result.access_token) {
        localStorage.setItem('access_token', result.access_token);
      }
      
      // Update additional settings if needed
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
      
      // Add email settings if entered
      if (data.smtpHost) {
        additionalSettings.push({ key: 'email_smtp_host', value: data.smtpHost });
      }
      if (data.smtpPort) {
        additionalSettings.push({ key: 'email_smtp_port', value: data.smtpPort });
      }
      if (data.smtpUser) {
        additionalSettings.push({ key: 'email_smtp_user', value: data.smtpUser });
      }
      
      // Add social media links
      if (data.facebook) {
        additionalSettings.push({ key: 'social_facebook', value: data.facebook });
      }
      if (data.twitter) {
        additionalSettings.push({ key: 'social_twitter', value: data.twitter });
      }
      if (data.instagram) {
        additionalSettings.push({ key: 'social_instagram', value: data.instagram });
      }
      
      // Features
      additionalSettings.push({ key: 'allow_comments', value: data.enableComments.toString() });
      additionalSettings.push({ key: 'theme_dark_mode', value: data.darkMode.toString() });
      
      // Send additional settings
      if (additionalSettings.length > 0) {
        try {
          await settingsApi.updateMultiple({ settings: additionalSettings });
        } catch (settingsError) {
          console.warn('Failed to update additional settings:', settingsError);
        }
      }
      
      // Create homepage template based on institution type
      try {
        await setupApi.createHomepageTemplate(data.institutionType);
        console.log('✅ Homepage template created successfully');
      } catch (templateError) {
        console.warn('Failed to create homepage template:', templateError);
      }
      
      setCompletedSteps(prev => [...prev, currentStep]);
      setCurrentStep(7); // Go to completion step
      toast.success('Сетап је успешно завршен! Добродошли у CodilioCMS.');
      
      // Refresh setup status
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error: any) {
      console.error('Setup error:', error);
      toast.error(error.response?.data?.message || 'Грешка приликом сетап-а');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepIcon = (stepIndex: number) => {
    const StepIcon = STEPS[stepIndex].icon;
    const isCompleted = completedSteps.includes(stepIndex);
    const isCurrent = stepIndex === currentStep;
    const isAccessible = stepIndex <= Math.max(...completedSteps, 0) + 1;

    return (
      <div
        onClick={() => goToStep(stepIndex)}
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
                Добродошли у CodilioCMS
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Креираћемо професионални портал ваше локалне институције у свега неколико корака. 
                Процес је брз, сигуран и потпуно прилагођен вашим потребама.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { icon: Zap, title: 'Брза инсталација', desc: '5 минута' },
                { icon: Shield, title: 'Потпуно сигурно', desc: 'ССЛ заштићено' },
                { icon: Heart, title: 'Једноставно', desc: 'Без техничких знања' },
                { icon: Target, title: 'Прилагодљиво', desc: 'За све институције' }
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
                <span className="text-sm font-medium text-violet-800">Про савет</span>
              </div>
              <p className="text-violet-700 text-sm">
                Припремите лого ваше институције (ПНГ или ЈПГ формат) и основне контакт информације 
                да бисте убрзали процес конфигурације.
              </p>
            </div>
          </div>
        );

      case 1: // Institution Type
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full flex items-center justify-center mb-6 shadow-xl">
                <Building className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Изаберите тип ваше установе</h2>
              <p className="text-gray-600">Ово ће помоћи да прилагодимо дизајн и функционалности специфично за вашу институцију</p>
            </div>

            <div className="grid gap-4 max-w-4xl mx-auto">
              {INSTITUTION_TYPES.map((type) => (
                <label key={type.value} className="cursor-pointer">
                  <input
                    type="radio"
                    value={type.value}
                    {...register('institutionType', { required: 'Тип установе је обавезан' })}
                    className="sr-only"
                  />
                  <div className={`
                    group p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-lg
                    ${watchedValues.institutionType === type.value 
                      ? `border-indigo-500 bg-gradient-to-r ${type.color} bg-opacity-5 shadow-md scale-[1.02]` 
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                    }
                  `}>
                    <div className="flex items-start space-x-4">
                      <div className={`
                        p-3 rounded-lg transition-colors
                        ${watchedValues.institutionType === type.value 
                          ? `bg-gradient-to-r ${type.color} text-white shadow-lg` 
                          : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                        }
                      `}>
                        <type.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`
                          text-lg font-semibold mb-2 transition-colors
                          ${watchedValues.institutionType === type.value ? 'text-indigo-900' : 'text-gray-900'}
                        `}>
                          {type.label}
                        </h3>
                        <p className={`
                          text-sm transition-colors
                          ${watchedValues.institutionType === type.value ? 'text-indigo-700' : 'text-gray-600'}
                        `}>
                          {type.description}
                        </p>
                      </div>
                      {watchedValues.institutionType === type.value && (
                        <div className="p-1 bg-indigo-500 rounded-full">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {errors.institutionType && (
              <p className="text-red-500 text-sm flex items-center justify-center space-x-1">
                <X className="w-4 h-4" />
                <span>{errors.institutionType.message}</span>
              </p>
            )}

            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 max-w-2xl mx-auto">
              <div className="flex space-x-3">
                <Info className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-indigo-900 mb-1">💡 Прилагођавање</h4>
                  <p className="text-sm text-indigo-700">
                    На основу вашег избора, систем ће аутоматски конфигурисати боје, секције почетне странице 
                    и функционалности специфичне за вашу врсту установе.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 2: // Site Information
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mb-6 shadow-xl">
                <Globe className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Идентитет ваше институције</h2>
              <p className="text-gray-600">Основне информације које ће се приказивати на вашем порталу</p>
            </div>

            <div className="grid gap-6 max-w-2xl mx-auto">
              <div className="space-y-2">
                <Label htmlFor="siteName" className="flex items-center space-x-2">
                  <Building className="w-4 h-4 text-blue-600" />
                  <span>Назив институције *</span>
                </Label>
                <Input
                  id="siteName"
                  {...register('siteName', { 
                    required: 'Назив је обавезан',
                    maxLength: { value: 100, message: 'Максимално 100 карактера' }
                  })}
                  placeholder="нпр. Општина Младеновац"
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
                  <span>Слоган/Опис *</span>
                </Label>
                <Textarea
                  id="siteTagline"
                  {...register('siteTagline', { 
                    required: 'Опис је обавезан',
                    maxLength: { value: 200, message: 'Максимално 200 карактера' }
                  })}
                  placeholder="нпр. Транспарентност и доступност у служби грађана"
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
                    <h4 className="text-sm font-medium text-blue-900 mb-1">💡 Савети за добар назив</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Користите званични назив ваше институције</li>
                      <li>• Кратко и јасно - лакше за памћење</li>
                      <li>• Избегавајте скраћенице које нису опште познате</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3: // Admin User
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mb-6 shadow-xl">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Ваш администратор налог</h2>
              <p className="text-gray-600">Креираћемо сигуран приступ за управљање порталом</p>
            </div>

            <div className="grid gap-6 max-w-2xl mx-auto">
              <div className="space-y-2">
                <Label htmlFor="adminName" className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>Пуно име *</span>
                </Label>
                <Input
                  id="adminName"
                  {...register('adminName', { 
                    required: 'Име је обавезно',
                    maxLength: { value: 100, message: 'Максимално 100 карактера' }
                  })}
                  placeholder="Марко Петровић"
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
                  <span>Емаил адреса *</span>
                </Label>
                <Input
                  id="adminEmail"
                  type="email"
                  {...register('adminEmail', { 
                    required: 'Емаил је обавезан',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Неисправна емаил адреса'
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
                  <span>Лозинка *</span>
                </Label>
                <Input
                  id="adminPassword"
                  type="password"
                  {...register('adminPassword', { 
                    required: 'Лозинка је обавезна',
                    minLength: { value: 6, message: 'Минимум 6 карактера' },
                    maxLength: { value: 50, message: 'Максимално 50 карактера' }
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
                  Користићете ове податке за пријављивање у админ панел
                </p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex space-x-3">
                  <Shield className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-emerald-900 mb-1">🔒 Сигурност на првом месту</h4>
                    <ul className="text-sm text-emerald-700 space-y-1">
                      <li>• Користите јаку лозинку (најмање 8 карактера)</li>
                      <li>• Комбинујте слова, бројеве и симболе</li>
                      <li>• Никад не делите приступне податке</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4: // Contact
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mb-6 shadow-xl">
                <Phone className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Контакт информације</h2>
              <p className="text-gray-600">Како вас грађани могу контактирати</p>
            </div>

            <div className="grid gap-6 max-w-2xl mx-auto">
              <div className="space-y-2">
                <Label htmlFor="contactEmail" className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-orange-600" />
                  <span>Главни емаил *</span>
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  {...register('contactEmail', { 
                    required: 'Емаил је обавезан',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Неисправна емаил адреса'
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
                  <span>Телефон</span>
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
                  <span>Адреса</span>
                </Label>
                <Textarea
                  id="address"
                  {...register('address')}
                  placeholder="Трг Републике 1, 11000 Београд"
                  rows={2}
                  className="focus:border-orange-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workingHours" className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span>Радно време</span>
                </Label>
                <Input
                  id="workingHours"
                  {...register('workingHours')}
                  placeholder="Понедељак - Петак: 08:00 - 16:00"
                  className="h-12 focus:border-orange-500"
                />
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <div className="flex space-x-3">
                  <Bell className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-orange-900 mb-1">📧 Напомена</h4>
                    <p className="text-sm text-orange-700">
                      На главни емаил ће стизати све поруке са контакт форме. 
                      Остале информације су опционе и можете их додати касније.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 5: // Appearance
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full flex items-center justify-center mb-6 shadow-xl">
                <Palette className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Визуелни идентитет</h2>
              <p className="text-gray-600">Прилагодите боје и стил портала</p>
            </div>

            <div className="grid gap-8 max-w-2xl mx-auto">
              {/* Color Scheme */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Palette className="w-5 h-5 text-pink-600" />
                  <span>Палета боја</span>
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Примарна боја</Label>
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
                    <Label htmlFor="secondaryColor">Секундарна боја</Label>
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
                  <h4 className="text-sm font-medium mb-3">Преглед боја</h4>
                  <div className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-8 h-8 rounded-lg border"
                        style={{ backgroundColor: watchedValues.primaryColor }}
                      />
                      <span className="text-sm">Примарна</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-8 h-8 rounded-lg border"
                        style={{ backgroundColor: watchedValues.secondaryColor }}
                      />
                      <span className="text-sm">Секундарна</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Font Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <span className="text-xl">Aa</span>
                  <span>Типографија</span>
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
                          Брзо смеђе лисице скоче
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
                  <span>Тема</span>
                </h3>
                
                <label className="flex items-center justify-between p-4 rounded-lg border-2 border-gray-200 cursor-pointer hover:border-gray-300">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-900 rounded-lg">
                      <Moon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium">Омогући тамну тему</h4>
                      <p className="text-sm text-gray-500">Корисници могу бирати између светле и тамне теме</p>
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

      case 6: // Features
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-xl">
                <Target className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Функционалности</h2>
              <p className="text-gray-600">Изаберите шта желите да омогућите на порталу</p>
            </div>

            <div className="grid gap-6 max-w-2xl mx-auto">
              {/* Core Features */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-indigo-600" />
                  <span>Основне функције</span>
                </h3>
                
                <div className="space-y-3">
                  {[
                    {
                      key: 'enableNewsletter' as keyof EnhancedSetupFormData,
                      icon: Mail,
                      title: 'Њузлетер систем',
                      description: 'Омогућите грађанима да се претплате на новости',
                      recommended: true
                    },
                    {
                      key: 'enableComments' as keyof EnhancedSetupFormData,
                      icon: Bell,
                      title: 'Коментари на објаве',
                      description: 'Дозволите коментарисање објава',
                      recommended: false
                    },
                    {
                      key: 'enableAnalytics' as keyof EnhancedSetupFormData,
                      icon: BarChart3,
                      title: 'Гугл Аналитика',
                      description: 'Пратите статистике посета сајта',
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
                                Препоручено
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
                  <span>Друштвене мреже</span>
                </h3>
                
                <div className="grid gap-3">
                  <Input
                    {...register('facebook')}
                    placeholder="Фејсбук страница (опционо)"
                    className="h-12 focus:border-indigo-500"
                  />
                  <Input
                    {...register('twitter')}
                    placeholder="Твитер/X профил (опционо)"
                    className="h-12 focus:border-indigo-500"
                  />
                  <Input
                    {...register('instagram')}
                    placeholder="Инстаграм профил (опционо)"
                    className="h-12 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Email Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Wifi className="w-5 h-5 text-indigo-600" />
                  <span>Емаил подешавања (опционо)</span>
                </h3>
                
                <div className="grid gap-3">
                  <Input
                    {...register('smtpHost')}
                    placeholder="СМТП хост (нпр. smtp.gmail.com)"
                    className="h-12 focus:border-indigo-500"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      {...register('smtpPort')}
                      placeholder="Порт (587)"
                      className="h-12 focus:border-indigo-500"
                    />
                    <Input
                      {...register('smtpUser')}
                      placeholder="Корисничко име"
                      className="h-12 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                  <div className="flex space-x-3">
                    <Info className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-indigo-900 mb-1">📧 Емаил конфигурација</h4>
                      <p className="text-sm text-indigo-700">
                        Ова подешавања можете променити касније у админ панелу. 
                        Без њих ће систем користити основну конфигурацију.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 7: // Complete
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
                Честитамо! 🎉
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Ваш CodilioCMS портал је успешно конфигурисан и спреман за коришћење. 
                Аутоматски сте пријављени као администратор.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Card className="p-6 border-green-200 bg-green-50">
                <CardHeader className="p-0 mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Lightbulb className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-center text-green-900">Следећи кораци</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ul className="text-sm text-green-800 space-y-2">
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Додајте прве објаве и странице</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Поставите лого и фавикон</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Конфигуришите додатна подешавања</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Позовите тим да користи CMS</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="p-6 border-blue-200 bg-blue-50">
                <CardHeader className="p-0 mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-center text-blue-900">Подршка и ресурси</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ul className="text-sm text-blue-800 space-y-2">
                    <li className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>Документација за кориснике</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span>Емаил подршка 24/7</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span>Заједница корисника</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Database className="w-4 h-4 text-blue-600" />
                      <span>Редован бекап и ажурирања</span>
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
                Идите у админ панел
              </Button>
              
              <Button 
                variant="outline"
                size="lg"
                onClick={() => window.open('/', '_blank')}
                className="h-14 px-8 text-lg ml-4"
              >
                <Eye className="mr-3 h-6 w-6" />
                Погледајте сајт
              </Button>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <Star className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Хвала вам!</span>
              </div>
              <p className="text-green-700 text-sm">
                Хвала што сте изабрали CodilioCMS. Ваш фидбек нам помаже да побољшавамо систем. 
                Уколико имате питања, слободно нас контактирајте.
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
              Корак {currentStep + 1} од {STEPS.length} • {Math.round((currentStep / (STEPS.length - 1)) * 100)}% завршено
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
              {currentStep < 7 && (
                <div className="flex justify-between mt-12 pt-8 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="h-12 px-6"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Назад
                  </Button>

                  {currentStep === 6 ? (
                    <Button 
                      type="button"
                      onClick={handleSubmit(onSubmit)}
                      disabled={isSubmitting}
                      className={`h-12 px-8 bg-gradient-to-r ${currentStepData.color} hover:opacity-90 transition-all`}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Завршавам сетап...
                        </>
                      ) : (
                        <>
                          <Rocket className="mr-2 h-5 w-5" />
                          Заврши конфигурацију
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button 
                      type="button" 
                      onClick={(e) => {
                        e.preventDefault();
                        console.log('🖱️ Даље button clicked');
                        nextStep();
                      }}
                      className={`h-12 px-6 bg-gradient-to-r ${currentStepData.color} hover:opacity-90 transition-all`}
                    >
                      Даље
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
            CodilioCMS &copy; 2025 - Професионални CMS за локалне институције
          </p>
        </div>
      </div>
    </div>
  );
}