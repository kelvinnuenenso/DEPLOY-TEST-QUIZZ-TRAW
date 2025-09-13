import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Settings, Brain, TrendingUp, Zap } from 'lucide-react';
import { QuizTheme, StepProgressConfig, FunnelProgressConfig, FunnelStage } from '@/types/quiz';
import { IntelligentProgressConfigComponent } from './IntelligentProgressConfig';

interface SmartProgressConfigProps {
  theme: QuizTheme;
  onThemeChange: (theme: QuizTheme) => void;
  totalSteps: number;
}

export const SmartProgressConfig: React.FC<SmartProgressConfigProps> = ({
  theme,
  onThemeChange,
  totalSteps
}) => {
  const [activeStepConfig, setActiveStepConfig] = useState<number | null>(null);
  const [activeFunnelStage, setActiveFunnelStage] = useState<number | null>(null);

  const updateTheme = (updates: Partial<QuizTheme>) => {
    onThemeChange({ ...theme, ...updates });
  };

  const addStepConfig = () => {
    const newConfig: StepProgressConfig = {
      stepId: `step-${Date.now()}`,
      stepIndex: (theme.stepProgressConfig?.length || 0) + 1,
      progressWeight: 100 / totalSteps,
      progressSpeed: 'normal',
      progressStyle: 'linear',
      minProgressIncrease: 1,
      maxProgressIncrease: 25,
      dependsOnAnswers: false,
      complexityMultiplier: 1
    };

    updateTheme({
      stepProgressConfig: [...(theme.stepProgressConfig || []), newConfig]
    });
  };

  const updateStepConfig = (index: number, config: StepProgressConfig) => {
    const configs = [...(theme.stepProgressConfig || [])];
    configs[index] = config;
    updateTheme({ stepProgressConfig: configs });
  };

  const removeStepConfig = (index: number) => {
    const configs = [...(theme.stepProgressConfig || [])];
    configs.splice(index, 1);
    updateTheme({ stepProgressConfig: configs });
    setActiveStepConfig(null);
  };

  const addFunnelStage = () => {
    const newStage: FunnelStage = {
      id: `stage-${Date.now()}`,
      name: `Etapa ${(theme.funnelProgressConfig?.stages?.length || 0) + 1}`,
      stepIds: [],
      stageWeight: 25,
      progressBehavior: 'uniform',
      minimumTime: 1000,
      expectedTime: 5000,
      complexityFactor: 1
    };

    const currentConfig = theme.funnelProgressConfig || {
      enabled: false,
      stages: [],
      adaptiveSpeed: false,
      userBehaviorTracking: false,
      intelligentPrediction: false
    };

    updateTheme({
      funnelProgressConfig: {
        ...currentConfig,
        stages: [...currentConfig.stages, newStage]
      }
    });
  };

  const updateFunnelStage = (index: number, stage: FunnelStage) => {
    const currentConfig = theme.funnelProgressConfig!;
    const stages = [...currentConfig.stages];
    stages[index] = stage;
    
    updateTheme({
      funnelProgressConfig: {
        ...currentConfig,
        stages
      }
    });
  };

  const removeFunnelStage = (index: number) => {
    const currentConfig = theme.funnelProgressConfig!;
    const stages = [...currentConfig.stages];
    stages.splice(index, 1);
    
    updateTheme({
      funnelProgressConfig: {
        ...currentConfig,
        stages
      }
    });
    setActiveFunnelStage(null);
  };

  return (
    <div className="space-y-6">
      {/* Progress Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Modo de Progresso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo de Progresso</Label>
            <Select
              value={theme.progressMode || 'simple'}
              onValueChange={(value) => updateTheme({ progressMode: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simple">Simples (Uniforme)</SelectItem>
                <SelectItem value="smart">Inteligente (IA)</SelectItem>
                <SelectItem value="intelligent">Progresso Inteligente (3 Fases)</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(theme.progressMode === 'smart' || theme.progressMode === 'custom') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Progresso Inteligente</Label>
                <Switch
                  checked={theme.smartProgress || false}
                  onCheckedChange={(checked) => updateTheme({ smartProgress: checked })}
                />
              </div>
              
              {theme.smartProgress && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Início (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={theme.fakeProgressStartPercent || 0}
                      onChange={(e) => updateTheme({ fakeProgressStartPercent: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Final (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={theme.fakeProgressEndPercent || 95}
                      onChange={(e) => updateTheme({ fakeProgressEndPercent: Number(e.target.value) })}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuração de Progresso Inteligente */}
      {theme.progressMode === 'intelligent' && (
        <IntelligentProgressConfigComponent
          theme={theme}
          onThemeChange={onThemeChange}
          totalSteps={totalSteps}
        />
      )}

      {theme.smartProgress && theme.progressMode !== 'intelligent' && (
        <Tabs defaultValue="steps" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="steps" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Por Etapa
            </TabsTrigger>
            <TabsTrigger value="funnel" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Funil Inteligente
            </TabsTrigger>
          </TabsList>

          <TabsContent value="steps" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Configuração por Etapa</span>
                  <Button onClick={addStepConfig} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {theme.stepProgressConfig?.map((config, index) => (
                  <div key={config.stepId} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Etapa {config.stepIndex}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStepConfig(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Peso do Progresso (%)</Label>
                        <Slider
                          value={[config.progressWeight]}
                          onValueChange={([value]) => 
                            updateStepConfig(index, { ...config, progressWeight: value })
                          }
                          max={50}
                          min={1}
                          step={1}
                        />
                        <span className="text-sm text-muted-foreground">{config.progressWeight}%</span>
                      </div>

                      <div className="space-y-2">
                        <Label>Velocidade</Label>
                        <Select
                          value={config.progressSpeed || 'normal'}
                          onValueChange={(value) => 
                            updateStepConfig(index, { ...config, progressSpeed: value as any })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="instant">Instantâneo</SelectItem>
                            <SelectItem value="fast">Rápido</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="slow">Lento</SelectItem>
                            <SelectItem value="custom">Personalizado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Estilo da Animação</Label>
                        <Select
                          value={config.progressStyle || 'linear'}
                          onValueChange={(value) => 
                            updateStepConfig(index, { ...config, progressStyle: value as any })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="linear">Linear</SelectItem>
                            <SelectItem value="ease-in">Ease In</SelectItem>
                            <SelectItem value="ease-out">Ease Out</SelectItem>
                            <SelectItem value="bounce">Bounce</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Baseado nas Respostas</Label>
                          <Switch
                            checked={config.dependsOnAnswers || false}
                            onCheckedChange={(checked) => 
                              updateStepConfig(index, { ...config, dependsOnAnswers: checked })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {config.dependsOnAnswers && (
                      <div className="space-y-2">
                        <Label>Multiplicador de Complexidade</Label>
                        <Slider
                          value={[config.complexityMultiplier || 1]}
                          onValueChange={([value]) => 
                            updateStepConfig(index, { ...config, complexityMultiplier: value })
                          }
                          max={3}
                          min={0.1}
                          step={0.1}
                        />
                        <span className="text-sm text-muted-foreground">{config.complexityMultiplier}x</span>
                      </div>
                    )}
                  </div>
                )) || (
                  <div className="text-center py-8 text-muted-foreground">
                    <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma configuração por etapa ainda.</p>
                    <p className="text-sm">Clique em "Adicionar" para criar uma.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="funnel" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuração de Funil Inteligente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Ativar Funil Inteligente</Label>
                  <Switch
                    checked={theme.funnelProgressConfig?.enabled || false}
                    onCheckedChange={(checked) => 
                      updateTheme({
                        funnelProgressConfig: {
                          ...theme.funnelProgressConfig,
                          enabled: checked,
                          stages: theme.funnelProgressConfig?.stages || [],
                          adaptiveSpeed: theme.funnelProgressConfig?.adaptiveSpeed || false,
                          userBehaviorTracking: theme.funnelProgressConfig?.userBehaviorTracking || false,
                          intelligentPrediction: theme.funnelProgressConfig?.intelligentPrediction || false
                        }
                      })
                    }
                  />
                </div>

                {theme.funnelProgressConfig?.enabled && (
                  <>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Velocidade Adaptativa</Label>
                        <Switch
                          checked={theme.funnelProgressConfig.adaptiveSpeed}
                          onCheckedChange={(checked) => 
                            updateTheme({
                              funnelProgressConfig: {
                                ...theme.funnelProgressConfig,
                                adaptiveSpeed: checked
                              }
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Rastreamento de Comportamento</Label>
                        <Switch
                          checked={theme.funnelProgressConfig.userBehaviorTracking}
                          onCheckedChange={(checked) => 
                            updateTheme({
                              funnelProgressConfig: {
                                ...theme.funnelProgressConfig,
                                userBehaviorTracking: checked
                              }
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Predição Inteligente</Label>
                        <Switch
                          checked={theme.funnelProgressConfig.intelligentPrediction}
                          onCheckedChange={(checked) => 
                            updateTheme({
                              funnelProgressConfig: {
                                ...theme.funnelProgressConfig,
                                intelligentPrediction: checked
                              }
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Etapas do Funil</h4>
                      <Button onClick={addFunnelStage} size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Etapa
                      </Button>
                    </div>

                    {theme.funnelProgressConfig.stages?.map((stage, index) => (
                      <div key={stage.id} className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <Input
                            value={stage.name}
                            onChange={(e) => 
                              updateFunnelStage(index, { ...stage, name: e.target.value })
                            }
                            className="font-medium"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFunnelStage(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Peso da Etapa (%)</Label>
                            <Slider
                              value={[stage.stageWeight]}
                              onValueChange={([value]) => 
                                updateFunnelStage(index, { ...stage, stageWeight: value })
                              }
                              max={100}
                              min={5}
                              step={5}
                            />
                            <span className="text-sm text-muted-foreground">{stage.stageWeight}%</span>
                          </div>

                          <div className="space-y-2">
                            <Label>Comportamento do Progresso</Label>
                            <Select
                              value={stage.progressBehavior}
                              onValueChange={(value) => 
                                updateFunnelStage(index, { ...stage, progressBehavior: value as any })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="uniform">Uniforme</SelectItem>
                                <SelectItem value="accelerating">Acelerando</SelectItem>
                                <SelectItem value="decelerating">Desacelerando</SelectItem>
                                <SelectItem value="smart">Inteligente</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>IDs das Etapas (separados por vírgula)</Label>
                          <Input
                            value={stage.stepIds.join(', ')}
                            onChange={(e) => 
                              updateFunnelStage(index, { 
                                ...stage, 
                                stepIds: e.target.value.split(',').map(id => id.trim()).filter(Boolean)
                              })
                            }
                            placeholder="1, 2, 3"
                          />
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-8 text-muted-foreground">
                        <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhuma etapa de funil configurada.</p>
                        <p className="text-sm">Crie etapas para configurar o progresso inteligente.</p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};