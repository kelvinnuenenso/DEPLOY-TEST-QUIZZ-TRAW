import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { ErrorRecovery } from './ErrorRecovery';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
    this.resetError = this.resetError.bind(this);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Enhanced error logging with safe error handling
    try {
      import('@/utils/errorLogger').then(({ errorLogger }) => {
        errorLogger.log(error, {
          component: 'ErrorBoundary',
          props: this.props,
          componentStack: errorInfo.componentStack
        });
      }).catch((importError) => {
        // Fallback if errorLogger fails to import
        console.warn('Could not load error logger:', importError);
      });
    } catch (loggingError) {
      console.warn('Error logging failed:', loggingError);
    }
    
    // Log additional context for debugging with safe access
    try {
      console.error('Component Stack:', errorInfo.componentStack);
      console.error('Error Stack:', error.stack);
      console.error('Props:', JSON.stringify(this.props, null, 2));
    } catch (debugError) {
      console.error('Debug logging failed:', debugError);
    }
  }

  resetError() {
    this.setState({ hasError: false, error: undefined });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorRecovery error={this.state.error} resetError={this.resetError} />
      );
    }

    return this.props.children;
  }
}