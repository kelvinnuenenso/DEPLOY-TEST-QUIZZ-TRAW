import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorRecoveryProps {
  error?: Error;
  resetError?: () => void;
}

export function ErrorRecovery({ error, resetError }: ErrorRecoveryProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [attempts, setAttempts] = useState(0);
  const [isRecovering, setIsRecovering] = useState(false);

  useEffect(() => {
    // Clear localStorage items that might cause issues
    const clearProblematicData = () => {
      try {
        const keysToCheck = ['quiz-editor-temp', 'last-quiz-state', 'temp-answers'];
        keysToCheck.forEach(key => {
          const item = localStorage.getItem(key);
          if (item) {
            try {
              JSON.parse(item);
            } catch {
              localStorage.removeItem(key);
              console.log('Removed corrupted localStorage item:', key);
            }
          }
        });
      } catch (err) {
        console.warn('Error cleaning localStorage:', err);
      }
    };

    clearProblematicData();
  }, []);

  const handleAutoRecover = async () => {
    setIsRecovering(true);
    setAttempts(prev => prev + 1);

    try {
      // Wait a bit to avoid immediate re-trigger
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Try to reset the error first
      if (resetError) {
        resetError();
      } else {
        // If no reset function, navigate to safe route
        if (location.pathname.startsWith('/q/') || location.pathname.startsWith('/r/')) {
          // For quiz routes, go to home
          navigate('/', { replace: true });
        } else if (location.pathname.startsWith('/app/')) {
          // For app routes, go to dashboard
          navigate('/app', { replace: true });
        } else {
          // Default to home
          navigate('/', { replace: true });
        }
      }
    } catch (recoveryError) {
      console.error('Auto recovery failed:', recoveryError);
      // Force reload as last resort
      window.location.reload();
    } finally {
      setIsRecovering(false);
    }
  };

  const handleManualReload = () => {
    // Clear all potentially problematic data
    try {
      sessionStorage.clear();
      const importantKeys = ['user-profile', 'auth-token'];
      const backup: Record<string, string> = {};
      
      importantKeys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) backup[key] = value;
      });
      
      localStorage.clear();
      
      // Restore important data
      Object.entries(backup).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
    } catch (err) {
      console.warn('Error clearing storage:', err);
    }
    
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="p-8 text-center max-w-md">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="w-12 h-12 text-destructive" />
        </div>
        
        <h1 className="text-2xl font-bold mb-4">Ops! Algo deu errado</h1>
        
        <p className="text-muted-foreground mb-6">
          {attempts > 0 
            ? `Tentativa ${attempts} de recuperação automática...`
            : 'Detectamos um erro na aplicação. Vamos tentar resolver automaticamente.'
          }
        </p>

        {error && process.env.NODE_ENV === 'development' && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-sm font-medium mb-2">
              Detalhes do erro (desenvolvimento)
            </summary>
            <pre className="text-xs bg-muted p-2 rounded overflow-auto text-left">
              {error.stack || error.message}
            </pre>
          </details>
        )}

        <div className="flex flex-col gap-2">
          {attempts < 3 && (
            <Button 
              onClick={handleAutoRecover}
              disabled={isRecovering}
              className="w-full"
            >
              {isRecovering ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Recuperando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tentar novamente
                </>
              )}
            </Button>
          )}
          
          <Button 
            onClick={handleManualReload}
            variant="outline"
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Recarregar aplicação
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => navigate('/', { replace: true })}
            className="w-full"
          >
            <Home className="w-4 h-4 mr-2" />
            Voltar ao início
          </Button>
        </div>
        
        {attempts >= 3 && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
            <p className="font-medium">Várias tentativas falharam</p>
            <p>Recomendamos recarregar a aplicação ou entrar em contato com o suporte.</p>
          </div>
        )}
      </Card>
    </div>
  );
}