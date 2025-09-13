import { lazy, Suspense, ComponentType } from 'react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface LazyLoaderProps {
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

// Generic lazy loader component with proper fallback
export const LazyLoader = ({ fallback, children }: LazyLoaderProps) => {
  return (
    <Suspense fallback={fallback || <LoadingSpinner />}>
      {children}
    </Suspense>
  );
};

// Utility function to create lazy components with proper loading states
export const createLazyComponent = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) => {
  const LazyComponent = lazy(importFunc);
  
  return (props: React.ComponentProps<T>) => (
    <LazyLoader fallback={fallback}>
      <LazyComponent {...props} />
    </LazyLoader>
  );
};

// Pre-built fallbacks for different component types
export const ComponentFallbacks = {
  Card: (
    <div className="animate-pulse">
      <div className="bg-muted rounded-lg p-6 space-y-4">
        <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
        <div className="h-3 bg-muted-foreground/20 rounded w-1/2"></div>
        <div className="h-3 bg-muted-foreground/20 rounded w-2/3"></div>
      </div>
    </div>
  ),
  
  Dashboard: (
    <div className="animate-pulse space-y-6 p-6">
      <div className="h-8 bg-muted rounded w-1/3"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-muted rounded-lg h-32"></div>
        ))}
      </div>
      <div className="bg-muted rounded-lg h-64"></div>
    </div>
  ),
  
  Editor: (
    <div className="animate-pulse h-screen flex">
      <div className="w-80 bg-muted border-r p-4 space-y-4">
        <div className="h-6 bg-muted-foreground/20 rounded"></div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-4 bg-muted-foreground/20 rounded"></div>
          ))}
        </div>
      </div>
      <div className="flex-1 p-6 space-y-4">
        <div className="h-8 bg-muted rounded w-1/2"></div>
        <div className="bg-muted rounded-lg h-96"></div>
      </div>
    </div>
  ),
  
  Templates: (
    <div className="animate-pulse space-y-6 p-6">
      <div className="h-8 bg-muted rounded w-1/4"></div>
      <div className="flex gap-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-8 bg-muted rounded w-20"></div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="bg-muted rounded-lg h-64"></div>
        ))}
      </div>
    </div>
  ),
  
  Analytics: (
    <div className="animate-pulse space-y-6 p-6">
      <div className="h-8 bg-muted rounded w-1/3"></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-muted rounded-lg h-24"></div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-muted rounded-lg h-80"></div>
        <div className="bg-muted rounded-lg h-80"></div>
      </div>
    </div>
  )
};

// Lazy component definitions
export const LazyDashboard = createLazyComponent(
  () => import('@/pages/Dashboard'),
  ComponentFallbacks.Dashboard
);

export const LazyQuizEditor = createLazyComponent(
  () => import('@/pages/QuizEditor'),
  ComponentFallbacks.Editor
);

export const LazyTemplates = createLazyComponent(
  () => import('@/pages/Templates'),
  ComponentFallbacks.Templates
);

export const LazyExpandedTemplates = createLazyComponent(
  () => import('@/components/quiz/ExpandedTemplates'),
  ComponentFallbacks.Templates
);

export const LazyAnalyticsDashboard = createLazyComponent(
  () => import('@/components/quiz/AnalyticsDashboard').then(module => ({ default: module.AnalyticsDashboard })),
  ComponentFallbacks.Analytics
);

export const LazyAdvancedAnalytics = createLazyComponent(
  () => import('@/components/quiz/AdvancedAnalytics'),
  ComponentFallbacks.Analytics
);

// Preload critical components
export const preloadCriticalComponents = () => {
  // Preload most commonly used components
  import('@/pages/Dashboard');
  import('@/pages/QuizEditor');
  import('@/components/quiz/ExpandedTemplates');
};