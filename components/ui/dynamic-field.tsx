// components/ui/dynamic-field.tsx - FIXED VERSION
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MediaPicker } from '@/components/ui/media-picker';
import { 
  ImageIcon, 
  X, 
  Plus, 
  Trash2 
} from 'lucide-react';
import { FieldConfig, ArrayFieldConfig, ObjectFieldConfig, SelectFieldConfig } from '@/lib/types';
import { categoriesApi } from '@/lib/api';

interface DynamicFieldProps {
  field: FieldConfig;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

// Separate CategorySelect component to avoid hook issues
function CategorySelect({ value, onChange, error }: { 
  value: any; 
  onChange: (value: any) => void; 
  error?: string 
}) {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        console.log('🔄 Fetching categories for selection...');
        
        // Try the selection endpoint first
        let data;
        try {
          data = await categoriesApi.getAllForSelection();
          console.log('✅ Categories for selection:', data);
        } catch (selectionError) {
          console.warn('⚠️ Selection endpoint failed, trying fallback:', selectionError);
          
          // Fallback to basic categories
          const basicCategories = await categoriesApi.getAll();
          data = basicCategories.map(cat => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            postsCount: cat.posts?.length || 0
          }));
          console.log('✅ Fallback categories:', data);
        }

        if (isMounted) {
          setCategories(data || []);
        }
      } catch (error) {
        console.error('❌ Error fetching categories:', error);
        if (isMounted) {
          setCategories([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>Категорија објава <span className="text-red-500">*</span></Label>
        <div className="h-10 bg-gray-100 rounded animate-pulse flex items-center px-3">
          <span className="text-sm text-gray-500">Учитавање категорија...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>Категорија објава <span className="text-red-500">*</span></Label>
      <Select value={value || ''} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Изаберите категорију..." />
        </SelectTrigger>
        <SelectContent>
          {categories.length === 0 ? (
            <SelectItem value="" disabled>
              Нема доступних категорија
            </SelectItem>
          ) : (
            categories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                <div className="flex items-center justify-between w-full">
                  <span>{category.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    ({category.postsCount} објав)
                  </span>
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {categories.length === 0 && (
        <p className="text-xs text-yellow-600">
          Нема категорија. Прво креирајте категорије у Dashboard → Категорије.
        </p>
      )}
    </div>
  );
}

export function DynamicField({ field, value, onChange, error }: DynamicFieldProps) {
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  switch (field.type) {
    case 'text':
    case 'email':
      return (
        <div className="space-y-2">
          <Label>{field.label} {field.required && <span className="text-red-500">*</span>}</Label>
          <Input
            type={field.type}
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      );

    case 'textarea':
      return (
        <div className="space-y-2">
          <Label>{field.label} {field.required && <span className="text-red-500">*</span>}</Label>
          <Textarea
            placeholder={field.placeholder}
            rows={field.rows || 4}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      );

    case 'select':
      const selectField = field as SelectFieldConfig;
      return (
        <div className="space-y-2">
          <Label>{field.label} {field.required && <span className="text-red-500">*</span>}</Label>
          <Select value={value || ''} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue placeholder={`Izaberite ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {selectField.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      );

    case 'image':
      return (
        <div className="space-y-2">
          <Label>{field.label} {field.required && <span className="text-red-500">*</span>}</Label>
          <div className="flex items-center space-x-2">
            {value && (
              <img src={value} alt="Preview" className="w-20 h-20 object-cover rounded" />
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsMediaPickerOpen(true)}
            >
              <ImageIcon className="mr-2 h-4 w-4" />
              {value ? 'Promeni sliku' : 'Izaberi sliku'}
            </Button>
            {value && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <MediaPicker
            isOpen={isMediaPickerOpen}
            onClose={() => setIsMediaPickerOpen(false)}
            onSelect={onChange}
            allowedTypes={['image/*']}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      );

    case 'code':
      return (
        <div className="space-y-2">
          <Label>{field.label} {field.required && <span className="text-red-500">*</span>}</Label>
          <Textarea
            placeholder={field.placeholder}
            rows={field.rows || 8}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="font-mono text-sm"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      );

    case 'array':
      return <ArrayField field={field as ArrayFieldConfig} value={value || []} onChange={onChange} error={error} />;

    case 'object':
      return <ObjectField field={field as ObjectFieldConfig} value={value || {}} onChange={onChange} error={error} />;

    case 'categorySelect':
      console.log('🎯 Rendering CategorySelect with value:', value);
      return <CategorySelect value={value} onChange={onChange} error={error} />;

    default:
      return null;
  }
}

// Array Field Component
interface ArrayFieldProps {
  field: ArrayFieldConfig;
  value: any[];
  onChange: (value: any[]) => void;
  error?: string;
}

function ArrayField({ field, value, onChange, error }: ArrayFieldProps) {
  const addItem = () => {
    const newItem: any = {};
    // Initialize with empty values based on schema
    if (field.itemSchema) {
      Object.keys(field.itemSchema).forEach(key => {
        newItem[key] = '';
      });
    }
    onChange([...value, newItem]);
  };

  const removeItem = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, key: string, itemValue: any) => {
    const newValue = [...value];
    newValue[index] = { ...newValue[index], [key]: itemValue };
    onChange(newValue);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>{field.label} {field.required && <span className="text-red-500">*</span>}</Label>
        <Button type="button" variant="outline" size="sm" onClick={addItem}>
          <Plus className="mr-2 h-4 w-4" />
          Dodaj {field.label.toLowerCase()}
        </Button>
      </div>
      
      {value.map((item, index) => (
        <div key={index} className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h5 className="font-medium">{field.label} {index + 1}</h5>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeItem(index)}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          
          {field.itemSchema && Object.entries(field.itemSchema).map(([key, schemaField]) => (
            <DynamicField
              key={key}
              field={schemaField}
              value={item[key]}
              onChange={(itemValue) => updateItem(index, key, itemValue)}
            />
          ))}
        </div>
      ))}
      
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

// Object Field Component
interface ObjectFieldProps {
  field: ObjectFieldConfig;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

function ObjectField({ field, value, onChange, error }: ObjectFieldProps) {
  const updateProperty = (key: string, propertyValue: any) => {
    onChange({ ...value, [key]: propertyValue });
  };

  return (
    <div className="space-y-4">
      <Label>{field.label} {field.required && <span className="text-red-500">*</span>}</Label>
      
      <div className="border rounded-lg p-4 space-y-4">
        {field.schema && Object.entries(field.schema).map(([key, schemaField]) => (
          <DynamicField
            key={key}
            field={schemaField}
            value={value[key]}
            onChange={(propertyValue) => updateProperty(key, propertyValue)}
          />
        ))}
      </div>
      
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}