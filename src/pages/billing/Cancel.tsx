import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function BillingCancel() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-800">
            Pagamento Cancelado
          </CardTitle>
          <CardDescription className="text-gray-600">
            Sua assinatura não foi processada
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="text-sm text-red-700">
              O processo de pagamento foi cancelado. Nenhuma cobrança foi realizada em seu cartão.
            </p>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/plans')} 
              className="w-full"
              size="lg"
            >
              <CreditCard className="mr-2 w-4 h-4" />
              Tentar Novamente
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')} 
              className="w-full"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Voltar ao Dashboard
            </Button>
          </div>
          
          <div className="text-center text-sm text-gray-500 mt-6">
            <p>Ainda tem dúvidas sobre nossos planos?</p>
            <p>
              <a href="mailto:suporte@quizliftoff.com" className="text-blue-600 hover:underline">
                Entre em contato conosco
              </a>
            </p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4">
            <h3 className="font-semibold text-blue-800 mb-2">💡 Dica</h3>
            <p className="text-sm text-blue-700">
              Você pode continuar usando o plano gratuito enquanto decide. 
              Upgrade a qualquer momento para desbloquear recursos premium!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}