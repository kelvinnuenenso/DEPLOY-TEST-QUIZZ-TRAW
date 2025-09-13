import { Quiz, Result, Lead } from '@/types/quiz';

const KEY = 'elevado-quizz:test';

interface TestDatabase {
  quizzes: Quiz[];
  results: Result[];
  leads: Lead[];
}

function getDB(): TestDatabase {
  if (typeof window === 'undefined') {
    return { quizzes: [], results: [], leads: [] };
  }
  
  try {
    const data = localStorage.getItem(KEY);
    return data ? JSON.parse(data) : { quizzes: [], results: [], leads: [] };
  } catch {
    return { quizzes: [], results: [], leads: [] };
  }
}

function setDB(db: TestDatabase): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEY, JSON.stringify(db));
  }
}

export const TestDB = {
  reset(): void {
    setDB({ quizzes: [], results: [], leads: [] });
  },

  all(): TestDatabase {
    return getDB();
  },

  listQuizzes(): Quiz[] {
    return getDB().quizzes;
  },

  getQuiz(id: string): Quiz | undefined {
    return getDB().quizzes.find(q => q.id === id);
  },

  getQuizByPublicId(publicId: string): Quiz | undefined {
    return getDB().quizzes.find(q => q.publicId === publicId);
  },

  upsertQuiz(quiz: Quiz): Quiz {
    const db = getDB();
    const index = db.quizzes.findIndex(q => q.id === quiz.id);
    
    if (index >= 0) {
      db.quizzes[index] = quiz;
    } else {
      db.quizzes.push(quiz);
    }
    
    setDB(db);
    return quiz;
  },

  deleteQuiz(id: string): void {
    const db = getDB();
    db.quizzes = db.quizzes.filter(q => q.id !== id);
    setDB(db);
  },

  addResult(result: Result): void {
    const db = getDB();
    db.results.push(result);
    setDB(db);
  },

  getResult(id: string): Result | undefined {
    return getDB().results.find(r => r.id === id);
  },

  addLead(lead: Lead): void {
    const db = getDB();
    db.leads.push(lead);
    setDB(db);
  },

  listLeads(): Lead[] {
    return getDB().leads;
  },

  getQuizStats(quizId: string) {
    const db = getDB();
    const results = db.results.filter(r => r.quizId === quizId);
    const leads = db.leads.filter(l => l.quizId === quizId);
    
    return {
      totalStarts: results.length,
      totalCompletes: results.filter(r => r.completedAt).length,
      totalLeads: leads.length,
      conversionRate: results.length > 0 ? 
        (results.filter(r => r.completedAt).length / results.length) * 100 : 0
    };
  }
};