// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
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
  Activity
} from 'lucide-react';
import Link from 'next/link';
import { postsApi, pagesApi, categoriesApi, mediaApi } from '@/lib/api';
import type { Post, Page } from '@/lib/types';
import { useTheme } from 'next-themes';

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

interface RecentActivity {
  id: string;
  type: 'post' | 'page' | 'media';
  title: string;
  action: string;
  timestamp: string;
  status?: string;
}

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
  const { theme } = useTheme()

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

        // Mock recent activity (u realnoj aplikaciji bi ovo došlo iz API-ja)
        setRecentActivity([
          {
            id: '1',
            type: 'post',
            title: 'Nova objava o gradskim projektima',
            action: 'objavljena',
            timestamp: '2 sata',
            status: 'published'
          },
          {
            id: '2',
            type: 'page',
            title: 'Stranica o transparentnosti',
            action: 'kreirana',
            timestamp: '5 sati',
            status: 'draft'
          },
          {
            id: '3',
            type: 'media',
            title: 'slika-gradiliste.jpg',
            action: 'učitana',
            timestamp: '1 dan',
          },
          {
            id: '4',
            type: 'post',
            title: 'Izveštaj o budžetu',
            action: 'ažurirana',
            timestamp: '2 dana',
            status: 'published'
          }
        ]);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
      default:
        return <Activity className="h-4 w-4" />;
    }
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

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Poslednja aktivnost</CardTitle>
            <CardDescription>
              Šta se dešava na portalu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.title}</span>
                      {' '}je {activity.action}
                    </p>
                    <div className="flex items-center space-x-2">
                      <p className="text-xs text-muted-foreground flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        pre {activity.timestamp}
                      </p>
                      {activity.status && (
                        <Badge variant="outline" className="text-xs">
                          {activity.status === 'published' ? 'Objavljeno' : 'Draft'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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