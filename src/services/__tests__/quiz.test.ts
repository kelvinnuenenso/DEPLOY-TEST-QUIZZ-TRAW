import { describe, it, expect, vi, beforeEach } from 'vitest';
import { quizService } from '../quiz';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
    })),
  },
}));

describe('Quiz Service', () => {
  const mockQuiz = {
    title: 'Test Quiz',
    description: 'A test quiz',
    status: 'draft' as const,
    user_id: 'test-user',
  };

  const mockQuestion = {
    quiz_id: 'test-quiz',
    text: 'Test question?',
    options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
    correct_option: 0,
    order: 1,
  };

  const mockResult = {
    quiz_id: 'test-quiz',
    score: 8,
    max_score: 10,
    answers: [0, 1, 2],
    device_type: 'desktop' as const,
    time_spent_seconds: 300,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createQuiz', () => {
    it('should create a quiz successfully', async () => {
      const mockResponse = { data: { ...mockQuiz, id: 'test-id' }, error: null };
      vi.spyOn(supabase, 'from').mockImplementation(() => ({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockResponse),
      }));

      const result = await quizService.createQuiz(mockQuiz);
      expect(result).toEqual({ ...mockQuiz, id: 'test-id' });
      expect(supabase.from).toHaveBeenCalledWith('quizzes');
    });
  });

  describe('getQuiz', () => {
    it('should get a quiz by id', async () => {
      const mockResponse = { data: { ...mockQuiz, id: 'test-id' }, error: null };
      vi.spyOn(supabase, 'from').mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockResponse),
      }));

      const result = await quizService.getQuiz('test-id');
      expect(result).toEqual({ ...mockQuiz, id: 'test-id' });
    });
  });

  describe('addQuestion', () => {
    it('should add a question to a quiz', async () => {
      const mockResponse = { data: { ...mockQuestion, id: 'test-id' }, error: null };
      vi.spyOn(supabase, 'from').mockImplementation(() => ({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockResponse),
      }));

      const result = await quizService.addQuestion(mockQuestion);
      expect(result).toEqual({ ...mockQuestion, id: 'test-id' });
      expect(supabase.from).toHaveBeenCalledWith('questions');
    });
  });

  describe('saveQuizResult', () => {
    it('should save quiz result', async () => {
      const mockResponse = { data: { ...mockResult, id: 'test-id' }, error: null };
      vi.spyOn(supabase, 'from').mockImplementation(() => ({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockResponse),
      }));

      const result = await quizService.saveQuizResult(mockResult);
      expect(result).toEqual({ ...mockResult, id: 'test-id' });
      expect(supabase.from).toHaveBeenCalledWith('quiz_results');
    });
  });
});