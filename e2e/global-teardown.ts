import { chromium, FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Iniciando limpeza global dos testes E2E...');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Fazer login como usuário de teste
    await page.goto('http://localhost:5173/login');
    await page.getByPlaceholder('Email').fill('test@example.com');
    await page.getByPlaceholder('Senha').fill('password123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    
    const isLoggedIn = await page.waitForURL(/.*dashboard/, { timeout: 5000 }).catch(() => false);
    
    if (isLoggedIn) {
      // Limpar dados de teste criados durante os testes
      await cleanupTestData(page);
    }
    
    console.log('✅ Limpeza global concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro na limpeza global:', error);
    // Não falhar os testes por causa de erro na limpeza
  } finally {
    await browser.close();
  }
}

async function cleanupTestData(page: any) {
  try {
    // Ir para lista de quizzes
    await page.goto('/dashboard');
    await page.getByText('Meus Quizzes').click();
    
    // Excluir quizzes de teste criados durante os testes
    const testQuizTitles = [
      'Quiz de Teste E2E',
      'Quiz Editado E2E',
      'Cópia de Quiz Editado E2E',
      'Quiz Temporário para Teste'
    ];
    
    for (const title of testQuizTitles) {
      try {
        const quizElement = page.getByText(title).first();
        const isVisible = await quizElement.isVisible().catch(() => false);
        
        if (isVisible) {
          console.log(`Excluindo quiz: ${title}`);
          
          // Hover sobre o quiz e abrir menu
          await quizElement.hover();
          await page.getByTestId('quiz-menu').first().click();
          await page.getByText('Excluir').click();
          
          // Confirmar exclusão
          await page.getByRole('button', { name: 'Confirmar' }).click();
          
          // Aguardar confirmação
          await page.waitForSelector('[data-testid="success-message"]', { timeout: 5000 });
          
          console.log(`✅ Quiz "${title}" excluído`);
        }
      } catch (error) {
        console.log(`ℹ️ Quiz "${title}" não encontrado ou já excluído`);
      }
    }
    
    // Limpar dados de leads de teste
    await cleanupTestLeads(page);
    
    // Limpar configurações de teste
    await cleanupTestSettings(page);
    
  } catch (error) {
    console.log('ℹ️ Erro na limpeza de dados (esperado):', error.message);
  }
}

async function cleanupTestLeads(page: any) {
  try {
    // Navegar para página de leads
    await page.goto('/leads');
    
    // Verificar se existem leads de teste
    const testLeadEmails = [
      'joao@example.com',
      'teste@example.com',
      'lead-teste@example.com'
    ];
    
    for (const email of testLeadEmails) {
      try {
        const leadElement = page.getByText(email).first();
        const isVisible = await leadElement.isVisible().catch(() => false);
        
        if (isVisible) {
          console.log(`Excluindo lead: ${email}`);
          
          // Selecionar e excluir lead
          await leadElement.click();
          await page.getByRole('button', { name: 'Excluir' }).click();
          await page.getByRole('button', { name: 'Confirmar' }).click();
          
          console.log(`✅ Lead "${email}" excluído`);
        }
      } catch (error) {
        console.log(`ℹ️ Lead "${email}" não encontrado`);
      }
    }
  } catch (error) {
    console.log('ℹ️ Página de leads não acessível ou erro esperado');
  }
}

async function cleanupTestSettings(page: any) {
  try {
    // Resetar configurações de teste se necessário
    await page.goto('/settings');
    
    // Verificar se existem configurações de teste para limpar
    const hasTestSettings = await page.getByText('Configuração de Teste').isVisible().catch(() => false);
    
    if (hasTestSettings) {
      console.log('Limpando configurações de teste...');
      
      // Resetar para configurações padrão
      await page.getByRole('button', { name: 'Resetar para Padrão' }).click();
      await page.getByRole('button', { name: 'Confirmar' }).click();
      
      console.log('✅ Configurações resetadas');
    }
  } catch (error) {
    console.log('ℹ️ Configurações já estão no padrão ou erro esperado');
  }
}

export default globalTeardown;