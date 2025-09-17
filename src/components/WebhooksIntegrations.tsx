import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { WebhookService, Webhook, Integration, WebhookEvent } from '@/lib/webhookService';
import { PlanManager } from '@/lib/planManager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Plus, Trash2, Edit, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function WebhooksIntegrations() {
  const { user } = useAuth();
  const [canUseWebhooks, setCanUseWebhooks] = useState(false);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('webhooks');

  // Estados para o formulário de webhook
  const [webhookDialogOpen, setWebhookDialogOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null);
  const [webhookName, setWebhookName] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookEvents, setWebhookEvents] = useState<WebhookEvent[]>([]);
  const [webhookActive, setWebhookActive] = useState(true);

  // Estados para o formulário de integração
  const [integrationDialogOpen, setIntegrationDialogOpen] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [integrationType, setIntegrationType] = useState<'mailchimp' | 'zapier' | 'google_sheets' | 'custom'>('mailchimp');
  const [integrationName, setIntegrationName] = useState('');
  const [integrationConfig, setIntegrationConfig] = useState<Record<string, string>>({});
  const [integrationActive, setIntegrationActive] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;

      try {
        setLoading(true);
        
        // Verificar se o usuário pode usar webhooks
        const canUse = await PlanManager.canUseWebhooks(user);
        setCanUseWebhooks(canUse);
        
        if (canUse) {
          // Carregar webhooks e integrações existentes
          const [webhooksData, integrationsData] = await Promise.all([
            WebhookService.getWebhooks(user.id),
            WebhookService.getIntegrations(user.id)
          ]);
          
          setWebhooks(webhooksData);
          setIntegrations(integrationsData);
        }
      } catch (error) {
        console.error('Erro ao carregar dados de webhooks:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [user]);
  
  const availableEvents: WebhookEvent[] = [
    'quiz_completed',
    'lead_captured', 
    'quiz_started',
    'quiz_abandoned',
    'result_viewed'
  ];
  
  const integrationTypes = [
    { value: 'mailchimp', label: 'Mailchimp', description: 'Adicionar leads às suas listas' },
    { value: 'zapier', label: 'Zapier', description: 'Conectar com 5000+ aplicativos' },
    { value: 'google_sheets', label: 'Google Sheets', description: 'Salvar dados em planilhas' },
    { value: 'hubspot', label: 'HubSpot', description: 'CRM e automação de marketing' },
    { value: 'custom', label: 'Webhook Customizado', description: 'Sua própria URL de webhook' }
  ];
  
  // Função handleSaveWebhook será definida mais abaixo
  
  // Função handleDeleteWebhook será definida mais abaixo
  
  // Função handleSaveIntegration será definida mais abaixo
  

  
  const resetWebhookForm = () => {
    setWebhookName('');
    setWebhookUrl('');
    setWebhookEvents([]);
    setWebhookActive(true);
    setEditingWebhook(null);
  };
  
  const resetIntegrationForm = () => {
    setIntegrationName('');
    setIntegrationType('mailchimp');
    setIntegrationConfig({});
    setIntegrationActive(true);
    setEditingIntegration(null);
  };
  
  const openEditWebhook = (webhook: Webhook) => {
    setEditingWebhook(webhook);
    setWebhookName(webhook.name);
    setWebhookUrl(webhook.url);
    setWebhookEvents(webhook.events);
    setWebhookActive(webhook.active);
    setWebhookDialogOpen(true);
  };
  
  const openEditIntegration = (integration: Integration) => {
    setEditingIntegration(integration);
    setIntegrationName(integration.name);
    setIntegrationType(integration.type);
    setIntegrationConfig(integration.config);
    setIntegrationActive(integration.active);
    setIntegrationDialogOpen(true);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!canUseWebhooks) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Recurso Premium</AlertTitle>
        <AlertDescription>
          Webhooks e integrações estão disponíveis apenas nos planos Pro e Enterprise.
          <Button variant="link" className="p-0 h-auto ml-2">
            Fazer upgrade do plano
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Manipuladores para webhooks
  const handleOpenWebhookDialog = (webhook?: Webhook) => {
    if (webhook) {
      setEditingWebhook(webhook);
      setWebhookName(webhook.name);
      setWebhookUrl(webhook.url);
      setWebhookEvents(webhook.events);
      setWebhookActive(webhook.active);
    } else {
      setEditingWebhook(null);
      setWebhookName('');
      setWebhookUrl('');
      setWebhookEvents([]);
      setWebhookActive(true);
    }
    setWebhookDialogOpen(true);
  };

  const handleSaveWebhook = async () => {
    if (!user) return;
    
    try {
      if (editingWebhook) {
        // Atualizar webhook existente
        const success = await WebhookService.updateWebhook(editingWebhook.id, {
          name: webhookName,
          url: webhookUrl,
          events: webhookEvents,
          active: webhookActive
        });
        
        if (success) {
          setWebhooks(webhooks.map(w => 
            w.id === editingWebhook.id 
              ? { ...editingWebhook, name: webhookName, url: webhookUrl, events: webhookEvents, active: webhookActive }
              : w
          ));
        }
      } else {
        // Criar novo webhook
        const newWebhook = await WebhookService.createWebhook(user.id, {
          name: webhookName,
          url: webhookUrl,
          events: webhookEvents,
          active: webhookActive
        });
        
        if (newWebhook) {
          setWebhooks([...webhooks, newWebhook]);
        }
      }
      
      setWebhookDialogOpen(false);
    } catch (error) {
      console.error('Error saving webhook:', error);
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    if (confirm('Tem certeza que deseja excluir este webhook?')) {
      try {
        const success = await WebhookService.deleteWebhook(webhookId);
        
        if (success) {
          setWebhooks(webhooks.filter(w => w.id !== webhookId));
        }
      } catch (error) {
        console.error('Error deleting webhook:', error);
      }
    }
  };

  const handleToggleWebhookEvent = (event: WebhookEvent) => {
    if (webhookEvents.includes(event)) {
      setWebhookEvents(webhookEvents.filter(e => e !== event));
    } else {
      setWebhookEvents([...webhookEvents, event]);
    }
  };

  // Manipuladores para integrações
  const handleOpenIntegrationDialog = (integration?: Integration) => {
    if (integration) {
      setEditingIntegration(integration);
      setIntegrationType(integration.type);
      setIntegrationName(integration.name);
      setIntegrationConfig(integration.config);
      setIntegrationActive(integration.active);
    } else {
      setEditingIntegration(null);
      setIntegrationType('mailchimp');
      setIntegrationName('');
      setIntegrationConfig({});
      setIntegrationActive(true);
    }
    setIntegrationDialogOpen(true);
  };

  const handleSaveIntegration = async () => {
    if (!user) return;
    
    try {
      if (editingIntegration) {
        // Atualizar integração existente
        const success = await WebhookService.updateIntegration(editingIntegration.id, {
          type: integrationType,
          name: integrationName,
          config: integrationConfig,
          active: integrationActive
        });
        
        if (success) {
          setIntegrations(integrations.map(i => 
            i.id === editingIntegration.id 
              ? { ...editingIntegration, type: integrationType, name: integrationName, config: integrationConfig, active: integrationActive }
              : i
          ));
        }
      } else {
        // Criar nova integração
        const newIntegration = await WebhookService.createIntegration(user.id, {
          type: integrationType,
          name: integrationName,
          config: integrationConfig,
          active: integrationActive
        });
        
        if (newIntegration) {
          setIntegrations([...integrations, newIntegration]);
        }
      }
      
      setIntegrationDialogOpen(false);
    } catch (error) {
      console.error('Error saving integration:', error);
    }
  };

  const handleDeleteIntegration = async (integrationId: string) => {
    if (confirm('Tem certeza que deseja excluir esta integração?')) {
      try {
        const success = await WebhookService.deleteIntegration(integrationId);
        
        if (success) {
          setIntegrations(integrations.filter(i => i.id !== integrationId));
        }
      } catch (error) {
        console.error('Error deleting integration:', error);
      }
    }
  };

  const handleConfigChange = (key: string, value: string) => {
    setIntegrationConfig({
      ...integrationConfig,
      [key]: value
    });
  };

  // Renderização condicional para usuários sem acesso a webhooks
  if (!canUseWebhooks) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="warning" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Recurso não disponível</AlertTitle>
          <AlertDescription>
            Webhooks e integrações estão disponíveis apenas nos planos Pro e Premium. 
            <Button variant="link" className="p-0 h-auto" onClick={() => window.location.href = '/plans'}>
              Faça upgrade do seu plano
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return <div className="flex justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Webhooks e Integrações</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
        </TabsList>

        <TabsContent value="webhooks">
          <div className="flex justify-between items-center mb-4">
            <p className="text-muted-foreground">
              Webhooks permitem que você receba notificações em tempo real quando eventos ocorrem na sua conta.
            </p>
            <Button onClick={() => handleOpenWebhookDialog()}>
              <Plus className="mr-2 h-4 w-4" /> Novo Webhook
            </Button>
          </div>

          {webhooks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <p className="text-muted-foreground text-center mb-4">
                  Você ainda não tem webhooks configurados.
                </p>
                <Button onClick={() => handleOpenWebhookDialog()}>
                  <Plus className="mr-2 h-4 w-4" /> Criar Webhook
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {webhooks.map(webhook => (
                <Card key={webhook.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center">
                          {webhook.name}
                          {webhook.active ? (
                            <Badge variant="success" className="ml-2">Ativo</Badge>
                          ) : (
                            <Badge variant="secondary" className="ml-2">Inativo</Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          {webhook.url}
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenWebhookDialog(webhook)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteWebhook(webhook.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {webhook.events.map(event => (
                        <Badge key={event} variant="outline">{event}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Diálogo para criar/editar webhook */}
          <Dialog open={webhookDialogOpen} onOpenChange={setWebhookDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingWebhook ? 'Editar Webhook' : 'Novo Webhook'}</DialogTitle>
                <DialogDescription>
                  Configure seu webhook para receber notificações em tempo real.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="webhook-name">Nome</Label>
                  <Input
                    id="webhook-name"
                    value={webhookName}
                    onChange={(e) => setWebhookName(e.target.value)}
                    placeholder="Meu Webhook"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="webhook-url">URL</Label>
                  <Input
                    id="webhook-url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://exemplo.com/webhook"
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Eventos</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['quiz.created', 'quiz.updated', 'quiz.deleted', 'result.created', 'lead.created'] as WebhookEvent[]).map(event => (
                      <div key={event} className="flex items-center space-x-2">
                        <Checkbox
                          id={`event-${event}`}
                          checked={webhookEvents.includes(event)}
                          onCheckedChange={() => handleToggleWebhookEvent(event)}
                        />
                        <Label htmlFor={`event-${event}`} className="cursor-pointer">{event}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="webhook-active"
                    checked={webhookActive}
                    onCheckedChange={setWebhookActive}
                  />
                  <Label htmlFor="webhook-active">Ativo</Label>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setWebhookDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleSaveWebhook}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="integrations">
          <div className="flex justify-between items-center mb-4">
            <p className="text-muted-foreground">
              Integrações permitem conectar o QuizLiftOff com outras ferramentas e serviços.
            </p>
            <Button onClick={() => handleOpenIntegrationDialog()}>
              <Plus className="mr-2 h-4 w-4" /> Nova Integração
            </Button>
          </div>

          {integrations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <p className="text-muted-foreground text-center mb-4">
                  Você ainda não tem integrações configuradas.
                </p>
                <Button onClick={() => handleOpenIntegrationDialog()}>
                  <Plus className="mr-2 h-4 w-4" /> Criar Integração
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {integrations.map(integration => (
                <Card key={integration.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center">
                          {integration.name}
                          {integration.active ? (
                            <Badge variant="success" className="ml-2">Ativo</Badge>
                          ) : (
                            <Badge variant="secondary" className="ml-2">Inativo</Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Tipo: {integration.type}
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenIntegrationDialog(integration)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteIntegration(integration.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}

          {/* Diálogo para criar/editar integração */}
          <Dialog open={integrationDialogOpen} onOpenChange={setIntegrationDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingIntegration ? 'Editar Integração' : 'Nova Integração'}</DialogTitle>
                <DialogDescription>
                  Configure sua integração com outros serviços.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="integration-type">Tipo</Label>
                  <Select
                    value={integrationType}
                    onValueChange={(value: any) => setIntegrationType(value)}
                  >
                    <SelectTrigger id="integration-type">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mailchimp">Mailchimp</SelectItem>
                      <SelectItem value="zapier">Zapier</SelectItem>
                      <SelectItem value="google_sheets">Google Sheets</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="integration-name">Nome</Label>
                  <Input
                    id="integration-name"
                    value={integrationName}
                    onChange={(e) => setIntegrationName(e.target.value)}
                    placeholder="Minha Integração"
                  />
                </div>

                {/* Campos específicos para cada tipo de integração */}
                {integrationType === 'mailchimp' && (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="mailchimp-api-key">API Key</Label>
                      <Input
                        id="mailchimp-api-key"
                        type="password"
                        value={integrationConfig.apiKey || ''}
                        onChange={(e) => handleConfigChange('apiKey', e.target.value)}
                        placeholder="Sua API Key do Mailchimp"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="mailchimp-list-id">List ID</Label>
                      <Input
                        id="mailchimp-list-id"
                        value={integrationConfig.listId || ''}
                        onChange={(e) => handleConfigChange('listId', e.target.value)}
                        placeholder="ID da lista"
                      />
                    </div>
                  </>
                )}

                {integrationType === 'zapier' && (
                  <div className="grid gap-2">
                    <Label htmlFor="zapier-webhook">Webhook URL</Label>
                    <Input
                      id="zapier-webhook"
                      value={integrationConfig.webhookUrl || ''}
                      onChange={(e) => handleConfigChange('webhookUrl', e.target.value)}
                      placeholder="URL do webhook do Zapier"
                    />
                  </div>
                )}

                {integrationType === 'google_sheets' && (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="sheets-id">Spreadsheet ID</Label>
                      <Input
                        id="sheets-id"
                        value={integrationConfig.spreadsheetId || ''}
                        onChange={(e) => handleConfigChange('spreadsheetId', e.target.value)}
                        placeholder="ID da planilha"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="sheets-tab">Tab Name</Label>
                      <Input
                        id="sheets-tab"
                        value={integrationConfig.tabName || ''}
                        onChange={(e) => handleConfigChange('tabName', e.target.value)}
                        placeholder="Nome da aba"
                      />
                    </div>
                  </>
                )}

                {integrationType === 'custom' && (
                  <div className="grid gap-2">
                    <Label htmlFor="custom-url">URL</Label>
                    <Input
                      id="custom-url"
                      value={integrationConfig.url || ''}
                      onChange={(e) => handleConfigChange('url', e.target.value)}
                      placeholder="URL da integração personalizada"
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch
                    id="integration-active"
                    checked={integrationActive}
                    onCheckedChange={setIntegrationActive}
                  />
                  <Label htmlFor="integration-active">Ativo</Label>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIntegrationDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleSaveIntegration}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}