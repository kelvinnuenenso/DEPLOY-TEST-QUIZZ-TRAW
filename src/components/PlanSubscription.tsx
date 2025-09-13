import { useState, useEffect } from 'react';
import useAuth from '@/hooks/useAuth';
import { PaymentService, PaymentPlan, Subscription, PAYMENT_PLANS } from '@/lib/paymentService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

export function PlanSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    async function loadSubscription() {
      if (!user) return;
      
      try {
        const sub = await PaymentService.getCurrentSubscription(user.id);
        setSubscription(sub);
      } catch (error) {
        console.error('Error loading subscription:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadSubscription();
  }, [user]);

  const handleSubscribe = async (planId: string) => {
    if (!user) return;
    
    try {
      setCheckoutLoading(planId);
      const checkoutUrl = await PaymentService.createCheckoutSession(user.id, planId);
      
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;
    
    if (confirm('Tem certeza que deseja cancelar sua assinatura? Você ainda terá acesso até o final do período atual.')) {
      try {
        const success = await PaymentService.cancelSubscription(subscription.id);
        
        if (success) {
          // Recarregar a assinatura
          if (user) {
            const sub = await PaymentService.getCurrentSubscription(user.id);
            setSubscription(sub);
          }
        }
      } catch (error) {
        console.error('Error canceling subscription:', error);
      }
    }
  };

  const currentPlanId = subscription?.planId || 'free';
  
  if (loading) {
    return <div className="flex justify-center p-8">Carregando planos...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold tracking-tight">Planos e Preços</h2>
        <p className="text-muted-foreground mt-2">Escolha o plano ideal para suas necessidades</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {PAYMENT_PLANS.map((plan) => {
          const isCurrentPlan = plan.id === currentPlanId;
          
          return (
            <Card key={plan.id} className={`flex flex-col ${isCurrentPlan ? 'border-primary' : ''}`}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{plan.name}</CardTitle>
                  {isCurrentPlan && <Badge variant="outline">Atual</Badge>}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="mb-4">
                  <span className="text-3xl font-bold">
                    {plan.price === 0 ? 'Grátis' : `R$ ${plan.price.toFixed(2)}`}
                  </span>
                  {plan.price > 0 && <span className="text-muted-foreground">/{plan.interval === 'month' ? 'mês' : 'ano'}</span>}
                </div>
                
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {isCurrentPlan ? (
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleCancelSubscription}
                    disabled={plan.id === 'free'}
                  >
                    {plan.id === 'free' ? 'Plano Atual' : 'Cancelar Assinatura'}
                  </Button>
                ) : (
                  <Button 
                    variant="default" 
                    className="w-full" 
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={checkoutLoading === plan.id}
                  >
                    {checkoutLoading === plan.id ? 'Processando...' : 'Assinar'}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {subscription && subscription.planId !== 'free' && (
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Sua assinatura {subscription.cancelAtPeriodEnd ? 'será cancelada' : 'será renovada'} em{' '}
            {new Date(subscription.currentPeriodEnd).toLocaleDateString()}.
          </p>
        </div>
      )}
    </div>
  );
}