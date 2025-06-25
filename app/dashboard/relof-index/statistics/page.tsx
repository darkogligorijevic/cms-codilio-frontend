// app/dashboard/relof-index/statistics/page.tsx
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
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  ArrowLeft,
  Activity,
  Target,
  Clock,
  Award,
  AlertTriangle,
  Minus,
  Download,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { relofIndexApi, type StatisticsData, type RelofIndexScore } from '@/lib/api';
interface TrendIndicatorProps {
  trend: number;
  isImproving: boolean;
  className?: string;
}

function TrendIndicator({ trend, isImproving, className = '' }: TrendIndicatorProps) {
  const absValue = Math.abs(trend);
  
  if (absValue < 0.1) {
    return (
      <div className={`flex items-center space-x-1 text-gray-500 ${className}`}>
        <Minus className="h-4 w-4" />
        <span className="text-sm">Стабилно</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-1 ${isImproving ? 'text-green-600' : 'text-red-600'} ${className}`}>
      {isImproving ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
      <span className="text-sm font-medium">
        {isImproving ? '+' : '-'}{absValue.toFixed(1)}%
      </span>
    </div>
  );
}

interface ScoreHistoryChartProps {
  history: RelofIndexScore[];
}

function ScoreHistoryChart({ history }: ScoreHistoryChartProps) {
  if (history.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <BarChart3 className="mx-auto h-12 w-12 mb-2 opacity-50" />
          <p>Нема података за приказ</p>
        </div>
      </div>
    );
  }

  const maxScore = Math.max(...history.map(h => h.totalScore));
  const minScore = Math.min(...history.map(h => h.totalScore));
  const range = maxScore - minScore || 1;

  return (
    <div className="space-y-4">
      <div className="h-64 flex items-end space-x-2 px-4">
        {history.map((point, index) => {
          const height = ((point.totalScore - minScore) / range) * 200 + 20;
          const isLatest = index === history.length - 1;
          
          return (
            <div key={index} className="flex-1 flex flex-col justify-end items-center">
              <div className="text-xs text-gray-500 mb-1 opacity-0 hover:opacity-100 transition-opacity">
                {Number(point.totalScore).toFixed(1)}%
              </div>
              <div
                className={`w-full rounded-t transition-all duration-300 hover:opacity-80 cursor-pointer ${
                  isLatest ? 'bg-blue-600' : 'bg-blue-400'
                }`}
                style={{ height: `${height}px` }}
                title={`${new Date(point.calculatedAt).toLocaleDateString('sr-RS')}: ${Number(point.totalScore).toFixed(1)}%`}
              />
              <div className="text-xs text-gray-400 mt-1 rotate-45 origin-left whitespace-nowrap">
                {new Date(point.calculatedAt).toLocaleDateString('sr-RS', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="flex justify-between text-xs text-gray-500 px-4">
        <span>Мин: {minScore.toFixed(1)}%</span>
        <span>Макс: {maxScore.toFixed(1)}%</span>
      </div>
    </div>
  );
}

export default function StatisticsPage() {
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [history, setHistory] = useState<RelofIndexScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStatistics = async () => {
    try {
      setIsLoading(true);
      const [statsData, historyData] = await Promise.all([
        relofIndexApi.getStatistics(selectedPeriod),
        relofIndexApi.getScoreHistory(selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90)
      ]);
      
      setStatistics(statsData);
      setHistory(historyData);
    } catch (error: any) {
      console.error('Error fetching statistics:', error);
      toast.error('Грешка при учитавању статистика: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchStatistics();
    setIsRefreshing(false);
    toast.success('Статистике су освежене');
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
  };

  useEffect(() => {
    fetchStatistics();
  }, [selectedPeriod]);

  const getScoreGrade = (score: number): string => {
    if (score >= 90) return 'Одличан';
    if (score >= 80) return 'Веома добар';
    if (score >= 70) return 'Добар';
    if (score >= 60) return 'Задовољавајући';
    if (score >= 50) return 'Довољан';
    return 'Незадовољавајући';
  };

  const getGradeColor = (grade: string): string => {
    switch (grade) {
      case 'Одличан': return 'text-green-600 bg-green-50 border-green-200';
      case 'Веома добар': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Добар': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Задовољавајући': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Довољан': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Статистике и трендови</h1>
            <p className="text-muted-foreground">Детаљна анализа Релоф Индекса</p>
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

  if (!statistics) {
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
            <h1 className="text-3xl font-bold tracking-tight mt-2">Статистике и трендови</h1>
            <p className="text-muted-foreground">Детаљна анализа Релоф Индекса</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <BarChart3 className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Нема доступних статистика
            </h3>
            <p className="text-gray-500 mb-4">
              Недовољно података за генерисање статистика
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

  const currentGrade = getScoreGrade(statistics.current.score);

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
          <h1 className="text-3xl font-bold tracking-tight">Статистике и трендови</h1>
          <p className="text-muted-foreground">
            Детаљна анализа Релоф Индекса за период од {statistics.period}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 дана</SelectItem>
              <SelectItem value="30d">30 дана</SelectItem>
              <SelectItem value="90d">90 дана</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline" size="sm">
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Извези
          </Button>
        </div>
      </div>

      {/* Current Score Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Тренутни скор</h2>
              <div className="flex items-center space-x-4">
                <div className="text-4xl font-bold text-blue-600">
                  {Number(statistics.current.score).toFixed(1)}%
                </div>
                <Badge className={`px-3 py-1 ${getGradeColor(currentGrade)}`}>
                  {currentGrade}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                Последње ажурирање: {new Date(statistics.current.calculatedAt).toLocaleString('sr-RS')}
              </p>
            </div>
            <div className="text-right space-y-2">
              <TrendIndicator 
                trend={statistics.trends.trend} 
                isImproving={statistics.trends.isImproving}
                className="justify-end"
              />
              <div className="text-sm text-gray-600">
                Стопа побољшања: {statistics.trends.improvementRate.toFixed(1)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Просечни скор
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number(statistics.trends.averageScore).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              За период од {statistics.period}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Најбољи скор
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {statistics.extremes.bestScore.score.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date(statistics.extremes.bestScore.date).toLocaleDateString('sr-RS')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Најгори скор
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {statistics.extremes.worstScore.score.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date(statistics.extremes.worstScore.date).toLocaleDateString('sr-RS')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Тачака података
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.dataPoints || 0}</div>
            <p className="text-xs text-muted-foreground">
              Прорачуна у периоду
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trend Analysis */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Анализа трендова</span>
            </CardTitle>
            <CardDescription>
              Детаљна анализа промене скора током времена
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-lg font-bold">
                  {statistics.trends.isImproving ? '+' : ''}{statistics.trends.trend.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Укупна промена</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-lg font-bold">
                  {statistics.trends.improvementRate > 0 ? '+' : ''}{statistics.trends.improvementRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Стопа раста</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Тренд:</span>
                <TrendIndicator 
                  trend={statistics.trends.trend} 
                  isImproving={statistics.trends.isImproving}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Стабилност:</span>
                <span className="text-sm text-gray-600">
                  {Math.abs(statistics.trends.trend) < 2 ? 'Стабилан' : 
                   Math.abs(statistics.trends.trend) < 5 ? 'Умерено променљив' : 'Високо променљив'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Поузданост:</span>
                <span className="text-sm text-gray-600">
                  {(statistics.dataPoints || 0) > 20 ? 'Висока' : 
                   (statistics.dataPoints || 0) > 10 ? 'Средња' : 'Ниска'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Циљеви и пројекције</span>
            </CardTitle>
            <CardDescription>
              Анализа достизања циљева
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Циљ (80%):</span>
                <div className="flex items-center space-x-2">
                  {statistics.current.score >= 80 ? (
                    <Badge className="bg-green-100 text-green-800">Достигнут</Badge>
                  ) : (
                    <span className="text-sm text-gray-600">
                      Недостаје {(80 - statistics.current.score).toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Одлично (90%):</span>
                <div className="flex items-center space-x-2">
                  {statistics.current.score >= 90 ? (
                    <Badge className="bg-green-100 text-green-800">Достигнут</Badge>
                  ) : (
                    <span className="text-sm text-gray-600">
                      Недостаје {(90 - statistics.current.score).toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>

              {statistics.trends.isImproving && statistics.trends.trend > 0 && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                    Пројекција
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-300">
                    При тренутној стопи раста, циљ од 80% ће бити достигнут за око{' '}
                    {Math.ceil((80 - statistics.current.score) / (statistics.trends.trend / 30))} дана
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Historical Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Историјски преглед</span>
          </CardTitle>
          <CardDescription>
            Графикон промене Релоф Индекса током времена
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScoreHistoryChart history={history} />
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Увиди у перформансе</span>
          </CardTitle>
          <CardDescription>
            Кључни закључци на основу анализе података
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-medium">Позитивни трендови:</h4>
                <ul className="space-y-2 text-sm">
                  {statistics.trends.isImproving ? (
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Скор се континуирано побољшава</span>
                    </li>
                  ) : null}
                  
                  {statistics.current.score >= statistics.trends.averageScore ? (
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Тренутни скор изнад просека</span>
                    </li>
                  ) : null}
                  
                  {statistics.dataPoints >= 10 ? (
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Довољно података за поуздану анализу</span>
                    </li>
                  ) : null}
                  
                  {!statistics.trends.isImproving && Number(!statistics.current.score) >= Number(statistics.trends.averageScore) && statistics.dataPoints < 10 ? (
                    <li className="flex items-center space-x-2 text-gray-500">
                      <div className="w-2 h-2 bg-gray-400 rounded-full" />
                      <span>Нема уочених позитивних трендова</span>
                    </li>
                  ) : null}
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Области за пажњу:</h4>
                <ul className="space-y-2 text-sm">
                  {!statistics.trends.isImproving ? (
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      <span>Скор се не побољшава</span>
                    </li>
                  ) : null}
                  
                  {statistics.current.score < 60 ? (
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      <span>Скор испод задовољавајућег нивоа</span>
                    </li>
                  ) : null}
                  
                  {Math.abs(statistics.trends.trend) > 10 ? (
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                      <span>Висока варијабилност скора</span>
                    </li>
                  ) : null}
                  
                  {(statistics.dataPoints || 0) < 5 ? (
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                      <span>Мало података за анализу</span>
                    </li>
                  ) : null}
                  
                  {(() => {
                    const hasNoIssues = statistics.trends.isImproving && 
                                       statistics.current.score >= 60 && 
                                       Math.abs(statistics.trends.trend) <= 10 && 
                                       (statistics.dataPoints || 0) >= 5;
                    
                    if (hasNoIssues) {
                      return (
                        <li className="flex items-center space-x-2 text-gray-500">
                          <div className="w-2 h-2 bg-gray-400 rounded-full" />
                          <span>Нема значајних области за пажњу</span>
                        </li>
                      );
                    }
                    return null;
                  })()}
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Препорука:</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {statistics.trends.isImproving ? 
                  "Наставите са тренутним активностима и фокусирајте се на критичне области за максимални утицај." :
                  "Потребно је дефинисати и имплементирати акциони план за побољшање транспарентности."
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}