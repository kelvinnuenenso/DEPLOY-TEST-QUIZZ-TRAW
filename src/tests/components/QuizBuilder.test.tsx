import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QuizBuilder } from '@/components/quiz/QuizBuilder';
import { AuthProvider } from '@/contexts/AuthProvider';
import { Toaster } from '@/components/ui/toaster';

// Mock do usuário autenticado
const mockUser = {
  id: '123',
  email: 'test@example.com',
  user_metadata: { full_name: 'Test User' }
};

// Wrapper para testes
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
      <Toaster />
    </AuthProvider>
  </BrowserRouter>
);

describe('QuizBuilder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar o formulário de criação de quiz', () => {
    render(
      <TestWrapper>
        <QuizBuilder />
      </TestWrapper>
    );

    expect(screen.getByText('Criar Novo Quiz')).toBeInTheDocument();
    expect(screen.getByLabelText(/título do quiz/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument();
  });

  it('deve permitir adicionar uma nova pergunta', async () => {
    render(
      <TestWrapper>
        <QuizBuilder />
      </TestWrapper>
    );

    const addQuestionButton = screen.getByText(/adicionar pergunta/i);
    fireEvent.click(addQuestionButton);

    await waitFor(() => {
      expect(screen.getByText(/pergunta 1/i)).toBeInTheDocument();
    });
  });

  it('deve validar campos obrigatórios', async () => {
    render(
      <TestWrapper>
        <QuizBuilder />
      </TestWrapper>
    );

    const saveButton = screen.getByText(/salvar quiz/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/título é obrigatório/i)).toBeInTheDocument();
    });
  });

  it('deve permitir editar uma pergunta existente', async () => {
    render(
      <TestWrapper>
        <QuizBuilder />
      </TestWrapper>
    );

    // Adicionar pergunta
    const addQuestionButton = screen.getByText(/adicionar pergunta/i);
    fireEvent.click(addQuestionButton);

    await waitFor(() => {
      const questionInput = screen.getByPlaceholderText(/digite sua pergunta/i);
      fireEvent.change(questionInput, { target: { value: 'Pergunta de teste' } });
      expect(questionInput).toHaveValue('Pergunta de teste');
    });
  });

  it('deve permitir adicionar opções de resposta', async () => {
    render(
      <TestWrapper>
        <QuizBuilder />
      </TestWrapper>
    );

    // Adicionar pergunta
    const addQuestionButton = screen.getByText(/adicionar pergunta/i);
    fireEvent.click(addQuestionButton);

    await waitFor(() => {
      const addOptionButton = screen.getByText(/adicionar opção/i);
      fireEvent.click(addOptionButton);
      
      expect(screen.getByPlaceholderText(/opção de resposta/i)).toBeInTheDocument();
    });
  });

  it('deve permitir remover uma pergunta', async () => {
    render(
      <TestWrapper>
        <QuizBuilder />
      </TestWrapper>
    );

    // Adicionar pergunta
    const addQuestionButton = screen.getByText(/adicionar pergunta/i);
    fireEvent.click(addQuestionButton);

    await waitFor(() => {
      const removeButton = screen.getByLabelText(/remover pergunta/i);
      fireEvent.click(removeButton);
      
      expect(screen.queryByText(/pergunta 1/i)).not.toBeInTheDocument();
    });
  });

  it('deve salvar o quiz com dados válidos', async () => {
    const mockSave = vi.fn().mockResolvedValue({ success: true });
    
    render(
      <TestWrapper>
        <QuizBuilder onSave={mockSave} />
      </TestWrapper>
    );

    // Preencher dados do quiz
    const titleInput = screen.getByLabelText(/título do quiz/i);
    fireEvent.change(titleInput, { target: { value: 'Quiz de Teste' } });

    const descriptionInput = screen.getByLabelText(/descrição/i);
    fireEvent.change(descriptionInput, { target: { value: 'Descrição do quiz' } });

    // Adicionar pergunta
    const addQuestionButton = screen.getByText(/adicionar pergunta/i);
    fireEvent.click(addQuestionButton);

    await waitFor(() => {
      const questionInput = screen.getByPlaceholderText(/digite sua pergunta/i);
      fireEvent.change(questionInput, { target: { value: 'Pergunta 1' } });
    });

    // Salvar quiz
    const saveButton = screen.getByText(/salvar quiz/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Quiz de Teste',
        description: 'Descrição do quiz'
      }));
    });
  });

  it('deve mostrar preview do quiz', async () => {
    render(
      <TestWrapper>
        <QuizBuilder />
      </TestWrapper>
    );

    const previewButton = screen.getByText(/visualizar/i);
    fireEvent.click(previewButton);

    await waitFor(() => {
      expect(screen.getByText(/preview do quiz/i)).toBeInTheDocument();
    });
  });

  it('deve permitir reordenar perguntas', async () => {
    render(
      <TestWrapper>
        <QuizBuilder />
      </TestWrapper>
    );

    // Adicionar duas perguntas
    const addQuestionButton = screen.getByText(/adicionar pergunta/i);
    fireEvent.click(addQuestionButton);
    fireEvent.click(addQuestionButton);

    await waitFor(() => {
      expect(screen.getByText(/pergunta 1/i)).toBeInTheDocument();
      expect(screen.getByText(/pergunta 2/i)).toBeInTheDocument();
    });

    // Testar botões de reordenação
    const moveUpButtons = screen.getAllByLabelText(/mover para cima/i);
    expect(moveUpButtons).toHaveLength(2);
  });

  it('deve validar número mínimo de opções por pergunta', async () => {
    render(
      <TestWrapper>
        <QuizBuilder />
      </TestWrapper>
    );

    // Adicionar pergunta sem opções suficientes
    const addQuestionButton = screen.getByText(/adicionar pergunta/i);
    fireEvent.click(addQuestionButton);

    await waitFor(() => {
      const questionInput = screen.getByPlaceholderText(/digite sua pergunta/i);
      fireEvent.change(questionInput, { target: { value: 'Pergunta sem opções' } });
    });

    const saveButton = screen.getByText(/salvar quiz/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/pelo menos 2 opções/i)).toBeInTheDocument();
    });
  });
});