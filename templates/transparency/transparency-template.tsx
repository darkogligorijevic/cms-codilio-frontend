// Templates/Transparency/TransparencyTemplate.tsx
'use client';

import { Page, Post } from '@/lib/types';
import { PostsSection } from '@/components/frontend/posts-section';

interface TransparencyTemplateProps {
  page: Page;
  posts: Post[];
}

export function TransparencyTemplate({ page, posts }: TransparencyTemplateProps) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Транспарентност</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Приступ информацијама од јавног значаја - наша обавеза према грађанима
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