# Guia de Integração Stripe - Sistema de Pagamentos

## 📋 Visão Geral

Este guia detalha a implementação completa do sistema de pagamentos usando Stripe para o QuizLift, incluindo planos de assinatura, webhooks e controle de acesso.

---

## 🏗️ Arquitetura do Sistema de Pagamentos

### **Planos Disponíveis**

| Plano | Preço | Quizzes | Respostas/mês | Analytics | Suporte |
|-------|-------|---------|---------------|-----------|----------|
| **Free** | R$ 0 | 3 | 100 | Básico | Email |
| **Pro** | R$ 49/mês | Ilimitado | 5.000 | Avançado | Chat |
| **Enterprise** | R$ 199/mês | Ilimitado | 50.000 | Premium | Dedicado |

### **Funcionalidades por Plano**

```typescript
// src/types/plans.ts
export interface PlanFeatures {
  maxQuizzes: number | 'unlimited'
  maxResponsesPerMonth: number
  analytics: 'basic' | 'advanced' | 'premium'
  customDomain: boolean
  removeWatermark: boolean
  apiAccess: boolean
  webhooks: boolean
  support: 'email' | 'chat' | 'dedicated'
}

export const PLAN_FEATURES: Record<string, PlanFeatures> = {
  free: {
    maxQuizzes: 3,
    maxResponsesPerMonth: 100,
    analytics: 'basic',
    customDomain: false,
    removeWatermark: false,
    apiAccess: false,
    webhooks: false,
    support: 'email'
  },
  pro: {
    maxQuizzes: 'unlimited',
    maxResponsesPerMonth: 5000,
    analytics: 'advanced',
    customDomain: true,
    removeWatermark: true,
    apiAccess: true,
    webhooks: true,
    support: 'chat'
  },
  enterprise: {
    maxQuizzes: 'unlimited',
    maxResponsesPerMonth: 50000,
    analytics: 'premium',
    customDomain: true,
    removeWatermark: true,
    apiAccess: true,
    webhooks: true,
    support: 'dedicated'
  }
}
```

---

## 🔧 Configuração do Stripe

### **1. Configuração Inicial**

#### Dashboard do Stripe
1. Acesse [Stripe Dashboard](https://dashboard.stripe.com)
2. Crie uma conta ou faça login
3. Ative o modo de teste
4. Anote as chaves:
   - **Publishable Key** (pk_test_...)
   - **Secret Key** (sk_test_...)
   - **Webhook Secret** (whsec_...)

#### Produtos e Preços
```bash
# Criar produtos via Stripe CLI ou Dashboard
stripe products create \
  --name="QuizLift Pro" \
  --description="Plano profissional com recursos avançados"

stripe prices create \
  --unit-amount=4900 \
  --currency=brl \
  --recurring-interval=month \
  --product=prod_XXXXXXXXXX
```

### **2. Variáveis de Ambiente**

```env
# .env.local
# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Produtos Stripe (IDs dos produtos criados)
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...

# URLs
VITE_APP_URL=http://localhost:3000
STRIPE_SUCCESS_URL=http://localhost:3000/billing/success
STRIPE_CANCEL_URL=http://localhost:3000/billing/cancel
```

---

## 💻 Implementação Frontend

### **1. Instalação de Dependências**

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### **2. Configuração do Stripe Provider**

```typescript
// src/components/providers/StripeProvider.tsx
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { ReactNode } from 'react'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

interface StripeProviderProps {
  children: ReactNode
}

export function StripeProvider({ children }: StripeProviderProps) {
  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  )
}
```

### **3. Hook de Pagamentos**

```typescript
// src/hooks/usePayments.ts
import { useState } from 'react'
import { useStripe, useElements } from '@stripe/react-stripe-js'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './useAuth'

export function usePayments() {
  const stripe = useStripe()
  const elements = useElements()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const createCheckoutSession = async (priceId: string) => {
    if (!user) throw new Error('Usuário não autenticado')
    
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId,
          userId: user.id,
          successUrl: `${window.location.origin}/billing/success`,
          cancelUrl: `${window.location.origin}/billing/cancel`
        }
      })

      if (error) throw error

      // Redirecionar para Stripe Checkout
      if (stripe && data.sessionId) {
        const { error: stripeError } = await stripe.redirectToCheckout({
          sessionId: data.sessionId
        })
        if (stripeError) throw stripeError
      }
    } catch (error) {
      console.error('Erro ao criar sessão de checkout:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createPortalSession = async () => {
    if (!user) throw new Error('Usuário não autenticado')
    
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('create-portal-session', {
        body: {
          userId: user.id,
          returnUrl: `${window.location.origin}/billing`
        }
      })

      if (error) throw error

      // Redirecionar para Customer Portal
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Erro ao criar sessão do portal:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    createCheckoutSession,
    createPortalSession,
    loading
  }
}
```

### **4. Componente de Planos**

```typescript
// src/components/billing/PricingPlans.tsx
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Zap, Crown } from 'lucide-react'
import { usePayments } from '@/hooks/usePayments'
import { useAuth } from '@/hooks/useAuth'

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 'R$ 0',
    period: '/mês',
    description: 'Perfeito para começar',
    features: [
      '3 quizzes',
      '100 respostas/mês',
      'Analytics básico',
      'Suporte por email'
    ],
    icon: Zap,
    popular: false,
    priceId: null
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 'R$ 49',
    period: '/mês',
    description: 'Para profissionais',
    features: [
      'Quizzes ilimitados',
      '5.000 respostas/mês',
      'Analytics avançado',
      'Domínio personalizado',
      'Sem marca d\'água',
      'Suporte por chat'
    ],
    icon: Crown,
    popular: true,
    priceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'R$ 199',
    period: '/mês',
    description: 'Para empresas',
    features: [
      'Tudo do Pro',
      '50.000 respostas/mês',
      'Analytics premium',
      'API completa',
      'Webhooks',
      'Suporte dedicado'
    ],
    icon: Crown,
    popular: false,
    priceId: import.meta.env.VITE_STRIPE_ENTERPRISE_PRICE_ID
  }
]

export function PricingPlans() {
  const { createCheckoutSession, loading } = usePayments()
  const { user } = useAuth()

  const handleSelectPlan = async (priceId: string | null) => {
    if (!priceId) return // Plano gratuito
    
    try {
      await createCheckoutSession(priceId)
    } catch (error) {
      console.error('Erro ao selecionar plano:', error)
    }
  }

  return (
    <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {plans.map((plan) => {
        const Icon = plan.icon
        return (
          <Card 
            key={plan.id} 
            className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                  Mais Popular
                </span>
              </div>
            )}
            
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <div className="text-3xl font-bold">
                {plan.price}
                <span className="text-sm font-normal text-muted-foreground">
                  {plan.period}
                </span>
              </div>
              <p className="text-muted-foreground">{plan.description}</p>
            </CardHeader>
            
            <CardContent>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                className="w-full" 
                variant={plan.popular ? 'default' : 'outline'}
                onClick={() => handleSelectPlan(plan.priceId)}
                disabled={loading || !user}
              >
                {loading ? 'Processando...' : 
                 plan.id === 'free' ? 'Plano Atual' : 'Assinar Agora'}
              </Button>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
```

---

## ⚡ Implementação Backend (Supabase Edge Functions)

### **1. Função de Checkout**

```typescript
// supabase/functions/create-checkout-session/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  try {
    const { priceId, userId, successUrl, cancelUrl } = await req.json()

    // Buscar ou criar customer no Stripe
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (!profile) {
      throw new Error('Perfil de usuário não encontrado')
    }

    let customerId = profile.stripe_customer_id

    if (!customerId) {
      // Criar customer no Stripe
      const customer = await stripe.customers.create({
        email: profile.email,
        metadata: {
          supabase_user_id: userId
        }
      })

      customerId = customer.id

      // Salvar customer_id no perfil
      await supabase
        .from('user_profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId)
    }

    // Criar sessão de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: userId
      }
    })

    return new Response(
      JSON.stringify({ sessionId: session.id }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
```

### **2. Função de Portal do Cliente**

```typescript
// supabase/functions/create-portal-session/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  try {
    const { userId, returnUrl } = await req.json()

    // Buscar customer_id do usuário
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single()

    if (!profile?.stripe_customer_id) {
      throw new Error('Customer não encontrado')
    }

    // Criar sessão do portal
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: returnUrl,
    })

    return new Response(
      JSON.stringify({ url: portalSession.url }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
```

### **3. Webhook Handler**

```typescript
// supabase/functions/stripe-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')!
  const body = await req.text()

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return new Response('Webhook signature verification failed', { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription)
        break
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentSucceeded(invoice)
        break
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)
        break
      }
    }

    return new Response('Webhook handled successfully', { status: 200 })
  } catch (error) {
    console.error('Error handling webhook:', error)
    return new Response('Webhook handler failed', { status: 500 })
  }
})

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string
  const subscriptionId = session.subscription as string
  
  // Buscar subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const priceId = subscription.items.data[0].price.id
  
  // Determinar plano baseado no price_id
  let planType = 'free'
  if (priceId === Deno.env.get('STRIPE_PRO_PRICE_ID')) {
    planType = 'pro'
  } else if (priceId === Deno.env.get('STRIPE_ENTERPRISE_PRICE_ID')) {
    planType = 'enterprise'
  }
  
  // Atualizar perfil do usuário
  await supabase
    .from('user_profiles')
    .update({
      plan_type: planType,
      subscription_status: 'active',
      subscription_id: subscriptionId,
      stripe_customer_id: customerId
    })
    .eq('stripe_customer_id', customerId)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  const status = subscription.status
  
  await supabase
    .from('user_profiles')
    .update({
      subscription_status: status
    })
    .eq('stripe_customer_id', customerId)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  
  await supabase
    .from('user_profiles')
    .update({
      plan_type: 'free',
      subscription_status: 'cancelled',
      subscription_id: null
    })
    .eq('stripe_customer_id', customerId)
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Log successful payment
  console.log('Payment succeeded for invoice:', invoice.id)
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  
  await supabase
    .from('user_profiles')
    .update({
      subscription_status: 'past_due'
    })
    .eq('stripe_customer_id', customerId)
}
```

---

## 🔒 Controle de Acesso por Plano

### **1. Hook de Verificação de Plano**

```typescript
// src/hooks/usePlanAccess.ts
import { useAuth } from './useAuth'
import { PLAN_FEATURES } from '@/types/plans'

export function usePlanAccess() {
  const { user } = useAuth()
  
  const userPlan = user?.user_metadata?.plan_type || 'free'
  const features = PLAN_FEATURES[userPlan]
  
  const canCreateQuiz = (currentCount: number) => {
    if (features.maxQuizzes === 'unlimited') return true
    return currentCount < features.maxQuizzes
  }
  
  const canReceiveResponses = (currentCount: number) => {
    return currentCount < features.maxResponsesPerMonth
  }
  
  const hasFeature = (feature: keyof typeof features) => {
    return features[feature]
  }
  
  return {
    userPlan,
    features,
    canCreateQuiz,
    canReceiveResponses,
    hasFeature
  }
}
```

### **2. Componente de Upgrade**

```typescript
// src/components/billing/UpgradePrompt.tsx
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Crown, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface UpgradePromptProps {
  feature: string
  description: string
  requiredPlan: 'pro' | 'enterprise'
}

export function UpgradePrompt({ feature, description, requiredPlan }: UpgradePromptProps) {
  const navigate = useNavigate()
  
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
          <Crown className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-xl">Upgrade para {requiredPlan.toUpperCase()}</CardTitle>
        <p className="text-muted-foreground">
          {description}
        </p>
      </CardHeader>
      
      <CardContent className="text-center">
        <Button 
          onClick={() => navigate('/billing')}
          className="w-full"
        >
          Fazer Upgrade
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}
```

---

## 📊 Monitoramento e Analytics

### **1. Dashboard de Billing**

```typescript
// src/pages/Billing.tsx
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { usePayments } from '@/hooks/usePayments'
import { PricingPlans } from '@/components/billing/PricingPlans'

export default function Billing() {
  const { user } = useAuth()
  const { createPortalSession, loading } = usePayments()
  const [usage, setUsage] = useState({
    quizzes: 0,
    responses: 0,
    maxQuizzes: 3,
    maxResponses: 100
  })
  
  const userPlan = user?.user_metadata?.plan_type || 'free'
  const subscriptionStatus = user?.user_metadata?.subscription_status || 'inactive'
  
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Planos e Cobrança</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie sua assinatura e veja seu uso atual
        </p>
      </div>
      
      {/* Status da Assinatura */}
      <Card>
        <CardHeader>
          <CardTitle>Status da Assinatura</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Plano Atual</p>
              <p className="text-2xl font-bold capitalize">{userPlan}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="text-2xl font-bold capitalize">{subscriptionStatus}</p>
            </div>
            <div>
              <Button 
                onClick={createPortalSession}
                disabled={loading || userPlan === 'free'}
                variant="outline"
              >
                {loading ? 'Carregando...' : 'Gerenciar Assinatura'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Uso Atual */}
      <Card>
        <CardHeader>
          <CardTitle>Uso Atual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between mb-2">
                <span>Quizzes</span>
                <span>{usage.quizzes}/{usage.maxQuizzes === -1 ? '∞' : usage.maxQuizzes}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ 
                    width: usage.maxQuizzes === -1 ? '20%' : `${(usage.quizzes / usage.maxQuizzes) * 100}%` 
                  }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span>Respostas este mês</span>
                <span>{usage.responses}/{usage.maxResponses.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ width: `${(usage.responses / usage.maxResponses) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Planos Disponíveis */}
      <div>
        <h2 className="text-2xl font-bold text-center mb-8">Escolha seu Plano</h2>
        <PricingPlans />
      </div>
    </div>
  )
}
```

---

## 🧪 Testes

### **1. Testes de Integração Stripe**

```typescript
// src/__tests__/payments.test.ts
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { PricingPlans } from '@/components/billing/PricingPlans'
import { usePayments } from '@/hooks/usePayments'

// Mock do hook
vi.mock('@/hooks/usePayments')
const mockUsePayments = vi.mocked(usePayments)

describe('PricingPlans', () => {
  const mockCreateCheckoutSession = vi.fn()
  
  beforeEach(() => {
    mockUsePayments.mockReturnValue({
      createCheckoutSession: mockCreateCheckoutSession,
      createPortalSession: vi.fn(),
      loading: false
    })
  })
  
  test('should call createCheckoutSession when Pro plan is selected', async () => {
    render(<PricingPlans />)
    
    const proButton = screen.getByText('Assinar Agora')
    fireEvent.click(proButton)
    
    await waitFor(() => {
      expect(mockCreateCheckoutSession).toHaveBeenCalledWith(
        expect.stringContaining('price_')
      )
    })
  })
})
```

### **2. Testes de Webhook**

```typescript
// supabase/functions/stripe-webhook/test.ts
import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts'

Deno.test('Webhook handles checkout.session.completed', async () => {
  const mockEvent = {
    type: 'checkout.session.completed',
    data: {
      object: {
        customer: 'cus_test123',
        subscription: 'sub_test123'
      }
    }
  }
  
  // Test webhook handler logic
  // ... implementar teste
})
```

---

## 🚀 Deploy e Configuração

### **1. Configuração de Webhooks**

```bash
# URL do webhook no Stripe Dashboard
https://rijvidluwvzvatoarqoe.supabase.co/functions/v1/stripe-webhook

# Eventos para escutar:
- checkout.session.completed
- customer.subscription.updated
- customer.subscription.deleted
- invoice.payment_succeeded
- invoice.payment_failed
```

### **2. Variáveis de Produção**

```env
# Produção
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_live_...
STRIPE_ENTERPRISE_PRICE_ID=price_live_...
```

---

## 📈 Métricas e KPIs

### **Métricas de Negócio**
- **MRR (Monthly Recurring Revenue)**: Receita recorrente mensal
- **Churn Rate**: Taxa de cancelamento
- **LTV (Lifetime Value)**: Valor do tempo de vida do cliente
- **CAC (Customer Acquisition Cost)**: Custo de aquisição

### **Métricas Técnicas**
- **Webhook Success Rate**: Taxa de sucesso dos webhooks
- **Payment Success Rate**: Taxa de sucesso dos pagamentos
- **Checkout Conversion**: Taxa de conversão do checkout

---

**Status**: 🟡 Pronto para Implementação  
**Estimativa**: 3-4 dias de desenvolvimento  
**Dependências**: Supabase configurado, autenticação funcionando