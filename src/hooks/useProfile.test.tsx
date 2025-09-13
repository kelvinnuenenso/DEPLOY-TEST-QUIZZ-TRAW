import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthProvider } from '@/contexts/AuthProvider';
import { useProfile } from './useProfile';
import { databaseService } from '@/services/database';

// Mock do serviço de banco de dados
vi.mock('@/services/database', () => ({
  databaseService: {
    profiles: {
      get: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

// Mock do hook de autenticação
vi.mock('./useAuth', () => ({
  default: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
  }),
}));

describe('useProfile', () => {
  const mockProfile = {
    id: 'test-user-id',
    full_name: 'Test User',
    avatar_url: null,
    created_at: '2024-03-13T00:00:00Z',
    updated_at: '2024-03-13T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve carregar o perfil do usuário com sucesso', async () => {
    vi.mocked(databaseService.profiles.get).mockResolvedValueOnce(mockProfile);

    const { result } = renderHook(() => useProfile(), {
      wrapper: AuthProvider,
    });

    // Aguarda o carregamento inicial
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.profile).toEqual(mockProfile);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('deve atualizar o perfil com sucesso', async () => {
    const updatedProfile = {
      ...mockProfile,
      full_name: 'Updated Name',
    };

    vi.mocked(databaseService.profiles.upsert).mockResolvedValueOnce(updatedProfile);

    const { result } = renderHook(() => useProfile(), {
      wrapper: AuthProvider,
    });

    // Aguarda o carregamento inicial
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.updateProfile({ full_name: 'Updated Name' });
    });

    expect(result.current.profile).toEqual(updatedProfile);
    expect(databaseService.profiles.upsert).toHaveBeenCalledWith({
      id: 'test-user-id',
      full_name: 'Updated Name',
    });
  });

  it('deve lidar com erro ao carregar perfil', async () => {
    const error = new Error('Failed to load profile');
    vi.mocked(databaseService.profiles.get).mockRejectedValueOnce(error);

    const { result } = renderHook(() => useProfile(), {
      wrapper: AuthProvider,
    });

    // Aguarda o carregamento inicial
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.profile).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual(error);
  });

  it('deve lidar com erro ao atualizar perfil', async () => {
    const error = new Error('Failed to update profile');
    vi.mocked(databaseService.profiles.get).mockResolvedValueOnce(mockProfile);
    vi.mocked(databaseService.profiles.upsert).mockRejectedValueOnce(error);

    const { result } = renderHook(() => useProfile(), {
      wrapper: AuthProvider,
    });

    // Aguarda o carregamento inicial
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await expect(async () => {
      await act(async () => {
        await result.current.updateProfile({ full_name: 'Updated Name' });
      });
    }).rejects.toThrow(error);
  });
});