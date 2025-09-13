import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Zap, Crown } from 'lucide-react'
import { usePayments } from '@/hooks/usePayments'
import { useAuth } from '@/hooks/useAuth'
import { PLAN_FEATURES } from '@/types/plans'

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 'R$ 0',
    period: '/mês',
    description: 'Perfeito para começar',
    icon: Check,
    priceId: '',
    features: [
      '3 quizzes',
      '100 respostas/mês',
      'Analytics básico',
      'Suporte por email'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 'R$ 49',
    period: '/mês',
    description: 'Para profissionais',
    icon: Zap,
    priceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID,
    features: [
      'Quizzes ilimitados',
      '5.000 respostas/mês',
      'Analytics avançado',
      'Domínio personalizado',
      'Sem marca d\'água',
      'API e Webhooks',
      'Suporte via chat'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'R$ 199',
    period: '/mês',
    description: 'Para grandes empresas',
    icon: Crown,
    priceId: import.meta.env.VITE_STRIPE_ENTERPRISE_PRICE_ID,
    features: [
      'Quizzes ilimitados',
      '50.000 respostas/mês',
      'Analytics premium',
      'Domínio personalizado',
      'Sem marca d\'água',
      'API e Webhooks',
      'Suporte dedicado'
    ]
  }
]

export function PricingPlans() {
  const { createCheckoutSession, loading } = usePayments()
  const { user } = useAuth()

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => (
        <Card key={plan.id} className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
              <plan.icon className="h-6 w-6" />
            </div>
            <div className="flex items-baseline text-2xl font-semibold">
              {plan.price}
              <span className="text-sm font-normal text-muted-foreground">
                {plan.period}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{plan.description}</p>
          </CardHeader>
          <CardContent className="flex flex-col flex-1">
            <ul className="space-y-2 text-sm flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              className="mt-6"
              variant={plan.id === 'pro' ? 'default' : 'outline'}
              disabled={loading || !user || plan.id === 'free'}
              onClick={() => plan.priceId && createCheckoutSession(plan.priceId)}
            >
              {plan.id === 'free' ? 'Plano Atual' : 'Assinar Agora'}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}