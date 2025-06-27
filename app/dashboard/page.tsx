// app/dashboard/page.tsx - Fixed TypeScript issues
'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Users, 
  FolderOpen, 
  Image, 
  TrendingUp, 
  Eye,
  Calendar,
  Clock,
  BarChart3,
  Activity,
  Settings,
  Upload,
  Edit,
  Trash2,
  UserPlus,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { postsApi, pagesApi, categoriesApi, mediaApi, usersApi } from '@/lib/api';
import type { Post, Page } from '@/lib/types';
import { useTheme } from 'next-themes';
import { useActivityTracker, type RecentActivity } from '@/lib/use-activity-tracker';

interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalPages: number;
  publishedPages: number;
  totalCategories: number;
  totalMedia: number;
  totalViews: number;
}

// Type definitions for action and type mappings
type ActionType = 'created' | 'updated' | 'deleted' | 'uploaded' | 'published';
type ActivityTypeKey = 'post' | 'page' | 'media' | 'user' | 'category' | 'settings' | 'gallery' | 'service' | 'organization' | 'system';

const ACTION_MAP: Record<ActionType, string> = {
  created: 'kreiran',
  updated: 'ažuriran', 
  deleted: 'obrisan',
  uploaded: 'učitan',
  published: 'objavljen'
} as const;

const TYPE_MAP: Record<ActivityTypeKey, string> = {
  post: 'post',
  page: 'stranica',
  media: 'fajl',
  user: 'korisnik',
  category: 'kategorija',
  settings: 'postavka',
  gallery: 'galerija',
  service: 'usluga',
  organization: 'organizacija',
  system: 'sistem'
} as const;

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalPages: 0,
    publishedPages: 0,
    totalCategories: 0,
    totalMedia: 0,
    totalViews: 0
  });
  
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [recentPages, setRecentPages] = useState<Page[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();

  // Handle real-time activity updates
  const handleActivityUpdate = useCallback((activity: RecentActivity) => {
    setRecentActivity(prev => [activity, ...prev.slice(0, 7)]);
  }, []);

  // Use activity tracker hook
  useActivityTracker({
    onActivityUpdate: handleActivityUpdate,
    enabled: true
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch stats
        const [postsResponse, pagesResponse, categoriesResponse, mediaResponse] = await Promise.all([
          postsApi.getAll(1, 10),
          pagesApi.getAll(),
          categoriesApi.getAll(),
          mediaApi.getAll()
        ]);

        const publishedPosts = postsResponse.posts.filter(post => post.status === 'published').length;
        const draftPosts = postsResponse.posts.filter(post => post.status === 'draft').length;
        const publishedPages = pagesResponse.filter(page => page.status === 'published').length;
        const totalViews = postsResponse.posts.reduce((sum, post) => sum + post.viewCount, 0); 

        setStats({
          totalPosts: postsResponse.total,
          publishedPosts,
          draftPosts,
          totalPages: pagesResponse.length,
          publishedPages,
          totalCategories: categoriesResponse.length,
          totalMedia: mediaResponse.length,
          totalViews
        });

        // Set recent content
        setRecentPosts(postsResponse.posts.slice(0, 5));
        setRecentPages(pagesResponse.slice(0, 3));

        // Generate real activity feed
        await generateRealActivityFeed();

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const generateRealActivityFeed = async () => {
    try {
      const activities: RecentActivity[] = [];
      
      // Get recent posts
      const recentPostsData = await postsApi.getAll(1, 5);
      recentPostsData.posts.forEach(post => {
        activities.push({
          id: `post-${post.id}`,
          type: 'post',
          title: post.title,
          action: post.status === 'published' ? 'published' : 'updated',
          timestamp: post.updatedAt,
          status: post.status,
          author: post.author.name,
          url: `/dashboard/posts/${post.id}`
        });
      });

      // Get recent pages
      const recentPagesData = await pagesApi.getAll();
      recentPagesData.slice(0, 3).forEach(page => {
        activities.push({
          id: `page-${page.id}`,
          type: 'page',
          title: page.title,
          action: page.status === 'published' ? 'published' : 'updated',
          timestamp: page.updatedAt,
          status: page.status,
          author: page.author.name,
          url: `/dashboard/pages/${page.id}`
        });
      });

      // Get recent media
      const recentMediaData = await mediaApi.getAll();
      recentMediaData.slice(0, 3).forEach(media => {
        activities.push({
          id: `media-${media.id}`,
          type: 'media',
          title: media.originalName,
          action: 'uploaded',
          timestamp: media.createdAt,
          status: media.isPublic ? 'public' : 'private',
          url: `/dashboard/media`
        });
      });

      // Get recent users (if available)
      try {
        const recentUsersData = await usersApi.getAll();
        recentUsersData.slice(0, 2).forEach(user => {
          activities.push({
            id: `user-${user.id}`,
            type: 'user',
            title: user.name,
            action: 'created',
            timestamp: user.createdAt,
            status: user.isActive ? 'active' : 'inactive',
            url: `/dashboard/users/${user.id}`
          });
        });
      } catch (error) {
        console.log('Could not fetch users for activity feed');
      }

      // Sort by timestamp (newest first) and take latest 8
      const sortedActivities = activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 8);

      setRecentActivity(sortedActivities);
    } catch (error) {
      console.error('Error generating activity feed:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'published' ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        Objavljeno
      </Badge>
    ) : (
      <Badge variant="secondary">
        Draft
      </Badge>
    );
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'post':
        return <FileText className="h-4 w-4" />;
      case 'page':
        return <FolderOpen className="h-4 w-4" />;
      case 'media':
        return <Image className="h-4 w-4" />;
      case 'user':
        return <Users className="h-4 w-4" />;
      case 'category':
        return <BarChart3 className="h-4 w-4" />;
      case 'settings':
        return <Settings className="h-4 w-4" />;
      case 'gallery':
        return <Image className="h-4 w-4" />;
      case 'service':
        return <FileText className="h-4 w-4" />;
      case 'organization':
        return <Users className="h-4 w-4" />;
      case 'system':
        return <Settings className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <Plus className="h-3 w-3" />;
      case 'updated':
        return <Edit className="h-3 w-3" />;
      case 'deleted':
        return <Trash2 className="h-3 w-3" />;
      case 'uploaded':
        return <Upload className="h-3 w-3" />;
      case 'published':
        return <Eye className="h-3 w-3" />;
      default:
        return <Activity className="h-3 w-3" />;
    }
  };

  const getActionText = (action: string, type: string): string => {
    // Type-safe access to mappings with fallbacks
    const actionText = (action in ACTION_MAP) 
      ? ACTION_MAP[action as ActionType] 
      : action;
    
    const typeText = (type in TYPE_MAP) 
      ? TYPE_MAP[type as ActivityTypeKey] 
      : type;
    
    return `${typeText} ${actionText}`;
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'upravo';
    if (diffInSeconds < 3600) return `pre ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `pre ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 604800) return `pre ${Math.floor(diffInSeconds / 86400)} dana`;
    
    return date.toLocaleDateString('sr-RS');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Pregled aktivnosti na portalu lokalne institucije
          </p>
        </div>
        <div className="flex items-center space-x-2">
            <Button asChild variant={theme === "light" ? "default" : "secondaryDefault"}>
              <Link href="/dashboard/posts">
                <FileText className="mr-2 h-4 w-4" />
                Nova objava
              </Link>
            </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ukupno objava
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPosts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.publishedPosts} objavljeno, {stats.draftPosts} draft
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Stranice
            </CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPages}</div>
            <p className="text-xs text-muted-foreground">
              {stats.publishedPages} objavljeno
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ukupni pregledi
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              Transparentnost u akciji
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Medijski fajlovi
            </CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMedia}</div>
            <p className="text-xs text-muted-foreground">
              Dokumenti i slike
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Posts */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Poslednje objave</CardTitle>
            <CardDescription>
              Najnovije objave i njihov status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <div key={post.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium leading-none">
                      {post.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {post.category?.name || 'Bez kategorije'} • {post.viewCount} pregleda
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(post.status)}
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/posts/${post.id}`}>
                        Uredi
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
              {recentPosts.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nema objava za prikaz
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Real-time Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Poslednja aktivnost</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Uživo"></div>
            </CardTitle>
            <CardDescription>
              Šta se dešava na portalu u realnom vremenu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 relative">
                    {getActivityIcon(activity.type)}
                    <div className="absolute -bottom-1 -right-1 bg-background rounded-full">
                      {getActionIcon(activity.action)}
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.title}</span>
                      {' - '}
                      <span className="text-muted-foreground">
                        {getActionText(activity.action, activity.type)}
                      </span>
                    </p>
                    <div className="flex items-center space-x-2">
                      <p className="text-xs text-muted-foreground flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        {formatTimeAgo(activity.timestamp)}
                      </p>
                      {activity.status && (
                        <Badge variant="outline" className="text-xs">
                          {activity.status === 'published' ? 'Objavljeno' : 
                           activity.status === 'active' ? 'Aktivno' :
                           activity.status === 'public' ? 'Javno' :
                           activity.status}
                        </Badge>
                      )}
                      {activity.author && (
                        <span className="text-xs text-muted-foreground">
                          • {activity.author}
                        </span>
                      )}
                    </div>
                  </div>
                  {activity.url && (
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" asChild>
                      <Link href={activity.url}>
                        <Eye className="h-3 w-3" />
                      </Link>
                    </Button>
                  )}
                </div>
              ))}
              {recentActivity.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nema aktivnosti za prikaz
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Brze akcije</CardTitle>
            <CardDescription>
              Česte funkcionalnosti
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/posts">
                <FileText className="mr-2 h-4 w-4" />
                Dodaj novu objavu
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/pages">
                <FolderOpen className="mr-2 h-4 w-4" />
                Kreiraj stranicu
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/media">
                <Image className="mr-2 h-4 w-4" />
                Učitaj dokument
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/categories">
                <BarChart3 className="mr-2 h-4 w-4" />
                Upravljaj kategorijama
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Pages Overview */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Importantes stranice</CardTitle>
            <CardDescription>
              Ključne stranice za transparentnost
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPages.map((page) => (
                <div key={page.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium leading-none">
                      {page.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Template: {page.template} • Redosled: {page.sortOrder}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(page.status)}
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/pages/${page.id}`}>
                        Uredi
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
              {recentPages.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nema stranica za prikaz
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}