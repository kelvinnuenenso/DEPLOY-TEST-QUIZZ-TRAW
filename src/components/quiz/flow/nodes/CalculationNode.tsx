import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator, Plus, Minus, X, Divide } from 'lucide-react';

interface CalculationNodeData {
  title: string;
  subtitle?: string;
  calculationType?: 'sum' | 'average' | 'count' | 'custom';
  formula?: string;
  color?: string;
}

interface CalculationNodeProps {
  data: CalculationNodeData;
  selected?: boolean;
}

export const CalculationNode = memo(({ data, selected }: CalculationNodeProps) => {
  const getIcon = () => {
    switch (data.calculationType) {
      case 'sum': return <Plus className="w-4 h-4" />;
      case 'average': return <Divide className="w-4 h-4" />;
      case 'count': return <X className="w-4 h-4" />;
      default: return <Calculator className="w-4 h-4" />;
    }
  };

  const getTypeLabel = () => {
    switch (data.calculationType) {
      case 'sum': return 'Soma';
      case 'average': return 'Média';
      case 'count': return 'Contagem';
      case 'custom': return 'Customizado';
      default: return 'Cálculo';
    }
  };

  return (
    <Card className={`
      min-w-[200px] transition-all duration-200 hover:shadow-lg
      ${selected ? 'ring-2 ring-orange-400 shadow-lg' : ''}
    `}>
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-orange-400 border-2 border-background"
      />
      
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm"
            style={{ backgroundColor: data.color || 'hsl(var(--muted-foreground))' }}
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
            
            {data.formula && (
              <div className="bg-muted/50 rounded px-2 py-1 mt-2">
                <code className="text-xs font-mono">
                  {data.formula}
                </code>
              </div>
            )}
            
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {getTypeLabel()}
              </Badge>
            </div>
          </div>
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-orange-400 border-2 border-background"
      />
    </Card>
  );
});

CalculationNode.displayName = 'CalculationNode';