import { useState } from 'react'
import { useStripe, useElements } from '@stripe/react-stripe-js'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import { toast } from '@/components/ui/use-toast'

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

  return {
    createCheckoutSession,
    createPortalSession,
    loading
  }
}