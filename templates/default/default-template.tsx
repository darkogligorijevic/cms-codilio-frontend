// Templates/Default/DefaultTemplate.tsx
'use client';

import { Page, Post } from '@/lib/types';
import { PostsSection } from '@/components/frontend/posts-section';

interface DefaultTemplateProps {
  page: Page;
  posts: Post[];
}

export function DefaultTemplate({ page, posts }: DefaultTemplateProps) {
  return (
    <div className="space-y-8">
      <div className="prose prose-lg max-w-none">
        <div dangerouslySetInnerHTML={{ __html: page?.content || '' }} />
      </div>

      {/* Posts Section */}
      <PostsSection posts={posts} />
    </div>
  );
}