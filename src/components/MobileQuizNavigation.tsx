import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';

interface MobileQuizNavigationProps {
  currentStep: number;
  totalSteps: number;
  progress: number;
  canGoBack?: boolean;
  canGoNext?: boolean;
  onBack?: () => void;
  onNext?: () => void;
  onHome?: () => void;
  showProgress?: boolean;
}

export function MobileQuizNavigation({
  currentStep,
  totalSteps,
  progress,
  canGoBack = false,
  canGoNext = false,
  onBack,
  onNext,
  onHome,
  showProgress = true
}: MobileQuizNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t p-4 z-40">
      <div className="max-w-md mx-auto">
        {/* Progress Bar */}
        {showProgress && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Pergunta {currentStep + 1} de {totalSteps}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onHome}
            className="w-10 h-10 p-0"
          >
            <Home className="w-4 h-4" />
          </Button>

          <div className="flex gap-2 flex-1 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              disabled={!canGoBack}
              className="flex-1 max-w-24"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Voltar
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={onNext}
              disabled={!canGoNext}
              className="flex-1 max-w-24"
            >
              Próxima
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="w-10" /> {/* Spacer for balance */}
        </div>

        {/* Swipe Hint */}
        <div className="text-center mt-2">
          <p className="text-xs text-muted-foreground">
            💡 Deslize para navegar entre as perguntas
          </p>
        </div>
      </div>
    </div>
  );
}