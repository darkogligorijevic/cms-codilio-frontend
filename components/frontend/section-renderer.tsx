// components/frontend/section-renderer.tsx
'use client';

import { PageSection, SectionType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { HeroStackSection } from '@/components/frontend/sections/hero/hero-stack';
import { HeroLeftSection } from '@/components/frontend/sections/hero/hero-left';
import { CustomHTMLSection } from '@/components/frontend/sections/custom-html-section';
import { CardTopSection } from '@/components/frontend/sections/card/top-card';
import { ContactOneSection } from '@/components/frontend/sections/contact/contact-one';
import { HeroImageSection } from '@/components/frontend/sections/hero/image-hero';
import { HeroVideoSection } from '@/components/frontend/sections/hero/video-hero';
import { CardBottomSection } from '@/components/frontend/sections/card/bottom-card';
import { CardLeftSection } from '@/components/frontend/sections/card/left-card';
import { CardRightSection } from '@/components/frontend/sections/card/right-card';
import { ContactTwoSection } from '@/components/frontend/sections/contact/contact-two';
import { CTAOneSection } from '@/components/frontend/sections/cta/cta-one';
import { LogosOneSection } from '@/components/frontend/sections/logos/logos-one';
import { TeamOneSection } from '@/components/frontend/sections/team/team-one';

interface SectionRendererProps {
  section: PageSection;
  className?: string;
}

export function SectionRenderer({ section, className }: SectionRendererProps) {
  if (!section.isVisible) {
    return null;
  }

  // Check if this is a hero section that handles its own spacing
  const isFullHeightSection = [
    SectionType.HERO_IMAGE,
    SectionType.HERO_VIDEO,
    SectionType.HERO_STACK,
    SectionType.HERO_LEFT
  ].includes(section.type);

  // Get layout classes based on section data
  const getLayoutClasses = () => {
    const classes = [];
    
    // Layout width
    switch (section.data.layout) {
      case 'full-width':
        classes.push('w-full');
        break;
      case 'contained':
      default:
        classes.push('max-w-7xl mx-auto');
        break;
    }

    // Height - only apply to hero sections
    if (isFullHeightSection && section.data.height) {
      switch (section.data.height) {
        case '100%':
          classes.push('min-h-screen');
          break;
        case '75%':
          classes.push('min-h-[75vh]');
          break;
        case '50%':
          classes.push('min-h-[50vh]');
          break;
        case '25%':
          classes.push('min-h-[25vh]');
          break;
        default:
          // Default height for hero sections if no height specified
          classes.push('min-h-[60vh]');
          break;
      }
    }
    
    return classes.join(' ');
  };

  const getInlineStyles = () => {
    const styles: React.CSSProperties = {};
    
    // Apply background color to THIS section only
    if (section.data.backgroundColor) {
      styles.backgroundColor = section.data.backgroundColor;
    }
    
    if (section.data.textColor) {
      styles.color = section.data.textColor;
    }

    if (section.data.backgroundImage) {
      styles.backgroundImage = `url(${section.data.backgroundImage})`;
      styles.backgroundSize = 'cover';
      styles.backgroundPosition = 'center';
      styles.backgroundRepeat = 'no-repeat';
    }

    return styles;
  };

  const renderSectionContent = () => {
    const commonProps = {
      data: section.data,
      className: 'w-full'
    };

    switch (section.type) {
      case SectionType.HERO_STACK:
        return <HeroStackSection {...commonProps} />;
      case SectionType.HERO_LEFT:
        return <HeroLeftSection {...commonProps} />;
      case SectionType.CUSTOM_HTML:
        return <CustomHTMLSection {...commonProps} />;
      case SectionType.CARD_TOP:
        return <CardTopSection {...commonProps} />;
      case SectionType.CONTACT_ONE:
        return <ContactOneSection {...commonProps} />;
      case SectionType.HERO_IMAGE:
        return <HeroImageSection {...commonProps} />;
      case SectionType.HERO_VIDEO:
        return <HeroVideoSection {...commonProps} />;
      case SectionType.CARD_BOTTOM:
        return <CardBottomSection {...commonProps} />;
      case SectionType.CARD_LEFT:
        return <CardLeftSection {...commonProps} />;
      case SectionType.CARD_RIGHT:
        return <CardRightSection {...commonProps} />;
      case SectionType.CONTACT_TWO:
        return <ContactTwoSection {...commonProps} />;
      case SectionType.CTA_ONE:
        return <CTAOneSection {...commonProps} />;
      case SectionType.LOGOS_ONE:
        return <LogosOneSection {...commonProps} />;
      case SectionType.TEAM_ONE:
        return <TeamOneSection {...commonProps} />;
      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">Непознат тип секције: {section.type}</p>
          </div>
        );
    }
  };

  return (
    <section
      className={cn(
        'relative',
        // Only apply py-16 to non-hero sections
        !isFullHeightSection && 'py-12 lg:py-16',
        getLayoutClasses(),
        section.cssClasses,
        className
      )}
      style={getInlineStyles()}
      data-section-id={section.id}
      data-section-type={section.type}
    >
      {renderSectionContent()}
    </section>
  );
}

// Page Builder Renderer - renders all sections for a page
interface PageBuilderRendererProps {
  sections: PageSection[];
  className?: string;
}

export function PageBuilderRenderer({ sections, className }: PageBuilderRendererProps) {

  const visibleSections = sections
    .filter(section => section.isVisible)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (visibleSections.length === 0) {
    return (
      <div className={cn('text-center py-16', className)}>
        <p className="text-gray-500">Нема секција за приказ на овој страници.</p>
      </div>
    );
  }

  return (
    <div className={cn(className)}>
      {visibleSections.map((section) => (
        <SectionRenderer 
          key={section.id} 
          section={section}
        />
      ))}
    </div>
  );
}