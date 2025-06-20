// Templates/Contact/ContactTemplate.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Page, Post, CreateContactDto } from '@/lib/types';
import { mailerApi } from '@/lib/api';
import { toast } from 'sonner';
import { PostsSection } from '@/components/frontend/posts-section';

interface ContactTemplateProps {
  page: Page;
  posts: Post[];
  institutionData: {
    name: string;
    address: string;
    phone: string;
    email: string;
    workingHours: string;
  };
}

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export function ContactTemplate({ page, posts, institutionData }: ContactTemplateProps) {
  const [contactForm, setContactForm] = useState<ContactForm>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (field: keyof ContactForm, value: string) => {
    setContactForm(prev => ({ ...prev, [field]: value }));
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');
    setSubmitSuccess(false);
    
    try {
      // Validacija forme
      if (!contactForm.name.trim()) {
        throw new Error('Име и презиме је обавезно');
      }
      if (!contactForm.email.trim()) {
        throw new Error('Емаил адреса је обавезна');
      }
      if (!contactForm.subject.trim()) {
        throw new Error('Наслов поруке је обавезан');
      }
      if (!contactForm.message.trim()) {
        throw new Error('Порука је обавезна');
      }

      // Priprema podataka za API
      const contactData: CreateContactDto = {
        name: contactForm.name.trim(),
        email: contactForm.email.trim(),
        phone: contactForm.phone.trim(),
        subject: contactForm.subject.trim(),
        message: contactForm.message.trim()
      };

      const response = await mailerApi.createContact(contactData);
      
      setSubmitSuccess(true);
      setSubmitMessage('Хвала вам! Ваша порука је успешно послата. Контактираћемо вас ускоро.');
      
      // Resetovanje forme
      setContactForm({ 
        name: '', 
        email: '', 
        phone: '', 
        subject: '', 
        message: '' 
      });

      toast.success('Порука је успешно послата!');
      
    } catch (error: any) {
      console.error('Error submitting contact form:', error);
      
      setSubmitSuccess(false);
      let errorMessage = 'Грешка при слању поруке. Молимо покушајте поново.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setSubmitMessage(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Information */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Контакт информације</h2>
          
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <MapPin className="h-6 w-6 text-primary-dynamic mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Адреса</h3>
                    <p className="text-gray-600">{institutionData.address}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Phone className="h-6 w-6 text-primary-dynamic mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Телефон</h3>
                    <p className="text-gray-600">{institutionData.phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Mail className="h-6 w-6 text-primary-dynamic mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Емаил</h3>
                    <p className="text-gray-600">{institutionData.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Clock className="h-6 w-6 text-primary-dynamic mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Радно време</h3>
                    <p className="text-gray-600">{institutionData.workingHours}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content from CMS */}
          <div className="mt-8">
            <div 
              className="prose max-w-none "
              dangerouslySetInnerHTML={{ __html: page?.content || '' }}
            />
          </div>
        </div>

        {/* Contact Form */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Пошаљите нам поруку</h2>
          
          <Card>
            <CardContent className="p-6">
              {/* Success/Error Message */}
              {submitMessage && (
                <div className={`mb-6 p-4 rounded-lg border flex items-start space-x-2 ${
                  submitSuccess 
                    ? 'bg-green-50 text-green-800 border-green-200' 
                    : 'bg-red-50 text-red-800 border-red-200'
                }`}>
                  {submitSuccess ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="text-sm">{submitMessage}</div>
                </div>
              )}

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="block text-sm font-medium mb-2">
                    Име и презиме *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Ваше име и презиме"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="block text-sm font-medium mb-2">
                    Емаил адреса *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="ваш@email.com"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="block text-sm font-medium mb-2">
                    Телефон
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={contactForm.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+381 11 123 4567"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Label htmlFor="subject" className="block text-sm font-medium mb-2">
                    Наслов поруке *
                  </Label>
                  <Input
                    id="subject"
                    type="text"
                    required
                    value={contactForm.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    placeholder="Наслов ваше поруке"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="block text-sm font-medium mb-2">
                    Порука *
                  </Label>
                  <Textarea
                    id="message"
                    required
                    rows={6}
                    value={contactForm.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Овде упишите вашу поруку..."
                    disabled={isSubmitting}
                  />
                </div>

                <Button variant="primary" type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Шаље се...
                    </>
                  ) : (
                    'Пошаљи поруку'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Posts Section */}
      <PostsSection posts={posts} />
    </div>
  );
}