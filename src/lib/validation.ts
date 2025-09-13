import { z } from 'zod';

// Quiz validation schema
export const QuizSchema = z.object({
  id: z.string(),
  publicId: z.string(),
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  status: z.enum(['draft', 'published']),
  userId: z.string().optional(),
  questions: z.array(z.object({
    id: z.string(),
    idx: z.number(),
    type: z.enum(['single', 'multiple', 'nps', 'slider', 'phone', 'rating', 'email', 'short_text']),
    title: z.string().min(1, 'Título da pergunta é obrigatório'),
    description: z.string().optional(),
    options: z.array(z.object({
      id: z.string(),
      label: z.string(),
      score: z.number().optional()
    })).optional(),
    required: z.boolean().optional(),
    settings: z.record(z.any()).optional(),
    score_weight: z.number().optional()
  })),
  theme: z.object({
    primary: z.string().optional(),
    background: z.string().optional(),
    text: z.string().optional(),
    borderRadius: z.string().optional(),
    fontFamily: z.string().optional()
  }).optional(),
  outcomes: z.record(z.object({
    title: z.string(),
    description: z.string(),
    cta: z.object({
      label: z.string(),
      href: z.string()
    }).optional()
  })).optional(),
  settings: z.record(z.any()).optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

// Result validation schema
export const ResultSchema = z.object({
  id: z.string(),
  quizId: z.string(),
  userId: z.string().optional(),
  startedAt: z.string(),
  completedAt: z.string().optional(),
  score: z.number(),
  answers: z.array(z.object({
    questionId: z.string(),
    value: z.any()
  })),
  outcomeKey: z.string().optional(),
  utm: z.record(z.string()).optional(),
  meta: z.record(z.any()).optional()
});

// Validation helper functions
export const validateQuiz = (quiz: any) => {
  try {
    return QuizSchema.parse(quiz);
  } catch (error) {
    console.error('Quiz validation failed:', error);
    throw new Error('Dados do quiz inválidos');
  }
};

export const validateResult = (result: any) => {
  try {
    return ResultSchema.parse(result);
  } catch (error) {
    console.error('Result validation failed:', error);
    throw new Error('Dados do resultado inválidos');
  }
};

// Safe data retrieval helpers
export const safeGetQuizData = (data: any) => {
  if (!data) return null;
  
  // Provide safe defaults
  return {
    id: data.id || '',
    publicId: data.public_id || data.publicId || '',
    name: data.name || 'Quiz sem nome',
    description: data.description || '',
    status: data.status || 'draft',
    userId: data.user_id || data.userId,
    questions: Array.isArray(data.questions) ? data.questions : [],
    theme: data.theme || { primary: '#2563EB', background: '#FFFFFF', text: '#0B0B0B' },
    outcomes: data.outcomes || {},
    settings: data.settings || {},
    createdAt: data.created_at || data.createdAt || new Date().toISOString(),
    updatedAt: data.updated_at || data.updatedAt || new Date().toISOString()
  };
};

export const safeGetResultData = (data: any) => {
  if (!data) return null;
  
  return {
    id: data.id || '',
    quizId: data.quiz_id || data.quizId || '',
    userId: data.user_id || data.userId,
    startedAt: data.started_at || data.startedAt || new Date().toISOString(),
    completedAt: data.completed_at || data.completedAt,
    score: typeof data.score === 'number' ? data.score : 0,
    answers: Array.isArray(data.answers) ? data.answers : [],
    outcomeKey: data.outcome_key || data.outcomeKey,
    utm: data.utm || {},
    meta: data.meta || {}
  };
};