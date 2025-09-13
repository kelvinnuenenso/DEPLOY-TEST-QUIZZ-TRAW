import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Quiz, QuestionType } from '@/types/quiz';
import { Eye, Zap, Target, Users, TrendingUp, Heart, Brain, Briefcase } from 'lucide-react';

interface QuizTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ComponentType<any>;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  estimatedTime: string;
  questions: Partial<Quiz>['questions'];
  outcomes: Partial<Quiz>['outcomes'];
  theme: Partial<Quiz>['theme'];
}

const templates: QuizTemplate[] = [
  {
    id: 'lead-gen-basic',
    name: 'Captação de Leads Básica',
    description: 'Template simples para capturar leads qualificados',
    category: 'Marketing',
    icon: Users,
    difficulty: 'Iniciante',
    estimatedTime: '2-3 min',
    questions: [
      {
        id: crypto.randomUUID(),
        idx: 1,
        type: 'single' as QuestionType,
        title: 'Qual seu principal desafio atualmente?',
        description: 'Escolha a opção que mais se identifica com sua situação',
        options: [
          { id: '1', label: 'Gerar mais leads qualificados', score: 10 },
          { id: '2', label: 'Aumentar as vendas', score: 15 },
          { id: '3', label: 'Melhorar o relacionamento com clientes', score: 8 },
          { id: '4', label: 'Otimizar processos internos', score: 12 }
        ],
        required: true
      },
      {
        id: crypto.randomUUID(),
        idx: 2,
        type: 'multiple' as QuestionType,
        title: 'Quais canais você usa para atrair clientes?',
        description: 'Selecione todos que se aplicam',
        options: [
          { id: '1', label: 'Redes sociais', score: 5 },
          { id: '2', label: 'Google Ads', score: 8 },
          { id: '3', label: 'Email marketing', score: 6 },
          { id: '4', label: 'Indicações', score: 10 },
          { id: '5', label: 'SEO/Blog', score: 7 }
        ],
        required: true
      },
      {
        id: crypto.randomUUID(),
        idx: 3,
        type: 'email' as QuestionType,
        title: 'Qual seu melhor email para receber o diagnóstico?',
        description: 'Enviaremos um relatório personalizado com recomendações específicas',
        required: true,
        settings: {
          placeholder: 'seu@email.com'
        }
      }
    ],
    outcomes: {
      iniciante: {
        title: 'Oportunidade de Crescimento! 🚀',
        description: 'Identificamos várias oportunidades para otimizar sua estratégia de captação.',
        cta: {
          label: 'Falar com Especialista',
          href: '#'
        }
      }
    },
    theme: {
      primary: '#2563EB',
      background: '#FFFFFF',
      text: '#0B0B0B'
    }
  },
  {
    id: 'product-fit',
    name: 'Adequação Produto-Mercado',
    description: 'Descubra o fit ideal entre seu produto e mercado',
    category: 'Produto',
    icon: Target,
    difficulty: 'Intermediário',
    estimatedTime: '4-5 min',
    questions: [
      {
        id: crypto.randomUUID(),
        idx: 1,
        type: 'nps' as QuestionType,
        title: 'Qual a probabilidade de você recomendar nosso produto?',
        description: 'De 0 a 10, sendo 0 "nunca recomendaria" e 10 "recomendaria com certeza"',
        required: true
      },
      {
        id: crypto.randomUUID(),
        idx: 2,
        type: 'single' as QuestionType,
        title: 'Como você descobriu nosso produto?',
        options: [
          { id: '1', label: 'Busca no Google', score: 8 },
          { id: '2', label: 'Recomendação de amigo', score: 15 },
          { id: '3', label: 'Redes sociais', score: 10 },
          { id: '4', label: 'Anúncios online', score: 5 },
          { id: '5', label: 'Outros', score: 3 }
        ],
        required: true
      },
      {
        id: crypto.randomUUID(),
        idx: 3,
        type: 'rating' as QuestionType,
        title: 'Como você avalia nossa solução?',
        description: 'Considerando funcionalidades, preço e suporte',
        required: true,
        score_weight: 2
      }
    ],
    outcomes: {
      promotor: {
        title: 'Você é um Promotor! 🌟',
        description: 'Obrigado pela confiança! Que tal nos ajudar a crescer?',
        cta: {
          label: 'Programa de Indicações',
          href: '#'
        }
      },
      detrator: {
        title: 'Vamos Melhorar Juntos 💪',
        description: 'Sua opinião é valiosa. Queremos entender como podemos melhorar.',
        cta: {
          label: 'Agendar Conversa',
          href: '#'
        }
      }
    },
    theme: {
      primary: '#059669',
      background: '#F0FDF4',
      text: '#064E3B'
    }
  },
  {
    id: 'personality-test',
    name: 'Teste de Personalidade',
    description: 'Descubra seu perfil comportamental',
    category: 'Comportamental',
    icon: Brain,
    difficulty: 'Intermediário',
    estimatedTime: '5-7 min',
    questions: [
      {
        id: crypto.randomUUID(),
        idx: 1,
        type: 'single' as QuestionType,
        title: 'Em reuniões, você costuma:',
        options: [
          { id: '1', label: 'Liderar a discussão e tomar iniciativa', score: 15 },
          { id: '2', label: 'Participar ativamente com ideias', score: 12 },
          { id: '3', label: 'Ouvir mais e falar quando necessário', score: 8 },
          { id: '4', label: 'Preferir observar e analisar', score: 5 }
        ],
        required: true
      },
      {
        id: crypto.randomUUID(),
        idx: 2,
        type: 'single' as QuestionType,
        title: 'Diante de um problema complexo, sua primeira reação é:',
        options: [
          { id: '1', label: 'Agir imediatamente com base na experiência', score: 18 },
          { id: '2', label: 'Buscar informações e analisar opções', score: 10 },
          { id: '3', label: 'Consultar outras pessoas', score: 6 },
          { id: '4', label: 'Quebrar o problema em partes menores', score: 14 }
        ],
        required: true
      },
      {
        id: crypto.randomUUID(),
        idx: 3,
        type: 'multiple' as QuestionType,
        title: 'Quais características mais se aplicam a você?',
        description: 'Escolha até 3 opções',
        options: [
          { id: '1', label: 'Determinado e focado em resultados', score: 8 },
          { id: '2', label: 'Criativo e inovador', score: 6 },
          { id: '3', label: 'Analítico e detalhista', score: 4 },
          { id: '4', label: 'Comunicativo e sociável', score: 7 },
          { id: '5', label: 'Paciente e colaborativo', score: 5 }
        ],
        required: true
      }
    ],
    outcomes: {
      lider: {
        title: 'Perfil Líder 👑',
        description: 'Você tem características naturais de liderança e toma iniciativas.',
        cta: {
          label: 'Desenvolver Liderança',
          href: '#'
        }
      },
      analista: {
        title: 'Perfil Analítico 🔍',
        description: 'Você valoriza dados e análise antes de tomar decisões.',
        cta: {
          label: 'Curso de Análise',
          href: '#'
        }
      },
      colaborador: {
        title: 'Perfil Colaborativo 🤝',
        description: 'Você trabalha bem em equipe e valoriza relacionamentos.',
        cta: {
          label: 'Workshop de Team Building',
          href: '#'
        }
      }
    },
    theme: {
      primary: '#7C3AED',
      background: '#FAF5FF',
      text: '#581C87'
    }
  },
  {
    id: 'health-check',
    name: 'Diagnóstico de Saúde do Negócio',
    description: 'Avalie a saúde geral da sua empresa',
    category: 'Negócios',
    icon: Briefcase,
    difficulty: 'Avançado',
    estimatedTime: '6-8 min',
    questions: [
      {
        id: crypto.randomUUID(),
        idx: 1,
        type: 'slider' as QuestionType,
        title: 'Como você avalia o crescimento da receita nos últimos 12 meses?',
        description: 'De 0 (declínio) a 10 (crescimento excepcional)',
        settings: {
          min: 0,
          max: 10,
          step: 1
        },
        required: true,
        score_weight: 3
      },
      {
        id: crypto.randomUUID(),
        idx: 2,
        type: 'multiple' as QuestionType,
        title: 'Quais são seus maiores desafios operacionais?',
        description: 'Selecione todos que se aplicam',
        options: [
          { id: '1', label: 'Falta de processos estruturados', score: 8 },
          { id: '2', label: 'Dificuldade em reter talentos', score: 6 },
          { id: '3', label: 'Problemas de fluxo de caixa', score: 10 },
          { id: '4', label: 'Concorrência acirrada', score: 7 },
          { id: '5', label: 'Tecnologia desatualizada', score: 5 }
        ],
        required: true
      },
      {
        id: crypto.randomUUID(),
        idx: 3,
        type: 'nps' as QuestionType,
        title: 'Qual a probabilidade de atingir suas metas anuais?',
        description: 'Considerando o cenário atual e suas estratégias',
        required: true
      }
    ],
    outcomes: {
      saudavel: {
        title: 'Negócio Saudável! 💚',
        description: 'Sua empresa está no caminho certo. Vamos potencializar ainda mais?',
        cta: {
          label: 'Consultoria de Crescimento',
          href: '#'
        }
      },
      atencao: {
        title: 'Pontos de Atenção ⚠️',
        description: 'Identificamos algumas oportunidades de melhoria importantes.',
        cta: {
          label: 'Diagnóstico Completo',
          href: '#'
        }
      },
      critico: {
        title: 'Ação Urgente Necessária 🚨',
        description: 'É hora de tomar medidas estratégicas para reverter o cenário.',
        cta: {
          label: 'Consultoria de Emergência',
          href: '#'
        }
      }
    },
    theme: {
      primary: '#DC2626',
      background: '#FEF2F2',
      text: '#7F1D1D'
    }
  }
];

interface QuizTemplatesProps {
  onSelectTemplate: (template: any) => void;
}

const QuizTemplates = ({ onSelectTemplate }: QuizTemplatesProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewTemplate, setPreviewTemplate] = useState<QuizTemplate | null>(null);

  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))];
  
  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Iniciante': return 'bg-green-100 text-green-800';
      case 'Intermediário': return 'bg-yellow-100 text-yellow-800';
      case 'Avançado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="capitalize"
          >
            {category === 'all' ? 'Todos' : category}
          </Button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredTemplates.map(template => {
          const IconComponent = template.icon;
          
          return (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{template.category}</p>
                    </div>
                  </div>
                  <Badge className={getDifficultyColor(template.difficulty)}>
                    {template.difficulty}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{template.description}</p>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>⏱️ {template.estimatedTime}</span>
                  <span>❓ {template.questions?.length} perguntas</span>
                </div>

                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setPreviewTemplate(template)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <IconComponent className="w-5 h-5" />
                          {template.name}
                        </DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <p>{template.description}</p>
                        
                        <div className="space-y-3">
                          <h3 className="font-semibold">Perguntas incluídas:</h3>
                          {template.questions?.map((question, index) => (
                            <div key={question.id} className="p-3 border rounded-lg">
                              <p className="font-medium">
                                {index + 1}. {question.title}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Tipo: {question.type === 'single' ? 'Múltipla escolha' : 
                                       question.type === 'multiple' ? 'Múltiplas opções' :
                                       question.type === 'email' ? 'Email' :
                                       question.type === 'nps' ? 'NPS' :
                                       question.type === 'rating' ? 'Avaliação' :
                                       question.type === 'slider' ? 'Escala' : question.type}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => onSelectTemplate(template)}
                  >
                    <Zap className="w-4 h-4 mr-1" />
                    Usar Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum template encontrado nesta categoria.</p>
        </div>
      )}
    </div>
  );
};

export default QuizTemplates;