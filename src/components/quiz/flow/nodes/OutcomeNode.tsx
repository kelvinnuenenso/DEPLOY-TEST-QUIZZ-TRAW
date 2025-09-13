import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Trophy, Star } from 'lucide-react';

interface OutcomeNodeData {
  title: string;
  subtitle?: string;
  outcomeType?: 'result' | 'redirect' | 'lead_capture';
  color?: string;
  score?: number;
}

interface OutcomeNodeProps {
  data: OutcomeNodeData;
  selected?: boolean;
}

export const OutcomeNode = memo(({ data, selected }: OutcomeNodeProps) => {
  const getIcon = () => {
    switch (data.outcomeType) {
      case 'result': return <Trophy className="w-4 h-4" />;
      case 'redirect': return <Target className="w-4 h-4" />;
      case 'lead_capture': return <Star className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getTypeLabel = () => {
    switch (data.outcomeType) {
      case 'result': return 'Resultado';
      case 'redirect': return 'Redirecionamento';
      case 'lead_capture': return 'Captura de Lead';
      default: return 'Final';
    }
  };

  return (
    <Card className={`
      min-w-[200px] transition-all duration-200 hover:shadow-lg
      ${selected ? 'ring-2 ring-blue-400 shadow-lg' : ''}
      border-dashed border-2
    `}>
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-blue-400 border-2 border-background"
      />
      
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm"
            style={{ backgroundColor: data.color || 'hsl(217 91% 66%)' }}
          >
            {getIcon()}
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
                {getTypeLabel()}
              </Badge>
              {data.score !== undefined && (
                <Badge variant="outline" className="text-xs">
                  {data.score} pts
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
});

OutcomeNode.displayName = 'OutcomeNode';