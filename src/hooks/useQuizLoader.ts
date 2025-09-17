import { useEffect, useState } from 'react';
import { Quiz, QuizTheme, QuizStep, Component } from '@/types/quiz';
import { useThemes } from './useThemes';

interface QuizLoaderConfig {
  autoApplyTheme: boolean;
  autoLoadQuestions: boolean;
  createDefaultSteps: boolean;
}

const defaultConfig: QuizLoaderConfig = {
  autoApplyTheme: true,
  autoLoadQuestions: true,
  createDefaultSteps: true
};

export function useQuizLoader(quiz: Quiz, config: QuizLoaderConfig = defaultConfig) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasAutoLoaded, setHasAutoLoaded] = useState(false);
  const { savedThemes, applyThemeToQuiz } = useThemes();

  // Função para criar etapas baseadas nas perguntas existentes
  const createStepsFromQuestions = (quiz: Quiz): QuizStep[] => {
    const steps: QuizStep[] = [];

    // PRIORIDADE: Usar perguntas reais se existirem
    if (quiz.questions && quiz.questions.length > 0) {
      console.log('🎯 Carregando perguntas reais do quiz:', quiz.questions.length);
      
      // 1. ETAPA DE INTRODUÇÃO (sempre primeira)
      steps.push({
        id: 'step-intro',
        name: 'Introdução',
        title: quiz.name || 'Bem-vindo ao Quiz',
        components: [
          {
            id: 'comp-intro-title',
            type: 'title',
            content: {
              text: quiz.name || 'Bem-vindo ao Quiz',
              level: 'h1'
            }
          },
          {
            id: 'comp-intro-subtitle',
            type: 'text',
            content: {
              text: quiz.description || `Responda ${quiz.questions.length} perguntas e descubra seu resultado personalizado.`,
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
      });

      // 2. ETAPAS DAS PERGUNTAS
      quiz.questions.forEach((question, index) => {
        const step: QuizStep = {
          id: `step-${question.id}`,
          name: `Pergunta ${index + 1}`,
          title: question.title,
          components: [
            // Componente da pergunta principal - COMPLETO E AUTO-SUFICIENTE
            {
              id: `comp-question-${question.id}`,
              type: question.type === 'single' || question.type === 'multiple' ? 'multiple_choice' as const : 
                    question.type === 'slider' || question.type === 'nps' ? 'level_slider' as const :
                    ['short_text', 'long_text', 'email', 'phone'].includes(question.type) ? 'input' as const : 'text' as const,
              content: {
                // Para multiple choice - incluir TODOS os dados necessários
                ...(question.type === 'single' || question.type === 'multiple' ? {
                  question: question.title,
                  description: question.description || '',
                  options: question.options?.map(opt => ({
                    id: opt.id,
                    label: opt.label,
                    score: opt.score || 0,
                    value: opt.value || opt.label
                  })) || [
                    { id: '1', label: 'Opção A', score: 10, value: 'A' },
                    { id: '2', label: 'Opção B', score: 5, value: 'B' }
                  ],
                  allowMultiple: question.type === 'multiple',
                  required: question.required || false,
                  // Referência para sincronização (opcional)
                  _sourceQuestionId: question.id,
                  _sourceQuestionType: question.type
                } : question.type === 'slider' || question.type === 'nps' ? {
                  label: question.title,
                  question: question.title,
                  description: question.description || '',
                  min: question.type === 'nps' ? 0 : (question.settings?.min || 1),
                  max: question.type === 'nps' ? 10 : (question.settings?.max || 10),
                  step: question.settings?.step || 1,
                  defaultValue: question.type === 'nps' ? 5 : (question.settings?.defaultValue || 5),
                  required: question.required || false,
                  // Referência para sincronização (opcional)
                  _sourceQuestionId: question.id,
                  _sourceQuestionType: question.type
                } : ['short_text', 'long_text', 'email', 'phone'].includes(question.type) ? {
                  label: question.title,
                  type: question.type === 'email' ? 'email' : question.type === 'phone' ? 'tel' : 
                        question.type === 'long_text' ? 'textarea' : 'text',
                  placeholder: question.settings?.placeholder || 'Digite sua resposta...',
                  required: question.required || false,
                  // Referência para sincronização (opcional)
                  _sourceQuestionId: question.id,
                  _sourceQuestionType: question.type
                } : {
                  text: question.title,
                  style: 'normal',
                  // Referência para sincronização (opcional)
                  _sourceQuestionId: question.id,
                  _sourceQuestionType: question.type
                })
              }
            }
          ]
        };
        steps.push(step);
      });
      
      // 3. ETAPA DE RESULTADO (sempre última)
      steps.push({
        id: 'step-result',
        name: 'Resultado',
        title: 'Seu Resultado',
        components: [
          {
            id: 'comp-result-confetti',
            type: 'confetti',
            content: {
              trigger: 'onLoad',
              duration: 3000
            }
          },
          {
            id: 'comp-result-title',
            type: 'title',
            content: {
              text: 'Parabéns! Aqui está seu resultado:',
              level: 'h2'
            }
          },
          {
            id: 'comp-result-content',
            type: 'text',
            content: {
              text: 'Baseado nas suas respostas, aqui está uma análise personalizada do seu perfil.',
              style: 'normal'
            }
          },
          {
            id: 'comp-result-cta',
            type: 'button',
            content: {
              text: 'Recomeçar Quiz',
              variant: 'secondary',
              action: 'restart'
            }
          }
        ]
      });
      
      console.log('✅ Fluxo completo criado:', `Introdução → ${quiz.questions.length} Perguntas → Resultado`);
      return steps;
    }

    // FALLBACK: Se não há perguntas, verificar se já existe steps
    if (quiz.steps && quiz.steps.length > 0) {
      console.log('📋 Usando steps existentes:', quiz.steps.length);
      return quiz.steps;
    }

    // ÚLTIMO RECURSO: Criar etapa básica apenas se não há nada
    console.log('🆕 Criando etapa inicial básica');
    steps.push({
      id: 'step-initial',
      name: 'Página Principal',
      title: quiz.name || 'Nova Página',
      components: [
        {
          id: 'comp-initial-title',
          type: 'title',
          content: {
            text: quiz.name || 'Título do Quiz',
            level: 'h1'
          }
        },
        {
          id: 'comp-initial-question',
          type: 'multiple_choice',
          content: {
            question: 'Pergunta exemplo',
            options: [
              {
                id: '1',
                label: 'Opção A',
                score: 10
              },
              {
                id: '2',
                label: 'Opção B',
                score: 5
              }
            ],
            allowMultiple: false,
            required: true
          }
        }
      ]
    });

    return steps;
  };

  // Função para aplicar tema salvo automaticamente
  const applyAutoTheme = (quiz: Quiz): QuizTheme => {
    // PRIORIDADE: Se já tem tema com ao menos primary, background e text, usar ele
    if (quiz.theme && quiz.theme.primary && quiz.theme.background && quiz.theme.text) {
      return quiz.theme;
    }

    // Verificar se há um tema salvo no localStorage específico para este quiz
    const savedQuizTheme = localStorage.getItem(`quiz-theme-${quiz.id}`);
    if (savedQuizTheme) {
      try {
        const parsed = JSON.parse(savedQuizTheme);
        // Validar se é um tema completo
        if (parsed.primary && parsed.background && parsed.text) {
          return parsed;
        }
      } catch (error) {
        console.error('Erro ao carregar tema salvo:', error);
      }
    }

    // Verificar se há um tema global salvo (último usado)
    const globalTheme = localStorage.getItem('quiz-global-theme');
    if (globalTheme) {
      try {
        const parsed = JSON.parse(globalTheme);
        if (parsed.primary && parsed.background && parsed.text) {
          return parsed;
        }
      } catch (error) {
        console.error('Erro ao carregar tema global:', error);
      }
    }

    // Usar tema padrão elegante se não há tema definido
    return {
      primary: '#7C3AED',
      background: '#FAFAFA',
      text: '#1F2937',
      accent: '#8B5CF6',
      cardBackground: '#FFFFFF',
      borderRadius: '16px',
      fontFamily: 'Poppins, sans-serif',
      buttonStyle: 'rounded',
      gradient: true,
      fakeProgress: true,
      fakeProgressStyle: 'linear' as const,
      fakeProgressSpeed: 'normal' as const,
      showProgress: true,
      centerAlign: true
    };
  };

  // Função principal de carregamento automático
  const autoLoadQuizContent = (quiz: Quiz): Quiz => {
    setIsLoading(true);

    const updatedQuiz = { ...quiz };

    // 1. Aplicar tema automaticamente
    if (config.autoApplyTheme) {
      updatedQuiz.theme = applyAutoTheme(quiz);
    }

    // 2. Criar etapas baseadas nas perguntas existentes
    if (config.createDefaultSteps && config.autoLoadQuestions) {
      // Se já tem steps bem configuradas, manter
      if (quiz.steps && quiz.steps.length > 0 && 
          quiz.steps.some(step => step.components.length > 0)) {
        updatedQuiz.steps = quiz.steps;
      } else {
        // Criar steps baseadas nas perguntas reais
        updatedQuiz.steps = createStepsFromQuestions(quiz);
      }
    }

    setIsLoading(false);
    setHasAutoLoaded(true);

    return updatedQuiz;
  };

  // Função para salvar configuração de tema para este quiz específico
  const saveQuizTheme = (quiz: Quiz, theme: QuizTheme) => {
    localStorage.setItem(`quiz-theme-${quiz.id}`, JSON.stringify(theme));
  };

  // Verificar se precisa de carregamento automático
  const needsAutoLoad = (quiz: Quiz): boolean => {
    // Se já foi carregado automaticamente, não carregar novamente
    if (hasAutoLoaded) return false;

    // Se não tem tema ou tem tema muito básico
    const hasMinimalTheme = !quiz.theme || Object.keys(quiz.theme).length < 5;
    
    // Se não tem etapas criadas ou tem etapas vazias ou apenas com componentes básicos
    const hasMinimalSteps = !quiz.steps || quiz.steps.length === 0 || 
      (quiz.steps.length === 1 && (
        quiz.steps[0].components.length === 0 || 
        quiz.steps[0].components.every(comp => !comp.content || Object.keys(comp.content).length === 0)
      ));

    // Se tem perguntas criadas mas não tem etapas correspondentes
    const hasOrphanQuestions = quiz.questions && quiz.questions.length > 0 && hasMinimalSteps;

    return hasMinimalTheme || hasMinimalSteps || hasOrphanQuestions;
  };

  return {
    isLoading,
    hasAutoLoaded,
    autoLoadQuizContent,
    saveQuizTheme,
    needsAutoLoad,
    createStepsFromQuestions,
    applyAutoTheme
  };
}