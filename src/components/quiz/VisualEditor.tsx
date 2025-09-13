import { useState, useCallback, useEffect, useRef } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Quiz, QuizStep, Component, ComponentType } from '@/types/quiz';
import { ComponentLibrary } from './ComponentLibrary';
import { VisualToolbar } from './visual-editor/VisualToolbar';
import { SimpleCanvas } from './visual-editor/SimpleCanvas';
import { SimplePropertyPanel } from './visual-editor/SimplePropertyPanel';
import { StepManager } from './visual-editor/StepManager';
import { InteractiveQuizPreview } from './InteractiveQuizPreview';
import { useToast } from '@/hooks/use-toast';
import { saveQuiz } from '@/lib/quizzes';
import { useQuizLoader } from '@/hooks/useQuizLoader';

interface VisualEditorProps {
  quiz: Quiz;
  onUpdate: (quiz: Quiz) => void;
  onSave: () => void;
  onPreview: () => void;
}

const DEFAULT_COMPONENTS: Record<ComponentType, Partial<Component>> = {
  text: {
    type: 'text' as ComponentType,
    content: {
      text: 'Novo texto',
      style: 'normal'
    }
  },
  title: {
    type: 'title' as ComponentType,
    content: {
      text: 'Novo título',
      level: 'h2'
    }
  },
  image: {
    type: 'image' as ComponentType,
    content: {
      src: '',
      alt: 'Imagem',
      width: '100%'
    }
  },
  video: {
    type: 'video' as ComponentType,
    content: {
      src: '',
      autoplay: false,
      controls: true
    }
  },
  button: {
    type: 'button' as ComponentType,
    content: {
      text: 'Clique aqui',
      style: 'primary',
      action: 'next'
    }
  },
  input: {
    type: 'input' as ComponentType,
    content: {
      label: 'Sua resposta',
      type: 'text',
      required: false
    }
  },
  faq: {
    type: 'faq' as ComponentType,
    content: {
      items: [{
        question: 'Pergunta?',
        answer: 'Resposta...'
      }]
    }
  },
  testimonial: {
    type: 'testimonial' as ComponentType,
    content: {
      quote: 'Excelente!',
      author: 'Cliente',
      avatar: ''
    }
  },
  carousel: {
    type: 'carousel' as ComponentType,
    content: {
      items: [],
      autoplay: false
    }
  },
  comparison: {
    type: 'comparison' as ComponentType,
    content: {
      items: [],
      layout: 'table'
    }
  },
  chart: {
    type: 'chart' as ComponentType,
    content: {
      type: 'bar',
      data: [],
      title: 'Gráfico'
    }
  },
  confetti: {
    type: 'confetti' as ComponentType,
    content: {
      trigger: 'manual',
      preset: 'celebration'
    }
  },
  pricing: {
    type: 'pricing' as ComponentType,
    content: {
      plans: [],
      layout: 'cards'
    }
  },
  marquee: {
    type: 'marquee' as ComponentType,
    content: {
      text: 'Texto rolante...',
      speed: 'normal'
    }
  },
  spacer: {
    type: 'spacer' as ComponentType,
    content: {
      height: '20px'
    }
  },
  terms: {
    type: 'terms' as ComponentType,
    content: {
      text: 'Aceito os termos e condições',
      required: true
    }
  },
  multiple_choice: {
    type: 'multiple_choice' as ComponentType,
    content: {
      question: 'Qual sua preferência?',
      options: [{
        id: '1',
        label: 'Opção A',
        score: 10
      }, {
        id: '2',
        label: 'Opção B',
        score: 5
      }],
      allowMultiple: false,
      required: true
    }
  },
  level_slider: {
    type: 'level_slider' as ComponentType,
    content: {
      label: 'Avalie de 1 a 10',
      min: 1,
      max: 10,
      step: 1,
      defaultValue: 5
    }
  },
  rating: {
    type: 'rating' as ComponentType,
    content: {
      label: 'Avalie de 1 a 5',
      maxRating: 5,
      defaultValue: 0,
      required: false
    }
  }
};

export function VisualEditor({
  quiz,
  onUpdate,
  onSave,
  onPreview
}: VisualEditorProps) {
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [draggedComponent, setDraggedComponent] = useState<ComponentType | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [history, setHistory] = useState<Quiz[]>([quiz]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [autoSaving, setAutoSaving] = useState(false);
  const [activeStepId, setActiveStepId] = useState<string>(() => quiz.steps?.[0]?.id || '');
  const [isPreviewMode, setIsPreviewMode] = useState(false); // Não inicia em preview para aplicar tema primeiro
  const [hasInitialized, setHasInitialized] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();
  
  // Hook para carregamento automático de conteúdo
  const {
    autoLoadQuizContent,
    needsAutoLoad,
    saveQuizTheme
  } = useQuizLoader(quiz);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    })
  );

  // Auto-save functionality
  const triggerAutoSave = useCallback((quizToSave: Quiz) => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        setAutoSaving(true);
        const updatedQuiz = {
          ...quizToSave,
          updatedAt: new Date().toISOString()
        };
        await saveQuiz(updatedQuiz);
        setIsDirty(false);
        
        toast({
          title: "Salvo automaticamente",
          description: "Suas alterações foram salvas.",
          duration: 2000
        });
      } catch (error) {
        console.error('Auto-save failed:', error);
        toast({
          title: "Erro no salvamento automático",
          description: "Tente salvar manualmente.",
          variant: "destructive",
          duration: 3000
        });
      } finally {
        setAutoSaving(false);
      }
    }, 2000); // Auto-save after 2 seconds of inactivity
  }, [toast]);

  // Cleanup auto-save timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Usar a etapa ativa ou a primeira disponível
  const currentStage = quiz.steps?.find(step => step.id === activeStepId) || quiz.steps?.[0] || null;
  const selectedComponent = currentStage && selectedComponentId 
    ? currentStage.components.find(c => c.id === selectedComponentId) 
    : null;

  // Sistema de carregamento automático - sempre verificar e carregar conteúdo
  useEffect(() => {
    if (!hasInitialized) {
      console.log('🔄 Inicializando VisualEditor - Quiz atual:', {
        hasQuestions: quiz.questions?.length || 0,
        hasSteps: quiz.steps?.length || 0,
        hasTheme: !!quiz.theme
      });
      
      // SEMPRE aplicar carregamento automático para garantir que tema e perguntas sejam aplicados
      const loadedQuiz = autoLoadQuizContent(quiz);
      
      console.log('✅ Quiz carregado com conteúdo:', {
        stepsCarregadas: loadedQuiz.steps?.length || 0,
        primeiraStep: loadedQuiz.steps?.[0]?.title,
        componentesNaPrimeira: loadedQuiz.steps?.[0]?.components?.length || 0
      });
      
      // Aplicar o conteúdo carregado automaticamente
      onUpdate(loadedQuiz);
      
      // Definir a primeira etapa como ativa
      if (loadedQuiz.steps && loadedQuiz.steps.length > 0) {
        setActiveStepId(loadedQuiz.steps[0].id);
      }
      
      setHasInitialized(true);
      
      toast({
        title: "Tema e conteúdo carregados",
        description: "O editor foi configurado automaticamente com tema e perguntas.",
        duration: 3000
      });
    } else if (!hasInitialized) {
      // Se não precisa de auto-load, apenas marcar como inicializado
      setHasInitialized(true);
    }
  }, [hasInitialized, quiz, autoLoadQuizContent, needsAutoLoad, onUpdate, toast]);

  // Atualizar activeStepId quando mudarem as etapas
  useEffect(() => {
    if (quiz.steps?.length && activeStepId && !quiz.steps.find(step => step.id === activeStepId)) {
      setActiveStepId(quiz.steps[0].id);
    }
  }, [quiz.steps, activeStepId]);

  // Salvar tema automaticamente quando for alterado
  useEffect(() => {
    if (hasInitialized && quiz.theme) {
      saveQuizTheme(quiz, quiz.theme);
    }
  }, [quiz.theme, hasInitialized, saveQuizTheme, quiz]);

  const updateQuiz = useCallback((updater: (quiz: Quiz) => Quiz) => {
    const newQuiz = updater(quiz);
    onUpdate(newQuiz);
    setIsDirty(true);
    
    // Add to history for undo/redo
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newQuiz);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    // Trigger autosave
    triggerAutoSave(newQuiz);
  }, [quiz, onUpdate, history, historyIndex]);

  const ensureStageExists = useCallback(() => {
    if (!quiz.steps || quiz.steps.length === 0) {
      const newStage: QuizStep = {
        id: `stage-${Date.now()}`,
        name: 'Página Principal',
        title: '',
        components: []
      };
      
      updateQuiz(q => ({
        ...q,
        steps: [newStage]
      }));
      
      return newStage.id;
    }
    return quiz.steps[0].id;
  }, [quiz.steps, updateQuiz]);

  const addComponent = useCallback((type: ComponentType) => {
    const stageId = activeStepId || ensureStageExists();
    const defaultComponent = DEFAULT_COMPONENTS[type];
    
    const newComponent: Component = {
      id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      content: defaultComponent.content || {},
      style: defaultComponent.style,
      conditions: defaultComponent.conditions
    };

    updateQuiz(q => ({
      ...q,
      steps: q.steps!.map(stage => stage.id === stageId ? {
        ...stage,
        components: [...stage.components, newComponent]
      } : stage)
    }));
    
    setSelectedComponentId(newComponent.id);
    
    toast({
      title: "Componente adicionado",
      description: `${type} foi adicionado à página.`
    });
  }, [activeStepId, ensureStageExists, updateQuiz, toast]);

  const handleStepAdd = useCallback(() => {
    const newStep: QuizStep = {
      id: `step-${Date.now()}`,
      name: `Etapa ${(quiz.steps?.length || 0) + 1}`,
      title: '',
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

  const handleStepUpdate = useCallback((stepId: string, updates: Partial<QuizStep>) => {
    updateQuiz(quiz => ({
      ...quiz,
      steps: (quiz.steps || []).map(step => 
        step.id === stepId ? { ...step, ...updates } : step
      )
    }));
  }, [updateQuiz]);

  const handleStepDelete = useCallback((stepId: string) => {
    const stepIndex = quiz.steps?.findIndex(step => step.id === stepId) || -1;
    
    updateQuiz(quiz => ({
      ...quiz,
      steps: (quiz.steps || []).filter(step => step.id !== stepId)
    }));
    
    // Se era a etapa ativa, mudar para outra
    if (activeStepId === stepId) {
      const remainingSteps = quiz.steps?.filter(step => step.id !== stepId) || [];
      if (remainingSteps.length > 0) {
        const newActiveIndex = Math.max(0, stepIndex - 1);
        setActiveStepId(remainingSteps[newActiveIndex]?.id || remainingSteps[0].id);
      } else {
        setActiveStepId('');
      }
    }
    
    toast({
      title: "Etapa removida",
      description: "A etapa foi removida do quiz."
    });
  }, [quiz.steps, activeStepId, updateQuiz, toast]);

  const updateComponent = useCallback((componentId: string, updates: Partial<Component>) => {
    updateQuiz(quiz => ({
      ...quiz,
      steps: (quiz.steps || []).map(stage => ({
        ...stage,
        components: stage.components.map(comp => 
          comp.id === componentId ? { ...comp, ...updates } : comp
        )
      }))
    }));
  }, [updateQuiz]);

  const deleteComponent = useCallback((componentId: string) => {
    updateQuiz(quiz => ({
      ...quiz,
      steps: (quiz.steps || []).map(stage => ({
        ...stage,
        components: stage.components.filter(comp => comp.id !== componentId)
      }))
    }));
    
    if (selectedComponentId === componentId) {
      setSelectedComponentId(null);
    }
    
    toast({
      title: "Componente removido",
      description: "O componente foi removido da página."
    });
  }, [updateQuiz, selectedComponentId, toast]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (typeof active.id === 'string' && active.id.startsWith('component-')) {
      setDraggedComponent(active.id.replace('component-', '') as ComponentType);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    // Dragging component from library
    if (typeof active.id === 'string' && active.id.startsWith('component-')) {
      if (over && over.id === 'visual-canvas') {
        const componentType = active.id.replace('component-', '') as ComponentType;
        addComponent(componentType);
        
        toast({
          title: "Componente adicionado",
          description: `${componentType.replace('_', ' ')} foi adicionado com sucesso!`,
          duration: 2000
        });
      }
      setDraggedComponent(null);
      return;
    }

    // Reordering components within stage
    if (over && currentStage && active.id !== over.id) {
      const oldIndex = currentStage.components.findIndex(c => c.id === active.id);
      const newIndex = currentStage.components.findIndex(c => c.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedComponents = arrayMove(currentStage.components, oldIndex, newIndex);
        
        updateQuiz(q => ({
          ...q,
          steps: q.steps!.map(stage => 
            stage.id === currentStage.id ? { ...stage, components: reorderedComponents } : stage
          )
        }));
        
        toast({
          title: "Componente reordenado",
          description: "A ordem dos componentes foi atualizada.",
          duration: 1500
        });
      }
    }
    
    setDraggedComponent(null);
  };

  const handleSave = useCallback(() => {
    onSave();
    setIsDirty(false);
    
    toast({
      title: "Salvo com sucesso",
      description: "Todas as alterações foram salvas."
    });
  }, [onSave, toast]);

  const handleUpdateName = useCallback((name: string) => {
    updateQuiz(quiz => ({ ...quiz, name }));
  }, [updateQuiz]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const previousQuiz = history[newIndex];
      onUpdate(previousQuiz);
      setHistoryIndex(newIndex);
      setIsDirty(true);
      
      toast({
        title: "Alteração desfeita",
        description: "A última alteração foi desfeita."
      });
    }
  }, [historyIndex, history, onUpdate, toast]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const nextQuiz = history[newIndex];
      onUpdate(nextQuiz);
      setHistoryIndex(newIndex);
      setIsDirty(true);
      
      toast({
        title: "Alteração refeita",
        description: "A alteração foi refeita."
      });
    }
  }, [historyIndex, history, onUpdate, toast]);

  const updateStage = useCallback((updates: Partial<QuizStep>) => {
    if (!currentStage) return;
    
    updateQuiz(quiz => ({
      ...quiz,
      steps: quiz.steps!.map(stage => 
        stage.id === currentStage.id ? { ...stage, ...updates } : stage
      )
    }));
  }, [currentStage, updateQuiz]);

  const handleUpdateStageTitle = useCallback((title: string) => {
    updateStage({ title });
  }, [updateStage]);

  // Se há etapas configuradas e iniciou em preview, mostrar preview interativo
  if (isPreviewMode && hasInitialized && quiz.steps && quiz.steps.length > 0) {
    return (
      <InteractiveQuizPreview
        quiz={quiz}
        onEditMode={() => setIsPreviewMode(false)}
        onSave={onSave}
        onPreview={onPreview}
      />
    );
  }

  // Mostrar loading enquanto não inicializou
  if (!hasInitialized) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-lg font-medium">Carregando Editor Avançado...</div>
          <div className="text-sm text-muted-foreground">Aplicando tema e configurações</div>
        </div>
      </div>
    );
  }

  return (
    <DndContext 
      sensors={sensors} 
      onDragStart={handleDragStart} 
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen flex flex-col bg-background">
        {/* Toolbar */}
        <VisualToolbar
          quiz={quiz}
          isDirty={isDirty}
          autoSaving={autoSaving}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          componentCount={currentStage?.components.length || 0}
          onUpdateName={handleUpdateName}
          onSave={handleSave}
          onPreview={() => setIsPreviewMode(true)}
          onUndo={handleUndo}
          onRedo={handleRedo}
        />

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <ResizablePanelGroup direction="horizontal">
            {/* Left Panel - Steps & Components */}
            <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
              <div className="h-full border-r bg-muted/30 flex flex-col">
                <div className="p-3 border-b">
                  <StepManager
                    steps={quiz.steps || []}
                    activeStepId={activeStepId}
                    onStepSelect={setActiveStepId}
                    onStepAdd={handleStepAdd}
                    onStepUpdate={handleStepUpdate}
                    onStepDelete={handleStepDelete}
                  />
                </div>
                <div className="flex-1 overflow-hidden">
                  <ComponentLibrary onAddComponent={addComponent} />
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle />

            {/* Center Panel - Visual Canvas */}
            <ResizablePanel defaultSize={50} minSize={30}>
              <SimpleCanvas 
                stage={currentStage}
                selectedComponentId={selectedComponentId}
                onSelectComponent={setSelectedComponentId}
                onUpdateComponent={updateComponent}
                onDeleteComponent={deleteComponent}
                onUpdateStageTitle={handleUpdateStageTitle}
              />
            </ResizablePanel>

            <ResizableHandle />

            {/* Right Panel - Properties */}
            <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
              <SimplePropertyPanel 
                quiz={quiz}
                stage={currentStage}
                component={selectedComponent}
                onUpdateQuiz={(updates) => updateQuiz(quiz => ({ ...quiz, ...updates }))}
                onUpdateStage={updateStage}
                onUpdateComponent={(updates) => selectedComponentId && updateComponent(selectedComponentId, updates)}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>

      <DragOverlay dropAnimation={{ duration: 150, easing: 'ease-out' }}>
        {draggedComponent && (
          <div className="bg-primary text-primary-foreground px-4 py-3 rounded-lg shadow-2xl border-2 border-primary-foreground/20 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
                <div className="w-4 h-4 bg-primary-foreground rounded" />
              </div>
              <div>
                <div className="font-medium text-sm capitalize">
                  {draggedComponent.replace('_', ' ')}
                </div>
                <div className="text-xs opacity-75">
                  Solte no canvas para adicionar
                </div>
              </div>
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}