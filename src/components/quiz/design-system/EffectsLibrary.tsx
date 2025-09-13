import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { QuizTheme } from '@/types/quiz';
import { 
  Sparkles, 
  Play, 
  Pause,
  Volume2,
  VolumeX,
  Eye,
  Zap,
  Palette,
  Film,
  Star
} from 'lucide-react';

interface EffectsLibraryProps {
  theme: QuizTheme;
  onUpdate: (theme: QuizTheme) => void;
}

const gradientPresets = [
  { name: 'Resultado Elevado', value: 'linear-gradient(135deg, hsl(217, 91%, 46%), hsl(217, 91%, 56%))' },
  { name: 'Oceano', value: 'linear-gradient(135deg, hsl(195, 85%, 45%), hsl(220, 100%, 50%))' },
  { name: 'Pôr do Sol', value: 'linear-gradient(135deg, hsl(25, 95%, 58%), hsl(340, 75%, 55%))' },
  { name: 'Floresta', value: 'linear-gradient(135deg, hsl(142, 76%, 36%), hsl(158, 64%, 52%))' },
  { name: 'Roxo Místico', value: 'linear-gradient(135deg, hsl(280, 65%, 60%), hsl(265, 75%, 65%))' },
  { name: 'Fogo', value: 'linear-gradient(135deg, hsl(0, 85%, 55%), hsl(25, 95%, 58%))' },
  { name: 'Céu Noturno', value: 'linear-gradient(135deg, hsl(220, 30%, 15%), hsl(240, 50%, 25%))' },
  { name: 'Aurora', value: 'linear-gradient(135deg, hsl(160, 70%, 50%), hsl(280, 60%, 60%))' }
];

const animationPresets = [
  {
    name: 'Entrada Suave',
    value: 'fade-in',
    description: 'Elementos aparecem gradualmente',
    demo: 'animate-fade-in'
  },
  {
    name: 'Escala Dinâmica',
    value: 'scale-in',
    description: 'Elementos crescem ao aparecer',
    demo: 'animate-scale-in'
  },
  {
    name: 'Deslizar para Cima',
    value: 'slide-up',
    description: 'Elementos sobem da parte inferior',
    demo: 'animate-slide-up'
  },
  {
    name: 'Zoom Interativo',
    value: 'zoom-in',
    description: 'Efeito de zoom suave',
    demo: 'animate-zoom-in'
  },
  {
    name: 'Bounce Divertido',
    value: 'bounce',
    description: 'Efeito de bounce nos botões',
    demo: 'animate-bounce'
  }
];

const particleEffects = [
  { name: 'Confetti', value: 'confetti', description: 'Chuva de confetes' },
  { name: 'Estrelas', value: 'stars', description: 'Efeito de estrelas cadentes' },
  { name: 'Bolhas', value: 'bubbles', description: 'Bolhas flutuantes' },
  { name: 'Corações', value: 'hearts', description: 'Corações voadores' },
  { name: 'Fogos de Artifício', value: 'fireworks', description: 'Explosão de cores' }
];

export function EffectsLibrary({ theme, onUpdate }: EffectsLibraryProps) {
  const [previewAnimation, setPreviewAnimation] = useState<string | null>(null);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  const updateTheme = (updates: Partial<QuizTheme>) => {
    onUpdate({ ...theme, ...updates });
  };

  const playAnimationPreview = (animation: string) => {
    setPreviewAnimation(animation);
    setTimeout(() => setPreviewAnimation(null), 1000);
  };

  return (
    <div className="space-y-6">
      {/* Background Effects */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Fundos e Gradientes</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {gradientPresets.map((gradient) => (
              <div
                key={gradient.name}
                className="relative aspect-video rounded-lg cursor-pointer overflow-hidden border-2 border-transparent hover:border-primary transition-all"
                style={{ background: gradient.value }}
                onClick={() => updateTheme({ backgroundGradient: gradient.value })}
              >
                <div className="absolute inset-0 bg-black/20 flex items-end p-2">
                  <span className="text-white text-xs font-medium">
                    {gradient.name}
                  </span>
                </div>
                {theme.backgroundGradient === gradient.value && (
                  <div className="absolute top-1 right-1">
                    <div className="bg-primary rounded-full p-1">
                      <Star className="w-3 h-3 text-primary-foreground fill-current" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="useBackgroundGradient"
              checked={theme.useBackgroundGradient || false}
              onCheckedChange={(checked) => updateTheme({ useBackgroundGradient: checked })}
            />
            <Label htmlFor="useBackgroundGradient">Usar gradiente de fundo</Label>
          </div>
        </div>
      </Card>

      {/* Video Background */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Vídeo de Fundo</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="useVideoBackground"
                checked={theme.useVideoBackground || false}
                onCheckedChange={(checked) => updateTheme({ useVideoBackground: checked })}
              />
              <Label htmlFor="useVideoBackground">Usar vídeo de fundo</Label>
            </div>

            {theme.useVideoBackground && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">URL do Vídeo</Label>
                  <Textarea
                    placeholder="https://exemplo.com/video.mp4 ou código embed do YouTube/Vimeo"
                    value={theme.videoBackgroundUrl || ''}
                    onChange={(e) => updateTheme({ videoBackgroundUrl: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Opacidade do Overlay</Label>
                    <Slider
                      value={[parseFloat(theme.videoOverlayOpacity || '0.5')]}
                      onValueChange={([value]) => updateTheme({ videoOverlayOpacity: value.toString() })}
                      max={1}
                      min={0}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {Math.round((parseFloat(theme.videoOverlayOpacity || '0.5')) * 100)}%
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="videoAutoplay"
                        checked={theme.videoAutoplay !== false}
                        onCheckedChange={(checked) => updateTheme({ videoAutoplay: checked })}
                      />
                      <Label htmlFor="videoAutoplay">Autoplay</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="videoMuted"
                        checked={theme.videoMuted !== false}
                        onCheckedChange={(checked) => updateTheme({ videoMuted: checked })}
                      />
                      <Label htmlFor="videoMuted">Sem som</Label>
                    </div>
                  </div>
                </div>

                {/* Video Preview */}
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setIsPlayingVideo(!isPlayingVideo)}
                      className="bg-black/20 border-white/20 text-white hover:bg-black/40"
                    >
                      {isPlayingVideo ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Pausar Preview
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Preview do Vídeo
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Animations */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Animações</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {animationPresets.map((animation) => (
              <Card
                key={animation.name}
                className={`p-4 cursor-pointer transition-all hover:ring-2 hover:ring-primary ${
                  theme.defaultAnimation === animation.value ? 'ring-2 ring-primary bg-primary/5' : ''
                } ${previewAnimation === animation.demo ? animation.demo : ''}`}
                onClick={() => updateTheme({ defaultAnimation: animation.value })}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{animation.name}</h4>
                    <p className="text-sm text-muted-foreground">{animation.description}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      playAnimationPreview(animation.demo);
                    }}
                  >
                    <Play className="w-3 h-3" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div>
            <Label className="text-sm font-medium">Velocidade das Animações</Label>
            <Select
              value={theme.animationSpeed || 'normal'}
              onValueChange={(value) => updateTheme({ animationSpeed: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="slow">Lenta (0.5s)</SelectItem>
                <SelectItem value="normal">Normal (0.3s)</SelectItem>
                <SelectItem value="fast">Rápida (0.2s)</SelectItem>
                <SelectItem value="instant">Instantânea (0.1s)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Particle Effects */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Efeitos de Partículas</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="useParticleEffects"
                checked={theme.useParticleEffects || false}
                onCheckedChange={(checked) => updateTheme({ useParticleEffects: checked })}
              />
              <Label htmlFor="useParticleEffects">Ativar efeitos de partículas</Label>
            </div>

            {theme.useParticleEffects && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Efeito ao Completar Quiz</Label>
                  <Select
                    value={theme.completionEffect || 'confetti'}
                    onValueChange={(value) => updateTheme({ completionEffect: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {particleEffects.map((effect) => (
                        <SelectItem key={effect.value} value={effect.value}>
                          {effect.name} - {effect.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Intensidade do Efeito</Label>
                  <Slider
                    value={[parseInt(theme.effectIntensity || '50')]}
                    onValueChange={([value]) => updateTheme({ effectIntensity: value.toString() })}
                    max={100}
                    min={10}
                    step={10}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {theme.effectIntensity || '50'}%
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="effectOnCorrectAnswer"
                    checked={theme.effectOnCorrectAnswer || false}
                    onCheckedChange={(checked) => updateTheme({ effectOnCorrectAnswer: checked })}
                  />
                  <Label htmlFor="effectOnCorrectAnswer">Efeito em respostas corretas</Label>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Sound Effects */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Efeitos Sonoros</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="useSoundEffects"
                checked={theme.useSoundEffects || false}
                onCheckedChange={(checked) => updateTheme({ useSoundEffects: checked })}
              />
              <Label htmlFor="useSoundEffects">Ativar efeitos sonoros</Label>
            </div>

            {theme.useSoundEffects && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Volume</Label>
                  <Slider
                    value={[parseFloat(theme.soundVolume || '0.5')]}
                    onValueChange={([value]) => updateTheme({ soundVolume: value.toString() })}
                    max={1}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {Math.round((parseFloat(theme.soundVolume || '0.5')) * 100)}%
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="soundOnClick"
                      checked={theme.soundOnClick || false}
                      onCheckedChange={(checked) => updateTheme({ soundOnClick: checked })}
                    />
                    <Label htmlFor="soundOnClick">Som ao clicar</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="soundOnComplete"
                      checked={theme.soundOnComplete !== false}
                      onCheckedChange={(checked) => updateTheme({ soundOnComplete: checked })}
                    />
                    <Label htmlFor="soundOnComplete">Som ao completar</Label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Preview Section */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-4 h-4" />
          <h4 className="font-medium">Preview dos Efeitos</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            className="aspect-video rounded-lg border p-4 flex items-center justify-center relative overflow-hidden"
            style={{ 
              background: theme.useBackgroundGradient && theme.backgroundGradient 
                ? theme.backgroundGradient 
                : theme.background || 'hsl(0, 0%, 100%)'
            }}
          >
            <div className="text-center z-10">
              <h3 className="font-bold text-lg mb-2" style={{ color: theme.text }}>
                Preview do Fundo
              </h3>
              <Button
                onClick={() => playAnimationPreview('animate-confetti')}
                style={{ 
                  backgroundColor: theme.primary,
                  color: 'white'
                }}
              >
                Testar Efeitos
              </Button>
            </div>
            
            {/* Animated background elements */}
            {theme.useParticleEffects && previewAnimation && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className={`absolute w-2 h-2 bg-primary rounded animate-confetti`}
                    style={{
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`,
                      animationDuration: `${2 + Math.random() * 2}s`
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium">Configurações Ativas:</h4>
            <ul className="space-y-1 text-sm">
              {theme.useBackgroundGradient && (
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Gradiente de fundo ativo
                </li>
              )}
              {theme.useVideoBackground && (
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Vídeo de fundo ativo
                </li>
              )}
              {theme.useParticleEffects && (
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Efeitos de partículas: {theme.completionEffect}
                </li>
              )}
              {theme.useSoundEffects && (
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Efeitos sonoros ativos
                </li>
              )}
              {theme.defaultAnimation && (
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Animação: {theme.defaultAnimation}
                </li>
              )}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}