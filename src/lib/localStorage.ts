import { Quiz, Result, Lead } from '@/types/quiz';

const STORAGE_KEYS = {
  QUIZZES: 'elevado_quizzes',
  RESULTS: 'elevado_results', 
  LEADS: 'elevado_leads',
  ANALYTICS: 'elevado_analytics',
  USER_PROFILE: 'elevado_user'
} as const;

// User profile for MVP
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  plan: 'free' | 'pro' | 'premium';
  settings: {
    theme: 'light' | 'dark';
    notifications: boolean;
    autoSave: boolean;
  };
}

// Analytics data structure
export interface AnalyticsData {
  quizId: string;
  date: string;
  views: number;
  starts: number;
  completions: number;
  leads: number;
  bounceRate: number;
  avgTimeSpent: number;
  topAnswers: Record<string, { option: string; count: number }>;
  conversionFunnel: {
    step: string;
    count: number;
    percentage: number;
  }[];
}

class LocalStorageManager {
  // Generic storage methods
  private getItem<T>(key: string): T[] {
    try {
      if (typeof Storage === 'undefined') {
        console.warn('localStorage is not available');
        return [];
      }
      const data = localStorage.getItem(key);
      if (!data) return [];
      
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      // Clear corrupted data
      try {
        localStorage.removeItem(key);
      } catch (clearError) {
        console.error(`Failed to clear corrupted data for ${key}:`, clearError);
      }
      return [];
    }
  }

  private setItem<T>(key: string, data: T[]): void {
    try {
      if (typeof Storage === 'undefined') {
        console.warn('localStorage is not available');
        return;
      }
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
      // Check if it's a quota exceeded error
      if (error instanceof DOMException && error.code === 22) {
        console.warn('localStorage quota exceeded, clearing some data...');
        // Could implement cleanup logic here
      }
    }
  }

  // User Profile Management
  saveUserProfile(profile: UserProfile): void {
    try {
      if (typeof Storage === 'undefined') {
        console.warn('localStorage is not available');
        return;
      }
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  }

  getUserProfile(): UserProfile | null {
    try {
      if (typeof Storage === 'undefined') {
        console.warn('localStorage is not available');
        return null;
      }
      const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading user profile:', error);
      return null;
    }
  }

  // Quiz Management
  saveQuiz(quiz: Quiz): void {
    const quizzes = this.getItem<Quiz>(STORAGE_KEYS.QUIZZES);
    const existingIndex = quizzes.findIndex(q => q.id === quiz.id);
    
    if (existingIndex >= 0) {
      quizzes[existingIndex] = { ...quiz, updatedAt: new Date().toISOString() };
    } else {
      quizzes.push(quiz);
    }
    
    this.setItem(STORAGE_KEYS.QUIZZES, quizzes);
  }

  getQuiz(id: string): Quiz | null {
    const quizzes = this.getItem<Quiz>(STORAGE_KEYS.QUIZZES);
    return quizzes.find(q => q.id === id) || null;
  }

  getQuizByPublicId(publicId: string): Quiz | null {
    const quizzes = this.getItem<Quiz>(STORAGE_KEYS.QUIZZES);
    return quizzes.find(q => q.publicId === publicId) || null;
  }

  getAllQuizzes(): Quiz[] {
    return this.getItem<Quiz>(STORAGE_KEYS.QUIZZES);
  }

  deleteQuiz(id: string): void {
    const quizzes = this.getItem<Quiz>(STORAGE_KEYS.QUIZZES);
    const filtered = quizzes.filter(q => q.id !== id);
    this.setItem(STORAGE_KEYS.QUIZZES, filtered);
    
    // Also delete related results and leads
    this.deleteQuizResults(id);
    this.deleteQuizLeads(id);
  }

  // Results Management
  saveResult(result: Result): void {
    const results = this.getItem<Result>(STORAGE_KEYS.RESULTS);
    results.push(result);
    this.setItem(STORAGE_KEYS.RESULTS, results);
    
    // Update analytics
    this.updateAnalytics(result);
  }

  getResult(id: string): Result | null {
    const results = this.getItem<Result>(STORAGE_KEYS.RESULTS);
    return results.find(r => r.id === id) || null;
  }

  getQuizResults(quizId: string): Result[] {
    const results = this.getItem<Result>(STORAGE_KEYS.RESULTS);
    return results.filter(r => r.quizId === quizId);
  }

  deleteQuizResults(quizId: string): void {
    const results = this.getItem<Result>(STORAGE_KEYS.RESULTS);
    const filtered = results.filter(r => r.quizId !== quizId);
    this.setItem(STORAGE_KEYS.RESULTS, filtered);
  }

  // Leads Management
  saveLead(lead: Lead): void {
    const leads = this.getItem<Lead>(STORAGE_KEYS.LEADS);
    leads.push(lead);
    this.setItem(STORAGE_KEYS.LEADS, leads);
  }

  getQuizLeads(quizId: string): Lead[] {
    const leads = this.getItem<Lead>(STORAGE_KEYS.LEADS);
    return leads.filter(l => l.quizId === quizId);
  }

  getAllLeads(): Lead[] {
    return this.getItem<Lead>(STORAGE_KEYS.LEADS);
  }

  deleteQuizLeads(quizId: string): void {
    const leads = this.getItem<Lead>(STORAGE_KEYS.LEADS);
    const filtered = leads.filter(l => l.quizId !== quizId);
    this.setItem(STORAGE_KEYS.LEADS, filtered);
  }

  // Analytics Management
  private updateAnalytics(result: Result): void {
    const analytics = this.getItem<AnalyticsData>(STORAGE_KEYS.ANALYTICS);
    const today = new Date().toISOString().split('T')[0];
    
    let todayData = analytics.find(a => a.quizId === result.quizId && a.date === today);
    
    if (!todayData) {
      todayData = {
        quizId: result.quizId,
        date: today,
        views: 0,
        starts: 0,
        completions: 0,
        leads: 0,
        bounceRate: 0,
        avgTimeSpent: 0,
        topAnswers: {},
        conversionFunnel: []
      };
      analytics.push(todayData);
    }

    // Update metrics
    todayData.starts += 1;
    if (result.completedAt) {
      todayData.completions += 1;
    }

    // Process answers for top answers
    result.answers.forEach(answer => {
      const key = answer.questionId;
      if (!todayData.topAnswers[key]) {
        todayData.topAnswers[key] = { option: String(answer.value), count: 0 };
      }
      todayData.topAnswers[key].count += 1;
    });

    this.setItem(STORAGE_KEYS.ANALYTICS, analytics);
  }

  getAnalytics(quizId: string, startDate?: string, endDate?: string): AnalyticsData[] {
    const analytics = this.getItem<AnalyticsData>(STORAGE_KEYS.ANALYTICS);
    let filtered = analytics.filter(a => a.quizId === quizId);
    
    if (startDate) {
      filtered = filtered.filter(a => a.date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(a => a.date <= endDate);
    }
    
    return filtered;
  }

  // Export/Import functionality
  exportData(): string {
    const data = {
      quizzes: this.getItem<Quiz>(STORAGE_KEYS.QUIZZES),
      results: this.getItem<Result>(STORAGE_KEYS.RESULTS),
      leads: this.getItem<Lead>(STORAGE_KEYS.LEADS),
      analytics: this.getItem<AnalyticsData>(STORAGE_KEYS.ANALYTICS),
      userProfile: this.getUserProfile(),
      exportedAt: new Date().toISOString()
    };
    
    return JSON.stringify(data, null, 2);
  }

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.quizzes) this.setItem(STORAGE_KEYS.QUIZZES, data.quizzes);
      if (data.results) this.setItem(STORAGE_KEYS.RESULTS, data.results);
      if (data.leads) this.setItem(STORAGE_KEYS.LEADS, data.leads);
      if (data.analytics) this.setItem(STORAGE_KEYS.ANALYTICS, data.analytics);
      if (data.userProfile) this.saveUserProfile(data.userProfile);
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // Clear all data
  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  // Get storage usage
  getStorageUsage(): { used: number; total: number; percentage: number } {
    let used = 0;
    Object.values(STORAGE_KEYS).forEach(key => {
      const data = localStorage.getItem(key);
      if (data) used += data.length;
    });
    
    // Estimate localStorage limit (usually 5-10MB)
    const total = 5 * 1024 * 1024; // 5MB
    const percentage = (used / total) * 100;
    
    return { used, total, percentage };
  }
}

export const localDB = new LocalStorageManager();

// Update the existing functions to use localStorage
export async function saveQuiz(quiz: Quiz): Promise<Quiz> {
  localDB.saveQuiz(quiz);
  return quiz;
}

export async function loadQuizByPublicId(publicId: string): Promise<Quiz | null> {
  return localDB.getQuizByPublicId(publicId);
}

export async function loadQuiz(id: string): Promise<Quiz | null> {
  return localDB.getQuiz(id);
}

export async function listQuizzes(): Promise<Quiz[]> {
  return localDB.getAllQuizzes();
}

export async function deleteQuiz(id: string): Promise<void> {
  localDB.deleteQuiz(id);
}

export async function saveResult(result: Result): Promise<void> {
  localDB.saveResult(result);
}

export async function saveLead(lead: Lead): Promise<void> {
  localDB.saveLead(lead);
}

export async function getResult(id: string): Promise<Result | null> {
  return localDB.getResult(id);
}