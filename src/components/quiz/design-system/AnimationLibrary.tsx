import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { QuizTheme } from '@/types/quiz';
import { 
  Play, 
  Pause,
  RotateCcw,
  Zap,
  Sparkles,
  Wind,
  MousePointer,
  Eye
} from 'lucide-react';

interface AnimationLibraryProps {
  theme: QuizTheme;
  onUpdate: (theme: QuizTheme) => void;
}

const entranceAnimations = [
  { 
    id: 'fade-in', 
    name: 'Fade In', 
    description: 'Aparece gradualmente',
    class: 'animate-fade-in',
    intensity: ['subtle', 'normal', 'strong']
  },
  { 
    id: 'slide-up', 
    name: 'Slide Up', 
    description: 'Desliza de baixo para cima',
    class: 'animate-slide-up',
    intensity: ['subtle', 'normal', 'strong']
  },
  { 
    id: 'scale-in', 
    name: 'Scale In', 
    description: 'Cresce do centro',
    class: 'animate-scale-in',
    intensity: ['subtle', 'normal', 'strong']
  },
  { 
    id: 'bounce-in', 
    name: 'Bounce In', 
    description: 'Entrada com efeito de salto',
    class: 'animate-bounce-in',
    intensity: ['subtle', 'normal', 'strong']
  },
  { 
    id: 'rotate-in', 
    name: 'Rotate In', 
    description: 'Entra girando',
    class: 'animate-rotate-in',
    intensity: ['subtle', 'normal', 'strong']
  }
];

const hoverAnimations = [
  { 
    id: 'lift', 
    name: 'Lift', 
    description: 'Eleva suavemente',
    class: 'hover:animate-lift',
    intensity: ['subtle', 'normal', 'strong']
  },
  { 
    id: 'pulse', 
    name: 'Pulse', 
    description: 'Pulsa suavemente',
    class: 'hover:animate-pulse',
    intensity: ['subtle', 'normal', 'strong']
  },
  { 
    id: 'shake', 
    name: 'Shake', 
    description: 'Balança levemente',
    class: 'hover:animate-shake',
    intensity: ['subtle', 'normal', 'strong']
  },
  { 
    id: 'glow', 
    name: 'Glow', 
    description: 'Efeito de brilho',
    class: 'hover:animate-glow',
    intensity: ['subtle', 'normal', 'strong']
  }
];

const transitionAnimations = [
  { 
    id: 'slide-left', 
    name: 'Slide Left', 
    description: 'Desliza para a esquerda',
    class: 'animate-slide-left',
    intensity: ['subtle', 'normal', 'strong']
  },
  { 
    id: 'slide-right', 
    name: 'Slide Right', 
    description: 'Desliza para a direita',
    class: 'animate-slide-right',
    intensity: ['subtle', 'normal', 'strong']
  },
  { 
    id: 'flip', 
    name: 'Flip', 
    description: 'Vira como uma carta',
    class: 'animate-flip',
    intensity: ['subtle', 'normal', 'strong']
  },
  { 
    id: 'zoom-out', 
    name: 'Zoom Out', 
    description: 'Diminui e some',
    class: 'animate-zoom-out',
    intensity: ['subtle', 'normal', 'strong']
  }
];

export function AnimationLibrary({ theme, onUpdate }: AnimationLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState<'entrance' | 'hover' | 'transition'>('entrance');
  const [previewAnimation, setPreviewAnimation] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const updateTheme = (updates: Partial<QuizTheme>) => {
    onUpdate({ ...theme, ...updates });
  };

  const handleAnimationSelect = (animationId: string, category: string) => {
    const field = `${category}Animation` as keyof QuizTheme;
    updateTheme({ [field]: animationId });
  };

  const playPreview = (animationClass: string) => {
    setPreviewAnimation(animationClass);
    setIsPlaying(true);
    setTimeout(() => {
      setIsPlaying(false);
      setPreviewAnimation(null);
    }, 1500);
  };

  const getCurrentAnimations = () => {
    switch (selectedCategory) {
      case 'entrance': return entranceAnimations;
      case 'hover': return hoverAnimations;
      case 'transition': return transitionAnimations;
      default: return entranceAnimations;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Biblioteca de Animações
          </h3>
          <p className="text-sm text-muted-foreground">
            Adicione movimento e personalidade ao seu quiz
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateTheme({ 
              defaultAnimation: 'none',
              animationSpeed: 'normal'
            })}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Resetar
          </Button>
        </div>
      </div>

      {/* Configurações Globais */}
      <Card className="p-4">
        <div className="space-y-4">
          <h4 className="font-medium">Configurações Globais</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm">Velocidade da Animação</Label>
              <Select
                value={theme.animationSpeed || 'normal'}
                onValueChange={(value) => updateTheme({ animationSpeed: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slow">Lenta (0.8s)</SelectItem>
                  <SelectItem value="normal">Normal (0.5s)</SelectItem>
                  <SelectItem value="fast">Rápida (0.3s)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm">Intensidade do Efeito</Label>
              <Select
                value={theme.effectIntensity || 'normal'}
                onValueChange={(value) => updateTheme({ effectIntensity: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="subtle">Sutil</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="strong">Forte</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="reduce-motion">Respeitar Preferências de Movimento</Label>
              <Switch
                id="reduce-motion"
                checked={theme.respectMotionPreference !== false}
                onCheckedChange={(checked) => updateTheme({ respectMotionPreference: checked })}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Seletor de Categoria */}
      <div className="flex gap-2">
        {[
          { id: 'entrance', label: 'Entrada', icon: Wind },
          { id: 'hover', label: 'Hover', icon: MousePointer },
          { id: 'transition', label: 'Transição', icon: Zap }
        ].map((category) => {
          const Icon = category.icon;
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id as any)}
              className="gap-2"
            >
              <Icon className="w-4 h-4" />
              {category.label}
            </Button>
          );
        })}
      </div>

      {/* Lista de Animações */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {getCurrentAnimations().map((animation) => (
          <Card 
            key={animation.id}
            className={`p-4 cursor-pointer transition-all hover:ring-2 hover:ring-primary ${
              theme[`${selectedCategory}Animation` as keyof QuizTheme] === animation.id 
                ? 'ring-2 ring-primary bg-primary/5' : ''
            }`}
            onClick={() => handleAnimationSelect(animation.id, selectedCategory)}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{animation.name}</h4>
                  <p className="text-sm text-muted-foreground">{animation.description}</p>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    playPreview(animation.class);
                  }}
                  disabled={isPlaying}
                >
                  {isPlaying && previewAnimation === animation.class ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* Preview Box */}
              <div className="h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                <div 
                  className={`w-8 h-8 bg-primary rounded-lg ${
                    previewAnimation === animation.class ? previewAnimation : ''
                  }`}
                />
              </div>

              {/* Intensidade (se disponível) */}
              {animation.intensity && (
                <div className="flex gap-1">
                  {animation.intensity.map((level) => (
                    <Badge 
                      key={level} 
                      variant="outline" 
                      className="text-xs"
                    >
                      {level}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Preview em Tempo Real */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-4 h-4" />
          <h4 className="font-medium">Preview em Tempo Real</h4>
        </div>
        
        <div className="border rounded-lg p-8 flex items-center justify-center bg-gradient-to-br from-muted/50 to-background">
          <div className="text-center space-y-4">
            <div 
              className={`text-2xl font-bold ${
                theme.defaultAnimation ? `animate-${theme.defaultAnimation}` : ''
              }`}
            >
              Título do Quiz
            </div>
            <Button 
              className={`
                ${theme.hoverAnimation ? `hover:${theme.hoverAnimation}` : ''}
                transition-all duration-300
              `}
            >
              Começar Quiz
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}