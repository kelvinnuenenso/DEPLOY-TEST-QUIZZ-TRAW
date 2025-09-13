import React from 'react';
import { QuizTheme } from '@/types/quiz';
import { useFakeProgress } from '@/hooks/useFakeProgress';
import { useSmartProgress } from '@/hooks/useSmartProgress';
import { cn } from '@/lib/utils';

interface FakeProgressBarProps {
  theme: QuizTheme;
  currentStep: number;
  totalSteps: number;
  isActive?: boolean;
  className?: string;
  answeredSteps?: number;
  userAnswerTimes?: number[];
}

export const FakeProgressBar: React.FC<FakeProgressBarProps> = ({
  theme,
  currentStep,
  totalSteps,
  isActive = true,
  className,
  answeredSteps = 0,
  userAnswerTimes = []
}) => {
  // Use smart progress hook for emotional intelligent progress
  const smartProgressData = useSmartProgress({
    theme,
    currentStep,
    totalSteps,
    isActive,
    answeredSteps,
    userAnswerTimes
  });

  // Use fake progress hook for regular progress modes
  const fakeProgressData = useFakeProgress({
    theme,
    currentStep,
    totalSteps,
    isActive,
    answeredSteps
  });

  // Determine which progress system to use
  const isSmartProgressEnabled = theme.smartProgressEnabled || theme.smartProgress;
  const progressData = isSmartProgressEnabled ? smartProgressData : fakeProgressData;

  if (!progressData.isEnabled && !isSmartProgressEnabled) return null;

  const { progress, isAnimating } = progressData;
  const progressStyle = theme.fakeProgressStyle || 'linear';

  // Get smart progress style and colors for emotional progress
  const getSmartProgressStyle = () => {
    if (!isSmartProgressEnabled) return {};

    const percentage = progress / 100;
    const startDuration = (theme.smartProgressStartDuration || 40) / 100;
    const middleDuration = (theme.smartProgressMiddleDuration || 40) / 100;
    
    let currentColor = theme.smartProgressStartColor || '#10B981';
    let animationClass = '';

    if (percentage <= startDuration) {
      currentColor = theme.smartProgressStartColor || '#10B981';
    } else if (percentage <= startDuration + middleDuration) {
      currentColor = theme.smartProgressMiddleColor || '#3B82F6';
    } else {
      currentColor = theme.smartProgressEndColor || '#F59E0B';
      if (theme.smartProgressEndPulse) {
        animationClass = 'animate-emotional-pulse';
      }
    }

    // Apply style-specific animations
    const smartStyle = theme.smartProgressStyle || 'emotional';
    let transitionClass = 'transition-all duration-700 ease-out';
    
    if (smartStyle === 'smooth') {
      transitionClass = 'transition-all duration-1000 ease-in-out';
      if (isAnimating) animationClass += ' animate-smooth-progress';
    } else if (smartStyle === 'dynamic') {
      transitionClass = 'transition-all duration-300 ease-out';
      if (isAnimating) animationClass += ' animate-dynamic-bounce';
    } else if (smartStyle === 'emotional') {
      transitionClass = 'transition-all duration-700 cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      if (isAnimating) animationClass += ' animate-emotional-pulse';
    }

    return {
      backgroundColor: currentColor,
      animationClass: cn(animationClass.trim(), isAnimating && 'animate-pulse'),
      transitionClass
    };
  };

  const smartStyle = getSmartProgressStyle();

  // Componente de barra linear
  const LinearProgress = () => (
    <div className="w-full">
      <div className={cn("w-full bg-muted rounded-full h-2 overflow-hidden", className)}>
        <div 
          className={cn(
            "h-full rounded-full",
            isSmartProgressEnabled 
              ? cn(smartStyle.transitionClass, smartStyle.animationClass)
              : cn(
                  "transition-all duration-500 ease-out",
                  isAnimating && "animate-pulse"
                ),
            !isSmartProgressEnabled && theme.gradient 
              ? "bg-gradient-to-r from-primary to-primary/80" 
              : !isSmartProgressEnabled && "bg-primary"
          )}
          style={{ 
            width: `${Math.min(100, Math.max(0, progress))}%`,
            ...(isSmartProgressEnabled 
              ? { backgroundColor: smartStyle.backgroundColor }
              : {
                  background: theme.primary 
                    ? `linear-gradient(90deg, ${theme.primary}, ${theme.primary}CC)` 
                    : undefined
                }
            )
          }}
        />
      </div>
    </div>
  );

  // Componente de barra em passos
  const SteppedProgress = () => {
    const steps = Math.max(5, totalSteps);
    const currentStepIndex = Math.floor((progress / 100) * steps);
    
    return (
      <div className="w-full">
        <div className={cn("flex gap-1 w-full", className)}>
          {Array.from({ length: steps }, (_, index) => {
            const isActive = index <= currentStepIndex;
            return (
              <div
                key={index}
                className={cn(
                  "flex-1 h-2 rounded-full",
                  isSmartProgressEnabled 
                    ? cn(smartStyle.transitionClass, isActive && smartStyle.animationClass)
                    : "transition-all duration-500",
                  !isActive && "bg-muted",
                  !isSmartProgressEnabled && isActive && "bg-primary",
                  isAnimating && index === currentStepIndex && "animate-pulse"
                )}
                style={{
                  ...(isActive && isSmartProgressEnabled 
                    ? { backgroundColor: smartStyle.backgroundColor }
                    : isActive && !isSmartProgressEnabled && theme.primary 
                      ? { backgroundColor: theme.primary }
                      : {}
                  )
                }}
              />
            );
          })}
        </div>
      </div>
    );
  };

  // Componente de progresso circular
  const CircularProgress = () => {
    const circumference = 2 * Math.PI * 45;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <div className={cn("relative w-24 h-24", className)}>
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-muted"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={isSmartProgressEnabled ? smartStyle.backgroundColor : (theme.primary || "currentColor")}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className={cn(
                isSmartProgressEnabled 
                  ? cn(smartStyle.transitionClass, smartStyle.animationClass)
                  : "transition-all duration-500 ease-out text-primary",
                isAnimating && "animate-pulse"
              )}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-medium" style={{ color: theme.text }}>
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Renderizar baseado no estilo
  switch (progressStyle) {
    case 'stepped':
      return <SteppedProgress />;
    case 'circular':
      return <CircularProgress />;
    default:
      return <LinearProgress />;
  }
};