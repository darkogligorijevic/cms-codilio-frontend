// app/(frontend)/layout.tsx - Fixed version
'use client';

import { useState, useEffect } from 'react';
import { Roboto } from "next/font/google";
import { Header } from '@/components/frontend/header';
import { Footer } from '@/components/frontend/footer';
import { pagesApi } from '@/lib/api';
import type { Page } from '@/lib/types'; // Import the correct type

const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"] });

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  const [pages, setPages] = useState<Page[]>([]); // Use the imported Page type

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
    <div className={`${roboto.className} min-h-screen flex flex-col`}>
      <Header pages={pages} />
      <main className="flex-1">
        {children}
      </main>
      <Footer pages={pages} />
    </div>
  );
}