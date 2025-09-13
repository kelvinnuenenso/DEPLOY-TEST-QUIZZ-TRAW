import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { QuizTheme } from '@/types/quiz';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Target, 
  Clock, 
  AlertTriangle, 
  Gift,
  Zap,
  Eye,
  ArrowRight
} from 'lucide-react';

interface ConditionalProgressProps {
  theme: QuizTheme;
  onUpdate: (theme: QuizTheme) => void;
  quizId: string;
}

export function ConditionalProgress({ theme, onUpdate, quizId }: ConditionalProgressProps) {
  const isMobile = useIsMobile();
  
  const getConditionalConfig = () => ({
    enabled: theme.conditionalProgressEnabled || false,
    urgencyMessage: {
      enabled: theme.urgencyMessageEnabled || true,
      template: theme.urgencyMessageTemplate || '⚡ Você já respondeu {progress}%, termine agora e desbloqueie seu resultado exclusivo',
      showProgress: theme.urgencyShowProgress || true,
      style: theme.urgencyMessageStyle || 'banner'
    },
    exitIntent: {
      enabled: theme.exitIntentEnabled || false,
      type: theme.exitIntentType || 'offer',
      title: theme.exitIntentTitle || 'Espere! Não perca seu resultado',
      message: theme.exitIntentMessage || 'Complete o quiz agora e ganhe um desconto especial',
      ctaText: theme.exitIntentCTA || 'Continuar Quiz',
      offerText: theme.exitIntentOffer || '🎁 BÔNUS: 20% de desconto no primeiro pedido'
    }
  });

  const config = getConditionalConfig();

  const handleUpdate = (updates: Partial<QuizTheme>) => {
    onUpdate({ ...theme, ...updates });
  };

  const updateUrgencyMessage = (key: string, value: any) => {
    handleUpdate({ [`urgency${key}`]: value });
  };

  const updateExitIntent = (key: string, value: any) => {
    handleUpdate({ [`exitIntent${key}`]: value });
  };

  const getPreviewMessage = (progress: number) => {
    return config.urgencyMessage.template
      .replace('{progress}', progress.toString())
      .replace('{remaining}', (100 - progress).toString());
  };

  const urgencyStyles = [
    { value: 'banner', label: '📢 Banner Superior', description: 'Barra no topo da tela' },
    { value: 'modal', label: '📱 Modal Popup', description: 'Popup centralizado' },
    { value: 'toast', label: '🔔 Notificação', description: 'Toast no canto da tela' },
    { value: 'inline', label: '📝 Inline', description: 'Dentro do conteúdo do quiz' }
  ];

  const exitIntentTypes = [
    { value: 'offer', label: '🎁 Oferta', description: 'Cupom ou desconto especial' },
    { value: 'urgency', label: '⏰ Urgência', description: 'Mensagem de pressa' },
    { value: 'benefit', label: '✨ Benefício', description: 'Destaque do valor do resultado' },
    { value: 'social', label: '👥 Social', description: 'Prova social e depoimentos' }
  ];

  return (
    <div className="space-y-6">
      {/* Main Configuration */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-lg p-2">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Progresso Condicional + Urgência</h3>
              <p className="text-sm text-muted-foreground">
                Mensagens inteligentes para aumentar a conclusão do quiz
              </p>
            </div>
          </div>
          <Switch
            checked={config.enabled}
            onCheckedChange={(enabled) => handleUpdate({ conditionalProgressEnabled: enabled })}
          />
        </div>
      </Card>

      {config.enabled && (
        <>
          {/* Urgency Message Configuration */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Mensagem de Urgência ao Retornar
              </h4>
              <Switch
                checked={config.urgencyMessage.enabled}
                onCheckedChange={(enabled) => updateUrgencyMessage('MessageEnabled', enabled)}
              />
            </div>
            
            {config.urgencyMessage.enabled && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Estilo da Mensagem</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {urgencyStyles.map((style) => (
                      <Button
                        key={style.value}
                        variant={config.urgencyMessage.style === style.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateUrgencyMessage('MessageStyle', style.value)}
                        className="justify-start h-auto p-3"
                      >
                        <div className="text-left">
                          <div className="font-medium">{style.label}</div>
                          <div className="text-xs text-muted-foreground">{style.description}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Mensagem Personalizada</Label>
                  <Textarea
                    placeholder="⚡ Você já respondeu {progress}%, termine agora e desbloqueie seu resultado exclusivo"
                    value={config.urgencyMessage.template}
                    onChange={(e) => updateUrgencyMessage('MessageTemplate', e.target.value)}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use {'{progress}'} para mostrar a porcentagem atual e {'{remaining}'} para o restante
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Mostrar Progresso Visual</Label>
                    <p className="text-xs text-muted-foreground">Barra de progresso junto com a mensagem</p>
                  </div>
                  <Switch
                    checked={config.urgencyMessage.showProgress}
                    onCheckedChange={(enabled) => updateUrgencyMessage('ShowProgress', enabled)}
                  />
                </div>

                {/* Preview */}
                <div className="p-3 bg-amber-50 dark:bg-amber-950/50 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                      Pré-visualização
                    </span>
                  </div>
                  <div className="text-sm text-amber-700 dark:text-amber-300">
                    {getPreviewMessage(65)}
                  </div>
                  {config.urgencyMessage.showProgress && (
                    <div className="mt-2 w-full bg-amber-200 dark:bg-amber-800 rounded-full h-2">
                      <div className="bg-amber-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* Exit Intent Configuration */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Oferta de Saída (Exit Intent)
              </h4>
              <Switch
                checked={config.exitIntent.enabled}
                onCheckedChange={(enabled) => updateExitIntent('Enabled', enabled)}
              />
            </div>
            
            {config.exitIntent.enabled && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Tipo de Oferta</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {exitIntentTypes.map((type) => (
                      <Button
                        key={type.value}
                        variant={config.exitIntent.type === type.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateExitIntent('Type', type.value)}
                        className="justify-start h-auto p-3"
                      >
                        <div className="text-left">
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-muted-foreground">{type.description}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Título do Popup</Label>
                    <Input
                      placeholder="Espere! Não perca seu resultado"
                      value={config.exitIntent.title}
                      onChange={(e) => updateExitIntent('Title', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Texto do Botão</Label>
                    <Input
                      placeholder="Continuar Quiz"
                      value={config.exitIntent.ctaText}
                      onChange={(e) => updateExitIntent('CTA', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Mensagem Principal</Label>
                  <Textarea
                    placeholder="Complete o quiz agora e ganhe um desconto especial"
                    value={config.exitIntent.message}
                    onChange={(e) => updateExitIntent('Message', e.target.value)}
                    rows={2}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Oferta/Bônus (Opcional)</Label>
                  <Input
                    placeholder="🎁 BÔNUS: 20% de desconto no primeiro pedido"
                    value={config.exitIntent.offerText}
                    onChange={(e) => updateExitIntent('Offer', e.target.value)}
                  />
                </div>

                {/* Exit Intent Preview */}
                <div className="p-4 bg-red-50 dark:bg-red-950/50 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-200">
                      Pré-visualização do Exit Intent
                    </span>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border">
                    <h5 className="font-semibold text-lg mb-2">{config.exitIntent.title}</h5>
                    <p className="text-muted-foreground mb-3">{config.exitIntent.message}</p>
                    {config.exitIntent.offerText && (
                      <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded mb-3">
                        <p className="text-green-800 dark:text-green-200 text-sm font-medium">
                          {config.exitIntent.offerText}
                        </p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button size="sm">
                        {config.exitIntent.ctaText}
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                      <Button variant="outline" size="sm">
                        Sair mesmo assim
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Implementation Info */}
          <Card className="p-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg">
              <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Como Funciona na Prática
              </h5>
              <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                <p>• <strong>Urgência:</strong> Aparece quando o usuário retorna ao quiz após sair</p>
                <p>• <strong>Exit Intent:</strong> Detecta quando o usuário tenta fechar a aba</p>
                <p>• <strong>Progresso:</strong> Calcula automaticamente baseado nas respostas</p>
                <p>• <strong>Personalização:</strong> Mensagens adaptadas ao contexto do quiz</p>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}