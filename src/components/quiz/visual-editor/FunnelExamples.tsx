import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QuestionOption, ResponseBranch } from '@/types/quiz';
import {
  GitBranch, ArrowRight, Target, ExternalLink, 
  MessageSquare, Lightbulb, Copy
} from 'lucide-react';

interface FunnelExamplesProps {
  onApplyExample: (example: FunnelExample) => void;
}

interface FunnelExample {
  name: string;
  description: string;
  category: string;
  options: QuestionOption[];
  branches: ResponseBranch[];
  useCase: string;
}

const funnelExamples: FunnelExample[] = [
  {
    name: "Quiz de Personalidade",
    description: "Direciona para resultados baseados nas respostas",
    category: "Personalidade",
    useCase: "Cada resposta leva a um resultado/perfil específico",
    options: [
      { id: "intro", label: "Sou introvertido", value: "introvert" },
      { id: "extro", label: "Sou extrovertido", value: "extrovert" },
      { id: "mixed", label: "Sou um pouco dos dois", value: "ambivert" }
    ],
    branches: [
      {
        id: "branch-1",
        responseValue: "intro",
        actionType: "outcome",
        outcomeKey: "introvert_profile"
      },
      {
        id: "branch-2", 
        responseValue: "extro",
        actionType: "outcome",
        outcomeKey: "extrovert_profile"
      },
      {
        id: "branch-3",
        responseValue: "mixed",
        actionType: "outcome", 
        outcomeKey: "ambivert_profile"
      }
    ]
  },
  {
    name: "Qualificação de Leads",
    description: "Segmenta leads qualificados vs não qualificados",
    category: "Vendas",
    useCase: "Leads qualificados vão para vendas, outros para nutrição",
    options: [
      { id: "budget_high", label: "Acima de R$ 10.000", value: "high_budget" },
      { id: "budget_mid", label: "Entre R$ 5.000 - R$ 10.000", value: "mid_budget" },
      { id: "budget_low", label: "Abaixo de R$ 5.000", value: "low_budget" }
    ],
    branches: [
      {
        id: "branch-1",
        responseValue: "budget_high",
        actionType: "external_url",
        targetUrl: "https://calendly.com/vendas-premium"
      },
      {
        id: "branch-2",
        responseValue: "budget_mid", 
        actionType: "external_url",
        targetUrl: "https://calendly.com/vendas-standard"
      },
      {
        id: "branch-3",
        responseValue: "budget_low",
        actionType: "specific_step",
        targetStepId: "lead_nurturing"
      }
    ]
  },
  {
    name: "Quiz de Produto",
    description: "Recomenda produtos específicos baseados nas respostas",
    category: "E-commerce",
    useCase: "Cada resposta direciona para páginas de produtos diferentes",
    options: [
      { id: "beginner", label: "Iniciante", value: "beginner" },
      { id: "intermediate", label: "Intermediário", value: "intermediate" },
      { id: "advanced", label: "Avançado", value: "advanced" }
    ],
    branches: [
      {
        id: "branch-1",
        responseValue: "beginner",
        actionType: "external_url", 
        targetUrl: "https://loja.com/produtos-iniciante"
      },
      {
        id: "branch-2",
        responseValue: "intermediate",
        actionType: "external_url",
        targetUrl: "https://loja.com/produtos-intermediario"
      },
      {
        id: "branch-3", 
        responseValue: "advanced",
        actionType: "external_url",
        targetUrl: "https://loja.com/produtos-avancado"
      }
    ]
  },
  {
    name: "Diagnóstico Empresarial",
    description: "Diferentes caminhos baseados no tamanho da empresa",
    category: "B2B",
    useCase: "Empresas de diferentes portes recebem diagnósticos personalizados",
    options: [
      { id: "startup", label: "Startup (1-10 funcionários)", value: "startup" },
      { id: "small", label: "Pequena empresa (11-50)", value: "small" },
      { id: "medium", label: "Média empresa (51-200)", value: "medium" },
      { id: "large", label: "Grande empresa (200+)", value: "large" }
    ],
    branches: [
      {
        id: "branch-1",
        responseValue: "startup",
        actionType: "specific_step",
        targetStepId: "startup_questions"
      },
      {
        id: "branch-2",
        responseValue: "small",
        actionType: "specific_step", 
        targetStepId: "small_business_questions"
      },
      {
        id: "branch-3",
        responseValue: "medium",
        actionType: "specific_step",
        targetStepId: "medium_business_questions"
      },
      {
        id: "branch-4",
        responseValue: "large",
        actionType: "specific_step",
        targetStepId: "enterprise_questions"
      }
    ]
  }
];

export function FunnelExamples({ onApplyExample }: FunnelExamplesProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Personalidade':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'Vendas':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'E-commerce':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'B2B':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getActionTypeIcon = (actionType: string) => {
    switch (actionType) {
      case 'specific_step':
        return <Target className="w-3 h-3" />;
      case 'external_url':
        return <ExternalLink className="w-3 h-3" />;
      case 'outcome':
        return <MessageSquare className="w-3 h-3" />;
      default:
        return <ArrowRight className="w-3 h-3" />;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Exemplos de Funil</h3>
          <p className="text-sm text-muted-foreground">
            Templates prontos para diferentes casos de uso
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {funnelExamples.map((example, index) => (
          <Card key={index} className="p-4 border-l-4 border-l-primary">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{example.name}</h4>
                    <Badge className={`text-xs ${getCategoryColor(example.category)}`}>
                      {example.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {example.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <GitBranch className="w-3 h-3" />
                    <span>{example.useCase}</span>
                  </div>
                </div>
                
                <Button
                  size="sm"
                  onClick={() => onApplyExample(example)}
                  className="shrink-0"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Usar Template
                </Button>
              </div>

              {/* Preview das Ramificações */}
              <div className="grid gap-2">
                <div className="text-xs font-medium text-muted-foreground mb-1">
                  Ramificações ({example.branches.length}):
                </div>
                {example.branches.slice(0, 3).map((branch, branchIndex) => {
                  const option = example.options.find(opt => opt.id === branch.responseValue);
                  return (
                    <div key={branchIndex} className="flex items-center gap-2 text-xs">
                      <div className="w-4 h-4 rounded bg-muted flex items-center justify-center">
                        {getActionTypeIcon(branch.actionType)}
                      </div>
                      <span className="text-muted-foreground">
                        "{option?.label}" →
                      </span>
                      <span className="font-medium">
                        {branch.actionType === 'outcome' && `Resultado: ${branch.outcomeKey}`}
                        {branch.actionType === 'external_url' && 'Link externo'}
                        {branch.actionType === 'specific_step' && 'Etapa específica'}
                      </span>
                    </div>
                  );
                })}
                {example.branches.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{example.branches.length - 3} ramificações adicionais
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-yellow-500 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-medium">Dica de Uso</h4>
            <p className="text-xs text-muted-foreground">
              Você pode personalizar qualquer template após aplicá-lo. Use esses exemplos como 
              ponto de partida e adapte-os para suas necessidades específicas.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}