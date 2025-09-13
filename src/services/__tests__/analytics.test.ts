import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyticsService } from '../analytics';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
    })),
    rpc: vi.fn(),
  },
}));

describe('Analytics Service', () => {
  const mockQuizId = 'test-quiz-id';
  const mockDeviceType = 'desktop' as const;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('trackQuizView', () => {
    it('should track quiz view successfully', async () => {
      vi.spyOn(supabase, 'rpc').mockResolvedValue({ data: null, error: null });

      await analyticsService.trackQuizView(mockQuizId);
      expect(supabase.rpc).toHaveBeenCalledWith('increment_quiz_views', { quiz_id: mockQuizId });
    });
  });

  describe('trackQuizStart', () => {
    it('should track quiz start successfully', async () => {
      vi.spyOn(supabase, 'rpc').mockResolvedValue({ data: null, error: null });

      await analyticsService.trackQuizStart(mockQuizId, mockDeviceType);
      expect(supabase.rpc).toHaveBeenCalledWith('track_quiz_start', {
        quiz_id: mockQuizId,
        device: mockDeviceType,
      });
    });
  });

  describe('getQuizAnalytics', () => {
    it('should return quiz analytics data', async () => {
      const mockResults = [
        {
          score: 8,
          max_score: 10,
          completed_at: '2024-03-21',
          device_type: 'desktop',
        },
        {
          score: 6,
          max_score: 10,
          completed_at: '2024-03-21',
          device_type: 'mobile',
        },
      ];

      const mockViewsData = 100;
      const mockStartsData = 50;
      const mockDeviceData = { desktop: 30, mobile: 15, tablet: 5 };
      const mockAbandonmentData = [{ questionIndex: 2, count: 5 }];

      vi.spyOn(supabase, 'from').mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockResults, error: null }),
      }));

      vi.spyOn(supabase, 'rpc')
        .mockImplementationOnce(() => Promise.resolve({ data: mockViewsData, error: null }))
        .mockImplementationOnce(() => Promise.resolve({ data: mockStartsData, error: null }))
        .mockImplementationOnce(() => Promise.resolve({ data: mockDeviceData, error: null }))
        .mockImplementationOnce(() => Promise.resolve({ data: mockAbandonmentData, error: null }));

      const analytics = await analyticsService.getQuizAnalytics(mockQuizId);

      expect(analytics).toMatchObject({
        totalViews: mockViewsData,
        totalStarts: mockStartsData,
        totalCompletions: 2,
        averageScore: 70, // (80 + 60) / 2
        completionRate: 4, // (2 / 50) * 100
        deviceBreakdown: mockDeviceData,
        abandonmentPoints: mockAbandonmentData,
      });

      expect(supabase.from).toHaveBeenCalledWith('quiz_results');
      expect(supabase.rpc).toHaveBeenCalledWith('get_quiz_views', { quiz_id: mockQuizId });
      expect(supabase.rpc).toHaveBeenCalledWith('get_quiz_starts', { quiz_id: mockQuizId });
      expect(supabase.rpc).toHaveBeenCalledWith('get_device_breakdown', { quiz_id: mockQuizId });
      expect(supabase.rpc).toHaveBeenCalledWith('get_abandonment_points', { quiz_id: mockQuizId });
    });

    it('should handle empty results', async () => {
      vi.spyOn(supabase, 'from').mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      }));

      vi.spyOn(supabase, 'rpc')
        .mockImplementationOnce(() => Promise.resolve({ data: 0, error: null }))
        .mockImplementationOnce(() => Promise.resolve({ data: 0, error: null }))
        .mockImplementationOnce(() => Promise.resolve({ data: { desktop: 0, mobile: 0, tablet: 0 }, error: null }))
        .mockImplementationOnce(() => Promise.resolve({ data: [], error: null }));

      const analytics = await analyticsService.getQuizAnalytics(mockQuizId);

      expect(analytics).toMatchObject({
        totalViews: 0,
        totalStarts: 0,
        totalCompletions: 0,
        averageScore: 0,
        completionRate: 0,
        deviceBreakdown: { desktop: 0, mobile: 0, tablet: 0 },
        abandonmentPoints: [],
      });
    });
  });

  describe('exportQuizResults', () => {
    it('should export quiz results with user data', async () => {
      const mockExportData = [
        {
          id: 'result-1',
          quiz_id: mockQuizId,
          score: 8,
          max_score: 10,
          profiles: { full_name: 'Test User', email: 'test@example.com' },
        },
      ];

      vi.spyOn(supabase, 'from').mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockExportData, error: null }),
      }));

      const results = await analyticsService.exportQuizResults(mockQuizId);
      expect(results).toEqual(mockExportData);
      expect(supabase.from).toHaveBeenCalledWith('quiz_results');
    });
  });
});