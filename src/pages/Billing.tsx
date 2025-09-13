import { useAuth } from '@/hooks/useAuth'
import { usePayments } from '@/hooks/usePayments'
import { PricingPlans } from '@/components/billing/PricingPlans'
import { Button } from '@/components/ui/button'

export function Billing() {
  const { user } = useAuth()
  const { createPortalSession, loading } = usePayments()

  return (
    <div className="container py-10 space-y-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl font-bold">Planos e Preços</h1>
        <p className="text-lg text-muted-foreground">
          Escolha o plano ideal para suas necessidades
        </p>
      </div>

      {user?.subscription && (
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div className="space-y-1">
            <h2 className="font-semibold">Gerenciar Assinatura</h2>
            <p className="text-sm text-muted-foreground">
              Acesse o portal de pagamentos para gerenciar sua assinatura
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => createPortalSession()}
            disabled={loading}
          >
            Portal de Pagamentos
          </Button>
        </div>
      )}

      <PricingPlans />

      <div className="text-center text-sm text-muted-foreground">
        <p>
          Todos os preços em Reais (BRL). Pagamentos processados de forma segura via Stripe.
        </p>
      </div>
    </div>
  )
}