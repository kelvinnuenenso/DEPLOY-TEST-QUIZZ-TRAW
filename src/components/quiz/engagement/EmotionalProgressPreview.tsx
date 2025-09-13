import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Heart, 
  Brain, 
  Zap, 
  Play, 
  RotateCcw,
  ChevronRight,
  Timer,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmotionalProgressPreviewProps {
  animationStyle?: 'emotional' | 'smooth' | 'dynamic';
  theme?: {
    primary?: string;
    accent?: string;
    background?: string;
    text?: string;
  };
}

const EmotionalProgressPreview: React.FC<EmotionalProgressPreviewProps> = ({
  animationStyle = 'emotional',
  theme = {
    primary: '#3b82f6',
    accent: '#06b6d4',
    background: '#ffffff',
    text: '#1f2937'
  }
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'start' | 'fast' | 'normal' | 'slow' | 'complete'>('start');
  const [progress, setProgress] = useState(0);
  const [emotionalState, setEmotionalState] = useState<'excited' | 'focused' | 'thoughtful' | 'confident'>('excited');
  const [responseTime, setResponseTime] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const phases = {
    start: { 
      label: 'Início', 
      color: '#10b981', 
      progress: 15, 
      emotion: 'excited' as const,
      speed: 1.5,
      description: 'Engajamento inicial alto'
    },
    fast: { 
      label: 'Fase Rápida', 
      color: '#06b6d4', 
      progress: 45, 
      emotion: 'excited' as const,
      speed: 2.0,
      description: 'Respostas intuitivas'
    },
    normal: { 
      label: 'Fase Linear', 
      color: '#3b82f6', 
      progress: 70, 
      emotion: 'focused' as const,
      speed: 1.0,
      description: 'Reflexão equilibrada'
    },
    slow: { 
      label: 'Fase Reflexiva', 
      color: '#f59e0b', 
      progress: 85, 
      emotion: 'thoughtful' as const,
      speed: 0.6,
      description: 'Análise profunda'
    },
    complete: { 
      label: 'Conclusão', 
      color: '#8b5cf6', 
      progress: 100, 
      emotion: 'confident' as const,
      speed: 1.2,
      description: 'Finalização satisfatória'
    }
  };

  const animationStyles = {
    emotional: {
      className: 'animate-emotional-pulse',
      transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: 'heartbeat'
    },
    smooth: {
      className: 'animate-smooth-progress',
      transition: 'all 1.2s ease-in-out',
      transform: 'wave'
    },
    dynamic: {
      className: 'animate-dynamic-bounce',
      transition: 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      transform: 'bounce'
    }
  };

  const emotionalIndicators = {
    excited: { icon: '🚀', color: '#10b981', label: 'Empolgado' },
    focused: { icon: '🎯', color: '#3b82f6', label: 'Focado' },
    thoughtful: { icon: '🤔', color: '#f59e0b', label: 'Pensativo' },
    confident: { icon: '💪', color: '#8b5cf6', label: 'Confiante' }
  };

  const questions = [
    { text: "Qual é sua maior motivação?", expectedTime: 3000, phase: 'fast' },
    { text: "Como você se vê em 5 anos?", expectedTime: 8000, phase: 'normal' },
    { text: "Qual decisão mais difícil você já tomou?", expectedTime: 15000, phase: 'slow' },
    { text: "O que te faz feliz no trabalho?", expectedTime: 5000, phase: 'normal' },
    { text: "Qual é seu próximo objetivo?", expectedTime: 4000, phase: 'fast' }
  ];

  const playFullDemo = () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    setCurrentQuestion(0);
    const phaseSequence = ['start', 'fast', 'normal', 'slow', 'complete'] as const;
    
    phaseSequence.forEach((phase, index) => {
      setTimeout(() => {
        setCurrentPhase(phase);
        setProgress(phases[phase].progress);
        setEmotionalState(phases[phase].emotion);
        setResponseTime(index * 3000 + Math.random() * 2000);
        
        if (index < questions.length) {
          setCurrentQuestion(index);
        }
      }, index * 2000);
    });

    setTimeout(() => {
      setIsPlaying(false);
    }, phaseSequence.length * 2000);
  };

  const resetDemo = () => {
    setIsPlaying(false);
    setCurrentPhase('start');
    setProgress(0);
    setEmotionalState('excited');
    setResponseTime(0);
    setCurrentQuestion(0);
  };

  const currentPhaseData = phases[currentPhase];
  const currentAnimation = animationStyles[animationStyle];
  const currentEmotion = emotionalIndicators[emotionalState];

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Progresso Inteligente com Emoção
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Estilo de Animação:</Label>
                <Badge variant="outline">
                  {animationStyle === 'emotional' && '🎯 Emocional'}
                  {animationStyle === 'smooth' && '🌊 Suave'}
                  {animationStyle === 'dynamic' && '⚡ Dinâmico'}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Estado Emocional:</Label>
                <Badge 
                  variant="secondary" 
                  className="gap-1"
                  style={{ backgroundColor: `${currentEmotion.color}20`, color: currentEmotion.color }}
                >
                  {currentEmotion.icon} {currentEmotion.label}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Fase Atual:</Label>
                <Badge style={{ backgroundColor: currentPhaseData.color, color: 'white' }}>
                  {currentPhaseData.label}
                </Badge>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={playFullDemo}
                disabled={isPlaying}
                className="gap-2"
              >
                <Play className="w-4 h-4" />
                {isPlaying ? 'Demonstrando...' : 'Demonstrar'}
              </Button>
              <Button
                onClick={resetDemo}
                variant="outline"
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview da barra de progresso */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Visualização da Barra Emocional
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pergunta atual */}
          {isPlaying && currentQuestion < questions.length && (
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">Pergunta {currentQuestion + 1}:</span>
                <Badge variant="outline" className="text-xs">
                  {questions[currentQuestion].phase}
                </Badge>
              </div>
              <p className="text-base font-medium mb-2">{questions[currentQuestion].text}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Timer className="w-3 h-3" />
                Tempo esperado: {(questions[currentQuestion].expectedTime / 1000).toFixed(1)}s
              </div>
            </div>
          )}

          {/* Barra de progresso emocional */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Progresso Emocional</span>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>

            {/* Container da barra */}
            <div className="relative">
              <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                {/* Barra de progresso com animação emocional */}
                <div 
                  className={cn(
                    "h-full rounded-full transition-all relative overflow-hidden",
                    currentAnimation.className
                  )}
                  style={{ 
                    width: `${Math.max(5, progress)}%`,
                    backgroundColor: currentPhaseData.color,
                    transition: currentAnimation.transition,
                    animation: isPlaying ? `${animationStyle}-progress 2s ease-in-out infinite` : 'none'
                  }}
                >
                  {/* Efeito de brilho */}
                  <div 
                    className="absolute inset-0 w-full h-full opacity-30"
                    style={{
                      background: `linear-gradient(90deg, transparent, white, transparent)`,
                      animation: isPlaying ? 'shimmer 1.5s ease-in-out infinite' : 'none'
                    }}
                  />
                </div>
              </div>

              {/* Indicador emocional flutuante */}
              {isPlaying && (
                <div 
                  className="absolute -top-8 transition-all duration-1000"
                  style={{ 
                    left: `${Math.max(2, Math.min(progress - 3, 94))}%`,
                    transform: 'translateX(-50%)'
                  }}
                >
                  <div className="bg-white border shadow-lg rounded-full p-1 animate-bounce">
                    <span className="text-lg">{currentEmotion.icon}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Descrição da fase atual */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {currentPhaseData.description}
              </p>
              {isPlaying && (
                <p className="text-xs text-muted-foreground mt-1">
                  Velocidade: {currentPhaseData.speed}x • Tempo de resposta: {(responseTime / 1000).toFixed(1)}s
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fases do progresso */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fases do Progresso Emocional</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {Object.entries(phases).map(([key, phase]) => (
              <div 
                key={key}
                className={cn(
                  "p-3 rounded-lg border transition-all",
                  currentPhase === key ? 'ring-2 ring-offset-2' : 'opacity-60'
                )}
                style={{ 
                  backgroundColor: currentPhase === key ? `${phase.color}10` : 'transparent',
                  borderColor: phase.color,
                  ...(currentPhase === key ? { outline: `2px solid ${phase.color}` } : {})
                }}
              >
                <div className="text-center space-y-2">
                  <div 
                    className="w-8 h-8 rounded-full mx-auto flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: phase.color }}
                  >
                    {phase.progress}
                  </div>
                  <div>
                    <p className="font-medium text-xs">{phase.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {phase.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configurações de estilo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configurações de Animação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Heart className="w-6 h-6 mx-auto mb-2 text-red-500" />
              <h4 className="font-medium text-sm mb-1">🎯 Emocional</h4>
              <p className="text-xs text-muted-foreground">
                Pulsos suaves que refletem o estado emocional do usuário
              </p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="w-6 h-6 mx-auto mb-2 text-blue-500 rounded-full bg-blue-100 flex items-center justify-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              </div>
              <h4 className="font-medium text-sm mb-1">🌊 Suave</h4>
              <p className="text-xs text-muted-foreground">
                Transições fluidas como ondas do mar
              </p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Zap className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
              <h4 className="font-medium text-sm mb-1">⚡ Dinâmico</h4>
              <p className="text-xs text-muted-foreground">
                Movimentos enérgicos com efeitos de elasticidade
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes emotional-progress {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.2); }
        }
        
        @keyframes smooth-progress {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.1); }
        }
        
        @keyframes dynamic-progress {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.05); }
          75% { transform: scale(0.98); }
        }
      `}</style>
    </div>
  );
};

export { EmotionalProgressPreview };