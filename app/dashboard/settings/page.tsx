// app/dashboard/settings/page.tsx
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
    importSettings
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
    { value: SettingCategory.GENERAL, label: 'Opšte', icon: Building },
    { value: SettingCategory.CONTACT, label: 'Kontakt', icon: Phone },
    { value: SettingCategory.SOCIAL, label: 'Društvene mreže', icon: Share2 },
    { value: SettingCategory.SEO, label: 'SEO', icon: Search },
    { value: SettingCategory.EMAIL, label: 'Email', icon: Mail },
    { value: SettingCategory.APPEARANCE, label: 'Izgled', icon: Palette },
    { value: SettingCategory.ADVANCED, label: 'Napredno', icon: Shield },
  ];

  useEffect(() => {
    if (rawSettings.length > 0) {
      const formData: SettingFormData = {};
      
      rawSettings.forEach(setting => {
        let value: any = setting.value;
        
        if (setting.type === SettingType.NUMBER) {
          value = parseInt(setting.value, 10) || 0;
        } else if (setting.type === SettingType.BOOLEAN) {
          value = setting.value === 'true';
        }
        
        formData[setting.key] = value;
      });
      
      reset(formData);
      
      // Set logo and favicon previews
      const logoSetting = rawSettings.find(s => s.key === SETTING_KEYS.SITE_LOGO);
      if (logoSetting?.value) {
        setLogoPreview(mediaApi.getFileUrl(logoSetting.value));
      }
      
      const faviconSetting = rawSettings.find(s => s.key === SETTING_KEYS.SITE_FAVICON);
      if (faviconSetting?.value) {
        setFaviconPreview(mediaApi.getFileUrl(faviconSetting.value));
      }
    }
  }, [rawSettings, reset]);

  useEffect(() => {
    setHasChanges(isDirty);
  }, [isDirty]);

  const onSubmit = async (data: SettingFormData) => {
    try {
      setIsSaving(true);
      
      const updates: UpdateMultipleSettingsDto = {
        settings: Object.entries(data).map(([key, value]) => ({
          key,
          value: String(value)
        }))
      };
      
      await updateMultipleSettings(updates);
      setHasChanges(false);
      toast.success('Podešavanja su uspešno sačuvana');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Greška pri čuvanju podešavanja');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (file: File) => {
    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        toast.error('Molimo izaberite sliku');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Fajl je prevelik. Maksimalna veličina je 5MB');
        return;
      }

      await uploadFile(SETTING_KEYS.SITE_LOGO, file);
      const preview = URL.createObjectURL(file);
      setLogoPreview(preview);
      setHasChanges(true);
    } catch (error) {
      console.error('Error uploading logo:', error);
      throw error;
    }
  };

  const handleFaviconUpload = async (file: File) => {
    try {
      // Validate file
      if (!file.type.match(/image\/(x-icon|png)/)) {
        toast.error('Molimo izaberite ICO ili PNG fajl');
        return;
      }
      if (file.size > 1024 * 1024) {
        toast.error('Fajl je prevelik. Maksimalna veličina je 1MB');
        return;
      }

      await uploadFile(SETTING_KEYS.SITE_FAVICON, file);
      const preview = URL.createObjectURL(file);
      setFaviconPreview(preview);
      setHasChanges(true);
    } catch (error) {
      console.error('Error uploading favicon:', error);
      throw error;
    }
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
      await resetSettings(activeTab);
      setIsResetDialogOpen(false);
    } catch (error) {
      console.error('Error resetting settings:', error);
    }
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
      toast.success('Podešavanja su eksportovana');
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
      toast.error('Neispravni format podataka');
    }
  };

  const getCategorySettings = (category: SettingCategory) => {
    return rawSettings.filter(setting => setting.category === category);
  };

  const renderSettingField = (setting: any) => {
    const value = formValues[setting.key] || '';

    switch (setting.type) {
      case SettingType.BOOLEAN:
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={setting.key}
              {...register(setting.key)}
              className="rounded"
            />
            <Label htmlFor={setting.key}>{setting.label}</Label>
          </div>
        );

      case SettingType.NUMBER:
        return (
          <div className="space-y-2">
            <Label htmlFor={setting.key}>{setting.label}</Label>
            <Input
              id={setting.key}
              type="number"
              {...register(setting.key, { 
                valueAsNumber: true,
                min: setting.validation?.min,
                max: setting.validation?.max
              })}
              placeholder={setting.description}
            />
          </div>
        );

      case SettingType.COLOR:
        return (
          <div className="space-y-2">
            <Label htmlFor={setting.key}>{setting.label}</Label>
            <div className="flex items-center space-x-2">
              <Input
                id={setting.key}
                type="color"
                {...register(setting.key)}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={value as any}
                onChange={(e) => setValue(setting.key, e.target.value)}
                placeholder="#000000"
                className="flex-1"
              />
            </div>
          </div>
        );

      case SettingType.SELECT:
        return (
          <div className="space-y-2">
            <Label>{setting.label}</Label>
            <Select
              value={value as any}
              onValueChange={(val) => setValue(setting.key, val)}
            >
              <SelectTrigger>
                <SelectValue placeholder={setting.description} />
              </SelectTrigger>
              <SelectContent>
                {setting.options?.map((option: string) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case SettingType.FILE:
        // Special handling for logo and favicon
        if (setting.key === SETTING_KEYS.SITE_LOGO) {
          return (
            <div className="space-y-2">
              <Label>{setting.label}</Label>
              {logoPreview && (
                <div className="mb-4">
                  <img 
                    src={logoPreview} 
                    alt="Logo preview" 
                    className="h-20 object-contain"
                  />
                </div>
              )}
              <DragDropUpload
                onFileUpload={handleLogoUpload}
                accept="image/*"
                maxSize={5}
                multiple={false}
                className="h-32"
              />
            </div>
          );
        } else if (setting.key === SETTING_KEYS.SITE_FAVICON) {
          return (
            <div className="space-y-2">
              <Label>{setting.label}</Label>
              {faviconPreview && (
                <div className="mb-4">
                  <img 
                    src={faviconPreview} 
                    alt="Favicon preview" 
                    className="h-8 w-8"
                  />
                </div>
              )}
              <DragDropUpload
                onFileUpload={handleFaviconUpload}
                accept="image/x-icon,image/png"
                maxSize={1}
                multiple={false}
                className="h-32"
              />
            </div>
          );
        }
        return null;

      default:
        return (
          <div className="space-y-2">
            <Label htmlFor={setting.key}>{setting.label}</Label>
            {setting.key.includes('message') || setting.key.includes('description') ? (
              <Textarea
                id={setting.key}
                {...register(setting.key)}
                placeholder={setting.description}
                rows={3}
              />
            ) : (
              <Input
                id={setting.key}
                type="text"
                {...register(setting.key)}
                placeholder={setting.description}
              />
            )}
            {setting.description && (
              <p className="text-xs text-muted-foreground">{setting.description}</p>
            )}
          </div>
        );
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
          <h1 className="text-3xl font-bold tracking-tight">Podešavanja</h1>
          <p className="text-muted-foreground">
            Upravljajte podešavanjima vašeg CMS portala
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
          >
            <Download className="mr-2 h-4 w-4" />
            Eksportuj
          </Button>
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                Importuj
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Importuj podešavanja</DialogTitle>
                <DialogDescription>
                  Zalepite JSON podatke eksportovanih podešavanja
                </DialogDescription>
              </DialogHeader>
              <Textarea
                placeholder='{"site_name": "Moj CMS", ...}'
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                rows={10}
                className="font-mono text-xs"
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                  Otkaži
                </Button>
                <Button onClick={handleImport} disabled={!importData}>
                  Importuj
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
                Imate nesačuvane izmene
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => reset()}
              >
                Poništi
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit(onSubmit)}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Čuva se...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Sačuvaj izmene
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
                <CardTitle>Opšta podešavanja</CardTitle>
                <CardDescription>
                  Osnovna podešavanja vašeg CMS portala
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={SETTING_KEYS.SITE_NAME}>Naziv sajta</Label>
                    <Input
                      id={SETTING_KEYS.SITE_NAME}
                      {...register(SETTING_KEYS.SITE_NAME, { required: 'Naziv sajta je obavezan' })}
                      placeholder="Moja institucija"
                    />
                    {errors[SETTING_KEYS.SITE_NAME] && (
                      <p className="text-sm text-red-600">{errors[SETTING_KEYS.SITE_NAME]!.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={SETTING_KEYS.SITE_TAGLINE}>Slogan</Label>
                    <Input
                      id={SETTING_KEYS.SITE_TAGLINE}
                      {...register(SETTING_KEYS.SITE_TAGLINE)}
                      placeholder="Transparentnost i dostupnost"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Logo sajta</Label>
                    <div className="space-y-3">
                      {logoPreview && (
                        <div className="p-4 bg-gray-50 rounded-lg border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Trenutni logo:</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setLogoPreview(null);
                                setValue(SETTING_KEYS.SITE_LOGO, '');
                                setHasChanges(true);
                              }}
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
                            "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all",
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
                              <span className="font-semibold">Kliknite za upload</span> ili prevucite fajl
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF do 5MB</p>
                          </div>
                        </label>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Preporučene dimenzije: 200x60px, maksimalna veličina: 5MB
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Favicon</Label>
                    <div className="space-y-3">
                      {faviconPreview && (
                        <div className="p-4 bg-gray-50 rounded-lg border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Trenutni favicon:</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setFaviconPreview(null);
                                setValue(SETTING_KEYS.SITE_FAVICON, '');
                                setHasChanges(true);
                              }}
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
                            "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all",
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
                              <span className="font-semibold">Kliknite za upload</span> ili prevucite fajl
                            </p>
                            <p className="text-xs text-gray-500">ICO ili PNG do 1MB</p>
                          </div>
                        </label>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Formati: ICO ili PNG, preporučeno: 32x32px
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={SETTING_KEYS.SITE_LANGUAGE}>Jezik</Label>
                    <Select
                      value={formValues[SETTING_KEYS.SITE_LANGUAGE] as any || 'sr'}
                      onValueChange={(value) => setValue(SETTING_KEYS.SITE_LANGUAGE, value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sr">Srpski</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={SETTING_KEYS.TIMEZONE}>Vremenska zona</Label>
                    <Select
                      value={formValues[SETTING_KEYS.TIMEZONE] as any || 'Europe/Belgrade'}
                      onValueChange={(value) => setValue(SETTING_KEYS.TIMEZONE, value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Europe/Belgrade">Beograd (UTC+1)</SelectItem>
                        <SelectItem value="Europe/London">London (UTC+0)</SelectItem>
                        <SelectItem value="America/New_York">New York (UTC-5)</SelectItem>
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
                <CardTitle>Kontakt informacije</CardTitle>
                <CardDescription>
                  Kontakt podaci vaše institucije
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={SETTING_KEYS.CONTACT_ADDRESS}>
                      <MapPin className="inline-block mr-2 h-4 w-4" />
                      Adresa
                    </Label>
                    <Textarea
                      id={SETTING_KEYS.CONTACT_ADDRESS}
                      {...register(SETTING_KEYS.CONTACT_ADDRESS)}
                      placeholder="Ulica i broj, Poštanski broj Grad"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={SETTING_KEYS.CONTACT_PHONE}>
                      <Phone className="inline-block mr-2 h-4 w-4" />
                      Telefon
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
                      Email
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
                      Radno vreme
                    </Label>
                    <Textarea
                      id={SETTING_KEYS.CONTACT_WORKING_HOURS}
                      {...register(SETTING_KEYS.CONTACT_WORKING_HOURS)}
                      placeholder="Ponedeljak - Petak: 08:00 - 16:00"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={SETTING_KEYS.CONTACT_MAP_URL}>
                      <Globe className="inline-block mr-2 h-4 w-4" />
                      Google Maps URL
                    </Label>
                    <Input
                      id={SETTING_KEYS.CONTACT_MAP_URL}
                      {...register(SETTING_KEYS.CONTACT_MAP_URL)}
                      placeholder="https://maps.google.com/..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Unesite embed URL sa Google Maps-a
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
                <CardTitle>Društvene mreže</CardTitle>
                <CardDescription>
                  Linkovi ka profilima na društvenim mrežama
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={SETTING_KEYS.SOCIAL_FACEBOOK}>
                      <Facebook className="inline-block mr-2 h-4 w-4" />
                      Facebook
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
                      Twitter/X
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
                      Instagram
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
                      LinkedIn
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
                      YouTube
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
                <CardTitle>SEO podešavanja</CardTitle>
                <CardDescription>
                  Optimizacija za pretraživače i analitika
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor={SETTING_KEYS.SEO_TITLE}>Meta naslov</Label>
                    <Input
                      id={SETTING_KEYS.SEO_TITLE}
                      {...register(SETTING_KEYS.SEO_TITLE)}
                      placeholder="Moja institucija - Zvanični portal"
                    />
                    <p className="text-xs text-muted-foreground">
                      Prikazuje se u rezultatima pretrage (50-60 karaktera)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={SETTING_KEYS.SEO_DESCRIPTION}>Meta opis</Label>
                    <Textarea
                      id={SETTING_KEYS.SEO_DESCRIPTION}
                      {...register(SETTING_KEYS.SEO_DESCRIPTION)}
                      placeholder="Zvanični portal lokalne institucije sa najnovijim vestima..."
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      Kratak opis sajta (150-160 karaktera)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={SETTING_KEYS.SEO_KEYWORDS}>Ključne reči</Label>
                    <Input
                      id={SETTING_KEYS.SEO_KEYWORDS}
                      {...register(SETTING_KEYS.SEO_KEYWORDS)}
                      placeholder="institucija, lokalna samouprava, transparentnost"
                    />
                    <p className="text-xs text-muted-foreground">
                      Odvojene zarezom
                    </p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={SETTING_KEYS.SEO_GOOGLE_ANALYTICS}>
                        Google Analytics ID
                      </Label>
                      <Input
                        id={SETTING_KEYS.SEO_GOOGLE_ANALYTICS}
                        {...register(SETTING_KEYS.SEO_GOOGLE_ANALYTICS)}
                        placeholder="G-XXXXXXXXXX"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={SETTING_KEYS.SEO_GOOGLE_TAG_MANAGER}>
                        Google Tag Manager ID
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
                <CardTitle>Email podešavanja</CardTitle>
                <CardDescription>
                  SMTP konfiguracija za slanje email poruka
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={SETTING_KEYS.EMAIL_SMTP_HOST}>SMTP Server</Label>
                    <Input
                      id={SETTING_KEYS.EMAIL_SMTP_HOST}
                      {...register(SETTING_KEYS.EMAIL_SMTP_HOST)}
                      placeholder="smtp.gmail.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={SETTING_KEYS.EMAIL_SMTP_PORT}>SMTP Port</Label>
                    <Input
                      id={SETTING_KEYS.EMAIL_SMTP_PORT}
                      type="number"
                      {...register(SETTING_KEYS.EMAIL_SMTP_PORT, { valueAsNumber: true })}
                      placeholder="587"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={SETTING_KEYS.EMAIL_SMTP_USER}>SMTP korisničko ime</Label>
                    <Input
                      id={SETTING_KEYS.EMAIL_SMTP_USER}
                      {...register(SETTING_KEYS.EMAIL_SMTP_USER)}
                      placeholder="noreply@mojainstitucija.rs"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={SETTING_KEYS.EMAIL_SMTP_PASS}>SMTP lozinka</Label>
                    <Input
                      id={SETTING_KEYS.EMAIL_SMTP_PASS}
                      type="password"
                      {...register(SETTING_KEYS.EMAIL_SMTP_PASS)}
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={SETTING_KEYS.EMAIL_FROM_NAME}>Ime pošiljaoca</Label>
                    <Input
                      id={SETTING_KEYS.EMAIL_FROM_NAME}
                      {...register(SETTING_KEYS.EMAIL_FROM_NAME)}
                      placeholder="Moja institucija"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={SETTING_KEYS.EMAIL_FROM_ADDRESS}>Email pošiljaoca</Label>
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
                      <h4 className="text-sm font-medium text-yellow-800">Napomena</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Za Gmail koristite App Password umesto običnu lozinku.
                        Za druge provajdere proverite SMTP dokumentaciju.
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
                <CardTitle>Podešavanja izgleda</CardTitle>
                <CardDescription>
                  Prilagodite vizuelni identitet portala
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={SETTING_KEYS.THEME_PRIMARY_COLOR}>Primarna boja</Label>
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
                    <Label htmlFor={SETTING_KEYS.THEME_SECONDARY_COLOR}>Sekundarna boja</Label>
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
                    <Label htmlFor={SETTING_KEYS.THEME_FONT_FAMILY}>Font familija</Label>
                    <Select
                      value={(formValues[SETTING_KEYS.THEME_FONT_FAMILY] as string) || 'Inter'}
                      onValueChange={(value) => setValue(SETTING_KEYS.THEME_FONT_FAMILY, value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter">Inter</SelectItem>
                        <SelectItem value="Roboto">Roboto</SelectItem>
                        <SelectItem value="Open Sans">Open Sans</SelectItem>
                        <SelectItem value="Lato">Lato</SelectItem>
                        <SelectItem value="Poppins">Poppins</SelectItem>
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
                        Omogući tamni režim
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Dozvolite korisnicima da biraju između svetle i tamne teme
                    </p>
                  </div>
                </div>

                {/* Preview */}
                <div className="border rounded-lg p-6 bg-gray-50">
                  <h4 className="text-sm font-medium mb-4">Pregled boja</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-20 h-10 rounded-md border"
                        style={{ backgroundColor: (formValues[SETTING_KEYS.THEME_PRIMARY_COLOR] as string) || '#3B82F6' }}
                      />
                      <span className="text-sm">Primarna boja</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-20 h-10 rounded-md border"
                        style={{ backgroundColor: (formValues[SETTING_KEYS.THEME_SECONDARY_COLOR] as string) || '#10B981' }}
                      />
                      <span className="text-sm">Sekundarna boja</span>
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
                <CardTitle>Napredna podešavanja</CardTitle>
                <CardDescription>
                  Dodatne opcije i konfiguracija sistema
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
                        Režim održavanja
                      </Label>
                    </div>
                    
                    {formValues[SETTING_KEYS.MAINTENANCE_MODE] === true && (
                      <div className="ml-6 space-y-2">
                        <Label htmlFor={SETTING_KEYS.MAINTENANCE_MESSAGE}>
                          Poruka održavanja
                        </Label>
                        <Textarea
                          id={SETTING_KEYS.MAINTENANCE_MESSAGE}
                          {...register(SETTING_KEYS.MAINTENANCE_MESSAGE)}
                          placeholder="Sajt je trenutno u održavanju. Molimo vas pokušajte ponovo za nekoliko minuta."
                          rows={3}
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={SETTING_KEYS.POSTS_PER_PAGE}>
                        Objava po stranici
                      </Label>
                      <Input
                        id={SETTING_KEYS.POSTS_PER_PAGE}
                        type="number"
                        {...register(SETTING_KEYS.POSTS_PER_PAGE, { 
                          valueAsNumber: true,
                          min: { value: 1, message: 'Minimum je 1' },
                          max: { value: 50, message: 'Maksimum je 50' }
                        })}
                        placeholder="10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={SETTING_KEYS.API_KEY_GOOGLE_MAPS}>
                        Google Maps API ključ
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
                        Dozvoli komentare na objavama
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
                        Dozvoli registraciju novih korisnika
                      </Label>
                    </div>
                  </div>

                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-red-800">Opasna zona</h4>
                        <p className="text-sm text-red-700 mt-1">
                          Ove akcije mogu trajno promeniti podatke.
                        </p>
                        <div className="mt-3">
                          <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                            <DialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Resetuj podešavanja
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Resetuj podešavanja</DialogTitle>
                                <DialogDescription>
                                  Da li ste sigurni da želite da resetujete podešavanja na podrazumevane vrednosti?
                                  Ova akcija će obrisati sve vaše izmene.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsResetDialogOpen(false)}>
                                  Otkaži
                                </Button>
                                <Button variant="destructive" onClick={handleReset}>
                                  Resetuj
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
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Čuva se...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Sačuvaj sve izmene
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}