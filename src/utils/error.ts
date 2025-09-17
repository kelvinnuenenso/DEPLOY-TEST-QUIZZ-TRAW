import { captureError, captureEvent } from '../config/sentry';

export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleError = (error: unknown, context?: Record<string, unknown>) => {
  if (error instanceof AppError) {
    // Registra erro de aplicação como evento
    captureEvent('AppError', {
      message: error.message,
      ...context
    });
    return error.message;
  }

  // Registra erro inesperado com stack trace
  captureError(error instanceof Error ? error : new Error(String(error)), context);
  return 'Ocorreu um erro inesperado. Por favor, tente novamente.';
};