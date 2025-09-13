import { useEffect, useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';

interface MobileSplashScreenProps {
  onComplete: () => void;
  quizName?: string;
  duration?: number;
}

export function MobileSplashScreen({ 
  onComplete, 
  quizName = "Quiz",
  duration = 2000 
}: MobileSplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<'loading' | 'ready' | 'fade'>('loading');

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setStage('ready');
          setTimeout(() => {
            setStage('fade');
            setTimeout(onComplete, 300);
          }, 500);
          return 100;
        }
        return prev + (Math.random() * 15 + 5); // Random progress increment
      });
    }, 50);

    return () => clearInterval(interval);
  }, [onComplete]);

  const getStageMessage = () => {
    if (progress < 30) return "Carregando perguntas...";
    if (progress < 60) return "Preparando experiência...";
    if (progress < 90) return "Finalizando...";
    return "Pronto!";
  };

  return (
    <div 
      className={`fixed inset-0 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center z-50 transition-opacity duration-300 ${
        stage === 'fade' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="text-center p-8 max-w-sm w-full mx-4">
        {/* Logo/Icon Area */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">{quizName}</h1>
          <p className="text-muted-foreground text-sm">Quiz Interativo</p>
        </div>

        {/* Progress Area */}
        <div className="mb-6">
          <div className="w-full bg-muted rounded-full h-2 mb-4 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-200 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-2">
            {stage === 'loading' && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
            <span className="text-sm font-medium text-foreground">
              {getStageMessage()}
            </span>
          </div>
          
          <p className="text-xs text-muted-foreground">
            {Math.round(progress)}% carregado
          </p>
        </div>

        {/* Fun loading dots */}
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-0"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-150"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-300"></div>
        </div>
      </div>
    </div>
  );
}