import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { QuizTheme } from '@/types/quiz';
import { useIsMobile } from '@/hooks/use-mobile';
import { HexColorPicker } from 'react-colorful';
import { 
  Palette, 
  Zap, 
  Activity, 
  TrendingUp, 
  Eye,
  Play
} from 'lucide-react';

interface SmartProgressEditorProps {
  theme: QuizTheme;
  onUpdate: (theme: QuizTheme) => void;
  quizId: string;
}

export function SmartProgressEditor({ theme, onUpdate, quizId }: SmartProgressEditorProps) {
  const isMobile = useIsMobile();
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);

  const handleUpdate = (updates: Partial<QuizTheme>) => {
    onUpdate({ ...theme, ...updates });
  };

  const getSmartProgressConfig = () => ({
    enabled: theme.smartProgressEnabled || false,
    style: theme.smartProgressStyle || 'emotional',
    phases: {
      start: {
        color: theme.smartProgressStartColor || '#10B981',
        speed: theme.smartProgressStartSpeed || 2,
        duration: theme.smartProgressStartDuration || 40
      },
      middle: {
        color: theme.smartProgressMiddleColor || '#3B82F6',
        speed: theme.smartProgressMiddleSpeed || 1,
        duration: theme.smartProgressMiddleDuration || 40
      },
      end: {
        color: theme.smartProgressEndColor || '#F59E0B',
        speed: theme.smartProgressEndSpeed || 0.5,
        pulse: theme.smartProgressEndPulse || true,
        duration: theme.smartProgressEndDuration || 20
      }
    }
  });

  const config = getSmartProgressConfig();

  const updatePhase = (phase: 'start' | 'middle' | 'end', updates: any) => {
    handleUpdate({
      [`smartProgress${phase.charAt(0).toUpperCase() + phase.slice(1)}Color`]: updates.color,
      [`smartProgress${phase.charAt(0).toUpperCase() + phase.slice(1)}Speed`]: updates.speed,
      [`smartProgress${phase.charAt(0).toUpperCase() + phase.slice(1)}Duration`]: updates.duration,
      ...(phase === 'end' && { smartProgressEndPulse: updates.pulse })
    });
  };

  const previewProgress = (questionNumber: number, totalQuestions: number = 10) => {
    const percentage = questionNumber / totalQuestions;
    
    if (percentage <= config.phases.start.duration / 100) {
      return Math.min(percentage * config.phases.start.speed * 50, 100);
    } else if (percentage <= (config.phases.start.duration + config.phases.middle.duration) / 100) {
      const startProgress = (config.phases.start.duration / 100) * config.phases.start.speed * 50;
      const middleProgress = (percentage - config.phases.start.duration / 100) * config.phases.middle.speed * 100;
      return Math.min(startProgress + middleProgress, 100);
    } else {
      const startProgress = (config.phases.start.duration / 100) * config.phases.start.speed * 50;
      const middleProgress = (config.phases.middle.duration / 100) * config.phases.middle.speed * 100;
      const endProgress = (percentage - (config.phases.start.duration + config.phases.middle.duration) / 100) * config.phases.end.speed * 200;
      return Math.min(startProgress + middleProgress + endProgress, 100);
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Toggle */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-lg p-2">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Progresso Inteligente com Emoção</h3>
              <p className="text-sm text-muted-foreground">
                Barra de progresso que se adapta às fases do quiz com cores e velocidades diferentes
              </p>
            </div>
          </div>
          <Switch
            checked={config.enabled}
            onCheckedChange={(enabled) => handleUpdate({ smartProgressEnabled: enabled })}
          />
        </div>

        {config.enabled && (
          <div className="space-y-4">
            <Separator />
            
            {/* Style Selection */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Estilo de Animação</Label>
              <div className="grid grid-cols-3 gap-2">
                {['emotional', 'smooth', 'dynamic'].map((style) => (
                  <Button
                    key={style}
                    variant={config.style === style ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleUpdate({ smartProgressStyle: style })}
                  >
                    {style === 'emotional' && '🎯 Emocional'}
                    {style === 'smooth' && '🌊 Suave'}
                    {style === 'dynamic' && '⚡ Dinâmico'}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      {config.enabled && (
        <>
          {/* Phase Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Start Phase */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-green-600" />
                <h4 className="font-medium">Início Rápido</h4>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Cor</Label>
                  <div className="relative">
                    <div 
                      className="w-full h-8 rounded border cursor-pointer"
                      style={{ backgroundColor: config.phases.start.color }}
                      onClick={() => setShowColorPicker(showColorPicker === 'start' ? null : 'start')}
                    />
                    {showColorPicker === 'start' && (
                      <div className="absolute top-10 left-0 z-50">
                        <div className="bg-background border rounded-lg p-2 shadow-lg">
                          <HexColorPicker
                            color={config.phases.start.color}
                            onChange={(color) => updatePhase('start', { ...config.phases.start, color })}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    Velocidade: {config.phases.start.speed}x
                  </Label>
                  <Slider
                    value={[config.phases.start.speed]}
                    onValueChange={([speed]) => updatePhase('start', { ...config.phases.start, speed })}
                    min={0.5}
                    max={3}
                    step={0.1}
                  />
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    Duração: {config.phases.start.duration}%
                  </Label>
                  <Slider
                    value={[config.phases.start.duration]}
                    onValueChange={([duration]) => updatePhase('start', { ...config.phases.start, duration })}
                    min={20}
                    max={60}
                    step={5}
                  />
                </div>
              </div>
            </Card>

            {/* Middle Phase */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <h4 className="font-medium">Meio Estável</h4>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Cor</Label>
                  <div className="relative">
                    <div 
                      className="w-full h-8 rounded border cursor-pointer"
                      style={{ backgroundColor: config.phases.middle.color }}
                      onClick={() => setShowColorPicker(showColorPicker === 'middle' ? null : 'middle')}
                    />
                    {showColorPicker === 'middle' && (
                      <div className="absolute top-10 left-0 z-50">
                        <div className="bg-background border rounded-lg p-2 shadow-lg">
                          <HexColorPicker
                            color={config.phases.middle.color}
                            onChange={(color) => updatePhase('middle', { ...config.phases.middle, color })}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    Velocidade: {config.phases.middle.speed}x
                  </Label>
                  <Slider
                    value={[config.phases.middle.speed]}
                    onValueChange={([speed]) => updatePhase('middle', { ...config.phases.middle, speed })}
                    min={0.5}
                    max={2}
                    step={0.1}
                  />
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    Duração: {config.phases.middle.duration}%
                  </Label>
                  <Slider
                    value={[config.phases.middle.duration]}
                    onValueChange={([duration]) => updatePhase('middle', { ...config.phases.middle, duration })}
                    min={20}
                    max={60}
                    step={5}
                  />
                </div>
              </div>
            </Card>

            {/* End Phase */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-amber-600" />
                <h4 className="font-medium">Final Lento</h4>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Cor</Label>
                  <div className="relative">
                    <div 
                      className="w-full h-8 rounded border cursor-pointer"
                      style={{ backgroundColor: config.phases.end.color }}
                      onClick={() => setShowColorPicker(showColorPicker === 'end' ? null : 'end')}
                    />
                    {showColorPicker === 'end' && (
                      <div className="absolute top-10 left-0 z-50">
                        <div className="bg-background border rounded-lg p-2 shadow-lg">
                          <HexColorPicker
                            color={config.phases.end.color}
                            onChange={(color) => updatePhase('end', { ...config.phases.end, color })}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    Velocidade: {config.phases.end.speed}x
                  </Label>
                  <Slider
                    value={[config.phases.end.speed]}
                    onValueChange={([speed]) => updatePhase('end', { ...config.phases.end, speed })}
                    min={0.1}
                    max={1}
                    step={0.1}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Pulsação Suave</Label>
                  <Switch
                    checked={config.phases.end.pulse}
                    onCheckedChange={(pulse) => updatePhase('end', { ...config.phases.end, pulse })}
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Live Preview */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-4 h-4 text-primary" />
              <h4 className="font-medium">Pré-visualização em Tempo Real</h4>
            </div>
            
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 8, 10].map((questionNum) => {
                const progress = previewProgress(questionNum);
                const currentPhase = 
                  questionNum <= 4 ? 'start' : 
                  questionNum <= 7 ? 'middle' : 'end';
                
                return (
                  <div key={questionNum} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Pergunta {questionNum}</span>
                      <span className="text-muted-foreground">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          config.phases.end.pulse && currentPhase === 'end' 
                            ? 'animate-pulse' 
                            : ''
                        }`}
                        style={{ 
                          width: `${progress}%`,
                          backgroundColor: config.phases[currentPhase].color
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}