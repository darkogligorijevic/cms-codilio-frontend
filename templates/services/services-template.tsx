// Templates/Services/ServicesTemplate.tsx
'use client';

import { Page, Post } from '@/lib/types';
import { PostsSection } from '@/components/frontend/posts-section';

interface ServicesTemplateProps {
  page: Page;
  posts: Post[];
  institutionData?: any;
  settings?: any;
}

export function ServicesTemplate({ page, posts }: ServicesTemplateProps) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Услуге за грађане</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Пружамо широк спектар услуга за наше грађане. Све услуге можете обавити лично или онлајн.
        </p>
      </div>

      {/* Main Content from CMS */}
      <div className="prose prose-lg max-w-none">
        <div dangerouslySetInnerHTML={{ __html: page?.content || '' }} />
      </div>

      {/* Posts Section */}
      <PostsSection posts={posts} />
    </div>
  );
}