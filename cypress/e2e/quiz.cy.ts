describe('Quiz Flow', () => {
  beforeEach(() => {
    // Limpa o banco de dados de teste e configura dados iniciais
    cy.task('db:seed');
    
    // Login como usuário de teste
    cy.login();
    cy.visit('/');
  });

  it('should create and publish a quiz', () => {
    // Criar novo quiz
    cy.get('[data-cy=create-quiz-button]').click();
    cy.get('[data-cy=quiz-title-input]').type('Teste de Conhecimentos Gerais');
    cy.get('[data-cy=quiz-description-input]').type('Um quiz para testar conhecimentos variados');
    cy.get('[data-cy=save-quiz-button]').click();

    // Adicionar perguntas
    cy.get('[data-cy=add-question-button]').click();
    cy.get('[data-cy=question-text-input]').type('Qual é a capital do Brasil?');
    cy.get('[data-cy=option-0-input]').type('Brasília');
    cy.get('[data-cy=option-1-input]').type('Rio de Janeiro');
    cy.get('[data-cy=option-2-input]').type('São Paulo');
    cy.get('[data-cy=option-3-input]').type('Salvador');
    cy.get('[data-cy=correct-option-0]').click();
    cy.get('[data-cy=save-question-button]').click();

    // Publicar quiz
    cy.get('[data-cy=publish-quiz-button]').click();
    cy.get('[data-cy=confirm-publish-button]').click();

    // Verificar se foi publicado
    cy.get('[data-cy=quiz-status]').should('contain', 'published');
  });

  it('should take a quiz and show results', () => {
    // Acessar quiz publicado
    cy.visit('/quiz/teste-de-conhecimentos-gerais');
    cy.get('[data-cy=start-quiz-button]').click();

    // Responder pergunta
    cy.get('[data-cy=option-0]').click();
    cy.get('[data-cy=next-question-button]').click();

    // Verificar resultado
    cy.get('[data-cy=quiz-score]').should('exist');
    cy.get('[data-cy=correct-answers]').should('contain', '1');
  });

  it('should show quiz analytics to owner', () => {
    // Acessar dashboard de analytics
    cy.visit('/dashboard/analytics');

    // Verificar métricas
    cy.get('[data-cy=total-views]').should('exist');
    cy.get('[data-cy=completion-rate]').should('exist');
    cy.get('[data-cy=average-score]').should('exist');

    // Verificar gráficos
    cy.get('[data-cy=device-breakdown-chart]').should('exist');
    cy.get('[data-cy=score-distribution-chart]').should('exist');
    cy.get('[data-cy=abandonment-points-chart]').should('exist');
  });

  it('should track quiz analytics correctly', () => {
    const quizUrl = '/quiz/teste-de-conhecimentos-gerais';

    // Primeiro acesso - apenas visualização
    cy.visit(quizUrl);
    cy.get('[data-cy=total-views]').should('contain', '1');

    // Segundo acesso - iniciar quiz
    cy.visit(quizUrl);
    cy.get('[data-cy=start-quiz-button]').click();
    cy.get('[data-cy=total-starts]').should('contain', '1');

    // Abandonar quiz na primeira questão
    cy.visit('/');
    cy.get('[data-cy=abandonment-rate]').should('exist');

    // Completar quiz
    cy.visit(quizUrl);
    cy.get('[data-cy=start-quiz-button]').click();
    cy.get('[data-cy=option-0]').click();
    cy.get('[data-cy=next-question-button]').click();
    
    // Verificar métricas atualizadas
    cy.visit('/dashboard/analytics');
    cy.get('[data-cy=completion-rate]').should('contain', '50');
    cy.get('[data-cy=total-completions]').should('contain', '1');
  });
});