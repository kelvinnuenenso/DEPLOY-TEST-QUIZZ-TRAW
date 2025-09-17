import { test, expect } from '@playwright/test';

test.describe('Autenticação', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('deve exibir página de login', async ({ page }) => {
    await expect(page.getByText('Entrar')).toBeVisible();
    await expect(page.getByPlaceholder('Email')).toBeVisible();
    await expect(page.getByPlaceholder('Senha')).toBeVisible();
  });

  test('deve fazer login com credenciais válidas', async ({ page }) => {
    // Preencher formulário de login
    await page.getByPlaceholder('Email').fill('test@example.com');
    await page.getByPlaceholder('Senha').fill('password123');
    
    // Clicar no botão de login
    await page.getByRole('button', { name: 'Entrar' }).click();
    
    // Verificar redirecionamento para dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.getByText('Dashboard')).toBeVisible();
  });

  test('deve mostrar erro com credenciais inválidas', async ({ page }) => {
    await page.getByPlaceholder('Email').fill('invalid@example.com');
    await page.getByPlaceholder('Senha').fill('wrongpassword');
    
    await page.getByRole('button', { name: 'Entrar' }).click();
    
    await expect(page.getByText(/credenciais inválidas/i)).toBeVisible();
  });

  test('deve navegar para página de cadastro', async ({ page }) => {
    await page.getByText('Criar conta').click();
    
    await expect(page).toHaveURL(/.*signup/);
    await expect(page.getByText('Criar Conta')).toBeVisible();
    await expect(page.getByPlaceholder('Nome completo')).toBeVisible();
  });

  test('deve fazer cadastro com dados válidos', async ({ page }) => {
    await page.goto('/signup');
    
    await page.getByPlaceholder('Nome completo').fill('Novo Usuário');
    await page.getByPlaceholder('Email').fill('novo@example.com');
    await page.getByPlaceholder('Senha').fill('password123');
    await page.getByPlaceholder('Confirmar senha').fill('password123');
    
    await page.getByRole('button', { name: 'Criar Conta' }).click();
    
    await expect(page.getByText(/conta criada com sucesso/i)).toBeVisible();
  });

  test('deve validar campos obrigatórios no cadastro', async ({ page }) => {
    await page.goto('/signup');
    
    await page.getByRole('button', { name: 'Criar Conta' }).click();
    
    await expect(page.getByText(/nome é obrigatório/i)).toBeVisible();
    await expect(page.getByText(/email é obrigatório/i)).toBeVisible();
    await expect(page.getByText(/senha é obrigatória/i)).toBeVisible();
  });

  test('deve validar confirmação de senha', async ({ page }) => {
    await page.goto('/signup');
    
    await page.getByPlaceholder('Nome completo').fill('Usuário Teste');
    await page.getByPlaceholder('Email').fill('teste@example.com');
    await page.getByPlaceholder('Senha').fill('password123');
    await page.getByPlaceholder('Confirmar senha').fill('password456');
    
    await page.getByRole('button', { name: 'Criar Conta' }).click();
    
    await expect(page.getByText(/senhas não coincidem/i)).toBeVisible();
  });

  test('deve fazer login com Google', async ({ page }) => {
    // Mock da resposta do OAuth
    await page.route('**/auth/v1/authorize**', async route => {
      await route.fulfill({
        status: 302,
        headers: {
          'Location': '/auth/callback?code=mock_code'
        }
      });
    });
    
    await page.getByText('Continuar com Google').click();
    
    // Verificar redirecionamento
    await expect(page).toHaveURL(/.*callback/);
  });

  test('deve fazer logout', async ({ page }) => {
    // Primeiro fazer login
    await page.goto('/login');
    await page.getByPlaceholder('Email').fill('test@example.com');
    await page.getByPlaceholder('Senha').fill('password123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Fazer logout
    await page.getByRole('button', { name: 'Menu do usuário' }).click();
    await page.getByText('Sair').click();
    
    // Verificar redirecionamento para login
    await expect(page).toHaveURL(/.*login/);
    await expect(page.getByText('Entrar')).toBeVisible();
  });

  test('deve redirecionar usuário não autenticado', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Deve redirecionar para login
    await expect(page).toHaveURL(/.*login/);
  });

  test('deve manter sessão após recarregar página', async ({ page }) => {
    // Fazer login
    await page.goto('/login');
    await page.getByPlaceholder('Email').fill('test@example.com');
    await page.getByPlaceholder('Senha').fill('password123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Recarregar página
    await page.reload();
    
    // Deve continuar autenticado
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.getByText('Dashboard')).toBeVisible();
  });
});