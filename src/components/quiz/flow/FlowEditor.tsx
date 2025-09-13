import { useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

import { StepNode } from './nodes/StepNode';
import { ConditionNode } from './nodes/ConditionNode';
import { OutcomeNode } from './nodes/OutcomeNode';
import { CalculationNode } from './nodes/CalculationNode';
import { ConditionalEdge } from './edges/ConditionalEdge';
import { FlowToolbar } from './FlowToolbar';
import { FlowProperties } from './FlowProperties';
import { FlowSimulator } from './FlowSimulator';
import { FlowAnalytics } from './FlowAnalytics';
import { GameSettings } from './GameSettings';

import { Quiz, FlowNode, FlowEdge, QuizFlow } from '@/types/quiz';
import { useToast } from '@/hooks/use-toast';
import {
  Play, Zap, BarChart3, Settings, Gamepad2, Save, Eye,
  Workflow, Plus, RefreshCw, Copy, Globe, Trash2, Loader2
} from 'lucide-react';

interface FlowEditorProps {
  quiz: Quiz;
  onUpdate: (quiz: Quiz) => void;
  onSave: () => void;
}

const nodeTypes = {
  step: StepNode,
  condition: ConditionNode,
  outcome: OutcomeNode,
  calculation: CalculationNode,
};

const edgeTypes = {
  conditional: ConditionalEdge,
};

export function FlowEditor({ quiz, onUpdate, onSave }: FlowEditorProps) {
  const [activeTab, setActiveTab] = useState<'flow' | 'properties' | 'simulator' | 'analytics' | 'game'>('flow');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string>('');
  const { toast } = useToast();

  // Inicializar fluxo se não existir
  const initialFlow: QuizFlow = quiz.flow || {
    nodes: [
      {
        id: 'entry',
        type: 'step',
        position: { x: 250, y: 100 },
        data: {
          title: 'Início',
          subtitle: 'Ponto de entrada do quiz',
          stepId: quiz.steps?.[0]?.id,
          color: 'hsl(var(--primary))',
          icon: 'play'
        }
      }
    ],
    edges: [],
    calculations: [],
    entryNodeId: 'entry',
    viewport: { x: 0, y: 0, zoom: 1 }
  };

  const [nodes, setNodes, onNodesChange] = useNodesState(initialFlow.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialFlow.edges);

  // Sincronizar alterações com o quiz
  const updateFlow = useCallback(() => {
    const updatedQuiz = {
      ...quiz,
      flow: {
        nodes,
        edges,
        calculations: initialFlow.calculations,
        entryNodeId: initialFlow.entryNodeId,
        viewport: { x: 0, y: 0, zoom: 1 }
      }
    };
    onUpdate(updatedQuiz);
  }, [quiz, nodes, edges, onUpdate, initialFlow]);

  // Conectar nós
  const onConnect = useCallback(
    (params: Connection) => {
      const edge: FlowEdge = {
        ...params,
        id: `edge-${Date.now()}`,
        type: 'conditional',
        label: '',
        data: {
          condition: undefined,
          color: 'hsl(var(--muted-foreground))'
        }
      };
      setEdges((eds) => addEdge(edge as any, eds));
      updateFlow();
    },
    [setEdges, updateFlow]
  );

  // Adicionar nó
  const addNode = useCallback((type: 'step' | 'condition' | 'outcome' | 'calculation') => {
    const newNode: FlowNode = {
      id: `${type}-${Date.now()}`,
      type,
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 300 + 200 
      },
      data: {
        title: getNodeTitle(type),
        subtitle: getNodeSubtitle(type),
        color: getNodeColor(type),
        icon: getNodeIcon(type)
      }
    };

    setNodes((nds) => [...nds, newNode as any]);
    updateFlow();
    toast({
      title: "Nó adicionado",
      description: `${getNodeTitle(type)} foi adicionado ao fluxo.`
    });
  }, [setNodes, updateFlow, toast]);

  // Auto-layout do fluxo
  const autoLayout = useCallback(() => {
    // Implementar algoritmo de layout automático
    toast({
      title: "Layout aplicado",
      description: "O fluxo foi reorganizado automaticamente."
    });
  }, [toast]);

  // Testar fluxo
  const testFlow = useCallback(() => {
    setIsSimulating(true);
    setActiveTab('simulator');
    toast({
      title: "Iniciando simulação",
      description: "Teste o fluxo com diferentes personas."
    });
  }, [toast]);

  // Salvar quiz
  const handleSave = useCallback(async () => {
    setIsLoading(true);
    setLoadingAction('saving');
    
    try {
      updateFlow();
      
      // Salvar no localStorage temporariamente
      const updatedQuiz = {
        ...quiz,
        flow: { nodes, edges, calculations: initialFlow.calculations, entryNodeId: initialFlow.entryNodeId, viewport: { x: 0, y: 0, zoom: 1 } },
        updatedAt: new Date().toISOString()
      };
      
      const existingQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
      const quizIndex = existingQuizzes.findIndex((q: Quiz) => q.id === quiz.id);
      
      if (quizIndex >= 0) {
        existingQuizzes[quizIndex] = updatedQuiz;
      } else {
        existingQuizzes.push(updatedQuiz);
      }
      
      localStorage.setItem('quizzes', JSON.stringify(existingQuizzes));

      toast({
        title: "Quiz salvo!",
        description: "Suas alterações foram salvas com sucesso.",
      });
      
      onSave();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o quiz. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setLoadingAction('');
    }
  }, [quiz, nodes, edges, updateFlow, onSave, toast, initialFlow]);

  // Publicar quiz
  const handlePublish = useCallback(async () => {
    setIsLoading(true);
    setLoadingAction('publishing');
    
    try {
      const updatedQuiz = {
        ...quiz,
        status: 'published' as const,
        flow: { nodes, edges, calculations: initialFlow.calculations, entryNodeId: initialFlow.entryNodeId, viewport: { x: 0, y: 0, zoom: 1 } },
        updatedAt: new Date().toISOString()
      };

      // Salvar no localStorage
      const existingQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
      const quizIndex = existingQuizzes.findIndex((q: Quiz) => q.id === quiz.id);
      
      if (quizIndex >= 0) {
        existingQuizzes[quizIndex] = updatedQuiz;
      } else {
        existingQuizzes.push(updatedQuiz);
      }
      
      localStorage.setItem('quizzes', JSON.stringify(existingQuizzes));

      onUpdate(updatedQuiz);
      
      toast({
        title: "Quiz publicado!",
        description: "Seu quiz está agora disponível publicamente.",
      });
    } catch (error) {
      console.error('Erro ao publicar:', error);
      toast({
        title: "Erro ao publicar",
        description: "Não foi possível publicar o quiz. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setLoadingAction('');
    }
  }, [quiz, nodes, edges, onUpdate, toast, initialFlow]);

  // Copiar link
  const handleCopyLink = useCallback(async () => {
    setIsLoading(true);
    setLoadingAction('copying');
    
    try {
      const quizUrl = `${window.location.origin}/quiz/${quiz.publicId}`;
      await navigator.clipboard.writeText(quizUrl);
      
      toast({
        title: "Link copiado!",
        description: "O link do quiz foi copiado para a área de transferência.",
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setLoadingAction('');
    }
  }, [quiz.publicId, toast]);

  // Deletar quiz
  const handleDelete = useCallback(async () => {
    setIsLoading(true);
    setLoadingAction('deleting');
    
    try {
      // Remover do localStorage
      const existingQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
      const filteredQuizzes = existingQuizzes.filter((q: Quiz) => q.id !== quiz.id);
      localStorage.setItem('quizzes', JSON.stringify(filteredQuizzes));

      toast({
        title: "Quiz deletado!",
        description: "O quiz foi removido permanentemente.",
      });
      
      // Redirecionar para dashboard após deletar
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Erro ao deletar:', error);
      toast({
        title: "Erro ao deletar",
        description: "Não foi possível deletar o quiz. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setLoadingAction('');
    }
  }, [quiz.id, toast]);

  const selectedNodeData = useMemo(() => {
    return nodes.find(node => node.id === selectedNode);
  }, [nodes, selectedNode]);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Workflow className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Editor de Fluxo</h2>
            </div>
            <Badge variant="outline" className="text-xs">
              {nodes.length} nós • {edges.length} conexões
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsPreviewOpen(true)}
              disabled={isLoading}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCopyLink}
              disabled={isLoading}
            >
              {isLoading && loadingAction === 'copying' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              Copiar Link
            </Button>
            
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading && loadingAction === 'saving' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar
            </Button>
            
            <Button 
              size="sm" 
              onClick={handlePublish}
              disabled={isLoading}
            >
              {isLoading && loadingAction === 'publishing' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Globe className="w-4 h-4 mr-2" />
              )}
              Publicar
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm"
                  disabled={isLoading}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Deletar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. O quiz "{quiz.name}" será removido permanentemente do banco de dados.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isLoading && loadingAction === 'deleting' ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    Deletar Quiz
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Painel Principal - Fluxo */}
          <ResizablePanel defaultSize={75} minSize={50}>
            <div className="h-full relative">
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="h-full">
                <div className="absolute top-4 left-4 z-10">
                  <TabsList className="grid w-full grid-cols-5 bg-card/80 backdrop-blur-sm">
                    <TabsTrigger value="flow" className="text-xs">
                      <Workflow className="w-4 h-4 mr-1" />
                      Fluxo
                    </TabsTrigger>
                    <TabsTrigger value="properties" className="text-xs">
                      <Settings className="w-4 h-4 mr-1" />
                      Props
                    </TabsTrigger>
                    <TabsTrigger value="simulator" className="text-xs">
                      <Play className="w-4 h-4 mr-1" />
                      Teste
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="text-xs">
                      <BarChart3 className="w-4 h-4 mr-1" />
                      Analytics
                    </TabsTrigger>
                    <TabsTrigger value="game" className="text-xs">
                      <Gamepad2 className="w-4 h-4 mr-1" />
                      Game
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="flow" className="h-full">
                  <ReactFlowProvider>
                    <ReactFlow
                      nodes={nodes}
                      edges={edges}
                      onNodesChange={onNodesChange}
                      onEdgesChange={onEdgesChange}
                      onConnect={onConnect}
                      onNodeClick={(_, node) => setSelectedNode(node.id)}
                      nodeTypes={nodeTypes}
                      edgeTypes={edgeTypes}
                      fitView
                      attributionPosition="bottom-left"
                      className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800"
                    >
                      <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
                      <Controls className="bg-card border shadow-lg" />
                      <MiniMap
                        className="bg-card border shadow-lg"
                        nodeColor="#1976d2"
                        maskColor="rgb(0, 0, 0, 0.1)"
                      />
                    </ReactFlow>
                  </ReactFlowProvider>
                </TabsContent>

                <TabsContent value="properties" className="h-full p-4">
                  <FlowProperties
                    quiz={quiz}
                    selectedNode={selectedNodeData}
                    onUpdate={onUpdate}
                  />
                </TabsContent>

                <TabsContent value="simulator" className="h-full p-4">
                  <FlowSimulator
                    quiz={quiz}
                    isActive={isSimulating}
                    onClose={() => setIsSimulating(false)}
                  />
                </TabsContent>

                <TabsContent value="analytics" className="h-full p-4">
                  <FlowAnalytics quiz={quiz} />
                </TabsContent>

                <TabsContent value="game" className="h-full p-4">
                  <GameSettings
                    quiz={quiz}
                    onUpdate={onUpdate}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* Painel Lateral - Ferramentas */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
            <div className="h-full border-l bg-muted/30">
              <FlowToolbar
                onAddNode={addNode}
                selectedNode={selectedNodeData}
                onUpdateNode={(updates) => {
                  if (selectedNode) {
                    setNodes((nds) =>
                      nds.map((node) =>
                        node.id === selectedNode
                          ? { ...node, data: { ...node.data, ...updates } }
                          : node
                      )
                    );
                    updateFlow();
                  }
                }}
                onDeleteNode={() => {
                  if (selectedNode) {
                    setNodes((nds) => nds.filter((node) => node.id !== selectedNode));
                    setEdges((eds) => eds.filter((edge) => 
                      edge.source !== selectedNode && edge.target !== selectedNode
                    ));
                    setSelectedNode(null);
                    updateFlow();
                  }
                }}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Modal de Preview */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-6xl h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Preview do Quiz - {quiz.name}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden p-6 pt-0">
            <div className="h-full bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                  <Eye className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Preview do Quiz</h3>
                  <p className="text-muted-foreground">
                    Visualização em tempo real do quiz será implementada aqui
                  </p>
                </div>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" size="sm">
                    <div className="w-4 h-4 bg-slate-300 rounded mr-2" />
                    Desktop
                  </Button>
                  <Button variant="outline" size="sm">
                    <div className="w-3 h-4 bg-slate-300 rounded mr-2" />
                    Mobile
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper functions
function getNodeTitle(type: string): string {
  switch (type) {
    case 'step': return 'Nova Etapa';
    case 'condition': return 'Condição';
    case 'outcome': return 'Resultado';
    case 'calculation': return 'Cálculo';
    default: return 'Nó';
  }
}

function getNodeSubtitle(type: string): string {
  switch (type) {
    case 'step': return 'Pergunta ou conteúdo';
    case 'condition': return 'Decisão baseada em resposta';
    case 'outcome': return 'Resultado final';
    case 'calculation': return 'Operação matemática';
    default: return '';
  }
}

function getNodeColor(type: string): string {
  switch (type) {
    case 'step': return 'hsl(var(--primary))';
    case 'condition': return 'hsl(var(--accent))';
    case 'outcome': return 'hsl(217 91% 66%)';
    case 'calculation': return 'hsl(var(--muted-foreground))';
    default: return 'hsl(var(--border))';
  }
}

function getNodeIcon(type: string): string {
  switch (type) {
    case 'step': return 'message-circle';
    case 'condition': return 'git-branch';
    case 'outcome': return 'target';
    case 'calculation': return 'calculator';
    default: return 'circle';
  }
}