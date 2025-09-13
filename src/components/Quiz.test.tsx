import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Quiz from './Quiz';
import { databaseService } from '@/services/database';

// Mock do serviço de banco de dados
vi.mock('@/services/database', () => ({
  databaseService: {
    quizzes: {
      get: vi.fn(),
      update: vi.fn(),
    },
    questions: {
      list: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    quizResults: {
      create: vi.fn(),
    },
  },
}));

describe('Quiz Component', () => {
  const mockQuiz = {
    id: 'test-quiz-id',
    title: 'Test Quiz',
    description: 'Test Description',
    status: 'draft',
    user_id: 'test-user-id',
    created_at: '2024-03-13T00:00:00Z',
    updated_at: '2024-03-13T00:00:00Z',
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

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(databaseService.quizzes.get).mockResolvedValue(mockQuiz);
    vi.mocked(databaseService.questions.list).mockResolvedValue(mockQuestions);
  });

  const renderQuiz = (mode = 'edit') => {
    return render(
      <BrowserRouter>
        <Quiz quizId="test-quiz-id" mode={mode} />
      </BrowserRouter>
    );
  };

  describe('Modo de Edição', () => {
    it('deve carregar e exibir o quiz e suas questões', async () => {
      renderQuiz();

      await waitFor(() => {
        expect(screen.getByText('Test Quiz')).toBeInTheDocument();
        expect(screen.getByText('First Question')).toBeInTheDocument();
        expect(screen.getByText('Second Question')).toBeInTheDocument();
      });
    });

    it('deve permitir adicionar nova questão', async () => {
      const newQuestion = {
        id: 'new-question',
        quiz_id: 'test-quiz-id',
        question_text: 'New Question',
        question_type: 'multiple_choice',
        options: ['Option 1', 'Option 2'],
        correct_answer: 'Option 1',
        points: 10,
        order_number: 3,
      };

      vi.mocked(databaseService.questions.create).mockResolvedValueOnce(newQuestion);

      renderQuiz();

      const addButton = await screen.findByText('Adicionar Questão');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(databaseService.questions.create).toHaveBeenCalled();
      });
    });

    it('deve permitir editar questão existente', async () => {
      renderQuiz();

      const question = await screen.findByText('First Question');
      const editButton = question.closest('div').querySelector('button[aria-label="Editar"]');
      fireEvent.click(editButton);

      const textInput = screen.getByDisplayValue('First Question');
      fireEvent.change(textInput, { target: { value: 'Updated Question' } });

      const saveButton = screen.getByText('Salvar');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(databaseService.questions.update).toHaveBeenCalledWith(
          'question-1',
          expect.objectContaining({ question_text: 'Updated Question' })
        );
      });
    });

    it('deve permitir excluir questão', async () => {
      renderQuiz();

      const question = await screen.findByText('First Question');
      const deleteButton = question.closest('div').querySelector('button[aria-label="Excluir"]');
      fireEvent.click(deleteButton);

      // Confirma a exclusão
      const confirmButton = screen.getByText('Confirmar');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(databaseService.questions.delete).toHaveBeenCalledWith('question-1');
      });
    });
  });

  describe('Modo de Execução', () => {
    it('deve exibir questões em sequência', async () => {
      renderQuiz('run');

      await waitFor(() => {
        expect(screen.getByText('First Question')).toBeInTheDocument();
        expect(screen.queryByText('Second Question')).not.toBeInTheDocument();
      });
    });

    it('deve permitir selecionar resposta e avançar', async () => {
      renderQuiz('run');

      // Espera a primeira questão carregar
      await screen.findByText('First Question');

      // Seleciona uma resposta
      const option = screen.getByText('Option 1');
      fireEvent.click(option);

      // Avança para próxima questão
      const nextButton = screen.getByText('Próxima');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Second Question')).toBeInTheDocument();
      });
    });

    it('deve submeter resultado ao finalizar', async () => {
      renderQuiz('run');

      // Responde primeira questão
      await screen.findByText('First Question');
      fireEvent.click(screen.getByText('Option 1'));
      fireEvent.click(screen.getByText('Próxima'));

      // Responde segunda questão
      await screen.findByText('Second Question');
      fireEvent.click(screen.getByText('Option B'));
      fireEvent.click(screen.getByText('Finalizar'));

      await waitFor(() => {
        expect(databaseService.quizResults.create).toHaveBeenCalledWith(
          expect.objectContaining({
            quiz_id: 'test-quiz-id',
            answers: expect.any(Object),
            score: expect.any(Number),
          })
        );
      });
    });
  });
});