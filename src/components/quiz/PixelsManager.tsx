import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// Tooltips removidos para resolver problemas de React
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Facebook, Link, Code2, Info, Plus, Trash2 } from 'lucide-react';

export interface CustomEvent {
  id: string;
  name: string;
  parameters: { key: string; value: string }[];
  trigger: 'quiz_start' | 'question_answer' | 'quiz_complete' | 'result_specific';
  triggerValue?: string;
}

export interface PixelSettings {
  facebook?: {
    enabled: boolean;
    pixelId: string;
    standardEvents?: {
      enabled: boolean;
      events: string[];
    };
    customMode?: {
      enabled: boolean;
      events: CustomEvent[];
    };
  };
  utmify?: {
    enabled: boolean;
    code: string;
  };
  custom?: {
    enabled: boolean;
    code: string;
    name?: string;
  };
}

interface PixelsManagerProps {
  pixelSettings?: PixelSettings;
  onUpdate: (settings: PixelSettings) => void;
  quizPublicId?: string;
}

export const PixelsManager = ({ pixelSettings, onUpdate, quizPublicId }: PixelsManagerProps) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [settings, setSettings] = useState<PixelSettings>(pixelSettings || {});

  const updateSettings = (section: keyof PixelSettings, updates: any) => {
    const newSettings = {
      ...settings,
      [section]: {
        ...settings[section],
        ...updates
      }
    };
    setSettings(newSettings);
    onUpdate(newSettings);
  };

  const standardEvents = [
    {
      name: 'ViewContent',
      label: 'ViewContent',
      description: 'Disparado quando o usuário acessa a primeira etapa do quiz',
      trigger: 'Ao iniciar quiz',
      default: true
    },
    {
      name: 'Lead',
      label: 'Lead',
      description: 'Disparado quando o usuário envia informações de contato (nome, e-mail, telefone)',
      trigger: 'Ao enviar dados de contato',
      default: true
    },
    {
      name: 'CompleteRegistration',
      label: 'CompleteRegistration',
      description: 'Disparado quando o usuário finaliza o quiz até a tela de resultado',
      trigger: 'Ao completar quiz',
      default: true
    }
  ];

  const ecommerceEvents = [
    {
      name: 'InitiateCheckout',
      label: 'InitiateCheckout',
      description: 'Deve ser configurado manualmente no modo avançado para integrar com checkout'
    },
    {
      name: 'Purchase',
      label: 'Purchase',
      description: 'Deve ser configurado manualmente no modo avançado após compra confirmada'
    }
  ];

  const triggerOptions = [
    { value: 'quiz_start', label: 'Ao iniciar quiz' },
    { value: 'question_answer', label: 'Ao responder pergunta X' },
    { value: 'quiz_complete', label: 'Ao completar quiz' },
    { value: 'result_specific', label: 'Ao cair no resultado Y' }
  ];

  const validatePixelId = (value: string) => {
    return /^\d+$/.test(value);
  };

  const addCustomEvent = () => {
    const newEvent: CustomEvent = {
      id: Date.now().toString(),
      name: '',
      parameters: [],
      trigger: 'quiz_start'
    };
    const currentEvents = settings.facebook?.customMode?.events || [];
    updateSettings('facebook', {
      customMode: {
        ...settings.facebook?.customMode,
        events: [...currentEvents, newEvent]
      }
    });
  };

  const updateCustomEvent = (eventId: string, updates: Partial<CustomEvent>) => {
    const currentEvents = settings.facebook?.customMode?.events || [];
    const updatedEvents = currentEvents.map(event =>
      event.id === eventId ? { ...event, ...updates } : event
    );
    updateSettings('facebook', {
      customMode: {
        ...settings.facebook?.customMode,
        events: updatedEvents
      }
    });
  };

  const removeCustomEvent = (eventId: string) => {
    const currentEvents = settings.facebook?.customMode?.events || [];
    const updatedEvents = currentEvents.filter(event => event.id !== eventId);
    updateSettings('facebook', {
      customMode: {
        ...settings.facebook?.customMode,
        events: updatedEvents
      }
    });
  };

  const addParameter = (eventId: string) => {
    const currentEvents = settings.facebook?.customMode?.events || [];
    const updatedEvents = currentEvents.map(event =>
      event.id === eventId
        ? { ...event, parameters: [...event.parameters, { key: '', value: '' }] }
        : event
    );
    updateSettings('facebook', {
      customMode: {
        ...settings.facebook?.customMode,
        events: updatedEvents
      }
    });
  };

  const updateParameter = (eventId: string, paramIndex: number, field: 'key' | 'value', value: string) => {
    const currentEvents = settings.facebook?.customMode?.events || [];
    const updatedEvents = currentEvents.map(event =>
      event.id === eventId
        ? {
            ...event,
            parameters: event.parameters.map((param, index) =>
              index === paramIndex ? { ...param, [field]: value } : param
            )
          }
        : event
    );
    updateSettings('facebook', {
      customMode: {
        ...settings.facebook?.customMode,
        events: updatedEvents
      }
    });
  };

  const removeParameter = (eventId: string, paramIndex: number) => {
    const currentEvents = settings.facebook?.customMode?.events || [];
    const updatedEvents = currentEvents.map(event =>
      event.id === eventId
        ? { ...event, parameters: event.parameters.filter((_, index) => index !== paramIndex) }
        : event
    );
    updateSettings('facebook', {
      customMode: {
        ...settings.facebook?.customMode,
        events: updatedEvents
      }
    });
  };


  return (
    <div className={`mx-auto space-y-6 ${isMobile ? 'max-w-full px-2' : 'max-w-4xl'}`}>
      <div className={`text-center ${isMobile ? 'mb-4' : 'mb-8'}`}>
        <h2 className={`font-bold mb-2 ${isMobile ? 'text-lg' : 'text-2xl'}`}>
          {isMobile ? 'Pixels' : 'Configuração de Pixels'}
        </h2>
        {!isMobile && (
          <p className="text-muted-foreground">
            Configure pixels de rastreamento para este quiz
          </p>
        )}
      </div>

      {/* Facebook Pixel */}
      <Card className={isMobile ? 'p-3' : 'p-6'}>
        <div className={`flex items-center justify-between ${isMobile ? 'mb-3' : 'mb-4'}`}>
          <div className="flex items-center gap-3">
            <div className={`bg-blue-100 rounded-lg flex items-center justify-center ${isMobile ? 'w-8 h-8' : 'w-10 h-10'}`}>
              <Facebook className={`text-blue-600 ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
            </div>
            <div>
              <h3 className={`font-semibold ${isMobile ? 'text-base' : 'text-lg'}`}>
                {isMobile ? 'Facebook' : 'Pixel do Facebook'}
              </h3>
              {!isMobile && (
                <p className="text-sm text-muted-foreground">
                  Integração avançada com eventos padrão e personalizados
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={settings.facebook?.enabled || false}
              onCheckedChange={(enabled) => updateSettings('facebook', { enabled })}
            />
            <Badge variant={settings.facebook?.enabled ? 'default' : 'secondary'}>
              {settings.facebook?.enabled ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
        </div>

        <div className="space-y-6">
          {/* Pixel ID */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-sm font-medium">ID do Pixel do Facebook</label>
              {!isMobile && (
                <p className="text-xs text-muted-foreground mt-1">
                  Encontre seu ID do pixel no Gerenciador de Eventos do Facebook
                </p>
              )}
            </div>
            <Input
              placeholder="Ex.: 1234567890"
              value={settings.facebook?.pixelId || ''}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || validatePixelId(value)) {
                  updateSettings('facebook', { pixelId: value });
                } else {
                  toast({
                    title: "ID inválido",
                    description: "O ID do pixel deve conter apenas números.",
                    variant: "destructive"
                  });
                }
              }}
              disabled={!settings.facebook?.enabled}
              className={settings.facebook?.pixelId && !validatePixelId(settings.facebook.pixelId) ? 'border-red-500' : ''}
            />
          </div>

          {/* Eventos Padrão */}
          {settings.facebook?.enabled && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={settings.facebook?.standardEvents?.enabled || false}
                  onCheckedChange={(enabled) => updateSettings('facebook', {
                    standardEvents: { ...settings.facebook?.standardEvents, enabled }
                  })}
                />
                <label className="text-sm font-medium">Ativar eventos padrão automáticos</label>
              </div>

              {settings.facebook?.standardEvents?.enabled && (
                <div className="ml-6 space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Eventos que serão disparados automaticamente durante o quiz:
                  </p>
                  
                  {/* Eventos Padrão Automáticos */}
                  <div className="space-y-3">
                    {standardEvents.map((event) => (
                      <div key={event.name} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <Checkbox
                          id={event.name}
                          checked={settings.facebook?.standardEvents?.events?.includes(event.name) || false}
                          onCheckedChange={(checked) => {
                            const currentEvents = settings.facebook?.standardEvents?.events || [];
                            const updatedEvents = checked
                              ? [...currentEvents, event.name]
                              : currentEvents.filter(e => e !== event.name);
                            updateSettings('facebook', {
                              standardEvents: {
                                ...settings.facebook?.standardEvents,
                                events: updatedEvents
                              }
                            });
                          }}
                        />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <label htmlFor={event.name} className="text-sm font-medium">
                              {event.label}
                            </label>
                            <span className="text-xs text-muted-foreground bg-muted px-1 py-0.5 rounded">
                              {event.description}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Disparo:</span> {event.trigger}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}
            </div>
          )}

          {/* Modo Avançado - Eventos Customizados */}
          {settings.facebook?.enabled && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={settings.facebook?.customMode?.enabled || false}
                  onCheckedChange={(enabled) => updateSettings('facebook', {
                    customMode: { ...settings.facebook?.customMode, enabled }
                  })}
                />
                <label className="text-sm font-medium">Ativar Modo Avançado (Eventos Customizados)</label>
              </div>

              {settings.facebook?.customMode?.enabled && (
                <div className="ml-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Configure eventos personalizados para este quiz:
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={addCustomEvent}
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar Evento
                    </Button>
                  </div>

                  {/* Lista de Eventos Customizados */}
                  <div className="space-y-4">
                    {settings.facebook?.customMode?.events?.map((event) => (
                      <Card key={event.id} className="p-4 bg-muted/30">
                        <div className="space-y-4">
                          {/* Nome do Evento */}
                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <label className="text-sm font-medium block mb-1">Nome do Evento</label>
                              <Input
                                placeholder="Ex.: CustomLead"
                                value={event.name}
                                onChange={(e) => updateCustomEvent(event.id, { name: e.target.value })}
                              />
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeCustomEvent(event.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          {/* Condição de Disparo */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium block mb-1">Condição de disparo</label>
                              <Select
                                value={event.trigger}
                                onValueChange={(value) => updateCustomEvent(event.id, { trigger: value as any })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {triggerOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {(event.trigger === 'question_answer' || event.trigger === 'result_specific') && (
                              <div>
                                <label className="text-sm font-medium block mb-1">
                                  {event.trigger === 'question_answer' ? 'Número da Pergunta' : 'ID do Resultado'}
                                </label>
                                <Input
                                  placeholder={event.trigger === 'question_answer' ? 'Ex.: 3' : 'Ex.: resultado_1'}
                                  value={event.triggerValue || ''}
                                  onChange={(e) => updateCustomEvent(event.id, { triggerValue: e.target.value })}
                                />
                              </div>
                            )}
                          </div>

                          {/* Parâmetros */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-sm font-medium">Parâmetros (Chave=Valor)</label>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => addParameter(event.id)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Adicionar
                              </Button>
                            </div>
                            <div className="space-y-2">
                              {event.parameters.map((param, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <Input
                                    placeholder="chave"
                                    value={param.key}
                                    onChange={(e) => updateParameter(event.id, index, 'key', e.target.value)}
                                    className="flex-1"
                                  />
                                  <span className="text-muted-foreground">=</span>
                                  <Input
                                    placeholder="valor"
                                    value={param.value}
                                    onChange={(e) => updateParameter(event.id, index, 'value', e.target.value)}
                                    className="flex-1"
                                  />
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removeParameter(event.id, index)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                              {event.parameters.length === 0 && (
                                <p className="text-sm text-muted-foreground italic">
                                  Nenhum parâmetro adicionado. Clique em "Adicionar" para incluir parâmetros.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}

                    {(!settings.facebook?.customMode?.events || settings.facebook.customMode.events.length === 0) && (
                      <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Nenhum evento personalizado configurado.
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Clique em "Adicionar Evento" para começar.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* UTMify */}
      <Card className={isMobile ? 'p-3' : 'p-6'}>
        <div className={`flex items-center justify-between ${isMobile ? 'mb-3' : 'mb-4'}`}>
          <div className="flex items-center gap-3">
            <div className={`bg-green-100 rounded-lg flex items-center justify-center ${isMobile ? 'w-8 h-8' : 'w-10 h-10'}`}>
              <Link className={`text-green-600 ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
            </div>
            <div>
              <h3 className={`font-semibold ${isMobile ? 'text-base' : 'text-lg'}`}>UTMify</h3>
              {!isMobile && (
                <p className="text-sm text-muted-foreground">
                  Adiciona parâmetros UTM automaticamente aos links do quiz
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={settings.utmify?.enabled || false}
              onCheckedChange={(enabled) => updateSettings('utmify', { enabled })}
            />
            <Badge variant={settings.utmify?.enabled ? 'default' : 'secondary'}>
              {settings.utmify?.enabled ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-sm font-medium">Código do UTMify</label>
              {!isMobile && (
                <p className="text-xs text-muted-foreground mt-1">
                  Cole aqui o código completo do UTMify para adicionar UTMs automaticamente
                </p>
              )}
            </div>
            <Textarea
              placeholder="cole aqui seu código do UTMify"
              value={settings.utmify?.code || ''}
              onChange={(e) => updateSettings('utmify', { code: e.target.value })}
              disabled={!settings.utmify?.enabled}
              rows={isMobile ? 3 : 5}
              className="font-mono text-sm"
            />
          </div>
        </div>
      </Card>

      {/* Custom Pixel */}
      <Card className={isMobile ? 'p-3' : 'p-6'}>
        <div className={`flex items-center justify-between ${isMobile ? 'mb-3' : 'mb-4'}`}>
          <div className="flex items-center gap-3">
            <div className={`bg-purple-100 rounded-lg flex items-center justify-center ${isMobile ? 'w-8 h-8' : 'w-10 h-10'}`}>
              <Code2 className={`text-purple-600 ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
            </div>
            <div>
              <h3 className={`font-semibold ${isMobile ? 'text-base' : 'text-lg'}`}>
                {isMobile ? 'Personalizado' : 'Pixel Personalizado'}
              </h3>
              {!isMobile && (
                <p className="text-sm text-muted-foreground">
                  Adicione códigos de pixel ou scripts personalizados
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={settings.custom?.enabled || false}
              onCheckedChange={(enabled) => updateSettings('custom', { enabled })}
            />
            <Badge variant={settings.custom?.enabled ? 'default' : 'secondary'}>
              {settings.custom?.enabled ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Nome do Pixel (opcional)</label>
            <Input
              placeholder="Google Analytics, TikTok Pixel, etc."
              value={settings.custom?.name || ''}
              onChange={(e) => updateSettings('custom', { name: e.target.value })}
              disabled={!settings.custom?.enabled}
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-sm font-medium">Código do Pixel</label>
              {!isMobile && (
                <p className="text-xs text-muted-foreground mt-1">
                  Cole aqui o código JavaScript do seu pixel ou script de rastreamento
                </p>
              )}
            </div>
            <Textarea
              placeholder={isMobile ? `<script>
  // Seu código aqui
</script>` : `<!-- Exemplo: -->
<script>
  gtag('event', 'page_view', {
    page_title: 'Quiz Completed',
    page_location: window.location.href
  });
</script>`}
              value={settings.custom?.code || ''}
              onChange={(e) => updateSettings('custom', { code: e.target.value })}
              disabled={!settings.custom?.enabled}
              rows={isMobile ? 4 : 8}
              className="font-mono text-sm"
            />
          </div>
        </div>
      </Card>

      <div className={`text-center bg-muted/50 rounded-lg ${isMobile ? 'p-3' : 'p-4'}`}>
        <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
          💡 <strong>Dica:</strong> Os pixels configurados serão aplicados automaticamente quando o quiz for carregado.
          {!isMobile && ' Certifique-se de testar os pixels antes de publicar o quiz.'}
        </p>
      </div>
    </div>
  );
};