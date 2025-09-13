import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Quiz } from '@/types/quiz';

interface SEOHeadProps {
  quiz?: Quiz;
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'quiz';
}

export function SEOHead({ 
  quiz, 
  title, 
  description, 
  image, 
  url, 
  type = 'website' 
}: SEOHeadProps) {
  // Generate dynamic content based on quiz
  const seoTitle = title || (quiz ? `${quiz.name} - Quiz Interativo` : 'Elevado Quizz - Crie quizzes que convertem');
  const seoDescription = description || (quiz?.description || 'Responda este quiz interativo e descubra resultados personalizados.');
  const seoImage = image || 'https://elevadoquizz.com.br/og-quiz.png';
  const seoUrl = url || window.location.href;

  // Generate structured data for quiz
  const structuredData = quiz ? {
    "@context": "https://schema.org",
    "@type": "Quiz",
    "name": quiz.name,
    "description": quiz.description || seoDescription,
    "url": seoUrl,
    "dateCreated": quiz.createdAt,
    "dateModified": quiz.updatedAt || quiz.createdAt,
    "author": {
      "@type": "Organization",
      "name": "Elevado Quizz"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Elevado Quizz",
      "logo": {
        "@type": "ImageObject",
        "url": "https://elevadoquizz.com.br/logo.png"
      }
    },
    "mainEntity": {
      "@type": "WebApplication",
      "name": quiz.name,
      "applicationCategory": "Quiz",
      "operatingSystem": "Web Browser"
    }
  } : null;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content="quiz, interativo, formulário, lead generation, conversão" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:url" content={seoUrl} />
      <meta property="og:site_name" content="Elevado Quizz" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={seoImage} />
      <meta name="twitter:site" content="@elevadoquizz" />
      
      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={seoUrl} />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
      
      {/* PWA Meta Tags */}
      <meta name="theme-color" content="#2563EB" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Elevado Quizz" />
      
      {/* Preload Critical Resources */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Favicon */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    </Helmet>
  );
}