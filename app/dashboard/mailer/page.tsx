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
  X,
  Info
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
import { useTheme } from 'next-themes';

// Add TemplateVariableHelper component inline
const TemplateVariableHelper = ({ context = 'both' }: { context?: 'newsletter' | 'contact' | 'both' }) => {
  const [copiedVariable, setCopiedVariable] = useState<string | null>(null);

  const templateVariables = [
    { variable: '{{firstName}}', description: 'Име корисника', example: 'Марко', context: 'both' },
    { variable: '{{fullName}}', description: 'Пуно име корисника', example: 'Марко Петровић', context: 'both' },
    { variable: '{{email}}', description: 'Емаил адреса', example: 'marko@example.com', context: 'both' },
    { variable: '{{year}}', description: 'Тренутна година', example: '2025', context: 'both' },
    { variable: '{{date}}', description: 'Тренутни датум', example: '13.6.2025.', context: 'both' },
    { variable: '{{companyName}}', description: 'Назив компаније', example: 'CodilioCMS', context: 'both' },
    { variable: '{{unsubscribeUrl}}', description: 'Линк за отказивање', example: 'https://...', context: 'newsletter' },
    { variable: '{{subject}}', description: 'Наслов поруке', example: 'Упит', context: 'contact' },
    { variable: '{{message}}', description: 'Садржај поруке', example: 'Занима ме...', context: 'contact' }
  ];

  const filteredVariables = templateVariables.filter(
    variable => context === 'both' || variable.context === 'both' || variable.context === context
  );

  const copyToClipboard = async (variable: string) => {
    try {
      await navigator.clipboard.writeText(variable);
      setCopiedVariable(variable);
      setTimeout(() => setCopiedVariable(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" type="button">
          <Info className="mr-2 h-4 w-4" />
          Темплате варијабле
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Темплате варијабле</DialogTitle>
          <DialogDescription>
            Користите ове варијабле у вашим емаил темплате-има
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 dark:text-gray-900">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
            <p><strong>Како користити:</strong> Укуцајте варијаблу у темплате (нпр. <code>{'{{firstName}}'}</code>) и биће замењена правом вредношћу.</p>
          </div>

          <div className="grid gap-2">
            {filteredVariables.map((variable) => (
              <div key={variable.variable} className="flex items-center justify-between p-2 border rounded">
                <div className="flex-1">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">{variable.variable}</code>
                  <p className="text-xs text-gray-600 mt-1">{variable.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(variable.variable)}
                  className="h-8 w-8 p-0"
                >
                  {copiedVariable === variable.variable ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Info className="h-4 w-4" />}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

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
  const {theme} = useTheme();

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
        toast.info(`Темплате "${selectedTemplate.name}" је учитан. Можете га уредити пре слања.`);
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
      toast.error('Грешка при учитавању података');
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
      toast.success('Статус контакта је ажуриран');
      fetchAllData();
    } catch (error) {
      console.error('Error updating contact:', error);
      toast.error('Грешка при ажурирању контакта');
    }
  };

  const handleMarkAsRead = async (contactId: number) => {
    try {
      await mailerApi.markAsRead(contactId);
      toast.success('Контакт је означен као прочитан');
      fetchAllData();
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Грешка при означавању као прочитано');
    }
  };

  const handleDeleteContact = async (contactId: number) => {
    try {
      await mailerApi.deleteContact(contactId);
      toast.success('Контакт је обрисан');
      fetchAllData();
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('Грешка при брисању контакта');
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
    replyForm.setValue('message', `\n\n---\nОригинална порука од ${contact.name} (${contact.email}):\n${contact.message}`);
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
      
      toast.success(`Одговор је послат на ${replyingToContact.email}`);
      setIsReplyDialogOpen(false);
      setReplyingToContact(null);
      replyForm.reset();
      fetchAllData();
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Грешка при слању одговора');
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
        toast.success('Темплате је ажуриран');
      } else {
        await mailerApi.createEmailTemplate(templateData);
        toast.success('Темплате је креиран');
      }

      // Reset all states
      setIsTemplateDialogOpen(false);
      setSelectedTemplate(null);
      templateForm.reset({
        name: '',
        type: 'custom' as TemplateType,
        subject: '',
        htmlContent: '',
        textContent: '',
        isActive: true
      });
      fetchAllData();
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Грешка при чувању темплате-а');
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
      toast.success('Њузлетер је послат');
      setIsNewsletterDialogOpen(false);
      newsletterForm.reset();
    } catch (error) {
      console.error('Error sending newsletter:', error);
      toast.error('Грешка при слању њузлетера');
    } finally {
      setIsSendingNewsletter(false);
    }
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    templateForm.reset({
      name: template.name,
      type: template.type,
      subject: template.subject,
      htmlContent: template.htmlContent,
      textContent: template.textContent || '',
      isActive: template.isActive
    });
    setIsTemplateDialogOpen(true);
  };

  const handleDeleteTemplate = async (templateId: number) => {
    try {
      await mailerApi.deleteEmailTemplate(templateId);
      toast.success('Темплате је обрисан');
      fetchAllData();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Грешка при брисању темплате-а');
    }
  };

  // New: Clear newsletter template selection - FIXED
  const handleClearTemplate = () => {
    newsletterForm.setValue('templateId', '');
    newsletterForm.setValue('subject', '');
    newsletterForm.setValue('htmlContent', '');
    newsletterForm.setValue('textContent', '');
    toast.info('Темплате је уклоњен. Можете написати њузлетер од почетка.');
  };

  const getContactStatusBadge = (status: ContactStatus) => {
    const statusConfig = {
      'new': { variant: 'default' as const, label: 'Ново', icon: Mail },
      'read': { variant: 'secondary' as const, label: 'Прочитано', icon: Eye },
      'replied': { variant: 'default' as const, label: 'Одговорено', icon: CheckCircle },
      'archived': { variant: 'outline' as const, label: 'Архивирано', icon: Archive }
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
      'active': { variant: 'default' as const, label: 'Активан', icon: CheckCircle },
      'unsubscribed': { variant: 'secondary' as const, label: 'Отказао', icon: AlertCircle },
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

  // for downloading (converting objArray to CSV) 
  const convertToCSV = (objArray: NewsletterSubscribe[]) => {
    const headers = Object.keys(objArray[0]).join(",");
    const rows = objArray.map(obj => Object.values(obj).join(",")).join("\n");
    return `${headers}\n${rows}`;
  }

  // download csv logic
  const downloadCSV = () => {
    const csv = convertToCSV(subscribers);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "претплатници.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Мејлер</h1>
          <p className="text-muted-foreground">
            Управљајте контактима, њузлетер претплатницима и емаил темплате-има
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={isNewsletterDialogOpen} onOpenChange={setIsNewsletterDialogOpen}>
            <DialogTrigger asChild>
              <Button variant={theme === "light" ? "default" : "secondaryDefault"}>
                <Send className="mr-2 h-4 w-4" />
                Пошаљи Њузлетер
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Контакти</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contactStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {contactStats.new} ново, {contactStats.replied} одговорено
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Претплатници</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriberStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {subscriberStats.active} активно
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Темплате-и</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
            <p className="text-xs text-muted-foreground">
              {templates.filter(t => t.isActive).length} активно
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Стопа одговора</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contactStats.total > 0 ? Math.round((contactStats.replied / contactStats.total) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Одговорено на контакте
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="contacts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="contacts">Контакти</TabsTrigger>
          <TabsTrigger value="subscribers">Претплатници</TabsTrigger>
          <TabsTrigger value="templates">Темплате-и</TabsTrigger>
        </TabsList>

        {/* Contacts Tab */}
        <TabsContent value="contacts">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Контакт поруке</CardTitle>
                  <CardDescription>
                    Поруке послате преко контакт форме
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
                    placeholder="Претражи контакте..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={contactStatusFilter} onValueChange={(value: any) => setContactStatusFilter(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Сви статуси" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Сви статуси</SelectItem>
                    <SelectItem value="new">Ново</SelectItem>
                    <SelectItem value="read">Прочитано</SelectItem>
                    <SelectItem value="replied">Одговорено</SelectItem>
                    <SelectItem value="archived">Архивирано</SelectItem>
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
                      <TableHead>Пошаљилац</TableHead>
                      <TableHead>Наслов</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Датум</TableHead>
                      <TableHead className="text-right">Акције</TableHead>
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
                              title="Погледај поруку"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStartReply(contact)}
                              title="Одговори на поруку"
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
                                <SelectItem value="new">Ново</SelectItem>
                                <SelectItem value="read">Прочитано</SelectItem>
                                <SelectItem value="replied">Одговорено</SelectItem>
                                <SelectItem value="archived">Архивирано</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteContact(contact.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Обриши контакт"
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
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Нема контакт порука</h3>
                          <p className="text-gray-500">
                            {searchTerm || contactStatusFilter !== 'all' 
                              ? 'Нема порука које одговарају филтерима'
                              : 'Контакт поруке ће се појавити овде када их корисници пошаљу'
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
                  <CardTitle>Њузлетер претплатници</CardTitle>
                  <CardDescription>
                    Корисници који су се претплатили на њузлетер
                  </CardDescription>
                </div>
                <Button onClick={downloadCSV} className="cursor-pointer" variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Извези CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Претражи претплатнике..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={subscriberStatusFilter} onValueChange={(value: any) => setSubscriberStatusFilter(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Сви статуси" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Сви статуси</SelectItem>
                    <SelectItem value="active">Активни</SelectItem>
                    <SelectItem value="unsubscribed">Отказали</SelectItem>
                    <SelectItem value="bounced">Bounced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Subscribers Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Емаил</TableHead>
                    <TableHead>Име</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Претплаћен</TableHead>
                    <TableHead>Ажуриран</TableHead>
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
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Нема претплатника</h3>
                        <p className="text-gray-500">
                          {searchTerm || subscriberStatusFilter !== 'all'
                            ? 'Нема претплатника који одговарају филтерима'
                            : 'Њузлетер претплатници ће се појавити овде'
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
                  <CardTitle>Емаил темплате-и</CardTitle>
                  <CardDescription>
                    Управљајте темплате-има за емаил поруке
                  </CardDescription>
                </div>
                <Dialog open={isTemplateDialogOpen} onOpenChange={(open) => {
                  setIsTemplateDialogOpen(open);
                  if (!open) {
                    // Reset when closing
                    setSelectedTemplate(null);
                    templateForm.reset();
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      // Reset when opening for new template
                      setSelectedTemplate(null);
                      templateForm.reset({
                        name: '',
                        type: 'custom' as TemplateType,
                        subject: '',
                        htmlContent: '',
                        textContent: '',
                        isActive: true
                      });
                    }}>
                      <Plus className="mr-2 h-4 w-4" />
                      Нови Темплате
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
                    <TableHead>Назив</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Наслов</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Креиран</TableHead>
                    <TableHead className="text-right">Акције</TableHead>
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
                          {template.isActive ? 'Активан' : 'Неактиван'}
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
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Нема темплате-а</h3>
                        <p className="text-gray-500 mb-4">
                          Креирајте први емаил темплате за аутоматске поруке
                        </p>
                        <Button onClick={() => setIsTemplateDialogOpen(true)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Креирај Темплате
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
                {selectedTemplate ? 'Уреди Темплате' : 'Нови Темплате'}
              </DialogTitle>
              <DialogDescription>
                Креирајте или уредите емаил темплате
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="template-name">Назив темплате-а</Label>
                  <Input
                    id="template-name"
                    placeholder="Назив темплате-а"
                    {...templateForm.register('name', { required: 'Назив је обавезан' })}
                  />
                  {templateForm.formState.errors.name && (
                    <p className="text-sm text-red-600">
                      {templateForm.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Тип темплате-а</Label>
                  <Select
                    value={templateForm.watch('type')}
                    onValueChange={(value: TemplateType) => templateForm.setValue('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">Custom</SelectItem>
                      <SelectItem value="contact_confirmation">Потврда контакта</SelectItem>
                      <SelectItem value="contact_notification">Обавештење о контакту</SelectItem>
                      <SelectItem value="newsletter_welcome">Добродошлица њузлетер</SelectItem>
                      <SelectItem value="newsletter_unsubscribe">Одјава њузлетер</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-subject">Наслов емаил-а</Label>
                <Input
                  id="template-subject"
                  placeholder="Наслов емаил поруке"
                  {...templateForm.register('subject', { required: 'Наслов је обавезан' })}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="template-html">HTML садржај</Label>
                  <TemplateVariableHelper />
                </div>
                <Textarea
                  id="template-html"
                  placeholder="HTML садржај емаил-а"
                  rows={6}
                  {...templateForm.register('htmlContent', { required: 'HTML садржај је обавезан' })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-text">Текстуални садржај</Label>
                <Textarea
                  id="template-text"
                  placeholder="Текстуална верзија емаил-а"
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
                <Label htmlFor="template-active">Темплате је активан</Label>
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
                Откажи
              </Button>
              <Button type="submit">
                {selectedTemplate ? 'Ажурирај Темплате' : 'Креирај Темплате'}
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
              <DialogTitle>Пошаљи Њузлетер</DialogTitle>
              <DialogDescription>
                Креирајте и пошаљите њузлетер свим активним претплатницима
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Template Selection - FIXED */}
              <div className="space-y-2">
                <Label>Изабери темплате (опционо)</Label>
                <div className="flex items-center space-x-2">
                  <Select 
                    value={newsletterForm.watch('templateId') || 'none'} 
                    onValueChange={(value) => newsletterForm.setValue('templateId', value === 'none' ? '' : value)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Изабери постојећи темплате или напиши од почетка" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Без темплате-а (пиши од почетка)</SelectItem>
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
                      title="Уклони темплате"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {watchedTemplateId && watchedTemplateId !== '' && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-sm">
                      <FileText className="h-4 w-4 text-primary-dynamic" />
                      <span className="text-primary-dynamic">
                        Темплате "{templates.find(t => t.id.toString() === watchedTemplateId)?.name}" је учитан. 
                        Можете уредити садржај пре слања.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newsletter-subject">Наслов</Label>
                <Input
                  id="newsletter-subject"
                  placeholder="Наслов њузлетера"
                  {...newsletterForm.register('subject', { required: 'Наслов је обавезан' })}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="newsletter-html">HTML садржај</Label>
                  <TemplateVariableHelper context="newsletter" />
                </div>
                <Textarea
                  id="newsletter-html"
                  placeholder="HTML садржај њузлетера"
                  rows={8}
                  {...newsletterForm.register('htmlContent', { required: 'HTML садржај је обавезан' })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newsletter-text">Текстуални садржај</Label>
                <Textarea
                  id="newsletter-text"
                  placeholder="Текстуална верзија њузлетера"
                  rows={4}
                  {...newsletterForm.register('textContent')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="test-emails">Тест емаил адресе (опционо)</Label>
                <Input
                  id="test-emails"
                  placeholder="test1@example.com, test2@example.com"
                  {...newsletterForm.register('testEmails')}
                />
                <p className="text-xs text-muted-foreground">
                  Одвојите емаил адресе зарезом за тест слање
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-primary-dynamic" />
                  <span className="text-sm font-medium text-primary-dynamic">
                    Биће послато на {subscriberStats.active} активних претплатника
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
                Откажи
              </Button>
              <Button type="submit" disabled={isSendingNewsletter} variant={theme === "light" ? "default" : "secondaryDefault"}>
                {isSendingNewsletter ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Шаље се...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Пошаљи Њузлетер
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
              <span>Порука од {viewingContact?.name}</span>
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
                  <Label className="text-sm font-medium text-gray-600">Пошаљилац</Label>
                  <p className="font-medium">{viewingContact.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Емаил</Label>
                  <p className="text-sm">{viewingContact.email}</p>
                </div>
                {viewingContact.phone && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Телефон</Label>
                    <p className="text-sm flex items-center">
                      <Phone className="h-3 w-3 mr-1" />
                      {viewingContact.phone}
                    </p>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium text-gray-600">Статус</Label>
                  <div className="mt-1">
                    {getContactStatusBadge(viewingContact.status)}
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div>
                <Label className="text-sm font-medium text-gray-600">Наслов</Label>
                <p className="text-lg font-medium mt-1">{viewingContact.subject}</p>
              </div>

              {/* Message */}
              <div>
                <Label className="text-sm font-medium text-gray-600">Порука</Label>
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
              Затвори
            </Button>
            <Button
              onClick={() => viewingContact && handleStartReply(viewingContact)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Reply className="mr-2 h-4 w-4" />
              Одговори
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
                <span>Одговори на поруку</span>
              </DialogTitle>
              <DialogDescription>
                Одговор ће бити послат на {replyingToContact?.email}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Original message info */}
              {replyingToContact && (
                <div className="p-3 bg-gray-50 border-l-4 border-blue-500 rounded">
                  <div className="text-sm text-gray-600">
                    <strong>Оригинална порука од:</strong> {replyingToContact.name} ({replyingToContact.email})
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    <strong>Наслов:</strong> {replyingToContact.subject}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="reply-subject">Наслов одговора</Label>
                <Input
                  id="reply-subject"
                  placeholder="Re: ..."
                  {...replyForm.register('subject', { required: 'Наслов је обавезан' })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reply-message">Ваш одговор</Label>
                <Textarea
                  id="reply-message"
                  placeholder="Напишите ваш одговор овде..."
                  rows={8}
                  {...replyForm.register('message', { required: 'Порука је обавезна' })}
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
                Откажи
              </Button>
              <Button type="submit" disabled={isSendingReply}>
                {isSendingReply ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Шаље се...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Пошаљи одговор
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