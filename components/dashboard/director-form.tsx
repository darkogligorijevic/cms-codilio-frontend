'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  FileText,
  Upload,
  Image as ImageIcon,
  X,
  Clock
} from 'lucide-react';
import { directorsApi } from '@/lib/api';
import { Director, CreateDirectorDto, UpdateDirectorDto  } from '@/lib/api';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

interface DirectorFormProps {
  director?: Director | null;
  onSubmit: () => void;
  onCancel: () => void;
}

interface FormData extends CreateDirectorDto {
  profileImageFile?: File;
  biographyFile?: File;
}

export function DirectorForm({ director, onSubmit, onCancel }: DirectorFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    director?.profileImage ? directorsApi.getFileUrl(director.profileImage) : null
  );
  const [biographyFileName, setBiographyFileName] = useState<string | null>(
    director?.biographyFile ? 'Postojeći fajl biografie' : null
  );
  
  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const biographyInputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();

  const form = useForm<FormData>({
    defaultValues: {
      fullName: director?.fullName || '',
      degree: director?.degree || '',
      phone: director?.phone || '',
      email: director?.email || '',
      office: director?.office || '',
      biography: director?.biography || '',
      appointmentDate: director?.appointmentDate ? director.appointmentDate.split('T')[0] : '',
      terminationDate: director?.terminationDate ? director.terminationDate.split('T')[0] : '',
      isCurrent: director?.isCurrent ?? true,
      isActive: director?.isActive ?? true,
    }
  });

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Molimo izaberite sliku (JPG, PNG, GIF)');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Slika je prevelika. Maksimalna veličina je 5MB.');
        return;
      }

      form.setValue('profileImageFile', file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBiographyFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Fajl je prevelik. Maksimalna veličina je 10MB.');
        return;
      }

      form.setValue('biographyFile', file);
      setBiographyFileName(file.name);
    }
  };

  const removeProfileImage = () => {
    setProfileImagePreview(null);
    form.setValue('profileImageFile', undefined);
    if (profileImageInputRef.current) {
      profileImageInputRef.current.value = '';
    }
  };

  const removeBiographyFile = () => {
    setBiographyFileName(null);
    form.setValue('biographyFile', undefined);
    if (biographyInputRef.current) {
      biographyInputRef.current.value = '';
    }
  };

  const handleSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      
      let savedDirector: Director;
      
      // Create or update director
      const directorData: CreateDirectorDto | UpdateDirectorDto | any = {
        fullName: data.fullName,
        degree: data.degree,
        phone: data.phone,
        email: data.email,
        office: data.office,
        biography: data.biography,
        appointmentDate: data.appointmentDate,
        terminationDate: data.terminationDate,
        isCurrent: data.isCurrent,
        isActive: data.isActive,
      };

      if (director) {
        savedDirector = await directorsApi.update(director.id, directorData);
      } else {
        savedDirector = await directorsApi.create(directorData);
      }

      // Upload profile image if provided
      if (data.profileImageFile) {
        await directorsApi.uploadProfileImage(savedDirector.id, data.profileImageFile);
      }

      // Upload biography file if provided
      if (data.biographyFile) {
        await directorsApi.uploadBiography(savedDirector.id, data.biographyFile);
      }

      toast.success(director ? 'Директор је успешно ажуриран' : 'Директор је успешно креиран');
      onSubmit();
    } catch (error: any) {
      console.error('Error saving director:', error);
      toast.error(error.response?.data?.message || 'Грешка при чувању директора');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full p-6">
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Основне информације</span>
            </CardTitle>
            <CardDescription>
              Лични подаци директора
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Пуно име *</Label>
                <Input
                  id="fullName"
                  placeholder="Марко Петровић"
                  {...form.register('fullName', { 
                    required: 'Име је обавезно',
                    minLength: { value: 2, message: 'Име мора имати најмање 2 карактера' }
                  })}
                />
                {form.formState.errors.fullName && (
                  <p className="text-sm text-red-600">{form.formState.errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="degree">Звање/Степен</Label>
                <Input
                  id="degree"
                  placeholder="др, мр, дипл. инж."
                  {...form.register('degree')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Телефон</Label>
                <Input
                  id="phone"
                  placeholder="+381 11 123 4567"
                  {...form.register('phone')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email адреса</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="direktor@institucija.rs"
                  {...form.register('email')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="office">Канцеларија</Label>
                <Input
                  id="office"
                  placeholder="Канцеларија директора"
                  {...form.register('office')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Информације о именовању</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="appointmentDate">Датум именовања *</Label>
                <Input
                  id="appointmentDate"
                  type="date"
                  {...form.register('appointmentDate', { 
                    required: 'Датум именовања је обавезан'
                  })}
                />
                {form.formState.errors.appointmentDate && (
                  <p className="text-sm text-red-600">{form.formState.errors.appointmentDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="terminationDate">Датум престанка функције</Label>
                <Input
                  id="terminationDate"
                  type="date"
                  {...form.register('terminationDate')}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isCurrent"
                  checked={form.watch('isCurrent')}
                  onCheckedChange={(checked) => form.setValue('isCurrent', !!checked)}
                />
                <Label htmlFor="isCurrent">Тренутни директор</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={form.watch('isActive')}
                  onCheckedChange={(checked) => form.setValue('isActive', !!checked)}
                />
                <Label htmlFor="isActive">Активан</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Biography */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Биографија</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="biography">Биографија као текст</Label>
              <Textarea
                id="biography"
                placeholder="Краћа биографија директора..."
                rows={6}
                {...form.register('biography')}
              />
            </div>

            <div className="space-y-2">
              <Label>Биографија као документ</Label>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => biographyInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Учитај биографију
                </Button>
                
                {biographyFileName && (
                  <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">{biographyFileName}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeBiographyFile}
                      className="h-5 w-5 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
              
              <input
                ref={biographyInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleBiographyFileChange}
                className="hidden"
              />
              
              <p className="text-xs text-gray-500">
                Дозвољени формати: PDF, DOC, DOCX, TXT (макс. 10MB)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Profile Image */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ImageIcon className="h-5 w-5" />
              <span>Фотографија</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                {profileImagePreview ? (
                  <div className="relative">
                    <img
                      src={profileImagePreview}
                      alt="Профилна слика"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={removeProfileImage}
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-32 h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => profileImageInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {profileImagePreview ? 'Промени слику' : 'Учитај слику'}
                </Button>
                
                <input
                  ref={profileImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="hidden"
                />
                
                <p className="text-xs text-gray-500">
                  Препоручена величина: 300x300px<br />
                  Формати: JPG, PNG, GIF (макс. 5MB)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-2 pt-6 mt-6 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Откажи
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            variant={theme === "light" ? "default" : "secondaryDefault"}
            className="min-w-[100px]"
          >
            {isSubmitting ? 'Чува се...' : director ? 'Ажурирај' : 'Креирај'}
          </Button>
        </div>
      </form>
    </div>
  );
}