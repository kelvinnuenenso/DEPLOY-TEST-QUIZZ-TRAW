import { DEMO_USERS } from './demoData';

export type DemoUserPlan = 'free' | 'pro' | 'premium';

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  plan: DemoUserPlan;
  company?: string;
  industry?: string;
  experience?: string;
  goals?: string[];
}

export class DemoUserManager {
  private static readonly STORAGE_KEY = 'elevado-demo-user';
  private static readonly SESSION_KEY = 'elevado-demo-session';

  static getCurrentUser(): DemoUser | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const userData = localStorage.getItem(this.STORAGE_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  static setCurrentUser(user: DemoUser): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    localStorage.setItem(this.SESSION_KEY, new Date().toISOString());
  }

  static clearUser(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.SESSION_KEY);
  }

  static createDemoUser(data: {
    name: string;
    email: string;
    company?: string;
    industry?: string;
    experience?: string;
    goals?: string[];
    plan?: DemoUserPlan;
  }): DemoUser {
    const user: DemoUser = {
      id: `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      plan: data.plan || 'free'
    };

    this.setCurrentUser(user);
    return user;
  }

  static getDemoUserByIndex(index: number): DemoUser | null {
    return DEMO_USERS[index] || null;
  }

  static switchToPresetUser(index: number): DemoUser | null {
    const user = this.getDemoUserByIndex(index);
    if (user) {
      this.setCurrentUser(user);
      return user;
    }
    return null;
  }

  static upgradePlan(plan: DemoUserPlan): void {
    const user = this.getCurrentUser();
    if (user) {
      user.plan = plan;
      this.setCurrentUser(user);
    }
  }

  static getFeatureAccess(): {
    maxQuizzes: number;
    maxQuestionsPerQuiz: number;
    advancedAnalytics: boolean;
    customThemes: boolean;
    whatsappIntegration: boolean;
    abTesting: boolean;
    customBranding: boolean;
    prioritySupport: boolean;
    exportData: boolean;
    api: boolean;
  } {
    const user = this.getCurrentUser();
    const plan = user?.plan || 'free';

    switch (plan) {
      case 'premium':
        return {
          maxQuizzes: -1, // unlimited
          maxQuestionsPerQuiz: -1,
          advancedAnalytics: true,
          customThemes: true,
          whatsappIntegration: true,
          abTesting: true,
          customBranding: true,
          prioritySupport: true,
          exportData: true,
          api: true
        };
      case 'pro':
        return {
          maxQuizzes: 50,
          maxQuestionsPerQuiz: 50,
          advancedAnalytics: true,
          customThemes: true,
          whatsappIntegration: true,
          abTesting: true,
          customBranding: false,
          prioritySupport: false,
          exportData: true,
          api: false
        };
      default: // free
        return {
          maxQuizzes: 3,
          maxQuestionsPerQuiz: 10,
          advancedAnalytics: false,
          customThemes: false,
          whatsappIntegration: false,
          abTesting: false,
          customBranding: false,
          prioritySupport: false,
          exportData: false,
          api: false
        };
    }
  }

  static canCreateQuiz(): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    const features = this.getFeatureAccess();
    if (features.maxQuizzes === -1) return true;

    // In a real implementation, we'd check the actual count from localStorage
    // For demo purposes, we'll just return true for now
    return true;
  }

  static getPlanLimitsMessage(): string {
    const user = this.getCurrentUser();
    const plan = user?.plan || 'free';

    switch (plan) {
      case 'free':
        return 'Plano Gratuito: Até 3 quizzes, 10 perguntas por quiz';
      case 'pro':
        return 'Plano Pro: Até 50 quizzes, 50 perguntas por quiz';
      case 'premium':
        return 'Plano Premium: Quizzes e perguntas ilimitados';
      default:
        return '';
    }
  }
}