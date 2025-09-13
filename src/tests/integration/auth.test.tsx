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
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

// Mock do serviço de banco de dados
vi.mock('@/services/database', () => ({
  databaseService: {
    profiles: {
      get: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

describe('Fluxo de Autenticação', () => {
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

  beforeAll(() => {
    // Limpa todos os mocks antes de cada teste
    vi.clearAllMocks();

    // Mock inicial para usuário não autenticado
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });
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

  describe('Login', () => {
    it('deve realizar login com sucesso e redirecionar para dashboard', async () => {
      // Mock do login bem-sucedido
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: {
          user: mockUser,
          session: {
            access_token: 'test-token',
            refresh_token: 'test-refresh-token',
            user: mockUser,
          },
        },
        error: null,
      });

      // Mock do perfil
      vi.mocked(databaseService.profiles.get).mockResolvedValueOnce(mockProfile);

      renderApp();

      // Preenche o formulário de login
      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Senha');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      // Submete o formulário
      const loginButton = screen.getByText('Entrar');
      fireEvent.click(loginButton);

      // Verifica se foi redirecionado para o dashboard
      await waitFor(() => {
        expect(window.location.pathname).toBe('/dashboard');
      });

      // Verifica se o perfil foi carregado
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('deve exibir mensagem de erro para credenciais inválidas', async () => {
      // Mock de erro no login
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: { user: null, session: null },
        error: new Error('Invalid credentials'),
      });

      renderApp();

      // Preenche o formulário com credenciais inválidas
      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Senha');
      fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });

      // Submete o formulário
      const loginButton = screen.getByText('Entrar');
      fireEvent.click(loginButton);

      // Verifica se a mensagem de erro é exibida
      await waitFor(() => {
        expect(screen.getByText('Credenciais inválidas')).toBeInTheDocument();
      });
    });
  });

  describe('Cadastro', () => {
    it('deve realizar cadastro com sucesso e criar perfil', async () => {
      // Mock do cadastro bem-sucedido
      vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
        data: {
          user: mockUser,
          session: {
            access_token: 'test-token',
            refresh_token: 'test-refresh-token',
            user: mockUser,
          },
        },
        error: null,
      });

      // Mock da criação do perfil
      vi.mocked(databaseService.profiles.upsert).mockResolvedValueOnce(mockProfile);

      renderApp();

      // Vai para a página de cadastro
      const createAccountLink = screen.getByText('Criar uma conta');
      fireEvent.click(createAccountLink);

      // Preenche o formulário de cadastro
      const nameInput = screen.getByPlaceholderText('Nome completo');
      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Senha');

      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      // Submete o formulário
      const signUpButton = screen.getByText('Cadastrar');
      fireEvent.click(signUpButton);

      // Verifica se o perfil foi criado
      await waitFor(() => {
        expect(databaseService.profiles.upsert).toHaveBeenCalledWith({
          id: 'test-user-id',
          full_name: 'Test User',
        });
      });

      // Verifica se foi redirecionado para o dashboard
      expect(window.location.pathname).toBe('/dashboard');
    });
  });

  describe('Logout', () => {
    it('deve realizar logout e redirecionar para página de login', async () => {
      // Mock usuário autenticado
      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
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
      vi.mocked(databaseService.profiles.get).mockResolvedValueOnce(mockProfile);

      // Mock do logout
      vi.mocked(supabase.auth.signOut).mockResolvedValueOnce({
        error: null,
      });

      renderApp();

      // Espera o perfil carregar
      await screen.findByText('Test User');

      // Clica no botão de logout
      const logoutButton = screen.getByText('Sair');
      fireEvent.click(logoutButton);

      // Verifica se foi redirecionado para a página de login
      await waitFor(() => {
        expect(window.location.pathname).toBe('/auth');
      });
    });
  });
});