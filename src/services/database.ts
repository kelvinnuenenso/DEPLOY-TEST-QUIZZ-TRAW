import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/types/database.types';
import { handleSupabaseError } from '@/utils/supabase-error';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Quiz = Database['public']['Tables']['quizzes']['Row'];
export type Question = Database['public']['Tables']['questions']['Row'];
export type QuizResult = Database['public']['Tables']['quiz_results']['Row'];

export const databaseService = {
  profiles: {
    async get(userId: string) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) handleSupabaseError(error);
      return data;
    },

    async upsert(profile: Partial<Profile> & { id: string }) {
      const { data, error } = await supabase
        .from('profiles')
        .upsert(profile)
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return data;
    },
  },

  quizzes: {
    async list(userId: string) {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) handleSupabaseError(error);
      return data;
    },

    async get(quizId: string) {
      const { data, error } = await supabase
        .from('quizzes')
        .select(`
          *,
          questions:questions(*)
        `)
        .eq('id', quizId)
        .single();

      if (error) handleSupabaseError(error);
      return data;
    },

    async create(quiz: Omit<Quiz, 'id' | 'created_at' | 'updated_at'>) {
      const { data, error } = await supabase
        .from('quizzes')
        .insert(quiz)
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return data;
    },

    async update(quizId: string, quiz: Partial<Quiz>) {
      const { data, error } = await supabase
        .from('quizzes')
        .update(quiz)
        .eq('id', quizId)
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return data;
    },

    async delete(quizId: string) {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId);

      if (error) handleSupabaseError(error);
    },
  },

  questions: {
    async create(question: Omit<Question, 'id' | 'created_at' | 'updated_at'>) {
      const { data, error } = await supabase
        .from('questions')
        .insert(question)
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return data;
    },

    async update(questionId: string, question: Partial<Question>) {
      const { data, error } = await supabase
        .from('questions')
        .update(question)
        .eq('id', questionId)
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return data;
    },

    async delete(questionId: string) {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId);

      if (error) handleSupabaseError(error);
    },
  },

  quizResults: {
    async create(result: Omit<QuizResult, 'id' | 'created_at'>) {
      const { data, error } = await supabase
        .from('quiz_results')
        .insert(result)
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return data;
    },

    async getByQuiz(quizId: string) {
      const { data, error } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('quiz_id', quizId)
        .order('created_at', { ascending: false });

      if (error) handleSupabaseError(error);
      return data;
    },

    async getByUser(userId: string) {
      const { data, error } = await supabase
        .from('quiz_results')
        .select(`
          *,
          quiz:quizzes(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  },
};