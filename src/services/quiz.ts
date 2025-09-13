import { supabase } from '@/integrations/supabase/client';
import type { Quiz, Question, QuizResult } from './database';
import { handleSupabaseError } from '@/utils/supabase-error';

export const quizService = {
  // Quiz CRUD operations
  async createQuiz(quiz: Omit<Quiz, 'id' | 'created_at' | 'updated_at'>): Promise<Quiz> {
    const { data, error } = await supabase
      .from('quizzes')
      .insert(quiz)
      .select()
      .single();

    if (error) throw handleSupabaseError(error);
    return data;
  },

  async getQuiz(id: string): Promise<Quiz | null> {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw handleSupabaseError(error);
    return data;
  },

  async updateQuiz(id: string, quiz: Partial<Quiz>): Promise<Quiz> {
    const { data, error } = await supabase
      .from('quizzes')
      .update(quiz)
      .eq('id', id)
      .select()
      .single();

    if (error) throw handleSupabaseError(error);
    return data;
  },

  async deleteQuiz(id: string): Promise<void> {
    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', id);

    if (error) throw handleSupabaseError(error);
  },

  async listQuizzes(userId: string): Promise<Quiz[]> {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw handleSupabaseError(error);
    return data || [];
  },

  // Question operations
  async addQuestion(question: Omit<Question, 'id' | 'created_at'>): Promise<Question> {
    const { data, error } = await supabase
      .from('questions')
      .insert(question)
      .select()
      .single();

    if (error) throw handleSupabaseError(error);
    return data;
  },

  async updateQuestion(id: string, question: Partial<Question>): Promise<Question> {
    const { data, error } = await supabase
      .from('questions')
      .update(question)
      .eq('id', id)
      .select()
      .single();

    if (error) throw handleSupabaseError(error);
    return data;
  },

  async deleteQuestion(id: string): Promise<void> {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);

    if (error) throw handleSupabaseError(error);
  },

  async getQuizQuestions(quizId: string): Promise<Question[]> {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('order', { ascending: true });

    if (error) throw handleSupabaseError(error);
    return data || [];
  },

  // Quiz results operations
  async saveQuizResult(result: Omit<QuizResult, 'id' | 'created_at'>): Promise<QuizResult> {
    const { data, error } = await supabase
      .from('quiz_results')
      .insert(result)
      .select()
      .single();

    if (error) throw handleSupabaseError(error);
    return data;
  },

  async getQuizResults(quizId: string): Promise<QuizResult[]> {
    const { data, error } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('quiz_id', quizId)
      .order('created_at', { ascending: false });

    if (error) throw handleSupabaseError(error);
    return data || [];
  },

  async getUserQuizResult(quizId: string, userId: string): Promise<QuizResult | null> {
    const { data, error } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('quiz_id', quizId)
      .eq('user_id', userId)
      .single();

    if (error) throw handleSupabaseError(error);
    return data;
  }
};