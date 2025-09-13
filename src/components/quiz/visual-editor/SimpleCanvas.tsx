import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { QuizStep, Component } from '@/types/quiz';
import { ComponentRenderer } from '../ComponentRenderer';
import { Plus, Monitor } from 'lucide-react';

interface SimpleCanvasProps {
  stage: QuizStep | null;
  selectedComponentId: string | null;
  onSelectComponent: (componentId: string | null) => void;
  onUpdateComponent: (componentId: string, updates: Partial<Component>) => void;
  onDeleteComponent: (componentId: string) => void;
  onUpdateStageTitle: (title: string) => void;
}

export function SimpleCanvas({
  stage,
  selectedComponentId,
  onSelectComponent,
  onUpdateComponent,
  onDeleteComponent,
  onUpdateStageTitle
}: SimpleCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'visual-canvas',
    data: {
      accepts: ['component']
    }
  });

  if (!stage) {
    return (
      <div 
        ref={setNodeRef}
        className={`h-full flex items-center justify-center transition-all duration-300 ${
          isOver ? 'bg-primary/10 border-2 border-primary border-dashed' : 'bg-muted/10'
        }`}
      >
        <div className="text-center space-y-4">
          <div className={`w-16 h-16 mx-auto rounded-lg flex items-center justify-center transition-colors ${
            isOver ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}>
            <Monitor className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Canvas Visual</h3>
            <p className="text-muted-foreground">
              {isOver ? '🎯 Solte aqui para criar a primeira etapa' : 'Arraste componentes da biblioteca para começar'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Canvas Header */}
      <div className="border-b p-4">
        <Input
          value={stage.title || ''}
          onChange={(e) => onUpdateStageTitle(e.target.value)}
          placeholder="Título da página (opcional)"
          className="text-lg font-medium bg-transparent border-none px-0 focus-visible:ring-0"
        />
        <p className="text-sm text-muted-foreground mt-1">
          {stage.components.length} componentes na página
        </p>
      </div>

      {/* Canvas Content - TODA a área é uma zona de drop */}
      <div 
        ref={setNodeRef}
        className={`flex-1 overflow-auto transition-all duration-300 relative ${
          isOver ? 'bg-primary/5' : ''
        }`}
      >
        {/* Drop overlay para toda a área */}
        {isOver && (
          <div className="absolute inset-0 bg-primary/10 border-2 border-primary border-dashed animate-pulse z-50 pointer-events-none">
            <div className="h-full flex items-center justify-center">
              <div className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium shadow-lg">
                🎯 Solte aqui para adicionar componente
              </div>
            </div>
          </div>
        )}

        <div className="max-w-3xl mx-auto p-6 space-y-4">
          <div className="min-h-96 space-y-4 transition-all duration-300 relative">
            {stage.components.length === 0 ? (
              <Card className="p-12 text-center border-dashed transition-all duration-300 border-muted-foreground/30">
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-muted rounded-lg flex items-center justify-center">
                    <Plus className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Página em branco</h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      Arraste componentes da biblioteca ou clique neles para adicionar
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 max-w-md mx-auto">
                      💡 Dica: Comece com um título e depois adicione outros elementos. Use drag & drop para reorganizar.
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <SortableContext
                items={stage.components.map(c => c.id)}
                strategy={verticalListSortingStrategy}
              >
                {stage.components.map((component) => (
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