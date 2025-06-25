// app/dashboard/relof-index/recommendations/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Lightbulb,
  Clock,
  ArrowRight,
  BarChart3,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { relofIndexApi, type Recommendation } from '@/lib/api';

interface RecommendationFilters {
  priority?: string;
  limit?: number;
}

function PriorityIcon({ priority }: { priority: string }) {
  switch (priority) {
    case 'critical':
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
    case 'high':
      return <TrendingUp className="h-4 w-4 text-orange-600" />;
    case 'medium':
      return <Clock className="h-4 w-4 text-yellow-600" />;
    case 'low':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    default:
      return <Lightbulb className="h-4 w-4 text-gray-600" />;
  }
}

function RecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
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

  const getImpactColor = (impact: number) => {
    if (impact >= 20) return 'text-green-600 bg-green-50 border-green-200';
    if (impact >= 10) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (impact >= 5) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4" style={{
      borderLeftColor: getPriorityColor(recommendation.priority).replace('bg-', '#').replace('500', '')
    }}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <PriorityIcon priority={recommendation.priority} />
              <h3 className="font-semibold text-lg">{recommendation.title}</h3>
            </div>
            <p className="text-gray-600 mb-3">{recommendation.description}</p>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="text-xs">
                {getCategoryLabel(recommendation.category)}
              </Badge>
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${getPriorityColor(recommendation.priority)}`} />
                <span className="text-sm font-medium">{getPriorityLabel(recommendation.priority)}</span>
              </div>
            </div>
          </div>
          
          <div className={`px-3 py-2 rounded-lg border text-center ${getImpactColor(recommendation.estimatedImpact)}`}>
            <div className="font-bold text-lg">+{recommendation.estimatedImpact}</div>
            <div className="text-xs">бодова</div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-sm text-gray-700 flex items-center space-x-2">
            <ArrowRight className="h-4 w-4" />
            <span>Акциони кораци:</span>
          </h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <ul className="space-y-2">
              {recommendation.actionItems.map((item, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">
                    {index + 1}
                  </div>
                  <span className="text-sm text-gray-700 flex-1">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Очекивано побољшање: {recommendation.estimatedImpact} бодова
          </div>
          <Button size="sm" variant="outline">
            <Target className="mr-2 h-4 w-4" />
            Примени препоруку
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<RecommendationFilters>({});
  const [totalEstimatedImpact, setTotalEstimatedImpact] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchRecommendations = async () => {
    try {
      setIsLoading(true);
      const result = await relofIndexApi.getRecommendations(filters);
      setRecommendations(result.recommendations);
      setTotalEstimatedImpact(result.totalEstimatedImpact);
      setLastUpdated(result.lastUpdated);
    } catch (error: any) {
      console.error('Error fetching recommendations:', error);
      toast.error('Грешка при учитавању препорука: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [filters]);

  const handleFilterChange = (key: keyof RecommendationFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const getRecommendationStats = () => {
    return {
      total: recommendations.length,
      critical: recommendations.filter(r => r.priority === 'critical').length,
      high: recommendations.filter(r => r.priority === 'high').length,
      medium: recommendations.filter(r => r.priority === 'medium').length,
      low: recommendations.filter(r => r.priority === 'low').length,
    };
  };

  const stats = getRecommendationStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Препоруке за побољшање</h1>
            <p className="text-muted-foreground">Акциони планови за повећање скора</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Препоруке за побољшање</h1>
          <p className="text-muted-foreground">
            Акциони планови за повећање Релоф Индекса • Ажурирано: {lastUpdated ? new Date(lastUpdated).toLocaleString('sr-RS') : 'N/A'}
          </p>
        </div>
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Потенцијал за побољшање</h2>
              <p className="text-gray-600">
                Примена свих препорука може донети до {totalEstimatedImpact} додатних бодова
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">+{totalEstimatedImpact}</div>
              <div className="text-sm text-gray-500">максимални добитак</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Укупно препорука</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Критично</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-600">Високо</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.high}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">Средње</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.medium}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Ниско</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.low}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Филтери</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
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
              <label className="text-sm font-medium">Максимални број</label>
              <Select value={filters.limit?.toString() || 'all'} onValueChange={(value) => handleFilterChange('limit', value === 'all' ? 'all' : parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Све препоруке" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Све препоруке</SelectItem>
                  <SelectItem value="5">Првих 5</SelectItem>
                  <SelectItem value="10">Првих 10</SelectItem>
                  <SelectItem value="20">Првих 20</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Очисти филтере
              </Button>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-500">
              Приказано {recommendations.length} препорука
            </span>
            <span className="text-sm text-blue-600 font-medium">
              Укупан потенцијал: +{totalEstimatedImpact} бодова
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendations.length > 0 ? (
          recommendations.map((recommendation, index) => (
            <RecommendationCard key={index} recommendation={recommendation} />
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Target className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Нема препорука
              </h3>
              <p className="text-gray-500 mb-4">
                {filters.priority || filters.limit 
                  ? 'Нема препорука које одговарају постављеним филтерима'
                  : 'Тренутно нема активних препорука за побољшање'
                }
              </p>
              {(filters.priority || filters.limit) && (
                <Button variant="outline" onClick={clearFilters}>
                  Очисти филтере
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Action Footer */}
      {recommendations.length > 0 && (
        <Card className="bg-gray-50 dark:bg-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-2">Следећи кораци</h3>
                <p className="text-sm text-gray-600">
                  Приоритизујте критичне и високе препоруке за најбржи утицај на скор
                </p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Извези извештај
                </Button>
                <Button>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Означи као прегледано
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}