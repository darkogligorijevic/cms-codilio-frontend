// app/dashboard/mailer/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { 
  Mail, 
  Users, 
  MessageSquare, 
  Send,
  Plus,
  Search,
  Filter,
  Eye,
  Archive,
  Trash2,
  Edit,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Download,
  Upload,
  Settings,
  Loader2
} from 'lucide-react';
import { mailerApi } from '@/lib/api';
import type { 
  Contact, 
  NewsletterSubscribe, 
  EmailTemplate, 
  ContactStatus, 
  SubscriberStatus, 
  TemplateType,
  CreateEmailTemplateDto,
  UpdateEmailTemplateDto,
  SendNewsletterDto 
} from '@/lib/types';
import { toast } from 'sonner';

interface ContactFormData {
  status: ContactStatus;
}

interface TemplateFormData {
  name: string;
  type: TemplateType;
  subject: string;
  htmlContent: string;
  textContent: string;
  isActive: boolean;
}

interface NewsletterFormData {
  subject: string;
  htmlContent: string;
  textContent: string;
  testEmails: string;
}

export default function MailerPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscribe[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [contactStatusFilter, setContactStatusFilter] = useState<ContactStatus | 'all'>('all');
  const [subscriberStatusFilter, setSubscriberStatusFilter] = useState<SubscriberStatus | 'all'>('all');
  
  // Dialog states
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isNewsletterDialogOpen, setIsNewsletterDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isSendingNewsletter, setIsSendingNewsletter] = useState(false);

  // Forms
  const contactForm = useForm<ContactFormData>();
  const templateForm = useForm<TemplateFormData>({
    defaultValues: {
      name: '',
      type: 'CUSTOM' as TemplateType,
      subject: '',
      htmlContent: '',
      textContent: '',
      isActive: true
    }
  });
  const newsletterForm = useForm<NewsletterFormData>({
    defaultValues: {
      subject: '',
      htmlContent: '',
      textContent: '',
      testEmails: ''
    }
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      const [contactsData, subscribersData, templatesData] = await Promise.all([
        mailerApi.getAllContacts(),
        mailerApi.getAllSubscribers(),
        mailerApi.getAllEmailTemplates()
      ]);
      
      setContacts(Array.isArray(contactsData) ? contactsData : []);
      setSubscribers(Array.isArray(subscribersData) ? subscribersData : []);
      setTemplates(Array.isArray(templatesData) ? templatesData : []);
    } catch (error) {
      console.error('Error fetching mailer data:', error);
      toast.error('Greška pri učitavanju podataka');
      // Set empty arrays as fallback
      setContacts([]);
      setSubscribers([]);
      setTemplates([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactStatusUpdate = async (contactId: number, status: ContactStatus) => {
    try {
      await mailerApi.updateContact(contactId, { status });
      toast.success('Status kontakta je ažuriran');
      fetchAllData();
    } catch (error) {
      console.error('Error updating contact:', error);
      toast.error('Greška pri ažuriranju kontakta');
    }
  };

  const handleMarkAsRead = async (contactId: number) => {
    try {
      await mailerApi.markAsRead(contactId);
      toast.success('Kontakt je označen kao pročitan');
      fetchAllData();
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Greška pri označavanju kao pročitano');
    }
  };

  const handleDeleteContact = async (contactId: number) => {
    try {
      await mailerApi.deleteContact(contactId);
      toast.success('Kontakt je obrisan');
      fetchAllData();
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('Greška pri brisanju kontakta');
    }
  };

  const handleCreateTemplate = async (data: TemplateFormData) => {
    try {
      const templateData: CreateEmailTemplateDto = {
        name: data.name,
        type: data.type,
        subject: data.subject,
        htmlContent: data.htmlContent,
        textContent: data.textContent,
        isActive: data.isActive
      };

      if (selectedTemplate) {
        await mailerApi.updateEmailTemplate(selectedTemplate.id, templateData as UpdateEmailTemplateDto);
        toast.success('Template je ažuriran');
      } else {
        await mailerApi.createEmailTemplate(templateData);
        toast.success('Template je kreiran');
      }

      setIsTemplateDialogOpen(false);
      setSelectedTemplate(null);
      templateForm.reset();
      fetchAllData();
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Greška pri čuvanju template-a');
    }
  };

  const handleSendNewsletter = async (data: NewsletterFormData) => {
    try {
      setIsSendingNewsletter(true);
      const newsletterData: SendNewsletterDto = {
        subject: data.subject,
        htmlContent: data.htmlContent,
        textContent: data.textContent,
        testEmails: data.testEmails.split(',').map(email => email.trim()).filter(email => email)
      };

      await mailerApi.sendNewsletter(newsletterData);
      toast.success('Newsletter je poslat');
      setIsNewsletterDialogOpen(false);
      newsletterForm.reset();
    } catch (error) {
      console.error('Error sending newsletter:', error);
      toast.error('Greška pri slanju newsletter-a');
    } finally {
      setIsSendingNewsletter(false);
    }
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    templateForm.setValue('name', template.name);
    templateForm.setValue('type', template.type);
    templateForm.setValue('subject', template.subject);
    templateForm.setValue('htmlContent', template.htmlContent);
    templateForm.setValue('textContent', template.textContent);
    templateForm.setValue('isActive', template.isActive);
    setIsTemplateDialogOpen(true);
  };

  const handleDeleteTemplate = async (templateId: number) => {
    try {
      await mailerApi.deleteEmailTemplate(templateId);
      toast.success('Template je obrisan');
      fetchAllData();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Greška pri brisanju template-a');
    }
  };

  const getContactStatusBadge = (status: ContactStatus) => {
    const statusConfig = {
      'new': { variant: 'default' as const, label: 'Novo', icon: Mail },
      'read': { variant: 'secondary' as const, label: 'Pročitano', icon: Eye },
      'replied': { variant: 'default' as const, label: 'Odgovoreno', icon: CheckCircle },
      'archived': { variant: 'outline' as const, label: 'Arhivirano', icon: Archive }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getSubscriberStatusBadge = (status: SubscriberStatus) => {
    const statusConfig = {
      'active': { variant: 'default' as const, label: 'Aktivan', icon: CheckCircle },
      'unsubscribed': { variant: 'secondary' as const, label: 'Otkazao', icon: AlertCircle },
      'bounced': { variant: 'destructive' as const, label: 'Bounced', icon: AlertCircle }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('sr-RS', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter data
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = contactStatusFilter === 'all' || contact.status === contactStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredSubscribers = subscribers.filter(subscriber => {
    const matchesSearch = subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (subscriber.name && subscriber.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = subscriberStatusFilter === 'all' || subscriber.status === subscriberStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Statistics
  const contactStats = {
    total: contacts.length,
    new: contacts.filter(c => c.status === 'new').length,
    read: contacts.filter(c => c.status === 'read').length,
    replied: contacts.filter(c => c.status === 'replied').length
  };

  const subscriberStats = {
    total: subscribers.length,
    active: subscribers.filter(s => s.status === 'active').length,
    unsubscribed: subscribers.filter(s => s.status === 'unsubscribed').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mailer</h1>
          <p className="text-muted-foreground">
            Upravljajte kontaktima, newsletter pretplatnicima i email template-ima
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={isNewsletterDialogOpen} onOpenChange={setIsNewsletterDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Send className="mr-2 h-4 w-4" />
                Pošalji Newsletter
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kontakti</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contactStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {contactStats.new} novo, {contactStats.replied} odgovoreno
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pretplatnici</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriberStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {subscriberStats.active} aktivno
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Template-i</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
            <p className="text-xs text-muted-foreground">
              {templates.filter(t => t.isActive).length} aktivno
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stopa odgovora</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contactStats.total > 0 ? Math.round((contactStats.replied / contactStats.total) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Odgovoreno na kontakte
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="contacts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="contacts">Kontakti</TabsTrigger>
          <TabsTrigger value="subscribers">Pretplatnici</TabsTrigger>
          <TabsTrigger value="templates">Template-i</TabsTrigger>
        </TabsList>

        {/* Contacts Tab */}
        <TabsContent value="contacts">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Kontakt poruke</CardTitle>
                  <CardDescription>
                    Poruke poslate preko kontakt forme
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Pretraži kontakte..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={contactStatusFilter} onValueChange={(value: any) => setContactStatusFilter(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Svi statusi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Svi statusi</SelectItem>
                    <SelectItem value="new">Novo</SelectItem>
                    <SelectItem value="read">Pročitano</SelectItem>
                    <SelectItem value="replied">Odgovoreno</SelectItem>
                    <SelectItem value="archived">Arhivirano</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Contacts Table */}
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center space-x-4">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pošaljilac</TableHead>
                      <TableHead>Naslov</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Datum</TableHead>
                      <TableHead className="text-right">Akcije</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{contact.name}</div>
                            <div className="text-sm text-muted-foreground">{contact.email}</div>
                            {contact.phone && (
                              <div className="text-sm text-muted-foreground">{contact.phone}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="font-medium truncate">{contact.subject}</div>
                            <div className="text-sm text-muted-foreground line-clamp-2">
                              {contact.message}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getContactStatusBadge(contact.status)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(contact.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {!contact.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkAsRead(contact.id)}
                                title="Označi kao pročitano"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            <Select
                              value={contact.status}
                              onValueChange={(value: ContactStatus) => handleContactStatusUpdate(contact.id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="new">Novo</SelectItem>
                                <SelectItem value="read">Pročitano</SelectItem>
                                <SelectItem value="replied">Odgovoreno</SelectItem>
                                <SelectItem value="archived">Arhivirano</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteContact(contact.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Obriši kontakt"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredContacts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Nema kontakt poruka</h3>
                          <p className="text-gray-500">
                            {searchTerm || contactStatusFilter !== 'all' 
                              ? 'Nema poruka koje odgovaraju filterima'
                              : 'Kontakt poruke će se pojaviti ovde kada ih korisnici pošalju'
                            }
                          </p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscribers Tab */}
        <TabsContent value="subscribers">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Newsletter pretplatnici</CardTitle>
                  <CardDescription>
                    Korisnici koji su se pretplatili na newsletter
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Izvezi CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Pretraži pretplatnike..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={subscriberStatusFilter} onValueChange={(value: any) => setSubscriberStatusFilter(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Svi statusi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Svi statusi</SelectItem>
                    <SelectItem value="active">Aktivni</SelectItem>
                    <SelectItem value="unsubscribed">Otkazali</SelectItem>
                    <SelectItem value="bounced">Bounced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Subscribers Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Ime</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pretplaćen</TableHead>
                    <TableHead>Ažuriran</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscribers.map((subscriber) => (
                    <TableRow key={subscriber.id}>
                      <TableCell>
                        <div className="font-medium">{subscriber.email}</div>
                      </TableCell>
                      <TableCell>
                        {subscriber.name || '-'}
                      </TableCell>
                      <TableCell>
                        {getSubscriberStatusBadge(subscriber.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(subscriber.subscribedAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(subscriber.updatedAt)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredSubscribers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Nema pretplatnika</h3>
                        <p className="text-gray-500">
                          {searchTerm || subscriberStatusFilter !== 'all'
                            ? 'Nema pretplatnika koji odgovaraju filterima'
                            : 'Newsletter pretplatnici će se pojaviti ovde'
                          }
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Email template-i</CardTitle>
                  <CardDescription>
                    Upravljajte template-ima za email poruke
                  </CardDescription>
                </div>
                <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Novi Template
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {/* Templates Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Naziv</TableHead>
                    <TableHead>Tip</TableHead>
                    <TableHead>Naslov</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Kreiran</TableHead>
                    <TableHead className="text-right">Akcije</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell>
                        <div className="font-medium">{template.name}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{template.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">{template.subject}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={template.isActive ? 'default' : 'secondary'}>
                          {template.isActive ? 'Aktivan' : 'Neaktivan'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(template.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditTemplate(template)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {templates.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Nema template-a</h3>
                        <p className="text-gray-500 mb-4">
                          Kreirajte prvi email template za automatske poruke
                        </p>
                        <Button onClick={() => setIsTemplateDialogOpen(true)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Kreiraj Template
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Template Dialog */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <form onSubmit={templateForm.handleSubmit(handleCreateTemplate)}>
            <DialogHeader>
              <DialogTitle>
                {selectedTemplate ? 'Uredi Template' : 'Novi Template'}
              </DialogTitle>
              <DialogDescription>
                Kreirajte ili uredite email template
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="template-name">Naziv template-a</Label>
                  <Input
                    id="template-name"
                    placeholder="Naziv template-a"
                    {...templateForm.register('name', { required: 'Naziv je obavezan' })}
                  />
                  {templateForm.formState.errors.name && (
                    <p className="text-sm text-red-600">
                      {templateForm.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Tip template-a</Label>
                  <Select
                    value={templateForm.watch('type')}
                    onValueChange={(value: TemplateType) => templateForm.setValue('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CUSTOM">Custom</SelectItem>
                      <SelectItem value="CONTACT_CONFIRMATION">Potvrda kontakta</SelectItem>
                      <SelectItem value="CONTACT_NOTIFICATION">Obaveštenje o kontaktu</SelectItem>
                      <SelectItem value="NEWSLETTER_WELCOME">Dobrodošlica newsletter</SelectItem>
                      <SelectItem value="NEWSLETTER_UNSUBSCRIBE">Odjava newsletter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-subject">Naslov email-a</Label>
                <Input
                  id="template-subject"
                  placeholder="Naslov email poruke"
                  {...templateForm.register('subject', { required: 'Naslov je obavezan' })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-html">HTML sadržaj</Label>
                <Textarea
                  id="template-html"
                  placeholder="HTML sadržaj email-a"
                  rows={6}
                  {...templateForm.register('htmlContent', { required: 'HTML sadržaj je obavezan' })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-text">Tekstualni sadržaj</Label>
                <Textarea
                  id="template-text"
                  placeholder="Tekstualna verzija email-a"
                  rows={4}
                  {...templateForm.register('textContent')}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="template-active"
                  {...templateForm.register('isActive')}
                  className="rounded"
                />
                <Label htmlFor="template-active">Template je aktivan</Label>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsTemplateDialogOpen(false);
                  setSelectedTemplate(null);
                  templateForm.reset();
                }}
              >
                Otkaži
              </Button>
              <Button type="submit">
                {selectedTemplate ? 'Ažuriraj Template' : 'Kreiraj Template'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Newsletter Dialog */}
      <Dialog open={isNewsletterDialogOpen} onOpenChange={setIsNewsletterDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <form onSubmit={newsletterForm.handleSubmit(handleSendNewsletter)}>
            <DialogHeader>
              <DialogTitle>Pošalji Newsletter</DialogTitle>
              <DialogDescription>
                Kreirajte i pošaljite newsletter svim aktivnim pretplatnicima
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="newsletter-subject">Naslov</Label>
                <Input
                  id="newsletter-subject"
                  placeholder="Naslov newsletter-a"
                  {...newsletterForm.register('subject', { required: 'Naslov je obavezan' })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newsletter-html">HTML sadržaj</Label>
                <Textarea
                  id="newsletter-html"
                  placeholder="HTML sadržaj newsletter-a"
                  rows={8}
                  {...newsletterForm.register('htmlContent', { required: 'HTML sadržaj je obavezan' })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newsletter-text">Tekstualni sadržaj</Label>
                <Textarea
                  id="newsletter-text"
                  placeholder="Tekstualna verzija newsletter-a"
                  rows={4}
                  {...newsletterForm.register('textContent')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="test-emails">Test email adrese (opciono)</Label>
                <Input
                  id="test-emails"
                  placeholder="test1@example.com, test2@example.com"
                  {...newsletterForm.register('testEmails')}
                />
                <p className="text-xs text-muted-foreground">
                  Odvojite email adrese zarezom za test slanje
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    Biće poslato na {subscriberStats.active} aktivnih pretplatnika
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsNewsletterDialogOpen(false);
                  newsletterForm.reset();
                }}
              >
                Otkaži
              </Button>
              <Button type="submit" disabled={isSendingNewsletter}>
                {isSendingNewsletter ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Šalje se...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Pošalji Newsletter
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}