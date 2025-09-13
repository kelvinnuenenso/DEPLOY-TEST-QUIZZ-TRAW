import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Clock, Wifi } from 'lucide-react';

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<Partial<PerformanceMetrics>>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development or when specifically enabled
    const shouldShow = process.env.NODE_ENV === 'development' || 
                      localStorage.getItem('show-performance-monitor') === 'true';
    
    if (!shouldShow) return;
    
    setIsVisible(true);

    // Collect Web Vitals using Performance Observer
    const collectMetrics = () => {
      // First Contentful Paint
      const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
      if (fcpEntry) {
        setMetrics(prev => ({ ...prev, fcp: fcpEntry.startTime }));
      }

      // Time to First Byte
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationEntry) {
        setMetrics(prev => ({ 
          ...prev, 
          ttfb: navigationEntry.responseStart - navigationEntry.requestStart 
        }));
      }

      // Largest Contentful Paint
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }));
      });
      
      try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.warn('LCP observer not supported');
      }

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          setMetrics(prev => ({ ...prev, fid: entry.processingStart - entry.startTime }));
        });
      });

      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        console.warn('FID observer not supported');
      }

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        setMetrics(prev => ({ ...prev, cls: clsValue }));
      });

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('CLS observer not supported');
      }

      return () => {
        observer.disconnect();
        fidObserver.disconnect();
        clsObserver.disconnect();
      };
    };

    const cleanup = collectMetrics();

    // Monitor network connection
    const updateConnectionInfo = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      if (connection) {
        console.log(`Network: ${connection.effectiveType}, Downlink: ${connection.downlink}Mbps`);
      }
    };

    updateConnectionInfo();
    window.addEventListener('online', updateConnectionInfo);
    window.addEventListener('offline', updateConnectionInfo);

    return () => {
      cleanup?.();
      window.removeEventListener('online', updateConnectionInfo);
      window.removeEventListener('offline', updateConnectionInfo);
    };
  }, []);

  const getScoreColor = (value: number, thresholds: [number, number]) => {
    if (value <= thresholds[0]) return 'default';
    if (value <= thresholds[1]) return 'secondary';
    return 'destructive';
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-xs">
      <Card className="p-3 bg-background/95 backdrop-blur border shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium">Performance</span>
          <button 
            onClick={() => setIsVisible(false)}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-1 text-xs">
          {metrics.fcp && (
            <div className="flex justify-between items-center">
              <span>FCP:</span>
              <Badge variant={getScoreColor(metrics.fcp, [1800, 3000])} className="text-xs">
                {formatTime(metrics.fcp)}
              </Badge>
            </div>
          )}
          
          {metrics.lcp && (
            <div className="flex justify-between items-center">
              <span>LCP:</span>
              <Badge variant={getScoreColor(metrics.lcp, [2500, 4000])} className="text-xs">
                {formatTime(metrics.lcp)}
              </Badge>
            </div>
          )}
          
          {metrics.fid && (
            <div className="flex justify-between items-center">
              <span>FID:</span>
              <Badge variant={getScoreColor(metrics.fid, [100, 300])} className="text-xs">
                {formatTime(metrics.fid)}
              </Badge>
            </div>
          )}
          
          {metrics.cls !== undefined && (
            <div className="flex justify-between items-center">
              <span>CLS:</span>
              <Badge variant={getScoreColor(metrics.cls * 1000, [100, 250])} className="text-xs">
                {metrics.cls.toFixed(3)}
              </Badge>
            </div>
          )}

          <div className="flex items-center gap-1 pt-1 border-t">
            <Wifi className="w-3 h-3" />
            <span className="text-muted-foreground">
              {navigator.onLine ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}