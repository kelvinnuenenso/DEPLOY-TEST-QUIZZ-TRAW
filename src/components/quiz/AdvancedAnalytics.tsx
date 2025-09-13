import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { localDB, AnalyticsData } from '@/lib/localStorage';
import { Quiz, Result, Lead } from '@/types/quiz';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Target, 
  Clock, 
  MousePointer,
  Download,
  Calendar,
  Filter,
  Eye,
  CheckCircle,
  UserPlus,
  Percent
} from 'lucide-react';

interface AnalyticsProps {
  quizId: string;
}

const AdvancedAnalytics = ({ quizId }: AnalyticsProps) => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [dateRange, setDateRange] = useState<string>('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [quizId, dateRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      const loadedQuiz = localDB.getQuiz(quizId);
      const quizResults = localDB.getQuizResults(quizId);
      const quizLeads = localDB.getQuizLeads(quizId);
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      switch (dateRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        default:
          startDate.setDate(endDate.getDate() - 7);
      }

      const analyticsData = localDB.getAnalytics(
        quizId, 
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );

      setQuiz(loadedQuiz);
      setResults(quizResults);
      setLeads(quizLeads);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics
  const totalViews = analytics.reduce((sum, day) => sum + day.views, 0);
  const totalStarts = results.length;
  const totalCompletions = results.filter(r => r.completedAt).length;
  const totalLeads = leads.length;
  
  const startRate = totalViews > 0 ? (totalStarts / totalViews) * 100 : 0;
  const completionRate = totalStarts > 0 ? (totalCompletions / totalStarts) * 100 : 0;
  const conversionRate = totalStarts > 0 ? (totalLeads / totalStarts) * 100 : 0;

  // Prepare chart data
  const dailyData = analytics.map(day => ({
    date: new Date(day.date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
    views: day.views,
    starts: day.starts,
    completions: day.completions,
    leads: day.leads
  }));

  // Funnel data
  const funnelData = [
    { stage: 'Visualizações', count: totalViews, percentage: 100 },
    { stage: 'Iniciaram', count: totalStarts, percentage: startRate },
    { stage: 'Completaram', count: totalCompletions, percentage: completionRate },
    { stage: 'Viraram Leads', count: totalLeads, percentage: conversionRate }
  ];

  // Question performance
  const questionPerformance = quiz?.questions.map((question, index) => {
    const questionAnswers = results
      .filter(r => r.answers.some(a => a.questionId === question.id))
      .length;
    
    const dropoffRate = index === 0 ? 0 : 
      ((totalStarts - questionAnswers) / totalStarts) * 100;
    
    return {
      question: `P${index + 1}`,
      title: question.title.substring(0, 30) + '...',
      answers: questionAnswers,
      dropoffRate
    };
  }) || [];

  // Answer distribution for single/multiple choice questions
  const getAnswerDistribution = (questionId: string) => {
    const question = quiz?.questions.find(q => q.id === questionId);
    if (!question || !question.options) return [];

    const answerCounts: Record<string, number> = {};
    
    results.forEach(result => {
      const answer = result.answers.find(a => a.questionId === questionId);
      if (answer) {
        const values = Array.isArray(answer.value) ? answer.value : [answer.value];
        values.forEach((value: string) => {
          answerCounts[value] = (answerCounts[value] || 0) + 1;
        });
      }
    });

    return question.options.map(option => ({
      label: option.label,
      count: answerCounts[option.id] || 0,
      percentage: results.length > 0 ? ((answerCounts[option.id] || 0) / results.length) * 100 : 0
    }));
  };

  const exportData = () => {
    const data = {
      quiz: quiz?.name,
      period: dateRange,
      metrics: {
        totalViews,
        totalStarts,
        totalCompletions,
        totalLeads,
        startRate: startRate.toFixed(2) + '%',
        completionRate: completionRate.toFixed(2) + '%',
        conversionRate: conversionRate.toFixed(2) + '%'
      },
      dailyData,
      questionPerformance,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${quiz?.name || 'quiz'}-${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const colors = ['#2563EB', '#059669', '#DC2626', '#7C3AED', '#EA580C'];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Avançado</h2>
          <p className="text-muted-foreground">{quiz?.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
              <SelectItem value="90d">90 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Visualizações
              </CardTitle>
              <Eye className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taxa de Início
              </CardTitle>
              <MousePointer className="w-4 h-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {startRate.toFixed(1)}%
            </div>
            <p className="text-sm text-muted-foreground">
              {totalStarts} de {totalViews} iniciaram
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taxa de Conclusão
              </CardTitle>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {completionRate.toFixed(1)}%
            </div>
            <p className="text-sm text-muted-foreground">
              {totalCompletions} de {totalStarts} completaram
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taxa de Conversão
              </CardTitle>
              <UserPlus className="w-4 h-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {conversionRate.toFixed(1)}%
            </div>
            <p className="text-sm text-muted-foreground">
              {totalLeads} leads gerados
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="funnel">Funil de Conversão</TabsTrigger>
          <TabsTrigger value="questions">Performance das Perguntas</TabsTrigger>
          <TabsTrigger value="answers">Distribuição das Respostas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance ao Longo do Tempo</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="views" 
                    stackId="1" 
                    stroke="#94A3B8" 
                    fill="#94A3B8" 
                    fillOpacity={0.3}
                    name="Visualizações"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="starts" 
                    stackId="1" 
                    stroke="#2563EB" 
                    fill="#2563EB" 
                    fillOpacity={0.6}
                    name="Iniciaram"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="completions" 
                    stackId="1" 
                    stroke="#059669" 
                    fill="#059669" 
                    fillOpacity={0.8}
                    name="Completaram"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="leads" 
                    stackId="1" 
                    stroke="#7C3AED" 
                    fill="#7C3AED" 
                    name="Leads"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Funil de Conversão</CardTitle>
              <p className="text-muted-foreground">
                Visualize onde os usuários abandonam o quiz
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {funnelData.map((stage, index) => (
                  <div key={stage.stage} className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{stage.stage}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {stage.count.toLocaleString()}
                        </span>
                        <Badge variant="secondary">
                          {stage.percentage.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-8 relative overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          index === 0 ? 'bg-gray-400' :
                          index === 1 ? 'bg-blue-500' :
                          index === 2 ? 'bg-green-500' :
                          'bg-purple-500'
                        }`}
                        style={{ width: `${stage.percentage}%` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center text-white font-medium">
                        {stage.count.toLocaleString()} ({stage.percentage.toFixed(1)}%)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance por Pergunta</CardTitle>
              <p className="text-muted-foreground">
                Identifique onde os usuários mais abandonam o quiz
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={questionPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="question" />
                  <YAxis />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 border rounded-lg shadow-lg">
                            <p className="font-medium">{data.title}</p>
                            <p className="text-blue-600">
                              Respostas: {data.answers}
                            </p>
                            <p className="text-red-600">
                              Taxa de abandono: {data.dropoffRate.toFixed(1)}%
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="answers" fill="#2563EB" name="Respostas" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="answers" className="space-y-4">
          {quiz?.questions
            .filter(q => q.type === 'single' || q.type === 'multiple')
            .map((question, index) => {
              const distribution = getAnswerDistribution(question.id);
              
              return (
                <Card key={question.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {question.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        {distribution.map((item, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{item.label}</span>
                              <span>{item.count} ({item.percentage.toFixed(1)}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full transition-all duration-500"
                                style={{ 
                                  width: `${item.percentage}%`,
                                  backgroundColor: colors[idx % colors.length]
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-center">
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={distribution}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={80}
                              dataKey="count"
                              label={({ percentage }) => `${percentage.toFixed(1)}%`}
                            >
                              {distribution.map((entry, idx) => (
                                <Cell key={idx} fill={colors[idx % colors.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalytics;