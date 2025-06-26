'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  RefreshCw,
  Bell,
  Activity,
  FileText,
  Users,
  Eye,
  EyeOff,
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { relofIndexApi, type DashboardData, type RelofIndexScore, type RequirementResult, type Recommendation } from '@/lib/api';

interface ScoreGaugeProps {
  score: number;
  size?: number;
}

function ScoreGauge({ score, size = 120 }: ScoreGaugeProps) {
  const radius = size / 2 - 8;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#10B981'; // Green
    if (score >= 60) return '#F59E0B'; // Yellow  
    if (score >= 40) return '#F97316'; // Orange
    return '#EF4444'; // Red
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth="8"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getScoreColor(score)}
          strokeWidth="8"
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {Number(score).toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500">
            Релоф Индекс
          </div>
        </div>
      </div>
    </div>
  );
}

interface TrendIndicatorProps {
  isImproving: boolean | null;
  value?: number;
}

function TrendIndicator({ isImproving, value }: TrendIndicatorProps) {
  if (isImproving === false && value === 0 ) {
    return (
      <div className="flex items-center space-x-1 text-gray-500">
        <Minus className="h-4 w-4" />
        <span className="text-sm">Нема промене</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-1 ${isImproving ? 'text-green-600' : 'text-red-600'}`}>
      {isImproving ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
      <span className="text-sm">
        {isImproving ? 'Побољшање' : 'Погоршање'}
        {value && ` (${Math.abs(value).toFixed(1)}%)`}
      </span>
    </div>
  );
}

interface RequirementCardProps {
  requirement: RequirementResult;
}

function RequirementCard({ requirement }: RequirementCardProps) {
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

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-sm">{requirement.name}</h4>
          <div className="flex items-center space-x-1 ml-2">
            <div className={`w-2 h-2 rounded-full ${getPriorityColor(requirement.priority)}`} />
            <span className="text-xs text-gray-500">{getPriorityLabel(requirement.priority)}</span>
          </div>
        </div>
        
        <p className="text-xs text-gray-600 mb-3">{requirement.description}</p>
        
        <div className="flex items-center justify-between">
          <Badge className={`text-xs ${getStatusColor(requirement.status)}`}>
            {getStatusLabel(requirement.status)}
          </Badge>
          <span className="text-xs text-gray-500">{requirement.points} бодова</span>
        </div>

        {requirement.specificIssues && requirement.specificIssues.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <h5 className="text-xs font-medium text-gray-700 mb-1">Препоруке:</h5>
            <ul className="text-xs text-gray-600 space-y-1">
              {requirement.specificIssues.slice(0, 2).map((issue, index) => (
                <li key={index} className="flex items-start space-x-1">
                  <span className="text-gray-400">•</span>
                  <span>{issue}</span>
                </li>
              ))}
              {requirement.specificIssues.length > 2 && (
                <li className="text-gray-400">+{requirement.specificIssues.length - 2} више...</li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function RelofIndexDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [isSendingNotification, setIsSendingNotification] = useState(false);
  const { theme } = useTheme();

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const data = await relofIndexApi.getDashboardData();
      console.log(data);
      setDashboardData(data);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.data?.needsCalculation) {
        toast.error('Релоф Индекс није израчунат. Покрените прорачун прво.');
      } else {
        toast.error('Грешка при учитавању података: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecalculate = async () => {
    try {
      setIsRecalculating(true);
      const result = await relofIndexApi.recalculateScore('Manual recalculation from dashboard');
      toast.success(`Релоф Индекс поново израчунат: ${Number(result.newScore.totalScore).toFixed(1)}%`);
      await fetchDashboardData(); // Refresh data
    } catch (error: any) {
      console.error('Error recalculating score:', error);
      toast.error('Грешка при поновном прорачуну: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleSendNotification = async () => {
    try {
      setIsSendingNotification(true);
      const result = await relofIndexApi.triggerNotification();
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message || 'Грешка при слању обавештења');
      }
    } catch (error: any) {
      console.error('Error sending notification:', error);
      toast.error('Грешка при слању обавештења: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSendingNotification(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Релоф Индекс</h1>
            <p className="text-muted-foreground">Систем за праћење транспарентности</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Релоф Индекс</h1>
            <p className="text-muted-foreground">Систем за праћење транспарентности</p>
          </div>
          <Button onClick={handleRecalculate} disabled={isRecalculating} variant={theme === "light" ? "default" : "secondaryDefault"}>
            {isRecalculating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Покрени прорачун
          </Button>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Нема доступних података
            </h3>
            <p className="text-gray-500 mb-4">
              Релоф Индекс није још увек израчунат. Кликните на дугме да покренете први прорачун.
            </p>
            <Button onClick={handleRecalculate} disabled={isRecalculating} variant={theme === "light" ? "default" : "secondaryDefault"}>
              {isRecalculating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Target className="mr-2 h-4 w-4" />
              )}
              Покрени прорачун
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
          <h1 className="text-3xl font-bold tracking-tight">Релоф Индекс</h1>
          <p className="text-muted-foreground">
            Систем за праћење транспарентности • Последње ажурирање: {' '}
            {new Date(dashboardData.score.calculatedAt).toLocaleString('sr-RS')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleSendNotification}
            disabled={isSendingNotification}
            variant="outline"
            size="sm"
          >
            {isSendingNotification ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Bell className="mr-2 h-4 w-4" />
            )}
            Пошаљи обавештење
          </Button>
          <Button
            onClick={handleRecalculate}
            disabled={isRecalculating}
            variant={theme === "light" ? "default" : "secondaryDefault"}
            size="sm"
          >
            {isRecalculating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Поновни прорачун
          </Button>
        </div>
      </div>

      {/* Main Score Card */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Тренутни Релоф Индекс</span>
          </CardTitle>
          <CardDescription>
            Укупан скор транспарентности институције
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <ScoreGauge score={dashboardData.score.current} size={140} />
              <div className="space-y-2">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dashboardData.score.grade}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {Number(dashboardData.score.current).toFixed(1)}% од максималних 100%
                  </p>
                </div>
                <TrendIndicator isImproving={dashboardData.trends.isImproving} value={Number(dashboardData.score.change)} />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-green-600">
                    {dashboardData.quickStats.fulfilledRequirements}
                  </div>
                  <div className="text-xs text-gray-500">Испуњено</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-red-600">
                    {dashboardData.quickStats.criticalIssues}
                  </div>
                  <div className="text-xs text-gray-500">Критично</div>
                </div>
              </div>
              <div className="text-center pt-2 border-t">
                <div className="text-sm text-gray-600">
                  {dashboardData.quickStats.totalRequirements} укупно захтева
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Укупно захтева
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.quickStats.totalRequirements}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.quickStats.fulfilledRequirements} испуњено
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Критичне ставке
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {dashboardData.quickStats.criticalIssues}
            </div>
            <p className="text-xs text-muted-foreground">
              Захтевају хитну интервенцију
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Препоруке
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.quickStats.pendingRecommendations}</div>
            <p className="text-xs text-muted-foreground">
              Активних препорука за побољшање
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Статус система
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${dashboardData.system.serverReady ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm font-medium">
                {dashboardData.system.serverReady ? 'Активан' : 'Неактиван'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.system.totalConnections || 0} веза • {dashboardData.system.subscribedClients || 0} праћења
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Issues and Recommendations */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Critical Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span>Критичне ставке</span>
            </CardTitle>
            <CardDescription>
              Захтеви који захтевају хитну пажњу
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData.alerts.critical.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.alerts.critical.map((requirement, index) => (
                  <RequirementCard key={requirement.id || index} requirement={requirement} />
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-2" />
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Нема критичних ставки
                </h3>
                <p className="text-xs text-gray-500">
                  Сви критични захтеви су испуњени
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-500" />
              <span>Приоритетне препоруке</span>
            </CardTitle>
            <CardDescription>
              Препоруке за побољшање скора
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData.alerts.recommendations.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.alerts.recommendations.map((recommendation, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{recommendation.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        +{recommendation.estimatedImpact} бодова
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-3">{recommendation.description}</p>
                    
                    <div className="space-y-1">
                      <h5 className="text-xs font-medium text-gray-700">Акциони кораци:</h5>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {recommendation.actionItems.slice(0, 2).map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start space-x-1">
                            <span className="text-gray-400">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                        {recommendation.actionItems.length > 2 && (
                          <li className="text-gray-400">+{recommendation.actionItems.length - 2} више...</li>
                        )}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-2" />
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Нема нових препорука
                </h3>
                <p className="text-xs text-gray-500">
                  Сви захтеви су на оптималном нивоу
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      {dashboardData.trends.history.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Тренд скора</span>
            </CardTitle>
            <CardDescription>
              Промена Релоф Индекса током времена (последњи 7 дана)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl font-bold">
                    {Number(dashboardData.trends.history[dashboardData.trends.history.length - 1]?.score).toFixed(1) || '0.0'}%
                  </div>
                  <TrendIndicator isImproving={dashboardData.trends.isImproving} />
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    {dashboardData.trends.history.length} тачака података
                  </div>
                </div>
              </div>

              {/* Simple trend visualization */}
              <div className="grid grid-cols-7 gap-2 h-20">
                {dashboardData.trends.history.slice(-7).map((point, index) => {
                  const maxScore = Math.max(...dashboardData.trends.history.map(h => h.score));
                  const height = (point.score / maxScore) * 100;
                  
                  return (
                    <div key={index} className="flex flex-col justify-end">
                      <div
                        className="bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                        style={{ height: `${height}%` }}
                        title={`${new Date(point.date).toLocaleDateString('sr-RS')}: ${Number(point.score).toFixed(1)}%`}
                      />
                      <div className="text-xs text-center text-gray-500 mt-1">
                        {new Date(point.date).toLocaleDateString('sr-RS', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Брзе акције</CardTitle>
          <CardDescription>
            Често коришћене функције за управљање Релоф Индексом
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={() => window.location.href = '/dashboard/relof-index/requirements'}
            >
              <FileText className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Захтеви</div>
                <div className="text-xs text-gray-500">Преглед свих захтева</div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={() => window.location.href = '/dashboard/relof-index/recommendations'}
            >
              <Target className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Препоруке</div>
                <div className="text-xs text-gray-500">Акциони планови</div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={() => window.location.href = '/dashboard/relof-index/statistics'}
            >
              <BarChart3 className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Статистике</div>
                <div className="text-xs text-gray-500">Детаљне анализе</div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={() => window.location.href = '/dashboard/relof-index/categories'}
            >
              <Users className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Категорије</div>
                <div className="text-xs text-gray-500">По областима</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}