import { useEffect } from 'react';
import { Quiz } from '@/types/quiz';

interface SEOOptions {
  title?: string;
  description?: string;
  image?: string;
  keywords?: string[];
  type?: 'website' | 'article' | 'quiz';
}

export function useSEO(quiz?: Quiz, options: SEOOptions = {}) {
  useEffect(() => {
    // Update document title
    const title = options.title || (quiz ? `${quiz.name} - Quiz Interativo` : 'Elevado Quizz');
    document.title = title;

    // Update meta description
    const description = options.description || (quiz?.description || 'Responda este quiz interativo e descubra resultados personalizados.');
    let descMeta = document.querySelector('meta[name="description"]');
    if (!descMeta) {
      descMeta = document.createElement('meta');
      descMeta.setAttribute('name', 'description');
      document.head.appendChild(descMeta);
    }
    descMeta.setAttribute('content', description);

    // Update Open Graph tags
    const updateOGTag = (property: string, content: string) => {
      let ogMeta = document.querySelector(`meta[property="${property}"]`);
      if (!ogMeta) {
        ogMeta = document.createElement('meta');
        ogMeta.setAttribute('property', property);
        document.head.appendChild(ogMeta);
      }
      ogMeta.setAttribute('content', content);
    };

    updateOGTag('og:title', title);
    updateOGTag('og:description', description);
    updateOGTag('og:type', options.type || 'website');
    updateOGTag('og:url', window.location.href);
    
    if (options.image) {
      updateOGTag('og:image', options.image);
    }

    // Generate UTM-enabled sharing URLs
    const generateSharingURL = (platform: string) => {
      const url = new URL(window.location.href);
      url.searchParams.set('utm_source', platform);
      url.searchParams.set('utm_medium', 'social');
      url.searchParams.set('utm_campaign', 'quiz_share');
      if (quiz) {
        url.searchParams.set('utm_content', quiz.id);
      }
      return url.toString();
    };

    // Store sharing URLs for social media
    (window as Window & { sharingURLs?: Record<string, string> }).sharingURLs = {
      facebook: generateSharingURL('facebook'),
      twitter: generateSharingURL('twitter'),
      linkedin: generateSharingURL('linkedin'),
      whatsapp: generateSharingURL('whatsapp')
    };

  }, [quiz, options]);

  return {
    generateSharingURL: (platform: string) => {
      const url = new URL(window.location.href);
      url.searchParams.set('utm_source', platform);
      url.searchParams.set('utm_medium', 'social');
      url.searchParams.set('utm_campaign', 'quiz_share');
      if (quiz) {
        url.searchParams.set('utm_content', quiz.id);
      }
      return url.toString();
    }
  };
}