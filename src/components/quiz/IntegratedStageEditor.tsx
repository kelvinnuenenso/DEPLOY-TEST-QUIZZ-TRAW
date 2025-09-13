import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { VisualEditor } from './VisualEditor';
import { Quiz, QuizTheme, QuizStep, Component } from '@/types/quiz';
import { useThemes } from '@/hooks/useThemes';
import { useToast } from '@/hooks/use-toast';
import {
  Wand2, Settings, Eye, Play, Zap, Palette, 
  CheckCircle, ArrowRight, Layers, MessageSquare, X
} from 'lucide-react';

interface IntegratedStageEditorProps {
  quiz: Quiz;
  onUpdate: (quiz: Quiz) => void;
  onSave: () => void;
  onPreview: () => void;
  onPublish: () => void;
  onNavigateToTheme: () => void;
}

export function IntegratedStageEditor({
  quiz,
  onUpdate,
  onSave,
  onPreview,
  onPublish,
  onNavigateToTheme
}: IntegratedStageEditorProps) {
  // Iniciar em modo avançado se já há conteúdo configurado
  const hasConfiguredContent = quiz.steps && quiz.steps.length > 0 && 
    quiz.steps.some(step => step.components && step.components.length > 0);
  
  const [editorMode, setEditorMode] = useState<'simple' | 'advanced'>(
    hasConfiguredContent ? 'advanced' : 'simple'
  );
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const { toast } = useToast();
  const { savedThemes, applyThemeToQuiz } = useThemes();

  // Temas disponíveis
  const availableThemes = useMemo(() => {
    return savedThemes.map(theme => ({
      id: theme.id,
      name: theme.name,
      preview: theme.theme.primary,
      isPreset: theme.isPreset
    }));
  }, [savedThemes]);

  // Perguntas disponíveis do quiz
  const availableQuestions = useMemo(() => {
    return quiz.questions || [];
  }, [quiz.questions]);

  // Função para gerar fluxo automático
  const generateAutoFlow = () => {
    if (selectedQuestions.length === 0) {
      toast({
        title: "Selecione perguntas",
        description: "Escolha pelo menos uma pergunta para gerar o fluxo.",
        variant: "destructive"
      });
      return;
    }

    // Aplicar tema se selecionado
    let updatedTheme = quiz.theme;
    if (selectedTheme) {
      updatedTheme = applyThemeToQuiz(selectedTheme, quiz.theme);
    }

    // Criar etapas baseadas nas perguntas selecionadas
    const newSteps: QuizStep[] = selectedQuestions.map((questionId, index) => {
      const question = availableQuestions.find(q => q.id === questionId);
      if (!question) return null;

      const stepComponents: Component[] = [
        {
          id: `title-${index}`,
          type: 'title',
          content: question.title,
          style: {
            fontSize: '28px',
            textAlign: 'center',
            textColor: updatedTheme?.text || '#0B0B0B',
            margin: '0 0 16px 0'
          }
        }
      ];

      // Adicionar descrição se existir
      if (question.description) {
        stepComponents.push({
          id: `description-${index}`,
          type: 'text',
          content: question.description,
          style: {
            fontSize: '16px',
            textAlign: 'center',
            textColor: updatedTheme?.text || '#0B0B0B',
            margin: '0 0 24px 0'
          }
        });
      }

      // Adicionar componente de pergunta baseado no tipo
      const questionComponent: Component = {
        id: `question-${index}`,
        type: getComponentTypeFromQuestion(question.type),
        content: question.title,
        style: {
          backgroundColor: updatedTheme?.background || '#FFFFFF',
          textColor: updatedTheme?.text || '#0B0B0B'
        }
      };

      stepComponents.push(questionComponent);

      // Adicionar botão de navegação se não for a última pergunta
      if (index < selectedQuestions.length - 1) {
        stepComponents.push({
          id: `next-button-${index}`,
          type: 'button',
          content: 'Próxima',
          style: {
            backgroundColor: updatedTheme?.primary || '#2563EB',
            textColor: '#FFFFFF',
            borderRadius: updatedTheme?.borderRadius || '8px',
            padding: '12px 24px',
            fontSize: '16px',
            margin: '24px 0 0 0'
          }
        });
      }

      return {
        id: `step-${index}`,
        name: `${question.title.substring(0, 30)}...`,
        title: question.title,
        components: stepComponents,
        logic: {
          type: 'conditional' as const,
          rules: [],
          defaultNextStep: index < selectedQuestions.length - 1 ? `step-${index + 1}` : 'result-step'
        }
      };
    }).filter(Boolean) as QuizStep[];

    // Adicionar etapa de resultado no final com tema aplicado
    const resultStep: QuizStep = {
      id: 'result-step',
      name: 'Resultado',
      title: 'Resultado',
      components: [
        {
          id: 'result-title',
          type: 'title',
          content: 'Obrigado por participar!',
          style: {
            fontSize: '32px',
            textAlign: 'center'
          }
        },
        {
          id: 'result-text',
          type: 'text',
          content: 'Suas respostas foram registradas com sucesso.',
          style: {
            fontSize: '18px',
            textAlign: 'center'
          }
        },
        {
          id: 'result-button',
          type: 'button',
          content: 'Finalizar',
          style: {
            backgroundColor: updatedTheme?.primary || '#2563EB',
            borderRadius: updatedTheme?.borderRadius || '12px'
          }
        }
      ],
      logic: undefined
    };

    newSteps.push(resultStep);

    const updatedQuiz = {
      ...quiz,
      steps: newSteps,
      theme: updatedTheme,
      // Aplicar tema globalmente nos estilos do quiz
      settings: {
        ...quiz.settings,
        globalStyle: {
          fontFamily: updatedTheme?.fontFamily || 'Inter, sans-serif',
          backgroundColor: updatedTheme?.background || '#FFFFFF',
          primaryColor: updatedTheme?.primary || '#2563EB',
          textColor: updatedTheme?.text || '#0B0B0B'
        }
      }
    };

    onUpdate(updatedQuiz);
    
    // Automaticamente mudar para modo avançado IMEDIATAMENTE
    setEditorMode('advanced');
    
    toast({
      title: "Fluxo gerado com sucesso!",
      description: `${newSteps.length} etapas criadas com tema aplicado.`,
    });

    // Mostrar confirmação que o canvas está pronto
    setTimeout(() => {
      toast({
        title: "🎨 Canvas Visual carregado!",
        description: "Seu fluxo está pronto para personalização e publicação.",
      });
    }, 500);
  };

  // Função auxiliar para mapear tipo de pergunta para tipo de componente
  const getComponentTypeFromQuestion = (questionType: string): 'text' | 'title' | 'image' | 'video' | 'button' | 'input' | 'faq' | 'testimonial' | 'carousel' | 'comparison' | 'chart' | 'confetti' | 'pricing' | 'marquee' | 'spacer' | 'terms' | 'multiple_choice' | 'level_slider' => {
    switch (questionType) {
      case 'single':
      case 'multiple':
        return 'multiple_choice';
      case 'rating':
        return 'level_slider';
      case 'nps':
        return 'level_slider';
      case 'slider':
        return 'level_slider';
      case 'short_text':
      case 'email':
      case 'phone':
        return 'input';
      case 'long_text':
        return 'input';
      case 'date':
        return 'input';
      case 'file':
        return 'button';
      default:
        return 'text';
    }
  };

  // Renderizar modo simples
  const renderSimpleMode = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Wand2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Modo Automático</h3>
            <p className="text-sm text-muted-foreground">
              Selecione perguntas e tema para gerar o fluxo automaticamente
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Seleção de Perguntas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Perguntas Disponíveis</Label>
              <Badge variant="outline">
                {availableQuestions.length} criadas
              </Badge>
            </div>
            
            {availableQuestions.length === 0 ? (
              <Alert>
                <MessageSquare className="w-4 h-4" />
                <AlertDescription>
                  Nenhuma pergunta criada. Vá para a aba "Perguntas" para criar suas perguntas.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {availableQuestions.map((question) => (
                  <Card key={question.id} className="p-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id={`question-${question.id}`}
                        checked={selectedQuestions.includes(question.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedQuestions([...selectedQuestions, question.id]);
                          } else {
                            setSelectedQuestions(selectedQuestions.filter(id => id !== question.id));
                          }
                        }}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <label 
                          htmlFor={`question-${question.id}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {question.title}
                        </label>
                        <p className="text-xs text-muted-foreground mt-1">
                          {question.type} • {question.required ? 'Obrigatória' : 'Opcional'}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Configuração de Tema */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Tema do Quiz</Label>
              <Badge variant="outline">
                {selectedTheme ? 'Aplicado' : 'Não configurado'}
              </Badge>
            </div>
            
            <Card className="p-6 border-2 border-dashed border-muted-foreground/20 bg-muted/30">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Palette className="w-6 h-6 text-primary" />
                </div>
                
                <div>
                  <h4 className="font-semibold text-base mb-2">Configure o Tema Visual</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Defina cores, fontes, botões e estilo das perguntas na aba Tema.
                    Suas configurações serão aplicadas automaticamente ao fluxo.
                  </p>
                </div>
                
                <Button 
                  onClick={onNavigateToTheme}
                  className="gap-2 hover-scale"
                  size="lg"
                >
                  <Settings className="w-4 h-4" />
                  Configurar Tema
                </Button>
                
                {/* Mostrar tema atual se houver */}
                {selectedTheme && (
                  <div className="mt-4 p-3 bg-background rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full border-2"
                        style={{ backgroundColor: availableThemes.find(t => t.id === selectedTheme)?.preview }}
                      />
                      <div className="text-left flex-1">
                        <p className="text-sm font-medium">
                          {availableThemes.find(t => t.id === selectedTheme)?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Tema ativo
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTheme('')}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Seleção rápida de temas salvos */}
                {availableThemes.length > 0 && !selectedTheme && (
                  <div className="border-t pt-4">
                    <Label className="text-sm text-muted-foreground mb-2 block">
                      Ou selecione um tema salvo:
                    </Label>
                    <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Escolher tema salvo..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableThemes.map((theme) => (
                          <SelectItem key={theme.id} value={theme.id}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full border"
                                style={{ backgroundColor: theme.preview }}
                              />
                              {theme.name}
                              {theme.isPreset && (
                                <Badge variant="secondary" className="text-xs ml-1">
                                  Preset
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Botão de ação */}
        <div className="flex justify-end mt-6">
          <Button 
            onClick={generateAutoFlow}
            disabled={selectedQuestions.length === 0}
            className="gap-2"
          >
            <Zap className="w-4 h-4" />
            Gerar e Abrir Canvas Visual
          </Button>
        </div>
      </Card>

      {/* Resumo do que será criado */}
      {selectedQuestions.length > 0 && (
        <Card className="p-4 bg-muted/50">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium">Prévia do Fluxo</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{selectedQuestions.length} pergunta(s)</span>
            <ArrowRight className="w-3 h-3" />
            <span>1 página de resultado</span>
            {selectedTheme && (
              <>
                <span>•</span>
                <Palette className="w-3 h-3" />
                <span>Tema aplicado</span>
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  );

  // Renderizar modo avançado (Canvas Visual)
  const renderAdvancedMode = () => (
    <div className="space-y-4">
      <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-800">Canvas Visual - Fluxo Pronto</h3>
              <p className="text-sm text-green-600">
                Seu quiz está montado e pronto para publicação. Edite livremente ou publique agora.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1 bg-green-100 text-green-700">
              <Layers className="w-3 h-3" />
              {quiz.steps?.length || 0} etapas
            </Badge>
            <Badge variant="secondary" className="gap-1 bg-blue-100 text-blue-700">
              <Palette className="w-3 h-3" />
              Tema aplicado
            </Badge>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            ✅ Perguntas configuradas • ✅ Tema aplicado • ✅ Layout finalizado
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onPreview} className="gap-2">
              <Eye className="w-4 h-4" />
              Preview
            </Button>
            <Button onClick={onPublish} className="gap-2 bg-green-600 hover:bg-green-700">
              <Play className="w-4 h-4" />
              Publicar Agora
            </Button>
          </div>
        </div>
      </Card>

      <VisualEditor
        quiz={quiz}
        onUpdate={onUpdate}
        onSave={onSave}
        onPreview={onPreview}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header de controle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">Editor de Etapas</h2>
          <Tabs value={editorMode} onValueChange={(value) => setEditorMode(value as any)}>
            <TabsList>
              <TabsTrigger value="simple" className="gap-2">
                <Wand2 className="w-4 h-4" />
                Simples
              </TabsTrigger>
              <TabsTrigger value="advanced" className="gap-2">
                <Settings className="w-4 h-4" />
                Avançado
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onPreview} className="gap-2">
            <Eye className="w-4 h-4" />
            Preview
          </Button>
          <Button onClick={onSave} className="gap-2">
            <Play className="w-4 h-4" />
            Salvar
          </Button>
        </div>
      </div>

      {/* Conteúdo baseado no modo */}
      {editorMode === 'simple' ? renderSimpleMode() : renderAdvancedMode()}
    </div>
  );
}