// templates/directors/directors-template.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Crown,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Download,
  FileText,
  Eye,
  EyeOff,
  Building,
  Clock,
  ChevronRight,
  Users,
  Star,
  History
} from 'lucide-react';
import { Page, Post } from '@/lib/types';
import { PostsSection } from '@/components/frontend/posts-section';
import { directorsApi, Director, DirectorDocument, DocumentType } from '@/lib/api';

interface DirectorsTemplateProps {
  page: Page;
  posts: Post[];
  institutionData?: any;
  settings?: any;
}

export function DirectorsTemplate({ 
  page, 
  posts 
}: DirectorsTemplateProps) {
  const [currentDirector, setCurrentDirector] = useState<Director | null>(null);
  const [allDirectors, setAllDirectors] = useState<Director[]>([]);
  const [currentDocuments, setCurrentDocuments] = useState<DirectorDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'current' | 'all' | 'documents'>('current');

  useEffect(() => {
    fetchDirectors();
  }, []);

  useEffect(() => {
    if (currentDirector) {
      fetchCurrentDirectorDocuments();
    }
  }, [currentDirector]);

  const fetchDirectors = async () => {
    try {
      setIsLoading(true);
      const [current, all] = await Promise.all([
        directorsApi.getCurrent(),
        directorsApi.getAll()
      ]);
      
      setCurrentDirector(current);
      setAllDirectors(all);
    } catch (error) {
      console.error('Error fetching directors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurrentDirectorDocuments = async () => {
    if (!currentDirector) return;
    
    try {
      const documents = await directorsApi.getPublicDocuments(currentDirector.id);
      setCurrentDocuments(documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sr-RS', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDocumentTypeLabel = (type: DocumentType): string => {
    const labels = {
      [DocumentType.APPOINTMENT]: 'Решење о именовању',
      [DocumentType.DECREE]: 'Указ',
      [DocumentType.DECISION]: 'Одлука',
      [DocumentType.CONTRACT]: 'Уговор',
      [DocumentType.TERMINATION]: 'Решење о разрешењу',
      [DocumentType.CV]: 'Биографија/CV',
      [DocumentType.DIPLOMA]: 'Диплома',
      [DocumentType.CERTIFICATE]: 'Сертификат',
      [DocumentType.OTHER]: 'Остало'
    };
    return labels[type] || type;
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />;
    if (mimeType.includes('word')) return <FileText className="h-4 w-4 text-blue-500" />;
    if (mimeType.includes('image')) return <FileText className="h-4 w-4 text-green-500" />;
    return <FileText className="h-4 w-4 text-gray-500" />;
  };

  const handleDownload = (document: DirectorDocument) => {
    const url = directorsApi.getFileUrl(document.filename);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = document.originalName;
    link.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Директори институције</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Информације о руководству институције и релевантни документи
        </p>
      </div>

      {/* CMS Content */}
      {page?.content && (
        <div className="prose prose-lg max-w-none">
          <div dangerouslySetInnerHTML={{ __html: page.content }} />
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap justify-center gap-2 border-b">
        <Button
          variant={selectedTab === 'current' ? 'default' : 'ghost'}
          onClick={() => setSelectedTab('current')}
          className="flex items-center space-x-2"
        >
          <Crown className="h-4 w-4" />
          <span>Тренутни директор</span>
        </Button>
        <Button
          variant={selectedTab === 'documents' ? 'default' : 'ghost'}
          onClick={() => setSelectedTab('documents')}
          className="flex items-center space-x-2"
        >
          <FileText className="h-4 w-4" />
          <span>Документи</span>
        </Button>
        <Button
          variant={selectedTab === 'all' ? 'default' : 'ghost'}
          onClick={() => setSelectedTab('all')}
          className="flex items-center space-x-2"
        >
          <History className="h-4 w-4" />
          <span>Сви директори</span>
        </Button>
      </div>

      {/* Current Director Tab */}
      {selectedTab === 'current' && (
        <div className="space-y-6">
          {currentDirector ? (
            <Card className="border-green-200 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-3 gap-8">
                  {/* Profile Image */}
                  <div className="flex flex-col items-center text-center space-y-4">
                    {currentDirector.profileImage ? (
                      <div className="relative">
                        <img
                          src={directorsApi.getFileUrl(currentDirector.profileImage)}
                          alt={currentDirector.fullName}
                          className="w-40 h-40 object-cover rounded-xl shadow-lg border-4 border-white"
                        />
                        <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2">
                          <Crown className="h-5 w-5 text-yellow-800" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-40 h-40 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl shadow-lg border-4 border-white flex items-center justify-center relative">
                        <User className="h-16 w-16 text-gray-500" />
                        <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2">
                          <Crown className="h-5 w-5 text-yellow-800" />
                        </div>
                      </div>
                    )}
                    
                    <Badge className="bg-green-600 text-white px-4 py-2">
                      <Star className="h-4 w-4 mr-1" />
                      Тренутни директор
                    </Badge>
                  </div>

                  {/* Basic Info */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {currentDirector.degree && `${currentDirector.degree} `}
                        {currentDirector.fullName}
                      </h3>
                      <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
                        <Calendar className="h-4 w-4" />
                        <span>Именован: {formatDate(currentDirector.appointmentDate)}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {currentDirector.phone && (
                        <div className="flex items-center space-x-3">
                          <Phone className="h-5 w-5 text-blue-600" />
                          <a 
                            href={`tel:${currentDirector.phone}`}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {currentDirector.phone}
                          </a>
                        </div>
                      )}
                      {currentDirector.email && (
                        <div className="flex items-center space-x-3">
                          <Mail className="h-5 w-5 text-blue-600" />
                          <a 
                            href={`mailto:${currentDirector.email}`}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {currentDirector.email}
                          </a>
                        </div>
                      )}
                      {currentDirector.office && (
                        <div className="flex items-center space-x-3">
                          <MapPin className="h-5 w-5 text-gray-600" />
                          <span className="text-gray-700 dark:text-gray-300">{currentDirector.office}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Documents Access */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">Брзи приступ</h4>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        onClick={() => setSelectedTab('documents')}
                        className="w-full justify-between"
                      >
                        <span className="flex items-center">
                          <FileText className="h-4 w-4 mr-2" />
                          Документи
                        </span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      
                      {currentDocuments.length > 0 && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {currentDocuments.length} јавних докумената
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Biography */}
                {currentDirector.biography && (
                  <div className="mt-8 pt-8 border-t border-green-200">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Биографија</h4>
                    <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300">
                      <p className="leading-relaxed">{currentDirector.biography}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Crown className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Тренутно нема постављеног директора
                </h3>
                <p className="text-gray-500">
                  Информације о директору ће бити доступне када буде именован.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Documents Tab */}
      {selectedTab === 'documents' && currentDirector && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold">Јавни документи</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Документи директора {currentDirector.fullName} доступни јавности
                  </p>
                </div>
                <Badge variant="outline" className="px-3 py-1">
                  {currentDocuments.length} докумената
                </Badge>
              </div>

              {currentDocuments.length > 0 ? (
                <div className="grid gap-4">
                  {currentDocuments.map((document) => (
                    <Card key={document.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <div className="flex-shrink-0 mt-1">
                              {getFileIcon(document.mimeType)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                  {document.title}
                                </h4>
                                <Badge variant="outline" className="text-xs">
                                  {getDocumentTypeLabel(document.type)}
                                </Badge>
                                <Badge className="text-xs bg-green-600">
                                  <Eye className="h-3 w-3 mr-1" />
                                  Јавно
                                </Badge>
                              </div>
                              
                              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                                {document.description && (
                                  <p>{document.description}</p>
                                )}
                                <div className="flex items-center space-x-4">
                                  <span>Величина: {formatFileSize(document.size)}</span>
                                  {document.documentDate && (
                                    <span>Датум: {formatDate(document.documentDate)}</span>
                                  )}
                                  <span>Учитано: {formatDate(document.uploadedAt)}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(document)}
                            className="ml-4"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Преузми
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Нема јавних докумената
                  </h3>
                  <p className="text-gray-500">
                    Тренутно нема докумената доступних јавности.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* All Directors Tab */}
      {selectedTab === 'all' && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Историја директора</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Преглед свих директора институције
                </p>
              </div>

              {allDirectors.length > 0 ? (
                <div className="space-y-4">
                  {allDirectors
                    .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime())
                    .map((director) => (
                      <Card key={director.id} className={`transition-shadow ${
                        director.isCurrent ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : 'hover:shadow-md'
                      }`}>
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            {/* Profile Image */}
                            <div className="flex-shrink-0">
                              {director.profileImage ? (
                                <img
                                  src={directorsApi.getFileUrl(director.profileImage)}
                                  alt={director.fullName}
                                  className="w-16 h-16 object-cover rounded-lg border"
                                />
                              ) : (
                                <div className="w-16 h-16 bg-gray-200 rounded-lg border flex items-center justify-center">
                                  <User className="h-8 w-8 text-gray-500" />
                                </div>
                              )}
                            </div>

                            {/* Director Info */}
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="text-lg font-semibold">
                                  {director.degree && `${director.degree} `}
                                  {director.fullName}
                                </h4>
                                {director.isCurrent && (
                                  <Badge className="bg-green-600 text-white">
                                    <Crown className="h-3 w-3 mr-1" />
                                    Тренутни
                                  </Badge>
                                )}
                                {!director.isActive && (
                                  <Badge variant="secondary">
                                    Неактиван
                                  </Badge>
                                )}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <Calendar className="h-4 w-4 text-gray-500" />
                                    <span>Именован: {formatDate(director.appointmentDate)}</span>
                                  </div>
                                  {director.terminationDate && (
                                    <div className="flex items-center space-x-2">
                                      <Clock className="h-4 w-4 text-gray-500" />
                                      <span>Разрешен: {formatDate(director.terminationDate)}</span>
                                    </div>
                                  )}
                                </div>

                                <div className="space-y-1">
                                  {director.phone && (
                                    <div className="flex items-center space-x-2">
                                      <Phone className="h-4 w-4 text-gray-500" />
                                      <span>{director.phone}</span>
                                    </div>
                                  )}
                                  {director.email && (
                                    <div className="flex items-center space-x-2">
                                      <Mail className="h-4 w-4 text-gray-500" />
                                      <span>{director.email}</span>
                                    </div>
                                  )}
                                  {director.office && (
                                    <div className="flex items-center space-x-2">
                                      <MapPin className="h-4 w-4 text-gray-500" />
                                      <span>{director.office}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {director.biography && (
                                <div className="mt-4 pt-4 border-t">
                                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                                    {director.biography}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Нема података о директорима
                  </h3>
                  <p className="text-gray-500">
                    Информације о директорима још увек нису унете у систем.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Statistics */}
      {allDirectors.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Статистике</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{allDirectors.length}</div>
                <div className="text-sm text-gray-600">Укупно директора</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {currentDirector ? '1' : '0'}
                </div>
                <div className="text-sm text-gray-600">Тренутни</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {allDirectors.filter(d => d.isActive).length}
                </div>
                <div className="text-sm text-gray-600">Активни</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {currentDocuments.length}
                </div>
                <div className="text-sm text-gray-600">Јавни документи</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts Section */}
      <PostsSection posts={posts} />
    </div>
  );
}