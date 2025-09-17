import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

// Mock do Supabase
vi.mock('@/integrations/supabase/client');

const mockSupabase = supabase as {
  auth: {
    getSession: ReturnType<typeof vi.fn>;
    signInWithPassword: ReturnType<typeof vi.fn>;
    signUp: ReturnType<typeof vi.fn>;
    signOut: ReturnType<typeof vi.fn>;
    onAuthStateChange: ReturnType<typeof vi.fn>;
  };
  from: ReturnType<typeof vi.fn>;
  functions: {
    invoke: ReturnType<typeof vi.fn>;
  };
};

// Wrapper para testes
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
);

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset mocks
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null
    });
    
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    });
  });

  it('deve inicializar com usuário null', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: TestWrapper
    });

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(true);
  });

  it('deve fazer login com credenciais válidas', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      user_metadata: { full_name: 'Test User' }
    };

    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: mockUser, session: { access_token: 'token' } },
      error: null
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: TestWrapper
    });

    await act(async () => {
      await result.current.signIn('test@example.com', 'password123');
    });

    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });

  it('deve lidar com erro de login', async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Credenciais inválidas' }
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: TestWrapper
    });

    await act(async () => {
      const success = await result.current.signIn('test@example.com', 'wrongpassword');
      expect(success).toBe(false);
    });
  });

  it('deve fazer cadastro com dados válidos', async () => {
    const mockUser = {
      id: '123',
      email: 'newuser@example.com',
      user_metadata: { full_name: 'New User' }
    };

    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: mockUser, session: null },
      error: null
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: TestWrapper
    });

    await act(async () => {
      await result.current.signUp('newuser@example.com', 'password123', 'New User');
    });

    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
      email: 'newuser@example.com',
      password: 'password123',
      options: {
        data: {
          full_name: 'New User'
        }
      }
    });
  });

  it('deve fazer logout corretamente', async () => {
    mockSupabase.auth.signOut.mockResolvedValue({
      error: null
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: TestWrapper
    });

    await act(async () => {
      await result.current.signOut();
    });

    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
  });

  it('deve fazer login com Google', async () => {
    mockSupabase.auth.signInWithOAuth.mockResolvedValue({
      data: { provider: 'google', url: 'https://oauth.url' },
      error: null
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: TestWrapper
    });

    await act(async () => {
      await result.current.signInWithGoogle();
    });

    expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: expect.stringContaining('/auth/callback')
      }
    });
  });

  it('deve verificar sessão existente na inicialização', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      user_metadata: { full_name: 'Test User' }
    };

    const mockSession = {
      access_token: 'token',
      user: mockUser
    };

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: TestWrapper
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockSupabase.auth.getSession).toHaveBeenCalled();
  });

  it('deve atualizar estado quando sessão muda', async () => {
    let authStateCallback: ((event: string, session: unknown) => void) | null = null;
    
    mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
      authStateCallback = callback;
      return {
        data: { subscription: { unsubscribe: vi.fn() } }
      };
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: TestWrapper
    });

    const mockUser = {
      id: '123',
      email: 'test@example.com',
      user_metadata: { full_name: 'Test User' }
    };

    const mockSession = {
      access_token: 'token',
      user: mockUser
    };

    await act(async () => {
      authStateCallback?.('SIGNED_IN', mockSession);
    });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });
  });

  it('deve limpar usuário quando sessão é removida', async () => {
    let authStateCallback: ((event: string, session: unknown) => void) | null = null;
    
    mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
      authStateCallback = callback;
      return {
        data: { subscription: { unsubscribe: vi.fn() } }
      };
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: TestWrapper
    });

    await act(async () => {
      authStateCallback?.('SIGNED_OUT', null);
    });

    await waitFor(() => {
      expect(result.current.user).toBeNull();
    });
  });

  it('deve validar email no cadastro', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: TestWrapper
    });

    await act(async () => {
      const success = await result.current.signUp('invalid-email', 'password123', 'User');
      expect(success).toBe(false);
    });
  });

  it('deve validar senha no cadastro', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: TestWrapper
    });

    await act(async () => {
      const success = await result.current.signUp('test@example.com', '123', 'User');
      expect(success).toBe(false);
    });
  });

  it('deve lidar com erro de rede', async () => {
    mockSupabase.auth.signInWithPassword.mockRejectedValue(
      new Error('Network error')
    );

    const { result } = renderHook(() => useAuth(), {
      wrapper: TestWrapper
    });

    await act(async () => {
      const success = await result.current.signIn('test@example.com', 'password123');
      expect(success).toBe(false);
    });
  });
});