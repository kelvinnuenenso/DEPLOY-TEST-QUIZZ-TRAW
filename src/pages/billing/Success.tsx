import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { usePayments } from '@/hooks/usePayments';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function BillingSuccess() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getSubscriptionStatus } = usePayments();
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }

      try {
        const data = await getSubscriptionStatus();
        setSubscriptionData(data);
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to ensure payment processing is complete
    const timer = setTimeout(fetchSubscriptionData, 2000);
    return () => clearTimeout(timer);
  }, [user, navigate, getSubscriptionStatus]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Processando seu pagamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-800">
            Pagamento Realizado!
          </CardTitle>
          <CardDescription className="text-gray-600">
            Sua assinatura foi ativada com sucesso
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {subscriptionData && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">Detalhes da Assinatura</h3>
              <div className="space-y-1 text-sm text-green-700">
                <p><strong>Plano:</strong> {subscriptionData.plan?.toUpperCase() || 'Pro'}</p>
                <p><strong>Status:</strong> {subscriptionData.status === 'active' ? 'Ativo' : 'Pendente'}</p>
                {subscriptionData.current_period_end && (
                  <p><strong>Próxima cobrança:</strong> {new Date(subscriptionData.current_period_end).toLocaleDateString('pt-BR')}</p>
                )}
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/dashboard')} 
              className="w-full"
              size="lg"
            >
              Ir para Dashboard
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => navigate('/billing')} 
              className="w-full"
            >
              Gerenciar Assinatura
            </Button>
          </div>
          
          <div className="text-center text-sm text-gray-500 mt-6">
            <p>Você receberá um email de confirmação em breve.</p>
            <p>Precisa de ajuda? <a href="mailto:suporte@quizliftoff.com" className="text-blue-600 hover:underline">Entre em contato</a></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}