import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Navigation from './Navigation';

// Mock do hook de autenticação
vi.mock('@/hooks/useAuth', () => ({
  default: () => ({
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
    },
    signOut: vi.fn(),
  }),
}));

// Mock do hook de perfil
vi.mock('@/hooks/useProfile', () => ({
  useProfile: () => ({
    profile: {
      id: 'test-user-id',
      full_name: 'Test User',
      avatar_url: null,
    },
    loading: false,
  }),
}));

describe('Navigation Component', () => {
  const mockSignOut = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockImplementation(() => ({
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
      },
      signOut: mockSignOut,
    }));
  });

  const renderNavigation = () => {
    return render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    );
  };

  it('deve renderizar o componente corretamente', () => {
    renderNavigation();
    
    // Verifica se os links principais estão presentes
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Quizzes')).toBeInTheDocument();
    expect(screen.getByText('Configurações')).toBeInTheDocument();
  });

  it('deve exibir o nome do usuário', () => {
    renderNavigation();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('deve chamar signOut ao clicar no botão de logout', () => {
    renderNavigation();
    
    const logoutButton = screen.getByRole('button', { name: /sair/i });
    fireEvent.click(logoutButton);
    
    expect(mockSignOut).toHaveBeenCalled();
  });

  it('deve exibir menu mobile ao clicar no botão de menu', () => {
    renderNavigation();
    
    const menuButton = screen.getByLabelText('Abrir menu');
    fireEvent.click(menuButton);
    
    // Verifica se o menu mobile está visível
    expect(screen.getByRole('navigation')).toHaveClass('mobile-menu-open');
  });

  it('deve fechar menu mobile ao clicar no botão de fechar', () => {
    renderNavigation();
    
    // Abre o menu
    const menuButton = screen.getByLabelText('Abrir menu');
    fireEvent.click(menuButton);
    
    // Fecha o menu
    const closeButton = screen.getByLabelText('Fechar menu');
    fireEvent.click(closeButton);
    
    // Verifica se o menu mobile está fechado
    expect(screen.getByRole('navigation')).not.toHaveClass('mobile-menu-open');
  });

  it('deve navegar para a página correta ao clicar nos links', () => {
    renderNavigation();
    
    const dashboardLink = screen.getByText('Dashboard');
    fireEvent.click(dashboardLink);
    
    expect(window.location.pathname).toBe('/dashboard');
  });

  it('deve destacar o link ativo baseado na rota atual', () => {
    // Mock da localização atual
    vi.mocked(useLocation).mockReturnValue({
      pathname: '/dashboard',
      search: '',
      hash: '',
      state: null,
    });

    renderNavigation();
    
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveClass('active');
  });
});