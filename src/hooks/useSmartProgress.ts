import { useState, useEffect, useCallback, useRef } from 'react';
import { QuizTheme, StepProgressConfig, FunnelProgressConfig, FunnelStage } from '@/types/quiz';

interface UseSmartProgressProps {
  theme: QuizTheme;
  currentStep: number;
  totalSteps: number;
  isActive: boolean;
  answeredSteps: number;
  userAnswerTimes?: number[]; // time spent on each step
  answerComplexity?: number[]; // complexity score for each answer
}

interface UserBehavior {
  averageTimePerStep: number;
  isQuickResponder: boolean;
  isThoughtfulResponder: boolean;
  completionLikelihood: number;
  currentVelocity: number;
}

export const useSmartProgress = ({ 
  theme, 
  currentStep, 
  totalSteps, 
  isActive, 
  answeredSteps,
  userAnswerTimes = [],
  answerComplexity = []
}: UseSmartProgressProps) => {
  const [smartProgress, setSmartProgress] = useState(theme.fakeProgressStartPercent || 0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [userBehavior, setUserBehavior] = useState<UserBehavior>({
    averageTimePerStep: 0,
    isQuickResponder: false,
    isThoughtfulResponder: false,
    completionLikelihood: 0.8,
    currentVelocity: 1
  });
  
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(Date.now());

  // Analyze user behavior based on answer times and complexity
  const analyzeUserBehavior = useCallback(() => {
    if (userAnswerTimes.length === 0) return;

    const avgTime = userAnswerTimes.reduce((sum, time) => sum + time, 0) / userAnswerTimes.length;
    const isQuick = avgTime < 3000; // Less than 3 seconds average
    const isThoughtful = avgTime > 10000; // More than 10 seconds average
    
    // Calculate completion likelihood based on progress and behavior
    const progressRatio = answeredSteps / totalSteps;
    let likelihood = Math.min(0.9, 0.5 + (progressRatio * 0.4));
    
    // Adjust based on answer consistency
    if (userAnswerTimes.length > 1) {
      const timeVariance = userAnswerTimes.reduce((sum, time) => {
        return sum + Math.pow(time - avgTime, 2);
      }, 0) / userAnswerTimes.length;
      
      const consistencyFactor = Math.max(0.1, 1 - (timeVariance / (avgTime * avgTime)));
      likelihood *= consistencyFactor;
    }

    setUserBehavior({
      averageTimePerStep: avgTime,
      isQuickResponder: isQuick,
      isThoughtfulResponder: isThoughtful,
      completionLikelihood: likelihood,
      currentVelocity: isQuick ? 1.5 : isThoughtful ? 0.7 : 1
    });
  }, [userAnswerTimes, answeredSteps, totalSteps]);

  // Get progress configuration for current step
  const getCurrentStepConfig = useCallback((): StepProgressConfig | null => {
    if (!theme.stepProgressConfig) return null;
    return theme.stepProgressConfig.find(config => config.stepIndex === currentStep) || null;
  }, [theme.stepProgressConfig, currentStep]);

  // Get current funnel stage
  const getCurrentFunnelStage = useCallback((): FunnelStage | null => {
    if (!theme.funnelProgressConfig?.enabled || !theme.funnelProgressConfig.stages) return null;
    
    return theme.funnelProgressConfig.stages.find(stage => 
      stage.stepIds.includes(currentStep.toString())
    ) || null;
  }, [theme.funnelProgressConfig, currentStep]);

  // Calculate smart progress increment
  const calculateSmartIncrement = useCallback(() => {
    const stepConfig = getCurrentStepConfig();
    const funnelStage = getCurrentFunnelStage();
    
    let baseIncrement = 100 / totalSteps; // Basic equal distribution
    
    // Apply step-specific weight
    if (stepConfig?.progressWeight) {
      baseIncrement = stepConfig.progressWeight;
    }
    
    // Apply funnel stage logic
    if (funnelStage) {
      const stageProgress = funnelStage.stageWeight / funnelStage.stepIds.length;
      baseIncrement = stageProgress;
      
      // Apply stage-specific behavior
      switch (funnelStage.progressBehavior) {
        case 'accelerating': {
          const stagePosition = funnelStage.stepIds.indexOf(currentStep.toString());
          const accelerationFactor = 1 + (stagePosition / funnelStage.stepIds.length) * 0.5;
          baseIncrement *= accelerationFactor;
          break;
        }
        case 'decelerating': {
          const stagePos = funnelStage.stepIds.indexOf(currentStep.toString());
          const decelerationFactor = 1.5 - (stagePos / funnelStage.stepIds.length) * 0.5;
          baseIncrement *= decelerationFactor;
          break;
        }
        case 'smart':
          baseIncrement *= userBehavior.currentVelocity;
          break;
      }
    }

    // Apply user behavior adjustments
    if (theme.funnelProgressConfig?.adaptiveSpeed) {
      // Quick responders get faster progress
      if (userBehavior.isQuickResponder) {
        baseIncrement *= theme.funnelProgressConfig.progressAcceleration?.quickUsersMultiplier || 1.2;
      }
      // Thoughtful responders get steadier progress
      else if (userBehavior.isThoughtfulResponder) {
        baseIncrement *= theme.funnelProgressConfig.progressAcceleration?.slowUsersMultiplier || 0.9;
      }
      
      // Adjust based on completion likelihood
      if (theme.funnelProgressConfig.progressAcceleration?.completionLikelihoodFactor) {
        baseIncrement *= userBehavior.completionLikelihood;
      }
    }

    // Apply answer complexity factor
    if (stepConfig?.dependsOnAnswers && answerComplexity[currentStep - 1]) {
      const complexity = answerComplexity[currentStep - 1];
      const complexityMultiplier = stepConfig.complexityMultiplier || 1;
      baseIncrement *= (1 + (complexity - 0.5) * complexityMultiplier);
    }

    // Apply min/max constraints
    if (stepConfig?.minProgressIncrease) {
      baseIncrement = Math.max(baseIncrement, stepConfig.minProgressIncrease);
    }
    if (stepConfig?.maxProgressIncrease) {
      baseIncrement = Math.min(baseIncrement, stepConfig.maxProgressIncrease);
    }

    return Math.max(1, Math.min(baseIncrement, 25)); // Between 1% and 25%
  }, [currentStep, totalSteps, getCurrentStepConfig, getCurrentFunnelStage, userBehavior, answerComplexity, theme.funnelProgressConfig]);

  // Animate progress to target
  const animateToTarget = useCallback((targetProgress: number) => {
    if (!isActive) return;

    const stepConfig = getCurrentStepConfig();
    const animationDuration = stepConfig?.customSpeed || 
                            (stepConfig?.progressSpeed === 'instant' ? 0 :
                             stepConfig?.progressSpeed === 'fast' ? 300 :
                             stepConfig?.progressSpeed === 'slow' ? 1500 : 800);

    if (animationDuration === 0) {
      setSmartProgress(targetProgress);
      return;
    }

    setIsAnimating(true);
    const startProgress = smartProgress;
    const progressDiff = targetProgress - startProgress;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      
      // Apply easing based on progressStyle
      let easedProgress = progress;
      switch (stepConfig?.progressStyle) {
        case 'ease-in':
          easedProgress = progress * progress;
          break;
        case 'ease-out':
          easedProgress = 1 - Math.pow(1 - progress, 2);
          break;
        case 'bounce':
          if (progress < 0.5) {
            easedProgress = 2 * progress * progress;
          } else {
            easedProgress = 1 - 2 * Math.pow(1 - progress, 2);
          }
          break;
        default:
          easedProgress = progress;
      }

      const currentProgress = startProgress + (progressDiff * easedProgress);
      setSmartProgress(currentProgress);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        setSmartProgress(targetProgress);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [isActive, smartProgress, getCurrentStepConfig]);

  // Update progress only when questions are answered
  useEffect(() => {
    if (!theme.smartProgress || !isActive || answeredSteps === 0) return;

    analyzeUserBehavior();
    
    const increment = calculateSmartIncrement();
    const newProgress = Math.min(95, smartProgress + increment);
    
    animateToTarget(newProgress);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [answeredSteps, theme.smartProgress, isActive, analyzeUserBehavior, calculateSmartIncrement, animateToTarget]);

  // Reset progress when needed
  useEffect(() => {
    if (theme.smartProgress && isActive && currentStep === 1) {
      setSmartProgress(theme.fakeProgressStartPercent || 0);
    }
  }, [theme.smartProgress, isActive, currentStep, theme.fakeProgressStartPercent]);

  return {
    progress: smartProgress,
    isAnimating,
    userBehavior,
    isEnabled: theme.smartProgress || false,
    progressMode: theme.progressMode || 'simple'
  };
};