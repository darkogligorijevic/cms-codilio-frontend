// components/dashboard/header.tsx - Enhanced with Relof Index & Notifications
'use client';

import { useAuth } from '../../lib/auth-context';
import { useSettings } from '../../lib/settings-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
// Using DropdownMenu instead of Popover for better compatibility
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  LogOut, 
  User, 
  Eye, 
  Settings, 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  ExternalLink,
  X
} from 'lucide-react';
import Link from 'next/link';
import { API_BASE_URL, mediaApi } from '@/lib/api';
import { ModeToggle } from '../ui/mode-toggle';
import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface RelofIndexData {
  totalScore: number;
  categoryScores: Record<string, any>;
  summary: string;
  calculatedAt: string;
  missingRequirementsCount: number;
  partialRequirementsCount: number;
  fulfilledRequirementsCount: number;
  topIssues: Array<{
    name: string;
    description: string;
    priority: string;
    issues: string[];
  }>;
  recommendations: Array<{
    title: string;
    description: string;
    priority: string;
    estimatedImpact: number;
  }>;
}

interface RequirementData {
  status: string;
  name: string;
  description: string;
  priority: string;
  [key: string]: any;
}

interface RelofApiResponse {
  totalScore: number;
  categoryScores: Record<string, any>;
  summary: string;
  calculatedAt: string;
  requirements?: RequirementData[];
  recommendations?: any[];
}

interface NotificationData {
  score: number;
  issuesCount: number;
  criticalIssues: any[];
  recommendations: any[];
  summary: string;
  title: string;
  message: string;
  urgentAction: boolean;
  criticalCount: number;
}

interface Notification {
  id: string;
  type: 'score-update' | 'daily-notification' | 'critical-alert' | 'calculation-progress';
  timestamp: string;
  data: any;
  read: boolean;
}

const RelofIndexDisplay = ({ score, trend }: { score: number; trend?: 'up' | 'down' | 'stable' }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 40) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-red-600" />;
      default: return <Minus className="h-3 w-3 text-gray-400" />;
    }
  };

  return (
    <Link href="/dashboard/relof-index" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
      <div className={cn(
        "px-3 py-1.5 rounded-lg border text-center flex items-center space-x-2",
        getScoreColor(score)
      )}>
        <Target className="h-4 w-4" />
        <span className="font-bold text-sm">{Number(score).toFixed(1)}%</span>
        {getTrendIcon()}
      </div>
      <span className="text-xs text-gray-500 hidden sm:block">Релоф Индекс</span>
    </Link>
  );
};

const NotificationBell = ({ 
  notifications, 
  onMarkAsRead, 
  onClearAll 
}: { 
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}) => {
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'critical-alert': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'daily-notification': return <Bell className="h-4 w-4 text-blue-600" />;
      case 'score-update': return <Target className="h-4 w-4 text-green-600" />;
      case 'calculation-progress': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <CheckCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    
    if (diffMinutes < 1) return 'управо сада';
    if (diffMinutes < 60) return `пре ${diffMinutes} мин`;
    if (diffHours < 24) return `пре ${diffHours} сати`;
    return date.toLocaleDateString('sr-RS');
  };

  const getNotificationTitle = (notification: Notification) => {
    switch (notification.type) {
      case 'daily-notification':
        return notification.data.title || 'Дневни извештај';
      case 'critical-alert':
        return notification.data.title || 'Критично упозорење';
      case 'score-update':
        return 'Ажуриран Релоф Индекс';
      case 'calculation-progress':
        return 'Прорачун у току';
      default:
        return 'Обавештење';
    }
  };

  const getNotificationDescription = (notification: Notification) => {
    switch (notification.type) {
      case 'daily-notification':
        return notification.data.message || `Скор: ${notification.data.score?.toFixed(1)}%`;
      case 'critical-alert':
        return notification.data.description || 'Захтева хитну акцију';
      case 'score-update':
        return `Нови скор: ${notification.data.totalScore?.toFixed(1)}%`;
      case 'calculation-progress':
        return `${notification.data.stage} - ${notification.data.percentage}%`;
      default:
        return 'Ново обавештење';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Обавештења</h3>
            {notifications.length > 0 && (
              <Button variant="ghost" size="sm" onClick={onClearAll} className="text-xs">
                Очисти све
              </Button>
            )}
          </div>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground">
              {unreadCount} непрочитаних
            </p>
          )}
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Нема нових обавештења</p>
            </div>
          ) : (
            <div className="space-y-0">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 border-b hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors",
                    !notification.read && "bg-blue-50 dark:bg-blue-900/20"
                  )}
                  onClick={() => onMarkAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {getNotificationTitle(notification)}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {getNotificationDescription(notification)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTime(notification.timestamp)}
                      </p>
                      
                      {/* Special handling for critical notifications */}
                      {notification.type === 'critical-alert' && notification.data.urgentAction && (
                        <div className="mt-2">
                          <Badge variant="destructive" className="text-xs">
                            Хитна акција потребна
                          </Badge>
                        </div>
                      )}
                      
                      {/* Daily notification summary */}
                      {notification.type === 'daily-notification' && notification.data.criticalCount > 0 && (
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs text-red-600 border-red-200">
                            {notification.data.criticalCount} критичних проблема
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {notifications.length > 0 && (
          <div className="p-3 border-t">
            <Link href="/dashboard/relof-index">
              <Button variant="outline" size="sm" className="w-full text-xs">
                <ExternalLink className="h-3 w-3 mr-2" />
                Идите на Релоф Индекс
              </Button>
            </Link>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  
  // Relof Index real-time data
  const [relofData, setRelofData] = useState<RelofIndexData | null>(null);
  const [relofTrend, setRelofTrend] = useState<'up' | 'down' | 'stable'>('stable');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize WebSocket connection
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const newSocket = io('ws://localhost:3001/relof-index', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('🔗 Connected to Relof Index WebSocket');
      setIsConnected(true);
      newSocket.emit('subscribe-to-updates');
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Disconnected from Relof Index WebSocket');
      setIsConnected(false);
    });

    newSocket.on('subscription-confirmed', (data) => {
      console.log('📡 Subscribed to Relof Index updates:', data);
    });

    // Listen for score updates
    newSocket.on('score-updated', (data) => {
      console.log('📊 Received score update:', data);
      if (data.data) {
        setRelofData(data.data);
        
        // Determine trend based on score change
        if (relofData && data.data.totalScore !== relofData.totalScore) {
          const trend = data.data.totalScore > relofData.totalScore ? 'up' : 'down';
          setRelofTrend(trend);
          console.log(trend)
          
          // Show toast notification for score changes
          const change = data.data.totalScore - relofData.totalScore;
          toast.success(
            `Релоф Индекс ажуриран: ${data.data.totalScore.toFixed(1)}% (${change > 0 ? '+' : ''}${change.toFixed(1)}%)`
          );
        }
        
        // Add notification
        addNotification({
          type: 'score-update',
          timestamp: data.timestamp,
          data: data.data
        });
      }
    });

    // Listen for daily notifications
    newSocket.on('daily-notification', (data) => {
      console.log('📧 Received daily notification:', data);
      addNotification({
        type: 'daily-notification',
        timestamp: data.timestamp,
        data: data.data
      });
      
      // Show toast for daily notifications
      toast.info(data.data.title, {
        description: data.data.message,
        duration: 5000,
      });
    });

    // Listen for critical alerts
    newSocket.on('critical-alert', (data) => {
      console.log('🚨 Received critical alert:', data);
      addNotification({
        type: 'critical-alert',
        timestamp: data.timestamp,
        data: data.data
      });
      
      // Show urgent toast for critical alerts
      toast.error('Критично упозорење!', {
        description: data.data.description,
        duration: 10000,
      });
    });

    // Listen for calculation progress
    newSocket.on('calculation-progress', (data) => {
      console.log('⏳ Calculation progress:', data);
      if (data.data.percentage === 100) {
        toast.success('Прорачун Релоф Индекса завршен');
      }
    });

    // Listen for general Relof Index updates
    newSocket.on('relof-index-update', (data) => {
      console.log('📈 General Relof Index update:', data);
      if (data.data) {
        setRelofData(data.data);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Load initial Relof Index data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const response = await fetch(API_BASE_URL+'/relof-index/current', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        
        if (response.ok) {
          const data: RelofApiResponse = await response.json();
          console.log(data);
          setRelofData({
            totalScore: data.totalScore,
            categoryScores: data.categoryScores,
            summary: data.summary,
            calculatedAt: data.calculatedAt,
            missingRequirementsCount: data.requirements?.filter((r: RequirementData) => r.status === 'missing').length || 0,
            partialRequirementsCount: data.requirements?.filter((r: RequirementData) => r.status === 'partial').length || 0,
            fulfilledRequirementsCount: data.requirements?.filter((r: RequirementData) => r.status === 'fulfilled').length || 0,
            topIssues: [],
            recommendations: data.recommendations || []
          });
        }
      } catch (error) {
        console.error('Failed to load initial Relof Index data:', error);
      }
    };

    loadInitialData();
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `${Date.now()}-${Math.random()}`,
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 19)]); // Keep last 20
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const handleLogout = () => {
    if (socket) {
      socket.disconnect();
    }
    logout();
    window.location.href = '/login';
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        {settings?.siteLogo && (
          <img 
            src={mediaApi.getFileUrl(settings.siteLogo)} 
            alt={settings.siteName || 'Logo'} 
            className="h-8 object-contain"
          />
        )}
        <div>
          <h1 className="text-lg font-semibold dark:text-white text-gray-900">
            {settings?.siteName || 'Администрациони панел'}
          </h1>
          {settings?.siteTagline && (
            <p className="text-xs text-gray-500">{settings.siteTagline}</p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Relof Index Display */}
        {relofData && (
          <RelofIndexDisplay 
            score={relofData.totalScore} 
            trend={relofTrend}
          />
        )}
        
        {/* Connection Status Indicator */}
        <div className="hidden md:flex items-center space-x-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            isConnected ? "bg-green-500" : "bg-red-500"
          )} />
          <span className="text-xs text-gray-500">
            {isConnected ? 'Повезано' : 'Није повезано'}
          </span>
        </div>

        {/* Notifications */}
        <NotificationBell 
          notifications={notifications}
          onMarkAsRead={markAsRead}
          onClearAll={clearAllNotifications}
        />

        <ModeToggle />
        
        <Button variant="outline" asChild>
          <Link href="/" target="_blank" className="flex items-center space-x-2">
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Погледај сајт</span>
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-blue-500 text-white">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">
                <User className="mr-2 h-4 w-4" />
                <span>Профил</span>
              </Link>
            </DropdownMenuItem>
            {user?.role === 'admin' && (
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Подешавања</span>
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Одјавите се</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}