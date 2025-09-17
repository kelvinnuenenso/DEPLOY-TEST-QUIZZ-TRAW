import { useState } from 'react'
import { useStripe, useElements } from '@stripe/react-stripe-js'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/components/ui/use-toast'
import { TEST_MODE } from '@/lib/flags'

export function usePayments() {
  const stripe = useStripe()
  const elements = useElements()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const createCheckoutSession = async (priceId: string) => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar autenticado para realizar uma assinatura.',
        variant: 'destructive'
      })
      return
    }
    
    setLoading(true)
    try {
      if (TEST_MODE) {
        // Simulate successful payment in test mode
        toast({
          title: 'Pagamento simulado',
          description: 'Em modo de teste, o pagamento foi simulado com sucesso.',
          variant: 'default'
        })
        // Redirect to success page after a delay
        setTimeout(() => {
          window.location.href = `${window.location.origin}/billing/success`
        }, 1500)
        return
      }

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId,
          userId: user.id,
          successUrl: `${window.location.origin}/billing/success`,
          cancelUrl: `${window.location.origin}/billing/cancel`
        }
      })

      if (error) throw error

      if (stripe && data.sessionId) {
        const { error: stripeError } = await stripe.redirectToCheckout({
          sessionId: data.sessionId
        })
        if (stripeError) throw stripeError
      }
    } catch (error) {
      console.error('Erro ao criar sessão de checkout:', error)
      toast({
        title: 'Erro no pagamento',
        description: 'Não foi possível iniciar o processo de pagamento. Tente novamente.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const createPortalSession = async () => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar autenticado para acessar o portal de pagamentos.',
        variant: 'destructive'
      })
      return
    }
    
    setLoading(true)
    try {
      if (TEST_MODE) {
        // Simulate portal access in test mode
        toast({
          title: 'Portal simulado',
          description: 'Em modo de teste, o portal de pagamentos foi simulado.',
          variant: 'default'
        })
        // Redirect to billing page
        setTimeout(() => {
          window.location.href = `${window.location.origin}/billing`
        }, 1500)
        return
      }

      const { data, error } = await supabase.functions.invoke('create-portal-session', {
        body: {
          userId: user.id,
          returnUrl: `${window.location.origin}/billing`
        }
      })

      if (error) throw error

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Erro ao criar sessão do portal:', error)
      toast({
        title: 'Erro no portal',
        description: 'Não foi possível acessar o portal de pagamentos. Tente novamente.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const getSubscriptionStatus = async () => {
    if (!user) return null
    
    try {
      if (TEST_MODE) {
        // Return mock subscription data in test mode
        return {
          status: 'active',
          plan: 'pro',
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      }

      const { data, error } = await supabase.functions.invoke('get-subscription-status', {
        body: { userId: user.id }
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro ao obter status da assinatura:', error)
      return null
    }
  }

  return {
    createCheckoutSession,
    createPortalSession,
    getSubscriptionStatus,
    loading
  }
}