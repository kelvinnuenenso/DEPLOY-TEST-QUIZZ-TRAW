import { Quiz, Result, Lead } from '@/types/quiz';
import { localDB } from './localStorage';

export interface AnalyticsData {
  // Overview metrics
  totalQuizzes: number;
  totalViews: number;
  totalStarts: number;
  totalCompletions: number;
  totalLeads: number;
  
  // Conversion rates
  startRate: number; // views to starts
  completionRate: number; // starts to completions
  leadConversionRate: number; // completions to leads
  
  // Time-based data
  viewsOverTime: TimeSeriesData[];
  completionsOverTime: TimeSeriesData[];
  leadsOverTime: TimeSeriesData[];
  
  // Quiz performance
  topPerformingQuizzes: QuizPerformance[];
  
  // Response analytics
  topAnswers: AnswerAnalytics[];
  
  // Engagement metrics
  averageTimeSpent: number;
  bounceRate: number;
  mostDropOffStep: number;
  
  // Geographic data (simulated for demo)
  locationData: LocationData[];
  
  // Device data
  deviceData: DeviceData[];
}

export interface TimeSeriesData {
  date: string;
  value: number;
}

export interface QuizPerformance {
  quizId: string;
  quizTitle: string;
  views: number;
  starts: number;
  completions: number;
  leads: number;
  conversionRate: number;
  averageScore?: number;
}

export interface AnswerAnalytics {
  questionId: string;
  questionText: string;
  answers: Array<{
    value: string;
    count: number;
    percentage: number;
  }>;
}

export interface LocationData {
  country: string;
  state?: string;
  city?: string;
  count: number;
  percentage: number;
}

export interface DeviceData {
  device: 'desktop' | 'mobile' | 'tablet';
  count: number;
  percentage: number;
}

export interface FunnelData {
  step: string;
  visitors: number;
  dropOff: number;
  conversionRate: number;
}

export class AnalyticsManager {
  /**
   * Generate comprehensive analytics for all quizzes
   */
  static generateAnalytics(dateRange?: { start: string; end: string }): AnalyticsData {
    const quizzes = localDB.getAllQuizzes();
    const allResults = this.getAllResults();
    const allLeads = localDB.getAllLeads();

    // Filter by date range if provided
    const filteredResults = dateRange 
      ? allResults.filter(r => this.isInDateRange(r.startedAt, dateRange))
      : allResults;
    
    const filteredLeads = dateRange
      ? allLeads.filter(l => this.isInDateRange(l.createdAt, dateRange))
      : allLeads;

    // Calculate overview metrics
    const totalStarts = filteredResults.length;
    const totalCompletions = filteredResults.filter(r => r.completedAt).length;
    const totalLeads = filteredLeads.length;
    
    // Simulate views (in real app, this would be tracked separately)
    const totalViews = Math.round(totalStarts * 1.5); // Assume 1.5x views than starts

    return {
      totalQuizzes: quizzes.length,
      totalViews,
      totalStarts,
      totalCompletions,
      totalLeads,
      
      startRate: totalViews > 0 ? (totalStarts / totalViews) * 100 : 0,
      completionRate: totalStarts > 0 ? (totalCompletions / totalStarts) * 100 : 0,
      leadConversionRate: totalCompletions > 0 ? (totalLeads / totalCompletions) * 100 : 0,
      
      viewsOverTime: this.generateTimeSeriesData(filteredResults, 'views'),
      completionsOverTime: this.generateTimeSeriesData(filteredResults, 'completions'),
      leadsOverTime: this.generateTimeSeriesData(filteredLeads, 'leads'),
      
      topPerformingQuizzes: this.getTopPerformingQuizzes(quizzes, filteredResults, filteredLeads),
      topAnswers: this.getTopAnswers(filteredResults),
      
      averageTimeSpent: this.calculateAverageTimeSpent(filteredResults),
      bounceRate: this.calculateBounceRate(filteredResults),
      mostDropOffStep: this.getMostDropOffStep(filteredResults),
      
      locationData: this.generateLocationData(filteredResults),
      deviceData: this.generateDeviceData(filteredResults)
    };
  }

  /**
   * Generate analytics for a specific quiz
   */
  static generateQuizAnalytics(quizId: string, dateRange?: { start: string; end: string }): QuizAnalytics {
    const quiz = localDB.getQuiz(quizId);
    if (!quiz) throw new Error('Quiz not found');

    const results = this.getQuizResults(quizId);
    const leads = localDB.getQuizLeads(quizId);

    // Filter by date range if provided
    const filteredResults = dateRange 
      ? results.filter(r => this.isInDateRange(r.startedAt, dateRange))
      : results;
    
    const filteredLeads = dateRange
      ? leads.filter(l => this.isInDateRange(l.createdAt, dateRange))
      : leads;

    const completedResults = filteredResults.filter(r => r.completedAt);
    const totalViews = Math.round(filteredResults.length * 1.3); // Simulate views

    return {
      quiz,
      overview: {
        views: totalViews,
        starts: filteredResults.length,
        completions: completedResults.length,
        leads: filteredLeads.length,
        averageScore: this.calculateAverageScore(completedResults),
        completionRate: filteredResults.length > 0 ? (completedResults.length / filteredResults.length) * 100 : 0,
        leadConversionRate: completedResults.length > 0 ? (filteredLeads.length / completedResults.length) * 100 : 0
      },
      funnel: this.generateFunnelData(quiz, filteredResults),
      timeSpent: this.calculateTimeSpentData(filteredResults),
      dropOffAnalysis: this.analyzeDropOff(quiz, filteredResults),
      answerDistribution: this.getAnswerDistribution(quiz, filteredResults),
      timeSeriesData: {
        views: this.generateTimeSeriesData(filteredResults, 'views'),
        starts: this.generateTimeSeriesData(filteredResults, 'starts'),
        completions: this.generateTimeSeriesData(completedResults, 'completions'),
        leads: this.generateTimeSeriesData(filteredLeads, 'leads')
      }
    };
  }

  /**
   * Get A/B test results (simulated for demo)
   */
  static getABTestResults(quizId: string): ABTestResults {
    const quiz = localDB.getQuiz(quizId);
    if (!quiz) throw new Error('Quiz not found');

    // Simulate A/B test data
    return {
      testId: `ab_${quizId}_${Date.now()}`,
      quizId,
      variants: [
        {
          id: 'variant_a',
          name: 'Original',
          traffic: 50,
          visitors: Math.floor(Math.random() * 1000) + 100,
          conversions: Math.floor(Math.random() * 200) + 20,
          conversionRate: 0,
          confidence: 95
        },
        {
          id: 'variant_b',
          name: 'Variação',
          traffic: 50,
          visitors: Math.floor(Math.random() * 1000) + 100,
          conversions: Math.floor(Math.random() * 250) + 30,
          conversionRate: 0,
          confidence: 95
        }
      ],
      winner: Math.random() > 0.5 ? 'variant_a' : 'variant_b',
      significance: Math.random() * 0.3 + 0.7, // 70-100%
      status: 'completed' as const,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString()
    };
  }

  // Private helper methods
  /**
   * Get all results from localStorage
   */
  private static getAllResults(): Result[] {
    try {
      const data = localStorage.getItem('elevado_results');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private static getQuizResults(quizId: string): Result[] {
    return this.getAllResults().filter(r => r.quizId === quizId);
  }

  private static isInDateRange(date: string, range: { start: string; end: string }): boolean {
    const d = new Date(date);
    const start = new Date(range.start);
    const end = new Date(range.end);
    return d >= start && d <= end;
  }

  private static generateTimeSeriesData(data: Result[], type: string): TimeSeriesData[] {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    return last30Days.map(date => {
      const dayData = data.filter(item => 
        item.startedAt?.startsWith(date) || item.createdAt?.startsWith(date) ||
        (type === 'completions' && item.completedAt?.startsWith(date))
      );
      
      let value = dayData.length;
      if (type === 'views') {
        value = Math.round(value * 1.3); // Simulate views
      }
      
      return { date, value };
    });
  }

  private static getTopPerformingQuizzes(quizzes: Quiz[], results: Result[], leads: Lead[]): QuizPerformance[] {
    return quizzes.map(quiz => {
      const quizResults = results.filter(r => r.quizId === quiz.id);
      const quizLeads = leads.filter(l => l.quizId === quiz.id);
      const completions = quizResults.filter(r => r.completedAt);
      const views = Math.round(quizResults.length * 1.3);

      return {
        quizId: quiz.id,
        quizTitle: quiz.name || `Quiz ${quiz.id}`,
        views,
        starts: quizResults.length,
        completions: completions.length,
        leads: quizLeads.length,
        conversionRate: quizResults.length > 0 ? (completions.length / quizResults.length) * 100 : 0,
        averageScore: this.calculateAverageScore(completions)
      };
    }).sort((a, b) => b.conversionRate - a.conversionRate);
  }

  private static getTopAnswers(results: Result[]): AnswerAnalytics[] {
    const answerMap = new Map<string, Map<string, number>>();
    
    results.forEach(result => {
      result.answers.forEach(answer => {
        if (!answerMap.has(answer.questionId)) {
          answerMap.set(answer.questionId, new Map());
        }
        
        const questionAnswers = answerMap.get(answer.questionId)!;
        const valueStr = String(answer.value);
        questionAnswers.set(valueStr, (questionAnswers.get(valueStr) || 0) + 1);
      });
    });

    return Array.from(answerMap.entries()).map(([questionId, answers]) => {
      const total = Array.from(answers.values()).reduce((sum, count) => sum + count, 0);
      
      return {
        questionId,
        questionText: `Pergunta ${questionId}`, // In real app, would lookup question text
        answers: Array.from(answers.entries()).map(([value, count]) => ({
          value,
          count,
          percentage: total > 0 ? (count / total) * 100 : 0
        })).sort((a, b) => b.count - a.count)
      };
    });
  }

  private static calculateAverageTimeSpent(results: Result[]): number {
    const completedResults = results.filter(r => r.completedAt && r.startedAt);
    if (completedResults.length === 0) return 0;

    const totalTime = completedResults.reduce((sum, result) => {
      const start = new Date(result.startedAt).getTime();
      const end = new Date(result.completedAt!).getTime();
      return sum + (end - start);
    }, 0);

    return totalTime / completedResults.length / 1000; // Return in seconds
  }

  private static calculateBounceRate(results: Result[]): number {
    if (results.length === 0) return 0;
    
    const bounced = results.filter(r => !r.completedAt || r.answers.length <= 1);
    return (bounced.length / results.length) * 100;
  }

  private static getMostDropOffStep(results: Result[]): number {
    // Simulate drop-off analysis
    return Math.floor(Math.random() * 5) + 1;
  }

  private static generateLocationData(results: Result[]): LocationData[] {
    // Simulate location data for demo
    const locations = [
      { country: 'Brasil', state: 'São Paulo', city: 'São Paulo', percentage: 35 },
      { country: 'Brasil', state: 'Rio de Janeiro', city: 'Rio de Janeiro', percentage: 20 },
      { country: 'Brasil', state: 'Minas Gerais', city: 'Belo Horizonte', percentage: 15 },
      { country: 'Brasil', state: 'Paraná', city: 'Curitiba', percentage: 10 },
      { country: 'Brasil', state: 'Bahia', city: 'Salvador', percentage: 8 },
      { country: 'Outros', percentage: 12 }
    ];

    return locations.map(loc => ({
      ...loc,
      count: Math.round((results.length * loc.percentage) / 100)
    }));
  }

  private static generateDeviceData(results: Result[]): DeviceData[] {
    const devices = [
      { device: 'mobile' as const, percentage: 65 },
      { device: 'desktop' as const, percentage: 30 },
      { device: 'tablet' as const, percentage: 5 }
    ];

    return devices.map(device => ({
      ...device,
      count: Math.round((results.length * device.percentage) / 100)
    }));
  }

  private static calculateAverageScore(results: Result[]): number {
    if (results.length === 0) return 0;
    
    const totalScore = results.reduce((sum, result) => sum + (result.score || 0), 0);
    return totalScore / results.length;
  }

  private static generateFunnelData(quiz: Quiz, results: Result[]): FunnelData[] {
    const steps = quiz.steps || [];
    const totalStarts = results.length;
    
    return steps.map((step, index) => {
      // Simulate drop-off at each step
      const dropOffRate = Math.pow(0.85, index + 1); // 15% drop-off per step
      const visitors = Math.round(totalStarts * dropOffRate);
      const dropOff = index === 0 ? 0 : Math.round(totalStarts * Math.pow(0.85, index) - visitors);
      
      return {
        step: step.title || `Etapa ${index + 1}`,
        visitors,
        dropOff,
        conversionRate: totalStarts > 0 ? (visitors / totalStarts) * 100 : 0
      };
    });
  }

  private static calculateTimeSpentData(results: Result[]): { average: number; median: number; distribution: number[] } {
    const times = results
      .filter(r => r.completedAt && r.startedAt)
      .map(r => {
        const start = new Date(r.startedAt).getTime();
        const end = new Date(r.completedAt!).getTime();
        return (end - start) / 1000; // seconds
      })
      .sort((a, b) => a - b);

    if (times.length === 0) {
      return { average: 0, median: 0, distribution: [] };
    }

    const average = times.reduce((sum, time) => sum + time, 0) / times.length;
    const median = times[Math.floor(times.length / 2)];
    
    // Create distribution buckets
    const maxTime = Math.max(...times);
    const buckets = 10;
    const bucketSize = maxTime / buckets;
    const distribution = Array(buckets).fill(0);
    
    times.forEach(time => {
      const bucket = Math.min(Math.floor(time / bucketSize), buckets - 1);
      distribution[bucket]++;
    });

    return { average, median, distribution };
  }

  private static analyzeDropOff(quiz: Quiz, results: Result[]): DropOffAnalysis[] {
    const steps = quiz.steps || [];
    
    return steps.map((step, index) => {
      const reachedStep = results.filter(r => r.answers.length > index);
      const completedStep = index < steps.length - 1 
        ? results.filter(r => r.answers.length > index + 1)
        : results.filter(r => r.completedAt);
      
      return {
        stepIndex: index,
        stepTitle: step.title || `Etapa ${index + 1}`,
        visitors: reachedStep.length,
        completed: completedStep.length,
        dropOffRate: reachedStep.length > 0 ? ((reachedStep.length - completedStep.length) / reachedStep.length) * 100 : 0
      };
    });
  }

  private static getAnswerDistribution(quiz: Quiz, results: Result[]): QuestionAnswerDistribution[] {
    const steps = quiz.steps || [];
    
    return steps.flatMap((step, stepIndex) => 
      (step.components || [])
        .filter(comp => comp.type === 'multiple_choice' || comp.type === 'rating')
        .map(comp => {
          const answers = results
            .flatMap(r => r.answers)
            .filter(a => a.questionId === comp.id);
          
          const answerCounts = new Map<string, number>();
          answers.forEach(answer => {
            const value = String(answer.value);
            answerCounts.set(value, (answerCounts.get(value) || 0) + 1);
          });
          
          const total = answers.length;
          
          return {
            questionId: comp.id,
            questionText: comp.properties?.title || 'Pergunta sem título',
            totalResponses: total,
            distribution: Array.from(answerCounts.entries()).map(([value, count]) => ({
              option: value,
              count,
              percentage: total > 0 ? (count / total) * 100 : 0
            })).sort((a, b) => b.count - a.count)
          };
        })
    );
  }
}

// Additional interfaces for quiz-specific analytics
export interface QuizAnalytics {
  quiz: Quiz;
  overview: {
    views: number;
    starts: number;
    completions: number;
    leads: number;
    averageScore: number;
    completionRate: number;
    leadConversionRate: number;
  };
  funnel: FunnelData[];
  timeSpent: {
    average: number;
    median: number;
    distribution: number[];
  };
  dropOffAnalysis: DropOffAnalysis[];
  answerDistribution: QuestionAnswerDistribution[];
  timeSeriesData: {
    views: TimeSeriesData[];
    starts: TimeSeriesData[];
    completions: TimeSeriesData[];
    leads: TimeSeriesData[];
  };
}

export interface DropOffAnalysis {
  stepIndex: number;
  stepTitle: string;
  visitors: number;
  completed: number;
  dropOffRate: number;
}

export interface QuestionAnswerDistribution {
  questionId: string;
  questionText: string;
  totalResponses: number;
  distribution: Array<{
    option: string;
    count: number;
    percentage: number;
  }>;
}

export interface ABTestResults {
  testId: string;
  quizId: string;
  variants: Array<{
    id: string;
    name: string;
    traffic: number;
    visitors: number;
    conversions: number;
    conversionRate: number;
    confidence: number;
  }>;
  winner: string;
  significance: number;
  status: 'running' | 'completed' | 'paused';
  startDate: string;
  endDate: string;
}