import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { Card } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface SafeComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  componentName?: string;
}

const DefaultFallback = ({ componentName }: { componentName?: string }) => (
  <Card className="p-4 border-destructive/20 bg-destructive/5">
    <div className="flex items-center gap-2 text-destructive">
      <AlertTriangle className="w-4 h-4" />
      <span className="text-sm">
        Erro no componente {componentName || 'desconhecido'}
      </span>
    </div>
  </Card>
);

export function SafeComponent({ children, fallback, componentName }: SafeComponentProps) {
  return (
    <ErrorBoundary fallback={fallback || <DefaultFallback componentName={componentName} />}>
      {children}
    </ErrorBoundary>
  );
}

export function withSafeWrapper<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  return function SafeWrappedComponent(props: P) {
    return (
      <SafeComponent componentName={componentName || Component.name}>
        <Component {...props} />
      </SafeComponent>
    );
  };
}