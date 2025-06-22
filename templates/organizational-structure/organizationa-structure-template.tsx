// templates/organizational-structure/organizational-structure-template.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Building2,
  Users,
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  ChevronRight,
  Search,
  User,
  Filter,
  Grid3X3,
  List,
  Building,
  X,
  BarChart3,
  TreePine
} from 'lucide-react';
import { Page, Post, OrganizationalUnit, UnitType } from '@/lib/types';
import { PostsSection } from '@/components/frontend/posts-section';
import { organizationalApi } from '@/lib/api';
import { OrganizationalChart } from '@/components/dashboard/organizational-chart';

interface OrganizationalStructureTemplateProps {
  page: Page;
  posts: Post[];
  institutionData?: any;
  settings?: any;
}

type ViewMode = 'tree' | 'grid' | 'chart';

export function OrganizationalStructureTemplate({ 
  page, 
  posts 
}: OrganizationalStructureTemplateProps) {
  const [units, setUnits] = useState<OrganizationalUnit[]>([]);
  const [treeUnits, setTreeUnits] = useState<OrganizationalUnit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('tree');
  const [expandedUnits, setExpandedUnits] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<UnitType | 'all'>('all');
  const [selectedUnit, setSelectedUnit] = useState<OrganizationalUnit | null>(null);

  useEffect(() => {
    fetchUnits();
  }, []);

  // Auto-expand all units on first load
  useEffect(() => {
    if (treeUnits.length > 0 && expandedUnits.size === 0) {
      const allIds = new Set<number>();
      const collectIds = (units: OrganizationalUnit[]) => {
        units.forEach(unit => {
          allIds.add(unit.id);
          if (unit.children && unit.children.length > 0) {
            collectIds(unit.children);
          }
        });
      };
      collectIds(treeUnits);
      setExpandedUnits(allIds);
    }
  }, [treeUnits]);

  const fetchUnits = async () => {
    try {
      setIsLoading(true);
      const [allUnits, treeData] = await Promise.all([
        organizationalApi.getAll(),
        organizationalApi.getTree()
      ]);
      
      setUnits(allUnits);
      setTreeUnits(treeData);
    } catch (error) {
      console.error('Error fetching organizational units:', error);
    } finally {
      setIsLoading(false);
    }
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

  const expandAll = () => {
    const allIds = new Set<number>();
    const collectIds = (units: OrganizationalUnit[]) => {
      units.forEach(unit => {
        allIds.add(unit.id);
        if (unit.children && unit.children.length > 0) {
          collectIds(unit.children);
        }
      });
    };
    collectIds(treeUnits);
    setExpandedUnits(allIds);
  };

  const collapseAll = () => {
    setExpandedUnits(new Set());
  };

  const getUnitTypeLabel = (type: UnitType): string => {
    const labels = {
      [UnitType.DEPARTMENT]: 'Odsek',
      [UnitType.DIVISION]: 'Odeljenje',
      [UnitType.SECTOR]: 'Sektor',
      [UnitType.SERVICE]: 'Služba',
      [UnitType.OFFICE]: 'Kancelarija',
      [UnitType.COMMITTEE]: 'Komisija',
      [UnitType.OTHER]: 'Ostalo'
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

  const filteredUnits = units.filter(unit => {
    const matchesSearch = searchTerm === '' || 
      unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.managerName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || unit.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const renderTreeUnit = (unit: OrganizationalUnit, level = 0) => {
    const isExpanded = expandedUnits.has(unit.id);
    const hasChildren = unit.children && unit.children.length > 0;
    const matchesFilter = filteredUnits.some(u => u.id === unit.id);

    // If unit doesn't match filter and no children match, don't render
    if (!matchesFilter && !hasChildren) {
      return null;
    }

    return (
      <div key={unit.id} className="mb-2">
        <Card 
          className={`transition-all duration-200 hover:shadow-md cursor-pointer ${
            selectedUnit?.id === unit.id ? 'ring-2 ring-blue-500 border-blue-200' : ''
          }`}
          onClick={() => setSelectedUnit(selectedUnit?.id === unit.id ? null : unit)}
        >
          <CardContent className="p-4">
            <div 
              className="flex items-center space-x-3"
              style={{ marginLeft: `${level * 20}px` }}
            >
              {/* Expand/Collapse Button */}
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpanded(unit.id);
                  }}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              )}
              {!hasChildren && <div className="w-6" />}

              {/* Unit Icon */}
              <Building2 className="h-5 w-5 text-gray-500 flex-shrink-0" />
              
              {/* Unit Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {unit.name}
                  </h3>
                  <Badge className={`text-xs ${getUnitTypeColor(unit.type)}`}>
                    {getUnitTypeLabel(unit.type)}
                  </Badge>
                  <span className="text-xs text-gray-500">({unit.code})</span>
                </div>
                
                {unit.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {unit.description}
                  </p>
                )}
                
                {/* Basic Info */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                  {unit.managerName && (
                    <span className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>{unit.managerName}</span>
                    </span>
                  )}
                  <span className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>{unit.employeeCount} zaposlenih</span>
                  </span>
                  {unit.phone && (
                    <span className="flex items-center space-x-1">
                      <Phone className="h-3 w-3" />
                      <span>{unit.phone}</span>
                    </span>
                  )}
                  {unit.location && (
                    <span className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{unit.location}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {selectedUnit?.id === unit.id && (
              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Contact Details */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Kontakt informacije</h4>
                    <div className="space-y-2 text-sm">
                      {unit.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <a 
                            href={`mailto:${unit.email}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {unit.email}
                          </a>
                        </div>
                      )}
                      {unit.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <a 
                            href={`tel:${unit.phone}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {unit.phone}
                          </a>
                        </div>
                      )}
                      {unit.location && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">{unit.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Manager Details */}
                  {unit.managerName && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Rukovodstvo</h4>
                      <div className="space-y-1 text-sm">
                        <div className="font-medium">{unit.managerName}</div>
                        {unit.managerTitle && (
                          <div className="text-gray-600">{unit.managerTitle}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Contacts */}
                {unit.contacts && unit.contacts.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Kontakt osobe</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {unit.contacts.map(contact => (
                        <div key={contact.id} className="text-sm">
                          <div className="font-medium">{contact.name}</div>
                          <div className="text-gray-600">{contact.title}</div>
                          {contact.phone && (
                            <div className="text-blue-600">{contact.phone}</div>
                          )}
                          {contact.email && (
                            <div className="text-blue-600">{contact.email}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Render Children */}
        {hasChildren && isExpanded && (
          <div className="ml-4 mt-2 space-y-2">
            {unit.children!.map(child => renderTreeUnit(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderGridUnit = (unit: OrganizationalUnit) => (
    <Card key={unit.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold text-gray-900">{unit.name}</h3>
              <div className="flex items-center space-x-2">
                <Badge className={`text-xs ${getUnitTypeColor(unit.type)}`}>
                  {getUnitTypeLabel(unit.type)}
                </Badge>
                <span className="text-sm text-gray-500">({unit.code})</span>
              </div>
            </div>
          </div>
          
          {unit.description && (
            <p className="text-sm text-gray-600 line-clamp-3">
              {unit.description}
            </p>
          )}
          
          <div className="space-y-2 text-sm">
            {unit.managerName && (
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="font-medium">{unit.managerName}</span>
                {unit.managerTitle && (
                  <span className="text-gray-500">- {unit.managerTitle}</span>
                )}
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-400" />
              <span>{unit.employeeCount} zaposlenih</span>
            </div>
            
            {unit.phone && (
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{unit.phone}</span>
              </div>
            )}
            
            {unit.email && (
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="truncate">{unit.email}</span>
              </div>
            )}
            
            {unit.location && (
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>{unit.location}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Организациона структура</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Преглед организационе структуре наше институције, организационих јединица и контакт информација
        </p>
      </div>

      {/* CMS Content */}
      {page?.content && (
        <div className="prose prose-lg max-w-none">
          <div dangerouslySetInnerHTML={{ __html: page.content }} />
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Претражи јединице..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as UnitType | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">Сви типови</option>
            <option value={UnitType.DEPARTMENT}>Одсек</option>
            <option value={UnitType.DIVISION}>Одељење</option>
            <option value={UnitType.SECTOR}>Сектор</option>
            <option value={UnitType.SERVICE}>Служба</option>
            <option value={UnitType.OFFICE}>Канцеларија</option>
            <option value={UnitType.COMMITTEE}>Комисија</option>
            <option value={UnitType.OTHER}>Остало</option>
          </select>

          {(searchTerm || selectedType !== 'all') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setSelectedType('all');
              }}
            >
              <X className="h-4 w-4 mr-1" />
              Очисти
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {viewMode === 'tree' && (
            <>
              <Button variant="outline" size="sm" onClick={expandAll}>
                Прошири све
              </Button>
              <Button variant="outline" size="sm" onClick={collapseAll}>
                Сакриј све
              </Button>
            </>
          )}
          
          <Button
            variant={viewMode === 'tree' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('tree')}
          >
            <TreePine className="h-4 w-4 mr-1" />
            Стабло
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4 mr-1" />
            Картице
          </Button>
          <Button
            variant={viewMode === 'chart' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('chart')}
          >
            <BarChart3 className="h-4 w-4 mr-1" />
            Графикон
          </Button>
        </div>
      </div>

      {/* Units Display */}
      {units.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Нема организационих јединица
            </h3>
            <p className="text-gray-500">
              Организациона структура још увек није дефинисана.
            </p>
          </CardContent>
        </Card>
      ) : viewMode === 'tree' ? (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              {treeUnits.map(unit => renderTreeUnit(unit))}
            </div>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredUnits.map(renderGridUnit)}
        </div>
      ) : viewMode === 'chart' ? (
        <Card>
          <CardContent className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Интерактивни графикон</h3>
              <p className="text-sm text-gray-600">
                Кликните на јединицу за детаље • Превлачите за пребацивање • Скролујте за зум
              </p>
            </div>
            {treeUnits && treeUnits.length > 0 ? (
              <OrganizationalChart data={treeUnits} />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Building className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <p className="text-lg font-medium">Нема података за приказ</p>
                <p className="text-sm">Организациона структура још увек није дефинисана</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* No results message */}
      {units.length > 0 && filteredUnits.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="mx-auto h-8 w-8 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Нема резултата
            </h3>
            <p className="text-gray-500">
              Нема јединица које одговарају критеријумима претраге.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      {units.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Статистике</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{units.length}</div>
                <div className="text-sm text-gray-600">Укупно јединица</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {units.reduce((sum, unit) => sum + unit.employeeCount, 0)}
                </div>
                <div className="text-sm text-gray-600">Укупно запослених</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {new Set(units.map(unit => unit.type)).size}
                </div>
                <div className="text-sm text-gray-600">Типова јединица</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {units.filter(unit => unit.managerName).length}
                </div>
                <div className="text-sm text-gray-600">Са руководиоцима</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts Section */}
      <PostsSection posts={posts} />
    </div>
  );
}