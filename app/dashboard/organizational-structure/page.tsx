// app/dashboard/organizational-structure/page.tsx - Updated with navigation
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Building,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Move,
  Trash2,
  Users,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  ChevronDown,
  Download,
  BarChart3,
  TreePine,
  Grid3X3,
  Building2,
  Settings,
  Archive,
  X
} from 'lucide-react';
import { organizationalApi } from '@/lib/api';
import { OrganizationalUnit, UnitType, ContactType, OrganizationalStatistics } from '@/lib/types';
import { toast } from 'sonner';
import { OrganizationalUnitForm } from '@/components/dashboard/organizational-unit-form';
import { OrganizationalChart } from '@/components/dashboard/organizational-chart';
import { OrgStructureNav } from '@/components/dashboard/org-structure-nav';
import { useTheme } from 'next-themes';

type ViewMode = 'tree' | 'grid' | 'chart';

export default function OrganizationalStructurePage() {
  const [units, setUnits] = useState<OrganizationalUnit[]>([]);
  const [treeUnits, setTreeUnits] = useState<OrganizationalUnit[]>([]);
  const [statistics, setStatistics] = useState<OrganizationalStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('tree');
  const [selectedUnit, setSelectedUnit] = useState<OrganizationalUnit | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<OrganizationalUnit | null>(null);
  const [expandedUnits, setExpandedUnits] = useState<Set<number>>(new Set());
  const [hideSearch, setHideSearch] = useState(true);
  const {theme} = useTheme()

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [allUnits, treeData, stats] = await Promise.all([
        organizationalApi.getAll(),
        organizationalApi.getTree(),
        organizationalApi.getStatistics()
      ]);
      
      setUnits(allUnits);
      setTreeUnits(treeData);
      setStatistics(stats);
    } catch (error) {
      console.error('Error fetching organizational data:', error);
      toast.error('Грешка при учитавању организационе структуре');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUnit = () => {
    setSelectedUnit(null);
    setIsFormOpen(true);
  };

  const handleEditUnit = (unit: OrganizationalUnit) => {
    setSelectedUnit(unit);
    setIsFormOpen(true);
  };

  const handleDeleteUnit = (unit: OrganizationalUnit) => {
    setUnitToDelete(unit);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!unitToDelete) return;

    try {
      await organizationalApi.delete(unitToDelete.id);
      toast.success('Организациона јединица је успешно обрисана');
      await fetchData();
      setIsDeleteDialogOpen(false);
      setUnitToDelete(null);
    } catch (error: any) {
      console.error('Error deleting unit:', error);
      toast.error(error.response?.data?.message || 'Грешка при брисању организационе јединице');
    }
  };

  const handleFormSubmit = async () => {
    setIsFormOpen(false);
    await fetchData();
  };

  const toggleExpanded = (unitId: number) => {
    const newExpanded = new Set(expandedUnits);
    if (newExpanded.has(unitId)) {
      newExpanded.delete(unitId);
    } else {
      newExpanded.add(unitId);
    }
    setExpandedUnits(newExpanded);
  };

  const handleExport = async () => {
    try {
      const data = await organizationalApi.exportStructure();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = 'organizaciona-struktura.json';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Експорт је успешно креиран');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Грешка при експорту података');
    }
  };

  const getUnitTypeLabel = (type: UnitType): string => {
    const labels = {
      [UnitType.DEPARTMENT]: 'Одсек',
      [UnitType.DIVISION]: 'Одељење',
      [UnitType.SECTOR]: 'Сектор',
      [UnitType.SERVICE]: 'Служба',
      [UnitType.OFFICE]: 'Канцеларија',
      [UnitType.COMMITTEE]: 'Комисија',
      [UnitType.OTHER]: 'Остало'
    };
    return labels[type] || type;
  };

  const getUnitTypeColor = (type: UnitType): string => {
    const colors = {
      [UnitType.DEPARTMENT]: 'bg-blue-100 text-blue-800',
      [UnitType.DIVISION]: 'bg-green-100 text-green-800',
      [UnitType.SECTOR]: 'bg-purple-100 text-purple-800',
      [UnitType.SERVICE]: 'bg-orange-100 text-orange-800',
      [UnitType.OFFICE]: 'bg-gray-100 text-gray-800',
      [UnitType.COMMITTEE]: 'bg-yellow-100 text-yellow-800',
      [UnitType.OTHER]: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const filteredUnits = units.filter(unit =>
    unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderTreeUnit = (unit: OrganizationalUnit, level = 0) => {
    const isExpanded = expandedUnits.has(unit.id);
    const hasChildren = unit.children && unit.children.length > 0;

    return (
      <div key={unit.id} className="space-y-1">
        <div
          className={`flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 border ${
            level === 0 ? 'border-gray-200' : 'border-transparent'
          }`}
          style={{ marginLeft: `${level * 20}px` }}
        >
          {hasChildren ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => toggleExpanded(unit.id)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <div className="w-6" />
          )}

          <Building2 className="h-5 w-5 text-gray-500" />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-gray-900 dark:text-gray-200 truncate">{unit.name}</h3>
              <Badge className={`text-xs ${getUnitTypeColor(unit.type)}`}>
                {getUnitTypeLabel(unit.type)}
              </Badge>
              <span className="text-xs text-gray-500">({unit.code})</span>
            </div>
            {unit.description && (
              <p className="text-sm text-gray-500 truncate">{unit.description}</p>
            )}
            <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
              {unit.managerName && (
                <span className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>{unit.managerName}</span>
                </span>
              )}
              <span className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>{unit.employeeCount} запослених</span>
              </span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEditUnit(unit)}>
                <Edit className="mr-2 h-4 w-4" />
                Уреди
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCreateUnit()}>
                <Plus className="mr-2 h-4 w-4" />
                Додај подјединицу
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDeleteUnit(unit)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Обриши
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {unit.children!.map(child => renderTreeUnit(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderGridUnit = (unit: OrganizationalUnit) => (
    <Card key={unit.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{unit.name}</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge className={`text-xs ${getUnitTypeColor(unit.type)}`}>
                {getUnitTypeLabel(unit.type)}
              </Badge>
              <span className="text-sm text-gray-500">({unit.code})</span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEditUnit(unit)}>
                <Edit className="mr-2 h-4 w-4" />
                Уреди
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDeleteUnit(unit)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Обриши
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {unit.description && (
          <CardDescription>{unit.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {unit.managerName && (
          <div className="flex items-center space-x-2 text-sm">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="font-medium">{unit.managerName}</span>
            {unit.managerTitle && (
              <span className="text-gray-500">- {unit.managerTitle}</span>
            )}
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span>{unit.employeeCount} запослених</span>
          </div>
          
          {unit.phone && (
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span>{unit.phone}</span>
            </div>
          )}
          
          {unit.email && (
            <div className="flex items-center space-x-2 col-span-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="truncate">{unit.email}</span>
            </div>
          )}
          
          {unit.location && (
            <div className="flex items-center space-x-2 col-span-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>{unit.location}</span>
            </div>
          )}
        </div>

        {unit.contacts && unit.contacts.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-400">Контакти:</h4>
            <div className="space-y-1">
              {unit.contacts.slice(0, 2).map(contact => (
                <div key={contact.id} className="text-sm text-gray-600">
                  <span className="font-medium">{contact.name}</span>
                  {contact.title && <span> - {contact.title}</span>}
                </div>
              ))}
              {unit.contacts.length > 2 && (
                <div className="text-xs text-gray-500">
                  +{unit.contacts.length - 2} више контаката
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Navigation */}
        <OrgStructureNav />
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Организациона структура</h1>
            <p className="text-muted-foreground">
              Управљање организационим јединицама и контактима
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <OrgStructureNav />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Организациона структура</h1>
          <p className="text-muted-foreground">
            Управљање организационим јединицама и контактима
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Експорт
          </Button>
          <Button onClick={handleCreateUnit} variant={theme === "light" ? "default" : "secondaryDefault"}>
            <Plus className="mr-2 h-4 w-4" />
            Нова јединица
          </Button>
        </div>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Укупно јединица
              </CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalUnits}</div>
              <p className="text-xs text-muted-foreground">
                {statistics.activeUnits} активних
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Укупно запослених
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalEmployees}</div>
              <p className="text-xs text-muted-foreground">
                Регистровано у систему
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Типови јединица
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.unitsByType.length}</div>
              <p className="text-xs text-muted-foreground">
                Различитих типова
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Просек запослених
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  statistics.totalEmployees && statistics.totalUnits
                    ? Math.round(statistics.totalEmployees / statistics.totalUnits)
                    : "N/A"
                }
              </div>
              <p className="text-xs text-muted-foreground">
                По јединици
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between">
       
        <div className={`relative max-w-sm ${hideSearch ? "invisible" : ""}`}>
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Претражи јединице..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        

        <div className="flex items-center space-x-2">
          <Button
            variant={
              viewMode === 'tree'
                ? (theme === 'light' ? 'default' : 'secondaryDefault')
                : 'outline'
            }
            size="sm"
            onClick={() => 
              {
                setViewMode('tree')
                setHideSearch(true)
              }
            }
          >
            <TreePine className="mr-2 h-4 w-4" />
            Хијерархија
          </Button>
          <Button
            variant={
              viewMode === 'grid'
                ? (theme === 'light' ? 'default' : 'secondaryDefault')
                : 'outline'
            }
            size="sm"
            onClick={() => {
                setViewMode('grid') 
                setHideSearch(false)
              } 
            }
          >
            <Grid3X3 className="mr-2 h-4 w-4" />
            Картице
          </Button>
          <Button
            variant={
              viewMode === 'chart'
                ? (theme === 'light' ? 'default' : 'secondaryDefault')
                : 'outline'
            }
            size="sm"
            onClick={() => {
                setViewMode('chart') 
                setHideSearch(true)
              }
            }
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Графикон
          </Button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'tree' && (
        <Card>
          <CardHeader>
            <CardTitle>Хијерархијски приказ</CardTitle>
            <CardDescription>
              Организациона структура приказана као стабло
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 ">
              {treeUnits && treeUnits.length > 0 ? (
                treeUnits.map(unit => renderTreeUnit(unit))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Building2 className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>Нема креираних организационих јединица</p>
                  <p className="text-sm">Кликните "Нова јединица" да додате прву јединицу</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === 'grid' && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredUnits && filteredUnits.length > 0 ? (
            filteredUnits.map(renderGridUnit)
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              <Building2 className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>Нема организационих јединица</p>
              <p className="text-sm">
                {searchTerm ? 'Нема резултата за претрагу' : 'Кликните "Нова јединица" да додате прву јединицу'}
              </p>
            </div>
          )}
        </div>
      )}

      {viewMode === 'chart' && (
        <Card>
          <CardHeader>
            <CardTitle>Графички приказ</CardTitle>
            <CardDescription>
              Интерактивна организациона шема
            </CardDescription>
          </CardHeader>
          <CardContent>
            {treeUnits && treeUnits.length > 0 ? (
              <OrganizationalChart data={treeUnits} />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Building2 className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <p className="text-lg font-medium">Нема података за приказ</p>
                <p className="text-sm">Додајте организационе јединице да бисте видели графикон</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Unit Form Dialog - Simplified Version */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsFormOpen(false)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-card rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden mx-4">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-lg font-semibold">
                  {selectedUnit ? 'Уреди организациону јединицу' : 'Нова организациона јединица'}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedUnit
                    ? 'Ажурирајте информације о организационој јединици'
                    : 'Додајте нову организациону јединицу у структуру'
                  }
                </p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
              <OrganizationalUnitForm
                unit={selectedUnit}
                units={units}
                onSubmit={handleFormSubmit}
                onCancel={() => setIsFormOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Потврди брисање</DialogTitle>
            <DialogDescription>
              Да ли сте сигурни да желите да обришете организациону јединицу{' '}
              <strong>{unitToDelete?.name}</strong>? Ова акција се не може поништити.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Откажи
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
            >
              Обриши
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}