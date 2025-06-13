// app/dashboard/mailer/page.tsx - Fixed version
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
  Loader2,
  Reply,
  ArrowLeft,
  ExternalLink,
  Phone,
  X
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
  SendNewsletterDto,
  ReplyToContactDto
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
  templateId: string; // Added template selection
  subject: string;
  htmlContent: string;
  textContent: string;
  testEmails: string;
}

interface ReplyFormData {
  subject: string;
  message: string;
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
  const [isEmailViewerOpen, setIsEmailViewerOpen] = useState(false); // New: Email viewer dialog
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false); // New: Reply dialog
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [viewingContact, setViewingContact] = useState<Contact | null>(null); // New: Contact being viewed
  const [replyingToContact, setReplyingToContact] = useState<Contact | null>(null); // New: Contact being replied to
  const [isSendingNewsletter, setIsSendingNewsletter] = useState(false);
  const [isSendingReply, setIsSendingReply] = useState(false); // New: Reply sending state

  // Forms
  const contactForm = useForm<ContactFormData>();
  const templateForm = useForm<TemplateFormData>({
    defaultValues: {
      name: '',
      type: 'custom' as TemplateType,
      subject: '',
      htmlContent: '',
      textContent: '',
      isActive: true
    }
  });
  const newsletterForm = useForm<NewsletterFormData>({
    defaultValues: {
      templateId: 'none', // Changed from empty string to 'none'
      subject: '',
      htmlContent: '',
      textContent: '',
      testEmails: ''
    }
  });
  const replyForm = useForm<ReplyFormData>({ // New: Reply form
    defaultValues: {
      subject: '',
      message: ''
    }
  });

  // Watch for template selection changes
  const watchedTemplateId = newsletterForm.watch('templateId');

  useEffect(() => {
    fetchAllData();
  }, []);

  // New: Handle template selection for newsletter - FIXED
  useEffect(() => {
    if (watchedTemplateId && watchedTemplateId !== '' && watchedTemplateId !== 'none') {
      const selectedTemplate = templates.find(t => t.id.toString() === watchedTemplateId);
      if (selectedTemplate) {
        newsletterForm.setValue('subject', selectedTemplate.subject);
        newsletterForm.setValue('htmlContent', selectedTemplate.htmlContent);
        newsletterForm.setValue('textContent', selectedTemplate.textContent || '');
        toast.info(`Template "${selectedTemplate.name}" je učitan. Možete ga urediti pre slanja.`);
      }
    }
  }, [watchedTemplateId, templates, newsletterForm]);

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

  // New: View contact details
  const handleViewContact = (contact: Contact) => {
    setViewingContact(contact);
    setIsEmailViewerOpen(true);
    
    // Mark as read if not already read
    if (!contact.isRead) {
      handleMarkAsRead(contact.id);
    }
  };

  // New: Start replying to contact
  const handleStartReply = (contact: Contact) => {
    setReplyingToContact(contact);
    replyForm.setValue('subject', `Re: ${contact.subject}`);
    replyForm.setValue('message', `\n\n---\nOriginal message from ${contact.name} (${contact.email}):\n${contact.message}`);
    setIsEmailViewerOpen(false);
    setIsReplyDialogOpen(true);
  };

  // New: Send reply to contact
  const handleSendReply = async (data: ReplyFormData) => {
    if (!replyingToContact) return;

    try {
      setIsSendingReply(true);
      
      // Send reply using API
      const replyData: ReplyToContactDto = {
        subject: data.subject,
        message: data.message
      };
      
      await mailerApi.sendReply(replyingToContact.id, replyData);
      
      // Update contact status to replied
      await mailerApi.updateContact(replyingToContact.id, { status: 'replied' as ContactStatus });
      
      toast.success(`Odgovor je poslat na ${replyingToContact.email}`);
      setIsReplyDialogOpen(false);
      setReplyingToContact(null);
      replyForm.reset();
      fetchAllData();
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Greška pri slanju odgovora');
    } finally {
      setIsSendingReply(false);
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
    templateForm.setValue('textContent', template.textContent || '');
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

  // New: Clear newsletter template selection - FIXED
  const handleClearTemplate = () => {
    newsletterForm.setValue('templateId', '');
    newsletterForm.setValue('subject', '');
    newsletterForm.setValue('htmlContent', '');
    newsletterForm.setValue('textContent', '');
    toast.info('Template je uklonjen. Možete napisati newsletter od početka.');
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
                              <div className="text-sm text-muted-foreground flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                {contact.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="font-medium truncate">{contact.subject}</div>
                            <div className="text-sm text-muted-foreground line-clamp-2">
                              {contact.message.length > 100 
                                ? `${contact.message.substring(0, 100)}...` 
                                : contact.message
                              }
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
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewContact(contact)}
                              title="Pogledaj poruku"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStartReply(contact)}
                              title="Odgovori na poruku"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Reply className="h-4 w-4" />
                            </Button>
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
                      <SelectItem value="custom">Custom</SelectItem>
                      <SelectItem value="contact_confirmation">Potvrda kontakta</SelectItem>
                      <SelectItem value="contact_notification">Obaveštenje o kontaktu</SelectItem>
                      <SelectItem value="newsletter_welcome">Dobrodošlica newsletter</SelectItem>
                      <SelectItem value="newsletter_unsubscribe">Odjava newsletter</SelectItem>
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

      {/* Enhanced Newsletter Dialog with Template Selection - FIXED */}
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
              {/* Template Selection - FIXED */}
              <div className="space-y-2">
                <Label>Izaberi template (opciono)</Label>
                <div className="flex items-center space-x-2">
                  <Select 
                    value={newsletterForm.watch('templateId') || 'none'} 
                    onValueChange={(value) => newsletterForm.setValue('templateId', value === 'none' ? '' : value)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Izaberi postojeći template ili napiši od početka" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Bez template-a (piši od početka)</SelectItem>
                      {templates.filter(t => t.isActive).map((template) => (
                        <SelectItem key={template.id} value={template.id.toString()}>
                          <div className="flex items-center justify-between w-full">
                            <span>{template.name}</span>
                            <Badge variant="outline" className="ml-2">
                              {template.type}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {watchedTemplateId && watchedTemplateId !== '' && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleClearTemplate}
                      title="Ukloni template"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {watchedTemplateId && watchedTemplateId !== '' && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-sm">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="text-blue-800">
                        Template "{templates.find(t => t.id.toString() === watchedTemplateId)?.name}" je učitan. 
                        Možete urediti sadržaj pre slanja.
                      </span>
                    </div>
                  </div>
                )}
              </div>

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

      {/* Email Viewer Dialog */}
      <Dialog open={isEmailViewerOpen} onOpenChange={setIsEmailViewerOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>Poruka od {viewingContact?.name}</span>
            </DialogTitle>
            <DialogDescription>
              {viewingContact && formatDate(viewingContact.createdAt)}
            </DialogDescription>
          </DialogHeader>

          {viewingContact && (
            <div className="space-y-4 py-4">
              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Pošaljilac</Label>
                  <p className="font-medium">{viewingContact.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Email</Label>
                  <p className="text-sm">{viewingContact.email}</p>
                </div>
                {viewingContact.phone && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Telefon</Label>
                    <p className="text-sm flex items-center">
                      <Phone className="h-3 w-3 mr-1" />
                      {viewingContact.phone}
                    </p>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <div className="mt-1">
                    {getContactStatusBadge(viewingContact.status)}
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div>
                <Label className="text-sm font-medium text-gray-600">Naslov</Label>
                <p className="text-lg font-medium mt-1">{viewingContact.subject}</p>
              </div>

              {/* Message */}
              <div>
                <Label className="text-sm font-medium text-gray-600">Poruka</Label>
                <div className="mt-2 p-4 bg-white border rounded-lg">
                  <p className="whitespace-pre-wrap">{viewingContact.message}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEmailViewerOpen(false)}
            >
              Zatvori
            </Button>
            <Button
              onClick={() => viewingContact && handleStartReply(viewingContact)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Reply className="mr-2 h-4 w-4" />
              Odgovori
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <form onSubmit={replyForm.handleSubmit(handleSendReply)}>
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Reply className="h-5 w-5" />
                <span>Odgovori na poruku</span>
              </DialogTitle>
              <DialogDescription>
                Odgovor će biti poslat na {replyingToContact?.email}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Original message info */}
              {replyingToContact && (
                <div className="p-3 bg-gray-50 border-l-4 border-blue-500 rounded">
                  <div className="text-sm text-gray-600">
                    <strong>Originalna poruka od:</strong> {replyingToContact.name} ({replyingToContact.email})
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    <strong>Naslov:</strong> {replyingToContact.subject}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="reply-subject">Naslov odgovora</Label>
                <Input
                  id="reply-subject"
                  placeholder="Re: ..."
                  {...replyForm.register('subject', { required: 'Naslov je obavezan' })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reply-message">Vaš odgovor</Label>
                <Textarea
                  id="reply-message"
                  placeholder="Napišite vaš odgovor ovde..."
                  rows={8}
                  {...replyForm.register('message', { required: 'Poruka je obavezna' })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsReplyDialogOpen(false);
                  setReplyingToContact(null);
                  replyForm.reset();
                }}
              >
                Otkaži
              </Button>
              <Button type="submit" disabled={isSendingReply}>
                {isSendingReply ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Šalje se...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Pošalji odgovor
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