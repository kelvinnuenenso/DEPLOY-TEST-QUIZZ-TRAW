import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export function useErrorRecovery() {
  const navigate = useNavigate();
  const errorCount = useRef(0);
  const lastError = useRef<string | null>(null);

  useEffect(() => {
    const handleUnhandledError = (event: ErrorEvent) => {
      console.error('Unhandled error:', event.error);
      
      // Track consecutive errors
      if (lastError.current === event.error?.message) {
        errorCount.current++;
      } else {
        errorCount.current = 1;
        lastError.current = event.error?.message || 'Unknown error';
      }

      // If we have too many consecutive errors, redirect to safe page
      if (errorCount.current >= 3) {
        console.warn('Too many consecutive errors, redirecting to home...');
        localStorage.setItem('lastErrorRecovery', Date.now().toString());
        navigate('/', { replace: true });
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
    };

    window.addEventListener('error', handleUnhandledError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleUnhandledError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [navigate]);

  // Reset error count on successful navigation/route change
  useEffect(() => {
    const resetErrors = () => {
      errorCount.current = 0;
      lastError.current = null;
    };

    // Reset errors when location changes
    resetErrors();
    
    // Also reset after successful operations
    const timer = setTimeout(resetErrors, 10000); // Reset every 10 seconds if no errors
    
    return () => clearTimeout(timer);
  }, []);

  return { errorCount: errorCount.current };
}