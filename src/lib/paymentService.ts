import { supabase } from '@/integrations/supabase/client';
import { TEST_MODE } from './flags';

// Tipos para o sistema de pagamentos
export interface PaymentPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  stripePriceId?: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
}

// Planos disponíveis
export const PAYMENT_PLANS: PaymentPlan[] = [
  {
    id: 'free',
    name: 'Gratuito',
    description: 'Perfeito para começar',
    price: 0,
    interval: 'month',
    features: [
      '3 quizzes ativos',
      '10 perguntas por quiz',
      'Coleta de leads básica',
      'Resultados personalizados'
    ]
  },
  {
    id: 'pro',
    name: 'Profissional',
    description: 'Para profissionais de marketing',
    price: 29.90,
    interval: 'month',
    features: [
      'Quizzes ilimitados',
      'Perguntas ilimitadas',
      'Lógica condicional',
      'Exportação de leads',
      'Integração com email marketing',
      'Domínio personalizado'
    ],
    stripePriceId: 'price_1234567890'
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Para empresas e agências',
    price: 79.90,
    interval: 'month',
    features: [
      'Tudo do plano Profissional',
      'Múltiplos usuários',
      'Webhooks personalizados',
      'Remoção de marca',
      'Suporte prioritário',
      'API completa'
    ],
    stripePriceId: 'price_0987654321'
  }
];

// Classe para gerenciar pagamentos e assinaturas
export class PaymentService {
  /**
   * Obter o plano atual do usuário
   */
  static async getCurrentSubscription(userId: string): Promise<Subscription | null> {
    if (TEST_MODE) {
      // No modo de teste, retorna uma assinatura gratuita simulada
      return {
        id: 'mock-subscription',
        userId,
        planId: 'free',
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false
      };
    }

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows found
        throw error;
      }

      if (!data) return null;

      return {
        id: data.id,
        userId: data.user_id,
        planId: data.plan_id,
        status: data.status,
        currentPeriodStart: data.current_period_start,
        currentPeriodEnd: data.current_period_end,
        cancelAtPeriodEnd: data.cancel_at_period_end,
        stripeSubscriptionId: data.stripe_subscription_id,
        stripeCustomerId: data.stripe_customer_id
      };
    } catch (error) {
      console.error('Error getting subscription:', error);
      return null;
    }
  }

  /**
   * Obter detalhes do plano pelo ID
   */
  static getPlanById(planId: string): PaymentPlan | undefined {
    return PAYMENT_PLANS.find(plan => plan.id === planId);
  }

  /**
   * Iniciar processo de checkout para um plano
   */
  static async createCheckoutSession(userId: string, planId: string): Promise<string | null> {
    if (TEST_MODE) {
      // No modo de teste, simula um URL de checkout
      return `https://checkout.stripe.com/mock-session?plan=${planId}`;
    }

    try {
      // Em produção, chamaríamos uma função do Supabase Edge Function
      // que criaria uma sessão de checkout no Stripe e retornaria a URL
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { planId, userId }
      });

      if (error) throw error;
      return data.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return null;
    }
  }

  /**
   * Cancelar uma assinatura
   */
  static async cancelSubscription(subscriptionId: string): Promise<boolean> {
    if (TEST_MODE) {
      // No modo de teste, simula o cancelamento
      return true;
    }

    try {
      // Em produção, chamaríamos uma função do Supabase Edge Function
      const { error } = await supabase.functions.invoke('cancel-subscription', {
        body: { subscriptionId }
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      return false;
    }
  }

  /**
   * Atualizar plano de assinatura
   */
  static async updateSubscription(subscriptionId: string, newPlanId: string): Promise<boolean> {
    if (TEST_MODE) {
      // No modo de teste, simula a atualização
      return true;
    }

    try {
      // Em produção, chamaríamos uma função do Supabase Edge Function
      const { error } = await supabase.functions.invoke('update-subscription', {
        body: { subscriptionId, newPlanId }
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating subscription:', error);
      return false;
    }
  }
}