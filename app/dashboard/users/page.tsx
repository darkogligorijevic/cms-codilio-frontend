// app/dashboard/users/page.tsx - Updated with real toggleUserStatus
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  User as UserIcon,
  UserCheck as UserCheckIcon,
  UserX as UserXIcon,
  Shield,
  Calendar,
  Mail,
  AlertCircle,
  Eye,
  EyeOff,
  FileText,
  RefreshCw,
  Users
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import type { User, UserRole, CreateUserDto, UpdateUserDto, UserWithStats, UsersStatistics } from '@/lib/types';
import { usersApi } from '@/lib/api';
import { toast } from 'sonner';

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

// Since backend now has isActive, we can use UserWithStats directly
type ExtendedUser = UserWithStats;

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  admins: number;
  authors: number;
  totalPosts: number;
  postsLastMonth: number;
}

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ExtendedUser | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<ExtendedUser | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    admins: 0,
    authors: 0,
    totalPosts: 0,
    postsLastMonth: 0
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<UserFormData>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'author' as UserRole 
    }
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      // Fetch users with stats and statistics
      const [apiUsersWithStats, apiStats] = await Promise.all([
        usersApi.getAllWithStats(),
        usersApi.getStatistics()
      ]);
      
      // Users now come with isActive from backend
      setUsers(apiUsersWithStats);
      
      // Use statistics from backend
      const stats: UserStats = {
        totalUsers: apiStats.totalUsers,
        activeUsers: apiStats.activeUsers,
        admins: apiStats.admins,
        authors: apiStats.authors,
        totalPosts: apiStats.totalPosts,
        postsLastMonth: apiStats.recentPosts
      };
      
      setUserStats(stats);
      
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Greška pri učitavanju korisnika');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await fetchUsers();
    setIsRefreshing(false);
    toast.success('Podaci su osveženi');
  };

  const onSubmit = async (data: UserFormData) => {
    try {
      if (editingUser) {
        // Update user
        const updateData: UpdateUserDto = {
          name: data.name,
          email: data.email,
          role: data.role,
          ...(data.password && { password: data.password })
        };
        
        const updatedUser = await usersApi.update(editingUser.id.toString(), updateData);
        
        // Update local state
        setUsers(prev => prev.map(u => 
          u.id === editingUser.id 
            ? { 
                ...updatedUser, 
                postsCount: u.postsCount,
                recentPosts: u.recentPosts,
                lastPostDate: u.lastPostDate
              } 
            : u
        ));
        
        toast.success('Korisnik je uspešno ažuriran');
      } else {
        // Create new user
        const createData: CreateUserDto = {
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role,
          isActive: true  // New users are active by default
        };
        
        const newUser = await usersApi.create(createData);
        
        // Add to local state
        const extendedNewUser: ExtendedUser = {
          ...newUser,
          postsCount: 0,
          recentPosts: []
        };
        
        setUsers(prev => [...prev, extendedNewUser]);
        
        // Update stats
        setUserStats(prev => ({
          ...prev,
          totalUsers: prev.totalUsers + 1,
          activeUsers: prev.activeUsers + 1,
          [newUser.role === 'admin' ? 'admins' : 'authors']: prev[newUser.role === 'admin' ? 'admins' : 'authors'] + 1
        }));
        
        toast.success('Korisnik je uspešno kreiran');
      }

      handleCloseDialog();
    } catch (error: any) {
      console.error('Error saving user:', error);
      
      const errorMessage = error.response?.data?.message || 'Greška pri čuvanju korisnika';
      toast.error(errorMessage);
    }
  };

  const handleEditUser = (user: ExtendedUser) => {
    setEditingUser(user);
    setValue('name', user.name);
    setValue('email', user.email);
    setValue('role', user.role);
    setValue('password', '');
    setIsDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await usersApi.delete(userToDelete.id.toString());
      
      // Remove from local state
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      
      // Update stats
      setUserStats(prev => ({
        ...prev,
        totalUsers: prev.totalUsers - 1,
        activeUsers: userToDelete.isActive ? prev.activeUsers - 1 : prev.activeUsers,
        [userToDelete.role === 'admin' ? 'admins' : 'authors']: prev[userToDelete.role === 'admin' ? 'admins' : 'authors'] - 1,
        totalPosts: prev.totalPosts - userToDelete.postsCount
      }));
      
      toast.success('Korisnik je uspešno obrisan');
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      
      const errorMessage = error.response?.data?.message || 'Greška pri brisanju korisnika';
      toast.error(errorMessage);
    }
  };

  // Updated toggle status function to use real API
  const toggleUserStatus = async (user: ExtendedUser) => {
    try {
      // Call the backend API to toggle status
      const updatedUser = await usersApi.toggleStatus(user.id.toString());
      
      // Update local state with the response from backend
      setUsers(prev => prev.map(u => 
        u.id === user.id 
          ? { ...u, isActive: updatedUser.isActive }
          : u
      ));
      
      // Update stats
      setUserStats(prev => ({
        ...prev,
        activeUsers: updatedUser.isActive ? prev.activeUsers + 1 : prev.activeUsers - 1
      }));
      
      toast.success(`Korisnik je ${updatedUser.isActive ? 'aktiviran' : 'deaktiviran'}`);
    } catch (error: any) {
      console.error('Error updating user status:', error);
      
      const errorMessage = error.response?.data?.message || 'Greška pri ažuriranju statusa';
      toast.error(errorMessage);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingUser(null);
    reset();
    setShowPassword(false);
  };

  const getRoleBadge = (role: UserRole) => {
    return role === 'admin' ? (
      <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
        <Shield className="mr-1 h-3 w-3" />
        Administrator
      </Badge>
    ) : (
      <Badge variant="secondary">
        <UserIcon className="mr-1 h-3 w-3" />
        Autor
      </Badge>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
        <UserCheckIcon className="mr-1 h-3 w-3" />
        Aktivan
      </Badge>
    ) : (
      <Badge variant="destructive">
        <UserXIcon className="mr-1 h-3 w-3" />
        Neaktivan
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sr-RS', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sr-RS', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.isActive) ||
                         (statusFilter === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const canEditUser = (user: ExtendedUser) => {
    return currentUser?.role === 'admin' && currentUser?.id !== user.id;
  };

  const canDeleteUser = (user: ExtendedUser) => {
    return currentUser?.role === 'admin' && currentUser?.id !== user.id;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setStatusFilter('all');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Korisnici</h1>
          <p className="text-muted-foreground">
            Upravljajte korisnicima koji imaju pristup CMS-u
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={refreshData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Osveži
          </Button>
          {currentUser?.role === 'admin' && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Novi korisnik
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <DialogHeader>
                    <DialogTitle>
                      {editingUser ? 'Uredi korisnika' : 'Novi korisnik'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingUser 
                        ? 'Uredite informacije o korisniku' 
                        : 'Kreirajte novi korisnički nalog'
                      }
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Ime i prezime</Label>
                      <Input
                        id="name"
                        placeholder="Marko Petrović"
                        {...register('name', { required: 'Ime je obavezno' })}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-600 flex items-center">
                          <AlertCircle className="mr-1 h-3 w-3" />
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email adresa</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="marko.petrovic@opstina.rs"
                        {...register('email', { 
                          required: 'Email je obavezan',
                          pattern: {
                            value: /^\S+@\S+$/,
                            message: 'Neispravna email adresa'
                          }
                        })}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-600 flex items-center">
                          <AlertCircle className="mr-1 h-3 w-3" />
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">
                        {editingUser ? 'Nova lozinka (ostavi prazno da ne menjamo)' : 'Lozinka'}
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          {...register('password', { 
                            required: editingUser ? false : 'Lozinka je obavezna',
                            minLength: {
                              value: 6,
                              message: 'Lozinka mora imati najmanje 6 karaktera'
                            }
                          })}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {errors.password && (
                        <p className="text-sm text-red-600 flex items-center">
                          <AlertCircle className="mr-1 h-3 w-3" />
                          {errors.password.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Uloga</Label>
                      <Select 
                        value={watch('role')} 
                        onValueChange={(value: UserRole) => setValue('role', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="author">
                            <div className="flex items-center">
                              <UserIcon className="mr-2 h-4 w-4" />
                              Autor (može kreirati objave)
                            </div>
                          </SelectItem>
                          <SelectItem value="admin">
                            <div className="flex items-center">
                              <Shield className="mr-2 h-4 w-4" />
                              Administrator (pun pristup)
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleCloseDialog}>
                      Otkaži
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Čuva se...' : (editingUser ? 'Sačuvaj izmene' : 'Kreiraj korisnika')}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ukupno korisnika
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {userStats.activeUsers} aktivnih
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Administratori
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.admins}</div>
            <p className="text-xs text-muted-foreground">
              Imaju pun pristup
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Autori
            </CardTitle>
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.authors}</div>
            <p className="text-xs text-muted-foreground">
              Mogu kreirati objave
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ukupno objava
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.totalPosts}</div>
            <p className="text-xs text-muted-foreground">
              +{userStats.postsLastMonth} ovaj mesec
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Pretraga i filteri</CardTitle>
              <CardDescription>
                Pronađite korisnike pomoću pretrage i filtera
              </CardDescription>
            </div>
            {(searchTerm || roleFilter !== 'all' || statusFilter !== 'all') && (
              <Button variant="outline" onClick={clearFilters}>
                Očisti filtere
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="search">Pretraga</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Pretraži po imenu ili email-u..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Uloga</Label>
              <Select value={roleFilter} onValueChange={(value: any) => setRoleFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sve uloge" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Sve uloge</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="author">Autor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Svi statusi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Svi statusi</SelectItem>
                  <SelectItem value="active">Aktivni</SelectItem>
                  <SelectItem value="inactive">Neaktivni</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <div className="text-sm text-muted-foreground">
                Prikazuje se <strong>{filteredUsers.length}</strong> od <strong>{users.length}</strong> korisnika
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista korisnika</CardTitle>
              <CardDescription>
                Pregled svih korisnika i njihovih osnovnih informacija
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/8"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Korisnik</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Uloga</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Objave</TableHead>
                    <TableHead>Poslednje objave</TableHead>
                    <TableHead>Kreiran</TableHead>
                    <TableHead className="text-right">Akcije</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium flex items-center">
                            {user.name}
                            {currentUser?.id === user.id && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                Vi
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ID: {user.id}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Mail className="h-3 w-3" />
                          <span className="text-sm">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(user.role)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(Boolean(user.isActive))}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{user.postsCount}</div>
                        <div className="text-xs text-muted-foreground">
                          {user.postsCount === 0 ? 'Nema objava' : 
                           user.postsCount === 1 ? '1 objava' : 
                           `${user.postsCount} objav${user.postsCount < 5 ? 'e' : 'a'}`}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.recentPosts && user.recentPosts.length > 0 ? (
                          <div className="space-y-1 max-w-xs">
                            {user.recentPosts.slice(0, 2).map((post, idx) => (
                              <div key={post.id} className="text-xs">
                                <div className="truncate text-gray-900" title={post.title}>
                                  {post.title}
                                </div>
                                <div className="text-gray-500">
                                  {formatDateShort(post.createdAt)}
                                </div>
                              </div>
                            ))}
                            {user.recentPosts.length > 2 && (
                              <div className="text-xs text-muted-foreground">
                                +{user.recentPosts.length - 2} više
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Nema objava</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(user.createdAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {canEditUser(user) && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleUserStatus(user)}
                                title={user.isActive ? 'Deaktiviraj korisnika' : 'Aktiviraj korisnika'}
                                className={user.isActive ? 'text-orange-600 hover:text-orange-800' : 'text-green-600 hover:text-green-800'}
                              >
                                {user.isActive ? <UserXIcon className="h-4 w-4" /> : <UserCheckIcon className="h-4 w-4" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditUser(user)}
                                title="Uredi korisnika"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {canDeleteUser(user) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setUserToDelete(user);
                                setIsDeleteDialogOpen(true);
                              }}
                              title="Obriši korisnika"
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                          {!canEditUser(user) && !canDeleteUser(user) && (
                            <span className="text-xs text-muted-foreground">
                              Nema dozvoljenih akcija
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="text-muted-foreground">
                          {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' ? (
                            <>
                              <Search className="mx-auto h-8 w-8 mb-2" />
                              <p>Nema korisnika koji odgovaraju filterima</p>
                              <Button
                                variant="outline"
                                onClick={clearFilters}
                                className="mt-2"
                              >
                                Očisti filtere
                              </Button>
                            </>
                          ) : (
                            <>
                              <UserIcon className="mx-auto h-8 w-8 mb-2" />
                              <p>Nema korisnika za prikaz</p>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Activity Summary */}
      {users.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Najaktivniji korisnici</CardTitle>
            <CardDescription>
              Korisnici sa najviše objava
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users
                .filter(u => u.postsCount > 0)
                .sort((a, b) => b.postsCount - a.postsCount)
                .slice(0, 5)
                .map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{user.postsCount}</div>
                      <div className="text-sm text-muted-foreground">
                        {user.postsCount === 1 ? 'objava' : 'objav' + (user.postsCount < 5 ? 'e' : 'a')}
                      </div>
                    </div>
                  </div>
                ))}
              {users.filter(u => u.postsCount > 0).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="mx-auto h-8 w-8 mb-2" />
                  <p>Još uvek nema objava</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Potvrdi brisanje</DialogTitle>
            <DialogDescription>
              Da li ste sigurni da želite da obrišete korisnika "{userToDelete?.name}"?
              {userToDelete && userToDelete.postsCount > 0 && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <AlertCircle className="inline h-4 w-4 mr-1 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    Ovaj korisnik je kreirao {userToDelete.postsCount} objav(a). 
                    One će ostati na sistemu, ali bez vlasnika.
                  </span>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {userToDelete && (
            <div className="py-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ime:</span>
                <span>{userToDelete.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span>{userToDelete.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Uloga:</span>
                {getRoleBadge(userToDelete.role)}
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                {getStatusBadge(Boolean(userToDelete.isActive))}
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Objave:</span>
                <span>{userToDelete.postsCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kreiran:</span>
                <span>{formatDate(userToDelete.createdAt)}</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setUserToDelete(null);
              }}
            >
              Otkaži
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
            >
              Obriši korisnika
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Info Card for Non-Admin Users */}
      {currentUser?.role !== 'admin' && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Ograničen pristup
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                  Kao autor, možete videti samo listu korisnika. Za upravljanje korisnicima 
                  kontaktirajte administratora sistema.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}