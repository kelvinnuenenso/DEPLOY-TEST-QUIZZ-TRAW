import { Quiz, Question, Answer } from '@/types/quiz';
import { PlanManager } from './planManager';
import { User } from '@/hooks/useAuth';

export interface BranchingRule {
  answerId: string;
  targetQuestionId: string;
}

export interface QuestionBranching {
  questionId: string;
  rules: BranchingRule[];
}

export interface QuizBranching {
  quizId: string;
  branches: QuestionBranching[];
}

/**
 * Classe para gerenciar a lógica condicional (branching) dos quizzes
 */
export class BranchingLogic {
  /**
   * Verifica se o usuário pode usar a funcionalidade de branching
   */
  static async canUseBranching(user: User): Promise<boolean> {
    return PlanManager.canUseBranching(user);
  }

  /**
   * Obtém a próxima pergunta com base na resposta selecionada
   * @param quiz O quiz atual
   * @param currentQuestionId ID da pergunta atual
   * @param selectedAnswerId ID da resposta selecionada
   * @returns A próxima pergunta ou null se for a última
   */
  static getNextQuestion(quiz: Quiz, currentQuestionId: string, selectedAnswerId: string): Question | null {
    // Verificar se o quiz tem regras de branching
    if (!quiz.branching || quiz.branching.length === 0) {
      // Se não tiver branching, segue o fluxo normal (próxima pergunta na sequência)
      const currentIndex = quiz.questions.findIndex(q => q.id === currentQuestionId);
      if (currentIndex < 0 || currentIndex >= quiz.questions.length - 1) {
        return null; // Última pergunta ou ID inválido
      }
      return quiz.questions[currentIndex + 1];
    }

    // Procurar regra de branching para a pergunta e resposta atual
    const questionBranching = quiz.branching.find(b => b.questionId === currentQuestionId);
    if (!questionBranching) {
      // Se não tiver regra específica para esta pergunta, segue o fluxo normal
      const currentIndex = quiz.questions.findIndex(q => q.id === currentQuestionId);
      if (currentIndex < 0 || currentIndex >= quiz.questions.length - 1) {
        return null; // Última pergunta ou ID inválido
      }
      return quiz.questions[currentIndex + 1];
    }

    // Procurar regra para a resposta selecionada
    const rule = questionBranching.rules.find(r => r.answerId === selectedAnswerId);
    if (!rule) {
      // Se não tiver regra para esta resposta, segue o fluxo normal
      const currentIndex = quiz.questions.findIndex(q => q.id === currentQuestionId);
      if (currentIndex < 0 || currentIndex >= quiz.questions.length - 1) {
        return null; // Última pergunta ou ID inválido
      }
      return quiz.questions[currentIndex + 1];
    }

    // Retornar a pergunta alvo da regra
    return quiz.questions.find(q => q.id === rule.targetQuestionId) || null;
  }

  /**
   * Adiciona ou atualiza uma regra de branching
   */
  static addBranchingRule(quiz: Quiz, questionId: string, answerId: string, targetQuestionId: string): Quiz {
    // Criar uma cópia do quiz para não modificar o original
    const updatedQuiz = { ...quiz };

    // Inicializar o array de branching se não existir
    if (!updatedQuiz.branching) {
      updatedQuiz.branching = [];
    }

    // Verificar se já existe branching para esta pergunta
    const existingBranchingIndex = updatedQuiz.branching.findIndex(b => b.questionId === questionId);

    if (existingBranchingIndex >= 0) {
      // Atualizar branching existente
      const existingBranching = { ...updatedQuiz.branching[existingBranchingIndex] };
      
      // Verificar se já existe regra para esta resposta
      const existingRuleIndex = existingBranching.rules.findIndex(r => r.answerId === answerId);
      
      if (existingRuleIndex >= 0) {
        // Atualizar regra existente
        existingBranching.rules[existingRuleIndex] = {
          answerId,
          targetQuestionId
        };
      } else {
        // Adicionar nova regra
        existingBranching.rules.push({
          answerId,
          targetQuestionId
        });
      }
      
      updatedQuiz.branching[existingBranchingIndex] = existingBranching;
    } else {
      // Adicionar novo branching
      updatedQuiz.branching.push({
        questionId,
        rules: [{
          answerId,
          targetQuestionId
        }]
      });
    }

    return updatedQuiz;
  }

  /**
   * Remove uma regra de branching
   */
  static removeBranchingRule(quiz: Quiz, questionId: string, answerId: string): Quiz {
    // Se não tiver branching, retorna o quiz original
    if (!quiz.branching || quiz.branching.length === 0) {
      return quiz;
    }

    // Criar uma cópia do quiz para não modificar o original
    const updatedQuiz = { ...quiz };

    // Encontrar o índice do branching para esta pergunta
    const branchingIndex = updatedQuiz.branching.findIndex(b => b.questionId === questionId);
    if (branchingIndex < 0) {
      return updatedQuiz; // Não encontrou branching para esta pergunta
    }

    // Remover a regra para esta resposta
    const updatedRules = updatedQuiz.branching[branchingIndex].rules.filter(r => r.answerId !== answerId);

    if (updatedRules.length === 0) {
      // Se não sobrou nenhuma regra, remove o branching para esta pergunta
      updatedQuiz.branching = updatedQuiz.branching.filter(b => b.questionId !== questionId);
    } else {
      // Atualiza as regras
      updatedQuiz.branching[branchingIndex] = {
        ...updatedQuiz.branching[branchingIndex],
        rules: updatedRules
      };
    }

    return updatedQuiz;
  }

  /**
   * Valida se as regras de branching são válidas (não criam loops infinitos, etc)
   */
  static validateBranching(quiz: Quiz): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Se não tiver branching, é válido
    if (!quiz.branching || quiz.branching.length === 0) {
      return { valid: true, errors: [] };
    }

    // Verificar se todas as perguntas e respostas referenciadas existem
    for (const branch of quiz.branching) {
      // Verificar se a pergunta existe
      const questionExists = quiz.questions.some(q => q.id === branch.questionId);
      if (!questionExists) {
        errors.push(`Pergunta com ID ${branch.questionId} não existe no quiz`);
        continue;
      }

      // Verificar cada regra
      for (const rule of branch.rules) {
        // Verificar se a resposta existe na pergunta
        const question = quiz.questions.find(q => q.id === branch.questionId);
        const answerExists = question?.answers.some(a => a.id === rule.answerId);
        if (!answerExists) {
          errors.push(`Resposta com ID ${rule.answerId} não existe na pergunta ${branch.questionId}`);
        }

        // Verificar se a pergunta alvo existe
        const targetExists = quiz.questions.some(q => q.id === rule.targetQuestionId);
        if (!targetExists) {
          errors.push(`Pergunta alvo com ID ${rule.targetQuestionId} não existe no quiz`);
        }
      }
    }

    // Verificar se há loops infinitos (implementação simplificada)
    // Uma implementação mais robusta usaria um algoritmo de detecção de ciclos em grafos
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (questionId: string): boolean => {
      if (recursionStack.has(questionId)) {
        return true; // Ciclo detectado
      }

      if (visited.has(questionId)) {
        return false; // Já visitado e não tem ciclo
      }

      visited.add(questionId);
      recursionStack.add(questionId);

      const branch = quiz.branching.find(b => b.questionId === questionId);
      if (branch) {
        for (const rule of branch.rules) {
          if (hasCycle(rule.targetQuestionId)) {
            return true;
          }
        }
      }

      recursionStack.delete(questionId);
      return false;
    };

    // Verificar ciclos a partir de cada pergunta
    for (const question of quiz.questions) {
      if (hasCycle(question.id)) {
        errors.push(`Detectado um loop infinito nas regras de branching`);
        break;
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}