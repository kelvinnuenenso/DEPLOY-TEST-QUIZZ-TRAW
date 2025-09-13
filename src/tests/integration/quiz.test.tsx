import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import App from '@/App';
import { supabase } from '@/integrations/supabase/client';
import { databaseService } from '@/services/database';

// Mock do Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
  },
}));

// Mock do serviço de banco de dados
vi.mock('@/services/database', () => ({
  databaseService: {
    profiles: {
      get: vi.fn(),
    },
    quizzes: {
      create: vi.fn(),
      list: vi.fn(),
      get: vi.fn(),
      update: vi.fn(),
    },
    questions: {
      create: vi.fn(),
      list: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    quizResults: {
      create: vi.fn(),
      list: vi.fn(),
    },
  },
}));

describe('Fluxo de Quiz', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
  };

  const mockProfile = {
    id: 'test-user-id',
    full_name: 'Test User',
    avatar_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const mockQuiz = {
    id: 'test-quiz-id',
    title: 'Test Quiz',
    description: 'Test Description',
    status: 'draft',
    user_id: 'test-user-id',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const mockQuestions = [
    {
      id: 'question-1',
      quiz_id: 'test-quiz-id',
      question_text: 'First Question',
      question_type: 'multiple_choice',
      options: ['Option 1', 'Option 2', 'Option 3'],
      correct_answer: 'Option 1',
      points: 10,
      order_number: 1,
    },
    {
      id: 'question-2',
      quiz_id: 'test-quiz-id',
      question_text: 'Second Question',
      question_type: 'multiple_choice',
      options: ['Option A', 'Option B', 'Option C'],
      correct_answer: 'Option B',
      points: 10,
      order_number: 2,
    },
  ];

  beforeAll(() => {
    // Mock usuário autenticado
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: {
        session: {
          user: mockUser,
          access_token: 'test-token',
          refresh_token: 'test-refresh-token',
        },
      },
      error: null,
    });

    // Mock do perfil
    vi.mocked(databaseService.profiles.get).mockResolvedValue(mockProfile);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderApp = () => {
    return render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
  };

  describe('Criação de Quiz', () => {
    it('deve criar um novo quiz com sucesso', async () => {
      // Mock da criação do quiz
      vi.mocked(databaseService.quizzes.create).mockResolvedValueOnce(mockQuiz);

      renderApp();

      // Navega para a página de criação de quiz
      const createQuizButton = await screen.findByText('Criar Quiz');
      fireEvent.click(createQuizButton);

      // Preenche o formulário do quiz
      const titleInput = screen.getByLabelText('Título');
      const descriptionInput = screen.getByLabelText('Descrição');

      fireEvent.change(titleInput, { target: { value: 'Test Quiz' } });
      fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });

      // Salva o quiz
      const saveButton = screen.getByText('Salvar');
      fireEvent.click(saveButton);

      // Verifica se o quiz foi criado
      await waitFor(() => {
        expect(databaseService.quizzes.create).toHaveBeenCalledWith({
          title: 'Test Quiz',
          description: 'Test Description',
          user_id: 'test-user-id',
        });
      });
    });

    it('deve adicionar questões ao quiz', async () => {
      // Mock do quiz existente
      vi.mocked(databaseService.quizzes.get).mockResolvedValueOnce(mockQuiz);
      vi.mocked(databaseService.questions.list).mockResolvedValueOnce([]);

      // Mock da criação de questão
      vi.mocked(databaseService.questions.create).mockResolvedValueOnce(mockQuestions[0]);

      renderApp();

      // Navega para a página de edição do quiz
      const editQuizButton = await screen.findByText('Editar Quiz');
      fireEvent.click(editQuizButton);

      // Adiciona uma nova questão
      const addQuestionButton = screen.getByText('Adicionar Questão');
      fireEvent.click(addQuestionButton);

      // Preenche o formulário da questão
      const questionInput = screen.getByLabelText('Pergunta');
      const option1Input = screen.getByLabelText('Opção 1');
      const option2Input = screen.getByLabelText('Opção 2');
      const correctAnswerSelect = screen.getByLabelText('Resposta Correta');

      fireEvent.change(questionInput, { target: { value: 'First Question' } });
      fireEvent.change(option1Input, { target: { value: 'Option 1' } });
      fireEvent.change(option2Input, { target: { value: 'Option 2' } });
      fireEvent.change(correctAnswerSelect, { target: { value: 'Option 1' } });

      // Salva a questão
      const saveButton = screen.getByText('Salvar Questão');
      fireEvent.click(saveButton);

      // Verifica se a questão foi criada
      await waitFor(() => {
        expect(databaseService.questions.create).toHaveBeenCalledWith({
          quiz_id: 'test-quiz-id',
          question_text: 'First Question',
          question_type: 'multiple_choice',
          options: ['Option 1', 'Option 2'],
          correct_answer: 'Option 1',
          points: 10,
          order_number: 1,
        });
      });
    });
  });

  describe('Execução de Quiz', () => {
    beforeEach(() => {
      // Mock do quiz e questões
      vi.mocked(databaseService.quizzes.get).mockResolvedValue(mockQuiz);
      vi.mocked(databaseService.questions.list).mockResolvedValue(mockQuestions);
    });

    it('deve completar um quiz e submeter resultados', async () => {
      const mockResult = {
        id: 'result-1',
        quiz_id: 'test-quiz-id',
        user_id: 'test-user-id',
        score: 20,
        max_score: 20,
        answers: {
          'question-1': 'Option 1',
          'question-2': 'Option B',
        },
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      vi.mocked(databaseService.quizResults.create).mockResolvedValueOnce(mockResult);

      renderApp();

      // Inicia o quiz
      const startQuizButton = await screen.findByText('Iniciar Quiz');
      fireEvent.click(startQuizButton);

      // Responde a primeira questão
      await screen.findByText('First Question');
      const option1 = screen.getByText('Option 1');
      fireEvent.click(option1);

      // Avança para a próxima questão
      const nextButton = screen.getByText('Próxima');
      fireEvent.click(nextButton);

      // Responde a segunda questão
      await screen.findByText('Second Question');
      const optionB = screen.getByText('Option B');
      fireEvent.click(optionB);

      // Finaliza o quiz
      const finishButton = screen.getByText('Finalizar');
      fireEvent.click(finishButton);

      // Verifica se o resultado foi submetido
      await waitFor(() => {
        expect(databaseService.quizResults.create).toHaveBeenCalledWith({
          quiz_id: 'test-quiz-id',
          user_id: 'test-user-id',
          score: 20,
          max_score: 20,
          answers: {
            'question-1': 'Option 1',
            'question-2': 'Option B',
          },
          completed_at: expect.any(String),
        });
      });

      // Verifica se foi redirecionado para a página de resultado
      expect(window.location.pathname).toBe('/quiz/result');
    });
  });
});