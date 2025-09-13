import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { QuizTheme } from '@/types/quiz';
import { 
  Sparkles, 
  Play, 
  Palette,
  Zap,
  Crown,
  Heart,
  Star,
  Award
} from 'lucide-react';

interface ConfettiSystemProps {
  theme: QuizTheme;
  onUpdate: (theme: QuizTheme) => void;
}

const confettiPresets = [
  {
    id: 'celebration',
    name: 'Celebração',
    description: 'Confete multicolorido tradicional',
    colors: ['#f43f5e', '#3b82f6', '#eab308', '#22c55e', '#a855f7'],
    shapes: ['circle', 'square', 'triangle'],
    intensity: 'high',
    duration: 3000,
    icon: Crown
  },
  {
    id: 'success',
    name: 'Sucesso',
    description: 'Tons de verde e dourado',
    colors: ['#22c55e', '#eab308', '#84cc16', '#fbbf24'],
    shapes: ['circle', 'star'],
    intensity: 'medium',
    duration: 2500,
    icon: Award
  },
  {
    id: 'hearts',
    name: 'Corações',
    description: 'Corações românticos',
    colors: ['#f43f5e', '#ec4899', '#f97316', '#fbbf24'],
    shapes: ['heart'],
    intensity: 'medium',
    duration: 4000,
    icon: Heart
  },
  {
    id: 'stars',
    name: 'Estrelas',
    description: 'Chuva de estrelas douradas',
    colors: ['#fbbf24', '#f59e0b', '#eab308'],
    shapes: ['star'],
    intensity: 'high',
    duration: 3500,
    icon: Star
  },
  {
    id: 'minimal',
    name: 'Minimalista',
    description: 'Efeito sutil e elegante',
    colors: ['#6366f1', '#8b5cf6'],
    shapes: ['circle'],
    intensity: 'low',
    duration: 2000,
    icon: Sparkles
  }
];

const triggerEvents = [
  { id: 'quiz_complete', label: 'Ao Completar Quiz', description: 'Quando o usuário termina o quiz' },
  { id: 'perfect_score', label: 'Pontuação Perfeita', description: 'Quando atinge 100% de acertos' },
  { id: 'milestone', label: 'Marco Importante', description: 'Em marcos específicos do quiz' },
  { id: 'answer_correct', label: 'Resposta Correta', description: 'A cada resposta correta' },
  { id: 'level_up', label: 'Subir de Nível', description: 'Ao avançar de nível (gamificação)' }
];

const animationStyles = [
  { id: 'fall', name: 'Queda', description: 'Confete cai do topo' },
  { id: 'burst', name: 'Explosão', description: 'Explode do centro' },
  { id: 'rain', name: 'Chuva', description: 'Chuva contínua' },
  { id: 'fountain', name: 'Fonte', description: 'Jorra de baixo para cima' },
  { id: 'spiral', name: 'Espiral', description: 'Movimento em espiral' }
];

export function ConfettiSystem({ theme, onUpdate }: ConfettiSystemProps) {
  const [selectedPreset, setSelectedPreset] = useState(confettiPresets[0]);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  const updateTheme = (updates: Partial<QuizTheme>) => {
    onUpdate({ ...theme, ...updates });
  };

  const handlePresetSelect = (preset: typeof confettiPresets[0]) => {
    setSelectedPreset(preset);
    updateTheme({
      useConfetti: true,
      confettiPreset: preset.id,
      confettiColors: preset.colors,
      confettiIntensity: preset.intensity,
      confettiDuration: preset.duration,
      confettiShapes: preset.shapes
    });
  };

  const playPreview = () => {
    setIsPlayingPreview(true);
    // Simular confetti (em uma implementação real, você usaria uma biblioteca como canvas-confetti)
    setTimeout(() => {
      setIsPlayingPreview(false);
    }, selectedPreset.duration);
  };

  const addTriggerEvent = (eventId: string) => {
    const currentTriggers = theme.confettiTriggers || [];
    if (!currentTriggers.includes(eventId)) {
      updateTheme({
        confettiTriggers: [...currentTriggers, eventId]
      });
    }
  };

  const removeTriggerEvent = (eventId: string) => {
    const currentTriggers = theme.confettiTriggers || [];
    updateTheme({
      confettiTriggers: currentTriggers.filter(id => id !== eventId)
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Sistema de Confete
          </h3>
          <p className="text-sm text-muted-foreground">
            Adicione celebrações visuais para momentos especiais
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="confetti-enabled"
            checked={theme.useConfetti || false}
            onCheckedChange={(checked) => updateTheme({ useConfetti: checked })}
          />
          <Label htmlFor="confetti-enabled">Ativar Confete</Label>
        </div>
      </div>

      {theme.useConfetti && (
        <>
          {/* Presets */}
          <div>
            <h4 className="font-medium mb-4">Presets de Confete</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {confettiPresets.map((preset) => {
                const Icon = preset.icon;
                return (
                  <Card
                    key={preset.id}
                    className={`p-4 cursor-pointer transition-all hover:ring-2 hover:ring-primary ${
                      selectedPreset.id === preset.id ? 'ring-2 ring-primary bg-primary/5' : ''
                    }`}
                    onClick={() => handlePresetSelect(preset)}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Icon className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <h5 className="font-medium">{preset.name}</h5>
                            <p className="text-xs text-muted-foreground">{preset.description}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {preset.intensity}
                        </Badge>
                      </div>

                      {/* Preview das Cores */}
                      <div className="flex gap-1">
                        {preset.colors.slice(0, 4).map((color, index) => (
                          <div
                            key={index}
                            className="w-4 h-4 rounded-full border border-border"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                        {preset.colors.length > 4 && (
                          <div className="w-4 h-4 rounded-full bg-muted border border-border flex items-center justify-center">
                            <span className="text-xs">+{preset.colors.length - 4}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Configurações Customizadas */}
          <Card className="p-4">
            <div className="space-y-4">
              <h4 className="font-medium">Configurações Customizadas</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Intensidade</Label>
                    <Select
                      value={theme.confettiIntensity || 'medium'}
                      onValueChange={(value) => updateTheme({ confettiIntensity: value })}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa (50 partículas)</SelectItem>
                        <SelectItem value="medium">Média (100 partículas)</SelectItem>
                        <SelectItem value="high">Alta (200 partículas)</SelectItem>
                        <SelectItem value="extreme">Extrema (300 partículas)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Estilo de Animação</Label>
                    <Select
                      value={theme.confettiAnimation || 'fall'}
                      onValueChange={(value) => updateTheme({ confettiAnimation: value })}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {animationStyles.map((style) => (
                          <SelectItem key={style.id} value={style.id}>
                            {style.name} - {style.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Duração: {theme.confettiDuration || 3000}ms</Label>
                    <Slider
                      value={[theme.confettiDuration || 3000]}
                      onValueChange={([value]) => updateTheme({ confettiDuration: value })}
                      min={1000}
                      max={10000}
                      step={500}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Velocidade das Partículas</Label>
                    <Slider
                      value={[parseInt(theme.confettiSpeed || '50')]}
                      onValueChange={([value]) => updateTheme({ confettiSpeed: value.toString() })}
                      min={10}
                      max={100}
                      step={10}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Eventos de Trigger */}
          <Card className="p-4">
            <div className="space-y-4">
              <h4 className="font-medium">Quando Ativar o Confete</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {triggerEvents.map((event) => {
                  const isActive = (theme.confettiTriggers || []).includes(event.id);
                  
                  return (
                    <Card 
                      key={event.id}
                      className={`p-3 cursor-pointer transition-all hover:ring-2 hover:ring-primary ${
                        isActive ? 'ring-2 ring-primary bg-primary/5' : ''
                      }`}
                      onClick={() => {
                        if (isActive) {
                          removeTriggerEvent(event.id);
                        } else {
                          addTriggerEvent(event.id);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-sm">{event.label}</h5>
                          <p className="text-xs text-muted-foreground">{event.description}</p>
                        </div>
                        {isActive && <Zap className="w-4 h-4 text-primary" />}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Preview e Teste */}
          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Preview e Teste</h4>
                <Button 
                  onClick={playPreview}
                  disabled={isPlayingPreview}
                  className="gap-2"
                >
                  <Play className="w-4 h-4" />
                  {isPlayingPreview ? 'Reproduzindo...' : 'Testar Confete'}
                </Button>
              </div>

              <div className="border rounded-lg p-8 flex items-center justify-center bg-gradient-to-br from-muted/50 to-background relative overflow-hidden">
                <div className="text-center">
                  <div className="text-2xl font-bold mb-2">🎉 Parabéns!</div>
                  <p className="text-muted-foreground">Você completou o quiz!</p>
                </div>

                {/* Simulação visual do confete */}
                {isPlayingPreview && (
                  <div className="absolute inset-0 pointer-events-none">
                    {selectedPreset.colors.map((color, index) => (
                      <div
                        key={index}
                        className="absolute animate-bounce"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 20}%`,
                          backgroundColor: color,
                          width: '8px',
                          height: '8px',
                          borderRadius: selectedPreset.shapes.includes('circle') ? '50%' : '0',
                          animationDelay: `${Math.random() * 1000}ms`,
                          animationDuration: `${1000 + Math.random() * 2000}ms`
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Configurações Avançadas */}
          <Card className="p-4">
            <div className="space-y-4">
              <h4 className="font-medium">Configurações Avançadas</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="gravity">Aplicar Gravidade</Label>
                  <Switch
                    id="gravity"
                    checked={theme.confettiGravity !== false}
                    onCheckedChange={(checked) => updateTheme({ confettiGravity: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="wind">Efeito de Vento</Label>
                  <Switch
                    id="wind"
                    checked={theme.confettiWind || false}
                    onCheckedChange={(checked) => updateTheme({ confettiWind: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="fade">Desvanecer</Label>
                  <Switch
                    id="fade"
                    checked={theme.confettiFade !== false}
                    onCheckedChange={(checked) => updateTheme({ confettiFade: checked })}
                  />
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}