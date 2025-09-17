import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Iniciando setup global dos testes E2E...');
  
  // Configurar dados de teste
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Navegar para a aplicação
    await page.goto('http://localhost:5173');
    
    // Aguardar a aplicação carregar
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Criar usuário de teste se necessário
    await setupTestUser(page);
    
    // Criar dados de teste
    await setupTestData(page);
    
    console.log('✅ Setup global concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro no setup global:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

async function setupTestUser(page: any) {
  try {
    // Tentar fazer login com usuário de teste
    await page.goto('/login');
    await page.getByPlaceholder('Email').fill('test@example.com');
    await page.getByPlaceholder('Senha').fill('password123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    
    // Se login falhar, criar usuário
    const isLoginSuccessful = await page.waitForURL(/.*dashboard/, { timeout: 5000 }).catch(() => false);
    
    if (!isLoginSuccessful) {
      console.log('Criando usuário de teste...');
      await page.goto('/signup');
      await page.getByPlaceholder('Nome completo').fill('Usuário de Teste');
      await page.getByPlaceholder('Email').fill('test@example.com');
      await page.getByPlaceholder('Senha').fill('password123');
      await page.getByPlaceholder('Confirmar senha').fill('password123');
      await page.getByRole('button', { name: 'Criar Conta' }).click();
      
      // Aguardar confirmação
      await page.waitForSelector('[data-testid="success-message"]', { timeout: 10000 });
    }
    
    console.log('✅ Usuário de teste configurado');
  } catch (error) {
    console.log('ℹ️ Usuário de teste já existe ou erro esperado:', error.message);
  }
}

async function setupTestData(page: any) {
  try {
    // Fazer login como usuário de teste
    await page.goto('/login');
    await page.getByPlaceholder('Email').fill('test@example.com');
    await page.getByPlaceholder('Senha').fill('password123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await page.waitForURL(/.*dashboard/);
    
    // Criar quiz de teste se não existir
    await page.goto('/quiz/create');
    
    // Verificar se já existe quiz de teste
    const hasTestQuiz = await page.getByText('Quiz de Teste E2E').isVisible().catch(() => false);
    
    if (!hasTestQuiz) {
      console.log('Criando quiz de teste...');
      
      // Criar quiz básico para testes
      await page.getByLabel('Título do Quiz').fill('Quiz de Teste E2E');
      await page.getByLabel('Descrição').fill('Quiz criado automaticamente para testes E2E');
      
      // Adicionar pergunta
      await page.getByText('Adicionar Pergunta').click();
      await page.getByPlaceholder('Digite sua pergunta').fill('Pergunta de teste?');
      
      // Adicionar opções
      await page.getByText('Adicionar Opção').click();
      await page.getByPlaceholder('Opção de resposta').first().fill('Opção A');
      
      await page.getByText('Adicionar Opção').click();
      await page.getByPlaceholder('Opção de resposta').last().fill('Opção B');
      
      // Marcar resposta correta
      await page.getByLabel('Resposta correta').first().check();
      
      // Salvar quiz
      await page.getByRole('button', { name: 'Salvar Quiz' }).click();
      await page.waitForSelector('[data-testid="success-message"]', { timeout: 10000 });
      
      console.log('✅ Quiz de teste criado');
    }
    
  } catch (error) {
    console.log('ℹ️ Dados de teste já existem ou erro esperado:', error.message);
  }
}

export default globalSetup;