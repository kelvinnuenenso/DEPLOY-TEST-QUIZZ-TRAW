import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MousePointer, Eye, Clock, Download } from 'lucide-react';

interface HeatmapData {
  elementId: string;
  elementType: string;
  x: number;
  y: number;
  clicks: number;
  hovers: number;
  timeSpent: number;
  conversionImpact: number;
}

interface HeatmapAnalyticsProps {
  quizId: string;
}

export const HeatmapAnalytics = ({ quizId }: HeatmapAnalyticsProps) => {
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [viewMode, setViewMode] = useState<'clicks' | 'hovers' | 'time'>('clicks');
  const [loading, setLoading] = useState(true);
  const heatmapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadHeatmapData();
  }, [quizId]);

  const loadHeatmapData = async () => {
    setLoading(true);
    
    // Simulate heatmap data generation
    const mockHeatmapData: HeatmapData[] = [
      {
        elementId: 'question-1',
        elementType: 'question',
        x: 50,
        y: 30,
        clicks: 245,
        hovers: 389,
        timeSpent: 12500,
        conversionImpact: 0.85
      },
      {
        elementId: 'option-1a',
        elementType: 'option',
        x: 30,
        y: 45,
        clicks: 156,
        hovers: 234,
        timeSpent: 3200,
        conversionImpact: 0.92
      },
      {
        elementId: 'option-1b',
        elementType: 'option',
        x: 70,
        y: 45,
        clicks: 89,
        hovers: 156,
        timeSpent: 2800,
        conversionImpact: 0.78
      },
      {
        elementId: 'next-button',
        elementType: 'button',
        x: 50,
        y: 75,
        clicks: 198,
        hovers: 312,
        timeSpent: 1500,
        conversionImpact: 0.95
      },
      {
        elementId: 'progress-bar',
        elementType: 'progress',
        x: 50,
        y: 10,
        clicks: 45,
        hovers: 178,
        timeSpent: 890,
        conversionImpact: 0.65
      }
    ];

    setHeatmapData(mockHeatmapData);
    setLoading(false);
  };

  const getHeatmapIntensity = (value: number, maxValue: number) => {
    const intensity = (value / maxValue) * 100;
    if (intensity > 80) return 'bg-red-500';
    if (intensity > 60) return 'bg-orange-500';
    if (intensity > 40) return 'bg-yellow-500';
    if (intensity > 20) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getCurrentMetric = (data: HeatmapData) => {
    switch (viewMode) {
      case 'clicks': return data.clicks;
      case 'hovers': return data.hovers;
      case 'time': return data.timeSpent;
      default: return data.clicks;
    }
  };

  const maxValue = Math.max(...heatmapData.map(getCurrentMetric));

  const exportHeatmapData = () => {
    const exportData = {
      quizId,
      viewMode,
      timestamp: new Date().toISOString(),
      data: heatmapData,
      summary: {
        totalInteractions: heatmapData.reduce((sum, item) => sum + item.clicks + item.hovers, 0),
        avgTimeSpent: heatmapData.reduce((sum, item) => sum + item.timeSpent, 0) / heatmapData.length,
        highestEngagement: heatmapData.reduce((max, item) => 
          getCurrentMetric(item) > getCurrentMetric(max) ? item : max, heatmapData[0]
        )
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `heatmap-${quizId}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando mapa de calor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Mapa de Calor</h3>
          <p className="text-muted-foreground">
            Visualize onde os usuários mais interagem no seu quiz
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="clicks">Cliques</SelectItem>
              <SelectItem value="hovers">Hovers</SelectItem>
              <SelectItem value="time">Tempo</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportHeatmapData}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Cliques
              </CardTitle>
              <MousePointer className="w-4 h-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {heatmapData.reduce((sum, item) => sum + item.clicks, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Hovers
              </CardTitle>
              <Eye className="w-4 h-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {heatmapData.reduce((sum, item) => sum + item.hovers, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tempo Total
              </CardTitle>
              <Clock className="w-4 h-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(heatmapData.reduce((sum, item) => sum + item.timeSpent, 0) / 1000)}s
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Impacto na Conversão
              </CardTitle>
              <MousePointer className="w-4 h-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(heatmapData.reduce((sum, item) => sum + item.conversionImpact, 0) / heatmapData.length * 100)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="visualization" className="space-y-4">
        <TabsList>
          <TabsTrigger value="visualization">Visualização</TabsTrigger>
          <TabsTrigger value="data">Dados Detalhados</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="visualization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mapa de Calor - {viewMode === 'clicks' ? 'Cliques' : viewMode === 'hovers' ? 'Hovers' : 'Tempo Gasto'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                ref={heatmapRef}
                className="relative w-full h-96 bg-gray-50 rounded-lg border overflow-hidden"
              >
                {/* Simulated quiz interface */}
                <div className="absolute inset-4 space-y-4">
                  {heatmapData.map((point) => (
                    <div
                      key={point.elementId}
                      className={`absolute rounded-full opacity-70 animate-pulse ${getHeatmapIntensity(getCurrentMetric(point), maxValue)}`}
                      style={{
                        left: `${point.x}%`,
                        top: `${point.y}%`,
                        width: Math.max(20, (getCurrentMetric(point) / maxValue) * 60),
                        height: Math.max(20, (getCurrentMetric(point) / maxValue) * 60),
                        transform: 'translate(-50%, -50%)'
                      }}
                      title={`${point.elementType}: ${getCurrentMetric(point)} ${viewMode}`}
                    />
                  ))}
                </div>

                {/* Legend */}
                <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg">
                  <h4 className="text-sm font-semibold mb-2">Intensidade</h4>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-xs">Muito Alta</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-xs">Alta</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-xs">Média</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-xs">Baixa</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-xs">Muito Baixa</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dados Detalhados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {heatmapData.map((item) => (
                  <div key={item.elementId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{item.elementType}</Badge>
                        <span className="font-medium">{item.elementId}</span>
                      </div>
                      <Badge variant={item.conversionImpact > 0.8 ? 'default' : 'secondary'}>
                        {Math.round(item.conversionImpact * 100)}% conversão
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Cliques:</span>
                        <div className="font-semibold">{item.clicks}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Hovers:</span>
                        <div className="font-semibold">{item.hovers}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tempo:</span>
                        <div className="font-semibold">{Math.round(item.timeSpent / 1000)}s</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Insights de Engajamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800">✅ Ponto Forte</h4>
                  <p className="text-sm text-green-700">
                    O botão "Próximo" tem alta taxa de conversão (95%), indicando boa usabilidade.
                  </p>
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-800">⚠️ Atenção</h4>
                  <p className="text-sm text-yellow-700">
                    A barra de progresso recebe poucos cliques. Considere torná-la mais interativa.
                  </p>
                </div>
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-800">🚨 Problema</h4>
                  <p className="text-sm text-red-700">
                    Opção 1B tem baixo engajamento. Considere reformular o texto ou posição.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recomendações de Otimização</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium">1. Reposicionar Elementos</h4>
                  <p className="text-sm text-muted-foreground">
                    Mova elementos com baixo engajamento para posições mais centrais.
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium">2. Melhorar CTAs</h4>
                  <p className="text-sm text-muted-foreground">
                    Adicione animações ou cores mais chamativas nos botões principais.
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium">3. Teste A/B</h4>
                  <p className="text-sm text-muted-foreground">
                    Teste diferentes layouts baseados nos dados do mapa de calor.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};