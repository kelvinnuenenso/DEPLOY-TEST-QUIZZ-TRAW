export type UserPlan = 'free' | 'pro' | 'premium';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  plan: UserPlan;
  createdAt: string;
  updatedAt: string;
  isDemo: boolean;
}

export interface UserProfile extends User {
  company?: string;
  industry?: string;
  website?: string;
  phone?: string;
  bio?: string;
  timezone: string;
  language: 'pt' | 'en' | 'es';
  settings: UserSettings;
  usage: UserUsage;
  preferences: UserPreferences;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    browser: boolean;
    leads: boolean;
    reports: boolean;
    updates: boolean;
  };
  privacy: {
    shareData: boolean;
    analytics: boolean;
    marketing: boolean;
  };
  editor: {
    autoSave: boolean;
    saveInterval: number; // in seconds
    showTips: boolean;
    defaultView: 'visual' | 'code';
  };
}

export interface UserUsage {
  quizzesCreated: number;
  totalViews: number;
  totalLeads: number;
  storageUsed: number; // in bytes
  apiCalls: number;
  lastActivity: string;
  monthlyStats: {
    [key: string]: {
      quizzes: number;
      views: number;
      leads: number;
      storage: number;
    };
  };
}

export interface UserPreferences {
  favoriteTemplates: string[];
  recentColors: string[];
  defaultTheme: string;
  quickActions: string[];
  dashboardLayout: 'compact' | 'expanded';
  onboarding: {
    completed: boolean;
    currentStep: number;
    skipped: boolean;
  };
}

export interface PlanLimits {
  maxQuizzes: number; // -1 for unlimited
  maxQuestionsPerQuiz: number;
  maxResponsesPerMonth: number;
  maxStorageBytes: number;
  maxApiCalls: number;
  features: PlanFeatures;
}

export interface PlanFeatures {
  // Core Features
  basicAnalytics: boolean;
  advancedAnalytics: boolean;
  realTimeReports: boolean;
  exportData: boolean;
  
  // Customization
  customThemes: boolean;
  customBranding: boolean;
  customDomains: boolean;
  whiteLabel: boolean;
  
  // Integrations
  webhooks: boolean;
  zapier: boolean;
  emailIntegrations: boolean;
  crmIntegrations: boolean;
  
  // Advanced Features
  abTesting: boolean;
  conditionalLogic: boolean;
  calculatedFields: boolean;
  fileUpload: boolean;
  videoBackground: boolean;
  
  // Support
  emailSupport: boolean;
  prioritySupport: boolean;
  phoneSupport: boolean;
  dedicatedManager: boolean;
  
  // Developer
  api: boolean;
  customJs: boolean;
  ssoIntegration: boolean;
}

export interface PlanInfo {
  id: UserPlan;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  limits: PlanLimits;
  popular?: boolean;
  recommended?: boolean;
}

// Plan Definitions
export const PLAN_LIMITS: Record<UserPlan, PlanLimits> = {
  free: {
    maxQuizzes: 3,
    maxQuestionsPerQuiz: 10,
    maxResponsesPerMonth: 100,
    maxStorageBytes: 50 * 1024 * 1024, // 50MB
    maxApiCalls: 0,
    features: {
      basicAnalytics: true,
      advancedAnalytics: false,
      realTimeReports: false,
      exportData: false,
      customThemes: false,
      customBranding: false,
      customDomains: false,
      whiteLabel: false,
      webhooks: false,
      zapier: false,
      emailIntegrations: false,
      crmIntegrations: false,
      abTesting: false,
      conditionalLogic: false,
      calculatedFields: false,
      fileUpload: false,
      videoBackground: false,
      emailSupport: true,
      prioritySupport: false,
      phoneSupport: false,
      dedicatedManager: false,
      api: false,
      customJs: false,
      ssoIntegration: false
    }
  },
  pro: {
    maxQuizzes: 50,
    maxQuestionsPerQuiz: 50,
    maxResponsesPerMonth: 10000,
    maxStorageBytes: 1024 * 1024 * 1024, // 1GB
    maxApiCalls: 10000,
    features: {
      basicAnalytics: true,
      advancedAnalytics: true,
      realTimeReports: true,
      exportData: true,
      customThemes: true,
      customBranding: false,
      customDomains: true,
      whiteLabel: false,
      webhooks: true,
      zapier: true,
      emailIntegrations: true,
      crmIntegrations: true,
      abTesting: true,
      conditionalLogic: true,
      calculatedFields: true,
      fileUpload: true,
      videoBackground: true,
      emailSupport: true,
      prioritySupport: true,
      phoneSupport: false,
      dedicatedManager: false,
      api: true,
      customJs: false,
      ssoIntegration: false
    }
  },
  premium: {
    maxQuizzes: -1, // unlimited
    maxQuestionsPerQuiz: -1,
    maxResponsesPerMonth: -1,
    maxStorageBytes: -1,
    maxApiCalls: -1,
    features: {
      basicAnalytics: true,
      advancedAnalytics: true,
      realTimeReports: true,
      exportData: true,
      customThemes: true,
      customBranding: true,
      customDomains: true,
      whiteLabel: true,
      webhooks: true,
      zapier: true,
      emailIntegrations: true,
      crmIntegrations: true,
      abTesting: true,
      conditionalLogic: true,
      calculatedFields: true,
      fileUpload: true,
      videoBackground: true,
      emailSupport: true,
      prioritySupport: true,
      phoneSupport: true,
      dedicatedManager: true,
      api: true,
      customJs: true,
      ssoIntegration: true
    }
  }
};

export const PLAN_INFO: Record<UserPlan, PlanInfo> = {
  free: {
    id: 'free',
    name: 'Gratuito',
    description: 'Perfeito para começar e testar a plataforma',
    monthlyPrice: 0,
    yearlyPrice: 0,
    limits: PLAN_LIMITS.free
  },
  pro: {
    id: 'pro',
    name: 'Profissional',
    description: 'Para empresas que querem escalar seus resultados',
    monthlyPrice: 97,
    yearlyPrice: 970,
    limits: PLAN_LIMITS.pro,
    popular: true
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    description: 'Solução completa com recursos avançados',
    monthlyPrice: 197,
    yearlyPrice: 1970,
    limits: PLAN_LIMITS.premium,
    recommended: true
  }
};