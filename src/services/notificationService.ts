import { toast } from '@/hooks/use-toast';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface PaymentNotification {
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
}

export const notificationService = {
  showPaymentNotification: ({ type, title, message, duration = 5000 }: PaymentNotification) => {
    toast({
      variant: type === 'error' ? 'destructive' : undefined,
      title: title,
      description: message,
      duration: duration,
    });
  },

  // Notificações específicas de pagamento
  paymentSuccess: () => {
    notificationService.showPaymentNotification({
      type: 'success',
      title: 'Pagamento Confirmado',
      message: 'Seu pagamento foi processado com sucesso! Aproveite os recursos premium.',
    });
  },

  paymentFailed: (error?: string) => {
    notificationService.showPaymentNotification({
      type: 'error',
      title: 'Falha no Pagamento',
      message: error || 'Houve um problema ao processar seu pagamento. Por favor, tente novamente.',
    });
  },

  subscriptionUpdated: () => {
    notificationService.showPaymentNotification({
      type: 'info',
      title: 'Assinatura Atualizada',
      message: 'Sua assinatura foi atualizada com sucesso.',
    });
  },

  subscriptionCanceled: () => {
    notificationService.showPaymentNotification({
      type: 'warning',
      title: 'Assinatura Cancelada',
      message: 'Sua assinatura foi cancelada. Os recursos premium ficarão disponíveis até o final do período atual.',
    });
  },

  invoiceAvailable: () => {
    notificationService.showPaymentNotification({
      type: 'info',
      title: 'Nova Fatura Disponível',
      message: 'Uma nova fatura está disponível para visualização.',
    });
  },
};