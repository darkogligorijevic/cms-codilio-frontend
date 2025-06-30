// components/dashboard/organizational-unit-form.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus,
  Trash2,
  Building,
  Users,
  Phone,
  Mail,
  MapPin,
  User,
  X
} from 'lucide-react';
import { organizationalApi } from '@/lib/api';
import { 
  OrganizationalUnit, 
  CreateOrganizationalUnitDto, 
  UnitType, 
  ContactType,
  CreateContactDto 
} from '@/lib/types';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

interface OrganizationalUnitFormProps {
  unit?: OrganizationalUnit | null;
  units: OrganizationalUnit[];
  onSubmit: () => void;
  onCancel: () => void;
}

interface FormData extends CreateOrganizationalUnitDto {
  contacts: CreateContactDto[];
}

const unitTypeOptions = [
  { value: UnitType.DEPARTMENT, label: 'Одсек' },
  { value: UnitType.DIVISION, label: 'Одељење' },
  { value: UnitType.SECTOR, label: 'Сектор' },
  { value: UnitType.SERVICE, label: 'Служба' },
  { value: UnitType.OFFICE, label: 'Канцеларија' },
  { value: UnitType.COMMITTEE, label: 'Комисија' },
  { value: UnitType.OTHER, label: 'Остало' }
];

const contactTypeOptions = [
  { value: ContactType.MANAGER, label: 'Менаџер' },
  { value: ContactType.DEPUTY, label: 'Заменик' },
  { value: ContactType.SECRETARY, label: 'Секретар' },
  { value: ContactType.COORDINATOR, label: 'Координатор' },
  { value: ContactType.SPECIALIST, label: 'Стручњак' },
  { value: ContactType.OTHER, label: 'Остало' }
];

export function OrganizationalUnitForm({ 
  unit, 
  units, 
  onSubmit, 
  onCancel 
}: OrganizationalUnitFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const {theme} = useTheme();

  const form = useForm<FormData>({
    defaultValues: {
      name: unit?.name || '',
      code: unit?.code || '',
      type: unit?.type || UnitType.DEPARTMENT,
      description: unit?.description || '',
      managerName: unit?.managerName || '',
      managerTitle: unit?.managerTitle || '',
      phone: unit?.phone || '',
      email: unit?.email || '',
      location: unit?.location || '',
      employeeCount: unit?.employeeCount || 0,
      parentId: unit?.parentId || undefined,
      contacts: unit?.contacts?.map(contact => ({
        name: contact.name,
        title: contact.title,
        type: contact.type,
        phone: contact.phone || '',
        email: contact.email || '',
        office: contact.office || '',
        order: contact.order || 0
      })) || []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'contacts'
  });

  // Filter out current unit from parent options to prevent circular references
  const parentOptions = units?.filter(u => u.id !== unit?.id) || [];

  const addContact = () => {
    append({
      name: '',
      title: '',
      type: ContactType.OTHER,
      phone: '',
      email: '',
      office: '',
      order: fields.length
    });
  };

  const handleSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      
      if (unit) {
        await organizationalApi.update(unit.id, data);
        toast.success('Организациона јединица је успешно ажурирана');
      } else {
        await organizationalApi.create(data);
        toast.success('Организациона јединица је успешно креирана');
      }
      
      onSubmit();
    } catch (error: any) {
      console.error('Error saving unit:', error);
      toast.error(error.response?.data?.message || 'Грешка при чувању организационе јединице');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full p-6">
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Custom Tab Navigation */}
        <div className="w-full">
          <div className="flex space-x-1 rounded-lg bg-gray-100 dark:bg-gray-900 p-1">
            <button
              type="button"
              onClick={() => setActiveTab('basic')}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                activeTab === 'basic'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              Основни подаци
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                activeTab === 'details'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              Детаљи
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('contacts')}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                activeTab === 'contacts'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              Контакти
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {/* Basic Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building className="h-5 w-5" />
                    <span>Основне информације</span>
                  </CardTitle>
                  <CardDescription>
                    Унесите основне податке о организационој јединици
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Назив јединице *</Label>
                      <Input
                        id="name"
                        placeholder="нпр. Одсек за јавне набавке"
                        {...form.register('name', { 
                          required: 'Назив је обавезан',
                          minLength: { value: 2, message: 'Назив мора имати најмање 2 карактера' }
                        })}
                      />
                      {form.formState.errors.name && (
                        <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="code">Код јединице *</Label>
                      <Input
                        id="code"
                        placeholder="нпр. ОЈН-001"
                        {...form.register('code', {
                          required: 'Код је обавезан',
                          pattern: {
                            value: /^[A-Za-z0-9-_]+$/,
                            message: 'Код може садржати само слова, бројеве, цртице и подвлаке'
                          }
                        })}
                      />
                      <p className="text-xs text-gray-500">
                        Јединствени код за идентификацију (само слова, бројеви и цртице)
                      </p>
                      {form.formState.errors.code && (
                        <p className="text-sm text-red-600">{form.formState.errors.code.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Тип јединице</Label>
                      <select
                        id="type"
                        {...form.register('type')}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent dark:bg-gray-900 px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {unitTypeOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="parentId">Надређена јединица</Label>
                      <select
                        id="parentId"
                        {...form.register('parentId', {
                          setValueAs: (value) => value === '' ? undefined : parseInt(value)
                        })}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent dark:bg-gray-900 px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Нема надређене (корен)</option>
                        {parentOptions.map(parent => (
                          <option key={parent.id} value={parent.id.toString()}>
                            {parent.name} ({parent.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Опис</Label>
                    <Textarea
                      id="description"
                      placeholder="Кратак опис надлежности и активности..."
                      rows={3}
                      {...form.register('description')}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Руководство</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="managerName">Име руководиоца</Label>
                      <Input
                        id="managerName"
                        placeholder="нпр. Марко Петровић"
                        {...form.register('managerName')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="managerTitle">Функција руководиоца</Label>
                      <Input
                        id="managerTitle"
                        placeholder="нпр. Начелник одсека"
                        {...form.register('managerTitle')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="employeeCount">Број запослених</Label>
                      <Input
                        id="employeeCount"
                        type="number"
                        min="0"
                        placeholder="0"
                        {...form.register('employeeCount', {
                          setValueAs: (value) => parseInt(value) || 0
                        })}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Phone className="h-5 w-5" />
                      <span>Контакт информације</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                        placeholder="одсек@институција.рс"
                        {...form.register('email')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Локација</Label>
                      <Input
                        id="location"
                        placeholder="Зграда А, I спрат, канцеларија 101"
                        {...form.register('location')}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Contacts Tab */}
          {activeTab === 'contacts' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Users className="h-5 w-5" />
                        <span>Листа контаката</span>
                      </CardTitle>
                      <CardDescription>
                        Додајте контакт особе за ову организациону јединицу
                      </CardDescription>
                    </div>
                    <Button type="button" variant={theme === "light" ? "default" : "secondaryDefault"} onClick={addContact} size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Додај контакт
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {fields.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                      <p>Нема додатих контаката</p>
                      <p className="text-sm">Кликните "Додај контакт" да додате први контакт</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {fields.map((field, index) => (
                        <Card key={field.id} className="relative">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline">
                                Контакт {index + 1}
                              </Badge>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => remove(index)}
                                className="h-8 w-8 p-0 text-red-600"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Име и презиме *</Label>
                                <Input
                                  placeholder="Ана Марић"
                                  {...form.register(`contacts.${index}.name`, { required: 'Име је обавезно' })}
                                />
                                {form.formState.errors.contacts?.[index]?.name && (
                                  <p className="text-sm text-red-600">
                                    {form.formState.errors.contacts[index]?.name?.message}
                                  </p>
                                )}
                              </div>

                              <div className="space-y-2">
                                <Label>Функција *</Label>
                                <Input
                                  placeholder="Референт за..."
                                  {...form.register(`contacts.${index}.title`, { required: 'Функција је обавезна' })}
                                />
                                {form.formState.errors.contacts?.[index]?.title && (
                                  <p className="text-sm text-red-600">
                                    {form.formState.errors.contacts[index]?.title?.message}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label>Тип контакта</Label>
                                <select
                                  {...form.register(`contacts.${index}.type`)}
                                  className="flex h-9 w-full rounded-md border border-input bg-transparent dark:bg-gray-900 px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {contactTypeOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="space-y-2">
                                <Label>Телефон</Label>
                                <Input
                                  placeholder="+381 11..."
                                  {...form.register(`contacts.${index}.phone`)}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>Канцеларија</Label>
                                <Input
                                  placeholder="101"
                                  {...form.register(`contacts.${index}.office`)}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label>Email адреса</Label>
                              <Input
                                type="email"
                                placeholder="ана.марић@институција.рс"
                                {...form.register(`contacts.${index}.email`)}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

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
            {isSubmitting ? 'Чува се...' : unit ? 'Ажурирај' : 'Креирај'}
          </Button>
        </div>
      </form>
    </div>
  );
}