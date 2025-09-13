import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Zap, 
  Star, 
  CheckCircle, 
  Trophy,
  Play,
  RotateCcw,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnimationStylePreviewProps {
  animationStyle?: string;
  completionEffect?: string;
  effectIntensity?: string;
  animationSpeed?: string;
}

const AnimationStylePreview: React.FC<AnimationStylePreviewProps> = ({
  animationStyle = 'bounce',
  completionEffect = 'confetti',
  effectIntensity = 'medium',
  animationSpeed = 'normal'
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentDemo, setCurrentDemo] = useState<'click' | 'progress' | 'completion' | 'micro'>('click');
  const [demoStep, setDemoStep] = useState(0);

  const animationStyles = {
    bounce: 'animate-bounce',
    pulse: 'animate-pulse',
    scale: 'hover-scale animate-scale-in',
    fade: 'animate-fade-in',
    slide: 'animate-slide-in-right',
    spin: 'animate-spin',
    wiggle: 'animate-[wiggle_0.5s_ease-in-out]',
    shake: 'animate-[shake_0.5s_ease-in-out]'
  };

  const completionEffects = {
    confetti: { icon: '🎉', label: 'Confetes' },
    fireworks: { icon: '🎆', label: 'Fogos' },
    stars: { icon: '✨', label: 'Estrelas' },
    sparkles: { icon: '💫', label: 'Brilhos' },
    trophy: { icon: '🏆', label: 'Troféu' },
    celebration: { icon: '🎊', label: 'Festa' }
  };

  const intensityLevels = {
    low: { scale: 'scale-105', duration: '1s' },
    medium: { scale: 'scale-110', duration: '0.8s' },
    high: { scale: 'scale-125', duration: '0.5s' }
  };

  const speedSettings = {
    slow: { duration: '2s', delay: '0.5s' },
    normal: { duration: '1s', delay: '0.3s' },
    fast: { duration: '0.5s', delay: '0.1s' }
  };

  const playDemo = (type: 'click' | 'progress' | 'completion' | 'micro') => {
    setCurrentDemo(type);
    setIsPlaying(true);
    setDemoStep(0);

    if (type === 'progress') {
      // Simular progresso em etapas
      const steps = [0, 25, 50, 75, 100];
      steps.forEach((step, index) => {
        setTimeout(() => {
          setDemoStep(step);
        }, index * 500);
      });
    } else if (type === 'micro') {
      // Simular micro-recompensas
      setTimeout(() => setDemoStep(1), 300);
      setTimeout(() => setDemoStep(2), 600);
      setTimeout(() => setDemoStep(3), 900);
    }

    setTimeout(() => {
      setIsPlaying(false);
      setDemoStep(0);
    }, type === 'progress' ? 3000 : type === 'micro' ? 1500 : 1000);
  };

  const resetDemo = () => {
    setIsPlaying(false);
    setDemoStep(0);
  };

  return (
    <div className="space-y-6">
      {/* Header com informações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Preview dos Estilos de Animação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Configurações Ativas:</div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Estilo: {animationStyle}</Badge>
                <Badge variant="secondary">Efeito: {completionEffect}</Badge>
                <Badge variant="secondary">Intensidade: {effectIntensity}</Badge>
                <Badge variant="secondary">Velocidade: {animationSpeed}</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Controles:</div>
              <div className="flex gap-2">
                <Button
                  onClick={resetDemo}
                  variant="outline"
                  size="sm"
                  className="gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demonstrações por Tipo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Animação de Clique */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Animação de Clique
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Feedback visual ao clicar em botões e opções
            </p>
            
            <div className="flex justify-center">
              <Button
                onClick={() => playDemo('click')}
                className={cn(
                  "transition-all duration-300",
                  isPlaying && currentDemo === 'click' && animationStyles[animationStyle as keyof typeof animationStyles]
                )}
                style={{
                  animationDuration: speedSettings[animationSpeed as keyof typeof speedSettings].duration
                }}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Testar Clique
              </Button>
            </div>

            <div className="text-center">
              <Badge variant="outline" className="text-xs">
                {animationStyle.charAt(0).toUpperCase() + animationStyle.slice(1)} Animation
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* 2. Animação de Progresso */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="w-4 h-4" />
              Animação de Progresso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Feedback visual durante o avanço no quiz
            </p>
            
            <div className="space-y-3">
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div 
                  className={cn(
                    "h-full bg-primary rounded-full transition-all",
                    isPlaying && currentDemo === 'progress' && 'animate-pulse'
                  )}
                  style={{ 
                    width: `${currentDemo === 'progress' ? demoStep : 0}%`,
                    transitionDuration: speedSettings[animationSpeed as keyof typeof speedSettings].duration
                  }}
                />
              </div>
              
              <div className="text-center">
                <Button
                  onClick={() => playDemo('progress')}
                  variant="outline"
                  size="sm"
                  disabled={isPlaying && currentDemo === 'progress'}
                >
                  <Play className="w-3 h-3 mr-1" />
                  {isPlaying && currentDemo === 'progress' ? `${demoStep}%` : 'Testar Progresso'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Efeito de Conclusão */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Efeito de Conclusão
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Celebração visual ao finalizar o quiz
            </p>
            
            <div className="flex flex-col items-center space-y-4">
              <div 
                className={cn(
                  "text-6xl transition-all duration-500",
                  isPlaying && currentDemo === 'completion' && [
                    animationStyles[animationStyle as keyof typeof animationStyles],
                    intensityLevels[effectIntensity as keyof typeof intensityLevels].scale
                  ]
                )}
                style={{
                  animationDuration: intensityLevels[effectIntensity as keyof typeof intensityLevels].duration
                }}
              >
                {completionEffects[completionEffect as keyof typeof completionEffects]?.icon || '🎉'}
              </div>
              
              <Button
                onClick={() => playDemo('completion')}
                variant="default"
                size="sm"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Testar {completionEffects[completionEffect as keyof typeof completionEffects]?.label}
              </Button>
              
              <Badge variant="outline" className="text-xs">
                Intensidade: {effectIntensity}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* 4. Micro-Recompensas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Micro-Recompensas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Feedback instantâneo a cada resposta
            </p>
            
            <div className="space-y-3">
              <div className="flex justify-center gap-3">
                {[0, 1, 2].map((index) => (
                  <div
                    key={index}
                    className={cn(
                      "w-8 h-8 rounded-full bg-muted flex items-center justify-center transition-all duration-300",
                      isPlaying && currentDemo === 'micro' && demoStep > index && [
                        "bg-primary text-primary-foreground",
                        animationStyles[animationStyle as keyof typeof animationStyles]
                      ]
                    )}
                  >
                    {isPlaying && currentDemo === 'micro' && demoStep > index ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/50" />
                    )}
                  </div>
                ))}
              </div>
              
              <div className="text-center">
                <Button
                  onClick={() => playDemo('micro')}
                  variant="outline"
                  size="sm"
                  disabled={isPlaying && currentDemo === 'micro'}
                >
                  <Star className="w-3 h-3 mr-1" />
                  {isPlaying && currentDemo === 'micro' ? `Etapa ${demoStep}` : 'Testar Sequência'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo das Configurações */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resumo da Configuração</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div><strong>Estilo de Animação:</strong> {animationStyle}</div>
              <div><strong>Velocidade:</strong> {speedSettings[animationSpeed as keyof typeof speedSettings].duration}</div>
            </div>
            <div className="space-y-2">
              <div><strong>Efeito de Conclusão:</strong> {completionEffects[completionEffect as keyof typeof completionEffects]?.label}</div>
              <div><strong>Intensidade:</strong> {effectIntensity} ({intensityLevels[effectIntensity as keyof typeof intensityLevels].scale})</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { AnimationStylePreview };