import { test, expect } from '@playwright/test';

test.describe('Fluxo de Quiz', () => {
  test.beforeEach(async ({ page }) => {
    // Fazer login antes de cada teste
    await page.goto('/login');
    await page.getByPlaceholder('Email').fill('test@example.com');
    await page.getByPlaceholder('Senha').fill('password123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('deve criar um novo quiz completo', async ({ page }) => {
    // Navegar para criação de quiz
    await page.getByText('Criar Quiz').click();
    await expect(page).toHaveURL(/.*quiz\/create/);
    
    // Preencher informações básicas do quiz
    await page.getByLabel('Título do Quiz').fill('Quiz de Teste E2E');
    await page.getByLabel('Descrição').fill('Este é um quiz criado durante os testes E2E');
    
    // Adicionar primeira pergunta
    await page.getByText('Adicionar Pergunta').click();
    await page.getByPlaceholder('Digite sua pergunta').fill('Qual é a capital do Brasil?');
    
    // Adicionar opções de resposta
    await page.getByText('Adicionar Opção').click();
    await page.getByPlaceholder('Opção de resposta').first().fill('Brasília');
    
    await page.getByText('Adicionar Opção').click();
    await page.getByPlaceholder('Opção de resposta').last().fill('São Paulo');
    
    await page.getByText('Adicionar Opção').click();
    await page.getByPlaceholder('Opção de resposta').last().fill('Rio de Janeiro');
    
    // Marcar resposta correta
    await page.getByLabel('Resposta correta').first().check();
    
    // Adicionar segunda pergunta
    await page.getByText('Adicionar Pergunta').click();
    await page.getByPlaceholder('Digite sua pergunta').last().fill('Quantos estados tem o Brasil?');
    
    // Adicionar opções para segunda pergunta
    const secondQuestion = page.locator('[data-testid="question-1"]');
    await secondQuestion.getByText('Adicionar Opção').click();
    await secondQuestion.getByPlaceholder('Opção de resposta').first().fill('26');
    
    await secondQuestion.getByText('Adicionar Opção').click();
    await secondQuestion.getByPlaceholder('Opção de resposta').last().fill('27');
    
    await secondQuestion.getByText('Adicionar Opção').click();
    await secondQuestion.getByPlaceholder('Opção de resposta').last().fill('25');
    
    // Marcar resposta correta da segunda pergunta
    await secondQuestion.getByLabel('Resposta correta').nth(1).check();
    
    // Salvar quiz
    await page.getByRole('button', { name: 'Salvar Quiz' }).click();
    
    // Verificar sucesso
    await expect(page.getByText('Quiz criado com sucesso')).toBeVisible();
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('deve visualizar preview do quiz', async ({ page }) => {
    // Ir para lista de quizzes
    await page.goto('/dashboard');
    await page.getByText('Meus Quizzes').click();
    
    // Selecionar um quiz existente
    await page.getByText('Quiz de Teste E2E').first().click();
    
    // Clicar em preview
    await page.getByText('Visualizar').click();
    
    // Verificar se o preview está funcionando
    await expect(page.getByText('Preview do Quiz')).toBeVisible();
    await expect(page.getByText('Qual é a capital do Brasil?')).toBeVisible();
    await expect(page.getByText('Brasília')).toBeVisible();
  });

  test('deve responder um quiz completo', async ({ page }) => {
    // Navegar para um quiz público
    await page.goto('/quiz/public/test-quiz-id');
    
    // Verificar página inicial do quiz
    await expect(page.getByText('Quiz de Teste E2E')).toBeVisible();
    await expect(page.getByText('Este é um quiz criado durante os testes E2E')).toBeVisible();
    
    // Iniciar quiz
    await page.getByRole('button', { name: 'Iniciar Quiz' }).click();
    
    // Responder primeira pergunta
    await expect(page.getByText('Qual é a capital do Brasil?')).toBeVisible();
    await page.getByText('Brasília').click();
    await page.getByRole('button', { name: 'Próxima' }).click();
    
    // Responder segunda pergunta
    await expect(page.getByText('Quantos estados tem o Brasil?')).toBeVisible();
    await page.getByText('27').click();
    await page.getByRole('button', { name: 'Finalizar' }).click();
    
    // Verificar página de resultados
    await expect(page.getByText('Resultado do Quiz')).toBeVisible();
    await expect(page.getByText('Pontuação:')).toBeVisible();
    await expect(page.getByText('2/2')).toBeVisible(); // Todas corretas
  });

  test('deve capturar lead durante o quiz', async ({ page }) => {
    // Navegar para quiz com captura de lead
    await page.goto('/quiz/public/lead-quiz-id');
    
    // Iniciar quiz
    await page.getByRole('button', { name: 'Iniciar Quiz' }).click();
    
    // Responder algumas perguntas
    await page.getByText('Opção A').click();
    await page.getByRole('button', { name: 'Próxima' }).click();
    
    // Formulário de captura de lead deve aparecer
    await expect(page.getByText('Quase lá!')).toBeVisible();
    await expect(page.getByPlaceholder('Seu nome')).toBeVisible();
    await expect(page.getByPlaceholder('Seu email')).toBeVisible();
    
    // Preencher dados do lead
    await page.getByPlaceholder('Seu nome').fill('João Silva');
    await page.getByPlaceholder('Seu email').fill('joao@example.com');
    await page.getByPlaceholder('Seu telefone').fill('(11) 99999-9999');
    
    // Continuar quiz
    await page.getByRole('button', { name: 'Continuar Quiz' }).click();
    
    // Finalizar quiz
    await page.getByText('Opção B').click();
    await page.getByRole('button', { name: 'Finalizar' }).click();
    
    // Verificar resultado personalizado
    await expect(page.getByText('Obrigado, João!')).toBeVisible();
  });

  test('deve editar quiz existente', async ({ page }) => {
    // Ir para lista de quizzes
    await page.goto('/dashboard');
    await page.getByText('Meus Quizzes').click();
    
    // Selecionar quiz para editar
    await page.getByText('Quiz de Teste E2E').first().click();
    await page.getByText('Editar').click();
    
    // Modificar título
    await page.getByLabel('Título do Quiz').clear();
    await page.getByLabel('Título do Quiz').fill('Quiz Editado E2E');
    
    // Adicionar nova pergunta
    await page.getByText('Adicionar Pergunta').click();
    await page.getByPlaceholder('Digite sua pergunta').last().fill('Nova pergunta adicionada');
    
    // Salvar alterações
    await page.getByRole('button', { name: 'Salvar Alterações' }).click();
    
    // Verificar sucesso
    await expect(page.getByText('Quiz atualizado com sucesso')).toBeVisible();
  });

  test('deve duplicar quiz', async ({ page }) => {
    // Ir para lista de quizzes
    await page.goto('/dashboard');
    await page.getByText('Meus Quizzes').click();
    
    // Duplicar quiz
    await page.getByTestId('quiz-menu').first().click();
    await page.getByText('Duplicar').click();
    
    // Verificar confirmação
    await expect(page.getByText('Quiz duplicado com sucesso')).toBeVisible();
    
    // Verificar se aparece na lista
    await expect(page.getByText('Cópia de Quiz Editado E2E')).toBeVisible();
  });

  test('deve excluir quiz', async ({ page }) => {
    // Ir para lista de quizzes
    await page.goto('/dashboard');
    await page.getByText('Meus Quizzes').click();
    
    // Excluir quiz duplicado
    await page.getByText('Cópia de Quiz Editado E2E').first().hover();
    await page.getByTestId('quiz-menu').first().click();
    await page.getByText('Excluir').click();
    
    // Confirmar exclusão
    await page.getByRole('button', { name: 'Confirmar' }).click();
    
    // Verificar sucesso
    await expect(page.getByText('Quiz excluído com sucesso')).toBeVisible();
    
    // Verificar que não aparece mais na lista
    await expect(page.getByText('Cópia de Quiz Editado E2E')).not.toBeVisible();
  });

  test('deve compartilhar quiz', async ({ page }) => {
    // Ir para lista de quizzes
    await page.goto('/dashboard');
    await page.getByText('Meus Quizzes').click();
    
    // Abrir opções de compartilhamento
    await page.getByText('Quiz Editado E2E').first().click();
    await page.getByText('Compartilhar').click();
    
    // Verificar modal de compartilhamento
    await expect(page.getByText('Compartilhar Quiz')).toBeVisible();
    await expect(page.getByText('Link público:')).toBeVisible();
    
    // Copiar link
    await page.getByRole('button', { name: 'Copiar Link' }).click();
    await expect(page.getByText('Link copiado!')).toBeVisible();
    
    // Verificar opções de redes sociais
    await expect(page.getByText('Compartilhar no Facebook')).toBeVisible();
    await expect(page.getByText('Compartilhar no Twitter')).toBeVisible();
    await expect(page.getByText('Compartilhar no LinkedIn')).toBeVisible();
  });

  test('deve visualizar analytics do quiz', async ({ page }) => {
    // Ir para lista de quizzes
    await page.goto('/dashboard');
    await page.getByText('Meus Quizzes').click();
    
    // Abrir analytics
    await page.getByText('Quiz Editado E2E').first().click();
    await page.getByText('Analytics').click();
    
    // Verificar métricas
    await expect(page.getByText('Estatísticas do Quiz')).toBeVisible();
    await expect(page.getByText('Total de Respostas')).toBeVisible();
    await expect(page.getByText('Taxa de Conclusão')).toBeVisible();
    await expect(page.getByText('Pontuação Média')).toBeVisible();
    
    // Verificar gráficos
    await expect(page.locator('[data-testid="responses-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="completion-chart"]')).toBeVisible();
  });
});