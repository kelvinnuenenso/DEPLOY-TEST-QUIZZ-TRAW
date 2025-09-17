// Script para inicializar dados de teste no localStorage
const testQuiz = {
  id: 'test-quiz',
  name: 'Quiz de Teste',
  description: 'Um quiz de exemplo para testar o sistema',
  publicId: 'test-quiz-public',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  userId: 'test-user',
  questions: [
    {
      id: 'q1',
      title: 'Qual é sua cor favorita?',
      type: 'single',
      required: true,
      options: [
        { id: 'opt1', label: 'Azul', score: 10, value: 'blue' },
        { id: 'opt2', label: 'Verde', score: 8, value: 'green' },
        { id: 'opt3', label: 'Vermelho', score: 6, value: 'red' }
      ]
    },
    {
      id: 'q2',
      title: 'Como você se sente hoje?',
      type: 'slider',
      required: true,
      settings: {
        min: 1,
        max: 10,
        step: 1,
        defaultValue: 5
      }
    }
  ],
  steps: [
    {
      id: 'step-intro',
      name: 'Introdução',
      title: 'Bem-vindo ao Quiz de Teste',
      components: [
        {
          id: 'comp-intro-title',
          type: 'title',
          content: {
            text: 'Bem-vindo ao Quiz de Teste',
            level: 'h1'
          }
        },
        {
          id: 'comp-intro-subtitle',
          type: 'text',
          content: {
            text: 'Responda 2 perguntas e descubra seu resultado personalizado.',
            style: 'subtitle'
          }
        },
        {
          id: 'comp-intro-button',
          type: 'button',
          content: {
            text: 'Começar',
            variant: 'primary',
            action: 'next'
          }
        }
      ]
    },
    {
      id: 'step-q1',
      name: 'Pergunta 1',
      title: 'Qual é sua cor favorita?',
      components: [
        {
          id: 'comp-question-q1',
          type: 'multiple_choice',
          content: {
            question: 'Qual é sua cor favorita?',
            description: 'Escolha a cor que mais combina com você',
            options: [
              { id: 'opt1', label: 'Azul', score: 10, value: 'blue' },
              { id: 'opt2', label: 'Verde', score: 8, value: 'green' },
              { id: 'opt3', label: 'Vermelho', score: 6, value: 'red' }
            ],
            allowMultiple: false,
            required: true
          }
        }
      ]
    },
    {
      id: 'step-q2',
      name: 'Pergunta 2',
      title: 'Como você se sente hoje?',
      components: [
        {
          id: 'comp-question-q2',
          type: 'level_slider',
          content: {
            label: 'Como você se sente hoje?',
            question: 'Como você se sente hoje?',
            description: 'Use a escala de 1 a 10',
            min: 1,
            max: 10,
            step: 1,
            defaultValue: 5,
            required: true
          }
        }
      ]
    },
    {
      id: 'step-result',
      name: 'Resultado',
      title: 'Seu Resultado',
      components: [
        {
          id: 'comp-result-title',
          type: 'title',
          content: {
            text: 'Parabéns! Aqui está seu resultado:',
            level: 'h2'
          }
        },
        {
          id: 'comp-result-text',
          type: 'text',
          content: {
            text: 'Obrigado por participar do nosso quiz!',
            style: 'normal'
          }
        }
      ]
    }
  ],
  theme: {
    primary: '#2563EB',
    accent: '#3B82F6',
    background: '#FFFFFF',
    cardBackground: '#FFFFFF',
    text: '#1F2937',
    borderRadius: '12px',
    fontFamily: 'Inter, sans-serif',
    showProgress: true,
    maxWidth: 'medium'
  },
  settings: {
    allowBack: true,
    showProgress: true,
    randomizeQuestions: false
  },
  results: []
};

// Salvar no localStorage
const STORAGE_KEY = 'elevado_quizzes';
const existingQuizzes = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
const quizIndex = existingQuizzes.findIndex(q => q.id === 'test-quiz');

if (quizIndex >= 0) {
  existingQuizzes[quizIndex] = testQuiz;
} else {
  existingQuizzes.push(testQuiz);
}

localStorage.setItem(STORAGE_KEY, JSON.stringify(existingQuizzes));
console.log('✅ Quiz de teste criado/atualizado com sucesso!');
console.log('📊 Dados do quiz:', testQuiz);