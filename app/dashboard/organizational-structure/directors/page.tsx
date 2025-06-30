// app/dashboard/organizational-structure/directors/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  FileText,
  CheckCircle,
  X,
  Crown,
  Users,
  Building,
  Eye,
  EyeOff,
  Star,
  Clock,
  Download,
  Upload
} from 'lucide-react';
import { directorsApi } from '@/lib/api';
import { Director, DirectorStatistics, DirectorDocument } from '@/lib/types';
import { toast } from 'sonner';
import { DirectorForm } from '@/components/dashboard/director-form';
import { DirectorDocuments } from '@/components/dashboard/director-documents';
import { useTheme } from 'next-themes';
import { OrgStructureNav } from '@/components/dashboard/org-structure-nav';

export default function DirectorsPage() {
  const [directors, setDirectors] = useState<Director[]>([]);
  const [statistics, setStatistics] = useState<DirectorStatistics | null>(null);
  const [currentDirector, setCurrentDirector] = useState<Director | null>(null);
  const [selectedDirector, setSelectedDirector] = useState<Director | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [directorToDelete, setDirectorToDelete] = useState<Director | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const { theme } = useTheme();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [allDirectors, stats, current] = await Promise.all([
        directorsApi.getAll(),
        directorsApi.getStatistics(),
        directorsApi.getCurrent()
      ]);
      
      setDirectors(allDirectors);
      setStatistics(stats);
      setCurrentDirector(current);
    } catch (error) {
      console.error('Error fetching directors data:', error);
      toast.error('Грешка при учитавању података о директорима');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDirector = () => {
    setSelectedDirector(null);
    setIsFormOpen(true);
  };

  const handleEditDirector = (director: Director) => {
    setSelectedDirector(director);
    setIsFormOpen(true);
  };

  const handleDeleteDirector = (director: Director) => {
    setDirectorToDelete(director);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!directorToDelete) return;

    try {
      await directorsApi.delete(directorToDelete.id);
      toast.success('Директор је успешно обрисан');
      setIsDeleteDialogOpen(false);
      setDirectorToDelete(null);
      await fetchData();
    } catch (error: any) {
      console.error('Error deleting director:', error);
      toast.error(error.response?.data?.message || 'Грешка при брисању директора');
    }
  };

  const handleSetAsCurrent = async (director: Director) => {
    try {
      await directorsApi.setAsCurrent(director.id);
      toast.success(`${director.fullName} је постављен као тренутни директор`);
      await fetchData();
    } catch (error: any) {
      console.error('Error setting current director:', error);
      toast.error(error.response?.data?.message || 'Грешка при постављању тренутног директора');
    }
  };

  const handleFormSubmit = async () => {
    setIsFormOpen(false);
    await fetchData();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sr-RS', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDirectorStatus = (director: Director) => {
    if (!director.isActive) return { label: 'Неактиван', color: 'bg-gray-100 text-gray-800' };
    if (director.isCurrent) return { label: 'Тренутни', color: 'bg-green-100 text-green-800' };
    if (director.terminationDate) return { label: 'Бивши', color: 'bg-blue-100 text-blue-800' };
    return { label: 'Активан', color: 'bg-yellow-100 text-yellow-800' };
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Директори</h1>
            <p className="text-muted-foreground">
              Управљање директорима институције
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <OrgStructureNav />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Директори</h1>
          <p className="text-muted-foreground">
            Управљање директорима институције и њиховим документима
          </p>
        </div>
        <Button onClick={handleCreateDirector} variant={theme === "light" ? "default" : "secondaryDefault"}>
          <Plus className="mr-2 h-4 w-4" />
          Додај директора
        </Button>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Укупно директора
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalDirectors}</div>
              <p className="text-xs text-muted-foreground">
                {statistics.hasCurrentDirector ? 'Има тренутног директора' : 'Нема тренутног директора'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Тренутни директор
              </CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statistics.currentDirector ? '1' : '0'}
              </div>
              <p className="text-xs text-muted-foreground">
                {statistics.currentDirector 
                  ? statistics.currentDirector.fullName
                  : 'Није постављен'
                }
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Укупно докумената
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalDocuments}</div>
              <p className="text-xs text-muted-foreground">
                {statistics.publicDocuments} јавних
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Јавни документи
              </CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.publicDocuments}</div>
              <p className="text-xs text-muted-foreground">
                {statistics.totalDocuments > 0 
                  ? `${Math.round((statistics.publicDocuments / statistics.totalDocuments) * 100)}% од укупних`
                  : 'Нема докумената'
                }
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Преглед</TabsTrigger>
          <TabsTrigger value="current">Тренутни директор</TabsTrigger>
          <TabsTrigger value="all">Сви директори</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Current Director Card */}
          {currentDirector ? (
            <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Crown className="h-5 w-5 text-green-600" />
                    <CardTitle className="text-green-800 dark:text-green-200">Тренутни директор</CardTitle>
                  </div>
                  <Badge className="bg-green-600 text-white">
                    <Star className="h-3 w-3 mr-1" />
                    Активан
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-green-900 dark:text-green-100">
                        {currentDirector.degree && `${currentDirector.degree} `}
                        {currentDirector.fullName}
                      </h3>
                      <p className="text-green-700 dark:text-green-300">
                        Именован: {formatDate(currentDirector.appointmentDate)}
                      </p>
                    </div>

                    <div className="space-y-2">
                      {currentDirector.phone && (
                        <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
                          <Phone className="h-4 w-4" />
                          <span>{currentDirector.phone}</span>
                        </div>
                      )}
                      {currentDirector.email && (
                        <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
                          <Mail className="h-4 w-4" />
                          <span>{currentDirector.email}</span>
                        </div>
                      )}
                      {currentDirector.office && (
                        <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
                          <MapPin className="h-4 w-4" />
                          <span>{currentDirector.office}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {currentDirector.profileImage && (
                      <div className="flex justify-center">
                        <img
                          src={directorsApi.getFileUrl(currentDirector.profileImage)}
                          alt={currentDirector.fullName}
                          className="w-32 h-32 object-cover rounded-lg border-2 border-green-200"
                        />
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditDirector(currentDirector)}
                        className="flex-1"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Уреди
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setActiveTab('current')}
                        className="flex-1"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Документи
                      </Button>
                    </div>
                  </div>
                </div>

                {currentDirector.biography && (
                  <div className="mt-6 pt-6 border-t border-green-200">
                    <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Биографија</h4>
                    <p className="text-green-700 dark:text-green-300 text-sm leading-relaxed">
                      {currentDirector.biography}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
              <CardContent className="p-8 text-center">
                <Crown className="mx-auto h-12 w-12 text-orange-400 mb-4" />
                <h3 className="text-lg font-medium text-orange-800 dark:text-orange-200 mb-2">
                  Нема постављеног тренутног директора
                </h3>
                <p className="text-orange-600 dark:text-orange-300 mb-4">
                  Додајте новог директора или поставите једног од постојећих као тренутног
                </p>
                <Button 
                  onClick={handleCreateDirector}
                  variant={theme === "light" ? "default" : "secondaryDefault"}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Додај директора
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Recent Documents */}
          {currentDirector && (
            <Card>
              <CardHeader>
                <CardTitle>Најновији документи тренутног директора</CardTitle>
                <CardDescription>
                  Последњи учитани документи
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentDirector.documents && currentDirector.documents.length > 0 ? (
                  <div className="space-y-3">
                    {currentDirector.documents.slice(0, 5).map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <div>
                            <h4 className="font-medium text-sm">{doc.title}</h4>
                            <p className="text-xs text-gray-500">
                              Учитано: {formatDate(doc.uploadedAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={doc.isPublic ? "default" : "secondary"} className="text-xs">
                            {doc.isPublic ? (
                              <>
                                <Eye className="h-3 w-3 mr-1" />
                                Јавно
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-3 w-3 mr-1" />
                                Интерно
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab('current')}
                      className="w-full"
                    >
                      Прикажи све документе
                    </Button>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    Нема учитаних докумената за тренутног директора
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Current Director Tab */}
        <TabsContent value="current" className="space-y-4">
          {currentDirector ? (
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Director Info */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Crown className="h-5 w-5 text-green-600" />
                    <span>Тренутни директор</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentDirector.profileImage && (
                    <div className="flex justify-center">
                      <img
                        src={directorsApi.getFileUrl(currentDirector.profileImage)}
                        alt={currentDirector.fullName}
                        className="w-24 h-24 object-cover rounded-lg border"
                      />
                    </div>
                  )}

                  <div className="text-center">
                    <h3 className="font-bold text-lg">
                      {currentDirector.degree && `${currentDirector.degree} `}
                      {currentDirector.fullName}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Именован: {formatDate(currentDirector.appointmentDate)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {currentDirector.phone && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{currentDirector.phone}</span>
                      </div>
                    )}
                    {currentDirector.email && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{currentDirector.email}</span>
                      </div>
                    )}
                    {currentDirector.office && (
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{currentDirector.office}</span>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditDirector(currentDirector)}
                    className="w-full"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Уреди директора
                  </Button>
                </CardContent>
              </Card>

              {/* Documents */}
              <div className="lg:col-span-2">
                <DirectorDocuments
                  director={currentDirector}
                  onDocumentsUpdate={fetchData}
                />
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Crown className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Нема тренутног директора
                </h3>
                <p className="text-gray-500 mb-4">
                  Поставите једног од директора као тренутног да бисте управљали документима
                </p>
                <Button onClick={() => setActiveTab('all')}>
                  Прегледај све директоре
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* All Directors Tab */}
        <TabsContent value="all" className="space-y-4">
          {directors.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {directors.map((director) => {
                const status = getDirectorStatus(director);
                return (
                  <Card key={director.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">
                            {director.degree && `${director.degree} `}
                            {director.fullName}
                          </CardTitle>
                          <div className="flex items-center space-x-2">
                            <Badge className={`text-xs ${status.color}`}>
                              {director.isCurrent && <Crown className="h-3 w-3 mr-1" />}
                              {status.label}
                            </Badge>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditDirector(director)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Уреди
                            </DropdownMenuItem>
                            {!director.isCurrent && director.isActive && (
                              <DropdownMenuItem onClick={() => handleSetAsCurrent(director)}>
                                <Crown className="mr-2 h-4 w-4" />
                                Постави као тренутни
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteDirector(director)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Обриши
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {director.profileImage && (
                        <div className="flex justify-center">
                          <img
                            src={directorsApi.getFileUrl(director.profileImage)}
                            alt={director.fullName}
                            className="w-16 h-16 object-cover rounded-lg border"
                          />
                        </div>
                      )}

                      <div className="space-y-2 text-sm">
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

                        {director.phone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span>{director.phone}</span>
                          </div>
                        )}

                        {director.email && (
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span className="truncate">{director.email}</span>
                          </div>
                        )}

                        {director.office && (
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span>{director.office}</span>
                          </div>
                        )}
                      </div>

                      {director.biography && (
                        <div className="pt-3 border-t">
                          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                            {director.biography}
                          </p>
                        </div>
                      )}

                      {director.documents && director.documents.length > 0 && (
                        <div className="pt-3 border-t">
                          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                            <FileText className="h-4 w-4" />
                            <span>{director.documents.length} докумената</span>
                            <span>•</span>
                            <span>
                              {director.documents.filter(d => d.isPublic).length} јавних
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Нема директора</h3>
                <p className="text-gray-500 mb-4">
                  Додајте првог директора да бисте почели
                </p>
                <Button onClick={handleCreateDirector} variant={theme === "light" ? "default" : "secondaryDefault"}>
                  <Plus className="mr-2 h-4 w-4" />
                  Додај директора
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Director Form Dialog */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsFormOpen(false)}
          />
          
          <div className="relative bg-card rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-lg font-semibold">
                  {selectedDirector ? 'Уреди директора' : 'Нови директор'}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedDirector
                    ? 'Ажурирајте информације о директору'
                    : 'Додајте новог директора институције'
                  }
                </p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
              <DirectorForm
                director={selectedDirector}
                onSubmit={handleFormSubmit}
                onCancel={() => setIsFormOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className='max-w-xl'>
          <DialogHeader>
            <DialogTitle>Потврди брисање</DialogTitle>
            <DialogDescription>
              Да ли сте сигурни да желите да обришете директора{' '}
              <strong>{directorToDelete?.fullName}</strong>? Ова акција ће обрисати и све документе директора и не може се поништити.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Откажи
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
            >
              Обриши
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}