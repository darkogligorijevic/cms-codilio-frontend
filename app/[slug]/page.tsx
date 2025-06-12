// app/[slug]/page.tsx - FIXED VERSION
'use client';

import { use, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Building,
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Clock,
  FileText,
  Users,
  TrendingUp,
  ChevronRight,
  Eye,
  Calendar
} from 'lucide-react';
import Link from 'next/link';
import { pagesApi, postsApi, mediaApi } from '@/lib/api';
import type { Page, Post } from '@/lib/types';

interface DynamicPageProps {
  params: Promise<{ slug: string }>;
}

// Contact form interface
interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function DynamicPage({ params }: DynamicPageProps) {
  const resolvedParams = use(params);
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState<Page | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Contact form state
  const [contactForm, setContactForm] = useState<ContactForm>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  useEffect(() => {
    fetchPage();
  }, [resolvedParams.slug]);

  const fetchPage = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const pageData = await pagesApi.getBySlug(resolvedParams.slug);
      setPage(pageData);
    } catch (error) {
      console.error('Error fetching page:', error);
      setError('Stranica nije pronađena');
    } finally {
      setIsLoading(false);
    }
  };

  // FIX: Fetch posts specific to this page
  const fetchPosts = async () => {
    if (!page?.id) return; // Wait for page to load first
    
    try {
      setIsLoadingPosts(true);
      console.log('Fetching posts for page:', page.id);

      // Get posts that are assigned to this specific page
      const allPosts = await postsApi.getPublished(1, 50); // Get more posts to filter
      const pageSpecificPosts = allPosts.posts.filter(post => 
        post.pages && post.pages.some(p => p.id === page.id))
      
      console.log('Posts for this page:', pageSpecificPosts);
      setPosts(pageSpecificPosts.slice(0, 6)); // Limit to 6

    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const handleInputChange = (field: keyof ContactForm, value: string) => {
    setContactForm(prev => ({ ...prev, [field]: value }));
  };

  // FIX: Fetch posts after page is loaded
  useEffect(() => {
    if (page?.id) {
      fetchPosts(); // Only fetch posts when we have page data
    }
  }, [page?.id]); // Depend on page.id

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sr-RS', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
    if (diffInHours < 24) return `pre ${diffInHours} sati`;
    if (diffInHours < 168) return `pre ${Math.floor(diffInHours / 24)} dana`;
    return formatDate(dateString);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate form submission - u realnoj aplikaciji bi ovo išlo na backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitMessage('Hvala vam! Vaša poruka je uspešno poslata. Kontaktiraćemo vas uskoro.');
      setContactForm({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setSubmitMessage('Greška pri slanju poruke. Molimo pokušajte ponovo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to render posts section
  const renderPostsSection = () => (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Objave za ovu stranicu</h3>
          <p className="text-sm text-gray-600 mt-1">
            {posts.length > 0 ? `Prikazuje se ${posts.length} objava` : 'Nema objava za ovu stranicu'}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/objave">
            Sve objave
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {isLoadingPosts ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {post.category && (
                        <Badge variant="secondary">
                          {post.category.name}
                        </Badge>
                      )}
                      <span className="text-sm text-gray-500">
                        {getTimeAgo(post.publishedAt || post.createdAt)}
                      </span>
                    </div>
                    
                    <h4 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600">
                      <Link href={`/objave/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h4>
                    
                    {post.excerpt && (
                      <p className="text-gray-600 mb-3 text-sm lg:text-base">
                        {post.excerpt}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Eye className="mr-1 h-3 w-3" />
                        {post.viewCount}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        {formatDate(post.publishedAt || post.createdAt)}
                      </span>
                    </div>
                  </div>
                  
                  {post.featuredImage && (
                    <div className="ml-4 flex-shrink-0 hidden sm:block">
                      <img
                        src={mediaApi.getFileUrl(post.featuredImage)}
                        alt={post.title}
                        className="w-24 h-16 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nema objava za ovu stranicu</h3>
            <p className="text-gray-500 mb-4">
              Trenutno nema objava dodeljenih ovoj stranici. 
              Administrator može dodeliti objave ovoj stranici iz CMS-a.
            </p>
            <Button variant="outline" asChild>
              <Link href="/objave">Pogledaj sve objave</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderPageContent = () => {
    if (!page) return null;

    // Render different templates based on page template
    switch (page.template) {
      case 'contact':
        return renderContactTemplate();
      case 'about':
        return renderAboutTemplate();
      case 'services':
        return renderServicesTemplate();
      case 'transparency':
        return renderTransparencyTemplate();
      default:
        return renderDefaultTemplate();
    }
  };

  const renderContactTemplate = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Information */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Kontakt informacije</h2>
          
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <MapPin className="h-6 w-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Adresa</h3>
                    <p className="text-gray-600">Trg Oslobođenja 1, 11400 Mladenovac</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Phone className="h-6 w-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Telefon</h3>
                    <p className="text-gray-600">+381 11 823 4567</p>
                    <p className="text-gray-600">+381 11 823 4568 (fax)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Mail className="h-6 w-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <p className="text-gray-600">info@mladenovac.rs</p>
                    <p className="text-gray-600">poverenik@mladenovac.rs</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Clock className="h-6 w-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Radno vreme</h3>
                    <p className="text-gray-600">Ponedeljak - Petak: 07:30 - 15:30</p>
                    <p className="text-gray-600">Šalter za građane: 08:00 - 16:00</p>
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
          <h2 className="text-2xl font-bold mb-6">Pošaljite nam poruku</h2>
          
          <Card>
            <CardContent className="p-6">
              {submitMessage && (
                <div className={`mb-6 p-4 rounded-lg ${
                  submitMessage.includes('Hvala') 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {submitMessage}
                </div>
              )}

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Ime i prezime *
                  </label>
                  <Input
                    id="name"
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Vaše ime i prezime"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email adresa *
                  </label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="vaš@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-2">
                    Naslov poruke *
                  </label>
                  <Input
                    id="subject"
                    type="text"
                    required
                    value={contactForm.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    placeholder="Naslov vaše poruke"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Poruka *
                  </label>
                  <Textarea
                    id="message"
                    required
                    rows={6}
                    value={contactForm.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Ovde upišite vašu poruku..."
                  />
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? 'Šalje se...' : 'Pošalji poruku'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Posts Section for Contact Page */}
      {renderPostsSection()}
    </div>
  );

  const renderAboutTemplate = () => (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-8">
        <h2 className="text-3xl font-bold text-blue-900 mb-4">O našoj instituciji</h2>
        <p className="text-lg text-blue-800">
          Posvećeni transparentnosti, efikasnosti i služenju građanima
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900">53.096</div>
            <div className="text-sm text-gray-600">Građana</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <MapPin className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900">32</div>
            <div className="text-sm text-gray-600">Naselja</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900">339 km²</div>
            <div className="text-sm text-gray-600">Površina</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="prose prose-lg max-w-none">
        <div dangerouslySetInnerHTML={{ __html: page?.content || '' }} />
      </div>

      {/* Services Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Naše usluge</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-gray-50">
              <h3 className="font-semibold mb-2">Građanski servisi</h3>
              <p className="text-sm text-gray-600">Izdavanje dokumenata, potvrda i dozvola</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-gray-50">
              <h3 className="font-semibold mb-2">Urbanizam</h3>
              <p className="text-sm text-gray-600">Građevinske dozvole i urbanističko planiranje</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-gray-50">
              <h3 className="font-semibold mb-2">Komunalne usluge</h3>
              <p className="text-sm text-gray-600">Održavanje javnih površina i infrastrukture</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-gray-50">
              <h3 className="font-semibold mb-2">Socijalna zaštita</h3>
              <p className="text-sm text-gray-600">Pomoć i podrška građanima</p>
            </div>
          </div>
          <div className="mt-6">
            <Button asChild>
              <Link href="/usluge">
                Pogledaj sve usluge
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts Section for About Page */}
      {renderPostsSection()}
    </div>
  );

  const renderServicesTemplate = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Usluge za građane</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Pružamo širok spektar usluga za naše građane. Sve usluge možete obaviti lično ili online.
        </p>
      </div>

      {/* Main Content from CMS */}
      <div className="prose prose-lg max-w-none">
        <div dangerouslySetInnerHTML={{ __html: page?.content || '' }} />
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            title: "Lični dokumenti",
            description: "Izdavanje ličnih karata, pasoša i drugih dokumenata",
            icon: FileText,
            items: ["Lična karta", "Pasoš", "Vozačka dozvola", "Potvrde o prebivalištu"]
          },
          {
            title: "Građevinske dozvole", 
            description: "Sve što je potrebno za gradnju i rekonstrukciju",
            icon: Building,
            items: ["Građevinska dozvola", "Lokacijska dozvola", "Upotrebna dozvola", "Legalizacija"]
          },
          {
            title: "Komunalne usluge",
            description: "Usluge vezane za komunalnu infrastrukturu",
            icon: Users,
            items: ["Voda i kanalizacija", "Odvoz smeća", "Grejanje", "Održavanje puteva"]
          }
        ].map((service, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <service.icon className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
              <p className="text-gray-600 mb-4">{service.description}</p>
              <ul className="space-y-1">
                {service.items.map((item, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-center">
                    <ChevronRight className="h-3 w-3 mr-2 text-blue-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contact CTA */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-8 text-center">
          <h3 className="text-xl font-semibold mb-4">Potrebna vam je pomoć?</h3>
          <p className="text-gray-600 mb-6">
            Naš tim je spreman da vam pomogne sa svim pitanjima vezanim za naše usluge.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/kontakt">Kontaktirajte nas</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/objave">Najnovije objave</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts Section for Services Page */}
      {renderPostsSection()}
    </div>
  );

  const renderTransparencyTemplate = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Transparentnost</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Pristup informacijama od javnog značaja - naša obaveza prema građanima
        </p>
      </div>

      {/* Main Content from CMS */}
      <div className="prose prose-lg max-w-none">
        <div dangerouslySetInnerHTML={{ __html: page?.content || '' }} />
      </div>

      {/* Transparency Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          {
            title: "Budžet i finansije",
            description: "Budžetski dokumenti, finansijski izveštaji, javne nabavke",
            icon: TrendingUp,
            link: "/budzet"
          },
          {
            title: "Javne nabavke",
            description: "Tenderi, ugovori, izveštaji o sprovedenim postupcima",
            icon: FileText,
            link: "/javne-nabavke"
          },
          {
            title: "Zapisnici sa sednica",
            description: "Zapisnici i dokumenti sa sednica skupštine i komisija",
            icon: Users,
            link: "/sednice"
          },
          {
            title: "Planovi i strategije",
            description: "Razvojni planovi, strategije, prostorni planovi",
            icon: Building,
            link: "/planovi"
          }
        ].map((category, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <category.icon className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">{category.title}</h3>
              <p className="text-gray-600 mb-4">{category.description}</p>
              <Button variant="outline" asChild>
                <Link href={category.link}>
                  Pogledaj dokumente
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Box */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-2">Pravo na pristup informacijama</h3>
          <p className="text-gray-700">
            U skladu sa Zakonom o slobodnom pristupu informacijama od javnog značaja, 
            svaki građanin ima pravo da zatraži pristup informacijama koje poseduje naša institucija. 
            Zahtevi se mogu podneti lično, poštom ili elektronski.
          </p>
        </CardContent>
      </Card>

      {/* Posts Section for Transparency Page */}
      {renderPostsSection()}
    </div>
  );

  const renderDefaultTemplate = () => (
    <div className="prose prose-lg max-w-none">
      <div dangerouslySetInnerHTML={{ __html: page?.content || '' }} />
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center space-x-3">
                <Building className="h-8 w-8 text-blue-600" />
                <span className="text-lg font-bold text-gray-900">Opština Mladenovac</span>
              </Link>
            </div>
          </div>
        </header>
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center space-x-3">
                <Building className="h-8 w-8 text-blue-600" />
                <span className="text-lg font-bold text-gray-900">Opština Mladenovac</span>
              </Link>
              <Button variant="outline" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Nazad na početnu
                </Link>
              </Button>
            </div>
          </div>
        </header>
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Stranica nije pronađena</h1>
            <p className="text-gray-600 mb-6">
              Stranica koju tražite ne postoji ili je uklonjena.
            </p>
            <Button asChild>
              <Link href="/">Nazad na početnu</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3">
              <Building className="h-8 w-8 text-blue-600" />
              <span className="text-lg font-bold text-gray-900">Opština Mladenovac</span>
            </Link>
            <nav className="flex items-center space-x-6">
              <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
                Početna
              </Link>
              <Link href="/objave" className="text-gray-700 hover:text-blue-600 transition-colors">
                Objave
              </Link>
              <Link href="/dokumenti" className="text-gray-700 hover:text-blue-600 transition-colors">
                Dokumenti
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">{page.title}</h1>
            <Button variant="outline" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Nazad na početnu
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderPageContent()}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-400">
            © 2024 Opština Mladenovac. Sva prava zadržana.
          </p>
        </div>
      </footer>
    </div>
  );
}