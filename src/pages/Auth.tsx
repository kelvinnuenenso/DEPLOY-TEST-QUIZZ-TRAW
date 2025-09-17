import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { localDB } from '@/lib/localStorage';

export default function Auth() {
  const { user, loading, signIn: login, signUp: signup, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/app');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isSignUp) {
        await signup(email, password, fullName);
        toast({
          title: "Conta criada com sucesso!",
          description: "Bem-vindo ao Elevado Quizz!"
        });
      } else {
        await login(email, password);
        toast({
          title: "Login realizado!",
          description: "Bem-vindo de volta!"
        });
      }
      navigate('/app');
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        title: "Erro no login",
        description: error instanceof Error ? error.message : "Não foi possível fazer login. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleDemoLogin = async () => {
    try {
      // Criar perfil demo local
      const mockUser = {
        id: 'demo-user',
        name: 'Usuário Demo',
        email: 'demo@elevado.com',
        createdAt: new Date().toISOString(),
        plan: 'free',
        settings: {
          theme: 'light',
          notifications: true,
          autoSave: true
        }
      };
      
      // Salvar perfil no localStorage
      localDB.saveUserProfile(mockUser);
      
      // Fazer login com as credenciais demo
      await login('demo@elevado.com', 'demo@123');
      
      toast({
        title: "Login demo realizado!",
        description: "Bem-vindo ao modo demo! Você pode testar todas as funcionalidades.",
        variant: "default"
      });
      navigate('/app');
    } catch (error) {
      console.error('Demo login error:', error);
      toast({
        title: "Erro no acesso demo",
        description: "Não foi possível acessar o modo demo. Por favor, tente novamente.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="animate-pulse">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto">
            <span className="text-primary-foreground font-bold text-2xl">EQ</span>
          </div>
          <CardTitle className="text-2xl font-bold text-primary">
            Elevado Quizz
          </CardTitle>
          <CardDescription>
            {isSignUp ? 'Crie sua conta gratuita' : 'Entre em sua conta'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Demo Access Button */}
          <Button 
            onClick={handleDemoLogin}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            size="lg"
            disabled={loading}
          >
            🚀 Acesso Demo Gratuito (Recomendado)
          </Button>

          {/* Google Login Button */}
          <Button 
            onClick={signInWithGoogle}
            className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300"
            size="lg"
            disabled={loading}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 mr-2" />
            Continuar com Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Ou use email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <Input
                  type="text"
                  placeholder="Nome completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={isSignUp}
                />
              </div>
            )}
            
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div>
              <Input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button 
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? 'Processando...' : (isSignUp ? 'Criar Conta' : 'Entrar')}
            </Button>
          </form>

          <div className="text-center">
            <Button
              variant="link"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary"
            >
              {isSignUp 
                ? 'Já tem uma conta? Faça login' 
                : 'Não tem conta? Cadastre-se'}
            </Button>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              💡 <strong>Dica:</strong> Use o botão "Acesso Demo" para testar todas as funcionalidades instantaneamente!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}