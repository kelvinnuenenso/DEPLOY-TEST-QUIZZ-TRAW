import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch, Check, X } from 'lucide-react';

interface ConditionNodeData {
  title: string;
  subtitle?: string;
  conditions?: any[];
  color?: string;
}

interface ConditionNodeProps {
  data: ConditionNodeData;
  selected?: boolean;
}

export const ConditionNode = memo(({ data, selected }: ConditionNodeProps) => {
  return (
    <Card className={`
      min-w-[220px] transition-all duration-200 hover:shadow-lg
      ${selected ? 'ring-2 ring-accent shadow-lg' : ''}
    `}>
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-accent border-2 border-background"
      />
      
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm"
            style={{ backgroundColor: data.color || 'hsl(var(--accent))' }}
          >
            <GitBranch className="w-4 h-4" />
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
                Condição
              </Badge>
              {data.conditions && data.conditions.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {data.conditions.length} regra{data.conditions.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        {/* Outputs visuais */}
        <div className="flex justify-between items-center mt-3 pt-2 border-t">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Check className="w-3 h-3 text-green-500" />
            Sim
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <X className="w-3 h-3 text-red-500" />
            Não
          </div>
        </div>
      </div>
      
      {/* Handles para múltiplas saídas */}
      <Handle
        type="source"
        position={Position.Right}
        id="true"
        style={{ top: '30%' }}
        className="w-3 h-3 bg-green-500 border-2 border-background"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="false"
        style={{ top: '70%' }}
        className="w-3 h-3 bg-red-500 border-2 border-background"
      />
    </Card>
  );
});

ConditionNode.displayName = 'ConditionNode';