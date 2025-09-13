import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Quiz } from '@/types/quiz';
import { 
  BarChart3, TrendingUp, Users, Target, 
  ArrowRight, Clock, Zap, Award 
} from 'lucide-react';

interface FlowAnalyticsProps {
  quiz: Quiz;
}

export function FlowAnalytics({ quiz }: FlowAnalyticsProps) {
  // Dados mockados para demonstração
  const analyticsData = {
    totalViews: 1247,
    completionRate: 73,
    averageTime: '4m 32s',
    dropoffPoints: [
      { stepId: 'step-2', dropoff: 15, stepName: 'Pergunta sobre idade' },
      { stepId: 'step-5', dropoff: 8, stepName: 'Formulário de contato' },
      { stepId: 'step-7', dropoff: 4, stepName: 'Pergunta sobre orçamento' }
    ],
    pathAnalysis: [
      { path: 'Início → Pergunta 1 → Resultado A', users: 456, conversion: 67 },
      { path: 'Início → Pergunta 1 → Pergunta 2 → Resultado B', users: 321, conversion: 45 },
      { path: 'Início → Pergunta 1 → Condição → Resultado C', users: 234, conversion: 78 },
    ],
    stepPerformance: quiz.steps?.map((step, index) => ({
      stepId: step.id,
      stepName: step.title,
      views: Math.floor(Math.random() * 1000) + 200,
      completions: Math.floor(Math.random() * 800) + 150,
      averageTime: `${Math.floor(Math.random() * 3) + 1}m ${Math.floor(Math.random() * 59)}s`
    })) || []
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Analytics do Fluxo
        </h2>
        
        {/* Métricas Principais */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Visualizações</span>
            </div>
            <div className="text-2xl font-bold">{analyticsData.totalViews.toLocaleString()}</div>
            <Badge variant="outline" className="text-xs mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12% vs. mês anterior
            </Badge>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Taxa de Conclusão</span>
            </div>
            <div className="text-2xl font-bold">{analyticsData.completionRate}%</div>
            <Progress value={analyticsData.completionRate} className="mt-2" />
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium">Tempo Médio</span>
            </div>
            <div className="text-2xl font-bold">{analyticsData.averageTime}</div>
            <Badge variant="secondary" className="text-xs mt-1">
              Objetivo: 3-5min
            </Badge>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium">Score Médio</span>
            </div>
            <div className="text-2xl font-bold">78.5</div>
            <Badge variant="outline" className="text-xs mt-1">
              Máx: 100
            </Badge>
          </Card>
        </div>

        {/* Pontos de Abandono */}
        <Card className="p-4 mb-6">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-red-500" />
            Pontos de Maior Abandono
          </h3>
          
          <div className="space-y-3">
            {analyticsData.dropoffPoints.map((point, index) => (
              <div key={point.stepId} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <div className="font-medium text-sm">{point.stepName}</div>
                  <div className="text-xs text-muted-foreground">ID: {point.stepId}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-red-500">{point.dropoff}%</div>
                  <div className="text-xs text-muted-foreground">abandono</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Análise de Caminhos */}
        <Card className="p-4 mb-6">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-blue-500" />
            Caminhos Mais Percorridos
          </h3>
          
          <div className="space-y-3">
            {analyticsData.pathAnalysis.map((path, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-xs">
                    #{index + 1}
                  </Badge>
                  <div className="text-right">
                    <div className="text-sm font-medium">{path.users} usuários</div>
                    <div className="text-xs text-green-600">{path.conversion}% conversão</div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground font-mono">
                  {path.path}
                </div>
                <Progress value={path.conversion} className="mt-2" />
              </div>
            ))}
          </div>
        </Card>

        {/* Performance por Etapa */}
        <Card className="p-4">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-500" />
            Performance por Etapa
          </h3>
          
          <div className="space-y-3">
            {analyticsData.stepPerformance.map((step, index) => {
              const completionRate = Math.round((step.completions / step.views) * 100);
              return (
                <div key={step.stepId} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-medium text-sm">{step.stepName}</div>
                      <div className="text-xs text-muted-foreground">
                        Etapa {index + 1} • {step.averageTime}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{step.views} views</div>
                      <div className="text-xs text-green-600">{completionRate}% conclusão</div>
                    </div>
                  </div>
                  <Progress value={completionRate} className="mt-2" />
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}