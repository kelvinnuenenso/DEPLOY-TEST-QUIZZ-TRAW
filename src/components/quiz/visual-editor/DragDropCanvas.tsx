import React, { useState, useRef, useCallback } from 'react';
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Component, ComponentType, QuizStep } from '@/types/quiz';
import { ComponentRenderer } from '../ComponentRenderer';
import {
  Trash2,
  Copy,
  Move,
  GripVertical,
  Plus,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Settings
} from 'lucide-react';

interface DragDropCanvasProps {
  step: QuizStep;
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  onUpdateComponent: (componentId: string, updates: Partial<Component>) => void;
  onDeleteComponent: (componentId: string) => void;
  onDuplicateComponent: (componentId: string) => void;
  onAddComponent: (type: ComponentType, position?: number) => void;
  onReorderComponents: (componentIds: string[]) => void;
}

export function DragDropCanvas({
  step,
  selectedComponentId,
  onSelectComponent,
  onUpdateComponent,
  onDeleteComponent,
  onDuplicateComponent,
  onAddComponent,
  onReorderComponents
}: DragDropCanvasProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [showInsertionPoints, setShowInsertionPoints] = useState(false);
  
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setDraggedItem(active.id as string);
    setShowInsertionPoints(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedItem(null);
    setShowInsertionPoints(false);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Handle reordering existing components
    if (activeId !== overId) {
      const oldIndex = step.components.findIndex(c => c.id === activeId);
      const newIndex = step.components.findIndex(c => c.id === overId);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(step.components, oldIndex, newIndex);
        onReorderComponents(newOrder.map(c => c.id));
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Handle visual feedback during drag
  };

  const handleDropFromLibrary = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const componentType = e.dataTransfer.getData('application/component-type') as ComponentType;
    if (componentType) {
      onAddComponent(componentType);
    }
  }, [onAddComponent]);

  const handleDragOverFromLibrary = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div className="h-full bg-background">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <div 
          className="h-full p-6 overflow-auto"
          onDrop={handleDropFromLibrary}
          onDragOver={handleDragOverFromLibrary}
        >
          {step.components.length === 0 ? (
            <EmptyCanvas onAddComponent={onAddComponent} />
          ) : (
            <SortableContext 
              items={step.components.map(c => c.id)} 
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4 max-w-4xl mx-auto">
                {step.components.map((component, index) => (
                  <React.Fragment key={component.id}>
                    {showInsertionPoints && index === 0 && (
                      <InsertionPoint position={index} onInsert={() => {}} />
                    )}
                    
                    <SortableComponent
                      component={component}
                      isSelected={selectedComponentId === component.id}
                      isDragging={draggedItem === component.id}
                      onSelect={() => onSelectComponent(component.id)}
                      onUpdate={(updates) => onUpdateComponent(component.id, updates)}
                      onDelete={() => onDeleteComponent(component.id)}
                      onDuplicate={() => onDuplicateComponent(component.id)}
                    />
                    
                    {showInsertionPoints && (
                      <InsertionPoint position={index + 1} onInsert={() => {}} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </SortableContext>
          )}
        </div>
      </DndContext>
    </div>
  );
}

interface SortableComponentProps {
  component: Component;
  isSelected: boolean;
  isDragging: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<Component>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

function SortableComponent({
  component,
  isSelected,
  isDragging,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate
}: SortableComponentProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: component.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(component.visible !== false);
  const [isLocked, setIsLocked] = useState(component.locked || false);

  const handleToggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newVisibility = !isVisible;
    setIsVisible(newVisibility);
    onUpdate({ visible: newVisibility });
  };

  const handleToggleLock = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newLocked = !isLocked;
    setIsLocked(newLocked);
    onUpdate({ locked: newLocked });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        relative group cursor-pointer transition-all duration-200
        ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
        ${!isVisible ? 'opacity-50' : ''}
        ${isLocked ? 'cursor-not-allowed' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
    >
      {/* Component Content */}
      <Card className={`
        relative overflow-hidden transition-all duration-200
        ${isSelected ? 'border-primary shadow-lg' : 'border-muted'}
        ${isHovered && !isSelected ? 'border-muted-foreground/30 shadow-md' : ''}
      `}>
        <div className="p-4">
          <ComponentRenderer 
            component={component} 
            isPreview={!isLocked}
            isEditing={isSelected}
          />
        </div>

        {/* Drag Handle */}
        {!isLocked && (
          <div 
            className={`
              absolute left-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity
              ${isSelected ? 'opacity-100' : ''}
            `}
            {...attributes}
            {...listeners}
          >
            <div className="w-6 h-6 bg-background border rounded cursor-move flex items-center justify-center shadow-sm">
              <GripVertical className="w-3 h-3 text-muted-foreground" />
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div 
          className={`
            absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity
            ${isSelected ? 'opacity-100' : ''}
          `}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleVisibility}
            className="w-6 h-6 p-0 bg-background border shadow-sm"
          >
            {isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleLock}
            className="w-6 h-6 p-0 bg-background border shadow-sm"
          >
            {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
          </Button>

          {!isLocked && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate();
                }}
                className="w-6 h-6 p-0 bg-background border shadow-sm"
              >
                <Copy className="w-3 h-3" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="w-6 h-6 p-0 bg-background border shadow-sm text-destructive hover:text-destructive"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </>
          )}
        </div>

        {/* Component Type Badge */}
        <div className={`
          absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity
          ${isSelected ? 'opacity-100' : ''}
        `}>
          <Badge variant="secondary" className="text-xs capitalize">
            {component.type.replace('_', ' ')}
          </Badge>
        </div>

        {/* Selection Indicator */}
        {isSelected && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-primary/5 border-2 border-dashed border-primary rounded" />
            <div className="absolute -top-6 left-0 bg-primary text-primary-foreground text-xs px-2 py-1 rounded text-xs font-medium">
              Selecionado
            </div>
          </div>
        )}

        {/* Lock Overlay */}
        {isLocked && (
          <div className="absolute inset-0 bg-muted/50 flex items-center justify-center">
            <div className="bg-background border rounded-lg p-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Bloqueado</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function InsertionPoint({ position, onInsert }: { position: number; onInsert: () => void }) {
  return (
    <div className="relative h-8 group">
      <div className="absolute inset-x-0 top-1/2 h-0.5 bg-primary/30 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="sm"
          onClick={onInsert}
          className="h-6 w-6 p-0 rounded-full bg-primary text-primary-foreground shadow-lg"
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

function EmptyCanvas({ onAddComponent }: { onAddComponent: (type: ComponentType) => void }) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
          <Settings className="w-12 h-12 text-muted-foreground" />
        </div>
        
        <div>
          <h3 className="text-xl font-semibold mb-2">Canvas Vazio</h3>
          <p className="text-muted-foreground">
            Arraste componentes da biblioteca para começar a construir sua página
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {(['title', 'text', 'button', 'input'] as ComponentType[]).map((type) => (
            <Button
              key={type}
              variant="outline"
              size="sm"
              onClick={() => onAddComponent(type)}
              className="capitalize"
            >
              <Plus className="w-3 h-3 mr-1" />
              {type.replace('_', ' ')}
            </Button>
          ))}
        </div>

        <div className="text-xs text-muted-foreground">
          Ou use o atalho: Clique duplo para adicionar um título
        </div>
      </div>
    </div>
  );
}