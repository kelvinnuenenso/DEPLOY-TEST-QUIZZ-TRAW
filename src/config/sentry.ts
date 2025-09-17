import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

export const initSentry = () => {
  if (import.meta.env.PROD) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [new BrowserTracing()],
      
      // Configurações de performance
      tracesSampleRate: 0.2,
      tracePropagationTargets: ['localhost', /^https:\/\/[^/]+\.quizliftoff\.com/],
      
      // Configurações de ambiente
      environment: import.meta.env.MODE,
      release: import.meta.env.VITE_APP_VERSION,
      
      // Configurações de captura de erro
      beforeSend(event) {
        // Não enviar erros em desenvolvimento
        if (import.meta.env.DEV) {
          return null;
        }

        // Filtrar informações sensíveis
        if (event.request?.cookies) {
          delete event.request.cookies;
        }

        // Limpar URLs que possam conter tokens
        if (event.request?.url) {
          event.request.url = event.request.url.replace(/token=[^&]+/, 'token=[FILTERED]');
        }

        return event;
      },
      
      // Configurações de breadcrumbs
      beforeBreadcrumb(breadcrumb) {
        // Filtrar informações sensíveis dos breadcrumbs
        if (breadcrumb.data?.url) {
          breadcrumb.data.url = breadcrumb.data.url.replace(/token=[^&]+/, 'token=[FILTERED]');
        }
        return breadcrumb;
      },
    });
  }
};

// Função para capturar erros com contexto adicional
export const captureError = (error: Error, context?: Record<string, unknown>) => {
  if (import.meta.env.PROD) {
    Sentry.withScope((scope) => {
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
      }
      Sentry.captureException(error);
    });
  } else {
    console.error('Error:', error, '\nContext:', context);
  }
};

// Função para capturar eventos personalizados
export const captureEvent = (name: string, data?: Record<string, unknown>) => {
  if (import.meta.env.PROD) {
    Sentry.captureEvent({
      message: name,
      level: 'info',
      extra: data,
    });
  } else {
    console.log('Event:', name, '\nData:', data);
  }
};

// Função para adicionar breadcrumb personalizado
export const addBreadcrumb = (message: string, category: string, data?: Record<string, unknown>) => {
  if (import.meta.env.PROD) {
    Sentry.addBreadcrumb({
      message,
      category,
      data,
      level: 'info',
    });
  }
};

// Função para definir contexto do usuário
export const setUserContext = (user: {
  id: string;
  email?: string;
  name?: string;
}) => {
  if (import.meta.env.PROD) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.name,
    });
  }
};

// Função para limpar contexto do usuário
export const clearUserContext = () => {
  if (import.meta.env.PROD) {
    Sentry.setUser(null);
  }
};

// Função para definir tags globais
export const setTags = (tags: Record<string, string>) => {
  if (import.meta.env.PROD) {
    Object.entries(tags).forEach(([key, value]) => {
      Sentry.setTag(key, value);
    });
  }
};

// Função para medir performance
export const measurePerformance = <T>(name: string, operation: () => Promise<T>) => {
  if (import.meta.env.PROD) {
    const transaction = Sentry.startTransaction({
      name,
      op: 'task',
    });

    Sentry.configureScope(scope => {
      scope.setSpan(transaction);
    });

    return operation()
      .then(result => {
        transaction.finish();
        return result;
      })
      .catch(error => {
        transaction.finish();
        throw error;
      });
  }

  return operation();
};