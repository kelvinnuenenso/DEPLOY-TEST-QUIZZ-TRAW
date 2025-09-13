import { useState, useEffect, useCallback } from 'react';
import { QuizTheme, IntelligentProgressConfig } from '@/types/quiz';
import { useSmartProgress } from './useSmartProgress';

interface UseFakeProgressProps {
  theme: QuizTheme;
  currentStep: number;
  totalSteps: number;
  isActive: boolean;
  answeredSteps?: number;
}

export const useFakeProgress = ({ 
  theme, 
  currentStep, 
  totalSteps, 
  isActive, 
  answeredSteps = 0
}: UseFakeProgressProps) => {
  const [fakeProgress, setFakeProgress] = useState(() => theme.fakeProgressStartPercent || 15);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check if any enhanced progress mode is enabled
  const isEnhancedProgress = theme.fakeProgress || theme.intelligentProgress;

  // Calcular o progresso real baseado nas respostas dadas
  const realProgress = totalSteps > 0 ? Math.max(0, (currentStep - 1) / totalSteps) * 100 : 0;

  // Função para calcular a velocidade da animação
  const getAnimationSpeed = useCallback(() => {
    switch (theme.fakeProgressSpeed) {
      case 'fast': return 500; // 0.5 segundos
      case 'slow': return 2000; // 2 segundos
      default: return 1000; // 1 segundo
    }
  }, [theme.fakeProgressSpeed]);

  // Get default intelligent progress configuration
  const getDefaultIntelligentConfig = useCallback((): IntelligentProgressConfig => ({
    enabled: theme.intelligentProgress || false,
    animationSpeed: theme.fakeProgressSpeed || 'normal',
    fastPhase: { startPercent: 0, endPercent: 50, progressMultiplier: 2.5 },
    linearPhase: { startPercent: 50, endPercent: 80, progressMultiplier: 1.0 },
    slowPhase: { startPercent: 80, endPercent: 100, progressMultiplier: 0.4 }
  }), [theme.intelligentProgress, theme.fakeProgressSpeed]);

  // Função para calcular o progresso alvo com modo inteligente
  const calculateTargetProgress = useCallback((answeredCount: number) => {
    const startPercent = theme.fakeProgressStartPercent || 15;
    const endPercent = theme.fakeProgressEndPercent || 85;
    
    if (totalSteps === 0) return startPercent;
    if (answeredCount === 0) return startPercent;
    if (answeredCount >= totalSteps) return endPercent;
    
    const config = theme.intelligentProgressConfig || getDefaultIntelligentConfig();
    
    // Modo inteligente com 3 fases
    if (theme.intelligentProgress && config.enabled) {
      return calculateIntelligentProgress(answeredCount, totalSteps, config, startPercent, endPercent);
    }
    
    // Modo fake progress padrão (curva suave)
    const progressRange = endPercent - startPercent;
    const ratio = answeredCount / totalSteps;
    const easeOut = 1 - Math.pow(1 - ratio, 0.7);
    
    return startPercent + (progressRange * easeOut);
  }, [theme.fakeProgressStartPercent, theme.fakeProgressEndPercent, theme.intelligentProgress, theme.intelligentProgressConfig, totalSteps, getDefaultIntelligentConfig]);

  // Função para calcular progresso inteligente com 3 fases
  const calculateIntelligentProgress = useCallback((answeredCount: number, totalSteps: number, config: IntelligentProgressConfig, startPercent: number, endPercent: number) => {
    const quizCompletionRatio = answeredCount / totalSteps; // 0 to 1
    const totalRange = endPercent - startPercent;
    
    // Exemplo prático para 10 perguntas:
    const predefinedProgressions = [
      20, 35, 48, 58, 65, 72, 80, 86, 92, 100
    ];
    
    // Se temos uma progressão predefinida para este número de perguntas
    if (totalSteps <= 10 && predefinedProgressions[answeredCount - 1]) {
      const targetPercent = predefinedProgressions[answeredCount - 1];
      // Escalar para o range configurado
      return startPercent + (totalRange * (targetPercent / 100));
    }
    
    // Cálculo dinâmico baseado nas fases
    let accumulatedProgress = 0;
    
    // Fase rápida (10% a 50% do quiz) - avança mais rápido
    if (quizCompletionRatio <= config.fastPhase.endPercent / 100) {
      const phaseProgress = quizCompletionRatio / (config.fastPhase.endPercent / 100);
      accumulatedProgress = 0.4 * phaseProgress * config.fastPhase.progressMultiplier; // 40% do progresso total
    }
    // Fase linear (50% a 80% do quiz) - ritmo estável  
    else if (quizCompletionRatio <= config.linearPhase.endPercent / 100) {
      accumulatedProgress = 0.4; // 40% já acumulado na fase rápida
      const phaseStart = config.fastPhase.endPercent / 100;
      const phaseEnd = config.linearPhase.endPercent / 100;
      const phaseProgress = (quizCompletionRatio - phaseStart) / (phaseEnd - phaseStart);
      accumulatedProgress += 0.35 * phaseProgress * config.linearPhase.progressMultiplier; // mais 35%
    }
    // Fase lenta (80% a 100% do quiz) - desacelera
    else {
      accumulatedProgress = 0.75; // 75% já acumulado
      const phaseStart = config.linearPhase.endPercent / 100;
      const phaseProgress = (quizCompletionRatio - phaseStart) / (1 - phaseStart);
      accumulatedProgress += 0.25 * phaseProgress * config.slowPhase.progressMultiplier; // últimos 25%
    }
    
    // Garantir que não passe de 1
    accumulatedProgress = Math.min(1, accumulatedProgress);
    
    return startPercent + (totalRange * accumulatedProgress);
  }, []);

  // Animar progresso suavemente
  const animateProgress = useCallback((targetProgress: number) => {
    if (!isEnhancedProgress || !isActive) return;

    // Garantir que nunca retroceda
    if (targetProgress <= fakeProgress) return;

    setIsAnimating(true);
    
    // Animação suave usando requestAnimationFrame
    const startTime = Date.now();
    const startProgress = fakeProgress;
    const duration = getAnimationSpeed();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Função de easing suave
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentProgress = startProgress + (targetProgress - startProgress) * easeProgress;
      
      setFakeProgress(currentProgress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        setFakeProgress(targetProgress);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isEnhancedProgress, isActive, fakeProgress, getAnimationSpeed]);

  // Atualizar progresso quando uma pergunta for respondida
  useEffect(() => {
    if (!isEnhancedProgress || !isActive) return;

    const targetProgress = calculateTargetProgress(answeredSteps);
    animateProgress(targetProgress);
  }, [answeredSteps, isEnhancedProgress, isActive, calculateTargetProgress, animateProgress]);

  // Inicializar apenas uma vez, sem reset
  useEffect(() => {
    if (isEnhancedProgress && isActive && !isInitialized) {
      const initialProgress = theme.fakeProgressStartPercent || 15;
      setFakeProgress(initialProgress);
      setIsInitialized(true);
    }
  }, [isEnhancedProgress, isActive, isInitialized, theme.fakeProgressStartPercent]);

  return {
    progress: fakeProgress,
    isAnimating,
    realProgress,
    isEnabled: isEnhancedProgress,
    // Função para calcular preview de qualquer etapa
    getProgressForStep: (stepAnswered: number) => calculateTargetProgress(stepAnswered)
  };
};