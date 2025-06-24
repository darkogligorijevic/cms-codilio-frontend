// lib/page-provider.tsx - Provider component for hierarchical pages
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { pagesApi } from '@/lib/api';
import type { Page } from '@/lib/types';

interface PageContextType {
  pages: Page[];
  hierarchicalPages: Page[];
  isLoading: boolean;
  refetchPages: () => Promise<void>;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

export function PageProvider({ children }: { children: React.ReactNode }) {
  const [pages, setPages] = useState<Page[]>([]);
  const [hierarchicalPages, setHierarchicalPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPages = async () => {
    try {
      setIsLoading(true);
      const [allPages, hierarchical] = await Promise.all([
        pagesApi.getPublished(),
        pagesApi.getHierarchical()
      ]);
      setPages(allPages);
      setHierarchicalPages(hierarchical);
    } catch (error) {
      console.error('Error fetching pages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const value = {
    pages,
    hierarchicalPages,
    isLoading,
    refetchPages: fetchPages
  };

  return (
    <PageContext.Provider value={value}>
      {children}
    </PageContext.Provider>
  );
}

export function usePages() {
  const context = useContext(PageContext);
  if (context === undefined) {
    throw new Error('usePages must be used within a PageProvider');
  }
  return context;
}

// Server-side function to get pages for SSR/SSG
export async function getHierarchicalPages(): Promise<Page[]> {
  try {
    const pages = await pagesApi.getHierarchical();
    return pages;
  } catch (error) {
    console.error('Error fetching hierarchical pages:', error);
    return [];
  }
}

export async function getPublishedPages(): Promise<Page[]> {
  try {
    const pages = await pagesApi.getPublished();
    return pages;
  } catch (error) {
    console.error('Error fetching published pages:', error);
    return [];
  }
}