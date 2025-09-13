import { supabase } from '@/integrations/supabase/client';
import type { QuizResult } from './database';
import { handleSupabaseError } from '@/utils/supabase-error';

export interface QuizAnalytics {
  totalViews: number;
  totalStarts: number;
  totalCompletions: number;
  averageScore: number;
  completionRate: number;
  averageTimeSeconds: number;
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  scoreDistribution: {
    range: string;
    count: number;
  }[];
  abandonmentPoints: {
    questionIndex: number;
    count: number;
  }[];
}

export const analyticsService = {
  async trackQuizView(quizId: string): Promise<void> {
    const { error } = await supabase.rpc('increment_quiz_views', { quiz_id: quizId });
    if (error) throw handleSupabaseError(error);
  },

  async trackQuizStart(quizId: string, deviceType: 'desktop' | 'mobile' | 'tablet'): Promise<void> {
    const { error } = await supabase.rpc('track_quiz_start', { 
      quiz_id: quizId,
      device: deviceType
    });
    if (error) throw handleSupabaseError(error);
  },

  async getQuizAnalytics(quizId: string): Promise<QuizAnalytics> {
    // Get all quiz results
    const { data: results, error } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('quiz_id', quizId);

    if (error) throw handleSupabaseError(error);

    const analytics: QuizAnalytics = {
      totalViews: 0, // This will be updated by the RPC call
      totalStarts: 0,
      totalCompletions: results?.filter(r => r.completed_at).length || 0,
      averageScore: 0,
      completionRate: 0,
      averageTimeSeconds: 0,
      deviceBreakdown: {
        desktop: 0,
        mobile: 0,
        tablet: 0
      },
      scoreDistribution: [
        { range: '0-20%', count: 0 },
        { range: '21-40%', count: 0 },
        { range: '41-60%', count: 0 },
        { range: '61-80%', count: 0 },
        { range: '81-100%', count: 0 }
      ],
      abandonmentPoints: []
    };

    // Get total views from the database
    const { data: viewsData } = await supabase
      .rpc('get_quiz_views', { quiz_id: quizId });
    analytics.totalViews = viewsData || 0;

    // Get total starts from the database
    const { data: startsData } = await supabase
      .rpc('get_quiz_starts', { quiz_id: quizId });
    analytics.totalStarts = startsData || 0;

    if (!results || results.length === 0) {
      return analytics;
    }

    // Calculate average score
    const totalScore = results.reduce((sum, result) => sum + (result.score / result.max_score) * 100, 0);
    analytics.averageScore = totalScore / results.length;

    // Calculate completion rate
    analytics.completionRate = (analytics.totalCompletions / analytics.totalStarts) * 100;

    // Calculate score distribution
    results.forEach(result => {
      const scorePercentage = (result.score / result.max_score) * 100;
      const index = Math.min(Math.floor(scorePercentage / 20), 4);
      analytics.scoreDistribution[index].count++;
    });

    // Calculate device breakdown
    const { data: deviceData } = await supabase
      .rpc('get_device_breakdown', { quiz_id: quizId });
    if (deviceData) {
      analytics.deviceBreakdown = deviceData;
    }

    // Calculate abandonment points
    const { data: abandonmentData } = await supabase
      .rpc('get_abandonment_points', { quiz_id: quizId });
    if (abandonmentData) {
      analytics.abandonmentPoints = abandonmentData;
    }

    return analytics;
  },

  async exportQuizResults(quizId: string): Promise<QuizResult[]> {
    const { data, error } = await supabase
      .from('quiz_results')
      .select(`
        *,
        profiles:user_id (full_name, email)
      `)
      .eq('quiz_id', quizId)
      .order('created_at', { ascending: false });

    if (error) throw handleSupabaseError(error);
    return data || [];
  }
};