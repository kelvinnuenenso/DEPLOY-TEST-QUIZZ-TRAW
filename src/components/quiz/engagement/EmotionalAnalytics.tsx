import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QuizTheme } from '@/types/quiz';
import { useIsMobile } from '@/hooks/use-mobile';
import { EmotionalProgressPreview } from './EmotionalProgressPreview';
import { 
  Brain, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  CheckCircle,
  BarChart3
} from 'lucide-react';

interface EmotionalAnalyticsProps {
  theme: QuizTheme;
  onUpdate: (theme: QuizTheme) => void;
  quizId: string;
}

export function EmotionalAnalytics({ theme, onUpdate, quizId }: EmotionalAnalyticsProps) {
  const isMobile = useIsMobile();
  
  const getEmotionalConfig = () => ({
    enabled: theme.emotionalAnalyticsEnabled || false,
    responseTimeTracking: theme.responseTimeTracking || false,
    thresholds: {
      fastResponse: theme.fastResponseThreshold || 3000, // 3 seconds
      slowResponse: theme.slowResponseThreshold || 15000, // 15 seconds
    },
    insights: {
      showInAnalytics: theme.showEmotionalInsights || true,
      realTimeAlerts: theme.realTimeEmotionalAlerts || false,
    }
  });

  const config = getEmotionalConfig();

  const handleUpdate = (updates: Partial<QuizTheme>) => {
    onUpdate({ ...theme, ...updates });
  };

  // Mock data for preview
  const mockInsights = [
    {
      question: "Qual é seu maior desafio profissional?",
      avgTime: 12000,
      insight: "Essa pergunta gerou dúvida",
      type: "slow",
      icon: AlertCircle,
      color: "text-amber-600"
    },
    {
      question: "Você prefere trabalhar em equipe?",
      avgTime: 2000,
      insight: "Essa gerou engajamento rápido",
      type: "fast",
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      question: "Como você se organiza no trabalho?",
      avgTime: 8000,
      insight: "Tempo ideal de reflexão",
      type: "normal",
      icon: Clock,
      color: "text-blue-600"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Configuration */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-lg p-2">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Análise Emocional por Tempo de Resposta</h3>
              <p className="text-sm text-muted-foreground">
                Gera insights automáticos baseados no tempo que os usuários levam para responder
              </p>
            </div>
          </div>
          <Switch
            checked={config.enabled}
            onCheckedChange={(enabled) => handleUpdate({ emotionalAnalyticsEnabled: enabled })}
          />
        </div>

        {config.enabled && (
          <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Rastreamento de Tempo de Resposta</Label>
              <Switch
                checked={config.responseTimeTracking}
                onCheckedChange={(enabled) => handleUpdate({ responseTimeTracking: enabled })}
              />
            </div>
          </div>
        )}
      </Card>

      {config.enabled && (
        <>
          {/* Thresholds Configuration */}
          <Card className="p-6">
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Configuração de Limites de Tempo
            </h4>
            
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Resposta Rápida (Engajamento Alto)
                </Label>
                <div className="space-y-2">
                  <Slider
                    value={[config.thresholds.fastResponse / 1000]}
                    onValueChange={([value]) => handleUpdate({ 
                      fastResponseThreshold: value * 1000 
                    })}
                    min={1}
                    max={10}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1s</span>
                    <span className="font-medium">
                      {config.thresholds.fastResponse / 1000}s
                    </span>
                    <span>10s</span>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Resposta Lenta (Reflexão/Dúvida)
                </Label>
                <div className="space-y-2">
                  <Slider
                    value={[config.thresholds.slowResponse / 1000]}
                    onValueChange={([value]) => handleUpdate({ 
                      slowResponseThreshold: value * 1000 
                    })}
                    min={10}
                    max={30}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>10s</span>
                    <span className="font-medium">
                      {config.thresholds.slowResponse / 1000}s
                    </span>
                    <span>30s</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Insights Configuration */}
          <Card className="p-6">
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Configuração de Insights
            </h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Exibir no Analytics</Label>
                  <p className="text-xs text-muted-foreground">
                    Mostrar insights emocionais na aba Analytics
                  </p>
                </div>
                <Switch
                  checked={config.insights.showInAnalytics}
                  onCheckedChange={(enabled) => handleUpdate({ showEmotionalInsights: enabled })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Alertas em Tempo Real</Label>
                  <p className="text-xs text-muted-foreground">
                    Notificar sobre padrões de comportamento durante o quiz
                  </p>
                </div>
                <Switch
                  checked={config.insights.realTimeAlerts}
                  onCheckedChange={(enabled) => handleUpdate({ realTimeEmotionalAlerts: enabled })}
                />
              </div>
            </div>
          </Card>

          {/* Preview of Insights */}
          <Card className="p-6">
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Pré-visualização dos Insights
            </h4>
            
            <div className="space-y-3">
              {mockInsights.map((insight, index) => {
                const Icon = insight.icon;
                return (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <Icon className={`w-5 h-5 mt-0.5 ${insight.color}`} />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{insight.question}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {insight.insight} • Tempo médio: {(insight.avgTime / 1000).toFixed(1)}s
                      </p>
                    </div>
                    <Badge variant={
                      insight.type === 'fast' ? 'default' : 
                      insight.type === 'slow' ? 'destructive' : 'secondary'
                    }>
                      {insight.type === 'fast' && 'Rápido'}
                      {insight.type === 'slow' && 'Lento'}
                      {insight.type === 'normal' && 'Normal'}
                    </Badge>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/50 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                💡 <strong>Como funciona:</strong> O sistema analisa o tempo de resposta de cada pergunta 
                e gera insights automáticos que aparecem no Analytics, ajudando você a entender 
                quais perguntas geram mais engajamento ou dúvidas.
              </p>
            </div>
          </Card>

          {/* Preview do Progresso Inteligente com Emoção */}
          <EmotionalProgressPreview
            animationStyle={theme.defaultAnimation as 'emotional' | 'smooth' | 'dynamic' || 'emotional'}
            theme={{
              primary: theme.primary,
              accent: theme.accent,
              background: theme.background,
              text: theme.text
            }}
          />
        </>
      )}
    </div>
  );
}