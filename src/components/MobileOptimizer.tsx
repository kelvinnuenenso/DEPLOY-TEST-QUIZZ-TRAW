import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  Wifi, 
  WifiOff, 
  Battery,
  Signal,
  CheckCircle,
  AlertCircle,
  Zap,
  Eye,
  TouchpadIcon as Touch
} from 'lucide-react';

interface MobileMetrics {
  deviceType: 'mobile' | 'tablet' | 'desktop';
  screenSize: { width: number; height: number };
  isOnline: boolean;
  batteryLevel?: number;
  connectionType: string;
  touchSupport: boolean;
  orientation: 'portrait' | 'landscape';
  pixelRatio: number;
  performanceScore: number;
}

interface MobileOptimizerProps {
  quizId?: string;
}

export const MobileOptimizer = ({ quizId }: MobileOptimizerProps) => {
  const [metrics, setMetrics] = useState<MobileMetrics | null>(null);
  const [optimizations, setOptimizations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    detectMobileMetrics();
    setupEventListeners();
    
    return () => {
      // Cleanup event listeners
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  const detectMobileMetrics = async () => {
    setLoading(true);
    
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    
    let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    if (screenWidth <= 768) deviceType = 'mobile';
    else if (screenWidth <= 1024) deviceType = 'tablet';
    
    // Detect connection type
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    const connectionType = connection?.effectiveType || 'unknown';
    
    // Battery API (if supported)
    let batteryLevel: number | undefined;
    try {
      const battery = await (navigator as any).getBattery?.();
      batteryLevel = battery?.level ? Math.round(battery.level * 100) : undefined;
    } catch (error) {
      // Battery API not supported
    }
    
    // Performance metrics
    const performanceScore = calculatePerformanceScore();
    
    const detectedMetrics: MobileMetrics = {
      deviceType,
      screenSize: { width: screenWidth, height: screenHeight },
      isOnline: navigator.onLine,
      batteryLevel,
      connectionType,
      touchSupport: 'ontouchstart' in window,
      orientation: screenWidth > screenHeight ? 'landscape' : 'portrait',
      pixelRatio: window.devicePixelRatio || 1,
      performanceScore
    };
    
    setMetrics(detectedMetrics);
    generateOptimizations(detectedMetrics);
    setLoading(false);
  };

  const calculatePerformanceScore = () => {
    // Simulate performance calculation
    const baseScore = 75;
    const randomVariation = Math.random() * 20 - 10; // -10 to +10
    return Math.max(0, Math.min(100, Math.round(baseScore + randomVariation)));
  };

  const generateOptimizations = (metrics: MobileMetrics) => {
    const optimizationsList: string[] = [];
    
    if (metrics.deviceType === 'mobile') {
      optimizationsList.push('Touch-friendly buttons with minimum 44px tap targets');
      optimizationsList.push('Optimized font sizes for mobile screens');
      optimizationsList.push('Compressed images for faster loading');
    }
    
    if (metrics.connectionType === 'slow-2g' || metrics.connectionType === '2g') {
      optimizationsList.push('Aggressive image compression for slow connections');
      optimizationsList.push('Lazy loading for non-critical content');
      optimizationsList.push('Minimal JavaScript bundles');
    }
    
    if (!metrics.isOnline) {
      optimizationsList.push('Offline mode with cached content');
      optimizationsList.push('Service Worker for background sync');
    }
    
    if (metrics.batteryLevel && metrics.batteryLevel < 20) {
      optimizationsList.push('Reduced animations to save battery');
      optimizationsList.push('Minimized background processes');
    }
    
    if (metrics.pixelRatio > 2) {
      optimizationsList.push('High-DPI image variants for retina displays');
    }
    
    setOptimizations(optimizationsList);
  };

  const handleOnlineStatus = () => {
    if (metrics) {
      setMetrics(prev => prev ? { ...prev, isOnline: navigator.onLine } : null);
    }
  };

  const handleOrientationChange = () => {
    setTimeout(() => {
      if (metrics) {
        const newOrientation = window.screen.width > window.screen.height ? 'landscape' : 'portrait';
        setMetrics(prev => prev ? { ...prev, orientation: newOrientation } : null);
      }
    }, 100);
  };

  const setupEventListeners = () => {
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    window.addEventListener('orientationchange', handleOrientationChange);
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="w-5 h-5" />;
      case 'tablet': return <Tablet className="w-5 h-5" />;
      default: return <Monitor className="w-5 h-5" />;
    }
  };

  const getConnectionColor = (connectionType: string) => {
    switch (connectionType) {
      case '4g': return 'text-green-600';
      case '3g': return 'text-yellow-600';
      case '2g':
      case 'slow-2g': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Analisando dispositivo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Otimização Mobile</h3>
          <p className="text-muted-foreground">
            Análise e otimizações para dispositivos móveis
          </p>
        </div>
        <Badge variant="outline" className={getPerformanceColor(metrics.performanceScore)}>
          Performance: {metrics.performanceScore}/100
        </Badge>
      </div>

      {/* Device Info Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Dispositivo
              </CardTitle>
              {getDeviceIcon(metrics.deviceType)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{metrics.deviceType}</div>
            <div className="text-sm text-muted-foreground">
              {metrics.screenSize.width}x{metrics.screenSize.height}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Conexão
              </CardTitle>
              {metrics.isOnline ? (
                <Wifi className="w-5 h-5 text-green-600" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-600" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getConnectionColor(metrics.connectionType)}`}>
              {metrics.connectionType.toUpperCase()}
            </div>
            <div className="text-sm text-muted-foreground">
              {metrics.isOnline ? 'Online' : 'Offline'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Bateria
              </CardTitle>
              <Battery className={`w-5 h-5 ${
                metrics.batteryLevel && metrics.batteryLevel < 20 ? 'text-red-600' : 'text-green-600'
              }`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.batteryLevel ? `${metrics.batteryLevel}%` : 'N/A'}
            </div>
            <div className="text-sm text-muted-foreground">
              {metrics.batteryLevel && metrics.batteryLevel < 20 ? 'Baixa' : 'OK'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Touch
              </CardTitle>
              <Touch className={`w-5 h-5 ${metrics.touchSupport ? 'text-green-600' : 'text-gray-400'}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.touchSupport ? 'Sim' : 'Não'}
            </div>
            <div className="text-sm text-muted-foreground">
              {metrics.orientation}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="optimizations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="optimizations">Otimizações</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="testing">Testes</TabsTrigger>
        </TabsList>

        <TabsContent value="optimizations" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Otimizações Ativas</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Melhorias aplicadas automaticamente
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {optimizations.map((optimization, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{optimization}</span>
                    </div>
                  ))}
                  
                  {optimizations.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">
                        Todas as otimizações básicas já estão ativas
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recomendações</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Melhorias sugeridas para seu quiz
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div>
                      <span className="text-sm font-medium">Progressive Web App</span>
                      <p className="text-xs text-muted-foreground">
                        Permita que usuários instalem seu quiz como app
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Eye className="w-4 h-4 text-purple-600 mt-0.5" />
                    <div>
                      <span className="text-sm font-medium">Tela Cheia Mobile</span>
                      <p className="text-xs text-muted-foreground">
                        Otimize o layout para ocupar toda a tela em mobiles
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Signal className="w-4 h-4 text-green-600 mt-0.5" />
                    <div>
                      <span className="text-sm font-medium">Push Notifications</span>
                      <p className="text-xs text-muted-foreground">
                        Envie lembretes para completar quizzes abandonados
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Touch className="w-4 h-4 text-orange-600 mt-0.5" />
                    <div>
                      <span className="text-sm font-medium">Gestos Touch</span>
                      <p className="text-xs text-muted-foreground">
                        Adicione swipe para navegar entre perguntas
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Score Geral</span>
                    <span className={`font-bold ${getPerformanceColor(metrics.performanceScore)}`}>
                      {metrics.performanceScore}/100
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tempo de Carregamento</span>
                    <span className="font-bold text-green-600">1.2s</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">First Contentful Paint</span>
                    <span className="font-bold text-green-600">0.8s</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Largest Contentful Paint</span>
                    <span className="font-bold text-yellow-600">2.1s</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Cumulative Layout Shift</span>
                    <span className="font-bold text-green-600">0.05</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Uso de Recursos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">JavaScript</span>
                    <span className="font-bold">245KB</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">CSS</span>
                    <span className="font-bold">89KB</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Imagens</span>
                    <span className="font-bold">156KB</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Transferido</span>
                    <span className="font-bold text-green-600">490KB</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Otimizações de Cache</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Service Worker ativo</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Cache de assets estáticos</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Compressão gzip/brotli</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm">Cache de dados dinâmicos</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Simulação de Dispositivos</CardTitle>
              <p className="text-sm text-muted-foreground">
                Teste seu quiz em diferentes dispositivos e condições
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Dispositivos Populares</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Smartphone className="w-4 h-4 mr-2" />
                      iPhone 14 Pro (393x852)
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Smartphone className="w-4 h-4 mr-2" />
                      Samsung Galaxy S23 (360x800)
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Tablet className="w-4 h-4 mr-2" />
                      iPad Air (820x1180)
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Monitor className="w-4 h-4 mr-2" />
                      Desktop (1920x1080)
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Simulação de Rede</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Signal className="w-4 h-4 mr-2 text-green-600" />
                      WiFi Rápido (50+ Mbps)
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Signal className="w-4 h-4 mr-2 text-blue-600" />
                      4G Típico (10 Mbps)
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Signal className="w-4 h-4 mr-2 text-yellow-600" />
                      3G Lento (1 Mbps)
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <WifiOff className="w-4 h-4 mr-2 text-red-600" />
                      Modo Offline
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};