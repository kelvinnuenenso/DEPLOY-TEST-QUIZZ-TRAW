import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Users, TrendingUp, Download, ArrowUp, ArrowDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface CohortData {
  cohort: string;
  period: string;
  users: number;
  retained: number;
  retentionRate: number;
  color: string;
}

interface CohortMetrics {
  totalUsers: number;
  avgRetention: number;
  bestCohort: string;
  worstCohort: string;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

interface CohortAnalysisProps {
  quizId: string;
}

export const CohortAnalysis = ({ quizId }: CohortAnalysisProps) => {
  const [cohortData, setCohortData] = useState<CohortData[]>([]);
  const [metrics, setMetrics] = useState<CohortMetrics | null>(null);
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | '180d'>('90d');
  const [cohortType, setCohortType] = useState<'weekly' | 'monthly'>('monthly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCohortData();
  }, [quizId, timeRange, cohortType]);

  const loadCohortData = async () => {
    setLoading(true);
    
    // Simulate cohort data generation
    const cohorts = cohortType === 'monthly' ? 6 : 12;
    const periods = cohortType === 'monthly' ? 6 : 8;
    
    const mockCohortData: CohortData[] = [];
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    
    for (let cohortIndex = 0; cohortIndex < cohorts; cohortIndex++) {
      const cohortDate = new Date();
      if (cohortType === 'monthly') {
        cohortDate.setMonth(cohortDate.getMonth() - cohortIndex);
      } else {
        cohortDate.setDate(cohortDate.getDate() - (cohortIndex * 7));
      }
      
      const cohortName = cohortType === 'monthly' 
        ? cohortDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
        : `Sem ${cohortDate.getDate()}/${cohortDate.getMonth() + 1}`;
      
      const initialUsers = Math.floor(Math.random() * 200) + 50;
      
      for (let period = 0; period < periods; period++) {
        if (period <= cohortIndex) { // Only show data for periods that have passed
          const retentionDecay = Math.pow(0.85, period); // 15% decay per period
          const randomVariation = 0.8 + Math.random() * 0.4; // ±20% variation
          const retained = Math.floor(initialUsers * retentionDecay * randomVariation);
          const retentionRate = period === 0 ? 100 : (retained / initialUsers) * 100;
          
          mockCohortData.push({
            cohort: cohortName,
            period: `${cohortType === 'monthly' ? 'Mês' : 'Semana'} ${period}`,
            users: period === 0 ? initialUsers : retained,
            retained,
            retentionRate,
            color: colors[cohortIndex % colors.length]
          });
        }
      }
    }

    // Calculate metrics
    const totalUsers = mockCohortData
      .filter(d => d.period.includes('0'))
      .reduce((sum, d) => sum + d.users, 0);
    
    const avgRetention = mockCohortData
      .filter(d => d.period.includes('1'))
      .reduce((sum, d, _, arr) => sum + d.retentionRate / arr.length, 0);
    
    const cohortRetentions = mockCohortData
      .filter(d => d.period.includes('1'))
      .reduce((acc, d) => {
        acc[d.cohort] = d.retentionRate;
        return acc;
      }, {} as Record<string, number>);
    
    const bestCohort = Object.entries(cohortRetentions)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || '';
    
    const worstCohort = Object.entries(cohortRetentions)
      .sort(([, a], [, b]) => a - b)[0]?.[0] || '';

    const mockMetrics: CohortMetrics = {
      totalUsers,
      avgRetention,
      bestCohort,
      worstCohort,
      trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable',
      trendPercentage: Math.random() * 20 + 5
    };

    setCohortData(mockCohortData);
    setMetrics(mockMetrics);
    setLoading(false);
  };

  const getCohortTable = () => {
    const cohorts = [...new Set(cohortData.map(d => d.cohort))];
    const periods = [...new Set(cohortData.map(d => d.period))].sort();
    
    return cohorts.map(cohort => {
      const cohortRow = { cohort };
      periods.forEach(period => {
        const data = cohortData.find(d => d.cohort === cohort && d.period === period);
        cohortRow[period] = data?.retentionRate || null;
      });
      return cohortRow;
    });
  };

  const getCohortHeatmapColor = (retentionRate: number | null) => {
    if (retentionRate === null) return 'bg-gray-100';
    if (retentionRate >= 80) return 'bg-green-500';
    if (retentionRate >= 60) return 'bg-green-400';
    if (retentionRate >= 40) return 'bg-yellow-400';
    if (retentionRate >= 20) return 'bg-orange-400';
    return 'bg-red-400';
  };

  const exportCohortData = () => {
    const exportData = {
      quizId,
      timeRange,
      cohortType,
      metrics,
      cohortTable: getCohortTable(),
      rawData: cohortData,
      insights: {
        averageRetention: `${metrics?.avgRetention.toFixed(1)}%`,
        bestPerformingCohort: metrics?.bestCohort,
        worstPerformingCohort: metrics?.worstCohort,
        retentionTrend: metrics?.trend === 'up' ? 'Melhorando' : metrics?.trend === 'down' ? 'Piorando' : 'Estável',
        recommendation: metrics?.avgRetention > 50 
          ? 'Boa retenção - foque em aquisição'
          : 'Baixa retenção - otimize experiência do usuário'
      },
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cohort-analysis-${quizId}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando análise de coorte...</p>
        </div>
      </div>
    );
  }

  const cohortTable = getCohortTable();
  const periods = [...new Set(cohortData.map(d => d.period))].sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Análise de Coorte</h3>
          <p className="text-muted-foreground">
            Acompanhe a retenção de usuários ao longo do tempo
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={cohortType} onValueChange={(value: any) => setCohortType(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Semanal</SelectItem>
              <SelectItem value="monthly">Mensal</SelectItem>
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30d">30 dias</SelectItem>
              <SelectItem value="90d">90 dias</SelectItem>
              <SelectItem value="180d">180 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportCohortData}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Usuários
                </CardTitle>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalUsers.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Retenção Média
                </CardTitle>
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {metrics.avgRetention.toFixed(1)}%
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                {metrics.trend === 'up' ? (
                  <ArrowUp className="w-3 h-3 text-green-500 mr-1" />
                ) : metrics.trend === 'down' ? (
                  <ArrowDown className="w-3 h-3 text-red-500 mr-1" />
                ) : null}
                {metrics.trend !== 'stable' && `${metrics.trendPercentage.toFixed(1)}%`}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Melhor Coorte
                </CardTitle>
                <Calendar className="w-4 h-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{metrics.bestCohort}</div>
              <Badge variant="secondary">Top performer</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pior Coorte
                </CardTitle>
                <Calendar className="w-4 h-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{metrics.worstCohort}</div>
              <Badge variant="destructive">Needs attention</Badge>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="heatmap" className="space-y-4">
        <TabsList>
          <TabsTrigger value="heatmap">Mapa de Calor</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="heatmap" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tabela de Retenção por Coorte</CardTitle>
              <p className="text-muted-foreground">
                Cada linha representa uma coorte, cada coluna um período de tempo
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left p-2 font-medium">Coorte</th>
                      {periods.map(period => (
                        <th key={period} className="text-center p-2 font-medium min-w-[80px]">
                          {period}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cohortTable.map((row, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-2 font-medium">{row.cohort}</td>
                        {periods.map(period => {
                          const value = row[period];
                          return (
                            <td key={period} className="p-1">
                              <div 
                                className={`w-full h-12 flex items-center justify-center rounded text-white text-sm font-medium ${getCohortHeatmapColor(value)}`}
                              >
                                {value !== null ? `${value.toFixed(0)}%` : '-'}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Legend */}
              <div className="mt-4 flex items-center justify-center gap-4">
                <span className="text-sm text-muted-foreground">Retenção:</span>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-400 rounded"></div>
                  <span className="text-xs">0-20%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-400 rounded"></div>
                  <span className="text-xs">20-40%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                  <span className="text-xs">40-60%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-400 rounded"></div>
                  <span className="text-xs">60-80%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-xs">80-100%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tendências de Retenção</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={cohortData.filter(d => d.period !== `${cohortType === 'monthly' ? 'Mês' : 'Semana'} 0`)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Retenção']} />
                  {[...new Set(cohortData.map(d => d.cohort))].map((cohort, index) => (
                    <Line 
                      key={cohort}
                      type="monotone" 
                      dataKey="retentionRate" 
                      data={cohortData.filter(d => d.cohort === cohort)}
                      stroke={cohortData.find(d => d.cohort === cohort)?.color}
                      strokeWidth={2}
                      name={cohort}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Evolução da Retenção</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={cohortTable.map((row, index) => ({
                  cohort: row.cohort,
                  retention: row[`${cohortType === 'monthly' ? 'Mês' : 'Semana'} 1`] || 0
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="cohort" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Retenção']} />
                  <Area type="monotone" dataKey="retention" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Insights Principais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800">✅ Pontos Fortes</h4>
                  <p className="text-sm text-green-700">
                    {metrics?.avgRetention > 50 
                      ? `Retenção acima da média (${metrics.avgRetention.toFixed(1)}%)`
                      : 'Coorte mais recente mostra melhoria'}
                  </p>
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-800">⚠️ Atenção</h4>
                  <p className="text-sm text-yellow-700">
                    {metrics?.worstCohort} precisa de atenção especial para melhorar retenção.
                  </p>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800">📈 Tendência</h4>
                  <p className="text-sm text-blue-700">
                    Retenção está {metrics?.trend === 'up' ? 'melhorando' : metrics?.trend === 'down' ? 'piorando' : 'estável'}
                    {metrics?.trend !== 'stable' && ` em ${metrics.trendPercentage.toFixed(1)}%`}.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recomendações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium">1. Otimização Imediata</h4>
                  <p className="text-sm text-muted-foreground">
                    {metrics?.avgRetention < 50 
                      ? 'Foque em melhorar a experiência inicial do usuário'
                      : 'Mantenha as práticas atuais e expanda aquisição'}
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium">2. Análise Detalhada</h4>
                  <p className="text-sm text-muted-foreground">
                    Investigue o que fez {metrics?.bestCohort} performar melhor.
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium">3. Próximos Passos</h4>
                  <p className="text-sm text-muted-foreground">
                    Implemente melhorias baseadas na coorte de melhor performance.
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