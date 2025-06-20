// app/(frontend)/layout.tsx
'use client';

import { useState, useEffect } from 'react';
import { Roboto } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from '@/components/frontend/header';
import { Footer } from '@/components/frontend/footer';
import { pagesApi } from '@/lib/api';

const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"] });

interface Page {
  id: number;
  title: string;
  slug: string;
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  const [pages, setPages] = useState<Page[]>([]);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const pagesData = await pagesApi.getPublished();
        setPages(pagesData);
      } catch (error) {
        console.error('Error fetching pages:', error);
        setPages([]);
      }
    };

    fetchPages();
  }, []);

  return (
    <ThemeProvider>
      <div className={`${roboto.className} min-h-screen flex flex-col bg-gray-50`}>
        <Header pages={pages} />
        <main className="flex-1">
          {children}
        </main>
        <Footer pages={pages} />
      </div>
    </ThemeProvider>
  );
}