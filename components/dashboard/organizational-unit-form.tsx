// components/dashboard/organizational-unit-form.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
  { value: UnitType.DEPARTMENT, label: 'Odsek' },
  { value: UnitType.DIVISION, label: 'Odeljenje' },
  { value: UnitType.SECTOR, label: 'Sektor' },
  { value: UnitType.SERVICE, label: 'Služba' },
  { value: UnitType.OFFICE, label: 'Kancelarija' },
  { value: UnitType.COMMITTEE, label: 'Komisija' },
  { value: UnitType.OTHER, label: 'Ostalo' }
];

const contactTypeOptions = [
  { value: ContactType.MANAGER, label: 'Menadžer' },
  { value: ContactType.DEPUTY, label: 'Zamenik' },
  { value: ContactType.SECRETARY, label: 'Sekretar' },
  { value: ContactType.COORDINATOR, label: 'Koordinator' },
  { value: ContactType.SPECIALIST, label: 'Stručnjak' },
  { value: ContactType.OTHER, label: 'Ostalo' }
];

export function OrganizationalUnitForm({ 
  unit, 
  units, 
  onSubmit, 
  onCancel 
}: OrganizationalUnitFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

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
        toast.success('Organizaciona jedinica je uspešno ažurirana');
      } else {
        await organizationalApi.create(data);
        toast.success('Organizaciona jedinica je uspešno kreirana');
      }
      
      onSubmit();
    } catch (error: any) {
      console.error('Error saving unit:', error);
      toast.error(error.response?.data?.message || 'Greška pri čuvanju organizacione jedinice');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full p-6">
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="w-full">
          <div className="flex space-x-1 rounded-lg bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setActiveTab('basic')}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                activeTab === 'basic'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Osnovni podaci
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                activeTab === 'details'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Detalji
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('contacts')}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                activeTab === 'contacts'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Kontakti
            </button>
          </div>
        </div>
        <Tabs>
          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="h-5 w-5" />
                  <span>Osnovne informacije</span>
                </CardTitle>
                <CardDescription>
                  Unesite osnovne podatke o organizacionoj jedinici
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    rules={{
                      required: 'Naziv je obavezan',
                      minLength: { value: 2, message: 'Naziv mora imati najmanje 2 karaktera' }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Naziv jedinice *</FormLabel>
                        <FormControl>
                          <Input placeholder="npr. Odsek za javne nabavke" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="code"
                    rules={{
                      required: 'Kod je obavezan',
                      pattern: {
                        value: /^[A-Za-z0-9-_]+$/,
                        message: 'Kod može sadržati samo slova, brojeve, crtice i podvlake'
                      }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kod jedinice *</FormLabel>
                        <FormControl>
                          <Input placeholder="npr. OJN-001" {...field} />
                        </FormControl>
                        <FormDescription>
                          Jedinstveni kod za identifikaciju (samo slova, brojevi i crtice)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tip jedinice</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Izaberite tip" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {unitTypeOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="parentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nadređena jedinica</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)}
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Nema nadređene (koren)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Nema nadređene (koren)</SelectItem>
                            {parentOptions.map(parent => (
                              <SelectItem key={parent.id} value={parent.id.toString()}>
                                {parent.name} ({parent.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Opis</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Kratki opis nadležnosti i aktivnosti..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
            
          <TabsContent value="details" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Rukovodstvo</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="managerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ime rukovodioca</FormLabel>
                        <FormControl>
                          <Input placeholder="npr. Marko Petrović" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="managerTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Funkcija rukovodioca</FormLabel>
                        <FormControl>
                          <Input placeholder="npr. Načelnik odseka" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="employeeCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Broj zaposlenih</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Phone className="h-5 w-5" />
                    <span>Kontakt informacije</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefon</FormLabel>
                        <FormControl>
                          <Input placeholder="+381 11 123 4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email adresa</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="odsek@institucija.rs" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lokacija</FormLabel>
                        <FormControl>
                          <Input placeholder="Zgrada A, I sprat, kancelarija 101" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>Lista kontakata</span>
                    </CardTitle>
                    <CardDescription>
                      Dodajte kontakt osobe za ovu organizacionu jedinicu
                    </CardDescription>
                  </div>
                  <Button type="button" onClick={addContact} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Dodaj kontakt
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {fields.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p>Nema dodanih kontakata</p>
                    <p className="text-sm">Kliknite "Dodaj kontakt" da dodate prvi kontakt</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <Card key={field.id} className="relative">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">
                              Kontakt {index + 1}
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
                            <FormField
                              control={form.control}
                              name={`contacts.${index}.name`}
                              rules={{ required: 'Ime je obavezno' }}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Ime i prezime *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Ana Marić" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`contacts.${index}.title`}
                              rules={{ required: 'Funkcija je obavezna' }}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Funkcija *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Referent za..." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name={`contacts.${index}.type`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tip kontakta</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {contactTypeOptions.map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                          {option.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`contacts.${index}.phone`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Telefon</FormLabel>
                                  <FormControl>
                                    <Input placeholder="+381 11..." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`contacts.${index}.office`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Kancelarija</FormLabel>
                                  <FormControl>
                                    <Input placeholder="101" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name={`contacts.${index}.email`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email adresa</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="email" 
                                    placeholder="ana.maric@institucija.rs" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

          <div className="flex items-center justify-end space-x-2 pt-6 mt-6 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Otkaži
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="min-w-[100px]"
            >
              {isSubmitting ? 'Čuva se...' : unit ? 'Ažuriraj' : 'Kreiraj'}
            </Button>
          </div>
        </form>
      
    </div>
  );
}