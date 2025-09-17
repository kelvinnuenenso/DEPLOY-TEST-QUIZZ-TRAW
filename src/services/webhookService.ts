import { supabase } from '@/integrations/supabase/client';
import { TEST_MODE } from '@/lib/flags';

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  active: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Integration {
  id: string;
  name: string;
  type: IntegrationType;
  config: Record<string, unknown>;
  active: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export type WebhookEvent = 
  | 'quiz_completed'
  | 'lead_captured'
  | 'quiz_started'
  | 'quiz_abandoned'
  | 'result_viewed'
  | 'quiz.created'
  | 'quiz.updated'
  | 'quiz.deleted'
  | 'result.created'
  | 'lead.created';

export type IntegrationType = 
  | 'mailchimp'
  | 'zapier'
  | 'google_sheets'
  | 'hubspot'
  | 'custom';

class WebhookService {
  // Webhooks
  async getWebhooks(userId: string): Promise<Webhook[]> {
    if (TEST_MODE) {
      return [
        {
          id: '1',
          name: 'Webhook Principal',
          url: 'https://exemplo.com/webhook',
          events: ['quiz_completed', 'lead_captured'],
          active: true,
          userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Webhook Secundário',
          url: 'https://outro-exemplo.com/webhook',
          events: ['quiz_started'],
          active: false,
          userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    }

    const { data, error } = await supabase
      .from('webhooks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar webhooks:', error);
      return [];
    }

    return data || [];
  }

  async listWebhooks(userId: string): Promise<Webhook[]> {
    return this.getWebhooks(userId);
  }

  async createWebhook(userId: string, webhookData: Omit<Webhook, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Webhook | null> {
    if (TEST_MODE) {
      const newWebhook: Webhook = {
        id: Date.now().toString(),
        ...webhookData,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return newWebhook;
    }

    const { data, error } = await supabase
      .from('webhooks')
      .insert({
        user_id: userId,
        name: webhookData.name,
        url: webhookData.url,
        events: webhookData.events,
        active: webhookData.active
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar webhook:', error);
      return null;
    }

    return data;
  }

  async updateWebhook(webhookId: string, updates: Partial<Webhook>): Promise<boolean> {
    if (TEST_MODE) {
      return true;
    }

    const { error } = await supabase
      .from('webhooks')
      .update({
        name: updates.name,
        url: updates.url,
        events: updates.events,
        active: updates.active,
        updated_at: new Date().toISOString()
      })
      .eq('id', webhookId);

    if (error) {
      console.error('Erro ao atualizar webhook:', error);
      return false;
    }

    return true;
  }

  async deleteWebhook(webhookId: string): Promise<boolean> {
    if (TEST_MODE) {
      return true;
    }

    const { error } = await supabase
      .from('webhooks')
      .delete()
      .eq('id', webhookId);

    if (error) {
      console.error('Erro ao deletar webhook:', error);
      return false;
    }

    return true;
  }

  // Integrações
  async getIntegrations(userId: string): Promise<Integration[]> {
    if (TEST_MODE) {
      return [
        {
          id: '1',
          name: 'Mailchimp Principal',
          type: 'mailchimp',
          config: {
            apiKey: '***hidden***',
            listId: 'abc123'
          },
          active: true,
          userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Zapier Automation',
          type: 'zapier',
          config: {
            webhookUrl: 'https://hooks.zapier.com/hooks/catch/123/abc/'
          },
          active: true,
          userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    }

    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar integrações:', error);
      return [];
    }

    return data || [];
  }

  async listIntegrations(userId: string): Promise<Integration[]> {
    return this.getIntegrations(userId);
  }

  async createIntegration(userId: string, integrationData: Omit<Integration, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Integration | null> {
    if (TEST_MODE) {
      const newIntegration: Integration = {
        id: Date.now().toString(),
        ...integrationData,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return newIntegration;
    }

    const { data, error } = await supabase
      .from('integrations')
      .insert({
        user_id: userId,
        name: integrationData.name,
        type: integrationData.type,
        config: integrationData.config,
        active: integrationData.active
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar integração:', error);
      return null;
    }

    return data;
  }

  async updateIntegration(integrationId: string, updates: Partial<Integration>): Promise<boolean> {
    if (TEST_MODE) {
      return true;
    }

    const { error } = await supabase
      .from('integrations')
      .update({
        name: updates.name,
        type: updates.type,
        config: updates.config,
        active: updates.active,
        updated_at: new Date().toISOString()
      })
      .eq('id', integrationId);

    if (error) {
      console.error('Erro ao atualizar integração:', error);
      return false;
    }

    return true;
  }

  async deleteIntegration(integrationId: string): Promise<boolean> {
    if (TEST_MODE) {
      return true;
    }

    const { error } = await supabase
      .from('integrations')
      .delete()
      .eq('id', integrationId);

    if (error) {
      console.error('Erro ao deletar integração:', error);
      return false;
    }

    return true;
  }

  // Disparar webhook
  async triggerWebhook(event: WebhookEvent, data: Record<string, unknown>): Promise<void> {
    if (TEST_MODE) {
      console.log(`[TEST MODE] Webhook triggered: ${event}`, data);
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('trigger-webhook', {
        body: { event, data }
      });

      if (error) {
        console.error('Erro ao disparar webhook:', error);
      }
    } catch (error) {
      console.error('Erro ao disparar webhook:', error);
    }
  }

  // Testar webhook
  async testWebhook(webhookId: string): Promise<boolean> {
    if (TEST_MODE) {
      return true;
    }

    try {
      const { data, error } = await supabase.functions.invoke('test-webhook', {
        body: { webhookId }
      });

      if (error) {
        console.error('Erro ao testar webhook:', error);
        return false;
      }

      return data?.success || false;
    } catch (error) {
      console.error('Erro ao testar webhook:', error);
      return false;
    }
  }
}

export const webhookService = new WebhookService();
export default webhookService;