// app/dashboard/users/page.tsx
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
  EyeOff
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import type { User, UserRole } from '@/lib/types';
import { usersApi } from '@/lib/api';
import { toast } from 'sonner';

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

interface MockUser extends User {
  isActive: boolean;
  lastLogin?: string;
  postsCount: number;
}

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<MockUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<MockUser | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<MockUser | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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
      // Mock data - u realnoj aplikaciji bi ovo došlo iz API-ja

      // ovde sam ih pozvao i radi
      const users = await usersApi.getAll();
      console.log(users);

      const mockUsers: MockUser[] = [
        {
          id: 1,
          name: 'Marko Petrović',
          email: 'marko.petrovic@opstina.rs',
          role: 'admin' as UserRole,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-06-01T10:00:00Z',
          isActive: true,
          lastLogin: '2024-06-08T14:30:00Z',
          postsCount: 25
        },
        {
          id: 2,
          name: 'Ana Nikolić',
          email: 'ana.nikolic@opstina.rs',
          role: 'author' as UserRole,
          createdAt: '2024-02-10T10:00:00Z',
          updatedAt: '2024-06-01T10:00:00Z',
          isActive: true,
          lastLogin: '2024-06-07T09:15:00Z',
          postsCount: 12
        },
        {
          id: 3,
          name: 'Stefan Jovanović',
          email: 'stefan.jovanovic@opstina.rs',
          role: 'author' as UserRole,
          createdAt: '2024-03-05T10:00:00Z',
          updatedAt: '2024-05-15T10:00:00Z',
          isActive: false,
          lastLogin: '2024-05-10T16:45:00Z',
          postsCount: 3
        }
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Greška pri učitavanju korisnika');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: UserFormData) => {
    try {
      if (editingUser) {
        // Update user logic
        const updatedUser = {
          ...editingUser,
          name: data.name,
          email: data.email,
          role: data.role,
          updatedAt: new Date().toISOString()
        };
        setUsers(prev => prev.map(u => u.id === editingUser.id ? updatedUser : u));
        toast.success('Korisnik je uspešno ažuriran');
      } else {
        // Create user logic
        const newUser: MockUser = {
          id: Math.max(...users.map(u => u.id)) + 1,
          name: data.name,
          email: data.email,
          role: data.role,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isActive: true,
          postsCount: 0
        };
        setUsers(prev => [...prev, newUser]);
        toast.success('Korisnik je uspešno kreiran');
      }

      handleCloseDialog();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Greška pri čuvanju korisnika');
    }
  };

  const handleEditUser = (user: MockUser) => {
    setEditingUser(user);
    setValue('name', user.name);
    setValue('email', user.email);
    setValue('role', user.role);
    setValue('password', ''); // Don't pre-fill password
    setIsDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      toast.success('Korisnik je uspešno obrisan');
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Greška pri brisanju korisnika');
    }
  };

  const toggleUserStatus = async (user: MockUser) => {
    try {
      const updatedUser = { ...user, isActive: !user.isActive };
      setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
      toast.success(`Korisnik je ${updatedUser.isActive ? 'aktiviran' : 'deaktiviran'}`);
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Greška pri ažuriranju statusa');
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
      <Badge className="bg-red-100 text-red-800">
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
      <Badge className="bg-green-100 text-green-800">
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

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const canEditUser = (user: MockUser) => {
    // Admin može da menja sve korisnike, osim sebe
    // Autor ne može da menja nikog
    return currentUser?.role === 'admin' && currentUser?.id !== user.id;
  };

  const canDeleteUser = (user: MockUser) => {
    // Admin može da briše sve korisnike osim sebe
    return currentUser?.role === 'admin' && currentUser?.id !== user.id;
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

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Pretraga i filteri</CardTitle>
          <CardDescription>
            Pronađite korisnike pomoću pretrage i filtera
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
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

            <div className="flex items-end">
              <div className="text-sm text-muted-foreground">
                Prikazuje se {filteredUsers.length} od {users.length} korisnika
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
                Ukupno {filteredUsers.length} korisnika
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Korisnik</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Uloga</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Objave</TableHead>
                  <TableHead>Poslednja prijava</TableHead>
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
                      {getStatusBadge(user.isActive)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{user.postsCount}</div>
                    </TableCell>
                    <TableCell>
                      {user.lastLogin ? (
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(user.lastLogin)}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          Nikad se nije prijavio
                        </span>
                      )}
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
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-muted-foreground">
                        {searchTerm || roleFilter !== 'all' ? (
                          <>
                            <Search className="mx-auto h-8 w-8 mb-2" />
                            <p>Nema korisnika koji odgovaraju filterima</p>
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
          )}
        </CardContent>
      </Card>

      {/* User Statistics */}
      {users.length > 0 && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ukupno korisnika
              </CardTitle>
              <UserIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">
                Registrovani korisnici
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Aktivni korisnici
              </CardTitle>
              <UserCheckIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.isActive).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Mogu da se prijave
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
              <div className="text-2xl font-bold">
                {users.filter(u => u.role === 'admin').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Imaju pun pristup
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ukupno objava
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.reduce((sum, user) => sum + user.postsCount, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Kreirane od strane korisnika
              </p>
            </CardContent>
          </Card>
        </div>
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
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-900">
                  Ograničen pristup
                </h3>
                <p className="text-sm text-blue-700 mt-1">
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