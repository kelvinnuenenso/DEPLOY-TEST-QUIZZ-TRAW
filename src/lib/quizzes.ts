import { Quiz, Result, Lead } from '@/types/quiz';
import { localDB } from './localStorage';
import { supabase } from '@/integrations/supabase/client';
import { TEST_MODE } from './flags';

export async function saveQuiz(quiz: Quiz): Promise<Quiz> {
  if (TEST_MODE) {
    localDB.saveQuiz(quiz);
    return quiz;
  } else {
    try {
      // Verificar se o usuário está autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('Usuário não autenticado');

      // Preparar dados para salvar
      const quizData = {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        public_id: quiz.publicId,
        questions: quiz.questions,
        settings: quiz.settings,
        results: quiz.results,
        created_at: quiz.createdAt,
        updated_at: new Date().toISOString(),
        user_id: quiz.userId || user.id
      };

      // Validar dados obrigatórios
      if (!quizData.title) throw new Error('O título do quiz é obrigatório');
      if (!quizData.public_id) throw new Error('O ID público do quiz é obrigatório');
      if (!quizData.user_id) throw new Error('ID do usuário não encontrado');

      // Save to Supabase
      const { data, error } = await supabase
        .from('quizzes')
        .upsert(quizData)
        .select()
        .single();
      
      if (error) {
        if (error.code === '23505') {
          throw new Error('Já existe um quiz com este ID público');
        }
        throw error;
      }
      
      if (!data) throw new Error('Erro ao salvar o quiz');

      // Convert from DB format to app format
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        publicId: data.public_id,
        questions: data.questions,
        settings: data.settings,
        results: data.results,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        userId: data.user_id
      };
    } catch (error) {
      console.error('Error saving quiz:', error);
      if (error instanceof Error) {
        throw new Error(`Erro ao salvar quiz: ${error.message}`);
      }
      throw new Error('Erro inesperado ao salvar o quiz');
    }
  }
}

export async function loadQuizByPublicId(publicId: string): Promise<Quiz | null> {
  if (TEST_MODE) {
    return localDB.getQuizByPublicId(publicId);
  } else {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('public_id', publicId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null; // No rows found
        throw error;
      }
      
      if (!data) return null;
      
      // Convert from DB format to app format
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        publicId: data.public_id,
        questions: data.questions,
        settings: data.settings,
        results: data.results,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        userId: data.user_id
      };
    } catch (error) {
      console.error('Error loading quiz by public ID:', error);
      return null;
    }
  }
}

export async function loadQuiz(id: string): Promise<Quiz | null> {
  if (TEST_MODE) {
    return localDB.getQuiz(id);
  } else {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null; // No rows found
        throw error;
      }
      
      if (!data) return null;
      
      // Convert from DB format to app format
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        publicId: data.public_id,
        questions: data.questions,
        settings: data.settings,
        results: data.results,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        userId: data.user_id
      };
    } catch (error) {
      console.error('Error loading quiz:', error);
      return null;
    }
  }
}

export async function listQuizzes(): Promise<Quiz[]> {
  if (TEST_MODE) {
    return localDB.getAllQuizzes();
  } else {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (!data) return [];
      
      // Convert from DB format to app format
      return data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        publicId: item.public_id,
        questions: item.questions,
        settings: item.settings,
        results: item.results,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        userId: item.user_id
      }));
    } catch (error) {
      console.error('Error listing quizzes:', error);
      return [];
    }
  }
}

export async function deleteQuiz(id: string): Promise<void> {
  if (TEST_MODE) {
    localDB.deleteQuiz(id);
  } else {
    try {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting quiz:', error);
      throw error;
    }
  }
}

export async function saveResult(result: Result): Promise<void> {
  if (TEST_MODE) {
    localDB.saveResult(result);
  } else {
    try {
      const { error } = await supabase
        .from('results')
        .upsert({
          id: result.id,
          quiz_id: result.quizId,
          answers: result.answers,
          score: result.score,
          result_type: result.resultType,
          created_at: result.createdAt,
          lead_id: result.leadId,
          utm_source: result.utmSource,
          utm_medium: result.utmMedium,
          utm_campaign: result.utmCampaign
        });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error saving result:', error);
      throw error;
    }
  }
}

export async function saveLead(lead: Lead): Promise<void> {
  if (TEST_MODE) {
    localDB.saveLead(lead);  
  } else {
    try {
      const { error } = await supabase
        .from('leads')
        .upsert({
          id: lead.id,
          email: lead.email,
          name: lead.name,
          quiz_id: lead.quizId,
          created_at: lead.createdAt,
          metadata: lead.metadata
        });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error saving lead:', error);
      throw error;
    }
  }
}

export async function getResult(id: string): Promise<Result | null> {
  if (TEST_MODE) {
    return localDB.getResult(id);
  } else {
    try {
      const { data, error } = await supabase
        .from('results')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null; // No rows found
        throw error;
      }
      
      if (!data) return null;
      
      // Convert from DB format to app format
      return {
        id: data.id,
        quizId: data.quiz_id,
        answers: data.answers,
        score: data.score,
        resultType: data.result_type,
        createdAt: data.created_at,
        leadId: data.lead_id,
        utmSource: data.utm_source,
        utmMedium: data.utm_medium,
        utmCampaign: data.utm_campaign
      };
    } catch (error) {
      console.error('Error getting result:', error);
      return null;
    }
  }
}