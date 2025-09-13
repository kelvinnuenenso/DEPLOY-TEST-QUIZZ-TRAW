import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TestTube, User, Crown, Star, Settings } from 'lucide-react';
import { DemoUserManager, type DemoUser } from '@/lib/demoUser';
import { DEMO_USERS } from '@/lib/demoData';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface DemoModeIndicatorProps {
  showDetails?: boolean;
  onUserChange?: (user: DemoUser) => void;
}

export function DemoModeIndicator({ showDetails = false, onUserChange }: DemoModeIndicatorProps) {
  const [currentUser, setCurrentUser] = useState<DemoUser | null>(DemoUserManager.getCurrentUser());
  const { toast } = useToast();

  const handleUserSwitch = (index: number) => {
    const newUser = DemoUserManager.switchToPresetUser(index);
    if (newUser) {
      setCurrentUser(newUser);
      onUserChange?.(newUser);
      toast({
        title: 'Usuário alterado',
        description: `Agora você está logado como ${newUser.name}`,
        duration: 3000,
      });
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'premium': return <Crown className="w-3 h-3 text-yellow-600" />;
      case 'pro': return <Star className="w-3 h-3 text-blue-600" />;
      default: return <User className="w-3 h-3 text-gray-600" />;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'premium': return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white';
      case 'pro': return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!showDetails) {
    return (
      <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
        <TestTube className="w-3 h-3 mr-1" />
        Modo Demo
      </Badge>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <TestTube className="w-4 h-4" />
          <span className="hidden sm:inline">Demo:</span>
          <span className="font-medium">{currentUser?.name || 'Usuário Demo'}</span>
          {currentUser && getPlanIcon(currentUser.plan)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TestTube className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-green-600">Modo Demonstração</h3>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>Explore todas as funcionalidades da plataforma com dados simulados.</p>
          </div>

          {currentUser && (
            <Card className="p-3 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{currentUser.name}</span>
                <Badge className={getPlanColor(currentUser.plan)}>
                  {currentUser.plan.toUpperCase()}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>📧 {currentUser.email}</p>
                {currentUser.company && <p>🏢 {currentUser.company}</p>}
                {currentUser.industry && <p>🏭 {currentUser.industry}</p>}
              </div>
            </Card>
          )}

          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Alternar Usuário Demo
            </h4>
            
            <div className="grid gap-2">
              {DEMO_USERS.map((user, index) => (
                <Button
                  key={user.id}
                  variant={currentUser?.id === user.id ? "default" : "ghost"}
                  size="sm"
                  className="justify-start gap-2 h-auto p-2"
                  onClick={() => handleUserSwitch(index)}
                >
                  <div className="flex items-center gap-2 flex-1">
                    {getPlanIcon(user.plan)}
                    <div className="text-left">
                      <div className="font-medium text-xs">{user.name}</div>
                      <div className="text-xs text-muted-foreground">{user.company}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {user.plan}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t text-xs text-muted-foreground">
            <p>💡 Todos os dados são simulados e armazenados localmente</p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}