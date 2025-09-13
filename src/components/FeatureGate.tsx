import { ReactNode } from 'react';
import { DemoUserManager } from '@/lib/demoUser';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown, Star, Zap } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface FeatureGateProps {
  feature: keyof ReturnType<typeof DemoUserManager.getFeatureAccess>;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgrade?: boolean;
}

export function FeatureGate({ feature, children, fallback, showUpgrade = true }: FeatureGateProps) {
  const { toast } = useToast();
  const access = DemoUserManager.getFeatureAccess();
  const currentUser = DemoUserManager.getCurrentUser();
  const hasAccess = access[feature];

  const handleUpgrade = (targetPlan: 'pro' | 'premium') => {
    DemoUserManager.upgradePlan(targetPlan);
    toast({
      title: 'Plano atualizado!',
      description: `Você agora tem acesso ao plano ${targetPlan.toUpperCase()}. Todas as funcionalidades foram desbloqueadas.`,
      duration: 4000,
    });
    // Force re-render by reloading the page in demo mode
    window.location.reload();
  };

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const getFeatureName = (feature: string) => {
    const names: Record<string, string> = {
      advancedAnalytics: 'Analytics Avançado',
      customThemes: 'Temas Personalizados',
      whatsappIntegration: 'Integração WhatsApp',
      abTesting: 'Testes A/B',
      customBranding: 'Marca Personalizada',
      prioritySupport: 'Suporte Prioritário',
      exportData: 'Exportação de Dados',
      api: 'Acesso à API'
    };
    return names[feature] || feature;
  };

  const getRequiredPlan = (feature: string) => {
    // Define which features require which plans
    const planRequirements: Record<string, 'pro' | 'premium'> = {
      advancedAnalytics: 'pro',
      customThemes: 'pro',
      whatsappIntegration: 'pro',
      abTesting: 'pro',
      exportData: 'pro',
      customBranding: 'premium',
      prioritySupport: 'premium',
      api: 'premium'
    };
    return planRequirements[feature] || 'pro';
  };

  const requiredPlan = getRequiredPlan(feature);
  const isProPlan = requiredPlan === 'pro';

  return (
    <Card className="p-6 text-center border-2 border-dashed border-gray-200 bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="p-3 rounded-full bg-gray-100">
          <Lock className="w-6 h-6 text-gray-400" />
        </div>
        
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900">
            {getFeatureName(feature)} Bloqueado
          </h3>
          <p className="text-sm text-gray-600 max-w-md">
            Esta funcionalidade está disponível apenas para usuários do plano{' '}
            <Badge variant="outline" className={isProPlan ? 'border-blue-500 text-blue-700' : 'border-yellow-500 text-yellow-700'}>
              {isProPlan ? <Star className="w-3 h-3 mr-1" /> : <Crown className="w-3 h-3 mr-1" />}
              {requiredPlan.toUpperCase()}
            </Badge>
            {' '}ou superior.
          </p>
        </div>

        {showUpgrade && (
          <div className="flex gap-2">
            {currentUser?.plan === 'free' && (
              <>
                <Button 
                  onClick={() => handleUpgrade('pro')}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Star className="w-4 h-4" />
                  Upgrade para PRO
                </Button>
                <Button 
                  onClick={() => handleUpgrade('premium')}
                  className="gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                  size="sm"
                >
                  <Crown className="w-4 h-4" />
                  Upgrade para PREMIUM
                </Button>
              </>
            )}
            
            {currentUser?.plan === 'pro' && requiredPlan === 'premium' && (
              <Button 
                onClick={() => handleUpgrade('premium')}
                className="gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                size="sm"
              >
                <Crown className="w-4 h-4" />
                Upgrade para PREMIUM
              </Button>
            )}
          </div>
        )}

        <div className="pt-4 border-t w-full">
          <p className="text-xs text-gray-500">
            🎯 Demonstração: Clique em "Upgrade" para simular a funcionalidade
          </p>
        </div>
      </div>
    </Card>
  );
}

// Hook to check feature access
export function useFeatureAccess() {
  const access = DemoUserManager.getFeatureAccess();
  const user = DemoUserManager.getCurrentUser();
  
  return {
    ...access,
    user,
    canUpgrade: user?.plan !== 'premium',
    upgrade: (plan: 'pro' | 'premium') => {
      DemoUserManager.upgradePlan(plan);
      window.location.reload();
    }
  };
}