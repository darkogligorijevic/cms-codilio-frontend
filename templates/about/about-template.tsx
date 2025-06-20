// Templates/About/AboutTemplate.tsx
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Users, MapPin, TrendingUp } from 'lucide-react';
import { Page, Post } from '@/lib/types';
import { PostsSection } from '@/components/frontend/posts-section';

interface AboutTemplateProps {
  page: Page;
  posts: Post[];
  institutionData: {
    name: string;
    citizens: string;
    villages: string;
    area: string;
  };
  settings?: any;
}

export function AboutTemplate({ page, posts, institutionData }: AboutTemplateProps) {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-8">
        <h2 className="text-3xl font-bold text-blue-900 mb-4">О нашој институцији</h2>
        <p className="text-lg text-blue-800">
          Посвећени транспарентности, ефикасности и служењу грађанима
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-primary-dynamic mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900">{institutionData.citizens}</div>
            <div className="text-sm text-gray-600">Грађана</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <MapPin className="h-8 w-8 text-primary-dynamic mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900">{institutionData.villages}</div>
            <div className="text-sm text-gray-600">Насеља</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 text-primary-dynamic mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900">{institutionData.area}</div>
            <div className="text-sm text-gray-600">Површина</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="prose prose-lg max-w-none">
        <div dangerouslySetInnerHTML={{ __html: page?.content || '' }} />
      </div>

      {/* Posts Section */}
      <PostsSection posts={posts} />
    </div>
  );
}