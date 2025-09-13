import { Quiz, Result, Lead, QuizTheme } from '@/types/quiz';

// Demo User Profiles
export const DEMO_USERS = [
  {
    id: 'demo-user-1',
    name: 'João Silva',
    email: 'joao@exemplo.com',
    plan: 'free' as const,
    company: 'Silva Consultoria',
    industry: 'Consultoria',
    experience: 'intermediate',
    goals: ['lead_generation', 'customer_insights', 'market_research']
  },
  {
    id: 'demo-user-2', 
    name: 'Maria Santos',
    email: 'maria@exemplo.com',
    plan: 'pro' as const,
    company: 'Santos Marketing',
    industry: 'Marketing Digital',
    experience: 'expert',
    goals: ['lead_generation', 'sales_funnel', 'customer_engagement']
  },
  {
    id: 'demo-user-3',
    name: 'Pedro Costa',
    email: 'pedro@exemplo.com', 
    plan: 'premium' as const,
    company: 'Costa Educação',
    industry: 'Educação',
    experience: 'beginner',
    goals: ['employee_training', 'customer_feedback', 'assessment']
  }
];

// Premium Themes
export const DEMO_THEMES: Record<string, QuizTheme> = {
  corporate: {
    primary: 'hsl(217, 91%, 46%)',
    background: 'hsl(0, 0%, 100%)',
    text: 'hsl(0, 0%, 4%)',
    accent: 'hsl(217, 91%, 56%)',
    cardBackground: 'hsl(0, 0%, 100%)',
    borderRadius: '12px',
    fontFamily: 'Inter',
    fontSize: '16px',
    buttonStyle: 'rounded',
    maxWidth: '600px',
    gradient: false,
    showProgress: true,
    showQuestionNumbers: true,
    centerAlign: true
  },
  modern: {
    primary: 'hsl(271, 76%, 53%)',
    background: 'linear-gradient(135deg, hsl(271, 76%, 53%), hsl(292, 84%, 61%))',
    text: 'hsl(0, 0%, 100%)',
    accent: 'hsl(292, 84%, 61%)',
    cardBackground: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
    fontFamily: 'Poppins',
    fontSize: '18px',
    buttonStyle: 'pill',
    maxWidth: '500px',
    gradient: true,
    showProgress: true,
    showQuestionNumbers: false,
    centerAlign: true
  },
  minimalist: {
    primary: 'hsl(0, 0%, 20%)',
    background: 'hsl(0, 0%, 98%)',
    text: 'hsl(0, 0%, 20%)',
    accent: 'hsl(0, 0%, 40%)',
    cardBackground: 'hsl(0, 0%, 100%)',
    borderRadius: '4px',
    fontFamily: 'Roboto',
    fontSize: '16px',
    buttonStyle: 'square',
    maxWidth: '700px',
    gradient: false,
    showProgress: false,
    showQuestionNumbers: true,
    centerAlign: false
  },
  healthcare: {
    primary: 'hsl(195, 100%, 39%)',
    background: 'hsl(195, 100%, 95%)',
    text: 'hsl(0, 0%, 20%)',
    accent: 'hsl(195, 100%, 50%)',
    cardBackground: 'hsl(0, 0%, 100%)',
    borderRadius: '8px',
    fontFamily: 'Open Sans',
    fontSize: '16px',
    buttonStyle: 'rounded',
    maxWidth: '600px',
    gradient: false,
    showProgress: true,
    showQuestionNumbers: true,
    centerAlign: true
  },
  finance: {
    primary: 'hsl(142, 76%, 36%)',
    background: 'hsl(0, 0%, 100%)',
    text: 'hsl(0, 0%, 4%)',
    accent: 'hsl(142, 76%, 46%)',
    cardBackground: 'hsl(142, 76%, 98%)',
    borderRadius: '6px',
    fontFamily: 'Montserrat',
    fontSize: '16px',
    buttonStyle: 'rounded',
    maxWidth: '650px',
    gradient: false,
    showProgress: true,
    showQuestionNumbers: true,
    centerAlign: true
  }
};

// Demo Quizzes with realistic data
export const DEMO_QUIZZES: Quiz[] = [
  {
    id: 'demo-quiz-1',
    publicId: 'demo',
    name: 'Diagnóstico de Marketing Digital',
    description: 'Descubra o nível de maturidade digital da sua empresa em 5 minutos',
    status: 'published',
    theme: DEMO_THEMES.corporate,
    settings: {
      collectEmail: true,
      requireAllQuestions: false,
      showProgressBar: true,
      allowBackNavigation: true,
      shuffleQuestions: false,
      timeLimit: null,
      redirectUrl: null,
      thankYouMessage: 'Obrigado! Receba seu diagnóstico personalizado no WhatsApp.',
      socialShare: true,
      pixelTracking: true
    },
    questions: [
      {
        id: 'q1',
        idx: 0,
        type: 'single',
        title: 'Qual o tamanho da sua empresa?',
        description: 'Nos ajude a personalizar suas recomendações',
        options: [
          { id: 'opt1', label: 'Freelancer/MEI', value: 'freelancer', score: 1 },
          { id: 'opt2', label: '2-10 funcionários', value: 'small', score: 2 },
          { id: 'opt3', label: '11-50 funcionários', value: 'medium', score: 3 },
          { id: 'opt4', label: 'Mais de 50 funcionários', value: 'large', score: 4 }
        ],
        required: true,
        score_weight: 1
      },
      {
        id: 'q2',
        idx: 1,
        type: 'multiple',
        title: 'Quais canais digitais sua empresa utiliza atualmente?',
        description: 'Selecione todos que se aplicam',
        options: [
          { id: 'opt1', label: 'Website próprio', value: 'website', score: 2 },
          { id: 'opt2', label: 'Redes sociais', value: 'social', score: 2 },
          { id: 'opt3', label: 'E-mail marketing', value: 'email', score: 3 },
          { id: 'opt4', label: 'Google Ads', value: 'ads', score: 4 },
          { id: 'opt5', label: 'SEO/Blog', value: 'seo', score: 4 },
          { id: 'opt6', label: 'Automação de marketing', value: 'automation', score: 5 }
        ],
        required: true,
        score_weight: 2
      },
      {
        id: 'q3',
        idx: 2,
        type: 'rating',
        title: 'Como você avalia seus resultados em marketing digital?',
        description: 'Sendo 1 muito insatisfeito e 5 muito satisfeito',
        options: [
          { id: 'r1', label: '1', value: '1', score: 1 },
          { id: 'r2', label: '2', value: '2', score: 2 },
          { id: 'r3', label: '3', value: '3', score: 3 },
          { id: 'r4', label: '4', value: '4', score: 4 },
          { id: 'r5', label: '5', value: '5', score: 5 }
        ],
        required: true,
        score_weight: 1.5
      },
      {
        id: 'q4',
        idx: 3,
        type: 'email',
        title: 'Qual seu melhor e-mail para receber o diagnóstico?',
        description: 'Vamos enviar um relatório personalizado com recomendações específicas',
        required: true
      },
      {
        id: 'q5',
        idx: 4,
        type: 'phone',
        title: 'WhatsApp para receber seu diagnóstico personalizado',
        description: 'Opcional: Receba dicas exclusivas e acompanhamento personalizado',
        required: false
      }
    ],
    outcomes: {
      beginner: {
        title: 'Iniciante Digital',
        description: 'Sua empresa está começando a jornada digital. Há muito potencial para crescimento! Vamos te ajudar a dar os primeiros passos importantes.',
        cta: {
          label: 'Receber plano de ação personalizado',
          href: 'https://wa.me/5511999999999?text=Oi! Recebi meu diagnóstico como Iniciante Digital e gostaria de saber mais sobre o plano de ação.'
        },
        scoreRange: { min: 0, max: 8 },
        color: 'hsl(39, 100%, 57%)',
        icon: '🌱'
      },
      intermediate: {
        title: 'Intermediário Digital',
        description: 'Você já tem uma base sólida! Com algumas otimizações estratégicas, pode alcançar resultados ainda melhores.',
        cta: {
          label: 'Otimizar minha estratégia atual',
          href: 'https://wa.me/5511999999999?text=Oi! Recebi meu diagnóstico como Intermediário Digital. Quero otimizar minha estratégia atual.'
        },
        scoreRange: { min: 9, max: 16 },
        color: 'hsl(45, 100%, 51%)',
        icon: '📈'
      },
      advanced: {
        title: 'Avançado Digital',
        description: 'Parabéns! Sua estratégia digital está bem estruturada. Vamos focar em growth hacking e expansão.',
        cta: {
          label: 'Acelerar meu crescimento',
          href: 'https://wa.me/5511999999999?text=Oi! Recebi meu diagnóstico como Avançado Digital. Quero acelerar ainda mais meu crescimento.'
        },
        scoreRange: { min: 17, max: 25 },
        color: 'hsl(142, 76%, 36%)',
        icon: '🚀'
      }
    },
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z'
  },
  {
    id: 'demo-quiz-2',
    publicId: 'fitness-assessment',
    name: 'Avaliação de Fitness Personalizada',
    description: 'Descubra seu plano de treino ideal baseado no seu perfil e objetivos',
    status: 'published',
    theme: DEMO_THEMES.modern,
    questions: [
      {
        id: 'q1',
        idx: 0,
        type: 'single',
        title: 'Qual seu principal objetivo?',
        options: [
          { id: 'opt1', label: 'Perder peso', value: 'weight_loss', score: 1 },
          { id: 'opt2', label: 'Ganhar massa muscular', value: 'muscle_gain', score: 2 },
          { id: 'opt3', label: 'Melhorar condicionamento', value: 'cardio', score: 3 },
          { id: 'opt4', label: 'Manter-se ativo', value: 'maintenance', score: 4 }
        ],
        required: true
      },
      {
        id: 'q2',
        idx: 1,
        type: 'single',
        title: 'Qual seu nível de experiência?',
        options: [
          { id: 'opt1', label: 'Iniciante (0-6 meses)', value: 'beginner', score: 1 },
          { id: 'opt2', label: 'Intermediário (6m-2 anos)', value: 'intermediate', score: 2 },
          { id: 'opt3', label: 'Avançado (2+ anos)', value: 'advanced', score: 3 }
        ],
        required: true
      }
    ],
    outcomes: {
      beginner_loss: {
        title: 'Plano Iniciante - Emagrecimento',
        description: 'Treino funcional 3x/semana + cardio leve + orientação nutricional',
        cta: {
          label: 'Começar meu plano agora',
          href: 'https://wa.me/5511999999999?text=Quero começar o Plano Iniciante de Emagrecimento!'
        },
        color: 'hsl(271, 76%, 53%)',
        icon: '💪'
      }
    },
    createdAt: '2024-01-08T09:15:00Z',
    updatedAt: '2024-01-12T16:45:00Z'
  },
  {
    id: 'demo-quiz-3',
    publicId: 'business-health-check',
    name: 'Check-up Empresarial Completo',
    description: 'Análise 360° da saúde do seu negócio em 15 perguntas estratégicas',
    status: 'draft',
    theme: DEMO_THEMES.finance,
    questions: [
      {
        id: 'q1',
        idx: 0,
        type: 'nps',
        title: 'O quanto você recomendaria sua empresa para um amigo trabalhar?',
        description: 'Sendo 0 "nunca recomendaria" e 10 "definitivamente recomendaria"',
        required: true
      }
    ],
    outcomes: {},
    createdAt: '2024-01-20T11:30:00Z',
    updatedAt: '2024-01-20T11:30:00Z'
  },
  
  // === QUIZZES DE TESTE PARA FUNCIONALIDADES ===
  {
    id: 'test-quiz-progress-linear',
    publicId: 'test-progress-linear',
    name: '🧪 Teste: Barra de Progresso Linear',
    description: 'Quiz para testar a funcionalidade de barra de progresso fake linear com diferentes configurações',
    status: 'draft',
    theme: {
      ...DEMO_THEMES.modern,
      fakeProgress: true,
      fakeProgressStyle: 'linear',
      fakeProgressSpeed: 'normal',
      fakeProgressBehavior: 'smooth',
      fakeProgressStartPercent: 15,
      fakeProgressEndPercent: 85,
      fakeProgressAutoAdvance: false
    },
    questions: [
      {
        id: 'test-q1',
        idx: 0,
        type: 'single',
        title: '🎯 Primeira pergunta - Observe a barra de progresso',
        description: 'A barra deve começar em 15% e progredir suavemente. Teste diferentes velocidades na aba Tema.',
        options: [
          { id: 'opt1', label: 'Velocidade Lenta', value: 'slow', score: 1 },
          { id: 'opt2', label: 'Velocidade Normal', value: 'normal', score: 2 },
          { id: 'opt3', label: 'Velocidade Rápida', value: 'fast', score: 3 }
        ],
        required: true
      },
      {
        id: 'test-q2',
        idx: 1,
        type: 'multiple',
        title: '⚡ Segunda pergunta - Teste comportamentos',
        description: 'Mude o comportamento da barra para "Realístico" ou "Saltitante" na configuração do tema',
        options: [
          { id: 'opt1', label: 'Suave (Smooth)', value: 'smooth', score: 2 },
          { id: 'opt2', label: 'Saltitante (Jumpy)', value: 'jumpy', score: 2 },
          { id: 'opt3', label: 'Realístico (Realistic)', value: 'realistic', score: 3 }
        ],
        required: true
      },
      {
        id: 'test-q3',
        idx: 2,
        type: 'rating',
        title: '📊 Terceira pergunta - Teste final',
        description: 'A barra deve estar próxima de 85% agora. Active "Avançar automaticamente" para testar.',
        options: [
          { id: 'r1', label: '1', value: '1', score: 1 },
          { id: 'r2', label: '2', value: '2', score: 2 },
          { id: 'r3', label: '3', value: '3', score: 3 },
          { id: 'r4', label: '4', value: '4', score: 4 },
          { id: 'r5', label: '5', value: '5', score: 5 }
        ],
        required: true
      }
    ],
    outcomes: {
      test_complete: {
        title: '✅ Teste de Progresso Linear Concluído',
        description: 'A barra de progresso linear foi testada com sucesso! Agora teste outros estilos.',
        cta: {
          label: 'Testar próximo estilo',
          href: '#'
        },
        color: 'hsl(142, 76%, 36%)',
        icon: '🎉'
      }
    },
    createdAt: '2024-01-25T10:00:00Z',
    updatedAt: '2024-01-25T10:00:00Z'
  },

  {
    id: 'test-quiz-progress-stepped',
    publicId: 'test-progress-stepped',
    name: '🧪 Teste: Barra de Progresso em Etapas',
    description: 'Quiz para testar a funcionalidade de barra de progresso fake em formato de etapas numeradas',
    status: 'draft',
    theme: {
      ...DEMO_THEMES.corporate,
      fakeProgress: true,
      fakeProgressStyle: 'stepped',
      fakeProgressSpeed: 'fast',
      fakeProgressBehavior: 'jumpy',
      fakeProgressStartPercent: 20,
      fakeProgressEndPercent: 90,
      fakeProgressAutoAdvance: true
    },
    questions: [
      {
        id: 'step-q1',
        idx: 0,
        type: 'single',
        title: '1️⃣ Etapa 1 - Progresso em Degraus',
        description: 'Observe como a barra progride em etapas numeradas. Cada etapa deve ser preenchida conforme avança.',
        options: [
          { id: 'opt1', label: 'Etapas são muito úteis', value: 'useful', score: 3 },
          { id: 'opt2', label: 'Prefiro barra linear', value: 'linear', score: 2 },
          { id: 'opt3', label: 'Depende do contexto', value: 'context', score: 4 }
        ],
        required: true
      },
      {
        id: 'step-q2',
        idx: 1,
        type: 'single',
        title: '2️⃣ Etapa 2 - Velocidade Rápida',
        description: 'Com velocidade rápida, as etapas se preenchem mais rapidamente. Teste mudando para "lenta".',
        options: [
          { id: 'opt1', label: 'Velocidade rápida é boa', value: 'fast_good', score: 3 },
          { id: 'opt2', label: 'Muito rápido', value: 'too_fast', score: 1 },
          { id: 'opt3', label: 'Ideal para este tipo', value: 'perfect', score: 5 }
        ],
        required: true
      },
      {
        id: 'step-q3',
        idx: 2,
        type: 'single',
        title: '3️⃣ Etapa 3 - Avanço Automático',
        description: 'Esta pergunta deve avançar automaticamente após ser respondida. Observe!',
        options: [
          { id: 'opt1', label: 'Avanço automático funciona', value: 'auto_works', score: 5 },
          { id: 'opt2', label: 'Prefiro controle manual', value: 'manual', score: 3 },
          { id: 'opt3', label: 'Depende da situação', value: 'situational', score: 4 }
        ],
        required: true
      },
      {
        id: 'step-q4',
        idx: 3,
        type: 'single',
        title: '4️⃣ Etapa 4 - Comportamento Saltitante',
        description: 'O comportamento "saltitante" faz o progresso pular. Teste mudando para "suave".',
        options: [
          { id: 'opt1', label: 'Saltitante é interessante', value: 'jumpy_cool', score: 3 },
          { id: 'opt2', label: 'Prefiro suave', value: 'smooth_better', score: 4 },
          { id: 'opt3', label: 'Ambos têm seu lugar', value: 'both_good', score: 5 }
        ],
        required: true
      },
      {
        id: 'step-q5',
        idx: 4,
        type: 'rating',
        title: '5️⃣ Etapa Final - Avaliação Geral',
        description: 'Como você avalia a experiência com progresso em etapas? (Todas as etapas devem estar preenchidas)',
        options: [
          { id: 'r1', label: '1 - Ruim', value: '1', score: 1 },
          { id: 'r2', label: '2 - Regular', value: '2', score: 2 },
          { id: 'r3', label: '3 - Bom', value: '3', score: 3 },
          { id: 'r4', label: '4 - Ótimo', value: '4', score: 4 },
          { id: 'r5', label: '5 - Excelente', value: '5', score: 5 }
        ],
        required: true
      }
    ],
    outcomes: {
      stepped_success: {
        title: '🎯 Progresso em Etapas Testado!',
        description: 'Você testou com sucesso todas as funcionalidades do progresso em etapas!',
        cta: {
          label: 'Testar progresso circular',
          href: '#'
        },
        color: 'hsl(217, 91%, 46%)',
        icon: '📊'
      }
    },
    createdAt: '2024-01-25T11:00:00Z',
    updatedAt: '2024-01-25T11:00:00Z'
  },

  {
    id: 'test-quiz-progress-circular',
    publicId: 'test-progress-circular',
    name: '🧪 Teste: Barra de Progresso Circular',
    description: 'Quiz para testar a funcionalidade de barra de progresso fake em formato circular com porcentagem',
    status: 'draft',
    theme: {
      ...DEMO_THEMES.minimalist,
      fakeProgress: true,
      fakeProgressStyle: 'circular',
      fakeProgressSpeed: 'slow',
      fakeProgressBehavior: 'realistic',
      fakeProgressStartPercent: 5,
      fakeProgressEndPercent: 95,
      fakeProgressAutoAdvance: false
    },
    questions: [
      {
        id: 'circ-q1',
        idx: 0,
        type: 'single',
        title: '🔄 Progresso Circular - Início',
        description: 'O progresso circular mostra porcentagem no centro. Observe como inicia em 5% e progride.',
        options: [
          { id: 'opt1', label: 'Visual muito elegante', value: 'elegant', score: 5 },
          { id: 'opt2', label: 'Prefiro linear', value: 'linear_pref', score: 2 },
          { id: 'opt3', label: 'Bom para certas situações', value: 'contextual', score: 4 }
        ],
        required: true
      },
      {
        id: 'circ-q2',
        idx: 1,
        type: 'multiple',
        title: '⚙️ Configurações do Circular',
        description: 'Teste mudando a velocidade para "normal" ou "rápida". O comportamento "realístico" adiciona variação.',
        options: [
          { id: 'opt1', label: 'Velocidade lenta é suave', value: 'slow_smooth', score: 3 },
          { id: 'opt2', label: 'Normal seria melhor', value: 'normal_better', score: 3 },
          { id: 'opt3', label: 'Rápido para eficiência', value: 'fast_efficient', score: 4 },
          { id: 'opt4', label: 'Realístico é interessante', value: 'realistic_cool', score: 5 }
        ],
        required: true
      },
      {
        id: 'circ-q3',
        idx: 2,
        type: 'rating',
        title: '📈 Progresso Médio',
        description: 'A porcentagem deve estar entre 40-60%. O efeito realístico pode fazer variar ligeiramente.',
        options: [
          { id: 'r1', label: '⭐', value: '1', score: 1 },
          { id: 'r2', label: '⭐⭐', value: '2', score: 2 },
          { id: 'r3', label: '⭐⭐⭐', value: '3', score: 3 },
          { id: 'r4', label: '⭐⭐⭐⭐', value: '4', score: 4 },
          { id: 'r5', label: '⭐⭐⭐⭐⭐', value: '5', score: 5 }
        ],
        required: true
      },
      {
        id: 'circ-q4',
        idx: 3,
        type: 'single',
        title: '🎨 Personalização Visual',
        description: 'Teste alterando as cores primária e de destaque no tema. O círculo deve refletir essas mudanças.',
        options: [
          { id: 'opt1', label: 'Cores se aplicam bem', value: 'colors_good', score: 5 },
          { id: 'opt2', label: 'Precisa ajustar contraste', value: 'contrast_needed', score: 3 },
          { id: 'opt3', label: 'Perfeito como está', value: 'perfect', score: 5 }
        ],
        required: true
      }
    ],
    outcomes: {
      circular_master: {
        title: '🎯 Mestre do Progresso Circular!',
        description: 'Você dominou todas as configurações do progresso circular. Agora você pode usar este conhecimento em seus quizzes reais!',
        cta: {
          label: 'Testar efeitos especiais',
          href: '#'
        },
        color: 'hsl(271, 76%, 53%)',
        icon: '🏆'
      }
    },
    createdAt: '2024-01-25T12:00:00Z',
    updatedAt: '2024-01-25T12:00:00Z'
  },

  {
    id: 'test-quiz-effects',
    publicId: 'test-effects-features',
    name: '🧪 Teste: Efeitos Especiais e Visuais',
    description: 'Quiz para testar confetti, fogos de artifício, efeitos sonoros e outras funcionalidades visuais',
    status: 'draft',
    theme: {
      ...DEMO_THEMES.modern,
      useParticleEffects: true,
      completionEffect: 'confetti',
      useVideoBackground: false,
      useSoundEffects: true,
      fakeProgress: true,
      fakeProgressStyle: 'linear',
      fakeProgressSpeed: 'fast'
    },
    questions: [
      {
        id: 'fx-q1',
        idx: 0,
        type: 'single',
        title: '🎊 Teste de Efeitos - Confetti',
        description: 'Este quiz está configurado para mostrar confetti ao finalizar. Vá até a aba Tema > Efeitos para testar diferentes opções.',
        options: [
          { id: 'opt1', label: 'Confetti é divertido', value: 'confetti_fun', score: 5 },
          { id: 'opt2', label: 'Prefiro fogos de artifício', value: 'fireworks_pref', score: 4 },
          { id: 'opt3', label: 'Estrelas são elegantes', value: 'stars_elegant', score: 4 },
          { id: 'opt4', label: 'Sem efeitos', value: 'no_effects', score: 1 }
        ],
        required: true
      },
      {
        id: 'fx-q2',
        idx: 1,
        type: 'multiple',
        title: '🎵 Efeitos Sonoros',
        description: 'Os efeitos sonoros estão ativados. Teste também ativando "Fundo de vídeo" para uma experiência mais rica.',
        options: [
          { id: 'opt1', label: 'Sons melhoram a experiência', value: 'sound_good', score: 4 },
          { id: 'opt2', label: 'Vídeo de fundo é interessante', value: 'video_interesting', score: 5 },
          { id: 'opt3', label: 'Preferem silêncioso', value: 'silent_pref', score: 2 },
          { id: 'opt4', label: 'Depende do contexto', value: 'context_dependent', score: 3 }
        ],
        required: true
      },
      {
        id: 'fx-q3',
        idx: 2,
        type: 'single',
        title: '🎨 Gradientes e Animações',
        description: 'Este tema usa gradientes. Teste desativando "gradient" e ativando diferentes efeitos de conclusão.',
        options: [
          { id: 'opt1', label: 'Gradientes são modernos', value: 'gradients_modern', score: 5 },
          { id: 'opt2', label: 'Cores sólidas são clássicas', value: 'solid_classic', score: 3 },
          { id: 'opt3', label: 'Animações chamam atenção', value: 'animations_attention', score: 4 }
        ],
        required: true
      }
    ],
    outcomes: {
      effects_wizard: {
        title: '🎭 Mago dos Efeitos Visuais!',
        description: 'Parabéns! Você explorou todos os efeitos especiais. Seus quizzes agora podem ter experiências verdadeiramente envolventes!',
        cta: {
          label: 'Criar quiz com efeitos',
          href: '#'
        },
        color: 'hsl(292, 84%, 61%)',
        icon: '✨'
      }
    },
    createdAt: '2024-01-25T13:00:00Z',
    updatedAt: '2024-01-25T13:00:00Z'
  },

  {
    id: 'test-quiz-question-types',
    publicId: 'test-all-question-types',
    name: '🧪 Teste: Todos os Tipos de Pergunta',
    description: 'Quiz completo para testar todos os tipos de pergunta disponíveis: single, multiple, rating, email, phone, NPS',
    status: 'draft',
    theme: {
      ...DEMO_THEMES.corporate,
      showProgress: true,
      showQuestionNumbers: true,
      centerAlign: false
    },
    questions: [
      {
        id: 'type-q1',
        idx: 0,
        type: 'single',
        title: '1️⃣ Pergunta de Única Escolha',
        description: 'Este é o tipo "single" - apenas uma resposta pode ser selecionada.',
        options: [
          { id: 'opt1', label: 'Primeira opção', value: 'first', score: 1 },
          { id: 'opt2', label: 'Segunda opção', value: 'second', score: 2 },
          { id: 'opt3', label: 'Terceira opção', value: 'third', score: 3 },
          { id: 'opt4', label: 'Quarta opção', value: 'fourth', score: 4 }
        ],
        required: true
      },
      {
        id: 'type-q2',
        idx: 1,
        type: 'multiple',
        title: '☑️ Pergunta de Múltipla Escolha',
        description: 'Este é o tipo "multiple" - várias respostas podem ser selecionadas.',
        options: [
          { id: 'opt1', label: 'Pode selecionar esta', value: 'option_a', score: 2 },
          { id: 'opt2', label: 'E também esta', value: 'option_b', score: 2 },
          { id: 'opt3', label: 'E até esta', value: 'option_c', score: 3 },
          { id: 'opt4', label: 'Todas se quiser!', value: 'option_d', score: 4 }
        ],
        required: true
      },
      {
        id: 'type-q3',
        idx: 2,
        type: 'rating',
        title: '⭐ Pergunta de Avaliação (Rating)',
        description: 'Este é o tipo "rating" - escala numérica de 1 a 5.',
        options: [
          { id: 'r1', label: '1', value: '1', score: 1 },
          { id: 'r2', label: '2', value: '2', score: 2 },
          { id: 'r3', label: '3', value: '3', score: 3 },
          { id: 'r4', label: '4', value: '4', score: 4 },
          { id: 'r5', label: '5', value: '5', score: 5 }
        ],
        required: true
      },
      {
        id: 'type-q4',
        idx: 3,
        type: 'email',
        title: '📧 Campo de E-mail',
        description: 'Este é o tipo "email" - validação automática de formato de e-mail.',
        required: false
      },
      {
        id: 'type-q5',
        idx: 4,
        type: 'phone',
        title: '📱 Campo de Telefone',
        description: 'Este é o tipo "phone" - para capturar números de telefone.',
        required: false
      },
      {
        id: 'type-q6',
        idx: 5,
        type: 'nps',
        title: '📊 Pergunta NPS (Net Promoter Score)',
        description: 'Este é o tipo "NPS" - escala de 0 a 10 para medir satisfação.',
        required: true
      }
    ],
    outcomes: {
      question_master: {
        title: '🎓 Mestre dos Tipos de Pergunta!',
        description: 'Você testou todos os tipos de pergunta disponíveis. Agora sabe como usar cada um para diferentes situações!',
        cta: {
          label: 'Criar quiz profissional',
          href: '#'
        },
        color: 'hsl(217, 91%, 46%)',
        icon: '🏅'
      }
    },
    createdAt: '2024-01-25T14:00:00Z',
    updatedAt: '2024-01-25T14:00:00Z'
  },

  {
    id: 'test-quiz-themes',
    publicId: 'test-theme-variations',
    name: '🧪 Teste: Variações de Tema',
    description: 'Quiz para testar diferentes estilos de botão, fontes, bordas e alinhamentos',
    status: 'draft',
    theme: {
      ...DEMO_THEMES.modern,
      buttonStyle: 'pill',
      fontFamily: 'Poppins, sans-serif',
      fontSize: 'large',
      centerAlign: true,
      borderRadius: '20px'
    },
    questions: [
      {
        id: 'theme-q1',
        idx: 0,
        type: 'single',
        title: '🎨 Estilo de Botões',
        description: 'Este quiz usa botões em formato "pill". Teste mudando para "square" ou "rounded" na aba Tema.',
        options: [
          { id: 'opt1', label: 'Pill é moderno', value: 'pill_modern', score: 4 },
          { id: 'opt2', label: 'Square é clássico', value: 'square_classic', score: 3 },
          { id: 'opt3', label: 'Rounded é versátil', value: 'rounded_versatile', score: 5 }
        ],
        required: true
      },
      {
        id: 'theme-q2',
        idx: 1,
        type: 'single',
        title: '📝 Tamanho da Fonte',
        description: 'A fonte está em tamanho "large". Teste "small" e "medium" para ver a diferença.',
        options: [
          { id: 'opt1', label: 'Large é mais legível', value: 'large_readable', score: 4 },
          { id: 'opt2', label: 'Medium é equilibrado', value: 'medium_balanced', score: 5 },
          { id: 'opt3', label: 'Small economiza espaço', value: 'small_compact', score: 3 }
        ],
        required: true
      },
      {
        id: 'theme-q3',
        idx: 2,
        type: 'single',
        title: '📐 Alinhamento Central',
        description: 'Este quiz usa alinhamento central. Desative na aba Tema > Layout para ver à esquerda.',
        options: [
          { id: 'opt1', label: 'Central é elegante', value: 'center_elegant', score: 4 },
          { id: 'opt2', label: 'Esquerda é tradicional', value: 'left_traditional', score: 3 },
          { id: 'opt3', label: 'Depende do conteúdo', value: 'content_dependent', score: 5 }
        ],
        required: true
      }
    ],
    outcomes: {
      theme_designer: {
        title: '🎨 Designer de Temas Expert!',
        description: 'Você explorou todas as opções de personalização visual! Seus quizzes agora podem ter a identidade visual perfeita.',
        cta: {
          label: 'Personalizar meu quiz',
          href: '#'
        },
        color: 'hsl(271, 76%, 53%)',
        icon: '🎭'
      }
    },
    createdAt: '2024-01-25T15:00:00Z',
    updatedAt: '2024-01-25T15:00:00Z'
  }
];

// Realistic Results Data
export const DEMO_RESULTS: Result[] = [
  {
    id: 'result-1',
    quizId: 'demo-quiz-1',
    startedAt: '2024-01-15T10:30:00Z',
    completedAt: '2024-01-15T10:35:00Z',
    score: 12,
    outcomeKey: 'intermediate',
    utm: {
      source: 'facebook',
      medium: 'social',
      campaign: 'digital_diagnosis',
      content: 'post_organic'
    },
    meta: {
      device: 'mobile',
      browser: 'chrome',
      location: 'São Paulo, SP',
      referrer: 'facebook.com',
      timeSpent: 298
    },
    answers: [
      { questionId: 'q1', value: 'small' },
      { questionId: 'q2', value: ['website', 'social', 'email'] },
      { questionId: 'q3', value: '3' },
      { questionId: 'q4', value: 'cliente@exemplo.com' },
      { questionId: 'q5', value: '+5511999999999' }
    ]
  },
  // Add more realistic results...
];

// Demo Leads
export const DEMO_LEADS: Lead[] = [
  {
    id: 'lead-1',
    quizId: 'demo-quiz-1',
    resultId: 'result-1',
    name: 'João Silva',
    email: 'cliente@exemplo.com',
    phone: '+5511999999999',
    tags: ['intermediario', 'marketing-digital', 'small-business'],
    customFields: {
      company: 'Silva Consultoria',
      segment: 'Consultoria',
      employees: '2-10',
      leadScore: 85,
      interest: 'high',
      followUpDate: '2024-01-16T10:00:00Z'
    },
    createdAt: '2024-01-15T10:35:00Z'
  }
];

// Analytics mock data
export const DEMO_ANALYTICS = {
  overview: {
    totalQuizzes: 15,
    totalViews: 4250,
    totalStarts: 1890,
    totalCompletions: 1120,
    totalLeads: 890,
    conversionRate: 59.3,
    averageCompletionTime: 245,
    topPerformingQuizzes: ['demo-quiz-1', 'demo-quiz-2']
  },
  timeline: {
    last30Days: {
      views: [120, 145, 189, 167, 203, 245, 289, 234, 267, 234, 298, 267, 345, 289, 323, 234, 267, 289, 323, 234, 267, 289, 323, 234, 267, 289, 323, 234, 267, 289],
      starts: [45, 67, 89, 78, 95, 112, 134, 98, 123, 98, 145, 123, 167, 134, 156, 98, 123, 134, 156, 98, 123, 134, 156, 98, 123, 134, 156, 98, 123, 134],
      completions: [23, 34, 45, 39, 48, 56, 67, 49, 62, 49, 73, 62, 84, 67, 78, 49, 62, 67, 78, 49, 62, 67, 78, 49, 62, 67, 78, 49, 62, 67]
    }
  },
  demographic: {
    deviceBreakdown: { mobile: 68, desktop: 24, tablet: 8 },
    locationBreakdown: { 'São Paulo': 35, 'Rio de Janeiro': 18, 'Belo Horizonte': 12, 'Brasília': 10, 'Outros': 25 },
    trafficSources: { organic: 45, social: 30, direct: 15, paid: 10 }
  }
};