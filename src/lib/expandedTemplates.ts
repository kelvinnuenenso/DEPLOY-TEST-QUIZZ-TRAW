import { QuestionType, Question, QuizTheme } from '@/types/quiz';
import { 
  Target, Users, TrendingUp, Heart, Brain, Briefcase, 
  Zap, Star, Award, Gift, ShoppingCart, Gamepad2,
  BookOpen, GraduationCap, Stethoscope, Home, Car,
  Utensils, Plane, Music, Palette, Camera, Dumbbell,
  Coffee, Smartphone, Monitor, DollarSign, Building,
  UserCheck, MessageSquare, BarChart3, PieChart,
  Clock, Calendar, Shield, Settings, Lightbulb,
  Rocket, Trophy, Gem, Crown, Flame, Sun, Moon
} from 'lucide-react';

interface Outcome {
  title: string;
  description: string;
  cta?: { label: string; href: string };
}

export interface ExpandedQuizTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  estimatedTime: string;
  tags: string[];
  useCase: string;
  targetAudience: string;
  questions: Question[];
  outcomes: Record<string, Outcome>;
  theme: QuizTheme;
  isPopular?: boolean;
  isPremium?: boolean;
}

export const expandedTemplates: ExpandedQuizTemplate[] = [
  // MARKETING & VENDAS (15 templates)
  {
    id: 'lead-gen-basic',
    name: 'Captação de Leads Básica',
    description: 'Template simples para capturar leads qualificados',
    category: 'Marketing',
    subcategory: 'Lead Generation',
    icon: Users,
    difficulty: 'Iniciante',
    estimatedTime: '2-3 min',
    tags: ['leads', 'captação', 'marketing'],
    useCase: 'Capturar informações de prospects interessados',
    targetAudience: 'Empresas B2B e B2C',
    isPopular: true,
    questions: [
      {
        id: '1',
        idx: 1,
        type: 'single' as QuestionType,
        title: 'Qual seu principal desafio atualmente?',
        options: [
          { id: '1', label: 'Gerar mais leads qualificados', score: 10 },
          { id: '2', label: 'Aumentar as vendas', score: 15 },
          { id: '3', label: 'Melhorar processos', score: 8 }
        ]
      }
    ],
    outcomes: {
      qualified: {
        title: 'Lead Qualificado! 🎯',
        description: 'Você tem potencial para nossos serviços.',
        cta: { label: 'Falar com Especialista', href: '#' }
      }
    },
    theme: {
      primary: '#2563EB',
      background: '#FFFFFF',
      text: '#0B0B0B',
      cardBackground: '#FFFFFF',
      borderRadius: '12px',
      fontFamily: 'Inter, sans-serif'
    }
  },
  {
    id: 'sales-qualification',
    name: 'Qualificação de Vendas Avançada',
    description: 'Qualifique prospects com base em BANT (Budget, Authority, Need, Timeline)',
    category: 'Marketing',
    subcategory: 'Sales Qualification',
    icon: Target,
    difficulty: 'Avançado',
    estimatedTime: '5-7 min',
    tags: ['vendas', 'qualificação', 'BANT', 'prospects'],
    useCase: 'Identificar prospects prontos para comprar',
    targetAudience: 'Equipes de vendas B2B',
    isPremium: true,
    questions: [
      {
        id: '1',
        idx: 1,
        type: 'single' as QuestionType,
        title: 'Qual seu orçamento para esta solução?',
        options: [
          { id: '1', label: 'Menos de R$ 10k', score: 5 },
          { id: '2', label: 'R$ 10k - R$ 50k', score: 15 },
          { id: '3', label: 'R$ 50k - R$ 100k', score: 20 },
          { id: '4', label: 'Mais de R$ 100k', score: 25 }
        ]
      }
    ],
    outcomes: {
      hot: {
        title: 'Prospect Quente! 🔥',
        description: 'Você atende todos os critérios para uma conversa.',
        cta: { label: 'Agendar Reunião', href: '#' }
      }
    },
    theme: {
      primary: '#DC2626',
      background: '#FEF2F2',
      text: '#7F1D1D',
      gradient: true
    }
  },
  {
    id: 'customer-satisfaction',
    name: 'Pesquisa de Satisfação NPS',
    description: 'Meça a satisfação e lealdade dos seus clientes',
    category: 'Marketing',
    subcategory: 'Customer Research',
    icon: Heart,
    difficulty: 'Intermediário',
    estimatedTime: '3-4 min',
    tags: ['NPS', 'satisfação', 'clientes', 'feedback'],
    useCase: 'Medir satisfação e identificar promotores',
    targetAudience: 'Empresas com base de clientes',
    isPopular: true,
    questions: [
      {
        id: '1',
        idx: 1,
        type: 'nps' as QuestionType,
        title: 'Qual a probabilidade de você nos recomendar?',
        description: 'De 0 a 10, sendo 0 "nunca" e 10 "com certeza"'
      }
    ],
    outcomes: {
      promoter: {
        title: 'Você é um Promotor! 🌟',
        description: 'Obrigado pela confiança!',
        cta: { label: 'Programa de Indicações', href: '#' }
      }
    },
    theme: {
      primary: '#059669',
      background: '#F0FDF4',
      text: '#064E3B'
    }
  },
  {
    id: 'product-launch',
    name: 'Feedback de Lançamento de Produto',
    description: 'Colete feedback sobre novos produtos ou features',
    category: 'Marketing',
    subcategory: 'Product Research',
    icon: Rocket,
    difficulty: 'Intermediário',
    estimatedTime: '4-5 min',
    tags: ['produto', 'lançamento', 'feedback', 'market-fit'],
    useCase: 'Validar aceitação de novos produtos',
    targetAudience: 'Startups e empresas inovadoras',
    questions: [
      {
        id: '1',
        idx: 1,
        type: 'rating' as QuestionType,
        title: 'Como você avalia este produto?',
        description: 'Considere utilidade, design e preço'
      }
    ],
    outcomes: {
      success: {
        title: 'Produto Validado! ✅',
        description: 'Seu feedback foi muito positivo.',
        cta: { label: 'Seja um Early Adopter', href: '#' }
      }
    },
    theme: {
      primary: '#7C3AED',
      background: '#FAF5FF',
      text: '#581C87'
    }
  },
  {
    id: 'competitor-analysis',
    name: 'Análise Competitiva',
    description: 'Entenda como você se posiciona vs. concorrência',
    category: 'Marketing',
    subcategory: 'Market Research',
    icon: BarChart3,
    difficulty: 'Avançado',
    estimatedTime: '6-8 min',
    tags: ['concorrência', 'posicionamento', 'mercado'],
    useCase: 'Mapear landscape competitivo',
    targetAudience: 'Empresas em mercados competitivos',
    isPremium: true,
    questions: [
      {
        id: '1',
        idx: 1,
        type: 'multiple' as QuestionType,
        title: 'Quais concorrentes você considera?',
        options: [
          { id: '1', label: 'Concorrente A', score: 10 },
          { id: '2', label: 'Concorrente B', score: 8 },
          { id: '3', label: 'Concorrente C', score: 6 }
        ]
      }
    ],
    outcomes: {
      leader: {
        title: 'Você é Líder de Mercado! 👑',
        description: 'Sua posição competitiva é forte.',
        cta: { label: 'Estratégia de Crescimento', href: '#' }
      }
    },
    theme: {
      primary: '#EA580C',
      background: '#FFF7ED',
      text: '#9A3412'
    }
  },

  // EDUCAÇÃO & TREINAMENTO (10 templates)
  {
    id: 'skill-assessment',
    name: 'Avaliação de Competências',
    description: 'Avalie conhecimentos e habilidades técnicas',
    category: 'Educação',
    subcategory: 'Assessment',
    icon: GraduationCap,
    difficulty: 'Intermediário',
    estimatedTime: '8-10 min',
    tags: ['competências', 'avaliação', 'skills', 'treinamento'],
    useCase: 'Identificar gaps de conhecimento',
    targetAudience: 'RH e instituições de ensino',
    isPopular: true,
    questions: [
      {
        id: '1',
        idx: 1,
        type: 'single' as QuestionType,
        title: 'Qual seu nível em JavaScript?',
        options: [
          { id: '1', label: 'Iniciante', score: 5 },
          { id: '2', label: 'Intermediário', score: 10 },
          { id: '3', label: 'Avançado', score: 15 },
          { id: '4', label: 'Expert', score: 20 }
        ]
      }
    ],
    outcomes: {
      beginner: {
        title: 'Perfil Iniciante 📚',
        description: 'Recomendamos nosso curso básico.',
        cta: { label: 'Ver Cursos', href: '#' }
      }
    },
    theme: {
      primary: '#1D4ED8',
      background: '#EFF6FF',
      text: '#1E3A8A'
    }
  },
  {
    id: 'learning-style',
    name: 'Estilo de Aprendizagem',
    description: 'Descubra como você aprende melhor',
    category: 'Educação',
    subcategory: 'Learning',
    icon: Brain,
    difficulty: 'Iniciante',
    estimatedTime: '5-6 min',
    tags: ['aprendizagem', 'estilo', 'educação', 'personalidade'],
    useCase: 'Personalizar experiência educacional',
    targetAudience: 'Estudantes e educadores',
    questions: [
      {
        id: '1',
        idx: 1,
        type: 'single' as QuestionType,
        title: 'Como você prefere aprender?',
        options: [
          { id: '1', label: 'Lendo textos', score: 10 },
          { id: '2', label: 'Vendo vídeos', score: 15 },
          { id: '3', label: 'Praticando', score: 20 }
        ]
      }
    ],
    outcomes: {
      visual: {
        title: 'Aprendiz Visual! 👁️',
        description: 'Você aprende melhor com recursos visuais.',
        cta: { label: 'Cursos Visuais', href: '#' }
      }
    },
    theme: {
      primary: '#8B5CF6',
      background: '#F3F4F6',
      text: '#374151'
    }
  },

  // SAÚDE & BEM-ESTAR (8 templates)
  {
    id: 'health-assessment',
    name: 'Avaliação de Saúde Geral',
    description: 'Questionário básico sobre hábitos de saúde',
    category: 'Saúde',
    subcategory: 'Wellness',
    icon: Stethoscope,
    difficulty: 'Iniciante',
    estimatedTime: '4-5 min',
    tags: ['saúde', 'bem-estar', 'hábitos', 'lifestyle'],
    useCase: 'Avaliar estado geral de saúde',
    targetAudience: 'Profissionais de saúde e wellness',
    questions: [
      {
        id: '1',
        idx: 1,
        type: 'slider' as QuestionType,
        title: 'Quantas horas você dorme por noite?',
        settings: { min: 4, max: 12, step: 0.5 }
      }
    ],
    outcomes: {
      healthy: {
        title: 'Saúde em Dia! 💚',
        description: 'Você mantém bons hábitos de saúde.',
        cta: { label: 'Dicas Avançadas', href: '#' }
      }
    },
    theme: {
      primary: '#10B981',
      background: '#ECFDF5',
      text: '#047857'
    }
  },
  {
    id: 'fitness-goals',
    name: 'Objetivos de Fitness',
    description: 'Descubra seu plano de treino ideal',
    category: 'Saúde',
    subcategory: 'Fitness',
    icon: Dumbbell,
    difficulty: 'Intermediário',
    estimatedTime: '6-7 min',
    tags: ['fitness', 'treino', 'objetivos', 'exercício'],
    useCase: 'Criar plano de treino personalizado',
    targetAudience: 'Personal trainers e academias',
    questions: [
      {
        id: '1',
        idx: 1,
        type: 'single' as QuestionType,
        title: 'Qual seu principal objetivo?',
        options: [
          { id: '1', label: 'Perder peso', score: 15 },
          { id: '2', label: 'Ganhar massa', score: 20 },
          { id: '3', label: 'Melhorar condicionamento', score: 10 }
        ]
      }
    ],
    outcomes: {
      weight_loss: {
        title: 'Foco na Queima de Gordura! 🔥',
        description: 'Plano personalizado para perda de peso.',
        cta: { label: 'Seu Plano de Treino', href: '#' }
      }
    },
    theme: {
      primary: '#F59E0B',
      background: '#FFFBEB',
      text: '#92400E'
    }
  },

  // E-COMMERCE & VENDAS ONLINE (12 templates)
  {
    id: 'product-recommendation',
    name: 'Recomendação de Produtos',
    description: 'Quiz interativo para recomendar produtos ideais',
    category: 'E-commerce',
    subcategory: 'Product Discovery',
    icon: ShoppingCart,
    difficulty: 'Intermediário',
    estimatedTime: '3-4 min',
    tags: ['e-commerce', 'produtos', 'recomendação', 'vendas'],
    useCase: 'Aumentar conversão com recomendações personalizadas',
    targetAudience: 'Lojas online e marketplaces',
    isPopular: true,
    questions: [
      {
        id: '1',
        idx: 1,
        type: 'single' as QuestionType,
        title: 'Qual seu estilo preferido?',
        options: [
          { id: '1', label: 'Casual', score: 10 },
          { id: '2', label: 'Elegante', score: 15 },
          { id: '3', label: 'Esportivo', score: 8 }
        ]
      }
    ],
    outcomes: {
      casual: {
        title: 'Estilo Casual Perfeito! 👕',
        description: 'Encontramos os produtos ideais para você.',
        cta: { label: 'Ver Produtos', href: '#' }
      }
    },
    theme: {
      primary: '#EC4899',
      background: '#FDF2F8',
      text: '#831843'
    }
  },
  {
    id: 'customer-journey',
    name: 'Jornada do Cliente',
    description: 'Mapear a experiência de compra do cliente',
    category: 'E-commerce',
    subcategory: 'Customer Experience',
    icon: Users,
    difficulty: 'Avançado',
    estimatedTime: '7-9 min',
    tags: ['jornada', 'experiência', 'cliente', 'UX'],
    useCase: 'Otimizar processo de compra',
    targetAudience: 'UX designers e gestores de e-commerce',
    isPremium: true,
    questions: [
      {
        id: '1',
        idx: 1,
        type: 'rating' as QuestionType,
        title: 'Como foi sua experiência de compra?',
        description: 'Avalie de 1 a 5 estrelas'
      }
    ],
    outcomes: {
      excellent: {
        title: 'Experiência Excepcional! ⭐',
        description: 'Sua jornada foi perfeita.',
        cta: { label: 'Programa de Fidelidade', href: '#' }
      }
    },
    theme: {
      primary: '#6366F1',
      background: '#F0F9FF',
      text: '#1E40AF'
    }
  },

  // RECURSOS HUMANOS (8 templates)
  {
    id: 'employee-engagement',
    name: 'Engajamento de Funcionários',
    description: 'Meça o nível de engajamento da equipe',
    category: 'RH',
    subcategory: 'Employee Experience',
    icon: UserCheck,
    difficulty: 'Intermediário',
    estimatedTime: '5-6 min',
    tags: ['engajamento', 'funcionários', 'RH', 'cultura'],
    useCase: 'Avaliar satisfação e engajamento interno',
    targetAudience: 'Departamentos de RH',
    questions: [
      {
        id: '1',
        idx: 1,
        type: 'nps' as QuestionType,
        title: 'Recomendaria nossa empresa como local de trabalho?',
        description: 'De 0 a 10'
      }
    ],
    outcomes: {
      engaged: {
        title: 'Equipe Engajada! 🎉',
        description: 'Sua equipe está muito satisfeita.',
        cta: { label: 'Programa de Reconhecimento', href: '#' }
      }
    },
    theme: {
      primary: '#0891B2',
      background: '#F0F9FF',
      text: '#0C4A6E'
    }
  },
  {
    id: 'recruitment-fit',
    name: 'Fit Cultural para Recrutamento',
    description: 'Avalie se candidatos se alinham com a cultura',
    category: 'RH',
    subcategory: 'Recruitment',
    icon: Building,
    difficulty: 'Avançado',
    estimatedTime: '8-10 min',
    tags: ['recrutamento', 'cultura', 'fit', 'candidatos'],
    useCase: 'Identificar candidatos alinhados culturalmente',
    targetAudience: 'Recrutadores e gestores de RH',
    isPremium: true,
    questions: [
      {
        id: '1',
        idx: 1,
        type: 'single' as QuestionType,
        title: 'Como você trabalha melhor?',
        options: [
          { id: '1', label: 'Em equipe', score: 15 },
          { id: '2', label: 'Individualmente', score: 10 },
          { id: '3', label: 'Híbrido', score: 12 }
        ]
      }
    ],
    outcomes: {
      great_fit: {
        title: 'Excelente Fit Cultural! 🎯',
        description: 'Você se alinha perfeitamente com nossa cultura.',
        cta: { label: 'Próximas Etapas', href: '#' }
      }
    },
    theme: {
      primary: '#7C2D12',
      background: '#FEF7F0',
      text: '#431407'
    }
  },

  // TECNOLOGIA & INOVAÇÃO (5 templates)
  {
    id: 'tech-stack',
    name: 'Avaliação de Stack Tecnológico',
    description: 'Descubra a stack ideal para seu projeto',
    category: 'Tecnologia',
    subcategory: 'Development',
    icon: Monitor,
    difficulty: 'Avançado',
    estimatedTime: '6-8 min',
    tags: ['tecnologia', 'stack', 'desenvolvimento', 'arquitetura'],
    useCase: 'Escolher tecnologias para projetos',
    targetAudience: 'Desenvolvedores e CTOs',
    isPremium: true,
    questions: [
      {
        id: '1',
        idx: 1,
        type: 'multiple' as QuestionType,
        title: 'Quais tecnologias você domina?',
        options: [
          { id: '1', label: 'React', score: 15 },
          { id: '2', label: 'Vue.js', score: 12 },
          { id: '3', label: 'Angular', score: 10 },
          { id: '4', label: 'Node.js', score: 18 }
        ]
      }
    ],
    outcomes: {
      modern_stack: {
        title: 'Stack Moderna! 🚀',
        description: 'Suas escolhas tecnológicas são atuais.',
        cta: { label: 'Consultoria Técnica', href: '#' }
      }
    },
    theme: {
      primary: '#059669',
      background: '#F0FDF4',
      text: '#064E3B'
    }
  },

  // PERSONALIDADE & COMPORTAMENTO (12 templates)
  {
    id: 'personality-disc',
    name: 'Teste DISC de Personalidade',
    description: 'Identifique seu perfil comportamental DISC',
    category: 'Personalidade',
    subcategory: 'Assessment',
    icon: Brain,
    difficulty: 'Intermediário',
    estimatedTime: '7-9 min',
    tags: ['personalidade', 'DISC', 'comportamento', 'profiling'],
    useCase: 'Entender estilos comportamentais',
    targetAudience: 'Coaches e consultores',
    isPopular: true,
    questions: [
      {
        id: '1',
        idx: 1,
        type: 'single' as QuestionType,
        title: 'Em situações de pressão, você:',
        options: [
          { id: '1', label: 'Toma decisões rápidas', score: 15 },
          { id: '2', label: 'Busca apoio da equipe', score: 10 },
          { id: '3', label: 'Analisa todas as opções', score: 8 },
          { id: '4', label: 'Mantém a calma', score: 12 }
        ]
      }
    ],
    outcomes: {
      dominance: {
        title: 'Perfil Dominância! 💪',
        description: 'Você é orientado a resultados e liderança.',
        cta: { label: 'Relatório Completo', href: '#' }
      }
    },
    theme: {
      primary: '#DC2626',
      background: '#FEF2F2',
      text: '#7F1D1D'
    }
  }
];

export const templateCategories = [
  { id: 'all', name: 'Todos os Templates', count: expandedTemplates.length },
  { id: 'Marketing', name: 'Marketing & Vendas', count: expandedTemplates.filter(t => t.category === 'Marketing').length },
  { id: 'Educação', name: 'Educação & Treinamento', count: expandedTemplates.filter(t => t.category === 'Educação').length },
  { id: 'Saúde', name: 'Saúde & Bem-estar', count: expandedTemplates.filter(t => t.category === 'Saúde').length },
  { id: 'E-commerce', name: 'E-commerce & Vendas Online', count: expandedTemplates.filter(t => t.category === 'E-commerce').length },
  { id: 'RH', name: 'Recursos Humanos', count: expandedTemplates.filter(t => t.category === 'RH').length },
  { id: 'Tecnologia', name: 'Tecnologia & Inovação', count: expandedTemplates.filter(t => t.category === 'Tecnologia').length },
  { id: 'Personalidade', name: 'Personalidade & Comportamento', count: expandedTemplates.filter(t => t.category === 'Personalidade').length }
];

export const getTemplatesByCategory = (category: string) => {
  if (category === 'all') return expandedTemplates;
  return expandedTemplates.filter(t => t.category === category);
};

export const getPopularTemplates = () => {
  return expandedTemplates.filter(t => t.isPopular);
};

export const getPremiumTemplates = () => {
  return expandedTemplates.filter(t => t.isPremium);
};

export const searchTemplates = (query: string) => {
  const lowerQuery = query.toLowerCase();
  return expandedTemplates.filter(t => 
    t.name.toLowerCase().includes(lowerQuery) ||
    t.description.toLowerCase().includes(lowerQuery) ||
    t.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
    t.category.toLowerCase().includes(lowerQuery)
  );
};