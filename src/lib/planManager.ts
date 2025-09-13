import { UserPlan, PlanLimits, PlanFeatures, PLAN_LIMITS, PLAN_INFO } from '@/types/user';
import { DemoUserManager } from './demoUser';
import { localDB } from './localStorage';
import { PaymentService } from './paymentService';
import { supabase } from '@/integrations/supabase/client';

export class PlanManager {
  /**
   * Get current user's plan limits
   */
  static getCurrentPlanLimits(): PlanLimits {
    const user = DemoUserManager.getCurrentUser();
    const plan = user?.plan || 'free';
    return PLAN_LIMITS[plan];
  }

  /**
   * Check if user can use branching logic feature
   */
  static async canUseBranching(user: any): Promise<boolean> {
    // Se não tiver usuário, não pode usar
    if (!user) return false;
    
    try {
      // Obter o plano do usuário
      const userPlan = user.plan || 'free';
      
      // Verificar se o plano tem acesso à funcionalidade de lógica condicional
      const features = PLAN_LIMITS[userPlan].features;
      return features.conditionalLogic === true;
    } catch (error) {
      console.error('Erro ao verificar acesso à funcionalidade de branching:', error);
      return false;
    }
  }

  /**
   * Get current user's plan features
   */
  static getCurrentPlanFeatures(): PlanFeatures {
    return this.getCurrentPlanLimits().features;
  }

  /**
   * Check if user can perform an action based on plan limits
   */
  static canCreateQuiz(): { allowed: boolean; reason?: string; limit?: number } {
    const limits = this.getCurrentPlanLimits();
    const currentQuizzes = localDB.getAllQuizzes().length;

    if (limits.maxQuizzes === -1) {
      return { allowed: true };
    }

    if (currentQuizzes >= limits.maxQuizzes) {
      return {
        allowed: false,
        reason: `Limite de ${limits.maxQuizzes} quizzes atingido`,
        limit: limits.maxQuizzes
      };
    }

    return { allowed: true };
  }

  /**
   * Check if user can add questions to a quiz
   */
  static canAddQuestion(currentQuestionCount: number): { allowed: boolean; reason?: string; limit?: number } {
    const limits = this.getCurrentPlanLimits();

    if (limits.maxQuestionsPerQuiz === -1) {
      return { allowed: true };
    }

    if (currentQuestionCount >= limits.maxQuestionsPerQuiz) {
      return {
        allowed: false,
        reason: `Limite de ${limits.maxQuestionsPerQuiz} perguntas por quiz atingido`,
        limit: limits.maxQuestionsPerQuiz
      };
    }

    return { allowed: true };
  }

  /**
   * Check if user can access a specific feature
   */
  static hasFeature(feature: keyof PlanFeatures): boolean {
    const features = this.getCurrentPlanFeatures();
    return features[feature];
  }

  /**
   * Get usage statistics for current user
   */
  static getUsageStats(): {
    quizzes: { current: number; limit: number; percentage: number };
    storage: { current: number; limit: number; percentage: number };
    responses: { current: number; limit: number; percentage: number };
  } {
    const limits = this.getCurrentPlanLimits();
    const quizzes = localDB.getAllQuizzes();
    const results = this.getResults();
    const storageInfo = localDB.getStorageUsage();

    // Calculate responses this month
    const thisMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
    const monthlyResponses = results.filter((r: any) => 
      r.createdAt?.startsWith(thisMonth)
    ).length;

    return {
      quizzes: {
        current: quizzes.length,
        limit: limits.maxQuizzes,
        percentage: limits.maxQuizzes === -1 ? 0 : (quizzes.length / limits.maxQuizzes) * 100
      },
      storage: {
        current: storageInfo.used,
        limit: limits.maxStorageBytes,
        percentage: limits.maxStorageBytes === -1 ? 0 : (storageInfo.used / limits.maxStorageBytes) * 100
      },
      responses: {
        current: monthlyResponses,
        limit: limits.maxResponsesPerMonth,
        percentage: limits.maxResponsesPerMonth === -1 ? 0 : (monthlyResponses / limits.maxResponsesPerMonth) * 100
      }
    };
  }

  /**
   * Get plan recommendations based on usage
   */
  static getPlanRecommendation(): { 
    shouldUpgrade: boolean; 
    recommendedPlan?: UserPlan; 
    reasons: string[] 
  } {
    const currentUser = DemoUserManager.getCurrentUser();
    const currentPlan = currentUser?.plan || 'free';
    const usage = this.getUsageStats();
    const reasons: string[] = [];

    // Don't recommend upgrade if already on premium
    if (currentPlan === 'premium') {
      return { shouldUpgrade: false, reasons: [] };
    }

    // Check if approaching limits
    if (usage.quizzes.percentage > 80) {
      reasons.push(`Você está usando ${Math.round(usage.quizzes.percentage)}% do limite de quizzes`);
    }

    if (usage.responses.percentage > 80) {
      reasons.push(`Você está usando ${Math.round(usage.responses.percentage)}% do limite de respostas mensais`);
    }

    if (usage.storage.percentage > 80) {
      reasons.push(`Você está usando ${Math.round(usage.storage.percentage)}% do armazenamento`);
    }

    // High usage patterns
    const totalLeads = localDB.getAllLeads().length;
    if (totalLeads > 50 && currentPlan === 'free') {
      reasons.push('Você tem muitos leads e pode se beneficiar de recursos avançados');
    }

    // Recommend based on current plan and usage
    if (reasons.length > 0) {
      return {
        shouldUpgrade: true,
        recommendedPlan: currentPlan === 'free' ? 'pro' : 'premium',
        reasons
      };
    }

    return { shouldUpgrade: false, reasons: [] };
  }

  /**
   * Simulate plan upgrade (for demo purposes)
   */
  static upgradePlan(newPlan: UserPlan): boolean {
    try {
      DemoUserManager.upgradePlan(newPlan);
      
      // Log the upgrade
      this.logPlanEvent('upgrade', newPlan);
      
      return true;
    } catch (error) {
      console.error('Failed to upgrade plan:', error);
      return false;
    }
  }

  /**
   * Get plan comparison data
   */
  static getPlanComparison(): Array<{
    feature: string;
    free: boolean | string;
    pro: boolean | string;
    premium: boolean | string;
  }> {
    return [
      {
        feature: 'Quizzes',
        free: '3 quizzes',
        pro: '50 quizzes',
        premium: 'Ilimitado'
      },
      {
        feature: 'Perguntas por quiz',
        free: '10 perguntas',
        pro: '50 perguntas',
        premium: 'Ilimitado'
      },
      {
        feature: 'Respostas mensais',
        free: '100 respostas',
        pro: '10.000 respostas',
        premium: 'Ilimitado'
      },
      {
        feature: 'Analytics avançado',
        free: false,
        pro: true,
        premium: true
      },
      {
        feature: 'Temas personalizados',
        free: false,
        pro: true,
        premium: true
      },
      {
        feature: 'Integrações',
        free: false,
        pro: true,
        premium: true
      },
      {
        feature: 'Testes A/B',
        free: false,
        pro: true,
        premium: true
      },
      {
        feature: 'Marca personalizada',
        free: false,
        pro: false,
        premium: true
      },
      {
        feature: 'Suporte dedicado',
        free: false,
        pro: false,
        premium: true
      }
    ];
  }

  /**
   * Log plan-related events (for analytics)
   */
  private static logPlanEvent(event: string, plan: UserPlan, metadata?: any): void {
    const logEntry = {
      event,
      plan,
      timestamp: new Date().toISOString(),
      metadata
    };

    // In a real app, this would go to analytics service
    console.log('Plan Event:', logEntry);
    
    // Store in localStorage for demo purposes
    try {
      const logs = JSON.parse(localStorage.getItem('elevado_plan_logs') || '[]');
      logs.push(logEntry);
      // Keep only last 100 entries
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      localStorage.setItem('elevado_plan_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to log plan event:', error);
    }
  }

  /**
   * Get plan usage warnings
   */
  static getUsageWarnings(): Array<{
    type: 'warning' | 'error';
    message: string;
    action?: string;
  }> {
    const usage = this.getUsageStats();
    const warnings: Array<{ type: 'warning' | 'error'; message: string; action?: string }> = [];

    // Quiz limit warnings
    if (usage.quizzes.percentage >= 100) {
      warnings.push({
        type: 'error',
        message: 'Você atingiu o limite de quizzes do seu plano',
        action: 'upgrade'
      });
    } else if (usage.quizzes.percentage >= 80) {
      warnings.push({
        type: 'warning',
        message: `Você está usando ${Math.round(usage.quizzes.percentage)}% do limite de quizzes`,
        action: 'upgrade'
      });
    }

    // Storage warnings
    if (usage.storage.percentage >= 100) {
      warnings.push({
        type: 'error',
        message: 'Seu armazenamento está cheio',
        action: 'upgrade'
      });
    } else if (usage.storage.percentage >= 80) {
      warnings.push({
        type: 'warning',
        message: `Você está usando ${Math.round(usage.storage.percentage)}% do armazenamento`,
        action: 'cleanup'
      });
    }

    // Response warnings
    if (usage.responses.percentage >= 100) {
      warnings.push({
        type: 'error',
        message: 'Você atingiu o limite de respostas mensais',
        action: 'upgrade'
      });
    } else if (usage.responses.percentage >= 80) {
      warnings.push({
        type: 'warning',
        message: `Você está usando ${Math.round(usage.responses.percentage)}% das respostas mensais`,
        action: 'upgrade'
      });
    }

    return warnings;
  }

  /**
   * Get results from localStorage
   */
  private static getResults(): any[] {
    try {
      const data = localStorage.getItem('elevado_results');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }
}
