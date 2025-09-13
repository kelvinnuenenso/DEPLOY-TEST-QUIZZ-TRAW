import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { errorLogger } from '@/utils/errorLogger';

interface EnhancedErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
  lastErrorTime: number;
}

interface EnhancedErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  maxRetries?: number;
  resetTimeWindow?: number; // Reset retry count after this time (ms)
  showErrorDetails?: boolean;
  componentName?: string;
}

export class EnhancedErrorBoundary extends Component<
  EnhancedErrorBoundaryProps,
  EnhancedErrorBoundaryState
> {
  private resetTimeoutId: number | null = null;

  constructor(props: EnhancedErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      lastErrorTime: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<EnhancedErrorBoundaryState> {
    return {
      hasError: true,
      error,
      lastErrorTime: Date.now()
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { onError, componentName } = this.props;
    
    // Log error with enhanced context
    errorLogger.log(error, {
      component: componentName || 'EnhancedErrorBoundary',
      componentStack: errorInfo.componentStack,
      props: this.props
    });

    // Update state with error info
    this.setState(prevState => ({
      errorInfo,
      retryCount: prevState.retryCount + 1
    }));

    // Call custom error handler
    onError?.(error, errorInfo);

    // Auto-recovery for certain error types
    this.attemptAutoRecovery(error);
  }

  private attemptAutoRecovery = (error: Error) => {
    const { maxRetries = 3, resetTimeWindow = 300000 } = this.props; // 5 minutes default
    
    // Don't auto-recover if too many retries
    if (this.state.retryCount >= maxRetries) {
      return;
    }

    // Auto-recover for certain error patterns
    const recoverableErrors = [
      'Loading chunk',
      'Loading CSS chunk',
      'ChunkLoadError',
      'Network request failed'
    ];

    const isRecoverable = recoverableErrors.some(pattern => 
      error.message.includes(pattern) || error.name.includes(pattern)
    );

    if (isRecoverable) {
      // Attempt recovery after a delay
      setTimeout(() => {
        this.handleRetry();
      }, 2000 + (this.state.retryCount * 1000)); // Exponential backoff
    }

    // Reset retry count after time window
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
    
    this.resetTimeoutId = window.setTimeout(() => {
      this.setState({ retryCount: 0 });
    }, resetTimeWindow);
  };

  private handleRetry = () => {
    // Clear error state to re-render children
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  private handleRefreshPage = () => {
    // Clear any corrupt local storage data
    try {
      const keysToPreserve = ['auth-token', 'user-profile', 'theme-preference'];
      const preserved: Record<string, string> = {};
      
      keysToPreserve.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) preserved[key] = value;
      });
      
      localStorage.clear();
      
      Object.entries(preserved).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
    } catch (e) {
      console.warn('Failed to clean localStorage:', e);
    }
    
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private generateErrorReport = () => {
    const { error, errorInfo, retryCount } = this.state;
    
    return {
      error: {
        name: error?.name,
        message: error?.message,
        stack: error?.stack
      },
      errorInfo: {
        componentStack: errorInfo?.componentStack
      },
      context: {
        retryCount,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        component: this.props.componentName
      },
      recentErrors: errorLogger.getRecentErrors(5)
    };
  };

  private handleReportError = () => {
    const report = this.generateErrorReport();
    
    // Copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(report, null, 2))
      .then(() => {
        alert('Relatório de erro copiado para a área de transferência');
      })
      .catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = JSON.stringify(report, null, 2);
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Relatório de erro copiado para a área de transferência');
      });
  };

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  render() {
    const { hasError, error, retryCount } = this.state;
    const { fallback, maxRetries = 3, showErrorDetails = false } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Determine error severity
      const isChunkError = error?.message?.includes('Loading chunk') || error?.name === 'ChunkLoadError';
      const isCriticalError = retryCount >= maxRetries;

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
          <Card className="max-w-md w-full p-6 text-center border-destructive/20">
            <div className="mb-4">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              
              <h2 className="text-xl font-semibold mb-2">
                {isChunkError ? 'Erro de Carregamento' : 'Algo deu errado'}
              </h2>
              
              <p className="text-muted-foreground text-sm mb-4">
                {isChunkError 
                  ? 'Houve um problema ao carregar parte da aplicação. Isso pode acontecer após atualizações.'
                  : 'Ocorreu um erro inesperado. Nossa equipe foi notificada automaticamente.'
                }
              </p>

              {retryCount > 0 && (
                <p className="text-xs text-orange-600 mb-4">
                  Tentativas de recuperação: {retryCount}/{maxRetries}
                </p>
              )}
            </div>

            <div className="space-y-3">
              {!isCriticalError && (
                <Button 
                  onClick={this.handleRetry}
                  className="w-full"
                  variant="default"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tentar Novamente
                </Button>
              )}
              
              <Button 
                onClick={this.handleRefreshPage}
                variant="outline" 
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Recarregar Página
              </Button>
              
              <Button 
                onClick={this.handleGoHome}
                variant="outline" 
                className="w-full"
              >
                <Home className="w-4 h-4 mr-2" />
                Voltar ao Início
              </Button>

              {showErrorDetails && (
                <Button 
                  onClick={this.handleReportError}
                  variant="ghost" 
                  size="sm"
                  className="w-full text-xs"
                >
                  <Bug className="w-3 h-3 mr-1" />
                  Copiar Relatório de Erro
                </Button>
              )}
            </div>

            {showErrorDetails && error && (
              <details className="mt-4 text-left">
                <summary className="text-xs cursor-pointer text-muted-foreground hover:text-foreground">
                  Detalhes técnicos
                </summary>
                <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-32 text-left">
                  {error.stack || error.message}
                </pre>
              </details>
            )}
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}