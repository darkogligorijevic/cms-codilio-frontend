// app/dashboard/relof-index/requirements/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  FileText,
  Filter,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Calendar,
  ArrowLeft,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { relofIndexApi, type RequirementResult } from '@/lib/api';

interface RequirementFilters {
  category?: string;
  status?: string;
  priority?: string;
  search?: string;
}

function RequirementStatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'fulfilled':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'partial':
      return <Clock className="h-4 w-4 text-yellow-600" />;
    case 'missing':
      return <XCircle className="h-4 w-4 text-red-600" />;
    case 'outdated':
      return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    default:
      return <AlertCircle className="h-4 w-4 text-gray-600" />;
  }
}

function RequirementCard({ requirement }: { requirement: RequirementResult }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fulfilled': return 'bg-green-100 text-green-800 border-green-200';
      case 'partial': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'missing': return 'bg-red-100 text-red-800 border-red-200';
      case 'outdated': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'fulfilled': return 'Испуњено';
      case 'partial': return 'Делимично';
      case 'missing': return 'Недостаје';
      case 'outdated': return 'Застарело';
      default: return status;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'critical': return 'Критично';
      case 'high': return 'Високо';
      case 'medium': return 'Средње';
      case 'low': return 'Ниско';
      default: return priority;
    }
  };

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      'basic_info': 'Основни подаци',
      'contact_info': 'Контакт информације',
      'organizational_structure': 'Организациона структура',
      'services': 'Услуге',
      'documents': 'Јавни документи',
      'gallery': 'Галерија',
      'posts_activity': 'Активност објављивања',
      'social_media': 'Друштвене мреже'
    };
    return categories[category] || category;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <RequirementStatusIcon status={requirement.status} />
              <h3 className="font-semibold text-lg">{requirement.name}</h3>
            </div>
            <p className="text-gray-600 mb-3">{requirement.description}</p>
            <Badge variant="outline" className="text-xs mb-2">
              {getCategoryLabel(requirement.category)}
            </Badge>
          </div>
          
          <div className="flex flex-col items-end space-y-2 ml-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getPriorityColor(requirement.priority)}`} />
              <span className="text-sm font-medium">{getPriorityLabel(requirement.priority)}</span>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">{requirement.points}</div>
              <div className="text-xs text-gray-500">бодова</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <Badge className={`${getStatusColor(requirement.status)}`}>
            {getStatusLabel(requirement.status)}
          </Badge>
          
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>
              Проверено: {new Date(requirement.lastChecked).toLocaleDateString('sr-RS')}
            </span>
          </div>
        </div>

        {requirement.daysOverdue && requirement.daysOverdue > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-700 font-medium">
                Застарело за {requirement.daysOverdue} дана
              </span>
            </div>
          </div>
        )}

        {requirement.specificIssues && requirement.specificIssues.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center space-x-2">
              <AlertCircle className="h-4 w-4" />
              <span>Препознати проблеми:</span>
            </h4>
            <ul className="space-y-1">
              {requirement.specificIssues.map((issue, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                  <span className="text-red-500 mt-1">•</span>
                  <span>{issue}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function RequirementsPage() {
  const [requirements, setRequirements] = useState<Record<string, RequirementResult[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<RequirementFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [totalRequirements, setTotalRequirements] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchRequirements = async () => {
    try {
      setIsLoading(true);
      const result = await relofIndexApi.getRequirements(filters);
      setRequirements(result.requirements);
      setTotalRequirements(result.total);
      setLastUpdated(result.lastUpdated);
    } catch (error: any) {
      console.error('Error fetching requirements:', error);
      toast.error('Грешка при учитавању захтева: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, [filters]);

  const handleFilterChange = (key: keyof RequirementFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value
    }));
  };

  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm || undefined
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  // Filter requirements locally by search term if not using API search
  const filteredRequirements = Object.entries(requirements).reduce((acc, [category, reqs]) => {
    if (!searchTerm) {
      acc[category] = reqs;
    } else {
      const filtered = reqs.filter(req => 
        req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (filtered.length > 0) {
        acc[category] = filtered;
      }
    }
    return acc;
  }, {} as Record<string, RequirementResult[]>);

  const getCategoryStats = () => {
    const allReqs = Object.values(requirements).flat();
    return {
      total: allReqs.length,
      fulfilled: allReqs.filter(r => r.status === 'fulfilled').length,
      partial: allReqs.filter(r => r.status === 'partial').length,
      missing: allReqs.filter(r => r.status === 'missing').length,
      outdated: allReqs.filter(r => r.status === 'outdated').length,
      critical: allReqs.filter(r => r.priority === 'critical' && r.status !== 'fulfilled').length
    };
  };

  const stats = getCategoryStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Захтеви за транспарентност</h1>
            <p className="text-muted-foreground">Детаљан преглед свих захтева</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Link href="/dashboard/relof-index">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Назад на преглед
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Захтеви за транспарентност</h1>
          <p className="text-muted-foreground">
            Детаљан преглед свих захтева • Ажурирано: {lastUpdated ? new Date(lastUpdated).toLocaleString('sr-RS') : 'N/A'}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Укупно</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Испуњено</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.fulfilled}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">Делимично</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.partial}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Недостаје</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.missing}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Застарело</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.outdated}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Критично</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800">{stats.critical}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Филтери</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Категорија</label>
              <Select value={filters.category || 'all'} onValueChange={(value) => handleFilterChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Све категорије" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Све категорије</SelectItem>
                  <SelectItem value="basic_info">Основни подаци</SelectItem>
                  <SelectItem value="contact_info">Контакт информације</SelectItem>
                  <SelectItem value="organizational_structure">Организациона структура</SelectItem>
                  <SelectItem value="services">Услуге</SelectItem>
                  <SelectItem value="documents">Јавни документи</SelectItem>
                  <SelectItem value="gallery">Галерија</SelectItem>
                  <SelectItem value="posts_activity">Активност објављивања</SelectItem>
                  <SelectItem value="social_media">Друштвене мреже</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Статус</label>
              <Select value={filters.status || 'all'} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Сви статуси" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Сви статуси</SelectItem>
                  <SelectItem value="fulfilled">Испуњено</SelectItem>
                  <SelectItem value="partial">Делимично</SelectItem>
                  <SelectItem value="missing">Недостаје</SelectItem>
                  <SelectItem value="outdated">Застарело</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Приоритет</label>
              <Select value={filters.priority || 'all'} onValueChange={(value) => handleFilterChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Сви приоритети" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Сви приоритети</SelectItem>
                  <SelectItem value="critical">Критично</SelectItem>
                  <SelectItem value="high">Високо</SelectItem>
                  <SelectItem value="medium">Средње</SelectItem>
                  <SelectItem value="low">Ниско</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Претрага</label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Претражи захтеве..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} size="sm">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-500">
              Приказано {Object.values(filteredRequirements).flat().length} од {totalRequirements} захтева
            </span>
            <Button variant="outline" onClick={clearFilters} size="sm">
              Очисти филтере
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Requirements by Category */}
      <div className="space-y-6">
        {Object.keys(filteredRequirements).length > 0 ? (
          Object.entries(filteredRequirements).map(([category, categoryRequirements]) => {
            const getCategoryLabel = (category: string) => {
              const categories: Record<string, string> = {
                'basic_info': 'Основни подаци',
                'contact_info': 'Контакт информације',
                'organizational_structure': 'Организациона структура',
                'services': 'Услуге',
                'documents': 'Јавни документи',
                'gallery': 'Галерија',
                'posts_activity': 'Активност објављивања',
                'social_media': 'Друштвене мреже'
              };
              return categories[category] || category;
            };

            return (
              <div key={category} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">{getCategoryLabel(category)}</h2>
                  <Badge variant="outline">
                    {categoryRequirements.length} захтева
                  </Badge>
                </div>
                
                <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                  {categoryRequirements.map((requirement) => (
                    <RequirementCard key={requirement.id} requirement={requirement} />
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Нема резултата
              </h3>
              <p className="text-gray-500 mb-4">
                Нема захтева који одговарају постављеним филтерима
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Очисти филтере
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}