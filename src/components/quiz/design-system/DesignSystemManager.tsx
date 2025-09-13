import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { AdvancedThemeEditor } from './AdvancedThemeEditor';
import { LayoutManager } from './LayoutManager';
import { BrandingManager } from './BrandingManager';
import { AnimationLibrary } from './AnimationLibrary';
import { VideoBackground } from './VideoBackground';
import { ConfettiSystem } from './ConfettiSystem';
import { QuizTheme } from '@/types/quiz';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Palette, 
  Layout, 
  Image, 
  Sparkles,
  Monitor,
  Smartphone
} from 'lucide-react';

interface DesignSystemManagerProps {
  theme: QuizTheme;
  onUpdate: (theme: QuizTheme) => void;
  quizId: string;
}

export function DesignSystemManager({ theme, onUpdate, quizId }: DesignSystemManagerProps) {
  const isMobile = useIsMobile();
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Converter QuizTheme para ThemeConfig
  const themeConfigFromQuizTheme = (quizTheme: QuizTheme) => ({
    colors: {
      primary: quizTheme.primary || 'hsl(217, 91%, 46%)',
      secondary: quizTheme.accent || 'hsl(217, 91%, 56%)',
      accent: quizTheme.accent || 'hsl(217, 91%, 66%)',
      background: quizTheme.background || 'hsl(0, 0%, 100%)',
      foreground: quizTheme.text || 'hsl(222, 84%, 5%)',
      card: quizTheme.cardBackground || 'hsl(0, 0%, 100%)',
      muted: 'hsl(210, 40%, 98%)',
    },
    fonts: {
      primary: quizTheme.fontFamily || 'Inter',
      secondary: quizTheme.fontFamily || 'Inter',
      size: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 32,
      },
    },
    layout: {
      style: (quizTheme.layout as any) || 'card',
      maxWidth: quizTheme.maxWidth || 'medium',
      padding: 16,
      spacing: 16,
    },
    visual: {
      borderRadius: parseInt(quizTheme.borderRadius?.replace('px', '') || '8'),
      shadows: true,
      animations: true,
      gradient: quizTheme.backgroundGradient || 'linear-gradient(135deg, hsl(217, 91%, 46%), hsl(217, 91%, 56%))',
      backgroundType: (quizTheme.useVideoBackground ? 'video' : quizTheme.useBackgroundGradient ? 'gradient' : 'solid') as any,
      backgroundMedia: quizTheme.videoBackgroundUrl,
    },
    branding: {
      logo: quizTheme.logo,
      logoPosition: (quizTheme.logoPosition as any) || 'top-left',
      showWatermark: quizTheme.showWatermark || false,
      favicon: quizTheme.favicon,
    },
  });

  // Converter BrandingConfig
  const brandingConfigFromQuizTheme = (quizTheme: QuizTheme) => ({
    logo: {
      file: quizTheme.logo,
      position: (quizTheme.logoPosition as any) || 'top-left',
      size: (quizTheme.logoSize as any) || 'md',
      showText: true,
      text: quizTheme.brandName || '',
    },
    watermark: {
      enabled: quizTheme.showWatermark || false,
      text: quizTheme.brandName || '',
      position: (quizTheme.watermarkPosition as any) || 'bottom-right',
      opacity: parseInt(quizTheme.watermarkOpacity || '50'),
    },
    favicon: {
      file: quizTheme.favicon,
      generated: false,
    },
    social: {
      title: quizTheme.socialTitle || '',
      description: quizTheme.socialDescription || '',
      image: quizTheme.socialImage,
      twitterCard: 'summary_large_image' as any,
      ogType: 'website' as any,
    },
    seo: {
      title: quizTheme.socialTitle || '',
      description: quizTheme.socialDescription || '',
      keywords: [],
      robots: 'index,follow',
    },
    customDomain: {
      enabled: false,
    },
  });

  const handleThemeUpdate = (newConfig: any) => {
    // Converter de volta para QuizTheme
    const updatedTheme: QuizTheme = {
      ...theme,
      primary: newConfig.colors?.primary || theme.primary,
      accent: newConfig.colors?.accent || theme.accent,
      background: newConfig.colors?.background || theme.background,
      text: newConfig.colors?.foreground || theme.text,
      cardBackground: newConfig.colors?.card || theme.cardBackground,
      fontFamily: newConfig.fonts?.primary || theme.fontFamily,
      layout: newConfig.layout?.style || theme.layout,
      maxWidth: newConfig.layout?.maxWidth || theme.maxWidth,
      gradient: newConfig.visual?.gradient || theme.gradient,
    };
    onUpdate(updatedTheme);
  };

  const handleBrandingUpdate = (brandingConfig: any) => {
    const updatedTheme: QuizTheme = {
      ...theme,
      logo: brandingConfig.logo?.file || theme.logo,
      logoPosition: brandingConfig.logo?.position || theme.logoPosition,
      logoSize: brandingConfig.logo?.size || theme.logoSize,
      brandName: brandingConfig.logo?.text || theme.brandName,
      showWatermark: brandingConfig.watermark?.enabled || theme.showWatermark,
      watermarkPosition: brandingConfig.watermark?.position || theme.watermarkPosition,
      watermarkOpacity: brandingConfig.watermark?.opacity?.toString() || theme.watermarkOpacity,
      favicon: brandingConfig.favicon?.file || theme.favicon,
      socialTitle: brandingConfig.social?.title || theme.socialTitle,
      socialDescription: brandingConfig.social?.description || theme.socialDescription,
      socialImage: brandingConfig.social?.image || theme.socialImage,
    };
    onUpdate(updatedTheme);
  };

  return (
    <div className="h-full flex flex-col">
      <div className={`flex items-center justify-between p-4 border-b ${isMobile ? 'p-2' : 'p-4'}`}>
        <div className="flex items-center gap-2">
          <Palette className={`text-primary ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
          <h2 className={`font-semibold ${isMobile ? 'text-base' : 'text-lg'}`}>
            {isMobile ? 'Design' : 'Sistema de Design'}
          </h2>
        </div>
        
        {!isMobile && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewMode('desktop')}
              className={`p-2 rounded-md transition-colors ${
                previewMode === 'desktop' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted'
              }`}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPreviewMode('mobile')}
              className={`p-2 rounded-md transition-colors ${
                previewMode === 'mobile' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted'
              }`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="theme" className="h-full flex flex-col">
          <TabsList className={`grid w-full grid-cols-6 ${isMobile ? 'mx-2 mt-2' : 'mx-4 mt-4'}`}>
            <TabsTrigger value="theme" className={`${isMobile ? 'gap-1 text-xs px-2' : 'gap-2'}`}>
              <Palette className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
              {!isMobile && 'Tema'}
            </TabsTrigger>
            <TabsTrigger value="layout" className={`${isMobile ? 'gap-1 text-xs px-2' : 'gap-2'}`}>
              <Layout className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
              {!isMobile && 'Layout'}
            </TabsTrigger>
            <TabsTrigger value="branding" className={`${isMobile ? 'gap-1 text-xs px-2' : 'gap-2'}`}>
              <Image className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
              {!isMobile && 'Branding'}
            </TabsTrigger>
            <TabsTrigger value="effects" className={`${isMobile ? 'gap-1 text-xs px-2' : 'gap-2'}`}>
              <Sparkles className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
              {!isMobile && 'Efeitos'}
            </TabsTrigger>
            <TabsTrigger value="animations" className={`${isMobile ? 'gap-1 text-xs px-2' : 'gap-2'}`}>
              <Sparkles className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
              {!isMobile && 'Animações'}
            </TabsTrigger>
            <TabsTrigger value="confetti" className={`${isMobile ? 'gap-1 text-xs px-2' : 'gap-2'}`}>
              <Sparkles className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
              {!isMobile && 'Confete'}
            </TabsTrigger>
          </TabsList>

          <div className={`flex-1 overflow-auto ${isMobile ? 'p-2' : 'p-4'}`}>
            <TabsContent value="theme" className="mt-0">
              <AdvancedThemeEditor 
                theme={themeConfigFromQuizTheme(theme)} 
                onChange={handleThemeUpdate}
                onPreview={() => console.log('Preview theme')}
              />
            </TabsContent>

            <TabsContent value="layout" className="mt-0">
              <LayoutManager 
                theme={theme} 
                onUpdate={onUpdate}
                previewMode={previewMode}
              />
            </TabsContent>

            <TabsContent value="effects" className="mt-0">
              <VideoBackground 
                theme={theme} 
                onUpdate={onUpdate}
              />
            </TabsContent>

            <TabsContent value="animations" className="mt-0">
              <AnimationLibrary 
                theme={theme} 
                onUpdate={onUpdate}
              />
            </TabsContent>

            <TabsContent value="confetti" className="mt-0">
              <ConfettiSystem 
                theme={theme} 
                onUpdate={onUpdate}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}