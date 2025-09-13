import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { QuizOutcome, Quiz } from '@/types/quiz';
import { Plus, Trash2, Trophy, Target, Zap, Heart, Star, Award, ExternalLink, Info } from 'lucide-react';

interface OutcomeEditorProps {
  outcomes: Record<string, QuizOutcome>;
  quiz: Quiz;
  onUpdate: (outcomes: Record<string, QuizOutcome>) => void;
  onQuizUpdate: (updates: Partial<Quiz>) => void;
}

const outcomeIcons = [
  { value: 'trophy', label: 'Troféu', icon: Trophy },
  { value: 'target', label: 'Alvo', icon: Target },
  { value: 'zap', label: 'Raio', icon: Zap },
  { value: 'heart', label: 'Coração', icon: Heart },
  { value: 'star', label: 'Estrela', icon: Star },
  { value: 'award', label: 'Prêmio', icon: Award }
];

const defaultOutcomes = [
  {
    key: 'beginner',
    title: 'Iniciante',
    description: 'Você está começando sua jornada. Há muito potencial para crescer!',
    scoreRange: { min: 0, max: 30 },
    color: '#EF4444',
    icon: 'target'
  },
  {
    key: 'intermediate',
    title: 'Intermediário',
    description: 'Você tem um bom conhecimento base. Continue evoluindo!',
    scoreRange: { min: 31, max: 70 },
    color: '#F59E0B',
    icon: 'zap'
  },
  {
    key: 'advanced',
    title: 'Avançado',
    description: 'Parabéns! Você demonstra excelente conhecimento no assunto.',
    scoreRange: { min: 71, max: 100 },
    color: '#10B981',
    icon: 'trophy'
  }
];

export function OutcomeEditor({ outcomes, quiz, onUpdate, onQuizUpdate }: OutcomeEditorProps) {
  const [isDynamic, setIsDynamic] = useState(Object.keys(outcomes).length > 1);

  const redirectSettings = quiz.redirectSettings || { enabled: false, overrideResults: true };

  const validateUrl = (url: string): boolean => {
    return url.startsWith('http://') || url.startsWith('https://');
  };

  const updateRedirectSettings = (updates: Partial<typeof redirectSettings>) => {
    onQuizUpdate({
      redirectSettings: { ...redirectSettings, ...updates }
    });
  };

  const addOutcome = () => {
    const newKey = `outcome_${Date.now()}`;
    const newOutcome: QuizOutcome = {
      title: 'Novo Resultado',
      description: 'Descreva este resultado...',
      scoreRange: { min: 0, max: 100 },
      color: '#3B82F6',
      icon: 'star',
      cta: {
        label: 'Próximo passo',
        href: '#'
      }
    };

    onUpdate({
      ...outcomes,
      [newKey]: newOutcome
    });
  };

  const updateOutcome = (key: string, updates: Partial<QuizOutcome>) => {
    onUpdate({
      ...outcomes,
      [key]: { ...outcomes[key], ...updates }
    });
  };

  const deleteOutcome = (key: string) => {
    const newOutcomes = { ...outcomes };
    delete newOutcomes[key];
    onUpdate(newOutcomes);
  };

  const setupDynamicOutcomes = () => {
    const dynamicOutcomes: Record<string, QuizOutcome> = {};
    
    defaultOutcomes.forEach(outcome => {
      dynamicOutcomes[outcome.key] = {
        title: outcome.title,
        description: outcome.description,
        scoreRange: outcome.scoreRange,
        color: outcome.color,
        icon: outcome.icon,
        cta: {
          label: 'Falar no WhatsApp',
          href: '#'
        }
      };
    });

    onUpdate(dynamicOutcomes);
    setIsDynamic(true);
  };

  const setupSingleOutcome = () => {
    onUpdate({
      default: {
        title: 'Obrigado pela participação!',
        description: 'Recebemos suas respostas e entraremos em contato em breve.',
        cta: {
          label: 'Falar no WhatsApp',
          href: '#'
        }
      }
    });
    setIsDynamic(false);
  };

  const outcomeKeys = Object.keys(outcomes);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Resultados do Quiz</h3>
          <p className="text-sm text-muted-foreground">
            Configure as mensagens que os participantes verão após completar o quiz
          </p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="dynamic-outcomes"
              checked={isDynamic}
              onCheckedChange={(checked) => {
                if (checked) {
                  setupDynamicOutcomes();
                } else {
                  setupSingleOutcome();
                }
              }}
            />
            <Label htmlFor="dynamic-outcomes">Resultados dinâmicos</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="redirect-enabled"
              checked={redirectSettings.enabled}
              onCheckedChange={(enabled) => updateRedirectSettings({ enabled })}
            />
            <div className="flex items-center gap-1">
              <Label htmlFor="redirect-enabled">Redirecionar ao final</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Se ativado, os participantes serão enviados para uma URL externa ao finalizar o quiz.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          {isDynamic && (
            <Button onClick={addOutcome} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          )}
        </div>
      </div>

      {!isDynamic && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Target className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-blue-900">Resultado único</h4>
              <p className="text-sm text-blue-700">
                Todos os participantes verão o mesmo resultado, independente das respostas.
                Ideal para captura de leads ou questionários informativos.
              </p>
            </div>
          </div>
        </Card>
      )}

      {isDynamic && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Trophy className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-green-900">Resultados dinâmicos</h4>
              <p className="text-sm text-green-700">
                Diferentes resultados baseados na pontuação das respostas.
                Ideal para quizzes de conhecimento, avaliações ou testes de personalidade.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Configuração de Redirecionamento */}
      {redirectSettings.enabled && (
        <Card className="p-4 space-y-4 border-orange-200 bg-orange-50/50">
          <div className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-orange-600" />
            <h4 className="font-medium text-orange-900">Configuração de Redirecionamento</h4>
          </div>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="redirect-url">URL de redirecionamento</Label>
              <Input
                id="redirect-url"
                value={redirectSettings.url || ''}
                onChange={(e) => updateRedirectSettings({ url: e.target.value })}
                placeholder="https://seudominio.com/pagina"
                className={`${
                  redirectSettings.url && !validateUrl(redirectSettings.url)
                    ? 'border-red-300 focus:border-red-500'
                    : ''
                }`}
              />
              {redirectSettings.url && !validateUrl(redirectSettings.url) && (
                <p className="text-sm text-red-600 mt-1">
                  A URL deve começar com http:// ou https://
                </p>
              )}
            </div>
            
            <div className="p-3 bg-orange-100 rounded-lg">
              <p className="text-sm text-orange-800">
                <strong>Nota:</strong> Este redirecionamento substituirá a exibição de resultados.
                Os participantes serão enviados automaticamente para a URL configurada após completar o quiz.
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {outcomeKeys.map((key, index) => {
          const outcome = outcomes[key];
          const IconComponent = outcomeIcons.find(icon => icon.value === outcome.icon)?.icon || Star;
          
          return (
            <Card key={key} className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${outcome.color}20` }}
                    >
                      <IconComponent 
                        className="w-5 h-5" 
                        style={{ color: outcome.color }}
                      />
                    </div>
                    <div>
                      <Badge variant="outline">
                        {isDynamic ? `Resultado ${index + 1}` : 'Resultado padrão'}
                      </Badge>
                      {isDynamic && outcome.scoreRange && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Pontuação: {outcome.scoreRange.min} - {outcome.scoreRange.max}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {isDynamic && outcomeKeys.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteOutcome(key)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Título do resultado</Label>
                    <Input
                      value={outcome.title}
                      onChange={(e) => updateOutcome(key, { title: e.target.value })}
                      placeholder="Ex: Parabéns! Você é um expert!"
                    />
                  </div>
                  
                  <div>
                    <Label>Ícone</Label>
                    <Select
                      value={outcome.icon || 'star'}
                      onValueChange={(value) => updateOutcome(key, { icon: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {outcomeIcons.map(icon => (
                          <SelectItem key={icon.value} value={icon.value}>
                            <div className="flex items-center gap-2">
                              <icon.icon className="w-4 h-4" />
                              {icon.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Descrição do resultado</Label>
                  <Textarea
                    value={outcome.description}
                    onChange={(e) => updateOutcome(key, { description: e.target.value })}
                    placeholder="Descreva o que este resultado significa..."
                    rows={3}
                  />
                </div>

                {isDynamic && (
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Pontuação mínima</Label>
                      <Input
                        type="number"
                        value={outcome.scoreRange?.min || 0}
                        onChange={(e) => updateOutcome(key, {
                          scoreRange: { 
                            ...outcome.scoreRange,
                            min: parseInt(e.target.value) || 0 
                          }
                        })}
                      />
                    </div>
                    <div>
                      <Label>Pontuação máxima</Label>
                      <Input
                        type="number"
                        value={outcome.scoreRange?.max || 100}
                        onChange={(e) => updateOutcome(key, {
                          scoreRange: { 
                            ...outcome.scoreRange,
                            max: parseInt(e.target.value) || 100 
                          }
                        })}
                      />
                    </div>
                    <div>
                      <Label>Cor do resultado</Label>
                      <Input
                        type="color"
                        value={outcome.color || '#3B82F6'}
                        onChange={(e) => updateOutcome(key, { color: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Texto do botão</Label>
                    <Input
                      value={outcome.cta?.label || ''}
                      onChange={(e) => updateOutcome(key, {
                        cta: { ...outcome.cta, label: e.target.value }
                      })}
                      placeholder="Ex: Falar no WhatsApp"
                    />
                  </div>
                  <div>
                    <Label>Link do botão</Label>
                    <Input
                      value={outcome.cta?.href || ''}
                      onChange={(e) => updateOutcome(key, {
                        cta: { ...outcome.cta, href: e.target.value }
                      })}
                      placeholder="https://wa.me/5511999999999"
                    />
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}