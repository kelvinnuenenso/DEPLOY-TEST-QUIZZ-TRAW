import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileGestureHintProps {
  show?: boolean;
  onDismiss?: () => void;
}

export function MobileGestureHint({ show = true, onDismiss }: MobileGestureHintProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show hint after a short delay
    const timer = setTimeout(() => {
      if (show) setIsVisible(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [show]);

  useEffect(() => {
    // Auto dismiss after 5 seconds
    if (isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onDismiss]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-fade-in">
      <div className="bg-background/95 backdrop-blur-md border rounded-xl p-6 shadow-lg max-w-sm mx-4">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">💡 Dica</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsVisible(false);
              onDismiss?.();
            }}
            className="w-8 h-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <ChevronRight className="w-4 h-4" />
              <span>Deslize para esquerda</span>
            </div>
            <span>→ Próxima pergunta</span>
          </div>

          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" />
              <span>Deslize para direita</span>
            </div>
            <span>→ Pergunta anterior</span>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setIsVisible(false);
              onDismiss?.();
            }}
            className="w-full"
          >
            Entendi!
          </Button>
        </div>
      </div>
    </div>
  );
}