import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { QuestionOption, ResponseBranch } from '@/types/quiz';
import {
  ArrowRight, ChevronRight, Target, ExternalLink, 
  MessageSquare, GitBranch, Play, Users
} from 'lucide-react';

interface FunnelPreviewProps {
  options: QuestionOption[];
  branches: ResponseBranch[];
  onTestFunnel?: () => void;
}

export function FunnelPreview({ options, branches, onTestFunnel }: FunnelPreviewProps) {
  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'next_step':
        return <ChevronRight className="w-4 h-4" />;
      case 'specific_step':
        return <Target className="w-4 h-4" />;
      case 'external_url':
        return <ExternalLink className="w-4 h-4" />;
      case 'outcome':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <ArrowRight className="w-4 h-4" />;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'next_step':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-950';
      case 'specific_step':
        return 'border-l-green-500 bg-green-50 dark:bg-green-950';
      case 'external_url':
        return 'border-l-purple-500 bg-purple-50 dark:bg-purple-950';
      case 'outcome':
        return 'border-l-orange-500 bg-orange-50 dark:bg-orange-950';
      default:
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-950';
    }
  };

  const getActionLabel = (branch: ResponseBranch) => {
    switch (branch.actionType) {
      case 'next_step':
        return 'Próxima etapa';
      case 'specific_step':
        return `Ir para: ${branch.targetStepId || 'Não definido'}`;
      case 'external_url':
        return `Link: ${branch.targetUrl || 'Não definido'}`;
      case 'outcome':
        return `Resultado: ${branch.outcomeKey || 'Não definido'}`;
      default:
        return 'Ação não definida';
    }
  };

  const getDefaultFlow = () => {
    const branchedOptions = branches.map(b => b.responseValue);
    return options.filter(option => !branchedOptions.includes(option.id));
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <GitBranch className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Visualização do Funil</h3>
            <p className="text-sm text-muted-foreground">
              Como as respostas direcionam os usuários
            </p>
          </div>
        </div>
        
        {onTestFunnel && (
          <Button onClick={onTestFunnel} variant="outline" size="sm">
            <Play className="w-4 h-4 mr-2" />
            Testar Funil
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* Ramificações Configuradas */}
        {branches.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Ramificações Configuradas ({branches.length})
            </h4>
            <div className="space-y-3">
              {branches.map((branch) => {
                const option = options.find(opt => opt.id === branch.responseValue);
                return (
                  <Card key={branch.id} className={`p-4 border-l-4 ${getActionColor(branch.actionType)}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                          {getActionIcon(branch.actionType)}
                        </div>
                        <div>
                          <div className="font-medium">
                            "{option?.label || 'Opção não encontrada'}"
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {getActionLabel(branch)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {branch.conditions && branch.conditions.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            +{branch.conditions.length} condição{branch.conditions.length > 1 ? 'ões' : ''}
                          </Badge>
                        )}
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Fluxo Padrão */}
        {getDefaultFlow().length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <ChevronRight className="w-4 h-4" />
              Fluxo Padrão ({getDefaultFlow().length})
            </h4>
            <Card className="p-4 border-l-4 border-l-gray-300 bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-500 text-white flex items-center justify-center">
                  <ChevronRight className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-medium">
                    {getDefaultFlow().map(option => `"${option.label}"`).join(', ')}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Seguem para a próxima etapa automaticamente
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Estado Vazio */}
        {branches.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <h4 className="font-medium mb-2">Nenhuma ramificação configurada</h4>
            <p className="text-sm">
              Todas as respostas seguirão o fluxo padrão para a próxima etapa
            </p>
          </div>
        )}

        {/* Estatísticas */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{options.length}</div>
            <div className="text-xs text-muted-foreground">Total de Opções</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{branches.length}</div>
            <div className="text-xs text-muted-foreground">Ramificações</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{getDefaultFlow().length}</div>
            <div className="text-xs text-muted-foreground">Fluxo Padrão</div>
          </div>
        </div>
      </div>
    </Card>
  );
}