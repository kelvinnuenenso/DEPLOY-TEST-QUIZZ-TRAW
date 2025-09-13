import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Download, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running as PWA
    const checkStandalone = () => {
      return window.matchMedia('(display-mode: standalone)').matches ||
             (window.navigator as any).standalone ||
             document.referrer.includes('android-app://');
    };

    // Detect iOS
    const checkIOS = () => {
      return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    };

    setIsStandalone(checkStandalone());
    setIsIOS(checkIOS());

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after 30 seconds or on quiz completion
      setTimeout(() => {
        if (!checkStandalone() && !localStorage.getItem('pwa-prompt-dismissed')) {
          setShowPrompt(true);
        }
      }, 30000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show iOS prompt if applicable
    if (checkIOS() && !checkStandalone() && !localStorage.getItem('pwa-prompt-dismissed-ios')) {
      setTimeout(() => setShowPrompt(true), 45000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA installation accepted');
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    if (isIOS) {
      localStorage.setItem('pwa-prompt-dismissed-ios', 'true');
    } else {
      localStorage.setItem('pwa-prompt-dismissed', 'true');
    }
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <Card className="p-4 shadow-lg border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1">
              {isIOS ? 'Adicione à Tela Inicial' : 'Instale o App'}
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              {isIOS 
                ? 'Adicione o Elevado Quizz à sua tela inicial para acesso rápido e experiência completa.'
                : 'Instale nosso app para acesso rápido, notificações e uso offline.'
              }
            </p>
            
            <div className="flex gap-2">
              {isIOS ? (
                <div className="text-xs text-muted-foreground">
                  Toque em <span className="inline-flex items-center px-1 bg-muted rounded">
                    <Download className="w-3 h-3" />
                  </span> e "Adicionar à Tela Inicial"
                </div>
              ) : (
                <Button 
                  size="sm" 
                  onClick={handleInstall}
                  className="text-xs h-8"
                  disabled={!deferredPrompt}
                >
                  <Download className="w-3 h-3 mr-1" />
                  Instalar
                </Button>
              )}
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleDismiss}
                className="text-xs h-8 px-2"
              >
                Agora não
              </Button>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="flex-shrink-0 h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}