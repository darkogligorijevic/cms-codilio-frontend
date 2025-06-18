'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  Edit2, 
  Save, 
  X, 
  Lock,
  FileText,
  Activity,
  Eye
} from 'lucide-react';
import { usersApi, postsApi } from '@/lib/api';
import { toast } from 'sonner';
import { UserWithStats, UpdateUserDto, Post } from '@/lib/types';

export default function ProfilePage() {
  const { user: currentUser, login } = useAuth();
  const [userStats, setUserStats] = useState<UserWithStats | null>(null);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (currentUser) {
      loadUserData();
      loadRecentPosts();
    }
  }, [currentUser]);

  const loadUserData = async () => {
    if (!currentUser) return;
    
    try {
      const userWithStats = await usersApi.getByIdWithStats(currentUser.id.toString());
      setUserStats(userWithStats);
      
      // Initialize form with current user data
      setFormData(prev => ({
        ...prev,
        name: userWithStats.name,
        email: userWithStats.email
      }));
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Greška pri učitavanju korisničkih podataka');
    }
  };

  const loadRecentPosts = async () => {
    try {
      setIsLoading(true);
      const response = await postsApi.getAll(1, 5); // Get first 5 posts
      // Filter posts by current user if not admin
      const userPosts = currentUser?.role === 'admin' 
        ? response.posts 
        : response.posts.filter(post => post.authorId === currentUser?.id);
      setRecentPosts(userPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Greška pri učitavanju objava');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;

    // Validation
    if (!formData.name.trim()) {
      toast.error('Ime je obavezno');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('Email je obavezan');
      return;
    }

    if (formData.newPassword && formData.newPassword.length < 6) {
      toast.error('Nova lozinka mora imati najmanje 6 karaktera');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Lozinke se ne poklapaju');
      return;
    }

    try {
      setIsSaving(true);

      const updateData: UpdateUserDto = {
        name: formData.name,
        email: formData.email,
      };

      // Only include password if it's being changed
      if (formData.newPassword) {
        updateData.password = formData.newPassword;
      }

      const updatedUser = await usersApi.update(currentUser.id.toString(), updateData);
      
      // Update auth context with new user data
      await login({ email: formData.email, password: formData.currentPassword || formData.newPassword });
      
      // Reset password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      setIsEditing(false);
      toast.success('Profil je uspešno ažuriran');
      
      // Reload user data
      await loadUserData();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Greška pri ažuriranju profila');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (!userStats) return;
    
    setFormData({
      name: userStats.name,
      email: userStats.email,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setIsEditing(false);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'author':
        return 'Autor';
      case 'editor':
        return 'Urednik';
      default:
        return role;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'default';
      case 'author':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('sr-RS', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!currentUser || !userStats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profil korisnika</h1>
          <p className="text-muted-foreground">
            Upravljajte svojim profilom i podešavanjima
          </p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Osnovni podaci</TabsTrigger>
          <TabsTrigger value="activity">Aktivnost</TabsTrigger>
          <TabsTrigger value="security">Bezbednost</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-blue-500 text-white text-xl">
                      {userStats.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl">{userStats.name}</CardTitle>
                    <CardDescription className="flex items-center space-x-2 mt-1">
                      <Mail className="h-4 w-4" />
                      <span>{userStats.email}</span>
                    </CardDescription>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant={getRoleBadgeVariant(userStats.role)}>
                        <Shield className="h-3 w-3 mr-1" />
                        {getRoleLabel(userStats.role)}
                      </Badge>
                      <Badge variant={userStats.isActive ? "default" : "secondary"}>
                        {userStats.isActive ? 'Aktivan' : 'Neaktivan'}
                      </Badge>
                    </div>
                  </div>
                </div>
                {!isEditing && (
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Uredi profil
                  </Button>
                )}
              </div>
            </CardHeader>

            {isEditing && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Ime i prezime</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Unesite ime i prezime"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email adresa</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Unesite email adresu"
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3 flex items-center">
                    <Lock className="h-4 w-4 mr-2" />
                    Promena lozinke (opciono)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Trenutna lozinka</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={formData.currentPassword}
                        onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                        placeholder="Trenutna lozinka"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nova lozinka</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => handleInputChange('newPassword', e.target.value)}
                        placeholder="Nova lozinka"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Potvrdi lozinku</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        placeholder="Potvrdi novu lozinku"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    onClick={handleSaveProfile} 
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Čuva...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Sačuvaj izmene
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={handleCancelEdit}>
                    <X className="h-4 w-4 mr-2" />
                    Otkaži
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ukupno objava</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.postsCount}</div>
                <p className="text-xs text-muted-foreground">
                  Sve vaše objave
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Poslednja objava</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userStats.lastPostDate ? 
                    formatDate(userStats.lastPostDate).split(' ')[0] : 
                    'N/A'
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  {userStats.lastPostDate ? 
                    formatDate(userStats.lastPostDate) : 
                    'Nemate objave'
                  }
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Registrovan</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Date(userStats.createdAt).getFullYear()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDate(userStats.createdAt)}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          {/* Recent Posts */}
          <Card>
            <CardHeader>
              <CardTitle>Poslednje objave</CardTitle>
              <CardDescription>
                Vaše najnovije objave i njihov status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : recentPosts.length > 0 ? (
                <div className="space-y-4">
                  {recentPosts.map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-medium leading-none">
                          {post.title}
                        </h4>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(post.createdAt)}</span>
                          <Eye className="h-3 w-3" />
                          <span>{post.viewCount} pregleda</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                          {post.status === 'published' ? 'Objavljeno' : 'Draft'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nema objava
                  </h3>
                  <p className="text-gray-500">
                    Počnite pisanje svoje prve objave.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Bezbednosna podešavanja</CardTitle>
              <CardDescription>
                Upravljajte bezbednošću vašeg naloga
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Dvostruka autentifikacija</h4>
                    <p className="text-sm text-muted-foreground">
                      Povećajte bezbednost naloga aktiviranjem 2FA
                    </p>
                  </div>
                  <Button variant="outline" disabled>
                    Uskoro dostupno
                  </Button>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Aktivne sesije</h4>
                    <p className="text-sm text-muted-foreground">
                      Upravljajte uređajima koji pristupaju vašem nalogu
                    </p>
                  </div>
                  <Button variant="outline" disabled>
                    Uskoro dostupno
                  </Button>
                </div>
              </div>

              <div className="p-4 border border-red-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-red-700">Opasna zona</h4>
                    <p className="text-sm text-red-600">
                      Brisanje naloga je nepovratno
                    </p>
                  </div>
                  <Button variant="destructive" disabled>
                    Obriši nalog
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}