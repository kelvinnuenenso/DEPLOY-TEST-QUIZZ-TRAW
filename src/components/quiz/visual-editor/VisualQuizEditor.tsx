import { useState, useCallback, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult, DragOverlay } from 'react-beautiful-dnd';
import { DndContext, DragStartEvent, DragEndEvent, useDroppable } from '@dnd-kit/core';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { ComponentLibrary } from './ComponentLibrary';
import { StepManager } from './StepManager';
import { ComponentEditor } from './ComponentEditor';
import { PreviewPanel } from './PreviewPanel';
import { Quiz, QuizStep, Component } from '@/types/quiz';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, Save, Eye, Smartphone, Tablet, Monitor, Undo, Redo, 
  Zap, AlertCircle, CheckCircle, Settings, Layers, Move
} from 'lucide-react';

interface VisualQuizEditorProps {
  quiz: Quiz;
  onUpdate: (quiz: Quiz) => void;
  onSave: () => void;
}
export function VisualQuizEditor({
  quiz,
  onUpdate: updateQuiz,
  onSave
}: VisualQuizEditorProps) {
  const [activeStepId, setActiveStepId] = useState<string>(quiz.steps?.[0]?.id || '');
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [history, setHistory] = useState<Quiz[]>([quiz]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const { toast } = useToast();
  
  const activeStep = quiz.steps?.find(step => step.id === activeStepId);
  const selectedComponent = activeStep?.components.find(comp => comp.id === selectedComponentId);

  // Sistema de undo/redo otimizado
  const pushToHistory = useCallback((newQuiz: Quiz) => {
    try {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(newQuiz))); // Deep copy seguro
      
      // Limitar histórico para evitar uso excessivo de memória
      if (newHistory.length > 50) {
        newHistory.shift();
      } else {
        setHistoryIndex(newHistory.length - 1);
      }
      
      setHistory(newHistory);
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error('Erro ao salvar no histórico:', error);
      toast({
        title: "Aviso",
        description: "Erro ao salvar histórico de alterações.",
        variant: "destructive"
      });
    }
  }, [history, historyIndex, toast]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const previousQuiz = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      updateQuiz(previousQuiz);
      toast({
        title: "Desfeito",
        description: "Última ação foi desfeita.",
        duration: 2000
      });
    }
  }, [historyIndex, history, updateQuiz, toast]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextQuiz = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      updateQuiz(nextQuiz);
      toast({
        title: "Refeito",
        description: "Ação foi refeita.",
        duration: 2000
      });
    }
  }, [historyIndex, history, updateQuiz, toast]);

  // Salvar alterações com loading
  const handleSave = useCallback(async () => {
    setIsLoading(true);
    try {
      await onSave();
      setHasUnsavedChanges(false);
      toast({
        title: "Salvo com sucesso!",
        description: "Todas as alterações foram salvas.",
        duration: 3000
      });
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o quiz. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [onSave, toast]);

  // Atualizar quiz e histórico de forma otimizada
  const updateQuizWithHistory = useCallback((newQuiz: Quiz) => {
    const currentQuizString = JSON.stringify(quiz);
    const newQuizString = JSON.stringify(newQuiz);
    
    // Só atualiza se houve mudança real
    if (currentQuizString !== newQuizString) {
      pushToHistory(newQuiz);
      updateQuiz(newQuiz);
    }
  }, [updateQuiz, quiz, pushToHistory]);

  // Função para renderizar preview dos componentes (movida para dentro do componente)
  const renderComponentPreview = useCallback((component: Component): React.ReactNode => {
    const { type, content } = component;
    
    try {
      switch (type) {
        case 'text':
          return <p className="text-sm truncate">{content?.text || 'Texto vazio'}</p>;
          
        case 'title':
          const HeadingTag = content?.level === 'h1' ? 'h1' : content?.level === 'h3' ? 'h3' : 'h2';
          return <HeadingTag className="text-lg font-bold truncate">{content?.text || 'Título vazio'}</HeadingTag>;
          
        case 'button':
          return (
            <Button 
              variant={content?.variant || 'default'} 
              size="sm" 
              className="pointer-events-none"
            >
              {content?.text || 'Botão'}
            </Button>
          );
          
        case 'input':
          return (
            <div className="space-y-1">
              <label className="text-xs font-medium">{content?.label || 'Label'}</label>
              <div className="p-2 border rounded text-xs bg-muted/50">
                {content?.placeholder || 'Campo de entrada'}
              </div>
            </div>
          );
          
        case 'multiple_choice':
          return (
            <div className="space-y-2">
              <p className="text-sm font-medium truncate">{content?.question || 'Pergunta'}</p>
              <div className="space-y-1">
                {(content?.options || []).slice(0, 2).map((option: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 border rounded bg-background" />
                    <span className="truncate">{option?.text || option || `Opção ${idx + 1}`}</span>
                  </div>
                ))}
                {(content?.options?.length || 0) > 2 && (
                  <div className="text-xs text-muted-foreground">
                    +{(content?.options?.length || 0) - 2} mais opções
                  </div>
                )}
              </div>
            </div>
          );
          
        case 'level_slider':
          return (
            <div className="space-y-2">
              <p className="text-sm font-medium truncate">{content?.label || 'Slider'}</p>
              <div className="h-2 bg-muted rounded relative">
                <div 
                  className="h-full bg-primary rounded transition-all" 
                  style={{ width: `${((content?.defaultValue || 5) / (content?.max || 10)) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{content?.min || 1}</span>
                <span>{content?.max || 10}</span>
              </div>
            </div>
          );
          
        case 'image':
          return (
            <div className="w-full h-20 bg-muted rounded flex items-center justify-center text-xs border-2 border-dashed">
              {content?.src && content?.src !== '/placeholder.svg' ? (
                <img 
                  src={content.src} 
                  alt={content?.alt || 'Imagem'} 
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <div className="text-center">
                  <div className="text-2xl mb-1">📷</div>
                  <div>Imagem</div>
                </div>
              )}
            </div>
          );
          
        case 'video':
          return (
            <div className="w-full h-16 bg-muted rounded flex items-center justify-center text-xs border-2 border-dashed">
              <div className="text-center">
                <div className="text-xl mb-1">🎥</div>
                <div>Vídeo</div>
              </div>
            </div>
          );
          
        case 'carousel':
          return (
            <div className="space-y-2">
              <p className="text-xs font-medium truncate">{content?.title || 'Galeria'}</p>
              <div className="flex gap-1 overflow-hidden">
                {(content?.images || []).slice(0, 3).map((img: any, i: number) => (
                  <div key={i} className="w-8 h-8 bg-muted rounded flex items-center justify-center text-xs border">
                    {i + 1}
                  </div>
                ))}
                {(content?.images?.length || 0) > 3 && (
                  <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center text-xs">
                    +{(content?.images?.length || 0) - 3}
                  </div>
                )}
              </div>
            </div>
          );
          
        case 'testimonial':
          return (
            <div className="p-2 bg-muted/50 rounded space-y-1 border">
              <p className="text-xs italic truncate">"{(content?.text || 'Depoimento...').slice(0, 40)}..."</p>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-primary/20 rounded-full" />
                <p className="text-xs font-medium truncate">{content?.author || 'Autor'}</p>
              </div>
              {content?.rating && (
                <div className="flex gap-1">
                  {Array.from({ length: content.rating }).map((_, i) => (
                    <span key={i} className="text-xs text-yellow-500">⭐</span>
                  ))}
                </div>
              )}
            </div>
          );
          
        case 'faq':
          return (
            <div className="space-y-1">
              <p className="text-xs font-medium truncate">{content?.title || 'FAQ'}</p>
              <div className="text-xs text-muted-foreground">
                📋 {(content?.questions?.length || 0)} perguntas
              </div>
            </div>
          );
          
        case 'comparison':
          return (
            <div className="space-y-2">
              <p className="text-xs font-medium truncate">{content?.title || 'Comparação'}</p>
              <div className="flex gap-1">
                {(content?.items || []).slice(0, 2).map((item: any, idx: number) => (
                  <div key={idx} className="flex-1 p-1 bg-muted rounded text-xs text-center border">
                    <div className="truncate">{item?.title || `Item ${idx + 1}`}</div>
                  </div>
                ))}
              </div>
            </div>
          );
          
        case 'chart':
          return (
            <div className="space-y-2">
              <p className="text-xs font-medium truncate">{content?.title || 'Gráfico'}</p>
              <div className="h-12 bg-muted rounded flex items-end justify-center gap-1 p-1 border">
                {[1, 2, 3, 4].map(i => (
                  <div 
                    key={i} 
                    className="bg-primary w-2 rounded-t transition-all" 
                    style={{ height: `${20 + i * 5}px` }}
                  />
                ))}
              </div>
            </div>
          );
          
        case 'pricing':
          return (
            <div className="space-y-2">
              <p className="text-xs font-medium truncate">{content?.title || 'Preços'}</p>
              <div className="flex gap-1">
                {(content?.plans || []).slice(0, 2).map((plan: any, idx: number) => (
                  <div key={idx} className="flex-1 p-1 bg-muted rounded text-center border">
                    <div className="text-xs font-medium truncate">{plan?.name || `Plano ${idx + 1}`}</div>
                    <div className="text-xs text-primary">{plan?.price || 'R$ 0'}</div>
                  </div>
                ))}
              </div>
            </div>
          );
          
        case 'confetti':
          return (
            <div className="h-12 bg-gradient-to-r from-pink-100 to-purple-100 rounded flex items-center justify-center text-xs border-2 border-dashed">
              🎉 Efeito Confetti
            </div>
          );
          
        case 'marquee':
          return (
            <div className="h-8 bg-primary/90 rounded flex items-center justify-center text-xs text-primary-foreground overflow-hidden">
              <div className="truncate">➤ {(content?.text || 'Texto rolante...').slice(0, 25)}...</div>
            </div>
          );
          
        case 'terms':
          return (
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 border rounded bg-background" />
              <span className="truncate">{(content?.text || 'Aceitar termos...').slice(0, 30)}...</span>
            </div>
          );
          
        case 'spacer':
          const height = Math.min(content?.height || 40, 80);
          return (
            <div 
              className="bg-muted/30 border-2 border-dashed rounded flex items-center justify-center text-xs text-muted-foreground"
              style={{ height: `${height}px` }}
            >
              ↕️ Espaçador ({content?.height || 40}px)
            </div>
          );
          
        default:
          return (
            <div className="text-muted-foreground text-xs text-center p-2 border-2 border-dashed rounded">
              <div className="text-lg mb-1">📦</div>
              <div>Componente {type}</div>
            </div>
          );
      }
    } catch (error) {
      console.error('Erro ao renderizar preview do componente:', error);
      return (
        <div className="text-red-500 text-xs text-center p-2 border border-red-200 rounded">
          ⚠️ Erro no componente
        </div>
      );
    }
  }, []);

  // Gerenciar etapas com validação
  const addStep = useCallback(() => {
    try {
      const newStep: QuizStep = {
        id: crypto.randomUUID(),
        name: `Etapa ${(quiz.steps?.length || 0) + 1}`,
        title: 'Nova Etapa',
        components: []
      };
      
      const updatedQuiz = {
        ...quiz,
        steps: [...(quiz.steps || []), newStep]
      };
      
      updateQuizWithHistory(updatedQuiz);
      setActiveStepId(newStep.id);
      
      toast({
        title: "Etapa criada",
        description: `${newStep.name} foi adicionada com sucesso!`
      });
    } catch (error) {
      console.error('Erro ao adicionar etapa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a etapa.",
        variant: "destructive"
      });
    }
  }, [quiz, updateQuizWithHistory, toast]);

  const updateStep = useCallback((stepId: string, updates: Partial<QuizStep>) => {
    try {
      const updatedQuiz = {
        ...quiz,
        steps: (quiz.steps || []).map(step => 
          step.id === stepId ? { ...step, ...updates } : step
        )
      };
      updateQuizWithHistory(updatedQuiz);
    } catch (error) {
      console.error('Erro ao atualizar etapa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a etapa.",
        variant: "destructive"
      });
    }
  }, [quiz, updateQuizWithHistory, toast]);

  const deleteStep = useCallback((stepId: string) => {
    try {
      const updatedQuiz = {
        ...quiz,
        steps: (quiz.steps || []).filter(step => step.id !== stepId)
      };
      
      updateQuizWithHistory(updatedQuiz);
      
      if (activeStepId === stepId && updatedQuiz.steps.length > 0) {
        setActiveStepId(updatedQuiz.steps[0].id);
      }
      
      toast({
        title: "Etapa removida",
        description: "Etapa foi excluída com sucesso."
      });
    } catch (error) {
      console.error('Erro ao deletar etapa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a etapa.",
        variant: "destructive"
      });
    }
  }, [quiz, updateQuizWithHistory, activeStepId, toast]);

  // Função para obter conteúdo padrão do componente
  const getDefaultContent = (componentType: string) => {
    const defaults: Record<string, any> = {
      // Conteúdo
      text: { text: 'Novo texto aqui...' },
      title: { text: 'Novo Título', level: 'h2' },
      image: { 
        src: '/placeholder.svg', 
        alt: 'Imagem placeholder',
        width: '100%',
        height: 'auto'
      },
      video: { 
        src: '', 
        controls: true,
        autoplay: false,
        poster: '/placeholder.svg'
      },
      
      // Interação
      button: { 
        text: 'Clique aqui', 
        action: 'next',
        variant: 'default'
      },
      input: { 
        label: 'Campo de entrada', 
        placeholder: 'Digite sua resposta...',
        type: 'text',
        required: false
      },
      multiple_choice: { 
        question: 'Escolha uma ou mais opções:', 
        options: [
          { id: '1', text: 'Opção 1', value: 'opcao1' },
          { id: '2', text: 'Opção 2', value: 'opcao2' },
          { id: '3', text: 'Opção 3', value: 'opcao3' }
        ],
        allowMultiple: false,
        required: true
      },
      level_slider: {
        label: 'Avalie de 1 a 10:',
        min: 1,
        max: 10,
        step: 1,
        defaultValue: 5,
        showValue: true
      },
      
      // Social
      faq: {
        title: 'Perguntas Frequentes',
        questions: [
          { 
            id: '1',
            question: 'Como funciona este produto?', 
            answer: 'Explicação detalhada sobre como o produto funciona.' 
          },
          { 
            id: '2',
            question: 'Qual é o prazo de entrega?', 
            answer: 'O prazo de entrega é de 3 a 5 dias úteis.' 
          }
        ]
      },
      testimonial: {
        text: 'Este produto mudou completamente minha vida! Recomendo para todos.',
        author: 'João Silva',
        role: 'Cliente Satisfeito',
        avatar: '/placeholder.svg',
        rating: 5
      },
      carousel: {
        title: 'Galeria de Fotos',
        images: [
          { src: '/placeholder.svg', alt: 'Imagem 1', caption: 'Primeira imagem' },
          { src: '/placeholder.svg', alt: 'Imagem 2', caption: 'Segunda imagem' },
          { src: '/placeholder.svg', alt: 'Imagem 3', caption: 'Terceira imagem' }
        ],
        autoplay: false,
        interval: 3000,
        showDots: true
      },
      
      // Visualização
      comparison: {
        title: 'Comparação de Produtos',
        items: [
          { 
            title: 'Produto A', 
            description: 'Descrição do produto A',
            image: '/placeholder.svg',
            features: ['Feature 1', 'Feature 2', 'Feature 3']
          },
          { 
            title: 'Produto B', 
            description: 'Descrição do produto B',
            image: '/placeholder.svg',
            features: ['Feature 1', 'Feature 2', 'Feature 4']
          }
        ]
      },
      chart: {
        title: 'Gráfico de Dados',
        type: 'bar',
        data: {
          labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril'],
          datasets: [{
            label: 'Vendas',
            data: [65, 59, 80, 81],
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      },
      pricing: {
        title: 'Nossos Planos',
        plans: [
          {
            id: '1',
            name: 'Básico',
            price: 'R$ 29,90',
            period: '/mês',
            features: ['Feature 1', 'Feature 2', 'Suporte por email'],
            highlighted: false,
            buttonText: 'Escolher Plano'
          },
          {
            id: '2',
            name: 'Premium',
            price: 'R$ 59,90',
            period: '/mês',
            features: ['Tudo do Básico', 'Feature 3', 'Feature 4', 'Suporte prioritário'],
            highlighted: true,
            buttonText: 'Mais Popular'
          }
        ]
      },
      
      // Efeitos
      confetti: {
        trigger: 'onLoad',
        duration: 3000,
        particleCount: 100,
        colors: ['#ff0000', '#00ff00', '#0000ff']
      },
      marquee: {
        text: 'Texto rolante - Promoção especial! Aproveite enquanto há tempo!',
        speed: 50,
        direction: 'left',
        pauseOnHover: true
      },
      
      // Estrutura
      terms: {
        text: 'Eu li e aceito os termos e condições de uso',
        required: true,
        linkText: 'Ler termos completos',
        linkUrl: '/termos-e-condicoes'
      },
      spacer: {
        height: 40,
        backgroundColor: 'transparent'
      }
    };
    
    return defaults[componentType] || { text: `Componente ${componentType}` };
  };

  // Função para obter estilo padrão do componente
  const getDefaultStyle = (componentType: string) => {
    const defaults: Record<string, any> = {
      text: { 
        fontSize: '16px', 
        lineHeight: '1.6',
        color: 'hsl(var(--foreground))', 
        marginBottom: '16px' 
      },
      title: { 
        fontSize: '32px', 
        fontWeight: '700',
        lineHeight: '1.2',
        color: 'hsl(var(--foreground))', 
        marginBottom: '24px',
        textAlign: 'left'
      },
      button: { 
        padding: '12px 24px',
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '500',
        transition: 'all 0.2s ease'
      },
      input: { 
        width: '100%', 
        padding: '12px 16px', 
        border: '1px solid hsl(var(--border))',
        borderRadius: '6px',
        fontSize: '16px',
        marginBottom: '16px'
      },
      multiple_choice: { 
        marginBottom: '24px',
        padding: '16px 0'
      },
      level_slider: { 
        marginBottom: '24px',
        padding: '16px 0'
      },
      image: { 
        borderRadius: '8px',
        maxWidth: '100%',
        height: 'auto',
        display: 'block'
      },
      video: { 
        width: '100%',
        borderRadius: '8px',
        maxWidth: '100%'
      },
      carousel: {
        marginBottom: '24px'
      },
      comparison: {
        marginBottom: '32px'
      },
      testimonial: {
        padding: '24px',
        borderRadius: '12px',
        backgroundColor: 'hsl(var(--muted))',
        marginBottom: '24px'
      },
      faq: {
        marginBottom: '32px'
      },
      chart: {
        height: '400px',
        marginBottom: '24px'
      },
      confetti: {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: '1000'
      },
      pricing: {
        marginBottom: '32px'
      },
      marquee: {
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        backgroundColor: 'hsl(var(--primary))',
        color: 'hsl(var(--primary-foreground))',
        padding: '12px 0',
        marginBottom: '16px'
      },
      spacer: { 
        display: 'block',
        backgroundColor: 'transparent'
      },
      terms: {
        marginBottom: '16px'
      }
    };
    
    return defaults[componentType] || {};
  };

  // Gerenciar componentes
  const addComponent = (componentType: string) => {
    try {
      // Se não houver etapa ativa, cria automaticamente a primeira e já adiciona o componente
      if (!activeStep) {
        const newComponent: Component = {
          id: crypto.randomUUID(),
          type: componentType as any,
          content: getDefaultContent(componentType),
          style: getDefaultStyle(componentType)
        };

        const newStep: QuizStep = {
          id: crypto.randomUUID(),
          name: `Etapa ${(quiz.steps?.length || 0) + 1}`,
          title: 'Nova Etapa',
          components: [newComponent]
        };

        const updatedQuiz = {
          ...quiz,
          steps: [...(quiz.steps || []), newStep]
        };

        updateQuizWithHistory(updatedQuiz);
        setActiveStepId(newStep.id);
        setSelectedComponentId(newComponent.id);

        toast({
          title: "Primeira etapa criada",
          description: `${componentType} adicionado à nova etapa.`
        });

        console.log('Etapa criada automaticamente e componente adicionado:', componentType, newComponent);
        return;
      }

      // Com etapa ativa: adiciona normalmente
      const newComponent: Component = {
        id: crypto.randomUUID(),
        type: componentType as any,
        content: getDefaultContent(componentType),
        style: getDefaultStyle(componentType)
      };
      
      const updatedComponents = [...activeStep.components, newComponent];
      updateStep(activeStepId, {
        components: updatedComponents
      });
      
      // Selecionar o componente recém-criado
      setSelectedComponentId(newComponent.id);
      
      // Feedback visual
      toast({
        title: "Componente Adicionado",
        description: `${componentType} foi adicionado com sucesso!`
      });
      
      console.log('Componente adicionado:', componentType, newComponent);
    } catch (error) {
      console.error('Erro ao adicionar componente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o componente. Tente novamente.",
        variant: "destructive"
      });
    }
  };
  const updateComponent = (componentId: string, updates: Partial<Component>) => {
    if (!activeStep) return;
    const updatedComponents = activeStep.components.map(comp => comp.id === componentId ? {
      ...comp,
      ...updates
    } : comp);
    updateStep(activeStepId, {
      components: updatedComponents
    });
  };
  const deleteComponent = (componentId: string) => {
    if (!activeStep) return;
    const updatedComponents = activeStep.components.filter(comp => comp.id !== componentId);
    updateStep(activeStepId, {
      components: updatedComponents
    });
    if (selectedComponentId === componentId) {
      setSelectedComponentId(null);
    }
  };
  const duplicateComponent = (componentId: string) => {
    if (!activeStep) return;
    const componentToDuplicate = activeStep.components.find(comp => comp.id === componentId);
    if (!componentToDuplicate) return;
    const newComponent: Component = {
      ...componentToDuplicate,
      id: crypto.randomUUID()
    };
    const updatedComponents = [...activeStep.components, newComponent];
    updateStep(activeStepId, {
      components: updatedComponents
    });
  };

  // Drag and drop para reordenar componentes
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !activeStep) return;
    const items = Array.from(activeStep.components);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    updateStep(activeStepId, {
      components: items
    });
  };

  // Atalhos de teclado
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'z':
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
          break;
        case 's':
          e.preventDefault();
          onSave();
          break;
      }
    }
  }, [undo, redo, onSave]);

  // Registrar atalhos
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Toolbar Superior */}
      <div className="border-b bg-card p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold truncate max-w-[200px]">{quiz.name}</h2>
              {hasUnsavedChanges && (
                <Badge variant="secondary" className="text-xs">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Não salvo
                </Badge>
              )}
            </div>
            
            <Separator orientation="vertical" className="h-6" />
            
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={undo} 
                disabled={historyIndex === 0 || isLoading}
                title="Desfazer (Ctrl+Z)"
              >
                <Undo className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={redo} 
                disabled={historyIndex === history.length - 1 || isLoading}
                title="Refazer (Ctrl+Shift+Z)"
              >
                <Redo className="w-4 h-4" />
              </Button>
            </div>
            
            <Separator orientation="vertical" className="h-6" />
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Layers className="w-4 h-4" />
              <span>{activeStep?.components?.length || 0} componentes</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Seletor de modo de visualização */}
            <div className="flex items-center border rounded-lg p-1 bg-muted/30">
              <Button 
                variant={previewMode === 'desktop' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setPreviewMode('desktop')}
                title="Visualização Desktop"
              >
                <Monitor className="w-4 h-4" />
              </Button>
              <Button 
                variant={previewMode === 'tablet' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setPreviewMode('tablet')}
                title="Visualização Tablet"
              >
                <Tablet className="w-4 h-4" />
              </Button>
              <Button 
                variant={previewMode === 'mobile' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setPreviewMode('mobile')}
                title="Visualização Mobile"
              >
                <Smartphone className="w-4 h-4" />
              </Button>
            </div>

            <Button variant="outline" size="sm" disabled={isLoading}>
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>

            <Button 
              onClick={handleSave} 
              size="sm" 
              disabled={isLoading || !hasUnsavedChanges}
              title="Salvar (Ctrl+S)"
            >
              {isLoading ? (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>

            <Button size="sm" className="bg-green-600 hover:bg-green-700" disabled={isLoading}>
              <Play className="w-4 h-4 mr-2" />
              Publicar
            </Button>
          </div>
        </div>
      </div>

      {/* Layout Principal */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Painel Esquerdo: Biblioteca e Etapas */}
          <ResizablePanel defaultSize={22} minSize={18} maxSize={35}>
            <div className="h-full border-r bg-muted/20 flex flex-col">
              <div className="p-4 space-y-4 overflow-y-auto flex-1">
                <StepManager 
                  steps={quiz.steps || []} 
                  activeStepId={activeStepId} 
                  onStepSelect={setActiveStepId} 
                  onStepAdd={addStep} 
                  onStepUpdate={updateStep} 
                  onStepDelete={deleteStep} 
                />
                
                <Separator />
                
                <ComponentLibrary 
                  onAddComponent={addComponent}
                  userPlan="free"
                />
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Painel Central: Canvas de Edição */}
          <ResizablePanel defaultSize={48} minSize={30}>
            <div className="h-full bg-slate-50 p-4 flex flex-col">
              <Card className="flex-1 shadow-sm">
                <div className="h-full p-6 overflow-y-auto">
                  {activeStep ? (
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="components">
                        {(provided, snapshot) => (
                          <div 
                            {...provided.droppableProps} 
                            ref={provided.innerRef} 
                            className={`space-y-4 min-h-full transition-colors ${
                              snapshot.isDraggingOver ? 'bg-primary/5' : ''
                            }`}
                          >
                            {activeStep.components.length === 0 && (
                              <div className="flex items-center justify-center h-40 border-2 border-dashed rounded-lg text-muted-foreground">
                                <div className="text-center">
                                  <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                  <p className="text-sm">Arraste componentes aqui para começar</p>
                                  <p className="text-xs mt-1">Ou clique em um componente na biblioteca</p>
                                </div>
                              </div>
                            )}
                            
                            {activeStep.components.map((component, index) => (
                              <Draggable key={component.id} draggableId={component.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={`
                                      group relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
                                      ${selectedComponentId === component.id 
                                        ? 'border-primary bg-primary/5 shadow-md' 
                                        : 'border-border hover:border-primary/50 hover:shadow-sm'
                                      }
                                      ${snapshot.isDragging ? 'shadow-lg rotate-2 scale-105' : ''}
                                    `}
                                    onClick={() => setSelectedComponentId(component.id)}
                                  >
                                    {/* Handle de drag */}
                                    <div 
                                      {...provided.dragHandleProps}
                                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <Move className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                                    </div>
                                    
                                    {/* Badge do tipo */}
                                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Badge variant="outline" className="text-xs">
                                        {component.type}
                                      </Badge>
                                    </div>
                                    
                                    {/* Preview do componente */}
                                    <div className="mt-6">
                                      {renderComponentPreview(component)}
                                    </div>
                                    
                                    {/* Indicador de seleção */}
                                    {selectedComponentId === component.id && (
                                      <div className="absolute -top-1 -right-1">
                                        <CheckCircle className="w-5 h-5 text-primary bg-background rounded-full" />
                                      </div>
                                    )}
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <div className="text-center">
                        <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">Selecione uma etapa</p>
                        <p className="text-sm mt-1">Escolha uma etapa na barra lateral para começar a editar</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Painel Direito: Editor de Componente */}
          <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
            <div className="h-full border-l bg-muted/20 flex flex-col">
              <div className="p-4 flex-1 overflow-y-auto">
                {selectedComponent ? (
                  <ComponentEditor 
                    component={selectedComponent} 
                    onUpdate={(updates) => updateComponent(selectedComponent.id, updates)} 
                    onDelete={() => deleteComponent(selectedComponent.id)} 
                    onDuplicate={() => duplicateComponent(selectedComponent.id)} 
                  />
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    <div className="mx-auto">
                      <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">Editor de Propriedades</p>
                      <p className="text-sm mt-1">Selecione um componente no canvas para editar suas propriedades</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}