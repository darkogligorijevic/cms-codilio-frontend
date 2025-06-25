// app/dashboard/services/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
    UpdateServiceDto,
    Service
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

export default function EditServicePage() {
    const [service, setService] = useState<Service | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');

    const router = useRouter();
    const params = useParams();
    const { theme } = useTheme();
    const serviceId = params?.id as string;

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

    // Fetch service data on mount
    useEffect(() => {
        if (serviceId) {
            fetchService();
        }
    }, [serviceId]);

    const fetchService = async () => {
        try {
            setIsLoading(true);
            const serviceData = await servicesApi.getById(parseInt(serviceId));
            setService(serviceData);

            // Populate form with service data
            form.reset({
                name: serviceData.name,
                slug: serviceData.slug,
                shortDescription: serviceData.shortDescription || '',
                description: serviceData.description,
                type: serviceData.type,
                status: serviceData.status,
                priority: serviceData.priority,
                price: serviceData.price,
                currency: serviceData.currency || 'RSD',
                duration: serviceData.duration || '',
                responsibleDepartment: serviceData.responsibleDepartment || '',
                contactPerson: serviceData.contactPerson || '',
                contactPhone: serviceData.contactPhone || '',
                contactEmail: serviceData.contactEmail || '',
                workingHours: serviceData.workingHours || '',
                location: serviceData.location || '',
                additionalInfo: serviceData.additionalInfo || '',
                sortOrder: serviceData.sortOrder,
                isActive: serviceData.isActive,
                isPublic: serviceData.isPublic,
                requiresAppointment: serviceData.requiresAppointment,
                isOnline: serviceData.isOnline,
                requirements: serviceData.requirements?.length 
                    ? serviceData.requirements.map(req => ({ value: req }))
                    : [{ value: '' }],
                steps: serviceData.steps?.length 
                    ? serviceData.steps.map(step => ({ value: step }))
                    : [{ value: '' }],
            });
        } catch (error) {
            console.error('Error fetching service:', error);
            toast.error('Greška pri učitavanju usluge');
            router.push('/dashboard/services');
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-generate slug from name
    const generateSlug = (name: string) => {
        return transliterate(name)
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        form.setValue('name', name);

        // Auto-generate slug only if it matches the current service slug or is empty
        const currentSlug = form.getValues('slug');
        const expectedSlug = service ? generateSlug(service.name) : '';
        
        if (!currentSlug || currentSlug === expectedSlug) {
            form.setValue('slug', generateSlug(name));
        }
    };

    const handleSubmit = async (data: ServiceFormData) => {
        try {
            setIsSaving(true);

            // Destructure to separate the form-specific fields from the rest
            const { requirements, steps, ...restData } = data;

            // Create the DTO with the rest of the data and transformed arrays
            const updateData: UpdateServiceDto = {
                ...restData,
                requirements: requirements.map(req => req.value).filter(req => req.trim() !== ''),
                steps: steps.map(step => step.value).filter(step => step.trim() !== ''),
            };

            await servicesApi.update(parseInt(serviceId), updateData);
            toast.success('Usluga je uspešno ažurirana');
            router.push(`/dashboard/services/${serviceId}`);
        } catch (error: any) {
            console.error('Error updating service:', error);
            toast.error(error.response?.data?.message || 'Greška pri čuvanju usluge');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!service) {
        return (
            <div className="text-center py-12">
                <h3 className="text-lg font-medium mb-2">Usluga nije pronađena</h3>
                <Button onClick={() => router.push('/dashboard/services')}>
                    Nazad na listu usluga
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <Button
                    variant="outline"
                    onClick={() => router.push(`/dashboard/services/${serviceId}`)}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Nazad
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Uredi uslugu</h1>
                    <p className="text-muted-foreground">
                        Ažurirajte informacije o usluzi "{service.name}"
                    </p>
                </div>
            </div>

            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="basic">Osnovni podaci</TabsTrigger>
                        <TabsTrigger value="details">Detalji</TabsTrigger>
                        <TabsTrigger value="contact">Kontakt</TabsTrigger>
                        <TabsTrigger value="settings">Podešavanja</TabsTrigger>
                    </TabsList>

                    {/* Basic Information Tab */}
                    <TabsContent value="basic" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Building className="h-5 w-5" />
                                    <span>Osnovne informacije</span>
                                </CardTitle>
                                <CardDescription>
                                    Osnovni podaci o usluzi
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Naziv usluge *</Label>
                                        <Input
                                            id="name"
                                            placeholder="npr. Izdavanje građevinske dozvole"
                                            {...form.register('name', {
                                                required: 'Naziv je obavezan',
                                                onChange: handleNameChange
                                            })}
                                        />
                                        {form.formState.errors.name && (
                                            <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="slug">URL skraćenica *</Label>
                                        <Input
                                            id="slug"
                                            placeholder="izdavanje-gradjevinske-dozvole"
                                            {...form.register('slug', {
                                                required: 'URL skraćenica je obavezna',
                                                pattern: {
                                                    value: /^[a-z0-9-]+$/,
                                                    message: 'URL može sadržati samo mala slova, brojeve i crtice'
                                                }
                                            })}
                                        />
                                        {form.formState.errors.slug && (
                                            <p className="text-sm text-red-600">{form.formState.errors.slug.message}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="shortDescription">Kratki opis</Label>
                                    <Input
                                        id="shortDescription"
                                        placeholder="Kratki opis usluge u jednoj rečenici..."
                                        {...form.register('shortDescription')}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Detaljan opis *</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Detaljan opis usluge, uslova za ostvarivanje prava, postupka..."
                                        rows={6}
                                        {...form.register('description', { required: 'Opis je obavezan' })}
                                    />
                                    {form.formState.errors.description && (
                                        <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="type">Tip usluge</Label>
                                        <Select
                                            value={form.watch('type')}
                                            onValueChange={(value) => form.setValue('type', value as ServiceType)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Izaberite tip" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={ServiceType.ADMINISTRATIVE}>Administrativne usluge</SelectItem>
                                                <SelectItem value={ServiceType.CONSULTING}>Savetodavne usluge</SelectItem>
                                                <SelectItem value={ServiceType.TECHNICAL}>Tehničke usluge</SelectItem>
                                                <SelectItem value={ServiceType.LEGAL}>Pravne usluge</SelectItem>
                                                <SelectItem value={ServiceType.EDUCATIONAL}>Obrazovne usluge</SelectItem>
                                                <SelectItem value={ServiceType.HEALTH}>Zdravstvene usluge</SelectItem>
                                                <SelectItem value={ServiceType.SOCIAL}>Socijalne usluge</SelectItem>
                                                <SelectItem value={ServiceType.CULTURAL}>Kulturne usluge</SelectItem>
                                                <SelectItem value={ServiceType.OTHER}>Ostalo</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status</Label>
                                        <Select
                                            value={form.watch('status')}
                                            onValueChange={(value) => form.setValue('status', value as ServiceStatus)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Izaberite status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={ServiceStatus.DRAFT}>Nacrt</SelectItem>
                                                <SelectItem value={ServiceStatus.PUBLISHED}>Objavljeno</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="priority">Prioritet</Label>
                                        <Select
                                            value={form.watch('priority')}
                                            onValueChange={(value) => form.setValue('priority', value as ServicePriority)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Izaberite prioritet" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={ServicePriority.LOW}>Nizak prioritet</SelectItem>
                                                <SelectItem value={ServicePriority.MEDIUM}>Srednji prioritet</SelectItem>
                                                <SelectItem value={ServicePriority.HIGH}>Visok prioritet</SelectItem>
                                                <SelectItem value={ServicePriority.URGENT}>Hitan</SelectItem>
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
                                        <span>Cena usluge</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="price">Cena</Label>
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
                                            <Label htmlFor="currency">Valuta</Label>
                                            <Select
                                                value={form.watch('currency')}
                                                onValueChange={(value) => form.setValue('currency', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="RSD" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="RSD">RSD - Srpski dinar</SelectItem>
                                                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                                                    <SelectItem value="USD">USD - Američki dolar</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="duration">Vreme realizacije</Label>
                                        <Input
                                            id="duration"
                                            placeholder="npr. 7-15 radnih dana, odmah, do 30 dana..."
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
                                        <span>Nadležnost</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="responsibleDepartment">Nadležno odeljenje</Label>
                                        <Input
                                            id="responsibleDepartment"
                                            placeholder="npr. Odeljenje za urbanizam i građevinarstvo"
                                            {...form.register('responsibleDepartment')}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="location">Lokacija</Label>
                                        <Input
                                            id="location"
                                            placeholder="npr. Zgrada opštine, I sprat, kancelarija 12"
                                            {...form.register('location')}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="workingHours">Radno vreme</Label>
                                        <Input
                                            id="workingHours"
                                            placeholder="npr. Ponedeljak-Petak 08:00-16:00"
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
                                    <span>Potrebna dokumenta</span>
                                </CardTitle>
                                <CardDescription>
                                    Lista dokumenata potrebnih za ostvarivanje usluge
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {requirementFields.map((field, index) => (
                                    <div key={field.id} className="flex items-center space-x-2">
                                        <Input
                                            placeholder={`Dokument ${index + 1}`}
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
                                    Dodaj dokument
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Steps */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Info className="h-5 w-5" />
                                    <span>Koraci za ostvarivanje</span>
                                </CardTitle>
                                <CardDescription>
                                    Postupak koji građanin treba da prati
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {stepFields.map((field, index) => (
                                    <div key={field.id} className="flex items-center space-x-2">
                                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                                            {index + 1}
                                        </div>
                                        <Input
                                            placeholder={`Korak ${index + 1}`}
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
                                    Dodaj korak
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
                                    <span>Kontakt informacije</span>
                                </CardTitle>
                                <CardDescription>
                                    Podaci za kontakt u vezi sa uslugom
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="contactPerson">Kontakt osoba</Label>
                                    <Input
                                        id="contactPerson"
                                        placeholder="Ime i prezime kontakt osobe"
                                        {...form.register('contactPerson')}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="contactPhone">Telefon</Label>
                                        <Input
                                            id="contactPhone"
                                            placeholder="+381 11 123 4567"
                                            {...form.register('contactPhone')}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="contactEmail">Email</Label>
                                        <Input
                                            id="contactEmail"
                                            type="email"
                                            placeholder="email@institucija.rs"
                                            {...form.register('contactEmail')}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="additionalInfo">Dodatne informacije</Label>
                                    <Textarea
                                        id="additionalInfo"
                                        placeholder="Dodatne napomene, specifičnosti, izuzeci..."
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
                                    <CardTitle>Opšta podešavanja</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="sortOrder">Redni broj</Label>
                                        <Input
                                            id="sortOrder"
                                            type="number"
                                            placeholder="0"
                                            {...form.register('sortOrder', {
                                                setValueAs: (value) => parseInt(value) || 0
                                            })}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Redosled prikazivanja (manji broj = veći prioritet)
                                        </p>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="isActive"
                                            checked={form.watch('isActive')}
                                            onCheckedChange={(checked) => form.setValue('isActive', !!checked)}
                                        />
                                        <Label htmlFor="isActive">Aktivna usluga</Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="isPublic"
                                            checked={form.watch('isPublic')}
                                            onCheckedChange={(checked) => form.setValue('isPublic', !!checked)}
                                        />
                                        <Label htmlFor="isPublic">Javno dostupna</Label>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Service Type Settings */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Tip usluge</CardTitle>
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
                                            <span>Online usluga</span>
                                        </Label>
                                    </div>
                                    <p className="text-xs text-muted-foreground ml-6">
                                        Usluga se može ostvariti putem interneta
                                    </p>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="requiresAppointment"
                                            checked={form.watch('requiresAppointment')}
                                            onCheckedChange={(checked) => form.setValue('requiresAppointment', !!checked)}
                                        />
                                        <Label htmlFor="requiresAppointment" className="flex items-center space-x-2">
                                            <Calendar className="h-4 w-4" />
                                            <span>Potrebno zakazivanje</span>
                                        </Label>
                                    </div>
                                    <p className="text-xs text-muted-foreground ml-6">
                                        Građani moraju da zakažu termin
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Warning Card */}
                        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-200">
                                    <AlertTriangle className="h-5 w-5" />
                                    <span>Napomena</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                    Usluge sa statusom "Objavljeno" će biti vidljive građanima na web portalu.
                                    Preporučuje se da prvo testirate uslugu kao "Nacrt" pa je zatim objavite.
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
                        onClick={() => router.push(`/dashboard/services/${serviceId}`)}
                        disabled={isSaving}
                    >
                        Otkaži
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSaving}
                        variant={theme === "light" ? "default" : "secondaryDefault"}
                        className="min-w-[120px]"
                    >
                        {isSaving ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Čuva se...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Ažuriraj uslugu
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}