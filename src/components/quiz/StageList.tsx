import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QuizStep } from '@/types/quiz';
import { 
  GripVertical, 
  Eye, 
  Copy, 
  Trash2, 
  Edit2, 
  Check, 
  X,
  Play,
  Layers
} from 'lucide-react';

interface StageItemProps {
  stage: QuizStep;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<QuizStep>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

function StageItem({ stage, isSelected, onSelect, onUpdate, onDelete, onDuplicate }: StageItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(stage.name);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stage.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSaveName = () => {
    onUpdate({ name: editName });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(stage.name);
    setIsEditing(false);
  };

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className={`p-3 cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
      } ${isDragging ? 'opacity-50' : ''}`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-3">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab hover:text-primary"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* Stage Icon */}
        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
          <Layers className="w-4 h-4 text-primary" />
        </div>

        {/* Stage Info */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-7 text-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') handleCancelEdit();
                }}
                autoFocus
              />
              <Button size="sm" variant="ghost" onClick={handleSaveName}>
                <Check className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <div>
              <h4 className="font-medium text-sm truncate">{stage.name}</h4>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {stage.components.length} componentes
                </Badge>
                {stage.title && (
                  <span className="text-xs text-muted-foreground truncate">
                    {stage.title}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsEditing(true)}
            className="h-6 w-6 p-0"
          >
            <Edit2 className="w-3 h-3" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={onDuplicate}
            className="h-6 w-6 p-0"
          >
            <Copy className="w-3 h-3" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={onDelete}
            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

interface StageListProps {
  stages: QuizStep[];
  selectedStageId: string | null;
  onSelectStage: (stageId: string) => void;
  onUpdateStage: (stageId: string, updates: Partial<QuizStep>) => void;
  onDeleteStage: (stageId: string) => void;
  onDuplicateStage: (stageId: string) => void;
}

export function StageList({
  stages,
  selectedStageId,
  onSelectStage,
  onUpdateStage,
  onDeleteStage,
  onDuplicateStage
}: StageListProps) {
  return (
    <div className="space-y-2">
      {stages.map((stage, index) => (
        <StageItem
          key={stage.id}
          stage={stage}
          isSelected={selectedStageId === stage.id}
          onSelect={() => onSelectStage(stage.id)}
          onUpdate={(updates) => onUpdateStage(stage.id, updates)}
          onDelete={() => onDeleteStage(stage.id)}
          onDuplicate={() => onDuplicateStage(stage.id)}
        />
      ))}
    </div>
  );
}