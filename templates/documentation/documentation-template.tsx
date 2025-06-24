// templates/documentation/documentation-template.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Download, 
  FileText, 
  File,
  Calendar,
  Folder,
  Eye,
  Building,
  DollarSign,
  FileCheck,
  Clipboard,
  BarChart3,
  AlertCircle,
  Filter,
  X
} from 'lucide-react';
import { TemplateProps } from '../template-registry';
import { mediaApi } from '@/lib/api';
import { MediaCategory, type Media } from '@/lib/types';
import { toast } from 'sonner';

// Category mapping for icons and labels
const categoryConfig = {
  [MediaCategory.PROCUREMENT]: {
    label: 'Javne nabavke',
    icon: Building,
    color: 'bg-blue-100 text-blue-800',
    description: 'Dokumenti vezani za javne nabavke i tendere'
  },
  [MediaCategory.FINANCIAL]: {
    label: 'Finansijski izveštaji',
    icon: DollarSign,
    color: 'bg-green-100 text-green-800',
    description: 'Budžeti, finansijski planovi i izveštaji'
  },
  [MediaCategory.DECISIONS]: {
    label: 'Odluke',
    icon: FileCheck,
    color: 'bg-purple-100 text-purple-800',
    description: 'Odluke donesene na sastancima i sednicama'
  },
  [MediaCategory.PLANS]: {
    label: 'Planovi',
    icon: Clipboard,
    color: 'bg-orange-100 text-orange-800',
    description: 'Godišnji planovi rada i razvoja'
  },
  [MediaCategory.REPORTS]: {
    label: 'Izveštaji',
    icon: BarChart3,
    color: 'bg-red-100 text-red-800',
    description: 'Izveštaji o radu uprave i drugih organa'
  },
  [MediaCategory.OTHER]: {
    label: 'Ostalo',
    icon: Folder,
    color: 'bg-gray-100 text-gray-800',
    description: 'Ostali dokumenti i mediji'
  }
};

export function DocumentationTemplate({ page, institutionData, settings }: TemplateProps) {
  const [documents, setDocuments] = useState<Media[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MediaCategory | 'all'>('all');
  const [categories, setCategories] = useState<Array<{category: MediaCategory, count: number}>>([]);

  // Helper function to get category from page title
  const getCategoryFromPageTitle = (title: string): MediaCategory | null => {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('javne nabavke')) return MediaCategory.PROCUREMENT;
    if (titleLower.includes('finansijski')) return MediaCategory.FINANCIAL;
    if (titleLower.includes('odluke')) return MediaCategory.DECISIONS;
    if (titleLower.includes('planovi')) return MediaCategory.PLANS;
    if (titleLower.includes('izveštaji')) return MediaCategory.REPORTS;
    
    return null;
  };

  // Helper function to get category configuration
  const getCategoryConfig = (category: MediaCategory) => {
    return categoryConfig[category] || categoryConfig[MediaCategory.OTHER];
  };

  // Check if this is a category subpage
  const isSubpage = page.parentId !== null;
  const pageCategory = isSubpage ? getCategoryFromPageTitle(page.title) : null;

  useEffect(() => {
    fetchDocuments();
  }, [pageCategory]);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchTerm, selectedCategory]);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      
      let fetchedDocuments: Media[];
      
      if (isSubpage && pageCategory) {
        // For subpages, fetch only documents from that specific category
        fetchedDocuments = await mediaApi.getByCategory(pageCategory);
        // Filter only public documents
        fetchedDocuments = fetchedDocuments.filter(doc => doc.isPublic);
      } else {
        // For main documentation page, fetch all public documents
        fetchedDocuments = await mediaApi.getPublic();
      }
      
      // Filter only non-image files (documents)
      const documentFiles = fetchedDocuments.filter(media => 
        !media.mimeType.startsWith('image/')
      );
      
      setDocuments(documentFiles);
      
      // Calculate category statistics
      const categoryStats = Object.values(MediaCategory).map(category => ({
        category,
        count: documentFiles.filter(doc => doc.category === category).length
      })).filter(stat => stat.count > 0);
      
      setCategories(categoryStats);
      
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Greška pri učitavanju dokumenata');
    } finally {
      setIsLoading(false);
    }
  };

  const filterDocuments = () => {
    let filtered = documents;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.caption?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter (only for main documentation page)
    if (!isSubpage && selectedCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === selectedCategory);
    }

    setFilteredDocuments(filtered);
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return <FileText className="h-5 w-5" />;
    if (mimeType.includes('word') || mimeType.includes('document')) return <FileText className="h-5 w-5" />;
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return <FileText className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sr-RS', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const downloadDocument = (doc: Media) => {
    const link = document.createElement('a');
    link.href = mediaApi.getFileUrl(doc.filename);
    link.download = doc.originalName;
    link.click();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          {page.title}
        </h1>
        
        {isSubpage && pageCategory && (
          <div className="flex justify-center">
            <Badge className={`px-4 py-2 text-lg ${getCategoryConfig(pageCategory).color}`}>
              {React.createElement(getCategoryConfig(pageCategory).icon, { className: "mr-2 h-5 w-5" })}
              {getCategoryConfig(pageCategory).label}
            </Badge>
          </div>
        )}
        
        {page.content && (
          <div 
            className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        )}
      </div>

      {/* Search and Filters - Only show on main documentation page */}
      {!isSubpage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="mr-2 h-5 w-5" />
              Pretraga dokumenata
            </CardTitle>
            <CardDescription>
              Pronađite dokumente pomoću pretrage ili filtera po kategorijama
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Pretraži dokumente po nazivu ili opisu..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as MediaCategory | 'all')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                >
                  <option value="all">Sve kategorije</option>
                  {categories.map(({ category, count }) => {
                    const config = getCategoryConfig(category);
                    return (
                      <option key={category} value={category}>
                        {config.label} ({count})
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {(searchTerm || selectedCategory !== 'all') && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Prikazuje se {filteredDocuments.length} od {documents.length} dokumenata
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="flex items-center"
                >
                  <X className="mr-1 h-4 w-4" />
                  Očisti filtere
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Category Statistics - Only show on main documentation page */}
      {!isSubpage && categories.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map(({ category, count }) => {
            const config = getCategoryConfig(category);
            const IconComponent = config.icon;
            
            return (
              <Card 
                key={category}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedCategory(category)}
              >
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <div className={`p-2 rounded-lg ${config.color} mr-3`}>
                    {React.createElement(IconComponent, { className: "h-5 w-5" })}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium">
                      {config.label}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {config.description}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{count}</div>
                  <p className="text-xs text-gray-500">dokumenata</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Documents List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {isSubpage 
              ? `Dokumenti - ${page.title}` 
              : searchTerm || selectedCategory !== 'all' 
                ? 'Rezultati pretrage' 
                : 'Svi dokumenti'
            }
          </h2>
          <Badge variant="outline" className="text-sm">
            {filteredDocuments.length} dokumenata
          </Badge>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredDocuments.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredDocuments.map((doc) => {
              const config = getCategoryConfig(doc.category);
              const IconComponent = config.icon;
              
              return (
                <Card 
                  key={doc.id} 
                  className="hover:shadow-lg transition-all duration-200 group"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          {getFileIcon(doc.mimeType)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-sm font-medium line-clamp-2" title={doc.originalName}>
                            {doc.originalName}
                          </CardTitle>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <Badge className={`text-xs ${config.color}`}>
                        {React.createElement(IconComponent, { className: "mr-1 h-3 w-3" })}
                        {config.label}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Eye className="mr-1 h-3 w-3" />
                        Javno
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {doc.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {doc.description}
                      </p>
                    )}

                    <div className="space-y-2 text-xs text-gray-500">
                      <div className="flex items-center justify-between">
                        <span>Veličina:</span>
                        <span>{formatFileSize(doc.size)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Datum:</span>
                        <span className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          {formatDate(doc.createdAt)}
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={() => downloadDocument(doc)}
                      className="w-full mt-4 group-hover:bg-blue-600 transition-colors"
                      size="sm"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Preuzmi dokument
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Nema rezultata' 
                  : isSubpage 
                    ? 'Nema dokumenata u ovoj kategoriji'
                    : 'Nema dokumenata'
                }
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedCategory !== 'all'
                  ? 'Pokušajte sa drugačijim filterima ili pretragom'
                  : isSubpage
                    ? 'Dokumenti će biti prikazani kada budu učitani u sistem'
                    : 'Trenutno nema dostupnih dokumenata'
                }
              </p>
              {(searchTerm || selectedCategory !== 'all') && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="mt-2"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Očisti filtere
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Access Links - Only show on main documentation page */}
      {!isSubpage && (
        <Card>
          <CardHeader>
            <CardTitle>Brze veze</CardTitle>
            <CardDescription>
              Često traženi dokumenti i informacije
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <a 
                href="/javne-nabavke" 
                className="flex items-center p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Building className="mr-3 h-5 w-5 text-blue-600" />
                <span className="font-medium">Javne nabavke</span>
              </a>
              <a 
                href="/finansijski-izvestaji" 
                className="flex items-center p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <DollarSign className="mr-3 h-5 w-5 text-green-600" />
                <span className="font-medium">Budžet</span>
              </a>
              <a 
                href="/odluke" 
                className="flex items-center p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <FileCheck className="mr-3 h-5 w-5 text-purple-600" />
                <span className="font-medium">Odluke</span>
              </a>
              <a 
                href="/izvestaji" 
                className="flex items-center p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <BarChart3 className="mr-3 h-5 w-5 text-red-600" />
                <span className="font-medium">Izveštaji</span>
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Kontakt za dodatne informacije</CardTitle>
          <CardDescription>
            Za pitanja o dokumentima ili zahteve za dodatne informacije
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Opšte informacije</h4>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <p>{institutionData.phone}</p>
                <p>{institutionData.email}</p>
                <p>{institutionData.workingHours}</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Adresa</h4>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <p>{institutionData.address}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}