import { PostgrestError } from '@supabase/supabase-js';

export const getSupabaseErrorMessage = (error: PostgrestError | null): string => {
  if (!error) return 'Ocorreu um erro inesperado';

  // Mapeamento de códigos de erro do Postgres para mensagens amigáveis
  const errorMessages: Record<string, string> = {
    '23505': 'Este registro já existe',
    '23503': 'O registro relacionado não existe',
    '23514': 'A operação viola uma regra do sistema',
    '23502': 'Campos obrigatórios não foram preenchidos',
    '42P01': 'Tabela não encontrada',
    '42703': 'Coluna não encontrada',
    '28000': 'Erro de autenticação',
    '42501': 'Permissão negada para esta operação',
    '22P02': 'Valor inválido para o tipo de dado',
    'PGRST116': 'Limite de recursos excedido',
    'P0001': 'Erro de validação nos dados'
  };

  // Mensagens específicas para erros de RLS (Row Level Security)
  if (error.message.includes('policy')) {
    return 'Você não tem permissão para realizar esta operação';
  }

  // Mensagens para erros de conexão
  if (error.message.includes('network')) {
    return 'Erro de conexão. Verifique sua internet e tente novamente';
  }

  // Retorna mensagem mapeada ou mensagem padrão
  return errorMessages[error.code] || 'Ocorreu um erro ao processar sua solicitação. Tente novamente.';
};

export const handleSupabaseError = (error: PostgrestError | null): never => {
  const message = getSupabaseErrorMessage(error);
  throw new Error(message);
};