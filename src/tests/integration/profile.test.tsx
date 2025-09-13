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
      upsert: vi.fn(),
    },
  },
}));

describe('Fluxo de Perfil', () => {
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

    // Mock inicial do perfil
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

  describe('Visualização de Perfil', () => {
    it('deve carregar e exibir informações do perfil', async () => {
      renderApp();

      // Navega para a página de configurações
      const settingsLink = await screen.findByText('Configurações');
      fireEvent.click(settingsLink);

      // Verifica se as informações do perfil são exibidas
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
        expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
      });
    });
  });

  describe('Atualização de Perfil', () => {
    it('deve atualizar nome do perfil com sucesso', async () => {
      const updatedProfile = {
        ...mockProfile,
        full_name: 'Updated Name',
      };

      vi.mocked(databaseService.profiles.upsert).mockResolvedValueOnce(updatedProfile);

      renderApp();

      // Navega para a página de configurações
      const settingsLink = await screen.findByText('Configurações');
      fireEvent.click(settingsLink);

      // Atualiza o nome
      const nameInput = await screen.findByDisplayValue('Test User');
      fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

      // Salva as alterações
      const saveButton = screen.getByText('Salvar Alterações');
      fireEvent.click(saveButton);

      // Verifica se o perfil foi atualizado
      await waitFor(() => {
        expect(databaseService.profiles.upsert).toHaveBeenCalledWith({
          id: 'test-user-id',
          full_name: 'Updated Name',
        });
      });

      // Verifica se a mensagem de sucesso é exibida
      expect(screen.getByText('Perfil atualizado com sucesso')).toBeInTheDocument();
    });

    it('deve exibir erro ao falhar atualização do perfil', async () => {
      vi.mocked(databaseService.profiles.upsert).mockRejectedValueOnce(
        new Error('Failed to update profile')
      );

      renderApp();

      // Navega para a página de configurações
      const settingsLink = await screen.findByText('Configurações');
      fireEvent.click(settingsLink);

      // Atualiza o nome
      const nameInput = await screen.findByDisplayValue('Test User');
      fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

      // Tenta salvar as alterações
      const saveButton = screen.getByText('Salvar Alterações');
      fireEvent.click(saveButton);

      // Verifica se a mensagem de erro é exibida
      await waitFor(() => {
        expect(screen.getByText('Erro ao atualizar perfil')).toBeInTheDocument();
      });
    });
  });

  describe('Validação de Campos', () => {
    it('deve exibir erro para nome vazio', async () => {
      renderApp();

      // Navega para a página de configurações
      const settingsLink = await screen.findByText('Configurações');
      fireEvent.click(settingsLink);

      // Limpa o campo de nome
      const nameInput = await screen.findByDisplayValue('Test User');
      fireEvent.change(nameInput, { target: { value: '' } });
      fireEvent.blur(nameInput);

      // Verifica se a mensagem de erro é exibida
      expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument();

      // Verifica se o botão de salvar está desabilitado
      const saveButton = screen.getByText('Salvar Alterações');
      expect(saveButton).toBeDisabled();
    });
  });
});