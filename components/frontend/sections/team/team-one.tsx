// components/frontend/sections/team/team-one.tsx
import { SectionData } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface TeamOneSectionProps {
  data: SectionData;
  className?: string;
}

export function TeamOneSection({ data, className }: TeamOneSectionProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <section className={cn('', className)}>
      <div className="space-y-12">
        {/* Section Header */}
        {(data.title || data.description) && (
          <div className="text-center space-y-4">
            {data.title && (
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                {data.title}
              </h2>
            )}
            
            {data.description && (
              <p className="text-lg text-gray-700 dark:text-gray-200 max-w-3xl mx-auto">
                {data.description}
              </p>
            )}
          </div>
        )}

        {/* Team Members Grid */}
        {data.teamMembers && data.teamMembers.length > 0 && (
          <div className={`grid md:grid-cols-${data.teamMembers.length < 5 ? data.teamMembers.length : '3'} grid-cols-1 gap-8 md:gap-16`}>
            {data.teamMembers.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Avatar */}
                    <div className="flex justify-center">
                      <Avatar className="w-24 h-24">
                        <AvatarImage 
                          src={member.image} 
                          alt={member.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    {/* Name */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {member.name}
                      </h3>
                      
                      {/* Position */}
                      {member.position && (
                        <p className="text-primary font-medium mt-1">
                          {member.position}
                        </p>
                      )}
                    </div>

                    {/* Bio */}
                    {member.bio && (
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                        {member.bio}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Alternative Layout: Larger cards for smaller teams */}
        
      </div>
    </section>
  );
}