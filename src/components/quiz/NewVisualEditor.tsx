import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { DndContext, DragStartEvent, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Quiz, QuizStep, Component, ComponentType } from '@/types/quiz';
import { useQuizLoader } from '@/hooks/useQuizLoader';
import { useThemes } from '@/hooks/useThemes';
import { useToast } from '@/hooks/use-toast';
import { EnhancedComponentLibrary } from './visual-editor/EnhancedComponentLibrary';
import { VisualToolbar } from './visual-editor/VisualToolbar';
import { RealQuizPreview } from './RealQuizPreview';
import { 
  Play, Save, Eye, Settings, Wand2, CheckCircle, AlertCircle, 
  Layers, Plus, Trash2, Copy, Move, Edit3, Monitor, Tablet, Smartphone 
} from 'lucide-react';

interface NewVisualEditorProps {
  quiz: Quiz;
  onUpdate: (quiz: Quiz) => void;
  onSave: () => void;
  onPreview: () => void;
  onPublish: () => void;
  onNavigateToTheme: () => void;
}

export function NewVisualEditor({
  quiz,
  onUpdate,
  onSave,
  onPreview,
  onPublish,
  onNavigateToTheme
}: NewVisualEditorProps) {
  // Estados principais
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const [activeStepId, setActiveStepId] = useState<string>('');
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [draggedComponentType, setDraggedComponentType] = useState<ComponentType | null>(null);
  
  // Histórico para undo/redo
  const [history, setHistory] = useState<Quiz[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isDirty, setIsDirty] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);

  const { toast } = useToast();
  const { savedThemes, applyThemeToQuiz } = useThemes();
  const { autoLoadQuizContent, needsAutoLoad, saveQuizTheme, createStepsFromQuestions } = useQuizLoader(quiz);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    })
  );

  // Funções auxiliares de histórico
  const addToHistory = useCallback((newQuiz: Quiz) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ ...newQuiz });
    
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      setHistoryIndex(newHistory.length - 1);
    }
    
    setHistory(newHistory);
    setIsDirty(true);
  }, [history, historyIndex]);

  // ✅ SINCRONIZAR COM PERGUNTAS
  const handleSyncWithQuestions = useCallback(() => {
    if (!quiz.questions || quiz.questions.length === 0) {
      toast({
        title: "Nenhuma pergunta encontrada",
        description: "Adicione perguntas na aba Perguntas primeiro.",
        variant: "destructive"
      });
      return;
    }

    const confirmed = window.confirm(
      `Detectamos ${quiz.questions.length} perguntas na aba Perguntas.\n\nDeseja regerar o fluxo completo (Introdução → Perguntas → Resultado)?\n\nIsto sobrescreverá as etapas existentes.`
    );

    if (confirmed) {
      const newSteps = createStepsFromQuestions(quiz);
      const updatedQuiz = { ...quiz, steps: newSteps };
      
      onUpdate(updatedQuiz);
      setActiveStepId(newSteps[0]?.id || '');
      setIsInitialized(true);
      
      // Adicionar ao histórico
      addToHistory(updatedQuiz);
      
      toast({
        title: "Quiz sincronizado!",
        description: `Criado fluxo completo com ${newSteps.length} etapas baseadas nas suas perguntas.`
      });
    }
  }, [quiz.questions, quiz, createStepsFromQuestions, onUpdate, toast, addToHistory]);

  // Verificar se o quiz precisa ser auto-gerado
  const needsAutoGeneration = useMemo(() => {
    return needsAutoLoad(quiz) && !isInitialized;
  }, [quiz, isInitialized, needsAutoLoad]);

  // Função para gerar quiz automaticamente com tema e perguntas
  const generateQuizFromContent = useCallback(() => {
    if (needsAutoLoad(quiz)) {
      setIsAutoGenerating(true);
      
      try {
        const loadedQuiz = autoLoadQuizContent(quiz);
        onUpdate(loadedQuiz);
        
        setActiveStepId(loadedQuiz.steps?.[0]?.id || '');
        setIsInitialized(true);
        
        // Adicionar ao histórico
        setHistory([loadedQuiz]);
        setHistoryIndex(0);
        
        toast({
          title: "Quiz carregado automaticamente!",
          description: `Tema aplicado e ${loadedQuiz.steps?.length || 0} etapas criadas.`,
          duration: 3000
        });
      } catch (error) {
        console.error('Erro ao carregar quiz:', error);
        toast({
          title: "Erro no carregamento automático",
          description: "Não foi possível carregar o quiz. Configure manualmente.",
          variant: "destructive"
        });
      } finally {
        setIsAutoGenerating(false);
      }
    }
  }, [quiz, needsAutoLoad, autoLoadQuizContent, onUpdate, toast]);

  // Auto-inicialização quando necessário
  useEffect(() => {
    if (needsAutoGeneration && !isAutoGenerating) {
      console.log('🚀 Auto-gerando quiz com perguntas e tema...');
      generateQuizFromContent();
    } else if (!isInitialized && quiz.steps && quiz.steps.length > 0) {
      // Se já tem steps, apenas inicializar
      setActiveStepId(quiz.steps[0]?.id || '');
      setIsInitialized(true);
      setHistory([quiz]);
      setHistoryIndex(0);
    } else if (!isInitialized && !needsAutoGeneration) {
      // Não há conteúdo para gerar, inicializar vazio
      setIsInitialized(true);
      setHistory([quiz]);
      setHistoryIndex(0);
    }
  }, [needsAutoGeneration, isAutoGenerating, generateQuizFromContent, isInitialized, quiz]);

  // Funções de controle
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const previousQuiz = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      onUpdate(previousQuiz);
      setIsDirty(true);
      toast({
        title: "Desfeito",
        description: "Última ação foi desfeita."
      });
    }
  }, [history, historyIndex, onUpdate, toast]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextQuiz = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      onUpdate(nextQuiz);
      setIsDirty(true);
      toast({
        title: "Refeito",
        description: "Ação foi refeita."
      });
    }
  }, [history, historyIndex, onUpdate, toast]);

  const updateQuiz = useCallback((updater: (quiz: Quiz) => Quiz) => {
    const newQuiz = updater(quiz);
    onUpdate(newQuiz);
    addToHistory(newQuiz);
  }, [quiz, onUpdate, addToHistory]);

  // Gerenciamento de etapas
  const handleStepAdd = useCallback(() => {
    const newStep: QuizStep = {
      id: `step-${Date.now()}`,
      name: `Etapa ${(quiz.steps?.length || 0) + 1}`,
      title: 'Nova Etapa',
      components: []
    };
    
    updateQuiz(q => ({
      ...q,
      steps: [...(q.steps || []), newStep]
    }));
    
    setActiveStepId(newStep.id);
    
    toast({
      title: "Etapa criada",
      description: `Nova etapa "${newStep.name}" foi criada.`
    });
  }, [quiz.steps, updateQuiz, toast]);

  const handleStepDelete = useCallback((stepId: string) => {
    updateQuiz(quiz => ({
      ...quiz,
      steps: (quiz.steps || []).filter(step => step.id !== stepId)
    }));
    
    if (activeStepId === stepId) {
      const remainingSteps = quiz.steps?.filter(step => step.id !== stepId) || [];
      setActiveStepId(remainingSteps[0]?.id || '');
    }
    
    toast({
      title: "Etapa removida",
      description: "A etapa foi removida do quiz."
    });
  }, [quiz.steps, activeStepId, updateQuiz, toast]);

  // Estados derivados
  const currentStep = quiz.steps?.find(step => step.id === activeStepId);
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const componentCount = currentStep?.components.length || 0;

  // Renderização condicional baseada no estado
  if (!isInitialized || isAutoGenerating) {
    return (
      <div className="h-screen flex items-center justify-center bg-muted/30">
        <Card className="p-8 max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            {isAutoGenerating ? (
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <Wand2 className="w-8 h-8 text-primary" />
            )}
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {isAutoGenerating ? 'Gerando Quiz...' : 'Preparando Editor'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {isAutoGenerating 
              ? 'Aplicando tema e criando etapas baseadas nas suas perguntas...'
              : 'Carregando configurações e preparando o canvas visual...'
            }
          </p>
          {needsAutoGeneration && !isAutoGenerating && (
            <Button onClick={generateQuizFromContent} className="gap-2">
              <Wand2 className="w-4 h-4" />
              Gerar Quiz Automaticamente
            </Button>
          )}
        </Card>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors}>
      <div className="h-screen flex flex-col bg-background">
        {/* Toolbar superior */}
        <VisualToolbar
          quiz={quiz}
          isDirty={isDirty}
          autoSaving={autoSaving}
          canUndo={canUndo}
          canRedo={canRedo}
          componentCount={componentCount}
          onUpdateName={(name) => updateQuiz(q => ({ ...q, name }))}
          onSave={onSave}
          onPreview={onPreview}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onSyncWithQuestions={handleSyncWithQuestions}
        />

        {/* Layout principal */}
        <div className="flex-1 overflow-hidden">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Painel esquerdo: Biblioteca e Etapas */}
            <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
              <div className="h-full border-r bg-muted/20 flex flex-col">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm">Etapas do Quiz</h3>
                    <Button size="sm" variant="outline" onClick={handleStepAdd}>
                      <Plus className="w-3 h-3 mr-1" />
                      Nova
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {quiz.steps?.map((step, index) => (
                      <div
                        key={step.id}
                        className={`p-2 rounded border cursor-pointer transition-colors ${
                          activeStepId === step.id 
                            ? 'bg-primary text-primary-foreground border-primary' 
                            : 'bg-background hover:bg-muted border-muted-foreground/20'
                        }`}
                        onClick={() => setActiveStepId(step.id)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium truncate">
                            {step.name}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {step.components.length}
                          </Badge>
                        </div>
                      </div>
                    )) || (
                      <Alert>
                        <AlertCircle className="w-4 h-4" />
                        <AlertDescription className="text-xs">
                          Nenhuma etapa criada. Clique em "Nova" para começar.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto">
                  <EnhancedComponentLibrary onComponentAdd={() => {}} />
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Painel central: Canvas com Preview Real */}
            <ResizablePanel defaultSize={50} minSize={35}>
              <div className="h-full bg-slate-50 flex flex-col">
                {/* Controles de visualização */}
                <div className="p-3 border-b bg-card flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {currentStep?.name || 'Selecione uma etapa'}
                    </span>
                  </div>
                  <div className="flex items-center border rounded-lg p-1">
                    <Button 
                      variant={previewMode === 'desktop' ? 'default' : 'ghost'} 
                      size="sm" 
                      onClick={() => setPreviewMode('desktop')}
                    >
                      <Monitor className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant={previewMode === 'tablet' ? 'default' : 'ghost'} 
                      size="sm" 
                      onClick={() => setPreviewMode('tablet')}
                    >
                      <Tablet className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant={previewMode === 'mobile' ? 'default' : 'ghost'} 
                      size="sm" 
                      onClick={() => setPreviewMode('mobile')}
                    >
                      <Smartphone className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Canvas com Preview Real */}
                <div className="flex-1 overflow-hidden">
                  {currentStep ? (
                    <RealQuizPreview 
                      quiz={quiz}
                      activeStepId={currentStep.id}
                      className="h-full"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center p-8">
                      <div className="text-center">
                        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                        <h3 className="text-lg font-semibold mb-2">Nenhuma Etapa Selecionada</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Selecione uma etapa na barra lateral ou crie uma nova para começar
                        </p>
                        <Button onClick={handleStepAdd}>
                          <Plus className="w-4 h-4 mr-2" />
                          Criar Primeira Etapa
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Painel direito: Propriedades */}
            <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
              <div className="h-full border-l bg-card">
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-sm">Propriedades do Quiz</h3>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Informações</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Etapas:</span>
                        <Badge variant="secondary">{quiz.steps?.length || 0}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Perguntas:</span>
                        <Badge variant="secondary">{quiz.questions?.length || 0}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant={quiz.status === 'published' ? 'default' : 'secondary'}>
                          {quiz.status === 'published' ? 'Publicado' : 'Rascunho'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Tema Aplicado</h4>
                    <div className="space-y-2">
                      {quiz.theme ? (
                        <div className="p-3 rounded border bg-muted/50">
                          <div className="flex items-center gap-2 mb-2">
                            <div 
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: quiz.theme.primary }}
                            />
                            <span className="text-sm font-medium">Tema Personalizado</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Cores, fontes e estilos aplicados
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <Settings className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                          <p className="text-sm text-muted-foreground">
                            Configure um tema na aba Tema
                          </p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            onClick={onNavigateToTheme}
                          >
                            Ir para Tema
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Preview</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      O preview mostra exatamente como seu quiz será exibido quando publicado.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={onPreview}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Abrir Preview Completo
                    </Button>
                  </div>
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </DndContext>
  );
}