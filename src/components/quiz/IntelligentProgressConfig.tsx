import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Brain, Zap, TrendingUp, Gauge } from 'lucide-react';
import { QuizTheme, IntelligentProgressConfig } from '@/types/quiz';

interface IntelligentProgressConfigProps {
  theme: QuizTheme;
  onThemeChange: (theme: QuizTheme) => void;
  totalSteps: number;
}

export const IntelligentProgressConfigComponent: React.FC<IntelligentProgressConfigProps> = ({
  theme,
  onThemeChange,
  totalSteps
}) => {
  const updateTheme = (updates: Partial<QuizTheme>) => {
    onThemeChange({ ...theme, ...updates });
  };

  const getDefaultConfig = (): IntelligentProgressConfig => ({
    enabled: theme.intelligentProgress || false,
    animationSpeed: theme.fakeProgressSpeed || 'normal',
    fastPhase: { startPercent: 0, endPercent: 50, progressMultiplier: 2.5 },
    linearPhase: { startPercent: 50, endPercent: 80, progressMultiplier: 1.0 },
    slowPhase: { startPercent: 80, endPercent: 100, progressMultiplier: 0.4 }
  });

  const config = theme.intelligentProgressConfig || getDefaultConfig();

  const updateConfig = (updates: Partial<IntelligentProgressConfig>) => {
    updateTheme({
      intelligentProgressConfig: {
        ...config,
        ...updates
      }
    });
  };

  const updatePhase = (phase: 'fastPhase' | 'linearPhase' | 'slowPhase', updates: any) => {
    updateConfig({
      [phase]: {
        ...config[phase],
        ...updates
      }
    });
  };

  // Calcular preview dos progressos para diferentes números de perguntas
  const getProgressPreview = (questionNumber: number) => {
    const predefined = [20, 35, 48, 58, 65, 72, 80, 86, 92, 100];
    if (totalSteps <= 10 && questionNumber <= predefined.length) {
      return predefined[questionNumber - 1];
    }
    
    // Cálculo dinâmico para preview
    const ratio = questionNumber / totalSteps;
    if (ratio <= 0.5) return Math.floor(15 + (ratio * 0.5 * 70 * config.fastPhase.progressMultiplier));
    if (ratio <= 0.8) return Math.floor(50 + ((ratio - 0.5) * 0.3 * 70 * config.linearPhase.progressMultiplier));
    return Math.floor(80 + ((ratio - 0.8) * 0.2 * 70 * config.slowPhase.progressMultiplier));
  };

  return (
    <div className="space-y-6">
      {/* Ativação do Progresso Inteligente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Progresso Inteligente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Ativar Progresso Inteligente</Label>
              <p className="text-sm text-muted-foreground">
                Sistema avançado com 3 fases: aceleração inicial, ritmo linear e desaceleração final
              </p>
            </div>
            <Switch
              checked={theme.intelligentProgress || false}
              onCheckedChange={(checked) => {
                updateTheme({ intelligentProgress: checked });
                updateConfig({ enabled: checked });
              }}
            />
          </div>

          {theme.intelligentProgress && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label>Velocidade da Animação</Label>
                <Select
                  value={config.animationSpeed}
                  onValueChange={(value) => updateConfig({ animationSpeed: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fast">Rápida (0.5s)</SelectItem>
                    <SelectItem value="normal">Normal (1s)</SelectItem>
                    <SelectItem value="slow">Lenta (2s)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Progresso Inicial (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="50"
                    value={theme.fakeProgressStartPercent || 15}
                    onChange={(e) => updateTheme({ fakeProgressStartPercent: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Progresso Final (%)</Label>
                  <Input
                    type="number"
                    min="50"
                    max="100"
                    value={theme.fakeProgressEndPercent || 85}
                    onChange={(e) => updateTheme({ fakeProgressEndPercent: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuração das 3 Fases */}
      {theme.intelligentProgress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="w-5 h-5" />
              Configuração das Fases
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Fase Rápida */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-green-500" />
                <Label className="text-base font-medium">Fase Rápida (Primeiras Perguntas)</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Progresso acelera nas primeiras perguntas para dar sensação de que vai terminar rápido
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Fim da Fase (%)</Label>
                  <Slider
                    value={[config.fastPhase.endPercent]}
                    onValueChange={([value]) => updatePhase('fastPhase', { endPercent: value })}
                    max={70}
                    min={30}
                    step={5}
                  />
                  <span className="text-xs text-muted-foreground">{config.fastPhase.endPercent}% do quiz</span>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Multiplicador de Velocidade</Label>
                  <Slider
                    value={[config.fastPhase.progressMultiplier]}
                    onValueChange={([value]) => updatePhase('fastPhase', { progressMultiplier: value })}
                    max={4}
                    min={1.5}
                    step={0.1}
                  />
                  <span className="text-xs text-muted-foreground">{config.fastPhase.progressMultiplier}x</span>
                </div>
              </div>
            </div>

            {/* Fase Linear */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <Label className="text-base font-medium">Fase Linear (Perguntas Intermediárias)</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Progresso em ritmo estável durante as perguntas do meio
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Fim da Fase (%)</Label>
                  <Slider
                    value={[config.linearPhase.endPercent]}
                    onValueChange={([value]) => updatePhase('linearPhase', { endPercent: value })}
                    max={90}
                    min={60}
                    step={5}
                  />
                  <span className="text-xs text-muted-foreground">{config.linearPhase.endPercent}% do quiz</span>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Multiplicador de Velocidade</Label>
                  <Slider
                    value={[config.linearPhase.progressMultiplier]}
                    onValueChange={([value]) => updatePhase('linearPhase', { progressMultiplier: value })}
                    max={2}
                    min={0.5}
                    step={0.1}
                  />
                  <span className="text-xs text-muted-foreground">{config.linearPhase.progressMultiplier}x</span>
                </div>
              </div>
            </div>

            {/* Fase Lenta */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-orange-500" />
                <Label className="text-base font-medium">Fase Lenta (Perguntas Finais)</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Progresso desacelera nas últimas perguntas para prolongar o engajamento
              </p>
              
              <div className="space-y-2">
                <Label className="text-sm">Multiplicador de Velocidade</Label>
                <Slider
                  value={[config.slowPhase.progressMultiplier]}
                  onValueChange={([value]) => updatePhase('slowPhase', { progressMultiplier: value })}
                  max={1}
                  min={0.2}
                  step={0.1}
                />
                <span className="text-xs text-muted-foreground">{config.slowPhase.progressMultiplier}x</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview em Tempo Real */}
      {theme.intelligentProgress && totalSteps > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Preview em Tempo Real</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Veja como a barra de progresso se comportará em um quiz de {totalSteps} perguntas:
              </p>
              
              <div className="grid grid-cols-5 gap-2 text-sm">
                {Array.from({ length: Math.min(totalSteps, 10) }, (_, i) => {
                  const questionNum = i + 1;
                  const progress = getProgressPreview(questionNum);
                  
                  return (
                    <div key={questionNum} className="text-center p-2 bg-muted rounded">
                      <div className="font-medium">P{questionNum}</div>
                      <div className="text-xs text-muted-foreground">{progress}%</div>
                    </div>
                  );
                })}
              </div>
              
              {totalSteps > 10 && (
                <p className="text-xs text-muted-foreground text-center">
                  Preview limitado às primeiras 10 perguntas
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};