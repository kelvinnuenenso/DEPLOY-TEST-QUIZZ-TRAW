import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star, Zap } from 'lucide-react';
import { DemoUserManager } from '@/lib/demoUser';
import { useToast } from '@/components/ui/use-toast';

interface PlanUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan?: string;
  suggestedPlan?: 'pro' | 'premium';
}

const PLAN_FEATURES = {
  free: [
    'Até 3 quizzes',
    'Até 10 perguntas por quiz',
    'Analytics básico',
    'Suporte por e-mail'
  ],
  pro: [
    'Até 50 quizzes',
    'Até 50 perguntas por quiz',
    'Analytics avançado',
    'Temas personalizados',
    'Integração WhatsApp',
    'Testes A/B',
    'Exportação de dados',
    'Suporte prioritário'
  ],
  premium: [
    'Quizzes ilimitados',
    'Perguntas ilimitadas',
    'Analytics avançado',
    'Temas personalizados',
    'Integração WhatsApp',
    'Testes A/B',
    'Marca personalizada',
    'Acesso à API',
    'Exportação de dados',
    'Suporte prioritário',
    'Consultor dedicado'
  ]
};

const PLAN_PRICES = {
  pro: { monthly: 97, yearly: 970 },
  premium: { monthly: 197, yearly: 1970 }
};

export function PlanUpgradeModal({ isOpen, onClose, currentPlan = 'free', suggestedPlan }: PlanUpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'premium'>(suggestedPlan || 'pro');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const { toast } = useToast();

  const handleUpgrade = () => {
    DemoUserManager.upgradePlan(selectedPlan);
    
    toast({
      title: '🎉 Plano atualizado com sucesso!',
      description: `Você agora tem acesso a todas as funcionalidades do plano ${selectedPlan.toUpperCase()}`,
      duration: 4000,
    });

    onClose();
    
    // Reload to apply changes in demo mode
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'premium': return Crown;
      case 'pro': return Star;
      default: return Zap;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'premium': return 'from-yellow-500 to-orange-500';
      case 'pro': return 'from-blue-500 to-indigo-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Escolha seu plano e acelere seus resultados
          </DialogTitle>
          <p className="text-muted-foreground text-center">
            Desbloqueie todo o potencial da plataforma com recursos avançados
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Billing Toggle */}
          <div className="flex justify-center">
            <div className="bg-gray-100 p-1 rounded-lg flex">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-md transition-all ${
                  billingCycle === 'monthly' 
                    ? 'bg-white shadow-sm font-medium' 
                    : 'text-gray-600'
                }`}
              >
                Mensal
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-md transition-all ${
                  billingCycle === 'yearly' 
                    ? 'bg-white shadow-sm font-medium' 
                    : 'text-gray-600'
                }`}
              >
                Anual <Badge className="ml-1 bg-green-100 text-green-700">-2 meses</Badge>
              </button>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {(['pro', 'premium'] as const).map((plan) => {
              const Icon = getPlanIcon(plan);
              const isSelected = selectedPlan === plan;
              const isRecommended = plan === 'pro';
              
              return (
                <Card
                  key={plan}
                  className={`relative p-6 cursor-pointer transition-all ${
                    isSelected 
                      ? 'ring-2 ring-primary shadow-lg' 
                      : 'hover:shadow-md border-gray-200'
                  }`}
                  onClick={() => setSelectedPlan(plan)}
                >
                  {isRecommended && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                      Mais Popular
                    </Badge>
                  )}

                  <div className="space-y-4">
                    <div className="text-center">
                      <div className={`inline-flex p-3 rounded-full bg-gradient-to-r ${getPlanColor(plan)} mb-3`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold">{plan.toUpperCase()}</h3>
                      <div className="flex items-baseline justify-center gap-1 mt-2">
                        <span className="text-3xl font-bold">
                          R$ {PLAN_PRICES[plan][billingCycle]}
                        </span>
                        <span className="text-gray-600">
                          /{billingCycle === 'monthly' ? 'mês' : 'ano'}
                        </span>
                      </div>
                      {billingCycle === 'yearly' && (
                        <p className="text-sm text-green-600 mt-1">
                          Economize R$ {PLAN_PRICES[plan].monthly * 2} por ano
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      {PLAN_FEATURES[plan].map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center pt-4">
            <Button variant="outline" onClick={onClose} size="lg">
              Talvez mais tarde
            </Button>
            <Button 
              onClick={handleUpgrade}
              size="lg"
              className={`px-8 bg-gradient-to-r ${getPlanColor(selectedPlan)} hover:opacity-90`}
            >
              Fazer Upgrade para {selectedPlan.toUpperCase()}
            </Button>
          </div>

          {/* Demo Notice */}
          <div className="text-center text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg">
            <p>🎯 <strong>Demonstração:</strong> Este é um upgrade simulado. Em produção, seria processado o pagamento real.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}