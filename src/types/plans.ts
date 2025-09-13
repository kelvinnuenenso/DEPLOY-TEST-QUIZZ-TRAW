export interface PlanFeatures {
  maxQuizzes: number | 'unlimited'
  maxResponsesPerMonth: number
  analytics: 'basic' | 'advanced' | 'premium'
  customDomain: boolean
  removeWatermark: boolean
  apiAccess: boolean
  webhooks: boolean
  support: 'email' | 'chat' | 'dedicated'
}

export const PLAN_FEATURES: Record<string, PlanFeatures> = {
  free: {
    maxQuizzes: 3,
    maxResponsesPerMonth: 100,
    analytics: 'basic',
    customDomain: false,
    removeWatermark: false,
    apiAccess: false,
    webhooks: false,
    support: 'email'
  },
  pro: {
    maxQuizzes: 'unlimited',
    maxResponsesPerMonth: 5000,
    analytics: 'advanced',
    customDomain: true,
    removeWatermark: true,
    apiAccess: true,
    webhooks: true,
    support: 'chat'
  },
  enterprise: {
    maxQuizzes: 'unlimited',
    maxResponsesPerMonth: 50000,
    analytics: 'premium',
    customDomain: true,
    removeWatermark: true,
    apiAccess: true,
    webhooks: true,
    support: 'dedicated'
  }
}