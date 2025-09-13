import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { QuizStep, Component } from '@/types/quiz';
import { ComponentRenderer } from './ComponentRenderer';
import { Plus, Smartphone, Tablet, Monitor } from 'lucide-react';

interface StageCanvasProps {
  stage: QuizStep | null;
  selectedComponentId: string | null;
  onSelectComponent: (componentId: string | null) => void;
  onUpdateComponent: (componentId: string, updates: Partial<Component>) => void;
  onDeleteComponent: (componentId: string) => void;
}

export function StageCanvas({
  stage,
  selectedComponentId,
  onSelectComponent,
  onUpdateComponent,
  onDeleteComponent
}: StageCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'stage-canvas',
  });

  if (!stage) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/10">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-muted rounded-lg flex items-center justify-center">
            <Monitor className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Selecione uma etapa</h3>
            <p className="text-muted-foreground">
              Escolha uma etapa na barra lateral para começar a editar
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Canvas Header */}
      <div className="border-b p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Input
              value={stage.title || ''}
              onChange={(e) => {
                // Update stage title through parent component
                if (onUpdateComponent) {
                  // This will need to be handled by parent component
                  console.log('Update stage title:', e.target.value);
                }
              }}
              placeholder="Título da etapa (opcional)"
              className="text-lg font-medium bg-transparent border-none px-0 focus-visible:ring-0"
            />
            <p className="text-sm text-muted-foreground">
              {stage.components.length} componentes nesta etapa
            </p>
          </div>

          {/* Device Preview Toggle */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
              <Smartphone className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
              <Tablet className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="default" className="h-7 w-7 p-0">
              <Monitor className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Canvas Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto p-6 space-y-4">
          <div
            ref={setNodeRef}
            className={`
              min-h-96 space-y-4 transition-all duration-300 relative
              ${isOver 
                ? 'bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary border-dashed rounded-lg p-4 shadow-lg' 
                : 'rounded-lg'
              }
            `}
          >
            {/* Overlay para indicar área de drop */}
            {isOver && (
              <div className="absolute inset-0 bg-primary/10 rounded-lg border-2 border-primary border-dashed animate-pulse">
                <div className="h-full flex items-center justify-center">
                  <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium shadow-lg">
                    🎯 Solte aqui para adicionar componente
                  </div>
                </div>
              </div>
            )}

            {stage.components.length === 0 ? (
              <Card className={`p-12 text-center border-dashed transition-all duration-300 ${
                isOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/30'
              }`}>
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-muted rounded-lg flex items-center justify-center">
                    <Plus className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Etapa vazia</h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      Arraste componentes da biblioteca ou clique neles para adicionar
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      💡 Dica: Use drag & drop para organizar a ordem dos componentes
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <SortableContext
                items={stage.components.map(c => c.id)}
                strategy={verticalListSortingStrategy}
              >
                {stage.components.map((component, index) => (
                  <div
                    key={component.id}
                    className={`
                      transition-all duration-200
                      ${isOver ? 'transform scale-95 opacity-60' : ''}
                    `}
                  >
                    <ComponentRenderer
                      component={component}
                      isSelected={selectedComponentId === component.id}
                      onSelect={() => onSelectComponent(component.id)}
                      onUpdate={(updates) => onUpdateComponent(component.id, updates)}
                      onDelete={() => onDeleteComponent(component.id)}
                    />
                    
                    {/* Linha indicadora de posição durante drop */}
                    {isOver && index === stage.components.length - 1 && (
                      <div className="h-1 bg-primary rounded-full my-2 animate-pulse" />
                    )}
                  </div>
                ))}
              </SortableContext>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}