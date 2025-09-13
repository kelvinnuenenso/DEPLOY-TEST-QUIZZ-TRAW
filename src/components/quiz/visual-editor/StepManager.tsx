import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Plus, GripVertical, Edit3, Copy, Trash2, ChevronRight,
  Settings, Eye, EyeOff, ChevronDown, ChevronUp, List
} from 'lucide-react';
import { QuizStep } from '@/types/quiz';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface StepManagerProps {
  steps: QuizStep[];
  activeStepId: string;
  onStepSelect: (stepId: string) => void;
  onStepAdd: () => void;
  onStepUpdate: (stepId: string, updates: Partial<QuizStep>) => void;
  onStepDelete: (stepId: string) => void;
}

export function StepManager({
  steps,
  activeStepId,
  onStepSelect,
  onStepAdd,
  onStepUpdate,
  onStepDelete
}: StepManagerProps) {
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [isExpanded, setIsExpanded] = useState(steps.length > 0);
  const [showAllSteps, setShowAllSteps] = useState(false);

  const COMPACT_LIMIT = 4;
  const visibleSteps = showAllSteps ? steps : steps.slice(0, COMPACT_LIMIT);
  const hasMoreSteps = steps.length > COMPACT_LIMIT;

  const startEditing = (step: QuizStep) => {
    setEditingStepId(step.id);
    setEditName(step.name);
    setEditTitle(step.title);
  };

  const saveEditing = () => {
    if (editingStepId) {
      onStepUpdate(editingStepId, {
        name: editName,
        title: editTitle
      });
      setEditingStepId(null);
    }
  };

  const cancelEditing = () => {
    setEditingStepId(null);
    setEditName('');
    setEditTitle('');
  };

  const duplicateStep = (step: QuizStep) => {
    const newStep: QuizStep = {
      ...step,
      id: crypto.randomUUID(),
      name: `${step.name} (cópia)`,
      components: step.components.map(comp => ({
        ...comp,
        id: crypto.randomUUID()
      }))
    };
    console.log('Duplicate step:', newStep);
  };

  const handleStepAdd = () => {
    onStepAdd();
    setIsExpanded(true);
  };

  // Estado vazio: layout colapsado com destaque
  if (steps.length === 0) {
    return (
      <div className="border border-dashed border-muted-foreground/30 rounded-lg">
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full p-3 h-auto justify-between hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <List className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium">Etapas do Quiz</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="p-4 pt-2">
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
                  <Plus className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Nenhuma etapa criada ainda
                </p>
                <Button onClick={handleStepAdd} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar primeira etapa
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }

  // Estado com etapas: layout expandido
  return (
    <div className="border border-border rounded-lg">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full p-3 h-auto justify-between hover:bg-muted/50"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <List className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <span className="text-sm font-medium">Etapas do Quiz</span>
                <div className="text-xs text-muted-foreground">
                  {steps.length} etapa{steps.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStepAdd();
                }}
                className="h-6 px-2"
              >
                <Plus className="w-3 h-3" />
              </Button>
              <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </div>
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="p-3 pt-0">
            <div className="space-y-2">
              {visibleSteps.map((step, index) => (
                <Card
                  key={step.id}
                  className={`
                    p-2 cursor-pointer transition-all hover:shadow-sm group
                    ${activeStepId === step.id 
                      ? 'border-primary bg-primary/5 shadow-sm' 
                      : 'hover:border-primary/50'}
                  `}
                  onClick={() => onStepSelect(step.id)}
                >
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-3 h-3 text-muted-foreground" />
                    
                    <div className="flex-1 min-w-0">
                      {editingStepId === step.id ? (
                        <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Nome da etapa"
                            className="h-7 text-sm"
                          />
                          <div className="flex gap-1">
                            <Button size="sm" onClick={saveEditing} className="h-6 px-2 text-xs">
                              Salvar
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelEditing} className="h-6 px-2 text-xs">
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs h-4 px-1">
                              {index + 1}
                            </Badge>
                            <span className="text-sm font-medium truncate">
                              {step.name}
                            </span>
                            {activeStepId === step.id && (
                              <ChevronRight className="w-3 h-3 text-primary" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs h-4 px-1">
                              {step.components.length}
                            </Badge>
                            {step.title && (
                              <span className="text-xs text-muted-foreground truncate">
                                {step.title}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {editingStepId !== step.id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Settings className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => startEditing(step)}>
                            <Edit3 className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => duplicateStep(step)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive"
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir Etapa</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir a etapa "{step.name}"? 
                                  Esta ação não pode ser desfeita e todos os componentes 
                                  desta etapa serão perdidos.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => onStepDelete(step.id)}
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </Card>
              ))}

              {hasMoreSteps && !showAllSteps && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllSteps(true)}
                  className="w-full h-8 text-xs text-muted-foreground hover:text-foreground"
                >
                  <ChevronDown className="w-3 h-3 mr-1" />
                  Ver todas ({steps.length - COMPACT_LIMIT} restantes)
                </Button>
              )}

              {showAllSteps && hasMoreSteps && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllSteps(false)}
                  className="w-full h-8 text-xs text-muted-foreground hover:text-foreground"
                >
                  <ChevronUp className="w-3 h-3 mr-1" />
                  Ver menos
                </Button>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}