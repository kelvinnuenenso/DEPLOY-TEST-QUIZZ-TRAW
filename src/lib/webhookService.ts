import { supabase } from '@/integrations/supabase/client';
import { TEST_MODE } from './flags';
import { PlanManager } from './planManager';
import { User } from '@/hooks/useAuth';

export interface Webhook {
  id: string;
  userId: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  headers?: Record<string, string>;
  active: boolean;
  createdAt: string;
  lastTriggeredAt?: string;
}

export type WebhookEvent = 
  | 'quiz.created'
  | 'quiz.updated'
  | 'quiz.deleted'
  | 'result.created'
  | 'lead.created';

export interface WebhookPayload {
  event: WebhookEvent;
  data: any;
  timestamp: string;
}

export interface Integration {
  id: string;
  userId: string;
  type: 'mailchimp' | 'zapier' | 'google_sheets' | 'custom';
  name: string;
  config: Record<string, any>;
  active: boolean;
  createdAt: string;
}

/**
 * Serviço para gerenciar webhooks e integrações
 */
export class WebhookService {
  /**
   * Verifica se o usuário pode usar webhooks
   */
  static async canUseWebhooks(user: User): Promise<boolean> {
    return PlanManager.canUseWebhooks(user);
  }

  /**
   * Lista todos os webhooks do usuário
   */
  static async listWebhooks(userId: string): Promise<Webhook[]> {
    if (TEST_MODE) {
      // No modo de teste, retorna webhooks simulados
      return [
        {
          id: 'mock-webhook-1',
          userId,
          name: 'Webhook de exemplo',
          url: 'https://example.com/webhook',
          events: ['quiz.created', 'result.created'],
          active: true,
          createdAt: new Date().toISOString()
        }
      ];
    }

    try {
      const { data, error } = await supabase
        .from('webhooks')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      return (data || []).map(webhook => ({
        id: webhook.id,
        userId: webhook.user_id,
        name: webhook.name,
        url: webhook.url,
        events: webhook.events,
        headers: webhook.headers,
        active: webhook.active,
        createdAt: webhook.created_at,
        lastTriggeredAt: webhook.last_triggered_at
      }));
    } catch (error) {
      console.error('Error listing webhooks:', error);
      return [];
    }
  }

  /**
   * Cria um novo webhook
   */
  static async createWebhook(userId: string, webhook: Omit<Webhook, 'id' | 'userId' | 'createdAt'>): Promise<Webhook | null> {
    if (TEST_MODE) {
      // No modo de teste, simula a criação
      return {
        id: `mock-webhook-${Date.now()}`,
        userId,
        ...webhook,
        createdAt: new Date().toISOString()
      };
    }

    try {
      const { data, error } = await supabase
        .from('webhooks')
        .insert({
          user_id: userId,
          name: webhook.name,
          url: webhook.url,
          events: webhook.events,
          headers: webhook.headers || {},
          active: webhook.active
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        url: data.url,
        events: data.events,
        headers: data.headers,
        active: data.active,
        createdAt: data.created_at,
        lastTriggeredAt: data.last_triggered_at
      };
    } catch (error) {
      console.error('Error creating webhook:', error);
      return null;
    }
  }

  /**
   * Atualiza um webhook existente
   */
  static async updateWebhook(webhookId: string, updates: Partial<Omit<Webhook, 'id' | 'userId' | 'createdAt'>>): Promise<boolean> {
    if (TEST_MODE) {
      // No modo de teste, simula a atualização
      return true;
    }

    try {
      const { error } = await supabase
        .from('webhooks')
        .update({
          name: updates.name,
          url: updates.url,
          events: updates.events,
          headers: updates.headers,
          active: updates.active
        })
        .eq('id', webhookId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating webhook:', error);
      return false;
    }
  }

  /**
   * Exclui um webhook
   */
  static async deleteWebhook(webhookId: string): Promise<boolean> {
    if (TEST_MODE) {
      // No modo de teste, simula a exclusão
      return true;
    }

    try {
      const { error } = await supabase
        .from('webhooks')
        .delete()
        .eq('id', webhookId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting webhook:', error);
      return false;
    }
  }

  /**
   * Dispara um evento de webhook
   */
  static async triggerWebhook(userId: string, event: WebhookEvent, data: any): Promise<void> {
    if (TEST_MODE) {
      // No modo de teste, apenas loga o evento
      console.log(`[TEST] Webhook triggered: ${event}`, data);
      return;
    }

    try {
      // Buscar webhooks ativos para este usuário e evento
      const { data: webhooks, error } = await supabase
        .from('webhooks')
        .select('*')
        .eq('user_id', userId)
        .eq('active', true)
        .contains('events', [event]);

      if (error) throw error;

      if (!webhooks || webhooks.length === 0) return;

      // Em produção, chamaríamos uma função do Supabase Edge Function
      // para disparar os webhooks de forma assíncrona
      await supabase.functions.invoke('trigger-webhooks', {
        body: {
          webhooks,
          payload: {
            event,
            data,
            timestamp: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error('Error triggering webhooks:', error);
    }
  }

  /**
   * Lista todas as integrações do usuário
   */
  static async listIntegrations(userId: string): Promise<Integration[]> {
    if (TEST_MODE) {
      // No modo de teste, retorna integrações simuladas
      return [
        {
          id: 'mock-integration-1',
          userId,
          type: 'mailchimp',
          name: 'Mailchimp',
          config: {
            apiKey: '***********',
            listId: '12345'
          },
          active: true,
          createdAt: new Date().toISOString()
        }
      ];
    }

    try {
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      return (data || []).map(integration => ({
        id: integration.id,
        userId: integration.user_id,
        type: integration.type,
        name: integration.name,
        config: integration.config,
        active: integration.active,
        createdAt: integration.created_at
      }));
    } catch (error) {
      console.error('Error listing integrations:', error);
      return [];
    }
  }

  /**
   * Cria uma nova integração
   */
  static async createIntegration(userId: string, integration: Omit<Integration, 'id' | 'userId' | 'createdAt'>): Promise<Integration | null> {
    if (TEST_MODE) {
      // No modo de teste, simula a criação
      return {
        id: `mock-integration-${Date.now()}`,
        userId,
        ...integration,
        createdAt: new Date().toISOString()
      };
    }

    try {
      const { data, error } = await supabase
        .from('integrations')
        .insert({
          user_id: userId,
          type: integration.type,
          name: integration.name,
          config: integration.config,
          active: integration.active
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        userId: data.user_id,
        type: data.type,
        name: data.name,
        config: data.config,
        active: data.active,
        createdAt: data.created_at
      };
    } catch (error) {
      console.error('Error creating integration:', error);
      return null;
    }
  }

  /**
   * Atualiza uma integração existente
   */
  static async updateIntegration(integrationId: string, updates: Partial<Omit<Integration, 'id' | 'userId' | 'createdAt'>>): Promise<boolean> {
    if (TEST_MODE) {
      // No modo de teste, simula a atualização
      return true;
    }

    try {
      const { error } = await supabase
        .from('integrations')
        .update({
          type: updates.type,
          name: updates.name,
          config: updates.config,
          active: updates.active
        })
        .eq('id', integrationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating integration:', error);
      return false;
    }
  }

  /**
   * Exclui uma integração
   */
  static async deleteIntegration(integrationId: string): Promise<boolean> {
    if (TEST_MODE) {
      // No modo de teste, simula a exclusão
      return true;
    }

    try {
      const { error } = await supabase
        .from('integrations')
        .delete()
        .eq('id', integrationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting integration:', error);
      return false;
    }
  }
}