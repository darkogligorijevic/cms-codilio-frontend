// app/dashboard/settings/page.tsx - COMPLETE FIXED VERSION
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DragDropUpload } from '@/components/ui/drag-drop-upload';
import { 
  Settings, 
  Building, 
  Mail, 
  Share2, 
  Search, 
  Palette,
  Shield,
  Save,
  RotateCcw,
  Download,
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
  Phone,
  MapPin,
  Clock,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  FileText,
  Globe,
  Eye,
  X
} from 'lucide-react';
import { useSettings } from '@/lib/settings-context';
import { 
  SettingCategory, 
  SettingType, 
  SETTING_KEYS,
  UpdateMultipleSettingsDto 
} from '@/lib/types';
import { mediaApi } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

interface SettingFormData {
  [key: string]: string | number | boolean;
}

export default function SettingsPage() {
  const { 
    settings, 
    rawSettings, 
    isLoading, 
    updateMultipleSettings,
    uploadFile,
    resetSettings,
    exportSettings,
    importSettings,
    refreshSettings
  } = useSettings();

  const [activeTab, setActiveTab] = useState<SettingCategory>(SettingCategory.GENERAL);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importData, setImportData] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const [isDraggingFavicon, setIsDraggingFavicon] = useState(false);
  const {theme} = useTheme();
  
  // Track file uploads separately from form state
  const [pendingFileUploads, setPendingFileUploads] = useState<{
    [SETTING_KEYS.SITE_LOGO]?: File | null; // null means remove file
    [SETTING_KEYS.SITE_FAVICON]?: File | null; // null means remove file
  }>({});

  // Track original file values to enable proper reset
  const [originalFileValues, setOriginalFileValues] = useState<{
    [SETTING_KEYS.SITE_LOGO]?: string;
    [SETTING_KEYS.SITE_FAVICON]?: string;
  }>({});

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty }
  } = useForm<SettingFormData>();

  const formValues = watch();

  // Tab configurations
  const tabs = [
    { value: SettingCategory.GENERAL, label: 'Опште', icon: Building },
    { value: SettingCategory.CONTACT, label: 'Контакт', icon: Phone },
    { value: SettingCategory.SOCIAL, label: 'Друштвене мреже', icon: Share2 },
    { value: SettingCategory.SEO, label: 'СЕО', icon: Search },
    { value: SettingCategory.EMAIL, label: 'Имејл', icon: Mail },
    { value: SettingCategory.APPEARANCE, label: 'Изглед', icon: Palette },
    { value: SettingCategory.ADVANCED, label: 'Напредно', icon: Shield },
  ];

  // Initialize form data when settings change
  useEffect(() => {
    if (rawSettings.length > 0) {
      const formData: SettingFormData = {};
      const fileValues: typeof originalFileValues = {};
      
      rawSettings.forEach(setting => {
        let value: any = setting.value;
        
        if (setting.type === SettingType.NUMBER) {
          value = parseInt(setting.value, 10) || 0;
        } else if (setting.type === SettingType.BOOLEAN) {
          value = setting.value === 'true';
        }
        
        formData[setting.key] = value;
        
        // Store original file values
        if (setting.key === SETTING_KEYS.SITE_LOGO || setting.key === SETTING_KEYS.SITE_FAVICON) {
          fileValues[setting.key as keyof typeof fileValues] = setting.value;
        }
      });

      // Reset form with current values - this will reset isDirty to false
      reset(formData);
      setOriginalFileValues(fileValues);
      
      // Set logo and favicon previews from actual database values
      const logoSetting = rawSettings.find(s => s.key === SETTING_KEYS.SITE_LOGO);
      if (logoSetting?.value) {
        setLogoPreview(mediaApi.getFileUrl(logoSetting.value));
      } else {
        setLogoPreview(null);
      }
      
      const faviconSetting = rawSettings.find(s => s.key === SETTING_KEYS.SITE_FAVICON);
      if (faviconSetting?.value) {
        setFaviconPreview(mediaApi.getFileUrl(faviconSetting.value));
      } else {
        setFaviconPreview(null);
      }

      // Clear pending uploads when settings refresh
      setPendingFileUploads({});
      setHasChanges(false);
    }
  }, [rawSettings, reset]);

  // Track changes including file uploads
  useEffect(() => {
    const hasFormChanges = isDirty;
    const hasFileChanges = Object.keys(pendingFileUploads).length > 0;
    setHasChanges(hasFormChanges || hasFileChanges);
  }, [isDirty, pendingFileUploads]);

  const onSubmit = async (data: SettingFormData) => {
    try {
      setIsSaving(true);
      
      // Handle file uploads/removals first
      const fileUpdates: Array<{ key: string; value: string }> = [];
      
      for (const [key, fileAction] of Object.entries(pendingFileUploads)) {
        if (fileAction === null) {
          // Remove file
          fileUpdates.push({ key, value: '' });
        } else if (fileAction instanceof File) {
          // Upload new file
          try {
            const uploadedSetting = await uploadFile(key, fileAction);
            fileUpdates.push({ key, value: uploadedSetting.value });
          } catch (error) {
            console.error(`Error uploading ${key}:`, error);
            toast.error(`Грешка при учитавању ${key === SETTING_KEYS.SITE_LOGO ? 'лога' : 'фавикона'}`);
            return;
          }
        }
      }
      
      // Prepare text updates - exclude file fields as they are handled above
      const textUpdates: UpdateMultipleSettingsDto = {
        settings: [
          ...Object.entries(data)
            .filter(([key]) => key !== SETTING_KEYS.SITE_LOGO && key !== SETTING_KEYS.SITE_FAVICON)
            .map(([key, value]) => ({
              key,
              value: String(value)
            })),
          ...fileUpdates
        ]
      };
      
      // Update all settings
      if (textUpdates.settings.length > 0) {
        await updateMultipleSettings(textUpdates);
        
        // Reset form with the new values immediately
        const newFormData: SettingFormData = {};
        rawSettings.forEach(setting => {
          // Check if this setting was updated
          const updatedSetting = textUpdates.settings.find(u => u.key === setting.key);
          let value: any = updatedSetting ? updatedSetting.value : setting.value;
          
          if (setting.type === SettingType.NUMBER) {
            value = parseInt(value, 10) || 0;
          } else if (setting.type === SettingType.BOOLEAN) {
            value = value === 'true' || value === true;
          }
          
          newFormData[setting.key] = value;
        });
        
        // Apply the updates to the form data
        textUpdates.settings.forEach(update => {
          let value: any = update.value;
          const setting = rawSettings.find(s => s.key === update.key);
          
          if (setting?.type === SettingType.NUMBER) {
            value = parseInt(value, 10) || 0;
          } else if (setting?.type === SettingType.BOOLEAN) {
            value = value === 'true' || value === true;
          }
          
          newFormData[update.key] = value;
        });
        
        // Reset form with updated values - this will make isDirty = false
        reset(newFormData);
      }
      
      // Clear all change tracking
      setPendingFileUploads({});
      setHasChanges(false);
      
      // Refresh settings to get the latest file URLs
      await refreshSettings();
      
      toast.success('Подешавања су успешно сачувана');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Грешка при чувању подешавања');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (file: File) => {
    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        toast.error('Молимо изаберите слику');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Фајл је превелик. Максимална величина је 5МБ');
        return;
      }

      // Store file as pending upload (don't upload immediately)
      setPendingFileUploads(prev => ({
        ...prev,
        [SETTING_KEYS.SITE_LOGO]: file
      }));
      
      // Set preview
      const preview = URL.createObjectURL(file);
      setLogoPreview(preview);
      
      toast.success('Лого је спреман за чување');
    } catch (error) {
      console.error('Error preparing logo:', error);
      toast.error('Грешка при припреми лога');
    }
  };

  const handleFaviconUpload = async (file: File) => {
    try {
      // Validate file
      if (!file.type.match(/image\/(x-icon|png)/)) {
        toast.error('Молимо изаберите ИЦО или ПНГ фајл');
        return;
      }
      if (file.size > 1024 * 1024) {
        toast.error('Фајл је превелик. Максимална величина је 1МБ');
        return;
      }

      // Store file as pending upload (don't upload immediately)
      setPendingFileUploads(prev => ({
        ...prev,
        [SETTING_KEYS.SITE_FAVICON]: file
      }));
      
      // Set preview
      const preview = URL.createObjectURL(file);
      setFaviconPreview(preview);
      
      toast.success('Фавикон је спреман за чување');
    } catch (error) {
      console.error('Error preparing favicon:', error);
      toast.error('Грешка при припреми фавикона');
    }
  };

  const handleRemoveLogo = () => {
    // Mark for removal (don't remove immediately from database)
    setPendingFileUploads(prev => ({
      ...prev,
      [SETTING_KEYS.SITE_LOGO]: null
    }));
    
    // Clear preview
    setLogoPreview(null);
    
    toast.success('Лого је означен за уклањање');
  };

  const handleRemoveFavicon = () => {
    // Mark for removal (don't remove immediately from database)
    setPendingFileUploads(prev => ({
      ...prev,
      [SETTING_KEYS.SITE_FAVICON]: null
    }));
    
    // Clear preview
    setFaviconPreview(null);
    
    toast.success('Фавикон је означен за уклањање');
  };

  const handleDragOver = (e: React.DragEvent, type: 'logo' | 'favicon') => {
    e.preventDefault();
    e.stopPropagation();
    if (type === 'logo') {
      setIsDraggingLogo(true);
    } else {
      setIsDraggingFavicon(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent, type: 'logo' | 'favicon') => {
    e.preventDefault();
    e.stopPropagation();
    if (type === 'logo') {
      setIsDraggingLogo(false);
    } else {
      setIsDraggingFavicon(false);
    }
  };

  const handleDrop = async (e: React.DragEvent, type: 'logo' | 'favicon') => {
    e.preventDefault();
    e.stopPropagation();
    
    if (type === 'logo') {
      setIsDraggingLogo(false);
    } else {
      setIsDraggingFavicon(false);
    }

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const file = files[0];
    if (type === 'logo') {
      await handleLogoUpload(file);
    } else {
      await handleFaviconUpload(file);
    }
  };

  const handleReset = async () => {
    try {
      // Reset all settings
      await resetSettings();
      
      // Clear local state
      setPendingFileUploads({});
      setLogoPreview(null);
      setFaviconPreview(null);
      setHasChanges(false);
      
      // Refresh settings to get the reset values
      await refreshSettings();
      
      setIsResetDialogOpen(false);
      toast.success('Подешавања су ресетована');
    } catch (error) {
      console.error('Error resetting settings:', error);
      toast.error('Грешка при ресетовању подешавања');
    }
  };

  const handleFormReset = () => {
    // Reset form to original values
    reset();
    
    // Reset file previews to original values
    setLogoPreview(originalFileValues[SETTING_KEYS.SITE_LOGO] 
      ? mediaApi.getFileUrl(originalFileValues[SETTING_KEYS.SITE_LOGO] as string) 
      : null);
    setFaviconPreview(originalFileValues[SETTING_KEYS.SITE_FAVICON] 
      ? mediaApi.getFileUrl(originalFileValues[SETTING_KEYS.SITE_FAVICON] as string) 
      : null);
    
    // Clear pending uploads and file actions
    setPendingFileUploads({});
    setHasChanges(false);
    
    toast.success('Измене су поништене');
  };

  const handleExport = async () => {
    try {
      const data = await exportSettings();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cms-settings-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Подешавања су експортована');
    } catch (error) {
      console.error('Error exporting settings:', error);
    }
  };

  const handleImport = async () => {
    try {
      const data = JSON.parse(importData);
      await importSettings(data);
      setIsImportDialogOpen(false);
      setImportData('');
    } catch (error) {
      console.error('Error importing settings:', error);
      toast.error('Неисправни формат података');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Подешавања</h1>
          <p className="text-muted-foreground">
            Управљајте подешавањима вашег ЦМС портала
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
          >
            <Download className="mr-2 h-4 w-4" />
            Експортуј
          </Button>
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                Импортуј
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Импортуј подешавања</DialogTitle>
                <DialogDescription>
                  Залепите ЈСОН податке експортованих подешавања
                </DialogDescription>
              </DialogHeader>
              <Textarea
                placeholder='{"site_name": "Мој ЦМС", ...}'
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                rows={10}
                className="font-mono text-xs"
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                  Откажи
                </Button>
                <Button onClick={handleImport} disabled={!importData}>
                  Импортуј
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Unsaved changes alert */}
      {hasChanges && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <p className="text-sm font-medium text-yellow-800">
                Имате несачуване измене
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleFormReset}
                className='dark:text-gray-900 dark:hover:bg-white dark:hover:text-gray-900'
              >
                Поништи
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit(onSubmit)}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Чува се...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Сачувај измене
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as SettingCategory)}>
          <TabsList className="grid w-full grid-cols-7">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger key={tab.value} value={tab.value} className="text-xs">
                  <Icon className="mr-1 h-4 w-4" />
                  <span className="hidden lg:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* General Settings */}
          <TabsContent value={SettingCategory.GENERAL}>
            <Card>
              <CardHeader>
                <CardTitle>Општа подешавања</CardTitle>
                <CardDescription>
                  Основна подешавања вашег ЦМС портала
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={SETTING_KEYS.SITE_NAME}>Назив сајта</Label>
                    <Input
                      id={SETTING_KEYS.SITE_NAME}
                      {...register(SETTING_KEYS.SITE_NAME, { required: 'Назив сајта је обавезан' })}
                      placeholder="Моја институција"
                    />
                    {errors[SETTING_KEYS.SITE_NAME] && (
                      <p className="text-sm text-red-600">{errors[SETTING_KEYS.SITE_NAME]!.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={SETTING_KEYS.SITE_TAGLINE}>Слоган</Label>
                    <Input
                      id={SETTING_KEYS.SITE_TAGLINE}
                      {...register(SETTING_KEYS.SITE_TAGLINE)}
                      placeholder="Транспарентност и доступност"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Лого сајта</Label>
                    <div className="space-y-3">
                      {logoPreview && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Тренутни лого:</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={handleRemoveLogo}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <img 
                            src={logoPreview} 
                            alt="Logo preview" 
                            className="h-20 object-contain mx-auto"
                          />
                        </div>
                      )}
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              await handleLogoUpload(file);
                            }
                          }}
                          className="hidden"
                          id="logo-upload"
                        />
                        <label
                          htmlFor="logo-upload"
                          className={cn(
                            "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all dark:bg-gray-900",
                            isDraggingLogo 
                              ? "border-blue-500 bg-blue-50 scale-105" 
                              : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                          )}
                          onDragOver={(e) => handleDragOver(e, 'logo')}
                          onDragLeave={(e) => handleDragLeave(e, 'logo')}
                          onDrop={(e) => handleDrop(e, 'logo')}
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className={cn(
                              "w-8 h-8 mb-3",
                              isDraggingLogo ? "text-blue-600" : "text-gray-400"
                            )} />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Кликните за учитавање</span> или превуците фајл
                            </p>
                            <p className="text-xs text-gray-500">ПНГ, ЈПГ, ГИФ до 5МБ</p>
                          </div>
                        </label>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Препоручене димензије: 200x60пx, максимална величина: 5МБ
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Фавикон</Label>
                    <div className="space-y-3">
                      {faviconPreview && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Тренутни фавикон:</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={handleRemoveFavicon}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <img 
                            src={faviconPreview} 
                            alt="Favicon preview" 
                            className="h-8 w-8 mx-auto"
                          />
                        </div>
                      )}
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/x-icon,image/png"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              await handleFaviconUpload(file);
                            }
                          }}
                          className="hidden"
                          id="favicon-upload"
                        />
                        <label
                          htmlFor="favicon-upload"
                          className={cn(
                            "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all dark:bg-gray-900",
                            isDraggingFavicon 
                              ? "border-blue-500 bg-blue-50 scale-105" 
                              : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                          )}
                          onDragOver={(e) => handleDragOver(e, 'favicon')}
                          onDragLeave={(e) => handleDragLeave(e, 'favicon')}
                          onDrop={(e) => handleDrop(e, 'favicon')}
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className={cn(
                              "w-8 h-8 mb-3",
                              isDraggingFavicon ? "text-blue-600" : "text-gray-400"
                            )} />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Кликните за учитавање</span> или превуците фајл
                            </p>
                            <p className="text-xs text-gray-500">ИЦО или ПНГ до 1МБ</p>
                          </div>
                        </label>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Формати: ИЦО или ПНГ, препоручено: 32x32пx
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={SETTING_KEYS.SITE_LANGUAGE}>Језик</Label>
                    <Select
                      value={formValues[SETTING_KEYS.SITE_LANGUAGE] as any || 'sr'}
                      onValueChange={(value) => setValue(SETTING_KEYS.SITE_LANGUAGE, value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sr">Српски</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={SETTING_KEYS.TIMEZONE}>Временска зона</Label>
                    <Select
                      value={formValues[SETTING_KEYS.TIMEZONE] as any || 'Europe/Belgrade'}
                      onValueChange={(value) => setValue(SETTING_KEYS.TIMEZONE, value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Europe/Belgrade">Београд (УТЦ+1)</SelectItem>
                        <SelectItem value="Europe/London">Лондон (УТЦ+0)</SelectItem>
                        <SelectItem value="America/New_York">Њујорк (УТЦ-5)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Settings */}
          <TabsContent value={SettingCategory.CONTACT}>
            <Card>
              <CardHeader>
                <CardTitle>Контакт информације</CardTitle>
                <CardDescription>
                  Контакт подаци ваше институције
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={SETTING_KEYS.CONTACT_ADDRESS}>
                      <MapPin className="inline-block mr-2 h-4 w-4" />
                      Адреса
                    </Label>
                    <Textarea
                      id={SETTING_KEYS.CONTACT_ADDRESS}
                      {...register(SETTING_KEYS.CONTACT_ADDRESS)}
                      placeholder="Улица и број, Поштански број Град"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={SETTING_KEYS.CONTACT_PHONE}>
                      <Phone className="inline-block mr-2 h-4 w-4" />
                      Телефон
                    </Label>
                    <Input
                      id={SETTING_KEYS.CONTACT_PHONE}
                      {...register(SETTING_KEYS.CONTACT_PHONE)}
                      placeholder="+381 11 123 4567"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={SETTING_KEYS.CONTACT_EMAIL}>
                      <Mail className="inline-block mr-2 h-4 w-4" />
                      Имејл
                    </Label>
                    <Input
                      id={SETTING_KEYS.CONTACT_EMAIL}
                      type="email"
                      {...register(SETTING_KEYS.CONTACT_EMAIL)}
                      placeholder="info@mojainstitucija.rs"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={SETTING_KEYS.CONTACT_WORKING_HOURS}>
                      <Clock className="inline-block mr-2 h-4 w-4" />
                      Радно време
                    </Label>
                    <Textarea
                      id={SETTING_KEYS.CONTACT_WORKING_HOURS}
                      {...register(SETTING_KEYS.CONTACT_WORKING_HOURS)}
                      placeholder="Понедељак - Петак: 08:00 - 16:00"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={SETTING_KEYS.CONTACT_MAP_URL}>
                      <Globe className="inline-block mr-2 h-4 w-4" />
                      Гугл мапе УРЛ
                    </Label>
                    <Input
                      id={SETTING_KEYS.CONTACT_MAP_URL}
                      {...register(SETTING_KEYS.CONTACT_MAP_URL)}
                      placeholder="https://maps.google.com/..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Унесите ембед УРЛ са Гугл мапа
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Media Settings */}
          <TabsContent value={SettingCategory.SOCIAL}>
            <Card>
              <CardHeader>
                <CardTitle>Друштвене мреже</CardTitle>
                <CardDescription>
                  Линкови ка профилима на друштвеним мрежама
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={SETTING_KEYS.SOCIAL_FACEBOOK}>
                      <Facebook className="inline-block mr-2 h-4 w-4" />
                      Фејсбук
                    </Label>
                    <Input
                      id={SETTING_KEYS.SOCIAL_FACEBOOK}
                      {...register(SETTING_KEYS.SOCIAL_FACEBOOK)}
                      placeholder="https://facebook.com/mojainstitucija"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={SETTING_KEYS.SOCIAL_TWITTER}>
                      <Twitter className="inline-block mr-2 h-4 w-4" />
                      Твитер/X
                    </Label>
                    <Input
                      id={SETTING_KEYS.SOCIAL_TWITTER}
                      {...register(SETTING_KEYS.SOCIAL_TWITTER)}
                      placeholder="https://twitter.com/mojainstitucija"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={SETTING_KEYS.SOCIAL_INSTAGRAM}>
                      <Instagram className="inline-block mr-2 h-4 w-4" />
                      Инстаграм
                    </Label>
                    <Input
                      id={SETTING_KEYS.SOCIAL_INSTAGRAM}
                      {...register(SETTING_KEYS.SOCIAL_INSTAGRAM)}
                      placeholder="https://instagram.com/mojainstitucija"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={SETTING_KEYS.SOCIAL_LINKEDIN}>
                      <Linkedin className="inline-block mr-2 h-4 w-4" />
                      ЛинкедИн
                    </Label>
                    <Input
                      id={SETTING_KEYS.SOCIAL_LINKEDIN}
                      {...register(SETTING_KEYS.SOCIAL_LINKEDIN)}
                      placeholder="https://linkedin.com/company/mojainstitucija"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={SETTING_KEYS.SOCIAL_YOUTUBE}>
                      <Youtube className="inline-block mr-2 h-4 w-4" />
                      Јутјуб
                    </Label>
                    <Input
                      id={SETTING_KEYS.SOCIAL_YOUTUBE}
                      {...register(SETTING_KEYS.SOCIAL_YOUTUBE)}
                      placeholder="https://youtube.com/@mojainstitucija"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO Settings */}
          <TabsContent value={SettingCategory.SEO}>
            <Card>
              <CardHeader>
                <CardTitle>СЕО подешавања</CardTitle>
                <CardDescription>
                  Оптимизација за претраживаче и аналитика
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor={SETTING_KEYS.SEO_TITLE}>Мета наслов</Label>
                    <Input
                      id={SETTING_KEYS.SEO_TITLE}
                      {...register(SETTING_KEYS.SEO_TITLE)}
                      placeholder="Моја институција - Званични портал"
                    />
                    <p className="text-xs text-muted-foreground">
                      Приказује се у резултатима претраге (50-60 карактера)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={SETTING_KEYS.SEO_DESCRIPTION}>Мета опис</Label>
                    <Textarea
                      id={SETTING_KEYS.SEO_DESCRIPTION}
                      {...register(SETTING_KEYS.SEO_DESCRIPTION)}
                      placeholder="Званични портал локалне институције са најновијим вестима..."
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      Кратак опис сајта (150-160 карактера)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={SETTING_KEYS.SEO_KEYWORDS}>Кључне речи</Label>
                    <Input
                      id={SETTING_KEYS.SEO_KEYWORDS}
                      {...register(SETTING_KEYS.SEO_KEYWORDS)}
                      placeholder="институција, локална самоуправа, транспарентност"
                    />
                    <p className="text-xs text-muted-foreground">
                      Одвојене зарезом
                    </p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={SETTING_KEYS.SEO_GOOGLE_ANALYTICS}>
                        Гугл аналитикс ИД
                      </Label>
                      <Input
                        id={SETTING_KEYS.SEO_GOOGLE_ANALYTICS}
                        {...register(SETTING_KEYS.SEO_GOOGLE_ANALYTICS)}
                        placeholder="G-XXXXXXXXXX"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={SETTING_KEYS.SEO_GOOGLE_TAG_MANAGER}>
                        Гугл таг менаџер ИД
                      </Label>
                      <Input
                        id={SETTING_KEYS.SEO_GOOGLE_TAG_MANAGER}
                        {...register(SETTING_KEYS.SEO_GOOGLE_TAG_MANAGER)}
                        placeholder="GTM-XXXXXXX"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Settings */}
          <TabsContent value={SettingCategory.EMAIL}>
            <Card>
              <CardHeader>
                <CardTitle>Имејл подешавања</CardTitle>
                <CardDescription>
                  СМТП конфигурација за слање имејл порука
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={SETTING_KEYS.EMAIL_SMTP_HOST}>СМТП сервер</Label>
                    <Input
                      id={SETTING_KEYS.EMAIL_SMTP_HOST}
                      {...register(SETTING_KEYS.EMAIL_SMTP_HOST)}
                      placeholder="smtp.gmail.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={SETTING_KEYS.EMAIL_SMTP_PORT}>СМТП порт</Label>
                    <Input
                      id={SETTING_KEYS.EMAIL_SMTP_PORT}
                      type="number"
                      {...register(SETTING_KEYS.EMAIL_SMTP_PORT, { valueAsNumber: true })}
                      placeholder="587"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={SETTING_KEYS.EMAIL_SMTP_USER}>СМТП корисничко име</Label>
                    <Input
                      id={SETTING_KEYS.EMAIL_SMTP_USER}
                      {...register(SETTING_KEYS.EMAIL_SMTP_USER)}
                      placeholder="noreply@mojainstitucija.rs"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={SETTING_KEYS.EMAIL_SMTP_PASS}>СМТП лозинка</Label>
                    <Input
                      id={SETTING_KEYS.EMAIL_SMTP_PASS}
                      type="password"
                      {...register(SETTING_KEYS.EMAIL_SMTP_PASS)}
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={SETTING_KEYS.EMAIL_FROM_NAME}>Име пошиљаоца</Label>
                    <Input
                      id={SETTING_KEYS.EMAIL_FROM_NAME}
                      {...register(SETTING_KEYS.EMAIL_FROM_NAME)}
                      placeholder="Моја институција"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={SETTING_KEYS.EMAIL_FROM_ADDRESS}>Имејл пошиљаоца</Label>
                    <Input
                      id={SETTING_KEYS.EMAIL_FROM_ADDRESS}
                      type="email"
                      {...register(SETTING_KEYS.EMAIL_FROM_ADDRESS)}
                      placeholder="noreply@mojainstitucija.rs"
                    />
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">Напомена</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        За Гмејл користите апликациону лозинку уместо обичне лозинке.
                        За друге провајдере проверите СМТП документацију.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value={SettingCategory.APPEARANCE}>
            <Card>
              <CardHeader>
                <CardTitle>Подешавања изгледа</CardTitle>
                <CardDescription>
                  Прилагодите визуелни идентитет портала
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={SETTING_KEYS.THEME_PRIMARY_COLOR}>Примарна боја</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id={SETTING_KEYS.THEME_PRIMARY_COLOR}
                        type="color"
                        {...register(SETTING_KEYS.THEME_PRIMARY_COLOR)}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={(formValues[SETTING_KEYS.THEME_PRIMARY_COLOR] as string) || '#3B82F6'}
                        onChange={(e) => setValue(SETTING_KEYS.THEME_PRIMARY_COLOR, e.target.value)}
                        placeholder="#3B82F6"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={SETTING_KEYS.THEME_SECONDARY_COLOR}>Секундарна боја</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id={SETTING_KEYS.THEME_SECONDARY_COLOR}
                        type="color"
                        {...register(SETTING_KEYS.THEME_SECONDARY_COLOR)}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={(formValues[SETTING_KEYS.THEME_SECONDARY_COLOR] as string) || '#10B981'}
                        onChange={(e) => setValue(SETTING_KEYS.THEME_SECONDARY_COLOR, e.target.value)}
                        placeholder="#10B981"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={SETTING_KEYS.THEME_FONT_FAMILY}>Фонт фамилија</Label>
                    <Select
                      value={(formValues[SETTING_KEYS.THEME_FONT_FAMILY] as string) || 'Inter'}
                      onValueChange={(value) => setValue(SETTING_KEYS.THEME_FONT_FAMILY, value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter">Интер</SelectItem>
                        <SelectItem value="Roboto">Робото</SelectItem>
                        <SelectItem value="Open Sans">Опен Санс</SelectItem>
                        <SelectItem value="Lato">Лато</SelectItem>
                        <SelectItem value="Poppins">Попинс</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={SETTING_KEYS.THEME_DARK_MODE}
                        {...register(SETTING_KEYS.THEME_DARK_MODE)}
                        className="rounded"
                      />
                      <Label htmlFor={SETTING_KEYS.THEME_DARK_MODE}>
                        Омогући тамни режим
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Дозволите корисницима да бирају између светле и тамне теме
                    </p>
                  </div>
                </div>

                {/* Preview */}
                <div className="border rounded-lg p-6 bg-gray-50 dark:bg-gray-900">
                  <h4 className="text-sm font-medium mb-4">Преглед боја</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-20 h-10 rounded-md border"
                        style={{ backgroundColor: (formValues[SETTING_KEYS.THEME_PRIMARY_COLOR] as string) || '#3B82F6' }}
                      />
                      <span className="text-sm">Примарна боја</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-20 h-10 rounded-md border"
                        style={{ backgroundColor: (formValues[SETTING_KEYS.THEME_SECONDARY_COLOR] as string) || '#10B981' }}
                      />
                      <span className="text-sm">Секундарна боја</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Settings */}
          <TabsContent value={SettingCategory.ADVANCED}>
            <Card>
              <CardHeader>
                <CardTitle>Напредна подешавања</CardTitle>
                <CardDescription>
                  Додатне опције и конфигурација система
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={SETTING_KEYS.MAINTENANCE_MODE}
                        {...register(SETTING_KEYS.MAINTENANCE_MODE)}
                        className="rounded"
                      />
                      <Label htmlFor={SETTING_KEYS.MAINTENANCE_MODE}>
                        Режим одржавања
                      </Label>
                    </div>
                    
                    {formValues[SETTING_KEYS.MAINTENANCE_MODE] === true && (
                      <div className="ml-6 space-y-2">
                        <Label htmlFor={SETTING_KEYS.MAINTENANCE_MESSAGE}>
                          Порука одржавања
                        </Label>
                        <Textarea
                          id={SETTING_KEYS.MAINTENANCE_MESSAGE}
                          {...register(SETTING_KEYS.MAINTENANCE_MESSAGE)}
                          placeholder="Сајт је тренутно у одржавању. Молимо вас покушајте поново за неколико минута."
                          rows={3}
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={SETTING_KEYS.POSTS_PER_PAGE}>
                        Објава по страници
                      </Label>
                      <Input
                        id={SETTING_KEYS.POSTS_PER_PAGE}
                        type="number"
                        {...register(SETTING_KEYS.POSTS_PER_PAGE, { 
                          valueAsNumber: true,
                          min: { value: 1, message: 'Минимум је 1' },
                          max: { value: 50, message: 'Максимум је 50' }
                        })}
                        placeholder="10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={SETTING_KEYS.API_KEY_GOOGLE_MAPS}>
                        Гугл мапе АПИ кључ
                      </Label>
                      <Input
                        id={SETTING_KEYS.API_KEY_GOOGLE_MAPS}
                        type="password"
                        {...register(SETTING_KEYS.API_KEY_GOOGLE_MAPS)}
                        placeholder="AIzaSy..."
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={SETTING_KEYS.ALLOW_COMMENTS}
                        {...register(SETTING_KEYS.ALLOW_COMMENTS)}
                        className="rounded"
                      />
                      <Label htmlFor={SETTING_KEYS.ALLOW_COMMENTS}>
                        Дозволи коментаре на објавама
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={SETTING_KEYS.ALLOW_REGISTRATION}
                        {...register(SETTING_KEYS.ALLOW_REGISTRATION)}
                        className="rounded"
                      />
                      <Label htmlFor={SETTING_KEYS.ALLOW_REGISTRATION}>
                        Дозволи регистрацију нових корисника
                      </Label>
                    </div>
                  </div>

                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-red-800">Опасна зона</h4>
                        <p className="text-sm text-red-700 mt-1">
                          Ове акције могу трајно променити податке.
                        </p>
                        <div className="mt-3">
                          <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                            <DialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Ресетуј подешавања
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Ресетуј подешавања</DialogTitle>
                                <DialogDescription>
                                  Да ли сте сигурни да желите да ресетујете подешавања на подразумеване вредности?
                                  Ова акција ће обрисати све ваше измене.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsResetDialogOpen(false)}>
                                  Откажи
                                </Button>
                                <Button variant="destructive" onClick={handleReset}>
                                  Ресетуј
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end mt-6">
          <Button
            type="submit"
            size="lg"
            disabled={isSaving || !hasChanges}
            variant={theme === "light" ? "default" : "secondaryDefault"}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Чува се...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Сачувај све измене
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}