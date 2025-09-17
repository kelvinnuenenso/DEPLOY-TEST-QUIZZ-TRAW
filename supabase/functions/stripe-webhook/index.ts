import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.18.0'
// import { notificationService } from '../services/notificationService' // Removido - serviço não implementado

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient()
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
)

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')!
  const body = await req.text()

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Erro na verificação da assinatura do webhook:', err)
    return new Response('Falha na verificação da assinatura do webhook', { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        // notificationService.paymentSuccess() // Removido - serviço não implementado
        break
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription)
        // notificationService.subscriptionUpdated() // Removido - serviço não implementado
        break
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        // notificationService.subscriptionCanceled() // Removido - serviço não implementado
        break
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentSucceeded(invoice)
        notificationService.invoiceAvailable()
        break
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)
        notificationService.paymentFailed()
        break
      }
    }

    return new Response('Webhook processado com sucesso', { status: 200 })
  } catch (error) {
    console.error('Erro ao processar webhook:', error)
    return new Response('Falha no processamento do webhook', { status: 500 })
  }
})

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string
  const subscriptionId = session.subscription as string
  
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const priceId = subscription.items.data[0].price.id
  
  let planType = 'free'
  if (priceId === Deno.env.get('STRIPE_PRO_PRICE_ID')) {
    planType = 'pro'
  } else if (priceId === Deno.env.get('STRIPE_ENTERPRISE_PRICE_ID')) {
    planType = 'enterprise'
  }
  
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
  const priceId = subscription.items.data[0].price.id

  let planType = 'free'
  if (priceId === Deno.env.get('STRIPE_PRO_PRICE_ID')) {
    planType = 'pro'
  } else if (priceId === Deno.env.get('STRIPE_ENTERPRISE_PRICE_ID')) {
    planType = 'enterprise'
  }

  await supabase
    .from('user_profiles')
    .update({
      plan_type: planType,
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
      subscription_status: 'canceled',
      subscription_id: null
    })
    .eq('stripe_customer_id', customerId)
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  const subscriptionId = invoice.subscription as string

  await supabase
    .from('user_profiles')
    .update({
      subscription_status: 'active',
      last_payment_status: 'succeeded',
      last_payment_date: new Date().toISOString()
    })
    .eq('stripe_customer_id', customerId)
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string

  await supabase
    .from('user_profiles')
    .update({
      subscription_status: 'past_due',
      last_payment_status: 'failed',
      last_payment_date: new Date().toISOString()
    })
    .eq('stripe_customer_id', customerId)
}