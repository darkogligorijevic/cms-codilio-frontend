// components/setup-wizard-enhanced.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
  School,
  Library,
  Home,
  Layout
} from 'lucide-react';
import { CompleteSetupDto } from '@/lib/types';
import { InstitutionType, getAllInstitutionTypes, getInstitutionTemplate } from '@/lib/institution-templates';
import { toast } from 'sonner';
import { settingsApi, setupApi } from '@/lib/api';

const STEPS = [
  {
    id: 'welcome',
    title: 'Добродошли',
    subtitle: 'Konfigurişimo vaş CMS',
    description: 'Kreiraćemo vaş profesionalni portal u 5 minuta',
    icon: Sparkles,
    color: 'from-violet-500 to-purple-600'
  },
  {
    id: 'institution-type', // NEW STEP
    title: 'Тип установе',
    subtitle: 'Изаберите врсту институције',
    description: 'Ово ће одредити почетни дизајн и садржај',
    icon: Building,
    color: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'site',
    title: 'Osnove sajta',
    subtitle: 'Identitet vaše institucije',
    description: 'Naziv, logo i osnovne informacije',
    icon: Globe,
    color: 'from-blue-500 to-cyan-600'
  },
  {
    id: 'admin',
    title: 'Administrator',
    subtitle: 'Vaş admin nalog',
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
    id: 'complete',
    title: 'Gotovo!',
    subtitle: 'Vaş CMS je spreman',
    description: 'Možete početi da koristite sistem',
    icon: Rocket,
    color: 'from-green-500 to-emerald-600'
  }
];

interface EnhancedSetupFormData extends CompleteSetupDto {
  institutionType: InstitutionType;
  // Contact details
  phone?: string;
  address?: string;
  workingHours?: string;
}

export function EnhancedSetupWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [selectedInstitutionType, setSelectedInstitutionType] = useState<InstitutionType>(InstitutionType.MUNICIPALITY);

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
      workingHours: 'Ponedeljak - Petak: 08:00 - 16:00'
    }
  });

  const currentStepData = STEPS[currentStep];
  const watchedValues = watch();
  const institutionTypes = getAllInstitutionTypes();

  // Get template for selected institution type
  const selectedTemplate = getInstitutionTemplate(selectedInstitutionType);

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

    if (currentStep >= 4) {
      console.log('🛑 Reached step 4 or higher, stopping auto-advance');
      return;
    }

    const nextStepIndex = currentStep + 1;
    console.log('🎯 Next step would be:', nextStepIndex);

    if (nextStepIndex <= 4) {
      console.log('➡️ Advancing to step:', nextStepIndex);
      setCurrentStep(nextStepIndex);
    } else {
      console.log('🚫 Cannot advance further, at step:', currentStep);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    console.log(`🎯 goToStep called with stepIndex: ${stepIndex}`);
    console.log(`📊 Current completed steps: [${completedSteps.join(', ')}]`);
    
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
      
      // Apply institution template settings
      const template = getInstitutionTemplate(data.institutionType);
      const templateSettings = [
        { key: 'institution_type', value: data.institutionType },
        { key: 'theme_primary_color', value: template.primaryColor },
        { key: 'theme_secondary_color', value: template.secondaryColor },
        { key: 'theme_font_family', value: template.fontFamily }
      ];

      // Add additional contact settings
      if (data.phone) {
        templateSettings.push({ key: 'contact_phone', value: data.phone });
      }
      if (data.address) {
        templateSettings.push({ key: 'contact_address', value: data.address });
      }
      if (data.workingHours) {
        templateSettings.push({ key: 'contact_working_hours', value: data.workingHours });
      }
      
      // Update settings
      if (templateSettings.length > 0) {
        try {
          await settingsApi.updateMultiple({ settings: templateSettings });
        } catch (settingsError) {
          console.warn('Failed to update template settings:', settingsError);
        }
      }

      // TODO: Create predefined page sections based on template
      // This would be implemented in a separate API call
      await createPredefinedHomepageSections(data.institutionType);
      
      setCompletedSteps(prev => [...prev, currentStep]);
      setCurrentStep(5); // Go to completion step
      toast.success('Setup je uspešno završen! Dobrodošli u CodilioCMS.');
      
      // Refresh setup status
      setTimeout(() => {
        window.location.reload();
      }, 3000);
      
    } catch (error: any) {
      console.error('Setup error:', error);
      toast.error(error.response?.data?.message || 'Greška prilikom setup-a');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to create predefined homepage sections
  const createPredefinedHomepageSections = async (institutionType: InstitutionType) => {
    try {
      const template = getInstitutionTemplate(institutionType);
      
      console.log('Creating predefined sections for:', institutionType);
      console.log('Template:', template);
      
      // Call API to create homepage template with predefined sections
      await setupApi.createHomepageTemplate(institutionType);
      
      console.log('✅ Successfully created homepage template with', template.predefinedSections.length, 'sections');
      
    } catch (error) {
      console.error('Error creating predefined sections:', error);
      // Don't throw error, just log it - setup can continue without sections
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

  const getInstitutionIcon = (type: InstitutionType) => {
    const iconMap = {
      [InstitutionType.MUSEUM]: Building,
      [InstitutionType.MUNICIPALITY]: Building,
      [InstitutionType.SCHOOL]: School,
      [InstitutionType.CULTURAL_CENTER]: Star,
      [InstitutionType.HOSPITAL]: Heart,
      [InstitutionType.LIBRARY]: Library
    };
    return iconMap[type] || Building;
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
                Kreiraćemo profesionalni portal vaše institucije u svega nekoliko koraka. 
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
          </div>
        );

      case 1: // NEW: Institution Type Selection
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mb-6 shadow-xl">
                <Building className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Изаберите тип установе</h2>
              <p className="text-gray-600">Ово ће одредити почетни дизајн и садржај вашег портала</p>
            </div>

            <div className="max-w-4xl mx-auto">
              <RadioGroup 
                value={selectedInstitutionType} 
                onValueChange={(value: InstitutionType) => {
                  setSelectedInstitutionType(value);
                  setValue('institutionType', value);
                }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {institutionTypes.map((type) => {
                  const IconComponent = getInstitutionIcon(type.value);
                  const template = getInstitutionTemplate(type.value);
                  
                  return (
                    <div key={type.value} className="relative">
                      <RadioGroupItem 
                        value={type.value} 
                        id={type.value} 
                        className="peer sr-only" 
                      />
                      <Label
                        htmlFor={type.value}
                        className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                      >
                        <div 
                          className="w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors"
                          style={{ backgroundColor: `${template.primaryColor}20` }}
                        >
                          <IconComponent 
                            className="h-8 w-8" 
                            style={{ color: template.primaryColor }}
                          />
                        </div>
                        <h3 className="font-semibold text-center">{type.label}</h3>
                        <p className="text-sm text-muted-foreground text-center mt-2">
                          {type.description}
                        </p>
                        
                        {/* Template preview colors */}
                        <div className="flex items-center space-x-2 mt-3">
                          <div 
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: template.primaryColor }}
                            title="Primarna boja"
                          />
                          <div 
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: template.secondaryColor }}
                            title="Sekundarna boja"
                          />
                          <span className="text-xs text-muted-foreground" style={{ fontFamily: template.fontFamily }}>
                            {template.fontFamily}
                          </span>
                        </div>
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>

            {/* Preview selected template */}
            {selectedInstitutionType && (
              <div className="max-w-2xl mx-auto mt-8">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border-2 border-dashed border-gray-200">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Eye className="mr-2 h-4 w-4" />
                    Pregled odabranog template-a
                  </h4>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Тип:</span>
                      <span className="font-medium">{selectedTemplate.name}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Примарна боја:</span>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: selectedTemplate.primaryColor }}
                        />
                        <span className="font-mono text-xs">{selectedTemplate.primaryColor}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Секундарна боја:</span>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: selectedTemplate.secondaryColor }}
                        />
                        <span className="font-mono text-xs">{selectedTemplate.secondaryColor}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Фонт:</span>
                      <span className="font-medium" style={{ fontFamily: selectedTemplate.fontFamily }}>
                        {selectedTemplate.fontFamily}
                      </span>
                    </div>
                    
                    <div className="pt-2 border-t border-gray-200">
                      <span className="text-gray-600 dark:text-gray-400">Предефинисане секције:</span>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {selectedTemplate.predefinedSections.map((section, index) => (
                          <span 
                            key={index}
                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                          >
                            {section.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 2: // Site Information
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mb-6 shadow-xl">
                <Globe className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Основне информације о сајту</h2>
              <p className="text-gray-600">Унесите основне податке о вашој институцији</p>
            </div>

            <div className="grid gap-6 max-w-2xl mx-auto">
              <div className="space-y-2">
                <Label htmlFor="siteName">Назив сајта *</Label>
                <Input
                  id="siteName"
                  {...register('siteName', { required: 'Назив је обавезан' })}
                  placeholder="нпр. Народни музеј"
                  className={errors.siteName ? 'border-red-500' : ''}
                />
                {errors.siteName && (
                  <p className="text-red-500 text-sm">{errors.siteName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteTagline">Слоган/Опис *</Label>
                <Textarea
                  id="siteTagline"
                  {...register('siteTagline', { required: 'Опис је обавезан' })}
                  placeholder="нпр. Чувари културног наслеђа"
                  rows={3}
                  className={errors.siteTagline ? 'border-red-500' : ''}
                />
                {errors.siteTagline && (
                  <p className="text-red-500 text-sm">{errors.siteTagline.message}</p>
                )}
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Администраторски налог</h2>
              <p className="text-gray-600">Креирајте сигуран приступ за управљање порталом</p>
            </div>

            <div className="grid gap-6 max-w-2xl mx-auto">
              <div className="space-y-2">
                <Label htmlFor="adminName">Пуно име *</Label>
                <Input
                  id="adminName"
                  {...register('adminName', { required: 'Име је обавезно' })}
                  placeholder="Марко Петровић"
                  className={errors.adminName ? 'border-red-500' : ''}
                />
                {errors.adminName && (
                  <p className="text-red-500 text-sm">{errors.adminName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminEmail">Email адреса *</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  {...register('adminEmail', { 
                    required: 'Email је обавезан',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Неисправна email адреса'
                    }
                  })}
                  placeholder="admin@muzej.rs"
                  className={errors.adminEmail ? 'border-red-500' : ''}
                />
                {errors.adminEmail && (
                  <p className="text-red-500 text-sm">{errors.adminEmail.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminPassword">Лозинка *</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  {...register('adminPassword', { 
                    required: 'Лозинка је обавезна',
                    minLength: { value: 6, message: 'Минимум 6 карактера' }
                  })}
                  placeholder="••••••••"
                  className={errors.adminPassword ? 'border-red-500' : ''}
                />
                {errors.adminPassword && (
                  <p className="text-red-500 text-sm">{errors.adminPassword.message}</p>
                )}
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
              <p className="text-gray-600">Како вас посетиоци могу контактирати</p>
            </div>

            <div className="grid gap-6 max-w-2xl mx-auto">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Главни email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  {...register('contactEmail', { 
                    required: 'Email је обавезан',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Неисправна email адреса'
                    }
                  })}
                  placeholder="info@muzej.rs"
                  className={errors.contactEmail ? 'border-red-500' : ''}
                />
                {errors.contactEmail && (
                  <p className="text-red-500 text-sm">{errors.contactEmail.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Телефон</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="+381 11 123 4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Адреса</Label>
                <Textarea
                  id="address"
                  {...register('address')}
                  placeholder="Музејска улица 1, 11000 Београд"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workingHours">Радно време</Label>
                <Input
                  id="workingHours"
                  {...register('workingHours')}
                  placeholder="Понедељак - Петак: 10:00 - 18:00"
                />
              </div>
            </div>
          </div>
        );

      case 5: // Complete
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
                Ваш CodilioCMS портал је успешно конфигурисан са {selectedTemplate.name} темплејтом. 
                Почетне секције су аутоматски креиране и можете их даље прилагодити у Page Builder-у.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Card className="p-6 border-green-200 bg-green-50">
                <CardHeader className="p-0 mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Layout className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-center text-green-900">Ваш темплејт</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ul className="text-sm text-green-800 space-y-2">
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Тип: {selectedTemplate.name}</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>{selectedTemplate.predefinedSections.length} предефинисаних секција</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Прилагођене боје и фонтови</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Спремно за даље уређивање</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="p-6 border-blue-200 bg-blue-50">
                <CardHeader className="p-0 mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Lightbulb className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-center text-blue-900">Следећи кораци</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ul className="text-sm text-blue-800 space-y-2">
                    <li className="flex items-center space-x-2">
                      <ArrowRight className="w-4 h-4 text-blue-600" />
                      <span>Идите у Page Builder за уређивање</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <ArrowRight className="w-4 h-4 text-blue-600" />
                      <span>Додајте своје слике и садржај</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <ArrowRight className="w-4 h-4 text-blue-600" />
                      <span>Креирајте објаве и галерије</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <ArrowRight className="w-4 h-4 text-blue-600" />
                      <span>Прилагодите подешавања</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Button 
                size="lg"
                onClick={() => window.location.href = '/dashboard/pages'}
                className="h-14 px-8 text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                <Layout className="mr-3 h-6 w-6" />
                Отвори Page Builder
              </Button>
              
              <Button 
                variant="outline"
                size="lg"
                onClick={() => window.open('/', '_blank')}
                className="h-14 px-8 text-lg ml-4"
              >
                <Eye className="mr-3 h-6 w-6" />
                Погледај сајт
              </Button>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <Info className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Напомена</span>
              </div>
              <p className="text-green-700 text-sm">
                Креиране су следеће секције на почетној страници: {selectedTemplate.predefinedSections.map(s => s.name).join(', ')}. 
                Можете их уредити или додати нове секције у Page Builder-у.
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
              {currentStep < 5 && (
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

                  {currentStep === 4 ? (
                    <Button 
                      type="button"
                      onClick={handleSubmit(onSubmit)}
                      disabled={isSubmitting}
                      className={`h-12 px-8 bg-gradient-to-r ${currentStepData.color} hover:opacity-90 transition-all`}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Креирам портал...
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