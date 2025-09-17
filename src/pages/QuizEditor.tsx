import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { saveQuiz, loadQuiz, deleteQuiz } from '@/lib/quizzes';
import { Quiz, Question, QuestionType } from '@/types/quiz';
import { useToast } from '@/hooks/use-toast';
import { QuestionEditor } from '@/components/quiz/QuestionEditor';
import { ThemeEditor } from '@/components/quiz/ThemeEditor';
import { OutcomeEditor } from '@/components/quiz/OutcomeEditor';
import { AnalyticsDashboard } from '@/components/quiz/AnalyticsDashboard';
import { EnhancedAnalytics } from '@/components/quiz/EnhancedAnalytics';
import { VisualQuizEditor } from '@/components/quiz/visual-editor/VisualQuizEditor';
import { StageEditor } from '@/components/quiz/StageEditor';
import { PixelsManager, PixelSettings } from '@/components/quiz/PixelsManager';
import { EngagementManager } from '@/components/quiz/engagement/EngagementManager';
import { DemoUserManager } from '@/lib/demoUser';
import { WebhookManager } from '@/components/integrations/WebhookManager';
import { BranchingEditor } from '@/components/branching/BranchingEditor';
import { useAuth } from '@/hooks/useAuth';
import { PlanManager } from '@/lib/planManager';

import { PlanBadge } from '@/components/PlanBadge';
import {
  Plus, Save, Eye, Copy, ArrowLeft, ExternalLink, Settings, BarChart3, Palette, Trophy, Trash2, Play, Zap, Target, Crown, Check, X, Clock, Loader2, GitBranch
} from 'lucide-react';

// Validation and utility functions
const validateQuizForPublishing = (quiz: Quiz): string[] => {
  const errors: string[] = [];
  
  if (!quiz.steps || quiz.steps.length === 0) {
    errors.push('Pelo menos uma etapa é necessária');
  }
  
  quiz.steps?.forEach((stage, index) => {
    if (stage.components.length === 0) {
      errors.push(`Etapa ${index + 1} está vazia`);
    }
  });
  
  return errors;
};

const generatePublicId = (name: string): string => {
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${slug}-${randomSuffix}`;
};

const QuizEditor = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'stages' | 'questions' | 'outcomes' | 'theme' | 'settings' | 'pixels' | 'analytics' | 'engagement' | 'integrations'>('questions');
  const { user } = useAuth();
  const planManager = new PlanManager();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (!quizId) return;

    const loadQuizData = async () => {
      try {
        const loadedQuiz = await loadQuiz(quizId);
        setQuiz(loadedQuiz);
      } catch (error) {
        console.error('Error loading quiz:', error);
        toast({
          title: "Erro ao carregar quiz",
          description: "Não foi possível carregar o quiz.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadQuizData();
  }, [quizId, toast]);

  const handleSave = async () => {
    if (!quiz) return;

    setSaving(true);
    try {
      const updatedQuiz = {
        ...quiz,
        updatedAt: new Date().toISOString()
      };
      
      await saveQuiz(updatedQuiz);
      setQuiz(updatedQuiz);
      
      toast({
        title: "Quiz salvo com sucesso!",
        description: "Todas as alterações foram salvas."
      });
    } catch (error) {
      console.error('Error saving quiz:', error);
      toast({
        title: "Erro ao salvar",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!quiz) return;

    // Validation before publishing
    const errors = validateQuizForPublishing(quiz);
    if (errors.length > 0) {
      toast({
        title: "Erro na validação",
        description: `Corrija os seguintes problemas: ${errors.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    const updatedQuiz = {
      ...quiz,
      status: 'published' as const,
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publicId: quiz.publicId || generatePublicId(quiz.name)
    };

    try {
      await saveQuiz(updatedQuiz);
      setQuiz(updatedQuiz);
      
      // Analytics
      console.log('quiz_published', { 
        quizId: quiz.id, 
        publicId: updatedQuiz.publicId,
        stageCount: quiz.steps?.length || 0,
        componentCount: quiz.steps?.reduce((sum, stage) => sum + stage.components.length, 0) || 0
      });
      
      toast({
        title: "Quiz publicado!",
        description: `Disponível em: ${window.location.origin}/q/${updatedQuiz.publicId}`
      });
    } catch (error) {
      toast({
        title: "Erro ao publicar",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async () => {
    if (!quiz || !window.confirm('Tem certeza que deseja excluir este quiz? Esta ação não pode ser desfeita.')) return;

    try {
      await deleteQuiz(quiz.id);
      toast({
        title: "Quiz excluído",
        description: "O quiz foi excluído com sucesso."
      });
      navigate('/app');
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o quiz.",
        variant: "destructive"
      });
    }
  };

  const addQuestion = () => {
    if (!quiz) return;

    const newQuestion: Question = {
      id: crypto.randomUUID(),
      idx: quiz.questions.length + 1,
      type: 'single',
      title: 'Nova pergunta',
      description: '',
      options: [
        { id: '1', label: 'Opção A', score: 10 },
        { id: '2', label: 'Opção B', score: 5 }
      ],
      required: true
    };

    setQuiz({
      ...quiz,
      questions: [...quiz.questions, newQuestion]
    });
  };

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    if (!quiz) return;

    setQuiz({
      ...quiz,
      questions: quiz.questions.map(q => 
        q.id === questionId ? { ...q, ...updates } : q
      )
    });
  };

  const deleteQuestion = (questionId: string) => {
    if (!quiz) return;

    setQuiz({
      ...quiz,
      questions: quiz.questions
        .filter(q => q.id !== questionId)
        .map((q, index) => ({ ...q, idx: index + 1 }))
    });
  };

  const duplicateQuestion = (questionId: string) => {
    if (!quiz) return;

    const questionToDuplicate = quiz.questions.find(q => q.id === questionId);
    if (!questionToDuplicate) return;

    const newQuestion: Question = {
      ...questionToDuplicate,
      id: crypto.randomUUID(),
      idx: quiz.questions.length + 1,
      title: `${questionToDuplicate.title} (cópia)`,
      options: questionToDuplicate.options?.map(opt => ({
        ...opt,
        id: crypto.randomUUID()
      }))
    };

    setQuiz({
      ...quiz,
      questions: [...quiz.questions, newQuestion]
    });

    toast({
      title: "Pergunta duplicada",
      description: "Uma cópia da pergunta foi criada."
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && quiz) {
      const oldIndex = quiz.questions.findIndex(q => q.id === active.id);
      const newIndex = quiz.questions.findIndex(q => q.id === over?.id);

      const reorderedQuestions = arrayMove(quiz.questions, oldIndex, newIndex).map((q, index) => ({
        ...q,
        idx: index + 1
      }));

      setQuiz({
        ...quiz,
        questions: reorderedQuestions
      });
    }
  };

  const copyPublicLink = () => {
    if (!quiz) return;
    
    const url = `${window.location.origin}/q/${quiz.publicId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copiado!",
      description: "O link público do quiz foi copiado."
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Quiz não encontrado</h1>
          <Button onClick={() => navigate('/app')}>
            Voltar ao Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-50">
        <div className={`container mx-auto ${isMobile ? 'px-2 py-2' : 'px-4 py-4'}`}>
          <div className={`flex items-center ${isMobile ? 'flex-col gap-2' : 'justify-between'}`}>
            <div className={`flex items-center ${isMobile ? 'w-full justify-between' : 'gap-4'}`}>
              <Button
                variant="ghost"
                size={isMobile ? "sm" : "sm"}
                onClick={() => navigate('/app')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {!isMobile && 'Voltar'}
              </Button>
              
              <div className={isMobile ? 'text-center' : ''}>
                <h1 className={`font-bold ${isMobile ? 'text-lg' : 'text-xl'}`}>{quiz.name}</h1>
                {!isMobile && (
                  <p className="text-sm text-muted-foreground">
                    {quiz.questions.length} perguntas • {quiz.steps?.length || 0} etapas
                  </p>
                )}
              </div>
            </div>

            <div className={`flex items-center ${isMobile ? 'w-full justify-center flex-wrap gap-1' : 'gap-3'}`}>
              <Badge 
                variant={quiz.status === 'published' ? 'default' : 'secondary'}
                className={quiz.status === 'published' ? 'bg-green-100 text-green-800' : ''}
              >
                {quiz.status === 'published' ? 'Publicado' : 'Rascunho'}
              </Badge>

              {!isMobile && (
                <Button variant="outline" size="sm" onClick={() => window.open(`/q/${quiz.publicId}`, '_blank')}>
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              )}

              <Button variant="outline" size={isMobile ? "sm" : "sm"} onClick={copyPublicLink}>
                <Copy className="w-4 h-4 mr-2" />
                {!isMobile && 'Copiar link'}
              </Button>

              <Button onClick={handleSave} disabled={saving} size={isMobile ? "sm" : "sm"}>
                <Save className="w-4 h-4 mr-2" />
                {!isMobile ? (saving ? 'Salvando...' : 'Salvar') : ''}
              </Button>

              <Button 
                onClick={handlePublish} 
                className="bg-green-600 hover:bg-green-700" 
                size={isMobile ? "sm" : "sm"}
              >
                {!isMobile ? (quiz.status === 'published' ? 'Republicar' : 'Publicar') : 'Pub'}
              </Button>

              {!isMobile && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleDelete}
                  className="opacity-50 hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as string)} className={isMobile ? 'mt-2' : 'mt-4'}>
            <div className={isMobile ? 'overflow-x-auto' : ''}>
              <TabsList className={`grid w-full grid-cols-9 ${isMobile ? 'min-w-max' : 'max-w-6xl'}`}>
                <TabsTrigger value="questions" className={`${isMobile ? 'gap-1 text-xs px-2' : 'gap-2'}`}>
                  <Settings className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                  {!isMobile && 'Perguntas'}
                </TabsTrigger>
                <TabsTrigger value="theme" className={`${isMobile ? 'gap-1 text-xs px-2' : 'gap-2'}`}>
                  <Palette className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                  {!isMobile && 'Tema'}
                </TabsTrigger>
                <TabsTrigger value="stages" className={`${isMobile ? 'gap-1 text-xs px-2' : 'gap-2'}`}>
                  <Play className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                  {!isMobile && 'Editor'}
                </TabsTrigger>
                <TabsTrigger value="outcomes" className={`${isMobile ? 'gap-1 text-xs px-2' : 'gap-2'}`}>
                  <Trophy className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                  {!isMobile && 'Resultados'}
                </TabsTrigger>
                <TabsTrigger value="pixels" className={`${isMobile ? 'gap-1 text-xs px-2' : 'gap-2'}`}>
                  <Zap className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                  {!isMobile && 'Pixels'}
                </TabsTrigger>
                <TabsTrigger value="analytics" className={`${isMobile ? 'gap-1 text-xs px-2' : 'gap-2'}`}>
                  <BarChart3 className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                  {!isMobile && 'Analytics'}
                </TabsTrigger>
                 <TabsTrigger value="engagement" className={`${isMobile ? 'gap-1 text-xs px-2' : 'gap-2'}`}>
                   <Target className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                   {!isMobile && 'Engajamento'}
                 </TabsTrigger>
                 <TabsTrigger value="integrations" className={`${isMobile ? 'gap-1 text-xs px-2' : 'gap-2'}`}>
                   <Zap className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                   {!isMobile && 'Webhooks'}
                 </TabsTrigger>
                <TabsTrigger value="settings" className={`${isMobile ? 'gap-1 text-xs px-2' : 'gap-2'}`}>
                  <Settings className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                  {!isMobile && 'Config'}
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="mt-8">
              <TabsContent value="stages" className="mt-0">
                <StageEditor 
                  quiz={quiz}
                  onUpdate={setQuiz}
                  onSave={handleSave}
                  onPreview={() => window.open(`/q/${quiz.publicId}`, '_blank')}
                  onPublish={handlePublish}
                  onNavigateToTheme={() => setActiveTab('theme')}
                />
              </TabsContent>


              <TabsContent value="questions" className="mt-0">
                <div className="max-w-4xl mx-auto space-y-6">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={quiz.questions.map(q => q.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {quiz.questions.map((question, index) => (
                        <QuestionEditor
                          key={question.id}
                          question={question}
                          index={index}
                          onUpdate={updateQuestion}
                          onDelete={deleteQuestion}
                          onDuplicate={duplicateQuestion}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>

                  {/* Add Question Button */}
                  <Card className="p-8 text-center border-dashed">
                    <Button onClick={addQuestion} variant="outline" size="lg">
                      <Plus className="w-5 h-5 mr-2" />
                      Adicionar nova pergunta
                    </Button>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="outcomes" className="mt-0">
                <div className="max-w-4xl mx-auto">
                  <OutcomeEditor
                    outcomes={quiz.outcomes || {}}
                    quiz={quiz}
                    onUpdate={(outcomes) => setQuiz({ ...quiz, outcomes })}
                    onQuizUpdate={(updates) => setQuiz({ ...quiz, ...updates })}
                  />
                </div>
              </TabsContent>

              <TabsContent value="theme" className="mt-0">
                <div className="max-w-4xl mx-auto">
                  <ThemeEditor
                    theme={quiz.theme || { primary: '#2563EB', background: '#FFFFFF', text: '#0B0B0B' }}
                    quizId={quiz.id}
                    onUpdate={(theme) => {
                      // Atualizar quiz com novo tema
                      const updatedQuiz = { ...quiz, theme };
                      setQuiz(updatedQuiz);
                      
                      // Salvar tema específico para este quiz
                      localStorage.setItem(`quiz-theme-${quiz.id}`, JSON.stringify(theme));
                      
                      // Salvar como tema global (último usado)
                      localStorage.setItem('quiz-global-theme', JSON.stringify(theme));
                    }}
                  />
                </div>
              </TabsContent>

              <TabsContent value="settings" className="mt-0">
                <div className="max-w-2xl mx-auto space-y-6">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Informações Básicas</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Nome do Quiz</label>
                        <Input
                          value={quiz.name}
                          onChange={(e) => setQuiz({ ...quiz, name: e.target.value })}
                          placeholder="Digite o nome do quiz"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Descrição</label>
                        <Textarea
                          value={quiz.description || ''}
                          onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
                          placeholder="Descreva brevemente seu quiz"
                          rows={3}
                        />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Link Público</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">URL Padrão do Quiz</label>
                        <div className="flex gap-2">
                          <Input
                            value={`${window.location.origin}/q/${quiz.publicId}`}
                            readOnly
                            className="bg-muted"
                          />
                          <Button variant="outline" onClick={copyPublicLink}>
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" onClick={() => window.open(`/q/${quiz.publicId}`, '_blank')}>
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {(() => {
                        const userPlan = DemoUserManager.getCurrentUser()?.plan;
                        const isPro = userPlan === 'pro' || userPlan === 'premium';

                        if (!isPro) {
                          return (
                            <div className="p-4 border rounded-lg bg-accent/10">
                              <div className="flex items-start gap-3">
                                <Crown className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                <div className="space-y-2">
                                  <p className="font-medium">Domínio personalizado disponível apenas no PRO</p>
                                  <p className="text-sm text-muted-foreground">
                                    Configure seu próprio domínio (ex.: quiz.seusite.com) com o plano PRO.
                                  </p>
                                  <Button 
                                    size="sm" 
                                    onClick={() => DemoUserManager.upgradePlan('pro')}
                                    className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                                  >
                                    Fazer Upgrade para PRO
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div className="space-y-4 p-4 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">Domínio Personalizado</h4>
                              <PlanBadge plan={userPlan} size="sm" />
                            </div>
                            
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium mb-2">
                                  Seu domínio personalizado
                                </label>
                                <Input
                                  placeholder="ex.: quiz.seusite.com"
                                  value={quiz.customDomain?.domain || ''}
                                   onChange={(e) => {
                                     const domain = e.target.value;
                                     setQuiz({
                                       ...quiz,
                                       customDomain: {
                                         ...quiz.customDomain,
                                         enabled: !!domain,
                                         domain,
                                         status: domain ? 'pending' : 'pending'
                                       }
                                     });
                                   }}
                                />
                              </div>

                              {quiz.customDomain?.domain && (
                                <>
                                  <div className="p-3 bg-blue-50 rounded-lg text-sm">
                                    <p className="font-medium text-blue-900 mb-1">Instruções de configuração:</p>
                                    <p className="text-blue-700">
                                      Crie um registro CNAME apontando <code className="font-mono bg-white px-1 rounded">{quiz.customDomain.domain}</code> → <code className="font-mono bg-white px-1 rounded">quizzes.elevadoquizz.com</code>
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <Button 
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        // Simular validação de domínio
                                        setQuiz({
                                          ...quiz,
                                          customDomain: {
                                            ...quiz.customDomain,
                                            status: 'validating'
                                          }
                                        });
                                        
                                        setTimeout(() => {
                                          const isValid = Math.random() > 0.3; // 70% chance de validar
                                          setQuiz({
                                            ...quiz,
                                            customDomain: {
                                              ...quiz.customDomain,
                                              status: isValid ? 'validated' : 'error',
                                              lastValidated: new Date().toISOString(),
                                              errorMessage: isValid ? undefined : 'Configuração DNS não encontrada'
                                            }
                                          });
                                        }, 2000);
                                      }}
                                      disabled={quiz.customDomain.status === 'validating'}
                                    >
                                      {quiz.customDomain.status === 'validating' ? (
                                        <>
                                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                          Validando...
                                        </>
                                      ) : (
                                        'Validar Domínio'
                                      )}
                                    </Button>

                                    {quiz.customDomain.status === 'validated' && (
                                      <div className="flex items-center text-green-600 text-sm">
                                        <Check className="w-4 h-4 mr-1" />
                                        Domínio validado
                                      </div>
                                    )}

                                    {quiz.customDomain.status === 'error' && (
                                      <div className="flex items-center text-red-600 text-sm">
                                        <X className="w-4 h-4 mr-1" />
                                        {quiz.customDomain.errorMessage}
                                      </div>
                                    )}

                                    {quiz.customDomain.status === 'pending' && (
                                      <div className="flex items-center text-amber-600 text-sm">
                                        <Clock className="w-4 h-4 mr-1" />
                                        Aguardando propagação
                                      </div>
                                    )}
                                  </div>

                                  {quiz.customDomain.status === 'validated' && (
                                    <div className="p-3 bg-green-50 rounded-lg">
                                      <p className="text-sm text-green-700">
                                        🎉 Seu quiz agora está disponível em: <strong>{quiz.customDomain.domain}/q/{quiz.publicId}</strong>
                                      </p>
                                    </div>
                                  )}

                                  <p className="text-xs text-muted-foreground">
                                    Apenas 1 domínio personalizado por quiz no plano PRO. 
                                    Para múltiplos domínios, considere o plano PREMIUM.
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </Card>

                  <Card className="p-6 border-destructive/20">
                    <h3 className="text-lg font-semibold mb-4 text-destructive">Zona de Perigo</h3>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Excluir este quiz removerá permanentemente todas as perguntas, respostas e dados associados.
                        Esta ação não pode ser desfeita.
                      </p>
                      <Button 
                        variant="destructive" 
                        onClick={handleDelete}
                        className="w-full"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir Quiz Permanentemente
                      </Button>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="pixels" className="mt-0">
                <PixelsManager
                  pixelSettings={quiz.pixelSettings}
                  onUpdate={(pixelSettings) => setQuiz({ ...quiz, pixelSettings })}
                  quizPublicId={quiz.publicId}
                />
              </TabsContent>

              <TabsContent value="analytics" className="mt-0">
                <div className="space-y-6">
                  <AnalyticsDashboard quizId={quiz.id} />
                  <EnhancedAnalytics quizId={quiz.id} />
                </div>
              </TabsContent>

              <TabsContent value="engagement" className="mt-0">
                <div className="max-w-6xl mx-auto">
                  <EngagementManager 
                    theme={quiz.theme || { primary: '#2563EB', background: '#FFFFFF', text: '#0B0B0B' }}
                    onUpdate={(theme) => setQuiz({ ...quiz, theme })}
                    quizId={quiz.id}
                  />
                </div>
              </TabsContent>


              <TabsContent value="integrations" className="mt-0">
                <div className="max-w-4xl mx-auto">
                  <WebhookManager 
                    quizId={quiz.id}
                  />
                </div>
              </TabsContent>
              

            </div>
          </Tabs>
        </div>
      </header>
    </div>
  );
};

export default QuizEditor;