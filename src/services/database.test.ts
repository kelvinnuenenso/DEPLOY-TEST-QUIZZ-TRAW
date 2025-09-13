import { describe, it, expect, beforeEach, vi } from 'vitest';
import { databaseService } from './database';
import { supabase } from '@/integrations/supabase/client';

// Mock do cliente Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  },
}));

describe('databaseService', () => {
  const mockUserId = 'test-user-id';
  const mockQuizId = 'test-quiz-id';
  const mockQuestionId = 'test-question-id';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('profiles', () => {
    const mockProfile = {
      id: mockUserId,
      full_name: 'Test User',
      avatar_url: null,
      created_at: '2024-03-13T00:00:00Z',
      updated_at: '2024-03-13T00:00:00Z',
    };

    it('deve buscar perfil com sucesso', async () => {
      vi.mocked(supabase.from).mockImplementationOnce(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValueOnce({ data: mockProfile, error: null }),
      }));

      const result = await databaseService.profiles.get(mockUserId);
      expect(result).toEqual(mockProfile);
    });

    it('deve atualizar perfil com sucesso', async () => {
      vi.mocked(supabase.from).mockImplementationOnce(() => ({
        upsert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValueOnce({ data: mockProfile, error: null }),
      }));

      const result = await databaseService.profiles.upsert(mockProfile);
      expect(result).toEqual(mockProfile);
    });
  });

  describe('quizzes', () => {
    const mockQuiz = {
      id: mockQuizId,
      title: 'Test Quiz',
      description: 'Test Description',
      status: 'draft',
      user_id: mockUserId,
      created_at: '2024-03-13T00:00:00Z',
      updated_at: '2024-03-13T00:00:00Z',
    };

    it('deve listar quizzes do usuário', async () => {
      vi.mocked(supabase.from).mockImplementationOnce(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValueOnce({ data: [mockQuiz], error: null }),
      }));

      const result = await databaseService.quizzes.list(mockUserId);
      expect(result).toEqual([mockQuiz]);
    });

    it('deve criar quiz com sucesso', async () => {
      vi.mocked(supabase.from).mockImplementationOnce(() => ({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValueOnce({ data: mockQuiz, error: null }),
      }));

      const result = await databaseService.quizzes.create({
        title: mockQuiz.title,
        description: mockQuiz.description,
        user_id: mockQuiz.user_id,
      });
      expect(result).toEqual(mockQuiz);
    });
  });

  describe('questions', () => {
    const mockQuestion = {
      id: mockQuestionId,
      quiz_id: mockQuizId,
      question_text: 'Test Question',
      question_type: 'multiple_choice',
      correct_answer: 'Test Answer',
      options: ['Option 1', 'Option 2'],
      points: 1,
      order_number: 1,
      created_at: '2024-03-13T00:00:00Z',
      updated_at: '2024-03-13T00:00:00Z',
    };

    it('deve criar questão com sucesso', async () => {
      vi.mocked(supabase.from).mockImplementationOnce(() => ({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValueOnce({ data: mockQuestion, error: null }),
      }));

      const result = await databaseService.questions.create({
        quiz_id: mockQuestion.quiz_id,
        question_text: mockQuestion.question_text,
        question_type: 'multiple_choice',
        correct_answer: mockQuestion.correct_answer,
        options: mockQuestion.options,
        points: mockQuestion.points,
        order_number: mockQuestion.order_number,
      });
      expect(result).toEqual(mockQuestion);
    });
  });

  describe('quizResults', () => {
    const mockResult = {
      id: 'test-result-id',
      quiz_id: mockQuizId,
      user_id: mockUserId,
      score: 80,
      max_score: 100,
      answers: { '1': 'A', '2': 'B' },
      completed_at: '2024-03-13T00:00:00Z',
      created_at: '2024-03-13T00:00:00Z',
    };

    it('deve criar resultado com sucesso', async () => {
      vi.mocked(supabase.from).mockImplementationOnce(() => ({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValueOnce({ data: mockResult, error: null }),
      }));

      const result = await databaseService.quizResults.create({
        quiz_id: mockResult.quiz_id,
        user_id: mockResult.user_id,
        score: mockResult.score,
        max_score: mockResult.max_score,
        answers: mockResult.answers,
        completed_at: mockResult.completed_at,
      });
      expect(result).toEqual(mockResult);
    });
  });
});