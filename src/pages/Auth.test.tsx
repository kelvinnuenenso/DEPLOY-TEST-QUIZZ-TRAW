import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Auth from './Auth';

// Mock do hook de autenticação
vi.mock('@/hooks/useAuth', () => ({
  default: () => ({
    user: null,
    loading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signInWithGoogle: vi.fn(),
    signInWithDemo: vi.fn(),
  }),
}));

// Mock do hook de navegação
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('Auth Component', () => {
  const mockSignIn = vi.fn();
  const mockSignUp = vi.fn();
  const mockSignInWithGoogle = vi.fn();
  const mockSignInWithDemo = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Atualiza os mocks do hook de autenticação
    vi.mocked(useAuth).mockImplementation(() => ({
      user: null,
      loading: false,
      signIn: mockSignIn,
      signUp: mockSignUp,
      signInWithGoogle: mockSignInWithGoogle,
      signInWithDemo: mockSignInWithDemo,
    }));
  });

  const renderAuth = () => {
    return render(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>
    );
  };

  it('deve renderizar o componente corretamente', () => {
    renderAuth();
    expect(screen.getByText('Acesso Demo')).toBeInTheDocument();
    expect(screen.getByText('Continuar com Google')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Senha')).toBeInTheDocument();
  });

  it('deve alternar entre login e cadastro', () => {
    renderAuth();
    
    // Inicialmente no modo de login
    expect(screen.getByText('Entrar')).toBeInTheDocument();
    
    // Clica no link para cadastro
    fireEvent.click(screen.getByText('Criar uma conta'));
    
    // Verifica se mudou para o modo de cadastro
    expect(screen.getByText('Cadastrar')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nome completo')).toBeInTheDocument();
  });

  it('deve chamar signIn com credenciais corretas', async () => {
    renderAuth();
    
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Senha');
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByText('Entrar'));
    
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('deve chamar signUp com dados corretos', async () => {
    renderAuth();
    
    // Muda para modo de cadastro
    fireEvent.click(screen.getByText('Criar uma conta'));
    
    const nameInput = screen.getByPlaceholderText('Nome completo');
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Senha');
    
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByText('Cadastrar'));
    
    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
      });
    });
  });

  it('deve chamar signInWithGoogle ao clicar no botão do Google', async () => {
    renderAuth();
    
    fireEvent.click(screen.getByText('Continuar com Google'));
    
    await waitFor(() => {
      expect(mockSignInWithGoogle).toHaveBeenCalled();
    });
  });

  it('deve chamar signInWithDemo ao clicar no botão de acesso demo', async () => {
    renderAuth();
    
    fireEvent.click(screen.getByText('Acesso Demo'));
    
    await waitFor(() => {
      expect(mockSignInWithDemo).toHaveBeenCalled();
    });
  });

  it('deve exibir mensagem de erro para email inválido', () => {
    renderAuth();
    
    const emailInput = screen.getByPlaceholderText('Email');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);
    
    expect(screen.getByText('Email inválido')).toBeInTheDocument();
  });

  it('deve exibir mensagem de erro para senha muito curta', () => {
    renderAuth();
    
    const passwordInput = screen.getByPlaceholderText('Senha');
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.blur(passwordInput);
    
    expect(screen.getByText('A senha deve ter pelo menos 6 caracteres')).toBeInTheDocument();
  });
});