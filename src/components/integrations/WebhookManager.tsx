import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Settings, 
  Play, 
  Pause, 
  Trash2, 
  Copy, 
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  Zap,
  Globe
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  isActive: boolean;
  secretKey?: string;
  retryAttempts: number;
  retryDelay: number; // in seconds
  headers: Record<string, string>;
  payload: WebhookPayload;
  createdAt: string;
  lastTriggered?: string;
  totalTriggers: number;
  successfulTriggers: number;
  failedTriggers: number;
}

interface WebhookEvent {
  type: 'quiz_started' | 'quiz_completed' | 'lead_captured' | 'result_generated';
  enabled: boolean;
}

interface WebhookPayload {
  includeUserData: boolean;
  includeQuizData: boolean;
  includeAnswers: boolean;
  includeMetadata: boolean;
  customFields: Record<string, string>;
}

interface WebhookLog {
  id: string;
  webhookId: string;
  timestamp: string;
  event: string;
  status: 'success' | 'failed' | 'retrying';
  statusCode?: number;
  responseTime: number;
  attempt: number;
  error?: string;
  payload: any;
}

interface WebhookManagerProps {
  quizId: string;
}

export const WebhookManager = ({ quizId }: WebhookManagerProps) => {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null);
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);
  const { toast } = useToast();

  const [newWebhook, setNewWebhook] = useState<Partial<Webhook>>({
    name: '',
    url: '',
    events: [
      { type: 'quiz_started', enabled: true },
      { type: 'quiz_completed', enabled: true },
      { type: 'lead_captured', enabled: true },
      { type: 'result_generated', enabled: false }
    ],
    isActive: true,
    retryAttempts: 3,
    retryDelay: 5,
    headers: {},
    payload: {
      includeUserData: true,
      includeQuizData: true,
      includeAnswers: true,
      includeMetadata: false,
      customFields: {}
    }
  });

  useEffect(() => {
    loadWebhooks();
    loadWebhookLogs();
  }, [quizId]);

  const loadWebhooks = () => {
    // Mock webhooks data
    const mockWebhooks: Webhook[] = [
      {
        id: 'webhook_1',
        name: 'Zapier Integration',
        url: 'https://hooks.zapier.com/hooks/catch/12345/abcdef/',
        events: [
          { type: 'quiz_completed', enabled: true },
          { type: 'lead_captured', enabled: true },
          { type: 'quiz_started', enabled: false },
          { type: 'result_generated', enabled: false }
        ],
        isActive: true,
        retryAttempts: 3,
        retryDelay: 5,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'your-api-key'
        },
        payload: {
          includeUserData: true,
          includeQuizData: true,
          includeAnswers: true,
          includeMetadata: false,
          customFields: {
            source: 'elevado-quiz',
            environment: 'production'
          }
        },
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        totalTriggers: 156,
        successfulTriggers: 149,
        failedTriggers: 7
      },
      {
        id: 'webhook_2',
        name: 'CRM Sync',
        url: 'https://api.crm.com/webhooks/leads',
        events: [
          { type: 'lead_captured', enabled: true },
          { type: 'quiz_completed', enabled: false },
          { type: 'quiz_started', enabled: false },
          { type: 'result_generated', enabled: false }
        ],
        isActive: false,
        retryAttempts: 5,
        retryDelay: 10,
        headers: {
          'Authorization': 'Bearer your-token',
          'Content-Type': 'application/json'
        },
        payload: {
          includeUserData: true,
          includeQuizData: false,
          includeAnswers: false,
          includeMetadata: true,
          customFields: {}
        },
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        lastTriggered: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        totalTriggers: 89,
        successfulTriggers: 84,
        failedTriggers: 5
      }
    ];

    setWebhooks(mockWebhooks);
  };

  const loadWebhookLogs = () => {
    // Mock webhook logs
    const mockLogs: WebhookLog[] = [
      {
        id: 'log_1',
        webhookId: 'webhook_1',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        event: 'quiz_completed',
        status: 'success',
        statusCode: 200,
        responseTime: 245,
        attempt: 1,
        payload: {
          event: 'quiz_completed',
          quiz_id: quizId,
          user_data: { email: 'user@example.com' },
          completion_time: '2024-01-15T10:30:00Z'
        }
      },
      {
        id: 'log_2',
        webhookId: 'webhook_1',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        event: 'lead_captured',
        status: 'failed',
        statusCode: 500,
        responseTime: 5000,
        attempt: 3,
        error: 'Internal Server Error - Database connection timeout',
        payload: {
          event: 'lead_captured',
          quiz_id: quizId,
          lead_data: { email: 'lead@example.com', name: 'João Silva' }
        }
      },
      {
        id: 'log_3',
        webhookId: 'webhook_2',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        event: 'lead_captured',
        status: 'success',
        statusCode: 201,
        responseTime: 189,
        attempt: 1,
        payload: {
          event: 'lead_captured',
          quiz_id: quizId,
          lead_data: { email: 'customer@example.com', name: 'Maria Santos' }
        }
      }
    ];

    setLogs(mockLogs);
  };

  const createWebhook = () => {
    const webhook: Webhook = {
      id: `webhook_${Date.now()}`,
      name: newWebhook.name || 'Novo Webhook',
      url: newWebhook.url || '',
      events: newWebhook.events || [],
      isActive: newWebhook.isActive ?? true,
      retryAttempts: newWebhook.retryAttempts || 3,
      retryDelay: newWebhook.retryDelay || 5,
      headers: newWebhook.headers || {},
      payload: newWebhook.payload || {
        includeUserData: true,
        includeQuizData: true,
        includeAnswers: true,
        includeMetadata: false,
        customFields: {}
      },
      createdAt: new Date().toISOString(),
      totalTriggers: 0,
      successfulTriggers: 0,
      failedTriggers: 0
    };

    setWebhooks([webhook, ...webhooks]);
    setIsCreating(false);
    setNewWebhook({});
    
    toast({
      title: "Webhook criado",
      description: "Webhook configurado com sucesso!"
    });
  };

  const toggleWebhook = (webhookId: string, isActive: boolean) => {
    setWebhooks(webhooks.map(w => 
      w.id === webhookId ? { ...w, isActive } : w
    ));
    
    toast({
      title: isActive ? "Webhook ativado" : "Webhook desativado",
      description: `O webhook foi ${isActive ? 'ativado' : 'desativado'} com sucesso.`
    });
  };

  const testWebhook = async (webhookId: string) => {
    setTestingWebhook(webhookId);
    
    const webhook = webhooks.find(w => w.id === webhookId);
    if (!webhook) return;

    try {
      // Simulate webhook test
      const testPayload = {
        event: 'test',
        quiz_id: quizId,
        timestamp: new Date().toISOString(),
        test_data: {
          message: 'This is a test webhook from Elevado',
          quiz_name: 'Test Quiz',
          user_data: { email: 'test@example.com' }
        }
      };

      // Make actual webhook call
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...webhook.headers
        },
        body: JSON.stringify(testPayload)
      });

      if (response.ok) {
        toast({
          title: "Teste bem-sucedido!",
          description: `Webhook respondeu com status ${response.status}`
        });
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      toast({
        title: "Erro no teste",
        description: `Falha ao testar webhook: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive"
      });
    } finally {
      setTestingWebhook(null);
    }
  };

  const deleteWebhook = (webhookId: string) => {
    setWebhooks(webhooks.filter(w => w.id !== webhookId));
    toast({
      title: "Webhook removido",
      description: "Webhook foi removido com sucesso."
    });
  };

  const copyWebhookUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "URL copiada",
      description: "URL do webhook foi copiada para a área de transferência."
    });
  };

  const retryFailedWebhook = (logId: string) => {
    // Simulate retry
    setLogs(logs.map(log => 
      log.id === logId 
        ? { ...log, status: 'retrying' as const, attempt: log.attempt + 1 }
        : log
    ));

    setTimeout(() => {
      setLogs(logs.map(log => 
        log.id === logId 
          ? { ...log, status: Math.random() > 0.3 ? 'success' : 'failed' as const }
          : log
      ));
    }, 2000);

    toast({
      title: "Tentativa de reenvio",
      description: "Tentando reenviar webhook..."
    });
  };

  const getStatusColor = (status: WebhookLog['status']) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'retrying': return 'text-yellow-600';
    }
  };

  const getStatusIcon = (status: WebhookLog['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      case 'retrying': return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Gerenciador de Webhooks</h3>
          <p className="text-muted-foreground">
            Configure webhooks para integrar com serviços externos
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Webhook
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Webhooks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{webhooks.length}</div>
            <div className="text-sm text-muted-foreground">
              {webhooks.filter(w => w.isActive).length} ativos
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Disparos Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {webhooks.reduce((sum, w) => sum + w.totalTriggers, 0)}
            </div>
            <div className="text-sm text-green-600">
              {webhooks.reduce((sum, w) => sum + w.successfulTriggers, 0)} sucessos
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa de Sucesso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {webhooks.length > 0 
                ? Math.round((webhooks.reduce((sum, w) => sum + w.successfulTriggers, 0) / webhooks.reduce((sum, w) => sum + w.totalTriggers, 1)) * 100)
                : 0}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Falhas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {logs.filter(l => l.status === 'failed').length}
            </div>
            <div className="text-sm text-muted-foreground">Últimas 24h</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="webhooks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="webhooks" className="space-y-4">
          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <Card key={webhook.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-blue-600" />
                        <div>
                          <CardTitle>{webhook.name}</CardTitle>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Globe className="w-3 h-3" />
                            {webhook.url}
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => copyWebhookUrl(webhook.url)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </p>
                        </div>
                      </div>
                      <Badge variant={webhook.isActive ? 'default' : 'secondary'}>
                        {webhook.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testWebhook(webhook.id)}
                        disabled={testingWebhook === webhook.id}
                      >
                        {testingWebhook === webhook.id ? (
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4 mr-2" />
                        )}
                        Testar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingWebhook(webhook)}
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Switch
                        checked={webhook.isActive}
                        onCheckedChange={(checked) => toggleWebhook(webhook.id, checked)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteWebhook(webhook.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Eventos Ativos</h4>
                      <div className="space-y-1">
                        {webhook.events.filter(e => e.enabled).map((event) => (
                          <Badge key={event.type} variant="outline">
                            {event.type.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Estatísticas</h4>
                      <div className="text-sm space-y-1">
                        <div>Total: {webhook.totalTriggers}</div>
                        <div className="text-green-600">Sucessos: {webhook.successfulTriggers}</div>
                        <div className="text-red-600">Falhas: {webhook.failedTriggers}</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Configuração</h4>
                      <div className="text-sm space-y-1">
                        <div>Tentativas: {webhook.retryAttempts}</div>
                        <div>Delay: {webhook.retryDelay}s</div>
                        {webhook.lastTriggered && (
                          <div>Último: {new Date(webhook.lastTriggered).toLocaleString('pt-BR')}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Webhooks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {logs.map((log) => {
                  const webhook = webhooks.find(w => w.id === log.webhookId);
                  return (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={getStatusColor(log.status)}>
                          {getStatusIcon(log.status)}
                        </div>
                        <div>
                          <div className="font-medium">{webhook?.name || 'Webhook Desconhecido'}</div>
                          <div className="text-sm text-muted-foreground">
                            {log.event} • {new Date(log.timestamp).toLocaleString('pt-BR')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right text-sm">
                          <div className={`font-medium ${getStatusColor(log.status)}`}>
                            {log.status}
                          </div>
                          <div className="text-muted-foreground">
                            {log.responseTime}ms • Tentativa {log.attempt}
                          </div>
                        </div>
                        {log.status === 'failed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => retryFailedWebhook(log.id)}
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Tentar Novamente
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Templates Populares</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    name: 'Zapier Integration',
                    description: 'Configure webhook para Zapier',
                    url: 'https://hooks.zapier.com/hooks/catch/{{zap_id}}/{{hook_id}}/',
                    events: ['quiz_completed', 'lead_captured']
                  },
                  {
                    name: 'Slack Notifications',
                    description: 'Receba notificações no Slack',
                    url: 'https://hooks.slack.com/services/{{workspace}}/{{channel}}/{{token}}',
                    events: ['quiz_completed']
                  },
                  {
                    name: 'HubSpot CRM',
                    description: 'Sincronizar leads com HubSpot',
                    url: 'https://api.hubapi.com/contacts/v1/contact/',
                    events: ['lead_captured']
                  }
                ].map((template, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <h4 className="font-medium">{template.name}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {template.events.map(event => (
                          <Badge key={event} variant="outline" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setNewWebhook({
                            ...newWebhook,
                            name: template.name,
                            url: template.url,
                            events: template.events.map(event => ({
                              type: event as any,
                              enabled: true
                            }))
                          });
                          setIsCreating(true);
                        }}
                      >
                        Usar Template
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Exemplo de Payload</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-50 p-3 rounded-lg overflow-auto">
{`{
  "event": "quiz_completed",
  "timestamp": "2024-01-15T10:30:00Z",
  "quiz_id": "${quizId}",
  "quiz_data": {
    "name": "Quiz de Personalidade",
    "description": "Descubra seu perfil"
  },
  "user_data": {
    "id": "user_123",
    "email": "usuario@exemplo.com",
    "name": "João Silva"
  },
  "answers": [
    {
      "question_id": "q1",
      "answer": "Opção A",
      "score": 10
    }
  ],
  "result": {
    "score": 85,
    "outcome": "Extrovertido",
    "completion_time": 120
  },
  "metadata": {
    "source": "web",
    "device": "desktop",
    "referrer": "google.com"
  }
}`}
                </pre>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Webhook Modal */}
      {(isCreating || editingWebhook) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {isCreating ? 'Criar Novo Webhook' : 'Editar Webhook'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="webhook-name">Nome</Label>
                  <Input 
                    id="webhook-name" 
                    placeholder="Ex: Integração CRM"
                    value={newWebhook.name || ''}
                    onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webhook-url">URL</Label>
                  <Input 
                    id="webhook-url" 
                    placeholder="https://api.example.com/webhook"
                    type="url"
                    value={newWebhook.url || ''}
                    onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Eventos</Label>
                <div className="space-y-2">
                  {newWebhook.events?.map((event, index) => (
                    <div key={event.type} className="flex items-center justify-between">
                      <span className="text-sm">{event.type.replace('_', ' ').toUpperCase()}</span>
                      <Switch
                        checked={event.enabled}
                        onCheckedChange={(checked) => {
                          const updatedEvents = [...(newWebhook.events || [])];
                          updatedEvents[index] = { ...event, enabled: checked };
                          setNewWebhook({ ...newWebhook, events: updatedEvents });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="retry-attempts">Tentativas de Retry</Label>
                  <Input 
                    id="retry-attempts" 
                    type="number"
                    min="0"
                    max="10"
                    value={newWebhook.retryAttempts || 3}
                    onChange={(e) => setNewWebhook({ ...newWebhook, retryAttempts: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retry-delay">Delay entre Tentativas (s)</Label>
                  <Input 
                    id="retry-delay" 
                    type="number"
                    min="1"
                    max="300"
                    value={newWebhook.retryDelay || 5}
                    onChange={(e) => setNewWebhook({ ...newWebhook, retryDelay: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="headers">Headers Customizados (JSON)</Label>
                <Textarea 
                  id="headers" 
                  placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
                  value={JSON.stringify(newWebhook.headers || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      const headers = JSON.parse(e.target.value || '{}');
                      setNewWebhook({ ...newWebhook, headers });
                    } catch {}
                  }}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsCreating(false);
                    setEditingWebhook(null);
                    setNewWebhook({});
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={createWebhook}>
                  {isCreating ? 'Criar Webhook' : 'Salvar Alterações'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};