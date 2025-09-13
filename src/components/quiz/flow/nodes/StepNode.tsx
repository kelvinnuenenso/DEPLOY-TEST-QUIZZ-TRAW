import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, ChevronRight } from 'lucide-react';

interface StepNodeData {
  title: string;
  subtitle?: string;
  stepId?: string;
  color?: string;
  icon?: string;
}

interface StepNodeProps {
  data: StepNodeData;
  selected?: boolean;
}

export const StepNode = memo(({ data, selected }: StepNodeProps) => {
  return (
    <Card className={`
      min-w-[200px] transition-all duration-200 hover:shadow-lg
      ${selected ? 'ring-2 ring-primary shadow-lg' : ''}
    `}>
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-primary border-2 border-background"
      />
      
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm"
            style={{ backgroundColor: data.color || 'hsl(var(--primary))' }}
          >
            <MessageCircle className="w-4 h-4" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm text-foreground truncate">
              {data.title}
            </h3>
            {data.subtitle && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {data.subtitle}
              </p>
            )}
            
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                Etapa
              </Badge>
              {data.stepId && (
                <Badge variant="outline" className="text-xs">
                  ID: {data.stepId.slice(0, 8)}
                </Badge>
              )}
            </div>
          </div>
          
          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-primary border-2 border-background"
      />
    </Card>
  );
});

StepNode.displayName = 'StepNode';