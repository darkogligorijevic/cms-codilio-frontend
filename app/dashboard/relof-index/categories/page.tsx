// app/dashboard/relof-index/categories/page.tsx - Enhanced version with category details modal
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  ArrowLeft,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Clock,
  XCircle,
  Eye,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Loader2,
  FileText,
  Users,
  Building2,
  Briefcase,
  Image,
  Activity,
  Share2,
  X,
  Info,
  ChevronRight,
  Calendar,
  Hash,
  Star,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { relofIndexApi, type CategoryBreakdown } from '@/lib/api';

interface CategoryIconProps {
  category: string;
  className?: string;
}

function CategoryIcon({ category, className = "h-5 w-5" }: CategoryIconProps) {
  switch (category) {
    case 'basic_info':
      return <FileText className={className} />;
    case 'contact_info':
      return <Users className={className} />;
    case 'organizational_structure':
      return <Building2 className={className} />;
    case 'services':
      return <Briefcase className={className} />;
    case 'documents':
      return <FileText className={className} />;
    case 'gallery':
      return <Image className={className} />;
    case 'posts_activity':
      return <Activity className={className} />;
    case 'social_media':
      return <Share2 className={className} />;
    default:
      return <BarChart3 className={className} />;
  }
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
      return <AlertTriangle className="h-4 w-4 text-gray-600" />;
  }
}

interface CategoryDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryData: {
    category: string;
    displayName: string;
    scores: {
      score: number;
      maxScore: number;
      percentage: number;
    };
    requirements: {
      total: number;
      fulfilled: number;
      partial: number;
      missing: number;
    };
    topIssues: Array<{
      name: string;
      status: string;
      priority: string;
      issues: string[];
    }>;
  } | null;
}

function CategoryDetailsModal({ isOpen, onClose, categoryData }: CategoryDetailsModalProps) {
  if (!categoryData) return null;

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    if (percentage >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
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

  const completionRate = (categoryData.requirements.fulfilled / categoryData.requirements.total) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <CategoryIcon category={categoryData.category} className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{categoryData.displayName}</h3>
              <p className="text-sm text-gray-500 font-normal">
                Детаљан преглед категорије
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {/* Score Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <span>Укупан скор</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getScoreColor(categoryData.scores.percentage)}`}>
                      {categoryData.scores.percentage.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-500">
                      {categoryData.scores.score} од {categoryData.scores.maxScore} бодова
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Напредак</span>
                      <span>{categoryData.scores.percentage.toFixed(1)}%</span>
                    </div>
                    <Progress 
                      value={categoryData.scores.percentage} 
                      className="h-3"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Hash className="h-5 w-5 text-green-600" />
                  <span>Завршеност</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600">
                      {completionRate.toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-500">
                      {categoryData.requirements.fulfilled} од {categoryData.requirements.total} захтева
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Испуњеност</span>
                      <span>{completionRate.toFixed(1)}%</span>
                    </div>
                    <Progress 
                      value={completionRate} 
                      className="h-3"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Requirements Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Статистика захтева</span>
              </CardTitle>
              <CardDescription>
                Детаљан преглед статуса свих захтева у категорији
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {categoryData.requirements.fulfilled}
                  </div>
                  <div className="text-sm text-green-600 mb-2">Испуњено</div>
                  <div className="text-xs text-gray-500">
                    {((categoryData.requirements.fulfilled / categoryData.requirements.total) * 100).toFixed(1)}%
                  </div>
                </div>
                
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600 mb-1">
                    {categoryData.requirements.partial}
                  </div>
                  <div className="text-sm text-yellow-600 mb-2">Делимично</div>
                  <div className="text-xs text-gray-500">
                    {((categoryData.requirements.partial / categoryData.requirements.total) * 100).toFixed(1)}%
                  </div>
                </div>
                
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-red-600 mb-1">
                    {categoryData.requirements.missing}
                  </div>
                  <div className="text-sm text-red-600 mb-2">Недостаје</div>
                  <div className="text-xs text-gray-500">
                    {((categoryData.requirements.missing / categoryData.requirements.total) * 100).toFixed(1)}%
                  </div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600 mb-1">
                    {categoryData.requirements.total}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">Укупно</div>
                  <div className="text-xs text-gray-500">
                    100%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Issues and Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <span>Проблеми и препоруке</span>
                {categoryData.topIssues.length > 0 && (
                  <Badge variant="outline" className="ml-auto">
                    {categoryData.topIssues.length} активних
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Кључни проблеми који захтевају пажњу у овој категорији
              </CardDescription>
            </CardHeader>
            <CardContent>
              {categoryData.topIssues.length > 0 ? (
                <div className="space-y-4">
                  {categoryData.topIssues.map((issue, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <RequirementStatusIcon status={issue.status} />
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                              {issue.name}
                            </h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge 
                                variant="outline" 
                                className="text-xs"
                                style={{ 
                                  backgroundColor: `${getPriorityColor(issue.priority)}20`,
                                  borderColor: getPriorityColor(issue.priority).replace('bg-', ''),
                                  color: getPriorityColor(issue.priority).replace('bg-', '').replace('500', '700')
                                }}
                              >
                                <div className={`w-2 h-2 rounded-full ${getPriorityColor(issue.priority)} mr-1`} />
                                {getPriorityLabel(issue.priority)}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {getStatusLabel(issue.status)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {issue.issues && issue.issues.length > 0 && (
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3">
                          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Препознати проблеми:
                          </h5>
                          <ul className="space-y-1">
                            {issue.issues.map((problemDescription, problemIndex) => (
                              <li key={problemIndex} className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                <ChevronRight className="h-4 w-4 mt-0.5 text-gray-400 flex-shrink-0" />
                                <span>{problemDescription}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Нема активних проблема
                  </h3>
                  <p className="text-gray-500">
                    Сви захтеви у овој категорији су у реду
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Recommendations */}
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-800 dark:text-blue-200">
                <Zap className="h-5 w-5" />
                <span>Препоруке за побољшање</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categoryData.requirements.missing > 0 && (
                  <div className="flex items-start space-x-3">
                    <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mt-0.5">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-800 dark:text-blue-200">
                        Приоритет: Недостајући захтеви
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Фокусирајте се на {categoryData.requirements.missing} недостајућих захтева за највећи утицај на скор
                      </p>
                    </div>
                  </div>
                )}
                
                {categoryData.requirements.partial > 0 && (
                  <div className="flex items-start space-x-3">
                    <div className="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mt-0.5">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-800 dark:text-blue-200">
                        Завршите делимично испуњене
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Постоји {categoryData.requirements.partial} делимично испуњених захтева које можете лако довршити
                      </p>
                    </div>
                  </div>
                )}
                
                {categoryData.topIssues.filter(i => i.priority === 'critical').length > 0 && (
                  <div className="flex items-start space-x-3">
                    <div className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mt-0.5">
                      !
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-800 dark:text-blue-200">
                        Критични проблеми
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Решите критичне проблеме првенствено јер имају највећи утицај на коначни скор
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start space-x-3">
                  <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-800 dark:text-blue-200">
                      Редовно ажурирање
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Редовно ажурирајте информације да избегнете да захтеви застаре
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            <X className="mr-2 h-4 w-4" />
            Затвори
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface CategoryCardProps {
  categoryData: {
    category: string;
    displayName: string;
    scores: {
      score: number;
      maxScore: number;
      percentage: number;
    };
    requirements: {
      total: number;
      fulfilled: number;
      partial: number;
      missing: number;
    };
    topIssues: Array<{
      name: string;
      status: string;
      priority: string;
      issues: string[];
    }>;
  };
  onViewDetails: (categoryData: any) => void;
}

function CategoryCard({ categoryData, onViewDetails }: CategoryCardProps) {
  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (percentage >= 40) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
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

  const completionRate = (categoryData.requirements.fulfilled / categoryData.requirements.total) * 100;

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <CategoryIcon category={categoryData.category} className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{categoryData.displayName}</h3>
              <p className="text-sm text-gray-500">
                {categoryData.requirements.total} захтева
              </p>
            </div>
          </div>
          
          <div className={`px-3 py-2 rounded-lg border text-center ${getScoreColor(categoryData.scores.percentage)}`}>
            <div className="font-bold text-lg">{categoryData.scores.percentage.toFixed(1)}%</div>
            <div className="text-xs">скор</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Напредак</span>
            <span>{categoryData.scores.score} од {categoryData.scores.maxScore} бодова</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(categoryData.scores.percentage)}`}
              style={{ width: `${categoryData.scores.percentage}%` }}
            />
          </div>
        </div>

        {/* Requirements Stats */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
            <div className="text-lg font-bold text-green-600">{categoryData.requirements.fulfilled}</div>
            <div className="text-xs text-green-600">Испуњено</div>
          </div>
          <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
            <div className="text-lg font-bold text-yellow-600">{categoryData.requirements.partial}</div>
            <div className="text-xs text-yellow-600">Делимично</div>
          </div>
          <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
            <div className="text-lg font-bold text-red-600">{categoryData.requirements.missing}</div>
            <div className="text-xs text-red-600">Недостаје</div>
          </div>
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
            <div className="text-lg font-bold text-gray-600">{completionRate.toFixed(0)}%</div>
            <div className="text-xs text-gray-600">Завршено</div>
          </div>
        </div>

        {/* Top Issues */}
        {categoryData.topIssues.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="font-medium text-sm text-gray-700 mb-3 flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Кључни проблеми:</span>
            </h4>
            <div className="space-y-2">
              {categoryData.topIssues.slice(0, 3).map((issue, index) => (
                <div key={index} className="flex items-start space-x-3 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <RequirementStatusIcon status={issue.status} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium truncate">{issue.name}</span>
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(issue.priority)}`} />
                        <span className="text-xs text-gray-500">{getPriorityLabel(issue.priority)}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {getStatusLabel(issue.status)}
                    </Badge>
                    {issue.issues && issue.issues.length > 0 && (
                      <div className="mt-1">
                        <p className="text-xs text-gray-600">
                          {issue.issues[0]}
                          {issue.issues.length > 1 && ` (+${issue.issues.length - 1} више)`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-4 pt-4 border-t">
          <Button 
            variant="outline" 
            className="w-full" 
            size="sm"
            onClick={() => onViewDetails(categoryData)}
          >
            <Eye className="mr-2 h-4 w-4" />
            Прегледај детаље
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CategoriesPage() {
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const fetchCategoryBreakdown = async () => {
    try {
      setIsLoading(true);
      const result = await relofIndexApi.getCategoryBreakdown();
      setCategoryBreakdown(result);
    } catch (error: any) {
      console.error('Error fetching category breakdown:', error);
      toast.error('Грешка при учитавању категорија: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchCategoryBreakdown();
    setIsRefreshing(false);
    toast.success('Подаци о категоријама су освежени');
  };

  const handleViewDetails = (categoryData: any) => {
    setSelectedCategory(categoryData);
    setIsDetailsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedCategory(null);
  };

  useEffect(() => {
    fetchCategoryBreakdown();
  }, []);

  const getOverallStats = () => {
    if (!categoryBreakdown) return null;

    const totalRequirements = categoryBreakdown.categories.reduce((sum, cat) => sum + cat.requirements.total, 0);
    const totalFulfilled = categoryBreakdown.categories.reduce((sum, cat) => sum + cat.requirements.fulfilled, 0);
    const totalPartial = categoryBreakdown.categories.reduce((sum, cat) => sum + cat.requirements.partial, 0);
    const totalMissing = categoryBreakdown.categories.reduce((sum, cat) => sum + cat.requirements.missing, 0);
    
    return {
      totalRequirements,
      totalFulfilled,
      totalPartial,
      totalMissing,
      completionRate: totalRequirements > 0 ? (totalFulfilled / totalRequirements) * 100 : 0
    };
  };

  const stats = getOverallStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Анализа по категоријама</h1>
            <p className="text-muted-foreground">Детаљан преглед скора по областима</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-2 bg-gray-200 rounded w-full mb-4"></div>
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="h-12 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!categoryBreakdown) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/dashboard/relof-index">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Назад на преглед
              </Button>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight mt-2">Анализа по категоријама</h1>
            <p className="text-muted-foreground">Детаљан преглед скора по областима</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <BarChart3 className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Нема доступних података
            </h3>
            <p className="text-gray-500 mb-4">
              Подаци о категоријама нису доступни
            </p>
            <Button onClick={handleRefresh} disabled={isRefreshing}>
              {isRefreshing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Освежи податке
            </Button>
          </CardContent>
        </Card>
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
          <h1 className="text-3xl font-bold tracking-tight">Анализа по категоријама</h1>
          <p className="text-muted-foreground">
            Детаљан преглед скора по областима • Ажурирано: {new Date(categoryBreakdown.lastUpdated).toLocaleString('sr-RS')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline" size="sm">
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Overall Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Укупан преглед</h2>
              <div className="flex items-center space-x-4">
                <div className="text-4xl font-bold text-blue-600">
                  {Number(categoryBreakdown.totalScore).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">
                  од максималних 100%
                </div>
              </div>
            </div>
            {stats && (
              <div className="text-right space-y-2">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{stats.totalFulfilled}</div>
                    <div className="text-xs text-gray-500">Испуњено</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{stats.totalMissing}</div>
                    <div className="text-xs text-gray-500">Недостаје</div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {stats.completionRate.toFixed(1)}% завршеност
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Overall Stats */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Укупно категорија</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categoryBreakdown.categories.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Укупно захтева</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRequirements}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Испуњено</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.totalFulfilled}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600">Делимично</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.totalPartial}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">Недостаје</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.totalMissing}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categoryBreakdown.categories
          .sort((a, b) => b.scores.percentage - a.scores.percentage) // Sort by score descending
          .map((category) => (
            <CategoryCard 
              key={category.category} 
              categoryData={category} 
              onViewDetails={handleViewDetails}
            />
          ))}
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Увиди у перформансе по категоријама</span>
          </CardTitle>
          <CardDescription>
            Анализа најбољих и најгорих категорија
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Best Performing Categories */}
            <div className="space-y-3">
              <h4 className="font-medium text-green-600">Најбоље категорије:</h4>
              <div className="space-y-2">
                {categoryBreakdown.categories
                  .filter(cat => cat.scores.percentage >= 80)
                  .sort((a, b) => b.scores.percentage - a.scores.percentage)
                  .slice(0, 3)
                  .map((category) => (
                    <div key={category.category} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded">
                      <div className="flex items-center space-x-2">
                        <CategoryIcon category={category.category} className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">{category.displayName}</span>
                      </div>
                      <span className="text-sm font-bold text-green-600">{category.scores.percentage.toFixed(1)}%</span>
                    </div>
                  ))}
                {categoryBreakdown.categories.filter(cat => cat.scores.percentage >= 80).length === 0 && (
                  <p className="text-sm text-gray-500">Нема категорија са скором изнад 80%</p>
                )}
              </div>
            </div>

            {/* Worst Performing Categories */}
            <div className="space-y-3">
              <h4 className="font-medium text-red-600">Категорије за побољшање:</h4>
              <div className="space-y-2">
                {categoryBreakdown.categories
                  .filter(cat => cat.scores.percentage < 60)
                  .sort((a, b) => a.scores.percentage - b.scores.percentage)
                  .slice(0, 3)
                  .map((category) => (
                    <div key={category.category} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded">
                      <div className="flex items-center space-x-2">
                        <CategoryIcon category={category.category} className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium">{category.displayName}</span>
                      </div>
                      <span className="text-sm font-bold text-red-600">{category.scores.percentage.toFixed(1)}%</span>
                    </div>
                  ))}
                {categoryBreakdown.categories.filter(cat => cat.scores.percentage < 60).length === 0 && (
                  <p className="text-sm text-gray-500">Све категорије имају задовољавајући скор</p>
                )}
              </div>
            </div>
          </div>

          {/* Action Recommendations */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Препоруке за акцију:</h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Фокусирајте се на категорије са скором испод 60% за најбржи утицај</li>
              <li>• Приоритизујте критичне захтеве у свим категоријама</li>
              <li>• Редовно ажурирајте податке за тачне резултате</li>
              {stats && stats.totalMissing > 0 && (
                <li>• Решите {stats.totalMissing} недостајућих захтева за значајно побољшање</li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Category Details Modal */}
      <CategoryDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseModal}
        categoryData={selectedCategory}
      />
    </div>
  );
}