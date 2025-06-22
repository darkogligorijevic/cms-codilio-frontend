// components/dashboard/organizational-chart.tsx
'use client';

import { useState, useEffect, useRef, JSX } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Users, 
  Phone, 
  Mail, 
  MapPin,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw
} from 'lucide-react';
import { OrganizationalUnit, UnitType } from '@/lib/types';

interface OrganizationalChartProps {
  data: OrganizationalUnit[];
  onUnitClick?: (unit: OrganizationalUnit) => void;
}

interface ChartNode {
  unit: OrganizationalUnit;
  x: number;
  y: number;
  width: number;
  height: number;
  level: number;
  children: ChartNode[];
}

const UNIT_WIDTH = 280;
const UNIT_HEIGHT = 120;
const HORIZONTAL_SPACING = 40;
const VERTICAL_SPACING = 80;

export function OrganizationalChart({ data, onUnitClick }: OrganizationalChartProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedUnit, setSelectedUnit] = useState<OrganizationalUnit | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Early return if no data
  if (!data || data.length === 0) {
    return (
      <div className="relative w-full h-[600px] bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
        <div className="text-center text-gray-500">
          <Building2 className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <p className="text-lg font-medium">Nema podataka za prikaz</p>
          <p className="text-sm">Dodajte organizacione jedinice da biste videli grafikon</p>
        </div>
      </div>
    );
  }

  const getUnitTypeColor = (type: UnitType): string => {
    const colors = {
      [UnitType.DEPARTMENT]: '#3B82F6',
      [UnitType.DIVISION]: '#10B981',
      [UnitType.SECTOR]: '#8B5CF6',
      [UnitType.SERVICE]: '#F59E0B',
      [UnitType.OFFICE]: '#6B7280',
      [UnitType.COMMITTEE]: '#EF4444',
      [UnitType.OTHER]: '#6B7280'
    };
    return colors[type] || '#6B7280';
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

  // Calculate layout positions for nodes
  const calculateLayout = (units: OrganizationalUnit[], level = 0): ChartNode[] => {
    const nodes: ChartNode[] = [];
    let currentX = 0;

    units.forEach((unit, index) => {
      const children = unit.children && unit.children.length > 0 
        ? calculateLayout(unit.children, level + 1) 
        : [];
      
      let nodeWidth = UNIT_WIDTH;
      if (children.length > 0) {
        const childrenWidth = children.reduce((sum, child) => sum + child.width, 0) + 
                             (children.length - 1) * HORIZONTAL_SPACING;
        nodeWidth = Math.max(UNIT_WIDTH, childrenWidth);
      }

      const node: ChartNode = {
        unit,
        x: currentX + nodeWidth / 2 - UNIT_WIDTH / 2,
        y: level * (UNIT_HEIGHT + VERTICAL_SPACING),
        width: nodeWidth,
        height: UNIT_HEIGHT,
        level,
        children
      };

      // Position children relative to parent
      if (children.length > 0) {
        let childX = currentX;
        children.forEach(child => {
          child.x += childX;
          childX += child.width + HORIZONTAL_SPACING;
        });
      }

      nodes.push(node);
      currentX += nodeWidth + HORIZONTAL_SPACING;
    });

    return nodes;
  };

  const allNodes = calculateLayout(data);

  // Calculate total dimensions
  const getTotalDimensions = (nodes: ChartNode[]): { width: number; height: number } => {
    let maxX = 0;
    let maxY = 0;

    const traverse = (nodeList: ChartNode[]) => {
      nodeList.forEach(node => {
        maxX = Math.max(maxX, node.x + UNIT_WIDTH);
        maxY = Math.max(maxY, node.y + UNIT_HEIGHT);
        traverse(node.children);
      });
    };

    traverse(nodes);
    return { width: maxX + 40, height: maxY + 40 };
  };

  const totalDimensions = getTotalDimensions(allNodes);

  // Pan and zoom handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === svgRef.current) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.max(0.2, Math.min(2, prev * delta)));
  };

  const zoomIn = () => setScale(prev => Math.min(2, prev * 1.2));
  const zoomOut = () => setScale(prev => Math.max(0.2, prev / 1.2));
  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const fitToScreen = () => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    const scaleX = containerWidth / totalDimensions.width;
    const scaleY = containerHeight / totalDimensions.height;
    const newScale = Math.min(scaleX, scaleY, 1) * 0.9;
    
    setScale(newScale);
    setPosition({
      x: (containerWidth - totalDimensions.width * newScale) / 2,
      y: (containerHeight - totalDimensions.height * newScale) / 2
    });
  };

  useEffect(() => {
    fitToScreen();
  }, [data]);

  // Render connection lines
  const renderConnections = (nodes: ChartNode[]): JSX.Element[] => {
    const lines: JSX.Element[] = [];

    const traverse = (nodeList: ChartNode[]) => {
      nodeList.forEach(node => {
        node.children.forEach(child => {
          const parentCenterX = node.x + UNIT_WIDTH / 2;
          const parentBottom = node.y + UNIT_HEIGHT;
          const childCenterX = child.x + UNIT_WIDTH / 2;
          const childTop = child.y;

          // Draw L-shaped connection
          const midY = parentBottom + VERTICAL_SPACING / 2;

          lines.push(
            <g key={`connection-${node.unit.id}-${child.unit.id}`}>
              {/* Vertical line from parent */}
              <line
                x1={parentCenterX}
                y1={parentBottom}
                x2={parentCenterX}
                y2={midY}
                stroke="#CBD5E1"
                strokeWidth="2"
              />
              {/* Horizontal line */}
              <line
                x1={parentCenterX}
                y1={midY}
                x2={childCenterX}
                y2={midY}
                stroke="#CBD5E1"
                strokeWidth="2"
              />
              {/* Vertical line to child */}
              <line
                x1={childCenterX}
                y1={midY}
                x2={childCenterX}
                y2={childTop}
                stroke="#CBD5E1"
                strokeWidth="2"
              />
            </g>
          );
        });
        traverse(node.children);
      });
    };

    traverse(nodes);
    return lines;
  };

  // Render unit nodes
  const renderUnits = (nodes: ChartNode[]): JSX.Element[] => {
    const units: JSX.Element[] = [];

    const traverse = (nodeList: ChartNode[]) => {
      nodeList.forEach(node => {
        const isSelected = selectedUnit?.id === node.unit.id;
        const unitColor = getUnitTypeColor(node.unit.type);

        units.push(
          <g key={`unit-${node.unit.id}`}>
            {/* Unit card */}
            <rect
              x={node.x}
              y={node.y}
              width={UNIT_WIDTH}
              height={UNIT_HEIGHT}
              rx="8"
              fill="white"
              stroke={isSelected ? unitColor : "#E2E8F0"}
              strokeWidth={isSelected ? "3" : "1"}
              className="cursor-pointer hover:stroke-gray-400 transition-colors"
              onClick={() => {
                setSelectedUnit(node.unit);
                onUnitClick?.(node.unit);
              }}
            />
            
            {/* Unit header */}
            <rect
              x={node.x}
              y={node.y}
              width={UNIT_WIDTH}
              height="32"
              rx="8"
              fill={unitColor}
              className="cursor-pointer"
              onClick={() => {
                setSelectedUnit(node.unit);
                onUnitClick?.(node.unit);
              }}
            />

            {/* Unit icon */}
            <circle
              cx={node.x + 16}
              cy={node.y + 16}
              r="8"
              fill="white"
              opacity="0.9"
            />

            {/* Unit title */}
            <text
              x={node.x + 32}
              y={node.y + 20}
              fill="white"
              fontSize="14"
              fontWeight="600"
              className="pointer-events-none"
            >
              {node.unit.name.length > 25 
                ? `${node.unit.name.substring(0, 22)}...` 
                : node.unit.name
              }
            </text>

            {/* Unit type badge */}
            <rect
              x={node.x + UNIT_WIDTH - 80}
              y={node.y + 6}
              width="70"
              height="20"
              rx="10"
              fill="white"
              opacity="0.2"
            />
            <text
              x={node.x + UNIT_WIDTH - 45}
              y={node.y + 18}
              fill="white"
              fontSize="10"
              textAnchor="middle"
              className="pointer-events-none"
            >
              {getUnitTypeLabel(node.unit.type)}
            </text>

            {/* Unit code */}
            <text
              x={node.x + 12}
              y={node.y + 50}
              fill="#6B7280"
              fontSize="12"
              fontWeight="500"
              className="pointer-events-none"
            >
              {node.unit.code}
            </text>

            {/* Manager info */}
            {node.unit.managerName && (
              <text
                x={node.x + 12}
                y={node.y + 68}
                fill="#374151"
                fontSize="11"
                className="pointer-events-none"
              >
                👤 {node.unit.managerName.length > 20 
                  ? `${node.unit.managerName.substring(0, 17)}...` 
                  : node.unit.managerName
                }
              </text>
            )}

            {/* Employee count */}
            <text
              x={node.x + 12}
              y={node.y + 86}
              fill="#6B7280"
              fontSize="11"
              className="pointer-events-none"
            >
              👥 {node.unit.employeeCount} zaposlenih
            </text>

            {/* Contact info */}
            {node.unit.phone && (
              <text
                x={node.x + 12}
                y={node.y + 104}
                fill="#6B7280"
                fontSize="10"
                className="pointer-events-none"
              >
                📞 {node.unit.phone.length > 15 
                  ? `${node.unit.phone.substring(0, 12)}...` 
                  : node.unit.phone
                }
              </text>
            )}
          </g>
        );
        traverse(node.children);
      });
    };

    traverse(nodes);
    return units;
  };

  return (
    <div className="relative w-full h-[600px] bg-gray-50 rounded-lg overflow-hidden">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center space-x-2">
        <div className="bg-white rounded-lg shadow-md p-1 flex items-center space-x-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={zoomOut}
            className="h-8 w-8 p-0"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium px-2 min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={zoomIn}
            className="h-8 w-8 p-0"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
        
        <Button
          size="sm"
          variant="outline"
          onClick={fitToScreen}
          className="bg-white"
        >
          <Maximize2 className="mr-2 h-4 w-4" />
          Prilagodi
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          onClick={resetView}
          className="bg-white"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Chart area */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-hidden cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox={`0 0 ${totalDimensions.width} ${totalDimensions.height}`}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
        >
          {/* Grid pattern */}
          <defs>
            <pattern
              id="grid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="#F1F5F9"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="url(#grid)"
          />

          {/* Connection lines */}
          {renderConnections(allNodes)}

          {/* Unit nodes */}
          {renderUnits(allNodes)}
        </svg>
      </div>

      {/* Unit details panel */}
      {selectedUnit && (
        <div className="absolute bottom-4 left-4 z-10">
          <Card className="w-80 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{selectedUnit.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge 
                      className="text-xs"
                      style={{ backgroundColor: getUnitTypeColor(selectedUnit.type) }}
                    >
                      {getUnitTypeLabel(selectedUnit.type)}
                    </Badge>
                    <span className="text-sm text-gray-500">({selectedUnit.code})</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedUnit(null)}
                  className="h-6 w-6 p-0"
                >
                  ×
                </Button>
              </div>

              {selectedUnit.description && (
                <p className="text-sm text-gray-600 mb-3">
                  {selectedUnit.description}
                </p>
              )}

              <div className="space-y-2 text-sm">
                {selectedUnit.managerName && (
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>
                      {selectedUnit.managerName}
                      {selectedUnit.managerTitle && ` - ${selectedUnit.managerTitle}`}
                    </span>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span>{selectedUnit.employeeCount} zaposlenih</span>
                </div>

                {selectedUnit.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{selectedUnit.phone}</span>
                  </div>
                )}

                {selectedUnit.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{selectedUnit.email}</span>
                  </div>
                )}

                {selectedUnit.location && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{selectedUnit.location}</span>
                  </div>
                )}
              </div>

              {selectedUnit.contacts && selectedUnit.contacts.length > 0 && (
                <div className="mt-4 pt-3 border-t">
                  <h4 className="text-sm font-medium mb-2">Kontakti:</h4>
                  <div className="space-y-1">
                    {selectedUnit.contacts.slice(0, 3).map(contact => (
                      <div key={contact.id} className="text-xs text-gray-600">
                        <span className="font-medium">{contact.name}</span>
                        {contact.title && <span> - {contact.title}</span>}
                      </div>
                    ))}
                    {selectedUnit.contacts.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{selectedUnit.contacts.length - 3} više kontakata
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute top-4 left-4 z-10">
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardContent className="p-3">
            <div className="text-xs text-gray-600 space-y-1">
              <p>• Kliknite na jedinicu za detalje</p>
              <p>• Skrolujte za zoom</p>
              <p>• Prevlačite za pomeranje</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}