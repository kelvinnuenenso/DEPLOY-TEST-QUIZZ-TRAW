import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts';
import {
  TrendingUp,
  Users,
  Eye,
  Target,
  Calendar,
  Download,
  Filter,
  Share,
  Clock
} from 'lucide-react';

interface EnhancedAnalyticsProps {
  quizId: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function EnhancedAnalytics({ quizId }: EnhancedAnalyticsProps) {
  const [timeRange, setTimeRange] = useState('7days');
  const [selectedView, setSelectedView] = useState('overview');

  // Mock data - in real app this would come from localDB or Supabase
  const mockData = {
    overview: {
      totalViews: 1247,
      totalStarts: 892,
      totalCompletions: 634,
      totalLeads: 487,
      conversionRate: 71.1,
      avgTimeSpent: 4.2,
      bounceRate: 28.9
    },
    funnelData: [
      { name: 'Visualizações', value: 1247, fill: '#8884d8' },
      { name: 'Iniciaram', value: 892, fill: '#82ca9d' },
      { name: 'Pergunta 2', value: 756, fill: '#ffc658' },
      { name: 'Pergunta 3', value: 698, fill: '#ff7c7c' },
      { name: 'Completaram', value: 634, fill: '#8dd1e1' }
    ],
    timeSeriesData: [
      { date: '2024-01-01', views: 45, starts: 32, completions: 24, leads: 18 },
      { date: '2024-01-02', views: 52, starts: 38, completions: 28, leads: 21 },
      { date: '2024-01-03', views: 48, starts: 35, completions: 26, leads: 19 },
      { date: '2024-01-04', views: 61, starts: 44, completions: 32, leads: 24 },
      { date: '2024-01-05', views: 58, starts: 42, completions: 31, leads: 23 },
      { date: '2024-01-06', views: 67, starts: 48, completions: 35, leads: 27 },
      { date: '2024-01-07', views: 72, starts: 51, completions: 38, leads: 29 }
    ],
    questionAnalytics: [
      {
        question: 'Qual seu principal objetivo?',
        responses: [
          { answer: 'Gerar mais leads', count: 234, percentage: 37 },
          { answer: 'Aumentar vendas', count: 198, percentage: 31 },
          { answer: 'Fazer diagnósticos', count: 132, percentage: 21 },
          { answer: 'Engajar audiência', count: 70, percentage: 11 }
        ]
      }
    ],
    sourceData: [
      { source: 'Google', visitors: 523, percentage: 42 },
      { source: 'Facebook', visitors: 312, percentage: 25 },
      { source: 'Instagram', visitors: 198, percentage: 16 },
      { source: 'Direto', visitors: 156, percentage: 12 },
      { source: 'Outros', visitors: 58, percentage: 5 }
    ],
    deviceData: [
      { device: 'Mobile', count: 748, percentage: 60 },
      { device: 'Desktop', count: 374, percentage: 30 },
      { device: 'Tablet', count: 125, percentage: 10 }
    ]
  };

  const exportData = (format: 'csv' | 'pdf') => {
    // Mock export functionality
    const filename = `quiz-analytics-${quizId}-${new Date().toISOString().split('T')[0]}.${format}`;
    console.log(`Exportando dados como ${format}: ${filename}`);
    // In real app, this would generate and download the file
  };

  return (
    <div className="space-y-6">
      {/* Header with filters and actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Analytics Avançado</h2>
          <p className="text-muted-foreground">
            Insights detalhados sobre performance do quiz
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Últimas 24h</SelectItem>
              <SelectItem value="7days">Últimos 7 dias</SelectItem>
              <SelectItem value="30days">Últimos 30 dias</SelectItem>
              <SelectItem value="90days">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" onClick={() => exportData('csv')}>
            <Download className="w-4 h-4 mr-1" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportData('pdf')}>
            <Download className="w-4 h-4 mr-1" />
            PDF
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.overview.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 font-medium">+12%</span> vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.overview.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 font-medium">+3.2%</span> vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.overview.avgTimeSpent}min</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600 font-medium">-0.3min</span> vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads Gerados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.overview.totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 font-medium">+18</span> vs período anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs value={selectedView} onValueChange={setSelectedView} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="funnel">Funil</TabsTrigger>
          <TabsTrigger value="questions">Perguntas</TabsTrigger>
          <TabsTrigger value="audience">Audiência</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance ao Longo do Tempo</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockData.timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="views" stroke="#8884d8" name="Visualizações" />
                  <Line type="monotone" dataKey="starts" stroke="#82ca9d" name="Iniciaram" />
                  <Line type="monotone" dataKey="completions" stroke="#ffc658" name="Completaram" />
                  <Line type="monotone" dataKey="leads" stroke="#ff7c7c" name="Leads" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Funil de Conversão</CardTitle>
              <p className="text-sm text-muted-foreground">
                Visualize onde os usuários abandonam o quiz
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <FunnelChart>
                  <Tooltip />
                  <Funnel
                    dataKey="value"
                    data={mockData.funnelData}
                    isAnimationActive
                  >
                    <LabelList position="center" fill="#fff" stroke="none" />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análise por Pergunta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {mockData.questionAnalytics.map((question, index) => (
                <div key={index} className="space-y-3">
                  <h4 className="font-medium">{question.question}</h4>
                  <div className="space-y-2">
                    {question.responses.map((response, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded">
                        <span className="text-sm">{response.answer}</span>
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium">{response.count}</div>
                          <Badge variant="secondary">{response.percentage}%</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Origem do Tráfego</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={mockData.sourceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="visitors"
                    >
                      {mockData.sourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dispositivos</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={mockData.deviceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="device" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}