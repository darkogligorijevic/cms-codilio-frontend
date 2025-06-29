// app/dashboard/services/create/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Plus,
    Trash2,
    Save,
    ArrowLeft,
    Building,
    FileText,
    User,
    Phone,
    Mail,
    MapPin,
    Clock,
    DollarSign,
    Globe,
    Calendar,
    AlertTriangle,
    Info
} from 'lucide-react';
import { servicesApi } from '@/lib/api';
import {
    ServiceType,
    ServiceStatus,
    ServicePriority,
    CreateServiceDto
} from '@/lib/types';
import { toast } from 'sonner';
import { transliterate } from '@/lib/transliterate';
import { useTheme } from 'next-themes';

interface ServiceFormData {
  name: string;
  slug: string;
  shortDescription?: string;
  description: string;
  type: ServiceType;
  status?: ServiceStatus;
  priority?: ServicePriority;
  price?: number;
  currency?: string;
  duration?: string;
  responsibleDepartment?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  workingHours?: string;
  location?: string;
  additionalInfo?: string;
  sortOrder?: number;
  isActive?: boolean;
  isPublic?: boolean;
  requiresAppointment?: boolean;
  isOnline?: boolean;
  
  // Form-specific fields
  requirements: { value: string }[];
  steps: { value: string }[];
}


export default function CreateServicePage() {
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');

    const router = useRouter();
    const { theme } = useTheme();

    const form = useForm<ServiceFormData>({
        defaultValues: {
            name: '',
            slug: '',
            shortDescription: '',
            description: '',
            type: ServiceType.ADMINISTRATIVE,
            status: ServiceStatus.DRAFT,
            priority: ServicePriority.MEDIUM,
            price: undefined,
            currency: 'RSD',
            requirements: [{ value: '' }],
            steps: [{ value: '' }],
            duration: '',
            responsibleDepartment: '',
            contactPerson: '',
            contactPhone: '',
            contactEmail: '',
            workingHours: '',
            location: '',
            additionalInfo: '',
            sortOrder: 0,
            isActive: true,
            isPublic: true,
            requiresAppointment: false,
            isOnline: false,
        }
    });

    const { fields: requirementFields, append: appendRequirement, remove: removeRequirement } = useFieldArray({
        control: form.control,
        name: 'requirements'
    });

    const { fields: stepFields, append: appendStep, remove: removeStep } = useFieldArray({
        control: form.control,
        name: 'steps'
    });

    // Auto-generate slug from name
    const generateSlug = (name: string) => {
        console.log("Original: ", name)
        const slug = transliterate(name)
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
        console.log("Slug: ", slug)
        return slug;
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        form.setValue('name', name);

        // Auto-generate slug
        const newSlug = generateSlug(name);
        form.setValue('slug', newSlug);
    };

    const handleSubmit = async (data: ServiceFormData) => {
        try {
            setIsLoading(true);

            // Destructure to separate the form-specific fields from the rest
            const { requirements, steps, ...restData } = data;

            // Create the DTO with the rest of the data and transformed arrays
            const filteredData: CreateServiceDto = {
                ...restData,
                requirements: requirements.map(req => req.value).filter(req => req.trim() !== ''),
                steps: steps.map(step => step.value).filter(step => step.trim() !== ''),
            };

            await servicesApi.create(filteredData);
            toast.success('Услуга је успешно креирана');
            router.push('/dashboard/services');
        } catch (error: any) {
            console.error('Error saving service:', error);
            toast.error(error.response?.data?.message || 'Грешка при чувању услуге');
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <Button
                    variant="outline"
                    onClick={() => router.push('/dashboard/services')}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Назад
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Нова услуга</h1>
                    <p className="text-muted-foreground">
                        Креирајте нову услугу за грађане
                    </p>
                </div>
            </div>

            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="basic">Основни подаци</TabsTrigger>
                        <TabsTrigger value="details">Детаљи</TabsTrigger>
                        <TabsTrigger value="contact">Контакт</TabsTrigger>
                        <TabsTrigger value="settings">Подешавања</TabsTrigger>
                    </TabsList>

                    {/* Basic Information Tab */}
                    <TabsContent value="basic" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Building className="h-5 w-5" />
                                    <span>Основне информације</span>
                                </CardTitle>
                                <CardDescription>
                                    Основни подаци о услузи
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Назив услуге *</Label>
                                        <Input
                                            id="name"
                                            placeholder="нпр. Издавање грађевинске дозволе"
                                            {...form.register('name', {
                                                required: 'Назив је обавезан',
                                                onChange: handleNameChange
                                            })}
                                        />
                                        {form.formState.errors.name && (
                                            <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="slug">URL скраћеница *</Label>
                                        <Input
                                            id="slug"
                                            placeholder="izdavanje-gradjevinske-dozvole"
                                            {...form.register('slug', {
                                                required: 'URL скраћеница је обавезна',
                                                pattern: {
                                                    value: /^[a-z0-9-]+$/,
                                                    message: 'URL може садржати само мала слова, бројеве и цртице'
                                                }
                                            })}
                                        />
                                        {form.formState.errors.slug && (
                                            <p className="text-sm text-red-600">{form.formState.errors.slug.message}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="shortDescription">Кратки опис</Label>
                                    <Input
                                        id="shortDescription"
                                        placeholder="Кратки опис услуге у једној реченици..."
                                        {...form.register('shortDescription')}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Детаљан опис *</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Детаљан опис услуге, услова за остваривање права, поступка..."
                                        rows={6}
                                        {...form.register('description', { required: 'Опис је обавезан' })}
                                    />
                                    {form.formState.errors.description && (
                                        <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="type">Тип услуге</Label>
                                        <Select
                                            value={form.watch('type')}
                                            onValueChange={(value) => form.setValue('type', value as ServiceType)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Изаберите тип" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={ServiceType.ADMINISTRATIVE}>Административне услуге</SelectItem>
                                                <SelectItem value={ServiceType.CONSULTING}>Саветодавне услуге</SelectItem>
                                                <SelectItem value={ServiceType.TECHNICAL}>Техничке услуге</SelectItem>
                                                <SelectItem value={ServiceType.LEGAL}>Правне услуге</SelectItem>
                                                <SelectItem value={ServiceType.EDUCATIONAL}>Образовне услуге</SelectItem>
                                                <SelectItem value={ServiceType.HEALTH}>Здравствене услуге</SelectItem>
                                                <SelectItem value={ServiceType.SOCIAL}>Социјалне услуге</SelectItem>
                                                <SelectItem value={ServiceType.CULTURAL}>Културне услуге</SelectItem>
                                                <SelectItem value={ServiceType.OTHER}>Остало</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="status">Статус</Label>
                                        <Select
                                            value={form.watch('status')}
                                            onValueChange={(value) => form.setValue('status', value as ServiceStatus)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Изаберите статус" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={ServiceStatus.DRAFT}>Нацрт</SelectItem>
                                                <SelectItem value={ServiceStatus.PUBLISHED}>Објављено</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="priority">Приоритет</Label>
                                        <Select
                                            value={form.watch('priority')}
                                            onValueChange={(value) => form.setValue('priority', value as ServicePriority)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Изаберите приоритет" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={ServicePriority.LOW}>Низак приоритет</SelectItem>
                                                <SelectItem value={ServicePriority.MEDIUM}>Средњи приоритет</SelectItem>
                                                <SelectItem value={ServicePriority.HIGH}>Висок приоритет</SelectItem>
                                                <SelectItem value={ServicePriority.URGENT}>Хитан</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Details Tab */}
                    <TabsContent value="details" className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Price Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <DollarSign className="h-5 w-5" />
                                        <span>Цена услуге</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="price">Цена</Label>
                                            <Input
                                                id="price"
                                                type="number"
                                                placeholder="0"
                                                min="0"
                                                step="0.01"
                                                {...form.register('price', {
                                                    setValueAs: (value) => value ? parseFloat(value) : undefined
                                                })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="currency">Валута</Label>
                                            <Select
                                                value={form.watch('currency')}
                                                onValueChange={(value) => form.setValue('currency', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="RSD" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="RSD">RSD - Српски динар</SelectItem>
                                                    <SelectItem value="EUR">EUR - Еуро</SelectItem>
                                                    <SelectItem value="USD">USD - Амерички долар</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="duration">Време реализације</Label>
                                        <Input
                                            id="duration"
                                            placeholder="нпр. 7-15 радних дана, одмах, до 30 дана..."
                                            {...form.register('duration')}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Department Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Building className="h-5 w-5" />
                                        <span>Надлежност</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="responsibleDepartment">Надлежно одељење</Label>
                                        <Input
                                            id="responsibleDepartment"
                                            placeholder="нпр. Одељење за урбанизам и грађевинарство"
                                            {...form.register('responsibleDepartment')}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="location">Локација</Label>
                                        <Input
                                            id="location"
                                            placeholder="нпр. Зграда општине, I спрат, канцеларија 12"
                                            {...form.register('location')}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="workingHours">Радно време</Label>
                                        <Input
                                            id="workingHours"
                                            placeholder="нпр. Понедељак-Петак 08:00-16:00"
                                            {...form.register('workingHours')}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Requirements */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <FileText className="h-5 w-5" />
                                    <span>Потребна документа</span>
                                </CardTitle>
                                <CardDescription>
                                    Листа докумената потребних за остваривање услуге
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {requirementFields.map((field, index) => (
                                    <div key={field.id} className="flex items-center space-x-2">
                                        <Input
                                            placeholder={`Документ ${index + 1}`}
                                            {...form.register(`requirements.${index}.value`)}
                                        />
                                        {requirementFields.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => removeRequirement(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => appendRequirement({ value: '' })}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Додај документ
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Steps */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Info className="h-5 w-5" />
                                    <span>Кораци за остваривање</span>
                                </CardTitle>
                                <CardDescription>
                                    Поступак који грађанин треба да прати
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {stepFields.map((field, index) => (
                                    <div key={field.id} className="flex items-center space-x-2">
                                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                                            {index + 1}
                                        </div>
                                        <Input
                                            placeholder={`Корак ${index + 1}`}
                                            {...form.register(`steps.${index}.value`)}
                                        />
                                        {stepFields.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => removeStep(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => appendStep({ value: '' })}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Додај корак
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Contact Tab */}
                    <TabsContent value="contact" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <User className="h-5 w-5" />
                                    <span>Контакт информације</span>
                                </CardTitle>
                                <CardDescription>
                                    Подаци за контакт у вези са услугом
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="contactPerson">Контакт особа</Label>
                                    <Input
                                        id="contactPerson"
                                        placeholder="Име и презиме контакт особе"
                                        {...form.register('contactPerson')}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="contactPhone">Телефон</Label>
                                        <Input
                                            id="contactPhone"
                                            placeholder="+381 11 123 4567"
                                            {...form.register('contactPhone')}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="contactEmail">Емаил</Label>
                                        <Input
                                            id="contactEmail"
                                            type="email"
                                            placeholder="email@institucija.rs"
                                            {...form.register('contactEmail')}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="additionalInfo">Додатне информације</Label>
                                    <Textarea
                                        id="additionalInfo"
                                        placeholder="Додатне напомене, специфичности, изузеци..."
                                        rows={4}
                                        {...form.register('additionalInfo')}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Settings Tab */}
                    <TabsContent value="settings" className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* General Settings */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Општа подешавања</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="sortOrder">Редни број</Label>
                                        <Input
                                            id="sortOrder"
                                            type="number"
                                            placeholder="0"
                                            {...form.register('sortOrder', {
                                                setValueAs: (value) => parseInt(value) || 0
                                            })}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Редослед приказивања (мањи број = већи приоритет)
                                        </p>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="isActive"
                                            checked={form.watch('isActive')}
                                            onCheckedChange={(checked) => form.setValue('isActive', !!checked)}
                                        />
                                        <Label htmlFor="isActive">Активна услуга</Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="isPublic"
                                            checked={form.watch('isPublic')}
                                            onCheckedChange={(checked) => form.setValue('isPublic', !!checked)}
                                        />
                                        <Label htmlFor="isPublic">Јавно доступна</Label>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Service Type Settings */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Тип услуге</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="isOnline"
                                            checked={form.watch('isOnline')}
                                            onCheckedChange={(checked) => form.setValue('isOnline', !!checked)}
                                        />
                                        <Label htmlFor="isOnline" className="flex items-center space-x-2">
                                            <Globe className="h-4 w-4" />
                                            <span>Онлајн услуга</span>
                                        </Label>
                                    </div>
                                    <p className="text-xs text-muted-foreground ml-6">
                                        Услуга се може остварити путем интернета
                                    </p>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="requiresAppointment"
                                            checked={form.watch('requiresAppointment')}
                                            onCheckedChange={(checked) => form.setValue('requiresAppointment', !!checked)}
                                        />
                                        <Label htmlFor="requiresAppointment" className="flex items-center space-x-2">
                                            <Calendar className="h-4 w-4" />
                                            <span>Потребно заказивање</span>
                                        </Label>
                                    </div>
                                    <p className="text-xs text-muted-foreground ml-6">
                                        Грађани морају да закажу термин
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Warning Card */}
                        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-200">
                                    <AlertTriangle className="h-5 w-5" />
                                    <span>Напомена</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                    Услуге са статусом "Објављено" ће бити видљиве грађанима на веб порталу.
                                    Препоручује се да прво тестирате услугу као "Нацрт" па је затим објавите.
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Form Actions */}
                <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/dashboard/services')}
                        disabled={isLoading}
                    >
                        Откажи
                    </Button>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        variant={theme === "light" ? "default" : "secondaryDefault"}
                        className="min-w-[120px]"
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Чува се...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Креирај услугу
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}