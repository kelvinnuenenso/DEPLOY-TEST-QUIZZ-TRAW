import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface MobileLoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export function MobileLoadingSpinner({ 
  message = "Carregando...", 
  fullScreen = true 
}: MobileLoadingSpinnerProps) {
  const content = (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative mb-6">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-primary/20"></div>
      </div>
      
      <div className="text-center">
        <p className="text-lg font-medium text-foreground mb-2">{message}</p>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-0"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-150"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-300"></div>
        </div>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-sm">
          {content}
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        {content}
      </Card>
    </div>
  );
}